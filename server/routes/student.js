import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import { q } from '../db.js';
import { requireStudent } from '../middleware/auth.js';
import { loadEvent, loadPaper, eventEnd, rosterRemoved } from '../services/sessions.js';
import { domainConfig, plannedQuestionCount } from '../services/domains.js';
import { paperMinuteRange } from '../services/event-config.js';
import { resultsStateForEvent } from '../services/results.js';

const router = Router();


// The student's landing payload: which exam is live, when it ends, what to do.
router.get('/event', requireStudent, async (req, res) => {
  const event = await loadEvent(req.user.eventId);
  if (!event) return res.status(404).json({ error: 'No active event.' });
  if (await rosterRemoved(event.id, req.user.sub)) {
    return res.status(403).json({
      error: 'Your access to this exam was removed by the exam team.',
      code: 'removed',
    });
  }

  const paper = await loadPaper(event.id, req.user.sub);
  const locked = paper?.status === 'submitted' && paper.submit_reason === 'integrity_lockout';
  const ended = eventEnd(event).getTime() <= Date.now();
  const submitted = paper?.status === 'submitted';
  const resultState = await resultsStateForEvent(event);
  const paperRange = paperMinuteRange(event);
  res.json({
    event: {
      id: event.id,
      name: event.name,
      starts_at: event.starts_at,
      ends_at: eventEnd(event).toISOString(),
      duration_min: event.duration_min,
      paper_minutes: paperRange.max,
      min_paper_minutes: paperRange.min,
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
    submitted,
    ended,
    results_visibility: resultState.visibility,
    results_published: !!event.results_published,
    results_published_at: resultState.published_at,
    results_expires_at: resultState.expires_at,
    results_available: submitted && resultState.available,
    results_code: submitted && !resultState.available ? resultState.code : null,
    locked,
    lock_reason: paper?.lock_reason || null,
    server_time: new Date().toISOString(),
  });
});

export default wrapRouter(router);
