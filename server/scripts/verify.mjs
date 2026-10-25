// One command that verifies the whole project.
//
//   npm run verify
//
// Four phases, each run exactly once, each with a hard deadline:
//
//   0 preflight  - are postgres and redis reachable? (45s cap, in parallel)
//   1 unit       - node --test
//   2 web build  - vite build
//   3 smoke      - the full API smoke test against a throwaway database
//
// Rules this script enforces:
//   - A phase that fails is recorded and the next phase still runs.
//   - A phase that cannot start is reported as SKIPPED, never retried.
//   - Nothing here waits forever, and nothing here launches an application.
//   - The smoke phase talks to a scratch database it creates and drops
//     itself, so the live database is never reachable from a test.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

import { runProcess, waitFor, withTimeout } from './waitfor.mjs';
import { createScratchDatabase, dropScratchDatabase } from './scratch-db.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER_DIR = path.join(HERE, '..');
const WEB_DIR = path.join(SERVER_DIR, '..', 'web');

const PG_ADMIN_URL = process.env.VERIFY_PG_URL || 'postgres://examrobo:examrobo@localhost:5450/postgres';
const REDIS_URL = process.env.VERIFY_REDIS_URL || 'redis://localhost:6379/9';
const SCRATCH_DB = process.env.VERIFY_SCRATCH_DB || 'examrobo_smoke';

const PREFLIGHT_TIMEOUT_MS = 45_000;
const UNIT_TIMEOUT_MS = 180_000;
const BUILD_TIMEOUT_MS = 240_000;
const SMOKE_TIMEOUT_MS = 150_000;

const results = [];
const record = (phase, status, detail = '') => {
  results.push({ phase, status, detail });
  const tag = { PASS: 'PASS', FAIL: 'FAIL', SKIP: 'SKIP' }[status];
  console.log(`  [${tag}] ${phase}${detail ? ` - ${detail}` : ''}`);
};

async function checkPostgres() {
  const client = new pg.Client({ connectionString: PG_ADMIN_URL, connectionTimeoutMillis: 3_000 });
  await client.connect();
  await client.query('SELECT 1');
  await client.end();
  return true;
}

async function checkRedis() {
  const { default: Redis } = await import('ioredis');
  const redis = new Redis(REDIS_URL, {
    lazyConnect: true,
    connectTimeout: 3_000,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });
  try {
    await redis.connect();
    const pong = await redis.ping();
    return pong === 'PONG';
  } finally {
    redis.disconnect();
  }
}

// Reports the service as unavailable instead of retrying it. This is the
// difference between a bounded check and the retry loop that stalled the
// earlier session.
async function preflight() {
  console.log('\nphase 0 - preflight');
  const [pgResult, redisResult] = await Promise.allSettled([
    waitFor('postgres', checkPostgres, { timeoutMs: PREFLIGHT_TIMEOUT_MS, intervalMs: 2_000 }),
    waitFor('redis', checkRedis, { timeoutMs: PREFLIGHT_TIMEOUT_MS, intervalMs: 2_000 }),
  ]);

  const services = { postgres: pgResult, redis: redisResult };
  for (const [name, outcome] of Object.entries(services)) {
    if (outcome.status === 'fulfilled') record(`preflight:${name}`, 'PASS');
    else record(`preflight:${name}`, 'SKIP', outcome.reason?.message || 'unreachable');
  }
  return {
    postgres: pgResult.status === 'fulfilled',
    redis: redisResult.status === 'fulfilled',
  };
}

