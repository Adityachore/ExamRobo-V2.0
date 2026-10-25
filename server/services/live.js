// WebSocket fan-out hub.
//
// Single process: messages go straight to the local clients.
// With Redis: every instance publishes to one channel and every instance
// (including the publisher) delivers to its own clients from the subscription,
// so a dashboard connected to instance A still sees a student connected to
// instance B.
import { isRedisReady, publish, subscribe } from './redis.js';

const CHANNEL = process.env.REDIS_CHANNEL || 'examrobo:ws';
const clients = new Set();

export function addClient(ws, role, email, sid = null, tab = null) {
  const client = { ws, role, email, sid: sid || null, tab: tab || null };
  clients.add(client);
  ws.on('close', () => clients.delete(client));
  return client;
}

// The live student connections of one email. Used to spot a second window and
// a second device: two connections from the same sign-in (same sid) are a
// second window, two different sids are a second session.
export function studentClients(email) {
  return [...clients].filter((c) => c.role === 'student' && c.email === email);
}

export function studentSessionIds(email) {
  return new Set(studentClients(email).map((c) => c.sid).filter(Boolean));
}

// Which concurrency signal a set of connections represents.
//
// Two different sign-in ids mean a second device: the account is signed in
// somewhere else. The same sign-in id with more than one connection means a
// second tab of the same browser.
//
// The two are mutually exclusive on purpose: a second device is the stronger
// signal, and counting both would spend two of the three warning strikes on
// a single mistake.
export function concurrencySignal(connections) {
  const sids = new Set(connections.map((c) => c.sid).filter(Boolean));
  if (sids.size >= 2) {
    return { kind: 'second_session', detail: `${sids.size} sign-ins from this account` };
  }
  return { kind: 'second_window', detail: `${connections.length} live connections` };
}

// A reload re-uses the same tab id, so the old socket can still be alive for
// a moment - close it before counting, otherwise every refresh would look
// like a second window. The reap has to run before the new client is
// registered, otherwise it would close the socket that just arrived.
//
// The tab id is what separates a reload from a second tab: the sign-in id
// (sid) is shared by every tab of the same browser, so reaping on the sid
// alone would make two tabs fight over the socket.
export function reapSameSession(email, tab) {
  if (!tab) return 0;
  let reaped = 0;
  for (const c of studentClients(email)) {
    if (c.tab !== tab) continue;
    clients.delete(c);
    try {
      c.ws.close(4000, 'replaced by a newer connection');
    } catch {
      /* the socket is already gone */
    }
    reaped += 1;
  }
  return reaped;
}

function deliver(scope, email, message) {
  const payload = JSON.stringify(message);
  for (const c of clients) {
    if (c.ws.readyState !== 1) continue;
    if (scope === 'admins' && c.role === 'admin') c.ws.send(payload);
    if (scope === 'student' && c.role === 'student' && c.email === email) c.ws.send(payload);
  }
}

export function toAdmins(message) {
  if (isRedisReady()) {
    publish(CHANNEL, { scope: 'admins', email: null, message });
    return;
  }
  deliver('admins', null, message);
}

export function toStudent(email, message) {
  if (isRedisReady()) {
    publish(CHANNEL, { scope: 'student', email, message });
    return;
  }
  deliver('student', email, message);
}

export function clientCount() {
  return clients.size;
}

// Called once at boot: subscribes this instance to the shared channel.
export async function attachRedis() {
  if (!isRedisReady()) return false;
  return subscribe(CHANNEL, ({ scope, email, message }) => deliver(scope, email, message));
}
