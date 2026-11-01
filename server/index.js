// Process bootstrap: migrations, redis, listener. The routes and the socket
// wiring live in app.js so a test can boot the API in-process.
import 'dotenv/config';
import { existsSync } from 'node:fs';
import http from 'node:http';
import { app, attachWebSocket } from './app.js';
import { attachRedis } from './services/live.js';
import { startExpirySweeper } from './services/sessions.js';
import { startSectionSweeper } from './services/section-flow.js';
import { closeRedis, connectRedis } from './services/redis.js';
import { sebSettings } from './services/seb.js';
import { describeError, migrate } from './scripts/migrate.js';
import { pool } from './db.js';

const isProd = process.env.NODE_ENV === 'production';
if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-change-me')) {
  console.error('[api] JWT_SECRET must be set to a unique value in production. Refusing to start.');
  process.exit(1);
}

const seb = sebSettings();
if (seb.required && !seb.configured) {
  console.error('[api] SEB_REQUIRED=true but SEB_CONFIG_KEY is not a 64-character hex key. Exam routes will return 503 until it is fixed.');
} else if (seb.required && !existsSync(seb.file)) {
  console.error(`[api] SEB_REQUIRED=true but the configuration file is missing: ${seb.file}`);
} else if (seb.configured) {
  console.log('[api] Safe Exam Browser gate configured.');
}

const server = http.createServer(app);
const wss = attachWebSocket(server);

server.on('error', (err) => {
  console.error(`[api] cannot listen on :${port}: ${describeError(err)}`);
  process.exit(1);
});

// Docker sends SIGTERM on redeploy. Stop accepting work, close live sockets,
// then release Redis and the pool so an in-flight exam writes cleanly.
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[api] ${signal} received, shutting down`);
  const force = setTimeout(() => process.exit(1), 10_000);
  force.unref();
  for (const client of wss.clients) client.terminate();
  server.close(async (err) => {
    await Promise.allSettled([closeRedis(), pool.end()]);
    clearTimeout(force);
    process.exit(err ? 1 : 0);
  });
}
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));

// An unhandled failure leaves the process in an unknown state. Log it, stop
// accepting work and release the pool instead of serving on a corrupted state.
function fatal(label, err) {
  console.error(`[api] ${label}:`, err?.stack || err);
  process.exitCode = 1;
  void shutdown(label);
}
process.once('unhandledRejection', (reason) => fatal('unhandled rejection', reason));
process.once('uncaughtException', (err) => fatal('uncaught exception', err));

const port = process.env.PORT || 4000;

async function boot() {
  // Bring an existing database up to the current schema (fresh volumes get
  // schema.sql from initdb instead).
  try {
    const applied = await migrate();
    if (applied.length) console.log(`[api] migrations applied: ${applied.join(', ')}`);
  } catch (err) {
    console.error('[api] migration failed:', describeError(err));
    process.exit(1);
  }

  await connectRedis();
  await attachRedis();

  server.listen(port, () => {
    console.log(`[api] ExamRobo API on :${port}${isProd ? ' (production)' : ''}`);
    startExpirySweeper();
    startSectionSweeper();
  });
}

boot();
