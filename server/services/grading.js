import { q } from '../db.js';

// Grade one submitted paper. correct_idx never leaves the server.
export async function gradePaper(paper) {
  const results = await gradeMany([paper]);
  return results.get(paper.id) || { total: 0, max: 0, sections: [] };
}

// Grade many papers with two queries (leaderboard / results view).
// Returns Map<paper_id, { total, max, sections }>.
export async function gradeMany(papers) {
  const out = new Map();
  if (!papers.length) return out;
  const ids = papers.map((p) => p.id);

  const { rows } = await q(
    // answers.qno is the 0-based position in papers.variant_ids, so the
    // ordinality has to be shifted down by one to line up.
    `SELECT p.id AS paper_id, ord.n::int - 1 AS qno, v.correct_idx,
            p.option_orders, cardinality(v.options) AS option_count,
            COALESCE(pq.category, qq.category) AS category
       FROM papers p
       CROSS JOIN LATERAL unnest(p.variant_ids) WITH ORDINALITY AS ord(vid, n)
       JOIN question_variants v ON v.id = ord.vid
       JOIN questions qq ON qq.id = v.question_id
       LEFT JOIN paper_questions pq
              ON pq.paper_id = p.id AND pq.qno = ord.n::int - 1
      WHERE p.id = ANY($1::uuid[])`,
    [ids],
  );
  const { rows: answerRows } = await q(
    `SELECT paper_id, qno, choice FROM answers WHERE paper_id = ANY($1::uuid[])`,
    [ids],
  );

  const choiceBy = new Map(answerRows.map((a) => [`${a.paper_id}:${a.qno}`, a.choice]));
  const sectionsBy = new Map();
  for (const r of rows) {
    let sections = sectionsBy.get(r.paper_id);
    if (!sections) {
      sections = [];
      sectionsBy.set(r.paper_id, sections);
    }
    const last = sections[sections.length - 1];
    if (!last || last.name !== r.category) sections.push({ name: r.category, score: 0, total: 0 });
    const section = sections[sections.length - 1];
    section.total += 1;
    const displayChoice = choiceBy.get(`${r.paper_id}:${r.qno}`);
    const order = Array.isArray(r.option_orders?.[r.qno]) ? r.option_orders[r.qno] : null;
    const validOrder = order && Number(r.option_count) === order.length ? order : null;
    const authoredChoice = validOrder && Number.isInteger(displayChoice)
      ? validOrder[displayChoice]
      : displayChoice;
    if (authoredChoice === r.correct_idx) section.score += 1;
  }

  for (const paper of papers) {
    const sections = sectionsBy.get(paper.id) || [];
    out.set(paper.id, {
      total: sections.reduce((a, s) => a + s.score, 0),
      max: sections.reduce((a, s) => a + s.total, 0),
      sections,
    });
  }
  return out;
}
