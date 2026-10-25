import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import fs from 'node:fs/promises';
import { q } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { sessionViews, sessionViewById, eventViews, eventViewOf, feedViews, recordingViews } from '../services/views.js';
import { gradePaper, gradeMany } from '../services/grading.js';
import { competencyByPaper, cohortOf } from '../services/analytics.js';
import { submitPaper, logProctorEvent } from '../services/sessions.js';
import { lockPaper } from '../services/integrity.js';
import { toStudent } from '../services/live.js';
import { CATEGORIES } from '../services/competency.js';

const router = Router();
router.use(requireAdmin);


const emailRe = /^\S+@\S+\.\S+$/;
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const normalize = (email) => String(email || '').trim().toLowerCase();

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

// ---------------------------------------------------------------- events

router.get('/events', async (_req, res) => {
  res.json({ events: await eventViews(), server_time: new Date().toISOString() });
});

router.post('/events', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const startsAt = req.body?.starts_at;
  const durationMin = Number(req.body?.duration_min);
  const config =
    req.body?.config && typeof req.body.config === 'object' && !Array.isArray(req.body.config)
      ? req.body.config
      : {};

  // Domain selection (R-015). A domain-aware event lets the student choose
  // the technical domains; the common categories are always included.
  const domainMode = req.body?.domain_mode === 'select' ? 'select' : 'fixed';
  const rulesIn = req.body?.domain_rules && typeof req.body.domain_rules === 'object' ? req.body.domain_rules : {};
  const domainRules =
    domainMode === 'select'
      ? {
          common: (Array.isArray(rulesIn.common) ? rulesIn.common : []).filter((c) => typeof c === 'string' && c),
          allowed: (Array.isArray(rulesIn.allowed) ? rulesIn.allowed : []).filter((c) => typeof c === 'string' && c),
          min: Number(rulesIn.min) > 0 ? Number(rulesIn.min) : 1,
          max: Number(rulesIn.max) > 0 ? Number(rulesIn.max) : 1,
        }
      : {};

  const fields = {};
  if (!name) fields.name = 'Name is required.';

  if (!startsAt || Number.isNaN(Date.parse(startsAt))) {
    fields.starts_at = 'Start date and time are required.';
  }
  if (!(durationMin > 0)) fields.duration_min = 'Duration must be greater than 0 minutes.';
  if (!Object.keys(config).length) {
    fields.config = 'Add at least one category.';
  } else {
    const { rows } = await q(`SELECT DISTINCT category FROM questions`);
    const known = new Set([...CATEGORIES, ...rows.map((r) => r.category)]);
    for (const [category, count] of Object.entries(config)) {
      if (!known.has(category)) {
        fields.config = `Unknown category: ${category}.`;
        break;
      }
      if (!(Number(count) > 0)) {
        fields.config = `Question count for ${category} must be at least 1.`;
        break;
      }
    }
  }
  if (Object.keys(fields).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fields });
  }

  // A domain-aware event needs at least one selectable domain, and every
  // common category and every selectable domain needs a question count.
  if (domainMode === 'select') {
    if (!domainRules.allowed.length) {
      fields.domain_rules = 'Choose at least one technical domain the student may pick.';
    }
    if (domainRules.max < domainRules.min) {
      fields.domain_rules = 'The maximum number of domains must not be smaller than the minimum.';
    }
    const needed = [...new Set([...domainRules.common, ...domainRules.allowed])];
    for (const category of needed) {
      if (!(Number(config[category] || 0) > 0)) {
        fields.domain_rules = `Set a question count for ${category} - it is part of the domain selection.`;
        break;
      }
    }
  }
  if (Object.keys(fields).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fields });
  }

  const categories =
    domainMode === 'select'
      ? [...new Set([...domainRules.common, ...domainRules.allowed])]
      : Object.keys(config);

  const { rows } = await q(
    `INSERT INTO exam_events (name, starts_at, duration_min, categories, question_counts, domain_mode, domain_rules)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      name,
      new Date(startsAt),
      durationMin,
      categories,
      config,
      domainMode,
      domainRules,
    ],
  );
  res.status(201).json({ event: eventViewOf({ ...rows[0], roster_count: 0 }) });
});


// ---------------------------------------------------------------- roster

router.get('/events/:id/roster', async (req, res) => {
  const { rows: events } = await q(`SELECT * FROM exam_events WHERE id = $1`, [req.params.id]);
  if (!events.length) return res.status(404).json({ error: 'Event not found.' });

  const { rows } = await q(
    `SELECT email, name, updated_at FROM roster_emails WHERE event_id = $1 ORDER BY email`,
    [req.params.id],
  );
  res.json({ roster: rows, roster_updated_at: events[0].roster_updated_at });
});

router.post('/events/:id/roster', async (req, res) => {
  const { rows: events } = await q(`SELECT * FROM exam_events WHERE id = $1`, [req.params.id]);
  if (!events.length) return res.status(404).json({ error: 'Event not found.' });

  const lines = String(req.body?.text || '').split(/\r?\n/);
  let added = 0;
  let updated = 0;
  const invalid = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;
    const parts = raw.split(/[,\t;]/).map((p) => p.trim());
    const email = (parts[0] || '').toLowerCase();
    const name = parts.slice(1).join(' ').trim() || email.split('@')[0];
    if (!emailRe.test(email)) {
      invalid.push({ line: i + 1, value: raw });
      continue;
    }
    const { rows: existing } = await q(
      `SELECT id FROM roster_emails WHERE event_id = $1 AND email = $2`,
      [req.params.id, email],
    );
    if (existing.length) {
      await q(
        `UPDATE roster_emails SET name = $3, updated_at = now() WHERE event_id = $1 AND email = $2`,
        [req.params.id, email, name],
      );
      updated++;
    } else {
      await q(
        `INSERT INTO roster_emails (event_id, email, name, updated_at) VALUES ($1,$2,$3,now())`,
        [req.params.id, email, name],
      );
      added++;
    }
  }

  if (added || updated) {
    await q(`UPDATE exam_events SET roster_updated_at = now() WHERE id = $1`, [req.params.id]);
  }
  const { rows: fresh } = await q(`SELECT roster_updated_at FROM exam_events WHERE id = $1`, [req.params.id]);
  res.json({ added, updated, invalid, roster_updated_at: fresh[0].roster_updated_at });
});

// ---------------------------------------------------------------- live

router.get('/live', async (_req, res) => {
  res.json({
    sessions: await sessionViews(),
    events: await feedViews(),
    server_time: new Date().toISOString(),
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


// ---------------------------------------------------------------- recordings

router.get('/recordings', async (req, res) => {
  res.json({ recordings: await recordingViews(eventIdFromQuery(req.query.event_id)) });
});

router.get('/recordings/:key/chunks/:seq', async (req, res) => {
  const paper = await paperFromKey(req.params.key);
  if (!paper) return res.status(404).json({ error: 'Chunk missing.' });

  const seq = Number(req.params.seq);
  const { rows } = await q(
    `SELECT path, mime FROM recordings WHERE paper_id = $1 AND chunk_no = $2`,
    [paper.id, seq],
  );
  if (!rows.length) return res.status(404).json({ error: 'Chunk missing.' });

  let data;
  try {
    data = await fs.readFile(rows[0].path);
  } catch {
    return res.status(404).json({ error: 'Chunk missing.' });
  }
  res.setHeader('Content-Type', rows[0].mime || 'video/webm');
  res.send(data);
});

export default wrapRouter(router);
