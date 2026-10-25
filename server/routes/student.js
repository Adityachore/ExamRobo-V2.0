import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import { q } from '../db.js';
import { requireStudent } from '../middleware/auth.js';
import { loadEvent, loadPaper, eventEnd } from '../services/sessions.js';
import { domainConfig, plannedQuestionCount } from '../services/domains.js';

const router = Router();


// The student's landing payload: which exam is live, when it ends, what to do.
router.get('/event', requireStudent, async (req, res) => {
  const event = await loadEvent(req.user.eventId);
  if (!event) return res.status(404).json({ error: 'No active event.' });

  const paper = await loadPaper(event.id, req.user.sub);
  const locked = paper?.status === 'submitted' && paper.submit_reason === 'integrity_lockout';
  res.json({
    event: {
      id: event.id,
      name: event.name,
      starts_at: event.starts_at,
      ends_at: eventEnd(event).toISOString(),
      duration_min: event.duration_min,
      instructions: event.instructions,
    },
    // The technical domains of a domain-aware event: what may be chosen, how
    // many must and may be chosen, and what a choice is worth. `selected` is
    // the frozen choice of the paper, once the exam has started.
    domains: {
      ...domainConfig(event),
      selected: paper?.selected_categories || [],
      planned: plannedQuestionCount(event, paper?.selected_categories || []),
    },
    submitted: paper?.status === 'submitted',
    locked,
    lock_reason: paper?.lock_reason || null,
    server_time: new Date().toISOString(),
  });
});

export default wrapRouter(router);
