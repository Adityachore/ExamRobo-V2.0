import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import { q } from '../db.js';
import { requireStudent } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/security.js';
import { gradePaper } from '../services/grading.js';
import { competencyOfPaper } from '../services/analytics.js';
import { resultsStateForEvent } from '../services/results.js';
import { hydrateQuestion } from '../services/paper.js';
import { categoryAt, paperSectionRows, sectionAccess, sectionBlockedResponse, sectionViewOf } from '../services/sections.js';
import { advancePaperSections } from '../services/section-flow.js';

import {
  loadEvent,
  loadPaper,
  expireIfNeeded,
  examState,
  submitPaper,
  warningCount,
  logProctorEvent,
  broadcastSessionPatch,
  touchPaper,
  rosterRemoved,
  MAX_WARNINGS,
} from '../services/sessions.js';
import { isClientReportable, isKnownKind, kindInfo, recordViolation } from '../services/integrity.js';

const router = Router();
const NETWORK_GAP_SEC = Math.max(15, Number(process.env.NETWORK_GAP_SEC || 45));

const studentKey = (req) => req.user?.sub || req.ip || 'unknown';
const limit = (name, max, windowMs = 60_000) =>
  createRateLimiter({ name, max: Number(process.env[name.toUpperCase()] || max), windowMs, key: studentKey });

const startLimit = limit('exam_start', 12);
const answerLimit = limit('exam_answer', 90);
const questionLimit = limit('exam_question', 120);
const snapshotLimit = limit('exam_snapshot', 40);
const eventLimit = limit('exam_event', 40);
const sectionLimit = limit('exam_section', 20);
const submitLimit = limit('exam_submit', 10);
const resultLimit = limit('exam_result', 30);
const feedbackLimit = limit('exam_feedback', 5);

function submittedResponse(res, paper) {
  return res.status(409).json({
    error: 'Exam already submitted.',
    code: 'submitted',
    submit_reason: paper.submit_reason || null,
    lock_reason: paper.lock_reason || null,
    locked: paper.submit_reason === 'integrity_lockout',
  });
}

// Resolve the student's paper for the current event, expire it if the overall
// deadline passed, and advance any section whose own deadline passed. Sends the
// error response itself.
async function activePaper(req, res) {
  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) {
    res.status(404).json({ error: 'No exam session.' });
    return null;
  }
  let current = await expireIfNeeded(paper);
  if (current.status === 'active') {
    const advanced = await advancePaperSections(current);
    current = advanced.paper;
  }
  if (current.status !== 'active') {
    submittedResponse(res, current);
    return null;
  }
  return current;
}

// Start (or resume) the exam. Idempotent: resuming returns the same paper.
router.post('/start', requireStudent, startLimit, async (req, res) => {
  const event = await loadEvent(req.user.eventId);
  if (!event) return res.status(404).json({ error: 'No active event.' });
  if (await rosterRemoved(event.id, req.user.sub)) {
    return res.status(403).json({
      error: 'Your access to this exam was removed by the exam team.',
      code: 'removed',
    });
  }

  let paper = await loadPaper(event.id, req.user.sub);

  if (paper) {
    // A resumed paper may still be live after the event window closed. The
    // paper deadline is the authority once it exists.
    let current = await expireIfNeeded(paper);
    if (current.status === 'active') {
      current = (await advancePaperSections(current)).paper;
    }
    if (current.status !== 'active') {
      return res.json({
        status: 'submitted',
        submit_reason: current.submit_reason || null,
        lock_reason: current.lock_reason || null,
        locked: current.submit_reason === 'integrity_lockout',
      });
    }
    paper = current;
  } else {
    const now = Date.now();
    const startsAt = new Date(event.starts_at).getTime();
    const endsAt = startsAt + Number(event.duration_min) * 60000;
    if (now < startsAt) {
      return res.status(409).json({
        error: 'The exam has not started yet.',
        code: 'not_started',
        starts_at: event.starts_at,
        server_time: new Date().toISOString(),
      });
    }
    if (now > endsAt) {
      return res.status(409).json({ error: 'This exam has ended.', code: 'ended' });
    }

    const { createPaper } = await import('../services/paper.js');
    try {
      // A domain-aware event needs the domains the student chose. The
      // selection is validated here, before the paper (and the timer) exists.
      paper = await createPaper(event, req.user.sub, Math.random, req.body?.domains);
    } catch (err) {
      if (err?.code === 'insufficient_questions') {
        return res.json({ status: 'insufficient', category: err.category });
      }
      if (err?.status === 400) {
        return res.status(400).json({ error: err.message, code: err.code });
      }
      throw err;
    }
    await logProctorEvent(paper, 'started', 'Exam started');
  }

  await touchPaper(paper, req.seb?.verified ? 'seb' : 'web');
  res.json(await examState(paper));
});

