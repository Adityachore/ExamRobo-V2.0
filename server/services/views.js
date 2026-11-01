import { q } from '../db.js';
import { domainRules } from './domains.js';
import { paperMinuteRange, questionRange } from './event-config.js';

// Row -> API view builders. The API shapes are the contract the frontend
// (and the ported smoke test) depend on; the database keeps its own names.

// One live exam session as the proctor dashboard sees it.
export function sessionViewOf(r) {
  return {
    key: `${r.event_id}:${r.email}`,
    paper_id: r.id,
    event_id: r.event_id,
    email: r.email,
    name: r.name || r.email,
    status: r.status,
    current_index: r.current_index ?? 0,
    current_section: r.current_section ?? null,
    section_name: r.section_name || null,
    answered: Number(r.answered || 0),
    total: Number(r.total || 0),
    warnings: Number(r.warnings || 0),
    locked: r.submit_reason === 'integrity_lockout',
    lock_reason: r.lock_reason || null,
    submit_reason: r.submit_reason || null,
    violation_kinds: r.violation_kinds || [],
    started_at: r.started_at,
    ends_at: r.ends_at,
    last_seen_at: r.last_seen_at || null,
  };
}

// The columns every session view needs.
const SCOPE_COLUMNS = `
  id, event_id, email, status, current_index, started_at, ends_at, last_seen_at,
  submit_reason, lock_reason, cardinality(variant_ids)::int AS total,
  (SELECT s.position FROM paper_sections s
    WHERE s.paper_id = papers.id AND s.started_at IS NOT NULL AND s.completed_at IS NULL
    ORDER BY s.position LIMIT 1) AS current_section,
  (SELECT s.category FROM paper_sections s
    WHERE s.paper_id = papers.id AND s.started_at IS NOT NULL AND s.completed_at IS NULL
    ORDER BY s.position LIMIT 1) AS section_name`;

// The per-paper counts, aggregated once for the whole scope instead of once
// per paper. Six correlated subqueries per paper turned the live dashboard
// into a 100 ms query; three index scans over the scope do the same work.
const SCOPE_AGGREGATES = `
  answered AS (
    SELECT paper_id, count(*)::int AS answered
      FROM answers WHERE paper_id IN (SELECT id FROM scope) GROUP BY paper_id
  ),
  warned AS (
    SELECT paper_id, count(*)::int AS warnings, array_agg(DISTINCT kind) AS violation_kinds
      FROM warnings WHERE paper_id IN (SELECT id FROM scope) GROUP BY paper_id
  )`;

const SESSION_SELECT = `
  WITH scope AS (SELECT ${SCOPE_COLUMNS} FROM papers %SCOPE%),
       ${SCOPE_AGGREGATES}
  SELECT s.id, s.event_id, s.email, s.status, s.current_index, s.started_at, s.ends_at, s.last_seen_at,
         s.submit_reason, s.lock_reason, s.total, s.current_section, s.section_name,
         COALESCE(r.name, s.email) AS name,
         COALESCE(a.answered, 0) AS answered,
         COALESCE(w.warnings, 0) AS warnings,
         w.violation_kinds
    FROM scope s
    LEFT JOIN answered a ON a.paper_id = s.id
    LEFT JOIN warned w ON w.paper_id = s.id
    LEFT JOIN roster_emails r ON r.event_id = s.event_id AND r.email = s.email`;

const sessionQuery = (scope) => SESSION_SELECT.replace('%SCOPE%', scope);

export async function sessionViews(options = 200) {
  const opts = typeof options === 'number' ? { limit: options } : options || {};
  const limit = Math.min(200, Math.max(1, Number(opts.limit) || 50));
  const offset = Math.max(0, Number(opts.offset) || 0);
  const params = [];
  const where = [];

  if (opts.eventId) {
    params.push(opts.eventId);
    where.push(`event_id = $${params.length}`);
  }
  if (opts.status) {
    params.push(opts.status);
    where.push(`status = $${params.length}`);
  }
  if (opts.search) {
    params.push(`%${String(opts.search).trim()}%`);
    where.push(`(email ILIKE $${params.length} OR EXISTS (
      SELECT 1 FROM roster_emails r
       WHERE r.event_id = papers.event_id AND r.email = papers.email AND r.name ILIKE $${params.length}
    ))`);
  }

  const filter = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const pageParams = [...params, limit, offset];
  const { rows } = await q(
    sessionQuery(`${filter} ORDER BY started_at DESC LIMIT $${pageParams.length - 1} OFFSET $${pageParams.length}`),
    pageParams,
  );
  const { rows: totalRows } = await q(
    `SELECT count(*)::int AS total FROM papers ${filter}`,
    params,
  );
  return { sessions: rows.map(sessionViewOf), total: totalRows[0].total };
}

export async function sessionViewById(id) {
  const { rows } = await q(sessionQuery('WHERE id = $1'), [id]);
  return rows.length ? sessionViewOf(rows[0]) : null;
}

// Exam event as the admin screens see it.
export function eventViewOf(r) {
  const config = r.question_counts || {};
  const rules = domainRules(r);
  const limits = r.section_limits || {};
  const duration = Number(r.duration_min);
  const range = questionRange(r);
  const paperRange = paperMinuteRange(r);
  const startsAt = new Date(r.starts_at);
  return {
    id: r.id,
    name: r.name,
    starts_at: r.starts_at,
    ends_at: new Date(startsAt.getTime() + duration * 60000).toISOString(),
    duration_min: duration,
    categories: r.categories,
    config,
    question_counts: config,
    section_limits: limits,
    // Domain selection: 'fixed' or 'select', plus the rules of the event.
    domain_mode: rules.mode,
    domain_rules: rules.mode === 'select' ? { common: rules.common, allowed: rules.allowed, min: rules.min, max: rules.max } : null,
    paper_minutes: paperRange.max,
    min_paper_minutes: paperRange.min,
    roster_updated_at: r.roster_updated_at,
    roster_count: Number(r.roster_count || 0),
    paper_count: Number(r.paper_count || 0),
    has_started: Number(r.paper_count || 0) > 0,
    total_questions: range.max,
    min_questions: range.min,
    max_questions: range.max,
    instructions: r.instructions,
    results_visibility: r.results_visibility || 'manual',
    results_published: !!r.results_published,
    results_published_at: r.results_published_at || null,
    results_published_by: r.results_published_by || null,
    results_expires_at: r.results_expires_at || null,
    created_at: r.created_at,
  };
}

export async function eventViews() {
  const { rows } = await q(
    `SELECT e.*,
            (SELECT count(*) FROM roster_emails r WHERE r.event_id = e.id AND r.removed_at IS NULL)::int AS roster_count,
            (SELECT count(*) FROM papers p WHERE p.event_id = e.id)::int AS paper_count
       FROM exam_events e
      ORDER BY e.starts_at DESC`,
  );
  return rows.map(eventViewOf);
}

// Proctor event log (the durable feed behind the live dashboard).
export async function feedViews(limit = 100, paperId = null) {
  const { rows } = await q(
    `SELECT id, event_id, paper_id, email, name, kind, detail, created_at
       FROM proctor_events
      WHERE ($2::uuid IS NULL OR paper_id = $2)
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit, paperId],
  );
  return rows.map((r) => ({
    id: r.id,
    event_id: r.event_id,
    paper_id: r.paper_id,
    at: r.created_at,
    email: r.email,
    name: r.name || r.email,
    kind: r.kind,
    detail: r.detail || '',
  }));
}

