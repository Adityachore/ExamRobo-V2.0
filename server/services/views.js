import { q } from '../db.js';
import { domainRules } from './domains.js';

// Row -> API view builders. The API shapes are the contract the frontend
// (and the ported smoke test) depend on; the database keeps its own names.

// One live exam session as the proctor dashboard sees it.
export function sessionViewOf(r) {
  const chunkCount = Number(r.chunk_count || 0);
  const maxChunk = Number(r.max_chunk ?? -1);
  return {
    key: `${r.event_id}:${r.email}`,
    event_id: r.event_id,
    email: r.email,
    name: r.name || r.email,
    status: r.status,
    current_index: r.current_index ?? 0,
    answered: Number(r.answered || 0),
    total: Number(r.total || 0),
    warnings: Number(r.warnings || 0),
    locked: r.submit_reason === 'integrity_lockout',
    lock_reason: r.lock_reason || null,
    submit_reason: r.submit_reason || null,
    violation_kinds: r.violation_kinds || [],
    last_chunk_at: r.last_chunk_at || null,
    chunk_count: chunkCount,
    gaps: maxChunk + 1 - chunkCount,
    started_at: r.started_at,
    ends_at: r.ends_at,
    last_seen_at: r.last_seen_at || null,
  };
}

// The columns every session view needs.
const SCOPE_COLUMNS = `
  id, event_id, email, status, current_index, started_at, ends_at, last_seen_at,
  submit_reason, lock_reason, cardinality(variant_ids)::int AS total`;

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
  ),
  recorded AS (
    SELECT paper_id, count(*)::int AS chunk_count,
           max(chunk_no) AS max_chunk, max(created_at) AS last_chunk_at
      FROM recordings WHERE paper_id IN (SELECT id FROM scope) GROUP BY paper_id
  )`;

const SESSION_SELECT = `
  WITH scope AS (SELECT ${SCOPE_COLUMNS} FROM papers %SCOPE%),
       ${SCOPE_AGGREGATES}
  SELECT s.id, s.event_id, s.email, s.status, s.current_index, s.started_at, s.ends_at, s.last_seen_at,
         s.submit_reason, s.lock_reason, s.total,
         COALESCE(r.name, s.email) AS name,
         COALESCE(a.answered, 0) AS answered,
         COALESCE(w.warnings, 0) AS warnings,
         COALESCE(c.chunk_count, 0) AS chunk_count,
         COALESCE(c.max_chunk, -1) AS max_chunk,
         c.last_chunk_at,
         w.violation_kinds
    FROM scope s
    LEFT JOIN answered a ON a.paper_id = s.id
    LEFT JOIN warned w ON w.paper_id = s.id
    LEFT JOIN recorded c ON c.paper_id = s.id
    LEFT JOIN roster_emails r ON r.event_id = s.event_id AND r.email = s.email`;

const sessionQuery = (scope) => SESSION_SELECT.replace('%SCOPE%', scope);

export async function sessionViews(limit = 200) {
  const { rows } = await q(sessionQuery('ORDER BY started_at DESC LIMIT $1'), [limit]);
  return rows.map(sessionViewOf);
}

export async function sessionViewById(id) {
  const { rows } = await q(sessionQuery('WHERE id = $1'), [id]);
  return rows.length ? sessionViewOf(rows[0]) : null;
}

// Exam event as the admin screens see it.
export function eventViewOf(r) {
  const config = r.question_counts || {};
  const rules = domainRules(r);
  return {
    id: r.id,
    name: r.name,
    starts_at: r.starts_at,
    ends_at: new Date(new Date(r.starts_at).getTime() + Number(r.duration_min) * 60000).toISOString(),
    duration_min: r.duration_min,
    categories: r.categories,
    config,
    question_counts: config,
    // Domain selection: 'fixed' or 'select', plus the rules of the event.
    domain_mode: rules.mode,
    domain_rules: rules.mode === 'select' ? { common: rules.common, allowed: rules.allowed, min: rules.min, max: rules.max } : null,
    roster_updated_at: r.roster_updated_at,
    roster_count: Number(r.roster_count || 0),
    total_questions: Object.values(config).reduce((a, b) => a + Number(b || 0), 0),
    instructions: r.instructions,
    created_at: r.created_at,
  };
}

export async function eventViews() {
  const { rows } = await q(
    `SELECT e.*, (SELECT count(*) FROM roster_emails r WHERE r.event_id = e.id)::int AS roster_count
       FROM exam_events e
      ORDER BY e.starts_at DESC`,
  );
  return rows.map(eventViewOf);
}

// Proctor event log (the durable feed behind the live dashboard).
export async function feedViews(limit = 100) {
  const { rows } = await q(
    `SELECT id, event_id, paper_id, email, name, kind, detail, created_at
       FROM proctor_events
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({
    id: r.id,
    at: r.created_at,
    email: r.email,
    name: r.name || r.email,
    kind: r.kind,
    detail: r.detail || '',
  }));
}

// Recording chunks per student, including the gaps (never hidden).
export async function recordingViews(eventId = null) {
  const { rows } = await q(
    `SELECT p.id, p.event_id, p.email, p.started_at,
            COALESCE(r.name, p.email) AS name,
            count(c.id)::int AS chunk_count,
            COALESCE(max(c.chunk_no), -1)::int AS max_chunk,
            COALESCE(array_agg(c.chunk_no ORDER BY c.chunk_no) FILTER (WHERE c.chunk_no IS NOT NULL), '{}') AS seqs,
            max(c.created_at) AS last_chunk_at,
            (SELECT c2.mime FROM recordings c2 WHERE c2.paper_id = p.id ORDER BY c2.chunk_no LIMIT 1) AS mime
       FROM papers p
       LEFT JOIN recordings c ON c.paper_id = p.id
       LEFT JOIN roster_emails r ON r.event_id = p.event_id AND r.email = p.email
      WHERE ($1::uuid IS NULL OR p.event_id = $1::uuid)
      GROUP BY p.id, r.name
      ORDER BY p.started_at DESC
      LIMIT 200`,
    [eventId],
  );
  return rows.map((r) => {
    const chunkCount = Number(r.chunk_count || 0);
    const maxChunk = Number(r.max_chunk ?? -1);
    return {
      key: `${r.event_id}:${r.email}`,
      event_id: r.event_id,
      email: r.email,
      name: r.name || r.email,
      chunk_count: chunkCount,
      expected_chunks: maxChunk + 1,
      gap_count: maxChunk + 1 - chunkCount,
      seqs: r.seqs || [],
      mime: r.mime || null,
      last_chunk_at: r.last_chunk_at || null,
      approx_duration_sec: (maxChunk + 1) * 10,
    };
  });
}