// The runner draws the navigator from the manifest, then asks for one
// question at a time. The stem and the options of a question never leave the
// server until that question is opened.
router.get('/question/:index', requireStudent, questionLimit, async (req, res) => {
  const paper = await activePaper(req, res);
  if (!paper) return;

  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index < 0 || index >= paper.variant_ids.length) {
    return res.status(400).json({ error: 'Invalid question.' });
  }

  const category = await categoryAt(paper, index);
  const access = await sectionAccess(paper, category);
  if (!access.ok) return sectionBlockedResponse(res, access);

  const question = await hydrateQuestion(paper, index);
  if (!question) return res.status(404).json({ error: 'Question not found.' });
  res.json({
    question,
    section: access.section,
    ends_at: paper.ends_at,
    server_time: new Date().toISOString(),
  });
});

// Save one answer. The client sends the variant id and the chosen option index.
//
// One statement: the answer, the position and the new answered count. The
// count is the number of rows the table held before this statement plus one
// when the row was newly inserted (xmax = 0 means "inserted, not updated").
router.post('/answer', requireStudent, answerLimit, async (req, res) => {
  const paper = await activePaper(req, res);
  if (!paper) return;

  const questionId = req.body?.question_id;
  const choice = Number(req.body?.choice);
  const position = paper.variant_ids.indexOf(questionId);
  if (position < 0 || ![0, 1, 2, 3].includes(choice)) {
    return res.status(400).json({ error: 'Invalid answer.' });
  }

  const category = await categoryAt(paper, position);
  const access = await sectionAccess(paper, category);
  if (!access.ok) return sectionBlockedResponse(res, access);

  const index = Number.isInteger(req.body?.index) ? req.body.index : null;
  const { rows } = await q(
    `WITH saved AS (
       INSERT INTO answers (paper_id, qno, choice) VALUES ($1,$2,$3)
       ON CONFLICT (paper_id, qno) DO UPDATE SET choice = EXCLUDED.choice, updated_at = now()
       RETURNING (SELECT count(*) FROM answers WHERE paper_id = $1)
                 + CASE WHEN xmax = 0 THEN 1 ELSE 0 END AS answered
     ), moved AS (
       UPDATE papers SET current_index = $4 WHERE id = $1 AND $4::int IS NOT NULL RETURNING id
     )
     SELECT (SELECT answered FROM saved) AS answered`,
    [paper.id, position, choice, index],
  );

  const answered = Number(rows[0]?.answered || 0);
  broadcastSessionPatch(paper, { answered, current_index: index ?? paper.current_index ?? 0 });
  res.json({ ok: true, answered, saved_at: new Date().toISOString() });
});

// Heartbeat: persist the current question index, report the warning count.
//
// The heartbeat also carries the fullscreen state. The client detects leaving
// fullscreen on its own, but the server keeps the last state so a client that
// lies (or dies) cannot hide the exit.
router.post('/snapshot', requireStudent, snapshotLimit, async (req, res) => {
  const paper = await activePaper(req, res);
  if (!paper) return;

  const fullscreen = typeof req.body?.fullscreen === 'boolean' ? req.body.fullscreen : null;
  const wasFullscreen = paper.fullscreen_state === true;
  const lastSeen = paper.last_seen_at ? Date.parse(paper.last_seen_at) : null;
  const gapSec = lastSeen ? Math.max(0, Math.round((Date.now() - lastSeen) / 1000)) : 0;
  if (gapSec >= NETWORK_GAP_SEC) {
    await recordViolation(paper, 'network_gap', `${gapSec}s`, { source: 'server' });
  }

  let warnings = await warningCount(paper.id);
  let submitted = false;

  if (fullscreen === false && wasFullscreen) {
    const result = await recordViolation(paper, 'fullscreen_exit', 'The exam left fullscreen.', { source: 'server' });
    if (result.ok) {
      warnings = result.warnings;
      submitted = !!result.submitted;
    }
  }

  await q(
    `UPDATE papers
        SET current_index = CASE WHEN $2::int IS NULL THEN current_index ELSE $2 END,
            fullscreen_state = COALESCE($3::boolean, fullscreen_state),
            last_seen_at = now()
      WHERE id = $1`,
    [paper.id, Number.isInteger(req.body?.current_index) ? req.body.current_index : null, fullscreen],
  );
  broadcastSessionPatch(paper, { last_seen_at: new Date().toISOString() });
  const sectionRows = await paperSectionRows(paper.id);
  const sections = sectionRows.map((row) => sectionViewOf(row));
  const active = sections.find((section) => section.state === 'active') || null;

  res.json({
    ok: true,
    warnings,
    max_warnings: MAX_WARNINGS,
    submitted,
    ends_at: paper.ends_at,
    active_section: active?.category || null,
    sections,
    server_time: new Date().toISOString(),
  });
});

