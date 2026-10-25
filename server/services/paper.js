import { q } from '../db.js';
import { domainRules, plannedCategories, validateSelection } from './domains.js';

// Randomize with a swappable RNG for tests. Fisher-Yates.
export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function insufficient(message, category) {
  const err = new Error(message);
  err.code = 'insufficient_questions';
  err.category = category;
  return err;
}

// The selection of a domain-aware event is refused before anything is written.
// The paper is never created half-way, so the timer never starts for a
// selection the server did not accept.
function badSelection(message, code) {
  const err = new Error(message);
  err.code = code || 'invalid_domains';
  err.status = 400;
  return err;
}

// Paper plan: one variant per logical question, grouped by category.
// The flat order IS the global question index, so papers.variant_ids[i] is
// always the question the student sees as "question i + 1".
//
// A domain-aware event (domain_mode = 'select') assembles the common
// categories plus the technical domains the student chose. The selection is
// validated here, before a single question is picked.
export async function buildPaperPlan(event, rng = Math.random, selection = null) {
  const counts = event.question_counts || {};
  const rules = domainRules(event);

  let categories;
  let selected = [];
  if (rules.mode === 'select') {
    const check = validateSelection(event, selection);
    if (!check.ok) throw badSelection(check.error, check.code);
    selected = check.selected;
    categories = plannedCategories(event, selected);
  } else {
    categories = event.categories?.length ? event.categories : Object.keys(counts);
  }

  const sections = [];
  const variantIds = [];

  for (const category of categories) {
    const want = Number(counts[category] || 0);
    if (want <= 0) continue;

    const { rows } = await q(
      `SELECT v.id, v.question_id
         FROM questions q JOIN question_variants v ON v.question_id = q.id
        WHERE q.category = $1 AND q.active
        ORDER BY v.id`,
      [category],
    );

    const byQuestion = new Map();
    for (const r of rows) {
      if (!byQuestion.has(r.question_id)) byQuestion.set(r.question_id, []);
      byQuestion.get(r.question_id).push(r.id);
    }
    if (byQuestion.size === 0) {
      throw insufficient(`no questions for category '${category}'`, category);
    }

    const questionIds = shuffle([...byQuestion.keys()], rng);
    if (questionIds.length < want) {
      throw insufficient(
        `category '${category}' needs ${want} questions, only ${questionIds.length} available`,
        category,
      );
    }

    for (const questionId of questionIds.slice(0, want)) {
      const variants = byQuestion.get(questionId);
      variantIds.push(variants[Math.floor(rng() * variants.length)]);
    }
    sections.push({ name: category, count: want });
  }

  if (!variantIds.length) throw insufficient('event has no configured questions');
  return { sections, variantIds, selected };
}

// Flat, ordered variant ids for an event.
export async function buildVariantIds(event, rng = Math.random) {
  const plan = await buildPaperPlan(event, rng);
  return plan.variantIds;
}

// Create the student's paper. Idempotent: one paper per (event, student).
// The deadline is clamped to the event end, so a late starter can never get
// more time than the event window allows.
//
// The competency of every question is frozen with the paper: a question that
// is re-tagged after this exam ran must not change the result of an exam
// that already happened. The snapshot is written in the same statement as the
// paper, and it is never overwritten - a rejoin keeps the original tags.
//
// The domain of every question (its category) is frozen the same way, and so
// is the selection of a domain-aware event: the sections of a paper are its
// domains and they must not move when the bank changes.
export async function createPaper(event, email, rng = Math.random, selection = null) {
  const plan = await buildPaperPlan(event, rng, selection);
  const { rows } = await q(
    `WITH ins AS (
       INSERT INTO papers (event_id, email, variant_ids, started_at, ends_at, status, selected_categories)
       VALUES ($1, $2, $3, now(),
               LEAST(now() + $4::int * interval '1 minute',
                     $5::timestamptz + $4::int * interval '1 minute'),
               'active', $6::text[])
       ON CONFLICT (event_id, email) DO UPDATE SET variant_ids = papers.variant_ids
       RETURNING id, event_id, email, variant_ids, started_at, ends_at,
                current_index, status, submitted_at, submit_reason, score,
                selected_categories
     ), snap AS (
       INSERT INTO paper_questions (paper_id, qno, variant_id, skill_id, skill_code, difficulty, category)
       SELECT ins.id, t.ord - 1, t.variant_id, qq.skill_id, s.code, qq.difficulty, qq.category
         FROM ins
         CROSS JOIN LATERAL unnest(ins.variant_ids) WITH ORDINALITY AS t(variant_id, ord)
         JOIN question_variants v ON v.id = t.variant_id
         JOIN questions qq ON qq.id = v.question_id
         LEFT JOIN skills s ON s.id = qq.skill_id
       ON CONFLICT (paper_id, qno) DO NOTHING
       RETURNING paper_id
     )
     SELECT * FROM ins`,
    [event.id, email, plan.variantIds, event.duration_min, event.starts_at, plan.selected],
  );
  return rows[0];
}


