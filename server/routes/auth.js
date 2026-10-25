import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { q } from '../db.js';
import { signToken } from '../middleware/auth.js';
import { createLockout, createRedisLockout } from '../services/lockout.js';
import { getClient, isRedisReady } from '../services/redis.js';

const router = Router();

// Redis-backed when Redis is up (survives restarts, shared across instances),
// in-memory otherwise. Resolved per request because Redis connects at boot.
const memoryLockout = createLockout();
let redisLockout = null;
function getLockout() {
  if (isRedisReady()) {
    if (!redisLockout) redisLockout = createRedisLockout(getClient());
    return redisLockout;
  }
  return memoryLockout;
}

const normalize = (email) => String(email || '').trim().toLowerCase();
const emailRe = /^\S+@\S+\.\S+$/;

const adminEmails = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
const adminPassword = process.env.ADMIN_PASSWORD || '';

// Student sign-in. The email must be on the roster of an event that has not
// ended yet. Three failures lock email+ip for 15 minutes and raise a ticket.
router.post('/student', async (req, res) => {
  const email = normalize(req.body?.email);
  if (!emailRe.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const lockout = getLockout();
  const gate = await lockout.check(email, ip);
  if (gate.locked) {
    return res.status(429).json({
      error: 'Too many attempts.',
      retryAfterSec: Math.ceil(gate.retryAfterMs / 1000),
    });
  }

  // Prefer the event running right now, otherwise the next one that starts.
  const { rows } = await q(
    `SELECT e.id, e.starts_at, COALESCE(r.name, $1) AS student_name
       FROM roster_emails r JOIN exam_events e ON e.id = r.event_id
      WHERE r.email = $1
        AND now() < e.starts_at + (e.duration_min) * interval '1 minute'
      ORDER BY (now() >= e.starts_at) DESC, e.starts_at ASC
      LIMIT 1`,
    [email],
  );

  if (!rows.length) {
    const result = await lockout.fail(email, ip);
    if (result.locked) {
      await q(`INSERT INTO tickets (email, reason, source) VALUES ($1,$2,'lockout')`, [
        email,
        'Locked out after 3 failed sign-in attempts.',
      ]);
      return res.status(429).json({
        error: 'Too many attempts.',
        retryAfterSec: Math.ceil((result.retryAfterMs ?? 900000) / 1000),
      });
    }
    return res.status(403).json({
      error: 'This email is not eligible for this exam. Use the invited email address.',
      attemptsLeft: result.attemptsLeft,
    });
  }

  await lockout.reset(email, ip);
  const event = rows[0];
  // `sid` identifies one sign-in. The server compares the live connections of
  // this email: two connections with the same sid are a second window, two
  // different sids are a second device (a second session).
  res.json({
    token: signToken({ sub: email, role: 'student', eventId: event.id, sid: randomUUID() }),
    email,
    name: event.student_name,
  });
});

// Admin sign-in. The admins table is authoritative; ADMIN_EMAILS +
// ADMIN_PASSWORD bootstrap the very first admin.
router.post('/admin', async (req, res) => {
  const email = normalize(req.body?.email);
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(401).json({ error: 'Email or password is incorrect.' });

  const { rows } = await q(`SELECT id, email, password_hash, name FROM admins WHERE email = $1`, [email]);
  let admin = rows[0];

  if (admin) {
    const matches = await bcrypt.compare(password, admin.password_hash);
    if (!matches) return res.status(401).json({ error: 'Email or password is incorrect.' });
  } else {
    // Bootstrap only outside production: in production the admins table is the
    // only way in.
    const allowBootstrap =
      process.env.NODE_ENV !== 'production' &&
      adminEmails.includes(email) &&
      !!adminPassword &&
      password === adminPassword;
    if (!allowBootstrap) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    const hash = await bcrypt.hash(adminPassword, Number(process.env.BCRYPT_ROUNDS || 10));
    const { rows: created } = await q(
      `INSERT INTO admins (email, password_hash, name) VALUES ($1,$2,$3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id, email, name`,
      [email, hash, email.split('@')[0]],
    );
    admin = created[0];
  }

  res.json({
    token: signToken({ sub: admin.email, role: 'admin' }),
    email: admin.email,
    name: admin.name || admin.email,
  });
});

export default wrapRouter(router);
