import { Router } from 'express';
import { getClient, incrWindow, isRedisReady } from '../services/redis.js';

// Security middleware: headers, origin allowlist, per-route rate limiting.
// Everything here is dependency-free on purpose - the API ships few packages.

const defaultHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
  'Cache-Control': 'no-store',
};

export function securityHeaders(_req, res, next) {
  for (const [key, value] of Object.entries(defaultHeaders)) res.setHeader(key, value);
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

// CORS with an explicit allowlist. In development the Vite dev server origins
// are allowed; in production only the configured origins are.
export function corsAllowlist(allowed = process.env.CORS_ORIGINS) {
  const list = (
    allowed || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (origin && list.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-chunk-seq,x-safeexambrowser-configkeyhash');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Max-Age', '600');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  };
}

// Fixed-window rate limiter.
// With Redis the counter is shared by every API instance (an exam is served by
// a load balancer); without Redis it falls back to an in-process map.
export function createRateLimiter({
  windowMs = 60_000,
  max = 60,
  key: keyFn,
  name = 'default',
  redis = null,
} = {}) {
  const hits = new Map();

  const block = (res, resetAt) => {
    const retryAfterSec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
    res.setHeader('Retry-After', String(retryAfterSec));
    res.status(429).json({ error: 'Too many requests.', retryAfterSec });
  };

  const countLocally = (id) => {
    const now = Date.now();
    let entry = hits.get(id);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(id, entry);
    }
    entry.count += 1;
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
    }
    return entry;
  };

  return (req, res, next) => {
    const id = String(keyFn ? keyFn(req) : req.ip || 'unknown');
    const client = redis || (isRedisReady() ? getClient() : null);

    if (client) {
      incrWindow(client, `examrobo:ratelimit:${name}:${id}`, windowMs)
        .then((r) => {
          if (r.count > max) block(res, r.resetAt);
          else next();
        })
        .catch((err) => {
          // Never fail closed because the counter store is down.
          console.warn('[ratelimit] redis unavailable, using the local counter:', err.message);
          const entry = countLocally(id);
          if (entry.count > max) block(res, entry.resetAt);
          else next();
        });
      return;
    }

    const entry = countLocally(id);
    if (entry.count > max) block(res, entry.resetAt);
    else next();
  };
}

// In-memory limiter (single instance). Kept for the unit tests.
export function rateLimit(options = {}) {
  return createRateLimiter(options);
}

// Auth endpoints are the ones worth throttling: they touch credentials.
export const authRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: Number(process.env.AUTH_RATE_LIMIT || 30),
  key: (req) => `${req.ip}|${String(req.body?.email || '').toLowerCase()}`,
  name: 'auth',
});

// Public ticket endpoint: anyone can post, so cap it per IP.
export const ticketRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: Number(process.env.TICKET_RATE_LIMIT || 10),
  name: 'tickets',
});

// Recording chunks: a student may send one every ~10 s, so allow headroom.
export const recordingRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: Number(process.env.RECORDING_RATE_LIMIT || 30),
  name: 'recording',
});

// A socket connection needs a short-lived, single-use ticket. Reconnects
// create a new one, so the endpoint needs enough headroom for a flaky link.
export const wsTicketRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: Number(process.env.WS_TICKET_RATE_LIMIT || 30),
  key: (req) => req.user?.sub || req.ip || 'unknown',
  name: 'ws_ticket',
});

export function apiNotFound(_req, res) {
  res.status(404).json({ error: 'Not found.' });
}
