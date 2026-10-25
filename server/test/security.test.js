import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter, rateLimit } from '../middleware/security.js';

function call(rateLimiter, ip) {
  const req = { ip, body: {}, headers: {} };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  let nexted = false;
  rateLimiter(req, res, () => {
    nexted = true;
  });
  return { res, nexted };
}

// Minimal fake Redis: INCR / PEXPIRE / PTTL.
function fakeRedis({ failing = false } = {}) {
  const store = new Map();
  const expires = new Map();
  let clock = 1000;
  return {
    store,
    tick: (ms) => {
      clock += ms;
    },
    async incr(key) {
      if (failing) throw new Error('redis down');
      const next = (store.get(key) || 0) + 1;
      store.set(key, next);
      return next;
    },
    async pexpire(key, ms) {
      expires.set(key, clock + ms);
      return 1;
    },
    async pttl(key) {
      if (!expires.has(key)) return -1;
      return expires.get(key) - clock;
    },
  };
}

function callAsync(rateLimiter, ip) {
  const req = { ip, body: {}, headers: {} };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return new Promise((resolve) => {
    rateLimiter(req, res, () => resolve({ res, nexted: true }));
    setImmediate(() => {
      if (res.statusCode === 429) resolve({ res, nexted: false });
    });
  });
}

test('rate limit blocks past the max and reports retryAfterSec', () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 2 });
  assert.equal(call(limiter, '1.1.1.1').nexted, true);
  assert.equal(call(limiter, '1.1.1.1').nexted, true);

  const blocked = call(limiter, '1.1.1.1');
  assert.equal(blocked.nexted, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.res.body.error, 'Too many requests.');
  assert.ok(blocked.res.body.retryAfterSec > 0);
  assert.ok(blocked.res.headers['Retry-After']);
});

test('rate limit counts each client separately', () => {
  const limiter = rateLimit({ windowMs: 60_000, max: 1 });
  assert.equal(call(limiter, '1.1.1.1').nexted, true);
  assert.equal(call(limiter, '2.2.2.2').nexted, true);
  assert.equal(call(limiter, '1.1.1.1').nexted, false);
});

test('rate limit opens a new window after it expires', () => {
  const original = Date.now;
  let now = 1000;
  Date.now = () => now;
  try {
    const limiter = rateLimit({ windowMs: 500, max: 1 });
    assert.equal(call(limiter, '1.1.1.1').nexted, true);
    assert.equal(call(limiter, '1.1.1.1').nexted, false);
    now += 600;
    assert.equal(call(limiter, '1.1.1.1').nexted, true);
  } finally {
    Date.now = original;
  }
});

test('rate limit shares the counter through redis', async () => {
  const redis = fakeRedis();
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2, name: 'auth', redis });

  assert.equal((await callAsync(limiter, '1.1.1.1')).nexted, true);
  assert.equal((await callAsync(limiter, '1.1.1.1')).nexted, true);
  const blocked = await callAsync(limiter, '1.1.1.1');
  assert.equal(blocked.nexted, false);
  assert.equal(blocked.res.statusCode, 429);
  assert.equal(blocked.res.body.error, 'Too many requests.');
  assert.ok(blocked.res.headers['Retry-After']);

  // The counter lives in redis, not in this process.
  assert.equal(redis.store.size, 1);
  assert.equal([...redis.store.values()][0], 3);
});

test('rate limit keeps counting per client with redis', async () => {
  const redis = fakeRedis();
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, name: 'auth', redis });
  assert.equal((await callAsync(limiter, '1.1.1.1')).nexted, true);
  assert.equal((await callAsync(limiter, '2.2.2.2')).nexted, true);
  assert.equal((await callAsync(limiter, '1.1.1.1')).nexted, false);
});

test('rate limit falls back to the local counter when redis is down', async () => {
  const redis = fakeRedis({ failing: true });
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1, name: 'auth', redis });
  assert.equal((await callAsync(limiter, '1.1.1.1')).nexted, true);
  const blocked = await callAsync(limiter, '1.1.1.1');
  assert.equal(blocked.nexted, false);
  assert.equal(blocked.res.statusCode, 429);
});
