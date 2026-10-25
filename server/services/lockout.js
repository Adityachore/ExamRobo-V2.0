// In-memory lockout — resets on server restart. Accepted P1 ceiling
// (per PRD R-002); move to Redis in P7 if restarts during an exam matter.
export function createLockout({ max = 3, windowMs = 15 * 60 * 1000, now = Date.now } = {}) {
  const failures = new Map();

  function key(email, ip) {
    return `${email}|${ip}`;
  }

  function check(email, ip, at = now()) {
    const entry = failures.get(key(email, ip));
    if (!entry) return { locked: false, attemptsLeft: max };
    if (at - entry.firstAt > windowMs) {
      failures.delete(key(email, ip));
      return { locked: false, attemptsLeft: max };
    }
    if (entry.count >= max) {
      return { locked: true, retryAfterMs: windowMs - (at - entry.firstAt) };
    }
    return { locked: false, attemptsLeft: max - entry.count };
  }

  function fail(email, ip, at = now()) {
    const k = key(email, ip);
    const entry = failures.get(k);
    if (!entry || at - entry.firstAt > windowMs) {
      failures.set(k, { count: 1, firstAt: at });
      return { locked: false, attemptsLeft: max - 1 };
    }
    entry.count += 1;
    const locked = entry.count >= max;
    return {
      locked,
      attemptsLeft: Math.max(0, max - entry.count),
      retryAfterMs: locked ? windowMs - (at - entry.firstAt) : undefined,
    };
  }

  function reset(email, ip) {
    failures.delete(key(email, ip));
  }

  return { check, fail, reset };
}

// Redis-backed lockout. Same API as the in-memory one, so the auth route does
// not care which one it gets. The window is a key TTL, so an abandoned lock
// expires on its own without a sweeper.
export function createRedisLockout(redis, { max = 3, windowSec = 15 * 60, prefix = 'examrobo:lockout:' } = {}) {
  const key = (email, ip) => `${prefix}${email}|${ip}`;

  async function check(email, ip) {
    try {
      const raw = await redis.get(key(email, ip));
      if (!raw) return { locked: false, attemptsLeft: max };
      const count = Number(raw);
      if (count < max) return { locked: false, attemptsLeft: max - count };
      const ttl = await redis.ttl(key(email, ip));
      return { locked: true, retryAfterMs: Math.max(0, ttl * 1000) };
    } catch {
      return { locked: false, attemptsLeft: max };
    }
  }

  async function fail(email, ip) {
    try {
      const count = await redis.incr(key(email, ip));
      if (count === 1) await redis.expire(key(email, ip), windowSec);
      const locked = count >= max;
      let retryAfterMs;
      if (locked) {
        const ttl = await redis.ttl(key(email, ip));
        retryAfterMs = Math.max(0, ttl * 1000);
      }
      return { locked, attemptsLeft: Math.max(0, max - count), retryAfterMs };
    } catch {
      return { locked: false, attemptsLeft: max - 1 };
    }
  }

  async function reset(email, ip) {
    try {
      await redis.del(key(email, ip));
    } catch {
      /* ignore */
    }
  }

  return { check, fail, reset };
}
