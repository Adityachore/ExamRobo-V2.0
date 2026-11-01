import { q } from '../db.js';

const asDate = (value) => (value ? new Date(value) : null);

// A section is unlocked only while it is the active section. A section that was
// never started, was completed, or ran out of time is locked for navigation.
export function sectionViewOf(row, now = Date.now()) {
  const endsAt = asDate(row.ends_at);
  const completedAt = asDate(row.completed_at);
  const startedAt = asDate(row.started_at);
  const expired = !!endsAt && endsAt.getTime() <= now;
  const state = completedAt
    ? 'completed'
    : !startedAt
      ? 'locked'
      : expired
        ? 'expired'
        : 'active';
  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt.getTime() - now) / 1000)) : null;
  return {
    category: row.category,
    position: Number(row.position),
    limit_min: Number(row.limit_min),
    state,
    started_at: row.started_at || null,
    ends_at: row.ends_at || null,
    completed_at: row.completed_at || null,
    remaining_sec: remaining,
    locked: state !== 'active',
  };
}

export async function paperSectionRows(paperId, db = q) {
  const { rows } = await db(
    `SELECT paper_id, position, category, limit_min, started_at, ends_at, completed_at
       FROM paper_sections WHERE paper_id = $1 ORDER BY position`,
    [paperId],
  );
  return rows;
}

export function mergeSectionState(manifestSections, rows, now = Date.now()) {
  const byCategory = new Map(rows.map((row) => [row.category, row]));
  return manifestSections.map((section) => {
    const row = byCategory.get(section.name);
    return {
      ...section,
      timing: row ? sectionViewOf(row, now) : null,
    };
  });
}

export async function categoryAt(paper, index) {
  const { rows } = await q(
    `SELECT COALESCE(pq.category, qq.category) AS category
       FROM papers p
       LEFT JOIN paper_questions pq ON pq.paper_id = p.id AND pq.qno = $2
       LEFT JOIN question_variants v ON v.id = p.variant_ids[$2::int + 1]
       LEFT JOIN questions qq ON qq.id = v.question_id
      WHERE p.id = $1`,
    [paper.id, index],
  );
  return rows[0]?.category || null;
}

export function activeSection(rows, now = Date.now()) {
  return rows.find((row) => {
    if (!row.started_at || row.completed_at) return false;
    return !row.ends_at || new Date(row.ends_at).getTime() > now;
  }) || null;
}

// Only the active section may be read or answered. This is checked on every
// question and answer request, so a modified client cannot jump ahead or return
// to a finished section.
export async function sectionAccess(paper, category) {
  if (!category) return { ok: true, section: null };
  const rows = await paperSectionRows(paper.id);
  if (!rows.length) return { ok: true, section: null };

  const now = Date.now();
  const active = activeSection(rows, now);
  const target = rows.find((row) => row.category === category) || null;

  if (!active) {
    const pending = rows.find((row) => !row.started_at && !row.completed_at);
    return {
      ok: false,
      code: pending ? 'section_locked' : 'section_expired',
      section: sectionViewOf(target || pending || rows[rows.length - 1], now),
      active_section: null,
    };
  }

  if (!target || target.category !== active.category) {
    return {
      ok: false,
      code: target?.completed_at ? 'section_completed' : 'section_locked',
      section: sectionViewOf(target || active, now),
      active_section: sectionViewOf(active, now),
    };
  }

  return { ok: true, section: sectionViewOf(active, now) };
}

export async function sectionStateForPaper(paperId, manifestSections) {
  const rows = await paperSectionRows(paperId);
  return mergeSectionState(manifestSections, rows);
}

export function sectionBlockedResponse(res, access) {
  const section = access?.section?.category || 'this section';
  const message = access?.code === 'section_completed'
    ? `${section} is already finished.`
    : `Finish the current section before opening ${section}.`;
  return res.status(access?.code === 'section_completed' ? 409 : 403).json({
    error: message,
    code: access?.code || 'section_locked',
    section: access?.section?.category || null,
    active_section: access?.active_section?.category || null,
  });
}

export function sectionExpiredResponse(res, section) {
  return res.status(403).json({
    error: `The time for ${section?.category || 'this section'} has ended.`,
    code: 'section_expired',
    section: section?.category || null,
  });
}
