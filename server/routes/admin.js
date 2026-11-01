import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { q, withTransaction } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { normalizeEventInput, unknownCategories } from '../services/event-config.js';
import { sessionViews, sessionViewById, eventViews, eventViewOf, feedViews } from '../services/views.js';
import { gradePaper, gradeMany } from '../services/grading.js';
import { competencyByPaper, cohortOf } from '../services/analytics.js';
import { submitPaper, logProctorEvent } from '../services/sessions.js';
import { lockPaper } from '../services/integrity.js';
import { removeRosterStudent, restartPaper, resumePaper } from '../services/attempts.js';
import { toStudent } from '../services/live.js';
import { CATEGORIES } from '../services/competency.js';

const router = Router();
router.use(requireAdmin);

const RECORDINGS_DIR =
  process.env.RECORDINGS_DIR || path.join(process.cwd(), 'data', 'recordings');

const emailRe = /^\S+@\S+\.\S+$/;
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const normalize = (email) => String(email || '').trim().toLowerCase();

async function knownCategorySet() {
  const { rows } = await q(`SELECT DISTINCT category FROM questions`);
  return new Set([...CATEGORIES, ...rows.map((r) => r.category)]);
}

async function recordAction(db, req, action, detail = {}) {
  await db.query(
    `INSERT INTO admin_actions (actor_email, action, event_id, paper_id, target_email, reason, detail)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      req.user?.sub || 'admin',
      action,
      detail.event_id || null,
      detail.paper_id || null,
      detail.email || null,
      detail.reason || null,
      detail.detail || {},
    ],
  );
}

async function removeRecordingDirs(paperIds) {
  for (const id of paperIds) {
    if (!uuidRe.test(String(id))) continue;
    await fs.rm(path.join(RECORDINGS_DIR, id), { recursive: true, force: true }).catch(() => {});
  }
}

// The dashboard keys a session by "<event_id>:<email>".
async function paperFromKey(key) {
  const raw = String(key || '');
  const at = raw.indexOf(':');
  if (at < 1) return null;
  const eventId = raw.slice(0, at);
  const email = raw.slice(at + 1);
  if (!uuidRe.test(eventId)) return null;
  const { rows } = await q(`SELECT * FROM papers WHERE event_id = $1 AND email = $2`, [eventId, email]);
  return rows[0] || null;
}

function eventIdFromQuery(value) {
  const raw = String(value || '').trim();
  return uuidRe.test(raw) ? raw : null;
}

async function eventWithCounts(id) {
  const { rows } = await q(
    `SELECT e.*,
            (SELECT count(*) FROM roster_emails r WHERE r.event_id = e.id AND r.removed_at IS NULL)::int AS roster_count,
            (SELECT count(*) FROM papers p WHERE p.event_id = e.id)::int AS paper_count
       FROM exam_events e
      WHERE e.id = $1`,
    [id],
  );
  return rows[0] || null;
}

// ---------------------------------------------------------------- events

router.get('/events', async (_req, res) => {
  res.json({ events: await eventViews(), server_time: new Date().toISOString() });
});

router.post('/events', async (req, res) => {
  const input = normalizeEventInput(req.body);
  if (!input.ok) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: input.fields });

  const unknown = unknownCategories(input.value, await knownCategorySet());
  if (unknown.length) {
    return res.status(400).json({
      error: 'Please fix the highlighted fields.',
      fields: { config: `Unknown category: ${unknown.join(', ')}.` },
    });
  }

  const value = input.value;
  const { rows } = await withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO exam_events
         (name, starts_at, duration_min, categories, question_counts, domain_mode,
          domain_rules, section_limits, results_visibility, instructions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        value.name,
        value.starts_at,
        value.duration_min,
        value.categories,
        value.question_counts,
        value.domain_mode,
        value.domain_rules,
        value.section_limits,
        value.results_visibility,
        value.instructions,
      ],
    );
    await recordAction(client, req, 'event.create', {
      event_id: inserted.rows[0].id,
      detail: { name: value.name },
    });
    return inserted;
  });
  res.status(201).json({ event: eventViewOf({ ...rows[0], roster_count: 0, paper_count: 0 }) });
});

router.patch('/events/:id', async (req, res) => {
  if (!uuidRe.test(req.params.id)) return res.status(404).json({ error: 'Event not found.' });
  const { rows } = await q(`SELECT * FROM exam_events WHERE id = $1`, [req.params.id]);
  const event = rows[0];
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  const { rows: started } = await q(`SELECT count(*)::int AS n FROM papers WHERE event_id = $1`, [event.id]);
  if (started[0].n > 0) {
    return res.status(409).json({
      error: 'This event already has student papers and can no longer be edited.',
      code: 'event_started',
    });
  }

  const input = normalizeEventInput(req.body, event);
  if (!input.ok) return res.status(400).json({ error: 'Please fix the highlighted fields.', fields: input.fields });

  const unknown = unknownCategories(input.value, await knownCategorySet());
  if (unknown.length) {
    return res.status(400).json({
      error: 'Please fix the highlighted fields.',
      fields: { config: `Unknown category: ${unknown.join(', ')}.` },
    });
  }

  const value = input.value;
  const updated = await withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE exam_events
          SET name=$2, starts_at=$3, duration_min=$4, categories=$5, question_counts=$6,
              domain_mode=$7, domain_rules=$8, section_limits=$9, instructions=$10,
              results_visibility=$11
        WHERE id=$1
        RETURNING *`,
      [
        event.id,
        value.name,
        value.starts_at,
        value.duration_min,
        value.categories,
        value.question_counts,
        value.domain_mode,
        value.domain_rules,
        value.section_limits,
        value.instructions,
        value.results_visibility,
      ],
    );
    await recordAction(client, req, 'event.update', {
      event_id: event.id,
      detail: { name: value.name },
    });
    return result.rows[0];
  });

  res.json({ event: eventViewOf({ ...updated, roster_count: 0, paper_count: 0 }) });
});