// Integrity event. The client reports what it can see; the server decides what
// it means (see services/integrity.js). Tiers: warn (counted for review) and
// log (recorded only). The server detects concurrency itself.
router.post('/event', requireStudent, eventLimit, async (req, res) => {
  const paper = await activePaper(req, res);
  if (!paper) return;

  const kind = String(req.body?.kind || '');
  if (!isKnownKind(kind)) return res.status(400).json({ error: 'Unknown event.' });
  if (!isClientReportable(kind)) {
    return res.status(400).json({
      error: 'This signal is detected by the server.',
      code: 'server_only_signal',
    });
  }

  const result = await recordViolation(paper, kind, req.body?.detail, {
    source: 'client',
    clientEventId: req.body?.client_event_id,
  });
  if (!result.ok) return res.status(400).json({ error: result.error });

  const info = kindInfo(kind);
  res.json({
    kind,
    tier: result.tier,
    label: info.label,
    reason: result.locked ? info.reason : undefined,
    warnings: result.warnings,
    max_warnings: MAX_WARNINGS,
    submitted: result.submitted,
    locked: result.locked,
  });
});

// Finish the current section early. The server completes it at "now", starts
// the next section at the same instant, and submits when this was the last one.
router.post('/section/finish', requireStudent, sectionLimit, async (req, res) => {
  const category = String(req.body?.category || '');
  if (!category) return res.status(400).json({ error: 'Section is required.' });

  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) return res.status(404).json({ error: 'No exam session.' });

  let current = await expireIfNeeded(paper);
  if (current.status === 'active') {
    const outcome = await advancePaperSections(current, { finishCategory: category });
    current = outcome.paper;

    if (outcome.conflict) {
      return res.status(409).json({
        error: 'That section is not the active section.',
        code: 'section_not_active',
        requested_section: outcome.conflict.requested?.category || category,
        active_section: outcome.conflict.active?.category || null,
      });
    }

    if (outcome.submittedReason) {
      return res.json({
        ok: true,
        submitted: true,
        submit_reason: outcome.submittedReason,
        server_time: new Date().toISOString(),
      });
    }

    return res.json({
      ok: true,
      submitted: false,
      active_section: outcome.active?.category || null,
      sections: outcome.sections,
      server_time: new Date().toISOString(),
    });
  }

  return res.json({
    ok: true,
    submitted: true,
    submit_reason: current.submit_reason || null,
    server_time: new Date().toISOString(),
  });
});

// Hand in the exam.
router.post('/submit', requireStudent, submitLimit, async (req, res) => {
  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) return res.status(404).json({ error: 'No exam session.' });
  await submitPaper(paper, 'student');
  res.json({ ok: true });
});

// Graded result for the student (correct answers are never exposed).
router.get('/result', requireStudent, resultLimit, async (req, res) => {
  if (await rosterRemoved(req.user.eventId, req.user.sub)) {
    return res.status(403).json({
      error: 'Your access to this exam was removed by the exam team.',
      code: 'removed',
    });
  }

  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) return res.status(404).json({ error: 'No result.' });

  const current = await expireIfNeeded(paper);
  if (current.status !== 'submitted') {
    return res.status(409).json({ error: 'Not submitted yet.', code: 'active' });
  }

  const event = await loadEvent(current.event_id);
  if (!event) return res.status(404).json({ error: 'No result.' });

  const state = await resultsStateForEvent(event);
  if (!state.available) {
    return res.status(state.status || 409).json({
      error: state.error,
      code: state.code,
      visibility: state.visibility,
      results_published_at: state.published_at || null,
      results_expires_at: state.expires_at || null,
      submitted: true,
    });
  }

  // The snapshot is frozen at submission. Older papers are graded once here
  // and then served from the same snapshot.
  let result = current.result_snapshot;
  if (!result) {
    result = await gradePaper(current);
    await q(
      `UPDATE papers
          SET score = $2, result_snapshot = $3::jsonb, result_graded_at = now()
        WHERE id = $1 AND result_snapshot IS NULL`,
      [current.id, result.total, JSON.stringify(result)],
    );
  }

  const { rows } = await q(`SELECT count(*)::int AS n FROM feedback WHERE paper_id = $1`, [current.id]);
  // What the exam measured: the competency the paper froze, per skill and per
  // difficulty. Counts only - the key never leaves the server.
  const competency = await competencyOfPaper(current.id);

  res.json({
    ...result,
    competency,
    started_at: current.started_at,
    submitted_at: current.submitted_at,
    submit_reason: current.submit_reason,
    locked: current.submit_reason === 'integrity_lockout',
    lock_reason: current.lock_reason || null,
    event_name: event.name || '',
    feedback_sent: rows[0].n > 0,
  });
});

// Candidate feedback, one per submission.
router.post('/feedback', requireStudent, feedbackLimit, async (req, res) => {
  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper || paper.status !== 'submitted') {
    return res.status(409).json({ error: 'Submit the exam first.' });
  }

  const rating = Number(req.body?.rating);
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

  const { rows: existing } = await q(`SELECT id FROM feedback WHERE paper_id = $1`, [paper.id]);
  if (existing.length) return res.status(409).json({ error: 'Feedback already received.' });

  await q(`INSERT INTO feedback (paper_id, rating, comment) VALUES ($1,$2,$3)`, [
    paper.id,
    rating,
    String(req.body?.comment || '').slice(0, 1000),
  ]);
  res.status(201).json({ ok: true });
});

export default wrapRouter(router);
