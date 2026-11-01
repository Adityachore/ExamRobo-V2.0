import { q } from '../db.js';
import { domainRules, plannedCategories, validateSelection } from './domains.js';
import { paperDuration } from './event-config.js';

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
  const optionOrders = [];

  for (const category of categories) {
    const want = Number(counts[category] || 0);
    if (want <= 0) continue;

    const { rows } = await q(
      `SELECT v.id, v.question_id, cardinality(v.options)::int AS option_count
         FROM questions q JOIN question_variants v ON v.question_id = q.id
        WHERE q.category = $1 AND q.active
        ORDER BY v.id`,
      [category],
    );

    const byQuestion = new Map();
    for (const r of rows) {
      if (!byQuestion.has(r.question_id)) byQuestion.set(r.question_id, []);
      byQuestion.get(r.question_id).push({ id: r.id, optionCount: Number(r.option_count) });
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
      const chosen = variants[Math.floor(rng() * variants.length)];
      variantIds.push(chosen.id);
      const count = Number.isInteger(chosen.optionCount) && chosen.optionCount > 0
        ? chosen.optionCount
        : 4;
      optionOrders.push(shuffle([...Array(count).keys()], rng));
    }
    sections.push({ name: category, count: want });
  }

  if (!variantIds.length) throw insufficient('event has no configured questions');
  return { sections, variantIds, selected, optionOrders };
}

// Flat, ordered variant ids for an event.
export async function buildVariantIds(event, rng = Math.random) {
  const plan = await buildPaperPlan(event, rng);
  return plan.variantIds;
}

// Create the student's paper. Idempotent: one paper per (event, student).
// The event window only limits when a paper may start. Once created, the paper
// gets the full sum of its own section limits - a late starter loses nothing.
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
  const duration = paperDuration(event, plan.selected);
  const { rows } = await q(
    `WITH ins AS (
       INSERT INTO papers
         (event_id, email, variant_ids, started_at, ends_at, status,
          selected_categories, duration_min, option_orders)
       VALUES ($1, $2, $3, now(),
               now() + $4::int * interval '1 minute',
               'active', $5::text[], $4::int, $6::jsonb)
       ON CONFLICT (event_id, email) DO UPDATE SET variant_ids = papers.variant_ids
       RETURNING id, event_id, email, variant_ids, started_at, ends_at,
                current_index, status, submitted_at, submit_reason, score,
                selected_categories, duration_min, option_orders
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
    [
      event.id,
      email,
      plan.variantIds,
      duration,
      plan.selected,
      JSON.stringify(plan.optionOrders),
    ],
  );

  const paper = rows[0];
  const limits = event.section_limits || {};
  if (paper && plan.sections.length && Object.keys(limits).length) {
    for (let position = 0; position < plan.sections.length; position++) {
      const section = plan.sections[position];
      const limit = Number(limits[section.name]);
      if (!(limit > 0)) continue;
      await q(
        `INSERT INTO paper_sections (paper_id, position, category, limit_min)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (paper_id, category) DO NOTHING`,
        [paper.id, position, section.name, limit],
      );
    }

    // The first section is active from the moment the paper exists. Later
    // sections stay locked until the previous one is finished or times out.
    await q(
      `UPDATE paper_sections ps
          SET started_at = now(),
              ends_at = LEAST(now() + ps.limit_min * interval '1 minute', $2::timestamptz)
        WHERE ps.paper_id = $1
          AND ps.position = (
            SELECT min(position) FROM paper_sections WHERE paper_id = $1
          )
          AND NOT EXISTS (
            SELECT 1 FROM paper_sections started
             WHERE started.paper_id = $1 AND started.started_at IS NOT NULL
          )`,
      [paper.id, paper.ends_at],
    );
  }
  return paper;
}


// The frozen display order of the authored options, per question position.
async function loadOptionOrders(paperId) {
  const { rows } = await q(`SELECT option_orders FROM papers WHERE id = $1`, [paperId]);
  return Array.isArray(rows[0]?.option_orders) ? rows[0].option_orders : [];
}

// A legacy paper (or a question whose option count changed) falls back to the
// authored order, so nothing ever renders blank.
export function orderFor(orders, index, options) {
  const opts = Array.isArray(options) ? options : [];
  const order = Array.isArray(orders?.[index]) ? orders[index] : null;
  return order && order.length === opts.length ? order : opts.map((_, i) => i);
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
  const orderByQno = paperId ? await loadOptionOrders(paperId) : [];

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
    const order = orderFor(orderByQno, index, v.options);
    sections[sections.length - 1].questions.push({
      id: v.id,
      n: index,
      stem: v.stem,
      options: order.map((i) => v.options[i]),
      option_ids: order,
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
  const order = orderFor(paper.option_orders, index, row.options);
  return {
    id: row.id,
    n: index,
    section: row.category || 'Questions',
    stem: row.stem,
    options: order.map((i) => row.options[i]),
    option_ids: order,
  };
}
