// Process bootstrap: migrations, redis, listener. The routes and the socket
// wiring live in app.js so a test can boot the API in-process.
import 'dotenv/config';
import { existsSync } from 'node:fs';
import http from 'node:http';
import { app, attachWebSocket } from './app.js';
import { attachRedis } from './services/live.js';
import { startExpirySweeper } from './services/sessions.js';
import { connectRedis } from './services/redis.js';
import { sebSettings } from './services/seb.js';
import { migrate } from './scripts/migrate.js';

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
attachWebSocket(server);

// A rejected promise must never take the exam down mid-session: log it and
// keep serving.
process.on('unhandledRejection', (reason) => {
  console.error('[api] unhandled rejection:', reason?.stack || reason);
});
process.on('uncaughtException', (err) => {
  console.error('[api] uncaught exception:', err?.stack || err);
});

const port = process.env.PORT || 4000;

async function boot() {
  // Bring an existing database up to the current schema (fresh volumes get
  // schema.sql from initdb instead).
  try {
    const applied = await migrate();
    if (applied.length) console.log(`[api] migrations applied: ${applied.join(', ')}`);
  } catch (err) {
    console.error('[api] migration failed:', err.message);
  }

  await connectRedis();
  await attachRedis();

  server.listen(port, () => {
    console.log(`[api] ExamRobo API on :${port}${isProd ? ' (production)' : ''}`);
    startExpirySweeper();
  });
}

boot();
