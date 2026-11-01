// Results analytics: what an exam measured, per skill and per difficulty.
//
// The numbers come from the competency the paper FROZE (paper_questions), not
// from the questions as they are today: a question that is re-tagged after
// the exam ran must not rewrite the result of that exam. The answer key
// (correct_idx) stays on the server - only counts ever leave it.
//
// An unanswered question is not a wrong answer. `answers` has no row for a
// question the student skipped, so every bucket reports three numbers:
//   total    - the questions of the bucket in the paper
//   answered - the ones the student actually answered
//   correct  - the answered ones that were right
// `accuracy` is correct / total: the share of the exam's questions of that
// bucket that were answered right.

import { q } from '../db.js';
import { difficultyLabel } from './competency.js';

// The name of the bucket for a question that measures nothing.
export const UNTAGGED = 'Not tagged';

// One query for the whole scope: the frozen competency of every question of
// every paper, joined with the answer and with the key.
//
// The join is on the frozen row (paper_questions), so a question that was
// re-tagged or a skill that was renamed afterwards cannot change the numbers
// of an exam that already ran. A variant that a paper uses cannot be deleted,
// so the key is always there.
const COMPETENCY_ROWS = `
  SELECT pq.paper_id, pq.qno, pq.skill_code, pq.difficulty,
         s.name AS skill_name, s.category AS skill_category,
         (a.paper_id IS NOT NULL) AS answered,
         (a.choice IS NOT NULL
          AND COALESCE((p.option_orders -> pq.qno ->> a.choice)::int, a.choice) = v.correct_idx)
           AS is_correct
    FROM paper_questions pq
    JOIN papers p ON p.id = pq.paper_id
    JOIN question_variants v ON v.id = pq.variant_id
    LEFT JOIN answers a ON a.paper_id = pq.paper_id AND a.qno = pq.qno
    LEFT JOIN skills s ON s.code = pq.skill_code
   WHERE pq.paper_id = ANY($1::uuid[])
   ORDER BY pq.paper_id, pq.qno`;

// accuracy as a percentage with one decimal, or null when there is nothing to
// measure.
function accuracy(correct, total) {
  if (!total) return null;
  return Math.round((correct / total) * 1000) / 10;
}

// Group competency rows into a skill list and a difficulty list. Pure, so it
// can be tested without a database.
export function summarize(rows) {
  const skills = new Map();
  const difficulties = new Map();

  for (const r of rows) {
    // A question with no skill is still graded and still counted; it just
    // cannot be attributed to a skill.
    const code = r.skill_code ?? null;
    let skill = skills.get(code);
    if (!skill) {
      skill = {
        code,
        name: code ? r.skill_name || code : UNTAGGED,
        category: code ? r.skill_category || null : null,
        total: 0,
        answered: 0,
        correct: 0,
      };
      skills.set(code, skill);
    }
    skill.total += 1;
    if (r.answered) {
      skill.answered += 1;
      if (r.is_correct) skill.correct += 1;
    }

    const level = Number(r.difficulty) || 3;
    let difficulty = difficulties.get(level);
    if (!difficulty) {
      difficulty = { level, label: difficultyLabel(level), total: 0, answered: 0, correct: 0 };
      difficulties.set(level, difficulty);
    }
    difficulty.total += 1;
    if (r.answered) {
      difficulty.answered += 1;
      if (r.is_correct) difficulty.correct += 1;
    }
  }

  return {
    skills: [...skills.values()]
      .map((s) => ({ ...s, accuracy: accuracy(s.correct, s.total) }))
      .sort((a, b) => (a.category || '').localeCompare(b.category || '') || a.name.localeCompare(b.name)),
    difficulties: [...difficulties.values()]
      .map((d) => ({ ...d, accuracy: accuracy(d.correct, d.total) }))
      .sort((a, b) => a.level - b.level),
  };
}

// The competency of every paper in the scope, in one query. A paper without a
// frozen competency (it ran before the taxonomy existed) is simply missing
// from the map.
export async function competencyByPaper(paperIds) {
  if (!paperIds.length) return new Map();
  const { rows } = await q(COMPETENCY_ROWS, [paperIds]);
  const byPaper = new Map();
  for (const r of rows) {
    let list = byPaper.get(r.paper_id);
    if (!list) {
      list = [];
      byPaper.set(r.paper_id, list);
    }
    list.push(r);
  }
  const out = new Map();
  for (const [paperId, list] of byPaper) out.set(paperId, summarize(list));
  return out;
}

// The competency of one paper.
export async function competencyOfPaper(paperId) {
  const map = await competencyByPaper([paperId]);
  return map.get(paperId) || { skills: [], difficulties: [] };
}

// The cohort: the same numbers over every paper of the scope. The weakest
// skill comes first, because that is what the cohort has to work on.
export function cohortOf(byPaper) {
  const skills = new Map();
  const difficulties = new Map();

  for (const summary of byPaper.values()) {
    for (const s of summary.skills) {
      let row = skills.get(s.code);
      if (!row) {
        row = { code: s.code, name: s.name, category: s.category, total: 0, answered: 0, correct: 0 };
        skills.set(s.code, row);
      }
      row.total += s.total;
      row.answered += s.answered;
      row.correct += s.correct;
    }
    for (const d of summary.difficulties) {
      let row = difficulties.get(d.level);
      if (!row) {
        row = { level: d.level, label: d.label, total: 0, answered: 0, correct: 0 };
        difficulties.set(d.level, row);
      }
      row.total += d.total;
      row.answered += d.answered;
      row.correct += d.correct;
    }
  }

  return {
    skills: [...skills.values()]
      .map((s) => ({ ...s, accuracy: accuracy(s.correct, s.total) }))
      .sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101) || a.name.localeCompare(b.name)),
    difficulties: [...difficulties.values()]
      .map((d) => ({ ...d, accuracy: accuracy(d.correct, d.total) }))
      .sort((a, b) => a.level - b.level),
  };
}