const RESULT_PRESETS = {
  '1h': (d) => new Date(d.getTime() + 60 * 60 * 1000),
  '6h': (d) => new Date(d.getTime() + 6 * 60 * 60 * 1000),
  '1d': (d) => new Date(d.getTime() + 24 * 60 * 60 * 1000),
  '7d': (d) => new Date(d.getTime() + 7 * 24 * 60 * 60 * 1000),
  '14d': (d) => new Date(d.getTime() + 14 * 24 * 60 * 60 * 1000),
  '30d': (d) => new Date(d.getTime() + 30 * 24 * 60 * 60 * 1000),
};

function resultExpiry(body) {
  const preset = String(body?.preset || '').trim();
  if (preset && RESULT_PRESETS[preset]) return RESULT_PRESETS[preset](new Date());
  if (!body?.expires_at) return null;
  const date = new Date(body.expires_at);
  if (Number.isNaN(date.getTime())) return { error: 'Invalid expiry date and time.' };
  if (date.getTime() <= Date.now()) return { error: 'Expiry time must be in the future.' };
  return date;
}

async function publishResults(req, res, event) {
  const remaining = await q(
    `SELECT count(*)::int AS n FROM papers WHERE event_id = $1 AND status <> 'submitted'`,
    [event.id],
  );
  if (Number(remaining.rows[0].n) > 0) {
    return res.status(409).json({
      error: 'All students must submit before publishing results.',
      code: 'results_not_ready',
    });
  }

  const expiry = resultExpiry(req.body);
  if (expiry?.error) return res.status(400).json({ error: expiry.error });
  if (!expiry) {
    return res.status(400).json({
      error: 'Choose an expiry time before publishing results.',
      code: 'results_expiry_required',
    });
  }

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE exam_events
          SET results_published = true,
              results_published_at = COALESCE(results_published_at, now()),
              results_published_by = COALESCE(results_published_by, $2),
              results_expires_at = $3
        WHERE id = $1`,
      [event.id, req.user?.sub || 'admin', expiry],
    );
    await recordAction(client, req, 'results.publish', {
      event_id: event.id,
      detail: { name: event.name, expires_at: expiry.toISOString() },
    });
  });

  const fresh = await eventWithCounts(event.id);
  return res.json({ ok: true, event: eventViewOf(fresh) });
}

async function unpublishResults(req, res, event) {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE exam_events
          SET results_published = false,
              results_published_at = NULL,
              results_published_by = NULL,
              results_expires_at = NULL
        WHERE id = $1`,
      [event.id],
    );
    await recordAction(client, req, 'results.unpublish', {
      event_id: event.id,
      detail: { name: event.name },
    });
  });
  const fresh = await eventWithCounts(event.id);
  return res.json({ ok: true, event: eventViewOf(fresh) });
}