// Hydrate a paper for the student: sections -> questions.
// NEVER exposes correct_idx.
//
// The sections are the domains of the paper. They come from the FROZEN
// snapshot (paper_questions.category), so re-tagging a question cannot move a
// section of an exam that already ran. A paper without a snapshot (a paper
// created before the domain selection existed) falls back to the category the
// question carries today.
export async function hydratePaper(variantIds, paperId = null) {

  if (!variantIds?.length) return { sections: [] };

  const { rows: frozen } = paperId
    ? await q(`SELECT qno, category FROM paper_questions WHERE paper_id = $1`, [paperId])
    : { rows: [] };
  const categoryByQno = new Map(frozen.map((r) => [Number(r.qno), r.category]));

  const { rows } = await q(
    `SELECT v.id, v.stem, v.options, qq.category
       FROM question_variants v JOIN questions qq ON qq.id = v.question_id
      WHERE v.id = ANY($1::uuid[])`,
    [variantIds],
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  const sections = [];
  variantIds.forEach((id, index) => {
    const v = byId.get(id);
    if (!v) return;
    const name = categoryByQno.get(index) || v.category;
    const last = sections[sections.length - 1];
    if (!last || last.name !== name) sections.push({ name, questions: [] });
    sections[sections.length - 1].questions.push({
      id: v.id,
      n: index,
      stem: v.stem,
      options: v.options,
    });
  });
  return { sections };
}

// The index the runner needs to draw the navigator. It deliberately carries
// no stem and no options: a question reaches the browser only when it is
// opened, one at a time.
export async function hydrateManifest(variantIds, paperId) {
  if (!variantIds?.length) return { sections: [], total: 0 };

  const { rows: frozen } = await q(
    `SELECT qno, category FROM paper_questions WHERE paper_id = $1`,
    [paperId],
  );
  const categoryByQno = new Map(frozen.map((r) => [Number(r.qno), r.category]));
  const missing = variantIds.filter((_, index) => !categoryByQno.has(index));

  if (missing.length) {
    const { rows } = await q(
      `SELECT v.id, qq.category
         FROM question_variants v JOIN questions qq ON qq.id = v.question_id
        WHERE v.id = ANY($1::uuid[])`,
      [missing],
    );
    const byVariant = new Map(rows.map((r) => [r.id, r.category]));
    variantIds.forEach((id, index) => {
      if (!categoryByQno.has(index) && byVariant.has(id)) {
        categoryByQno.set(index, byVariant.get(id));
      }
    });
  }

  const sections = [];
  variantIds.forEach((id, index) => {
    const name = categoryByQno.get(index) || 'Questions';
    const last = sections[sections.length - 1];
    if (!last || last.name !== name) sections.push({ name, questions: [] });
    sections[sections.length - 1].questions.push({ id, n: index });
  });
  return { sections, total: variantIds.length };
}

// One question, by its position in the paper. The category comes from the
// frozen snapshot so a re-tagged question cannot move a section of a paper
// that already started.
export async function hydrateQuestion(paper, index) {
  const variantId = paper.variant_ids?.[index];
  if (!variantId) return null;

  const { rows } = await q(
    `SELECT v.id, v.stem, v.options,
            COALESCE(pq.category, qq.category) AS category
       FROM question_variants v
       JOIN questions qq ON qq.id = v.question_id
       LEFT JOIN paper_questions pq ON pq.paper_id = $2 AND pq.qno = $3
      WHERE v.id = $1`,
    [variantId, paper.id, index],
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    n: index,
    section: row.category || 'Questions',
    stem: row.stem,
    options: row.options,
  };
}
