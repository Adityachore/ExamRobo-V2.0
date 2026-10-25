import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { q } from '../db.js';
import { requireStudent } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/security.js';
import { gradePaper } from '../services/grading.js';
import { competencyOfPaper } from '../services/analytics.js';
import { hydrateQuestion } from '../services/paper.js';

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
  MAX_WARNINGS,
} from '../services/sessions.js';
import { isClientReportable, isKnownKind, kindInfo, recordViolation } from '../services/integrity.js';

const router = Router();
const RECORDINGS_DIR =
  process.env.RECORDINGS_DIR || path.join(process.cwd(), 'data', 'recordings');
const NETWORK_GAP_SEC = Math.max(15, Number(process.env.NETWORK_GAP_SEC || 45));

const studentKey = (req) => req.user?.sub || req.ip || 'unknown';
const limit = (name, max, windowMs = 60_000) =>
  createRateLimiter({ name, max: Number(process.env[name.toUpperCase()] || max), windowMs, key: studentKey });

const startLimit = limit('exam_start', 12);
const answerLimit = limit('exam_answer', 90);
const questionLimit = limit('exam_question', 120);
const snapshotLimit = limit('exam_snapshot', 40);
const eventLimit = limit('exam_event', 40);
const submitLimit = limit('exam_submit', 10);
const resultLimit = limit('exam_result', 30);
const feedbackLimit = limit('exam_feedback', 5);

// Resolve the student's paper for the current event, expiring it if the
// deadline already passed. Sends the error response itself.
async function activePaper(req, res) {
  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) {
    res.status(404).json({ error: 'No exam session.' });
    return null;
  }
  const current = await expireIfNeeded(paper);
  if (current.status !== 'active') {
    res.status(409).json({
      error: 'Exam already submitted.',
      code: 'submitted',
      submit_reason: current.submit_reason || null,
      lock_reason: current.lock_reason || null,
      locked: current.submit_reason === 'integrity_lockout',
    });
    return null;
  }
  return current;
}

// Start (or resume) the exam. Idempotent: resuming returns the same paper.
router.post('/start', requireStudent, startLimit, async (req, res) => {
  const event = await loadEvent(req.user.eventId);
  if (!event) return res.status(404).json({ error: 'No active event.' });

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

  let paper = await loadPaper(event.id, req.user.sub);
  if (!paper) {
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
  } else {

    const current = await expireIfNeeded(paper);
    if (current.status !== 'active') {
      return res.json({
        status: 'submitted',
        submit_reason: current.submit_reason || null,
        lock_reason: current.lock_reason || null,
        locked: current.submit_reason === 'integrity_lockout',
      });
    }
    paper = current;
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

  const question = await hydrateQuestion(paper, index);
  if (!question) return res.status(404).json({ error: 'Question not found.' });
  res.json({ question });
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

  res.json({
    ok: true,
    warnings,
    max_warnings: MAX_WARNINGS,
    submitted,
    ends_at: paper.ends_at,
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

// Hand in the exam.
router.post('/submit', requireStudent, submitLimit, async (req, res) => {
  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) return res.status(404).json({ error: 'No exam session.' });
  await submitPaper(paper, 'student');
  res.json({ ok: true });
});

// Graded result for the student (correct answers are never exposed).
router.get('/result', requireStudent, resultLimit, async (req, res) => {
  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) return res.status(404).json({ error: 'No result.' });

  const current = await expireIfNeeded(paper);
  if (current.status !== 'submitted') {
    return res.status(409).json({ error: 'Not submitted yet.', code: 'active' });
  }

  const result = await gradePaper(current);
  const event = await loadEvent(current.event_id);
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
    event_name: event?.name || '',
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

// Recording chunk. Mounted with express.raw() before the JSON parser, so the
// body is the raw binary blob sent by MediaRecorder.
router.post('/recording/chunk', requireStudent, async (req, res) => {
  const paper = await loadPaper(req.user.eventId, req.user.sub);
  if (!paper) return res.status(404).json({ error: 'No exam session.' });

  const seq = Number(req.headers['x-chunk-seq']);
  if (!Number.isInteger(seq) || seq < 0) return res.status(400).json({ error: 'Missing chunk sequence.' });

  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  const mime = String(req.headers['content-type'] || 'video/webm');

  // One query for the state of the recording: does this chunk exist, how many
  // chunks are there, and when was the last one written.
  const { rows: stats } = await q(
    `SELECT count(*)::int AS chunk_count,
            COALESCE(max(chunk_no), -1) AS max_chunk,
            max(created_at) AS last_chunk_at,
            count(*) FILTER (WHERE chunk_no = $2)::int AS present
       FROM recordings WHERE paper_id = $1`,
    [paper.id, seq],
  );
  const stat = stats[0] || { chunk_count: 0, max_chunk: -1, last_chunk_at: null, present: 0 };

  if (!stat.present) {
    const dir = path.join(RECORDINGS_DIR, paper.id);
    await fs.mkdir(dir, { recursive: true });
    const file = path.join(dir, `${seq}.chunk`);
    await fs.writeFile(file, body);
    const { rows: written } = await q(
      `INSERT INTO recordings (paper_id, chunk_no, bytes, path, mime) VALUES ($1,$2,$3,$4,$5)
       RETURNING created_at`,
      [paper.id, seq, body.length, file, mime],
    );
    broadcastSessionPatch(paper, {
      chunk_count: Number(stat.chunk_count || 0) + 1,
      max_chunk: Math.max(Number(stat.max_chunk ?? -1), seq),
      last_chunk_at: written[0]?.created_at || null,
    });
  } else {
    broadcastSessionPatch(paper, {
      chunk_count: Number(stat.chunk_count || 0),
      max_chunk: Number(stat.max_chunk ?? -1),
      last_chunk_at: stat.last_chunk_at || null,
    });
  }

  res.json({ ok: true, received: seq });
});

export default wrapRouter(router);