// Manual publish/extend/unpublish. Publication no longer waits for the event
// clock: it is allowed once every existing paper is submitted.
router.post('/events/:id/publish-results', async (req, res) => {
  const event = await eventWithCounts(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  if ((event.results_visibility || 'manual') !== 'manual') {
    return res.status(400).json({
      error: 'This event is not set to manual result publishing.',
      code: 'not_manual',
    });
  }
  return publishResults(req, res, event);
});

router.post('/events/:id/results/extend', async (req, res) => {
  const event = await eventWithCounts(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  if ((event.results_visibility || 'manual') !== 'manual') {
    return res.status(400).json({ error: 'This event is not set to manual result publishing.' });
  }
  if (!event.results_published_at) {
    return res.status(409).json({ error: 'Results have not been published yet.' });
  }
  const expiry = resultExpiry(req.body);
  if (expiry?.error) return res.status(400).json({ error: expiry.error });
  if (!expiry) return res.status(400).json({ error: 'Choose a new expiry time.' });

  await withTransaction(async (client) => {
    await client.query(`UPDATE exam_events SET results_expires_at = $2 WHERE id = $1`, [
      event.id,
      expiry,
    ]);
    await recordAction(client, req, 'results.extend', {
      event_id: event.id,
      detail: { name: event.name, expires_at: expiry.toISOString() },
    });
  });
  const fresh = await eventWithCounts(event.id);
  res.json({ ok: true, event: eventViewOf(fresh) });
});

router.post('/events/:id/results/unpublish', async (req, res) => {
  const event = await eventWithCounts(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  return unpublishResults(req, res, event);
});

// Backwards-compatible boolean endpoint used by older admin screens.
router.post('/events/:id/results', async (req, res) => {
  const event = await eventWithCounts(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  if (typeof req.body?.published !== 'boolean') {
    return res.status(400).json({ error: 'published must be true or false.' });
  }
  if (req.body.published) {
    if ((event.results_visibility || 'manual') !== 'manual') {
      return res.status(400).json({ error: 'This event is not set to manual result publishing.' });
    }
    return publishResults(req, res, event);
  }
  return unpublishResults(req, res, event);
});

router.delete('/events/:id', async (req, res) => {
  if (!uuidRe.test(req.params.id)) return res.status(404).json({ error: 'Event not found.' });
  const { rows } = await q(`SELECT * FROM exam_events WHERE id = $1`, [req.params.id]);
  const event = rows[0];
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  if (String(req.body?.confirm_name || '') !== event.name) {
    return res.status(400).json({
      error: 'Type the event name exactly to confirm deletion.',
      fields: { confirm_name: 'The name does not match.' },
    });
  }

  const { rows: papers } = await q(
    `SELECT id, email, status FROM papers WHERE event_id = $1`,
    [event.id],
  );

  await withTransaction(async (client) => {
    await recordAction(client, req, 'event.delete', {
      event_id: event.id,
      reason: String(req.body?.reason || '').trim() || null,
      detail: { name: event.name, papers: papers.length },
    });
    await client.query(`DELETE FROM papers WHERE event_id = $1`, [event.id]);
    await client.query(`DELETE FROM exam_events WHERE id = $1`, [event.id]);
  });

  await removeRecordingDirs(papers.map((p) => p.id));
  for (const paper of papers) {
    if (paper.status === 'active') {
      toStudent(paper.email, {
        type: 'removed',
        reason: 'This event was deleted by the administrator.',
        final: true,
      });
    }
  }

  res.json({ ok: true, deleted: event.id });
});


// ---------------------------------------------------------------- roster

function rosterView(row) {
  return {
    email: row.email,
    name: row.name,
    updated_at: row.updated_at,
    removed_at: row.removed_at || null,
    removed_reason: row.removed_reason || null,
    removed_by: row.removed_by || null,
    removed: !!row.removed_at,
    has_paper: !!row.has_paper,
  };
}

async function touchRoster(eventId) {
  await q(`UPDATE exam_events SET roster_updated_at = now() WHERE id = $1`, [eventId]);
}

router.get('/events/:id/roster', async (req, res) => {
  const { rows: events } = await q(`SELECT * FROM exam_events WHERE id = $1`, [req.params.id]);
  if (!events.length) return res.status(404).json({ error: 'Event not found.' });

  const { rows } = await q(
    `SELECT r.email, r.name, r.updated_at, r.removed_at, r.removed_reason, r.removed_by,
            EXISTS (SELECT 1 FROM papers p WHERE p.event_id=r.event_id AND p.email=r.email) AS has_paper
       FROM roster_emails r WHERE r.event_id = $1
      ORDER BY (r.removed_at IS NOT NULL), r.email`,
    [req.params.id],
  );
  res.json({
    roster: rows.map(rosterView),
    roster_updated_at: events[0].roster_updated_at,
  });
});

router.get('/events/:id/roster.csv', async (req, res) => {
  const { rows: events } = await q(`SELECT * FROM exam_events WHERE id = $1`, [req.params.id]);
  if (!events.length) return res.status(404).json({ error: 'Event not found.' });
  const { rows } = await q(
    `SELECT email, name, updated_at, removed_at FROM roster_emails WHERE event_id = $1 ORDER BY email`,
    [req.params.id],
  );
  const lines = [
    'email,name,removed,updated_at',
    ...rows.map((row) =>
      [csvCell(row.email), csvCell(row.name), row.removed_at ? 'yes' : 'no', csvCell(row.updated_at)].join(','),
    ),
  ];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="roster.csv"');
  res.send(lines.join('\n'));
});

router.post('/events/:id/roster', async (req, res) => {
  const { rows: events } = await q(`SELECT * FROM exam_events WHERE id = $1`, [req.params.id]);
  if (!events.length) return res.status(404).json({ error: 'Event not found.' });

  if (req.body?.email !== undefined) {
    const email = normalize(req.body.email);
    if (!emailRe.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    const name = String(req.body?.name || '').trim() || email.split('@')[0];

    const { rows } = await q(
      `INSERT INTO roster_emails (event_id, email, name, updated_at, removed_at, removed_reason, removed_by)
       VALUES ($1,$2,$3,now(),NULL,NULL,NULL)
       ON CONFLICT (event_id, email) DO UPDATE
         SET name=EXCLUDED.name, updated_at=now(),
             removed_at=NULL, removed_reason=NULL, removed_by=NULL
       RETURNING email, name, updated_at, removed_at, removed_reason, removed_by`,
      [req.params.id, email, name],
    );
    await touchRoster(req.params.id);
    return res.status(201).json({ student: rosterView(rows[0]) });
  }

  const lines = String(req.body?.text || '').split(/\r?\n/);
  const valid = [];
  const invalid = [];
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const parts = raw.split(/[,\t;]/).map((p) => p.trim());
    const email = (parts[0] || '').toLowerCase();
    const name = parts.slice(1).join(' ').trim() || email.split('@')[0];
    if (!emailRe.test(email)) invalid.push({ line: i + 1, value: raw });
    else valid.push({ email, name });
  }

  let added = 0;
  let updated = 0;
  await withTransaction(async (client) => {
    for (const row of valid) {
      const result = await client.query(
        `INSERT INTO roster_emails (event_id, email, name, updated_at, removed_at, removed_reason, removed_by)
         VALUES ($1,$2,$3,now(),NULL,NULL,NULL)
         ON CONFLICT (event_id, email) DO UPDATE
           SET name=EXCLUDED.name, updated_at=now(),
               removed_at=NULL, removed_reason=NULL, removed_by=NULL
         RETURNING (xmax = 0) AS inserted`,
        [req.params.id, row.email, row.name],
      );
      if (result.rows[0]?.inserted) added++;
      else updated++;
    }
  });

  if (added || updated) await touchRoster(req.params.id);
  const { rows: fresh } = await q(`SELECT roster_updated_at FROM exam_events WHERE id = $1`, [req.params.id]);
  res.json({ added, updated, invalid, roster_updated_at: fresh[0].roster_updated_at });
});

router.patch('/events/:id/roster/:email', async (req, res) => {
  const email = normalize(decodeURIComponent(req.params.email));
  const { rows: found } = await q(
    `SELECT * FROM roster_emails WHERE event_id=$1 AND email=$2`,
    [req.params.id, email],
  );
  if (!found.length) return res.status(404).json({ error: 'Student is not on this roster.' });

  const nextEmail = req.body?.email !== undefined ? normalize(req.body.email) : email;
  if (!emailRe.test(nextEmail)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const name = req.body?.name !== undefined ? String(req.body.name).trim() : found[0].name;
  if (!name) return res.status(400).json({ error: 'Name is required.' });

  if (nextEmail !== email) {
    const { rows: paper } = await q(
      `SELECT id FROM papers WHERE event_id=$1 AND email=$2 LIMIT 1`,
      [req.params.id, email],
    );
    if (paper.length) {
      return res.status(409).json({
        error: 'This student already has a paper, so their email can no longer be changed.',
        code: 'email_locked',
      });
    }
  }

  const { rows } = await q(
    `UPDATE roster_emails SET email=$3, name=$4, updated_at=now()
      WHERE event_id=$1 AND email=$2
      RETURNING email, name, updated_at, removed_at, removed_reason, removed_by`,
    [req.params.id, email, nextEmail, name],
  );
  await touchRoster(req.params.id);
  res.json({ student: rosterView(rows[0]) });
});

router.delete('/events/:id/roster/:email', async (req, res) => {
  const email = normalize(decodeURIComponent(req.params.email));
  const reason = String(req.body?.reason || '').trim() || 'Removed by administrator.';
  try {
    const result = await removeRosterStudent(req.params.id, email, {
      reason,
      actor: req.user?.sub || 'admin',
    });
    await touchRoster(req.params.id);
    res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.status ? err.message : 'Could not remove the student.',
      code: err.code || undefined,
    });
  }
});

router.post('/events/:id/roster/remove', async (req, res) => {
  const emails = Array.isArray(req.body?.emails)
    ? [...new Set(req.body.emails.map(normalize).filter((email) => emailRe.test(email)))]
    : [];
  if (!emails.length) return res.status(400).json({ error: 'Choose at least one student.' });
  const reason = String(req.body?.reason || '').trim() || 'Removed by administrator.';

  let removed = 0;
  for (const email of emails) {
    try {
      await removeRosterStudent(req.params.id, email, {
        reason,
        actor: req.user?.sub || 'admin',
      });
      removed++;
    } catch (err) {
      if (err.status !== 404) throw err;
    }
  }
  if (removed) await touchRoster(req.params.id);
  res.json({ ok: true, removed });
});

// ---------------------------------------------------------------- live

router.get('/live', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
  const result = await sessionViews({
    limit,
    offset: (page - 1) * limit,
    eventId: eventIdFromQuery(req.query.event_id),
    status: ['active', 'submitted'].includes(req.query.status) ? req.query.status : null,
    search: String(req.query.q || '').trim() || null,
  });
  res.json({
    sessions: result.sessions,
    total: result.total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(result.total / limit)),
    events: await feedViews(),
    server_time: new Date().toISOString(),
  });
});

// One student's live state plus their full proctor-event history.
router.get('/session', async (req, res) => {
  const paper = await paperFromKey(req.query.key);
  if (!paper) return res.status(404).json({ error: 'Session not found.' });
  res.json({
    session: await sessionViewById(paper.id),
    events: await feedViews(1000, paper.id),
  });
});

router.post('/force-submit', async (req, res) => {
  const paper = await paperFromKey(req.body?.key);
  if (!paper) return res.status(404).json({ error: 'Session not found.' });
  if (paper.status === 'submitted') return res.status(409).json({ error: 'Exam already submitted.' });

  const updated = await submitPaper(paper, 'force_submit');
  const result = await gradePaper(updated);
  res.json({ ok: true, result });
});

// Lock a session because of suspected misconduct. The paper is submitted and
// graded like a normal hand-in, a MISCONDUCT flag is raised and the student is
// told why - the same consequence the automatic policy applies.
router.post('/lock', async (req, res) => {
  const paper = await paperFromKey(req.body?.key);
  if (!paper) return res.status(404).json({ error: 'Session not found.' });
  if (paper.status === 'submitted') return res.status(409).json({ error: 'Exam already submitted.' });

  const reason = String(req.body?.reason || '').trim() || 'Locked by the proctor.';
  const updated = await lockPaper(paper, 'locked', {
    label: 'Locked by the proctor',
    reason,
  });
  res.json({ ok: true, session: await sessionViewById(updated.id) });
});

router.post('/resume', async (req, res) => {
  const paper = await paperFromKey(req.body?.key);
  if (!paper) return res.status(404).json({ error: 'Session not found.' });

  try {
    const session = await resumePaper(paper, {
      minutes: Number(req.body?.minutes),
      reason: String(req.body?.reason || '').trim(),
      actor: req.user?.sub || 'admin',
    });
    res.json({ ok: true, session });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.status ? err.message : 'Could not resume the session.',
      code: err.code || undefined,
    });
  }
});

