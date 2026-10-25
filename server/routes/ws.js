import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import { requireUser } from '../middleware/auth.js';
import { wsTicketRateLimit } from '../middleware/security.js';
import { issueWsTicket } from '../services/ws-tickets.js';

const router = Router();

router.post('/ticket', requireUser, wsTicketRateLimit, async (req, res) => {
  const { ticket, expiresIn } = await issueWsTicket({
    sub: req.user.sub,
    role: req.user.role,
    eventId: req.user.eventId || null,
    sid: req.user.sid || null,
  });
  res.json({ ticket, expires_in: expiresIn });
});

export default wrapRouter(router);
