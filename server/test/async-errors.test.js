// A failing route must not take the API down.
//
// Express 4 does not catch a rejected promise from an async handler, so every
// router is wrapped (middleware/async.js). The routers call that wrapper at
// the end of the file, after their routes are registered - so the wrapper has
// to cover the handlers that are already in place. This test pins that down:
// without it, one failing query would kill the process in the middle of an
// exam.
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { wrapRouter } from '../middleware/async.js';

function buildRouter() {
  const router = express.Router();
  // Registered BEFORE the wrapper is called - the order the project uses.
  router.get('/boom', async () => {
    throw new Error('the query failed');
  });
  router.get('/rejects', async () => {
    await Promise.reject(new Error('the promise failed'));
  });
  router.get('/sync', () => {
    throw new Error('the handler failed');
  });
  router.get('/ok', async (_req, res) => {
    res.json({ ok: true });
  });
  return wrapRouter(router);
}

async function withServer(fn) {
  const app = express();
  app.use(buildRouter());
  app.use((err, _req, res, _next) => {
    res.status(500).json({ error: 'Something went wrong.' });
  });
  const server = app.listen(0);
  try {
    await fn(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('an async route that throws answers with 500, and the server keeps running', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/boom`);
    assert.equal(res.status, 500);
    assert.deepEqual(await res.json(), { error: 'Something went wrong.' });
  });
});

test('an async route whose promise rejects answers with 500', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/rejects`);
    assert.equal(res.status, 500);
  });
});

test('a route that throws synchronously answers with 500', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/sync`);
    assert.equal(res.status, 500);
  });
});

test('a working route is untouched', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/ok`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });
});

test('one failing route does not take the next one down with it', async () => {
  await withServer(async (base) => {
    await fetch(`${base}/boom`);
    const res = await fetch(`${base}/ok`);
    assert.equal(res.status, 200);
  });
});