router.post('/restart', async (req, res) => {
  const paper = await paperFromKey(req.body?.key);
  if (!paper) return res.status(404).json({ error: 'Session not found.' });
  const { rows } = await q(`SELECT * FROM exam_events WHERE id=$1`, [paper.event_id]);
  if (!rows.length) return res.status(404).json({ error: 'Event not found.' });
  const { rows: roster } = await q(
    `SELECT removed_at FROM roster_emails WHERE event_id=$1 AND email=$2`,
    [paper.event_id, paper.email],
  );
  if (roster[0]?.removed_at) {
    return res.status(409).json({
      error: 'Restore this student to the roster before restarting their paper.',
      code: 'student_removed',
    });
  }

  try {
    const session = await restartPaper(paper, rows[0], {
      reason: String(req.body?.reason || '').trim(),
      actor: req.user?.sub || 'admin',
    });
    res.json({ ok: true, session });
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.status ? err.message : 'Could not restart the session.',
      code: err.code || undefined,
    });
  }
});

router.post('/message', async (req, res) => {
  const paper = await paperFromKey(req.body?.key);
  if (!paper) return res.status(404).json({ error: 'Session not found.' });

  const text = String(req.body?.message || '').trim();
  if (!text) return res.status(400).json({ error: 'Message is required.' });

  toStudent(paper.email, { type: 'message', text, at: new Date().toISOString() });
  await logProctorEvent(paper, 'message', text);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- flags

function flagView(row) {
  const isStudent = row.subject_type === 'student';
  return {
    id: row.id,
    kind: row.kind,
    email: isStudent ? row.subject_id : null,
    event_id: row.event_id || null,
    reason: row.reason,
    status: row.resolved ? 'resolved' : 'open',
    created_at: row.created_at,
  };
}

router.get('/flags', async (req, res) => {
  const eventId = eventIdFromQuery(req.query.event_id);
  const { rows } = await q(
    `SELECT * FROM flags
      WHERE ($1::uuid IS NULL OR event_id = $1::uuid)
      ORDER BY created_at DESC LIMIT 200`,
    [eventId],
  );
  res.json({ flags: rows.map(flagView) });
});

router.post('/flags', async (req, res) => {
  const kind = String(req.body?.kind || '');
  const reason = String(req.body?.reason || '').trim();
  const email = req.body?.email ? normalize(req.body.email) : null;
  let eventId = eventIdFromQuery(req.body?.event_id);

  if (!['HR_MISTAKE', 'MISCONDUCT'].includes(kind)) {
    return res.status(400).json({ error: 'Invalid flag kind.' });
  }
  if (!reason) return res.status(400).json({ error: 'Reason is required.' });

  // The dashboard only sends the student email. Resolve the event the student
  // is taking so the flag keeps its event context.
  if (!eventId && email) {
    const { rows } = await q(
      `SELECT p.event_id FROM papers p WHERE p.email = $1 ORDER BY p.started_at DESC NULLS LAST LIMIT 1`,
      [email],
    );
    eventId = rows[0]?.event_id || null;
  }

  // subject_id keeps the student email (or the event uuid for an event-wide
  // flag); event_id keeps the event context for both kinds.
  const subjectType = email ? 'student' : 'event';
  const subjectId = email || eventId || '';

  const { rows } = await q(
    `INSERT INTO flags (kind, subject_type, subject_id, event_id, reason)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [kind, subjectType, subjectId, eventId, reason],
  );
  res.status(201).json({ flag: flagView(rows[0]) });
});

router.patch('/flags/:id', async (req, res) => {
  const { rows: found } = await q(`SELECT id FROM flags WHERE id = $1`, [req.params.id]);
  if (!found.length) return res.status(404).json({ error: 'Flag not found.' });

  const status = String(req.body?.status || '');
  if (!['open', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const { rows } = await q(
    `UPDATE flags SET resolved = $2 WHERE id = $1 RETURNING *`,
    [req.params.id, status === 'resolved'],
  );
  res.json({ flag: flagView(rows[0]) });
});

// ---------------------------------------------------------------- tickets

router.get('/tickets', async (_req, res) => {
  const { rows } = await q(`SELECT * FROM tickets ORDER BY created_at DESC LIMIT 200`);
  res.json({ tickets: rows });
});

router.patch('/tickets/:id', async (req, res) => {
  const { rows: found } = await q(`SELECT id FROM tickets WHERE id = $1`, [req.params.id]);
  if (!found.length) return res.status(404).json({ error: 'Ticket not found.' });

  const status = String(req.body?.status || '');
  if (!['open', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }
  const { rows } = await q(`UPDATE tickets SET status = $2 WHERE id = $1 RETURNING *`, [
    req.params.id,
    status,
  ]);
  res.json({ ticket: rows[0] });
});

// ---------------------------------------------------------------- results

// A spreadsheet reads a leading =, +, - or @ as a formula and runs it. A
// student name is free text from the roster, so it is prefixed with a single
// quote: the cell shows the text and nothing is ever executed.
const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

async function leaderboard(eventId) {
  const { rows } = await q(
    `SELECT p.id, p.event_id, p.email, p.submitted_at, p.submit_reason,
            COALESCE(r.name, p.email) AS name
       FROM papers p
       LEFT JOIN roster_emails r ON r.event_id = p.event_id AND r.email = p.email
      WHERE p.status = 'submitted'
        AND ($1::uuid IS NULL OR p.event_id = $1::uuid)
      ORDER BY p.submitted_at ASC`,
    [eventId],
  );
  const graded = await gradeMany(rows);
  // The competency of every paper in one query, not one query per student.
  const competency = await competencyByPaper(rows.map((r) => r.id));
  return rows
    .map((row) => {
      const g = graded.get(row.id) || { total: 0, max: 0, sections: [] };
      return {
        rank: 0,
        event_id: row.event_id,
        email: row.email,
        name: row.name,
        total: g.total,
        max: g.max,
        sections: g.sections,
        competency: competency.get(row.id) || { skills: [], difficulties: [] },
        submitted_at: row.submitted_at,
        submit_reason: row.submit_reason,
      };
    })
    .sort((a, b) => b.total - a.total || new Date(a.submitted_at) - new Date(b.submitted_at))
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

router.get('/results', async (req, res) => {
  res.json({ results: await leaderboard(eventIdFromQuery(req.query.event_id)) });
});

router.get('/results.csv', async (req, res) => {
  const results = await leaderboard(eventIdFromQuery(req.query.event_id));
  const lines = [
    'rank,name,email,total,max,submitted_at',
    ...results.map((r) =>
      [r.rank, csvCell(r.name), csvCell(r.email), r.total, r.max, csvCell(r.submitted_at)].join(','),
    ),
  ];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="results.csv"');
  res.send(lines.join('\n'));
});

// The cohort: what the exam measured across every submission. The weakest
// skill comes first - that is what the cohort has to work on.
async function cohort(eventId) {
  const { rows } = await q(
    `SELECT id FROM papers
      WHERE status = 'submitted' AND ($1::uuid IS NULL OR event_id = $1::uuid)`,
    [eventId],
  );
  const ids = rows.map((r) => r.id);
  const byPaper = await competencyByPaper(ids);
  const summary = cohortOf(byPaper);
  return {
    event_id: eventId,
    students: ids.length,
    analysed: byPaper.size,
    skills: summary.skills,
    difficulties: summary.difficulties,
  };
}

router.get('/analytics', async (req, res) => {
  res.json(await cohort(eventIdFromQuery(req.query.event_id)));
});

router.get('/analytics.csv', async (req, res) => {
  const data = await cohort(eventIdFromQuery(req.query.event_id));
  const lines = ['dimension,key,label,category,total,answered,correct,accuracy'];
  for (const s of data.skills) {
    lines.push(['skill', s.code || '', csvCell(s.name), csvCell(s.category || ''), s.total, s.answered, s.correct, s.accuracy ?? ''].join(','));
  }
  for (const d of data.difficulties) {
    lines.push(['difficulty', d.level, d.label, '', d.total, d.answered, d.correct, d.accuracy ?? ''].join(','));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="competency.csv"');
  res.send(lines.join('\n'));
});

export default wrapRouter(router);
