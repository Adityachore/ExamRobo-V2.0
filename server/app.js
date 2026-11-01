// The HTTP + WebSocket surface of the API, separated from the process
// bootstrap.
//
// index.js owns the process lifecycle (migrations, redis, listen). app.js owns
// the routes and the socket wiring. Keeping them apart lets a test boot the
// whole API in-process on an ephemeral port: no second process, no fixed
// port, nothing left behind when the test ends.
import express from 'express';
import { WebSocketServer } from 'ws';
import {
  securityHeaders,
  corsAllowlist,
  authRateLimit,
  ticketRateLimit,
  apiNotFound,
} from './middleware/security.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import ticketRoutes from './routes/tickets.js';
import wsRoutes from './routes/ws.js';
import sebRoutes from './routes/seb.js';
import examRoutes from './routes/exam.js';
import adminRoutes from './routes/admin.js';
import bankRoutes from './routes/bank.js';
import { requireSEB } from './middleware/seb.js';
import { sessionViews, feedViews } from './services/views.js';
import {
  addClient,
  reapSameSession,
  studentClients,
  concurrencySignal,
} from './services/live.js';
import { loadPaper } from './services/sessions.js';
import { recordViolation } from './services/integrity.js';
import { consumeWsTicket } from './services/ws-tickets.js';

export const app = express();

// Behind nginx the client IP arrives in X-Forwarded-For; the lockout keys on it.
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

app.use(securityHeaders);
app.use(corsAllowlist());

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/tickets', ticketRateLimit, ticketRoutes);
app.use('/api/ws', wsRoutes);
app.use('/api/seb', sebRoutes);
app.use('/api/exam', requireSEB, examRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api', apiNotFound);

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body is not valid JSON.' });
  }
  console.error('[api] unhandled error:', err?.stack || err?.message || err);
  res.status(500).json({ error: 'Something went wrong.' });
});

// Two live connections from one email are a second window; two different
// sign-in ids are a second device. Both are warnings, not an instant lock:
// the student may simply have a stale tab open.
export async function detectConcurrentSessions(payload) {
  const connections = studentClients(payload.sub);
  if (connections.length < 2) return;

  const paper = await loadPaper(payload.eventId, payload.sub);
  if (!paper || paper.status !== 'active') return;

  const signal = concurrencySignal(connections);
  await recordViolation(paper, signal.kind, signal.detail, { source: 'server' });
}

// Wires the /ws endpoint onto an existing http server.
export function attachWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, req) => {
    const url = new URL(req.url, 'http://localhost');
    let payload = null;
    try {
      payload = await consumeWsTicket(url.searchParams.get('ticket'));
    } catch {
      payload = null;
    }
    if (!payload) {
      ws.close(4401, 'unauthorized');
      return;
    }

    if (payload.role === 'student') {
      // The server owns the multi-window / multi-device detection: the client
      // cannot be trusted to report it. The tab id identifies the browser tab,
      // so a reload re-uses it and the stale socket is closed first -
      // otherwise every refresh would look like a second window. The reap has
      // to run before the new client is registered, otherwise it would close
      // the socket that just arrived.
      //
      // A client that sends no tab id falls back to the sign-in id, which is
      // correct for a single-tab client and still safe.
      const tab = url.searchParams.get('tab') || payload.sid;
      reapSameSession(payload.sub, tab);
      addClient(ws, payload.role, payload.sub, payload.sid, tab);
    } else {
      addClient(ws, payload.role, payload.sub, payload.sid);
    }

    if (payload.role === 'student') {
      detectConcurrentSessions(payload).catch((err) =>
        console.error('[ws] concurrency check failed:', err.message),
      );
    }

    if (payload.role === 'admin') {
      Promise.all([sessionViews(), feedViews()])
        .then(([sessions, events]) => {
          ws.send(
            JSON.stringify({
              type: 'snapshot',
              sessions,
              events,
              server_time: new Date().toISOString(),
            }),
          );
        })
        .catch((err) => console.error('[ws] snapshot failed:', err.message));
    }
  });

  return wss;
}