async function unitPhase() {
  console.log('\nphase 1 - unit tests');
  const res = await runProcess(process.execPath, ['--test'], {
    cwd: SERVER_DIR,
    timeoutMs: UNIT_TIMEOUT_MS,
    label: 'node --test',
  });
  const summary = (res.stdout.match(/^# (pass|fail) (\d+)$/gm) || []).join(' ') || tail(res.stdout, 1);
  record('unit tests', res.ok ? 'PASS' : 'FAIL', res.ok ? summary.replace(/\s+/g, ' ').trim() : tail(res.stderr || res.stdout, 6));
  if (!res.ok) console.log(res.stdout.trim().split('\n').slice(-15).join('\n'));
  return res.ok;
}

async function buildPhase() {
  console.log('\nphase 2 - web build');
  const npm = process.platform === 'win32'
    ? { command: process.env.ComSpec || 'cmd.exe', args: ['/d', '/s', '/c', 'npm run build'] }
    : { command: 'npm', args: ['run', 'build'] };
  const res = await runProcess(npm.command, npm.args, {
    cwd: WEB_DIR,
    timeoutMs: BUILD_TIMEOUT_MS,
    label: 'npm run build',
  });
  const built = /built in|✓ built|modules transformed/i.test(res.stdout);
  record('web build', res.ok ? 'PASS' : 'FAIL', res.ok ? (built ? 'vite build ok' : 'build finished') : tail(res.stderr || res.stdout, 8));
  if (!res.ok) console.log(res.stdout.trim().split('\n').slice(-15).join('\n'));
  return res.ok;
}

async function smokePhase() {
  console.log('\nphase 3 - smoke test (scratch database)');
  let scratchUrl = null;
  let server = null;
  let pool = null;
  const sebConfigFile = path.join(os.tmpdir(), `examrobo-verify-${process.pid}.seb`);
  try {
    scratchUrl = await createScratchDatabase({ adminUrl: PG_ADMIN_URL, name: SCRATCH_DB });

    // The env has to be set before the app is imported: db.js opens its pool
    // at import time.
    process.env.DATABASE_URL = scratchUrl;
    process.env.REDIS_URL = REDIS_URL;
    process.env.REDIS_CHANNEL = 'examrobo:ws:verify';
    process.env.JWT_SECRET = 'verify-only-secret';
    process.env.NODE_ENV = 'production';
    process.env.ADMIN_EMAILS = '';
    process.env.ADMIN_PASSWORD = '';
    process.env.CORS_ORIGINS = '';
    process.env.RECORDINGS_DIR = path.join(os.tmpdir(), 'examrobo-verify-recordings');
    process.env.SEB_REQUIRED = 'true';
    process.env.SEB_CONFIG_KEY = 'a'.repeat(64);
    process.env.SEB_CONFIG_FILE = sebConfigFile;
    process.env.SEB_START_URL = 'http://127.0.0.1/seb';
    fs.writeFileSync(sebConfigFile, 'verify-only-seb');

    const { app, attachWebSocket } = await import('../app.js');
    const { runSmoke } = await import('../smoke.mjs');
    const { connectRedis } = await import('../services/redis.js');
    const { attachRedis } = await import('../services/live.js');
    const { pool: appPool } = await import('../db.js');
    pool = appPool;

    // Redis is optional here: without it the lockout falls back to the
    // in-process counter and the socket fan-out stays local. Both paths
    // behave the same for the assertions.
    try {
      await connectRedis();
      await attachRedis();
    } catch (err) {
      console.log(`  (redis unavailable, using the local fallbacks: ${err.message})`);
    }

    server = http.createServer(app);
    attachWebSocket(server);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const { port } = server.address();

    const smokeRun = runSmoke({ base: `http://127.0.0.1:${port}/api` });
    // If the deadline wins the race the smoke run keeps going in the
    // background; swallow its eventual failure instead of crashing the run.
    smokeRun.catch(() => {});
    const { pass, fail } = await withTimeout(smokeRun, 'smoke test', SMOKE_TIMEOUT_MS);
    record('smoke test', fail === 0 ? 'PASS' : 'FAIL', `${pass} passed, ${fail} failed`);
    return fail === 0;
  } catch (err) {
    record('smoke test', 'FAIL', err.message);
    return false;
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (pool) await pool.end().catch(() => {});
    fs.rmSync(sebConfigFile, { force: true });
    if (scratchUrl) {
      await dropScratchDatabase({ adminUrl: PG_ADMIN_URL, name: SCRATCH_DB }).catch((err) => {
        console.log(`  (scratch database cleanup failed: ${err.message})`);
      });
    }
  }
}

function tail(text, lines) {
  return String(text || '')
    .trim()
    .split('\n')
    .slice(-lines)
    .join(' | ');
}

async function main() {
  console.log('ExamRobo verification');
  console.log(`  postgres: ${PG_ADMIN_URL.replace(/:[^:@/]*@/, ':***@')}`);
  console.log(`  redis:    ${REDIS_URL}`);
  console.log(`  scratch:  ${SCRATCH_DB}`);

  const services = await preflight();

  const outcomes = [];
  outcomes.push(await unitPhase());
  outcomes.push(await buildPhase());

  if (services.postgres) {
    outcomes.push(await smokePhase());
  } else {
    console.log('\nphase 3 - smoke test (scratch database)');
    record('smoke test', 'SKIP', 'postgres is unreachable, the scratch database cannot be created');
  }

  console.log('\n--------------------------------------------------');
  for (const r of results) {
    console.log(`${r.status.padEnd(4)} ${r.phase}${r.detail ? `  (${r.detail})` : ''}`);
  }
  const failed = results.filter((r) => r.status === 'FAIL');
  const skipped = results.filter((r) => r.status === 'SKIP');
  console.log('--------------------------------------------------');
  console.log(
    failed.length
      ? `${failed.length} phase(s) FAILED, ${skipped.length} skipped`
      : `all phases passed${skipped.length ? ` (${skipped.length} skipped)` : ''}`,
  );
  return failed.length ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('\nverification crashed:', err?.stack || err?.message || err);
    process.exit(1);
  });
