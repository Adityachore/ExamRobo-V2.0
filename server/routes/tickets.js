import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import { q } from '../db.js';

const router = Router();
const emailRe = /^\S+@\S+\.\S+$/;

// Public contact form. No authentication: this is the fallback when a
// candidate cannot sign in.
router.post('/', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const reason = String(req.body?.reason || '').trim();
  if (!emailRe.test(email) || reason.length < 3) {
    return res.status(400).json({ error: 'Email and reason are required.' });
  }

  const { rows } = await q(
    `INSERT INTO tickets (email, reason, source) VALUES ($1,$2,'contact') RETURNING id`,
    [email, reason.slice(0, 2000)],
  );
  res.status(201).json({ id: rows[0].id, ok: true });
});

export default wrapRouter(router);
