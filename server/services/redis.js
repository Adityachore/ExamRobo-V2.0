import Redis from 'ioredis';

// Optional Redis client. When REDIS_URL is missing or Redis is unreachable the
// app keeps working single-instance (in-memory lockout, local WS fan-out).
// Phase 7 target: several API instances serving one exam.

let client = null;
let subscriber = null;
let ready = false;

export function isRedisReady() {
  return ready;
}

export async function connectRedis(url = process.env.REDIS_URL) {
  if (!url) {
    console.log('[redis] REDIS_URL not set - running single-instance (in-memory lockout, local WS fan-out)');
    return null;
  }
  try {
    client = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2, enableOfflineQueue: false });
    subscriber = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2, enableOfflineQueue: false });
    await client.connect();
    await subscriber.connect();
    ready = true;
    console.log('[redis] connected');
    return client;
  } catch (err) {
    ready = false;
    client = null;
    subscriber = null;
    console.warn(`[redis] unavailable (${err.message}) - falling back to single-instance mode`);
    return null;
  }
}

export function getClient() {
  return client;
}

// Fixed-window counter shared by every API instance. The first hit of a window
// sets the TTL, later hits only increment it.
export async function incrWindow(target, key, windowMs) {
  const count = await target.incr(key);
  if (count === 1) await target.pexpire(key, windowMs);
  const ttl = await target.pttl(key);
  return { count, resetAt: Date.now() + Math.max(ttl, 0) };
}

export async function publish(channel, payload) {
  if (!ready || !client) return false;
  try {
    await client.publish(channel, typeof payload === 'string' ? payload : JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('[redis] publish failed:', err.message);
    return false;
  }
}

export async function subscribe(channel, handler) {
  if (!ready || !subscriber) return false;
  try {
    await subscriber.subscribe(channel);
    subscriber.on('message', (incoming, raw) => {
      if (incoming !== channel) return;
      try {
        handler(JSON.parse(raw));
      } catch {
        /* ignore malformed payload */
      }
    });
    return true;
  } catch (err) {
    console.warn('[redis] subscribe failed:', err.message);
    return false;
  }
}

export async function closeRedis() {
  ready = false;
  await Promise.allSettled([client?.quit(), subscriber?.quit()]);
  client = null;
  subscriber = null;
}
