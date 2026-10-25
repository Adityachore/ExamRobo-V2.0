import test from 'node:test';
import assert from 'node:assert/strict';
import { createRedisLockout } from '../services/lockout.js';

// Minimal fake Redis: INCR / EXPIRE / TTL / GET / DEL.
function fakeRedis({ failing = false } = {}) {
  const store = new Map();
  const expires = new Map();
  let clock = 1000;
  return {
    store,
    tick: (ms) => {
      clock += ms;
    },
    async get(key) {
      if (failing) throw new Error('redis down');
      return store.has(key) ? String(store.get(key)) : null;
    },
    async incr(key) {
      if (failing) throw new Error('redis down');
      const next = (store.get(key) || 0) + 1;
      store.set(key, next);
      return next;
    },
    async expire(key, sec) {
      expires.set(key, clock + sec * 1000);
      return 1;
    },
    async ttl(key) {
      if (!expires.has(key)) return -1;
      return Math.ceil((expires.get(key) - clock) / 1000);
    },
    async del(key) {
      store.delete(key);
      expires.delete(key);
      return 1;
    },
  };
}

test('redis lockout counts failures and locks at the max', async () => {
  const redis = fakeRedis();
  const l = createRedisLockout(redis, { max: 3, windowSec: 900 });

  assert.equal((await l.check('a@x.com', '1')).locked, false);
  assert.equal((await l.fail('a@x.com', '1')).locked, false);
  assert.equal((await l.fail('a@x.com', '1')).locked, false);
  const third = await l.fail('a@x.com', '1');
  assert.equal(third.locked, true);
  assert.equal(third.attemptsLeft, 0);
  assert.ok(third.retryAfterMs > 0);

  const gate = await l.check('a@x.com', '1');
  assert.equal(gate.locked, true);
  assert.ok(gate.retryAfterMs > 0);
});

test('redis lockout resets on success', async () => {
  const redis = fakeRedis();
  const l = createRedisLockout(redis, { max: 3 });
  await l.fail('a@x.com', '1');
  await l.fail('a@x.com', '1');
  await l.reset('a@x.com', '1');
  assert.equal((await l.check('a@x.com', '1')).attemptsLeft, 3);
});

test('redis lockout stays unlocked while redis is down', async () => {
  const redis = fakeRedis({ failing: true });
  const l = createRedisLockout(redis, { max: 3 });
  assert.equal((await l.check('a@x.com', '1')).locked, false);
  assert.equal((await l.fail('a@x.com', '1')).locked, false);
});

test('redis lockout separates ip addresses', async () => {
  const redis = fakeRedis();
  const l = createRedisLockout(redis, { max: 1 });
  await l.fail('a@x.com', '1');
  assert.equal((await l.check('a@x.com', '1')).locked, true);
  assert.equal((await l.check('a@x.com', '2')).locked, false);
});
