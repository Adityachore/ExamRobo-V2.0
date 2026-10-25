import { q } from '../db.js';
import { hydrateManifest } from './paper.js';
import { gradePaper } from './grading.js';
import { sessionViewById } from './views.js';
import { toAdmins, toStudent } from './live.js';

// The point at which an attempt is flagged for review. It is not a submission
// trigger: only the student, the clock, a force-submit or an admin lock ends an
// exam.
export const MAX_WARNINGS = 3;
export const SUBMIT_REASONS = ['student', 'time_expired', 'max_warnings', 'force_submit', 'integrity_lockout'];

export async function loadEvent(eventId) {
  const { rows } = await q(`SELECT * FROM exam_events WHERE id = $1`, [eventId]);
  return rows[0] || null;
}

export function eventEnd(event) {
  return new Date(new Date(event.starts_at).getTime() + Number(event.duration_min) * 60000);
}

export async function loadPaper(eventId, email) {
  const { rows } = await q(`SELECT * FROM papers WHERE event_id = $1 AND email = $2`, [eventId, email]);
  return rows[0] || null;
}

export async function loadPaperById(id) {
  const { rows } = await q(`SELECT * FROM papers WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function touchPaper(paper, source = null) {
  await q(
    `UPDATE papers
        SET last_seen_at = now(),
            source = COALESCE($2, source)
      WHERE id = $1`,
    [paper.id, source],
  );
}

// Answers keyed by variant id (the shape the runner expects).
export async function answersByVariant(paper) {
  const { rows } = await q(`SELECT qno, choice FROM answers WHERE paper_id = $1`, [paper.id]);
  const byQno = new Map(rows.map((r) => [r.qno, r.choice]));
  const map = {};
  paper.variant_ids.forEach((variantId, index) => {
    const choice = byQno.get(index);
    if (choice !== undefined) map[variantId] = choice;
  });
  return map;
}

export async function warningCount(paperId) {
  const { rows } = await q(`SELECT count(*)::int AS n FROM warnings WHERE paper_id = $1`, [paperId]);
  return rows[0].n;
}

// Full exam state for the student runner. The server is the authority; the
// client only mirrors this.
export async function examState(paper) {
  const [paperView, answers, warnings] = await Promise.all([
    hydrateManifest(paper.variant_ids, paper.id),
    answersByVariant(paper),
    warningCount(paper.id),
  ]);
  return {
    status: paper.status,
    paper_id: paper.id,
    paper: paperView,
    answers,
    current_index: paper.current_index ?? 0,
    warnings,
    max_warnings: MAX_WARNINGS,
    // The technical domains the student chose, frozen with the paper.
    selected_domains: paper.selected_categories || [],
    locked: paper.status === 'submitted' && paper.submit_reason === 'integrity_lockout',
    lock_reason: paper.lock_reason || null,
    submit_reason: paper.submit_reason || null,
    started_at: paper.started_at,
    ends_at: paper.ends_at,
    server_time: new Date().toISOString(),
  };
}

// Append to the durable proctor event log and push it to the dashboard.
export async function logProctorEvent(paper, kind, detail = '') {
  const { rows } = await q(
    `INSERT INTO proctor_events (event_id, paper_id, email, name, kind, detail)
     VALUES ($1, $2, $3,
             (SELECT COALESCE(r.name, $3) FROM roster_emails r WHERE r.event_id = $1 AND r.email = $3),
             $4, $5)
     RETURNING id, email, name, kind, detail, created_at`,
    [paper.event_id, paper.id, paper.email, kind, detail],
  );
  const row = rows[0];
  const entry = {
    id: row.id,
    at: row.created_at,
    email: row.email,
    name: row.name || row.email,
    kind: row.kind,
    detail: row.detail || '',
  };
  toAdmins({ type: 'event', event: entry });
  return entry;
}

export async function broadcastSession(paper) {
  const session = await sessionViewById(paper.id);
  if (session) toAdmins({ type: 'session', session });
}

// A cheap update for the dashboard. The full session view costs six
// aggregated counts per paper, and it used to run on every answer click and
// every recording chunk. These updates carry the values we already have, so
// the dashboard stays live without a query per keystroke.
export function broadcastSessionPatch(paper, patch) {
  toAdmins({
    type: 'session_patch',
    key: `${paper.event_id}:${paper.email}`,
    patch,
  });
}

// Close the paper, grade it, tell the student and the dashboard.
export async function submitPaper(paper, reason) {
  if (!paper || paper.status === 'submitted') return paper;
  const { rows } = await q(
    `UPDATE papers SET status='submitted', submitted_at=now(), submit_reason=$2
      WHERE id=$1 AND status='active'
      RETURNING id, event_id, email, variant_ids, started_at, ends_at, current_index,
                status, submitted_at, submit_reason, lock_reason, score`,
    [paper.id, reason],
  );
  if (!rows.length) return loadPaperById(paper.id);
  const updated = rows[0];
  const result = await gradePaper(updated);
  await q(`UPDATE papers SET score = $2 WHERE id = $1`, [updated.id, result.total]);
  updated.score = result.total;
  await logProctorEvent(updated, 'submitted', reason);
  await broadcastSession(updated);
  toStudent(updated.email, { type: 'submitted', reason });
  return updated;
}

// Submit if the deadline has passed. Safe to call on every request.
export async function expireIfNeeded(paper) {
  if (!paper || paper.status !== 'active') return paper;
  if (new Date(paper.ends_at).getTime() > Date.now()) return paper;
  return submitPaper(paper, 'time_expired');
}

// Background sweeper: closes exams whose deadline passed while nobody was
// polling. Without it a student who never returns would stay "active".
export function startExpirySweeper(intervalMs = 3000) {
  const timer = setInterval(async () => {
    try {
      const { rows } = await q(
        `SELECT id, event_id, email, variant_ids, started_at, ends_at, current_index,
                status, submitted_at, submit_reason, lock_reason, score
           FROM papers
          WHERE status='active' AND ends_at <= now()
          LIMIT 50`,
      );
      for (const row of rows) await submitPaper(row, 'time_expired');
    } catch (err) {
      console.error('[sweeper] expiry sweep failed:', err.message);
    }
  }, intervalMs);
  timer.unref?.();
  return timer;
}
