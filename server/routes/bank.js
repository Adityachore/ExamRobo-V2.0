import { Router } from 'express';
import { wrapRouter } from '../middleware/async.js';
import { q } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  CATEGORIES,
  DEFAULT_DIFFICULTY,
  difficultyLabel,
  difficultyScale,
  normalizeDifficulty,
  normalizeSkillCode,
  skillView,
  validateDifficulty,
  validateSkillCode,
  validateSkillName,
} from '../services/competency.js';

const router = Router();
router.use(requireAdmin);

const variantView = (v) => ({
  id: v.id,
  stem: v.stem,
  options: v.options,
  correct: v.correct_idx,
});

const questionView = (row) => {
  const variants = row.variants || [];
  return {
    id: row.id,
    category: row.category,
    title: variants[0]?.stem || '',
    variants: variants.map(variantView),
    active: row.active,
    created_at: row.created_at,
    skill: row.skill_code ? { code: row.skill_code, name: row.skill_name } : null,
    difficulty: Number(row.difficulty ?? DEFAULT_DIFFICULTY),
    difficulty_label: difficultyLabel(row.difficulty),
  };
};

const QUESTION_SELECT = `
  SELECT q.id, q.category, q.active, q.created_at, q.difficulty,
         s.code AS skill_code, s.name AS skill_name,
         COALESCE(
           json_agg(json_build_object('id', v.id, 'stem', v.stem, 'options', v.options, 'correct_idx', v.correct_idx)
                    ORDER BY v.id) FILTER (WHERE v.id IS NOT NULL),
           '[]'::json
         ) AS variants
    FROM questions q
    LEFT JOIN question_variants v ON v.question_id = q.id
    LEFT JOIN skills s ON s.id = q.skill_id`;

async function loadQuestion(id) {
  const { rows } = await q(
    `${QUESTION_SELECT} WHERE q.id = $1 GROUP BY q.id, s.code, s.name`,
    [id],
  );
  return rows.length ? questionView(rows[0]) : null;
}

function validateVariant(v) {
  if (!String(v?.stem || '').trim()) return 'Question text is required.';
  if (
    !Array.isArray(v.options) ||
    v.options.length !== 4 ||
    v.options.some((o) => !String(o).trim())
  ) {
    return 'Provide exactly four non-empty options.';
  }
  if (![0, 1, 2, 3].includes(v.correct)) return 'Select the correct option.';
  return null;
}

// The categories an admin can use: the fixed list plus anything the bank
// already contains.
async function knownCategories() {
  const { rows } = await q(`SELECT DISTINCT category FROM questions`);
  return [...new Set([...CATEGORIES, ...rows.map((r) => r.category)])];
}

// Resolves a skill code to its row. A code that does not exist is an error:
// tagging a question with a skill nobody can report on is worse than not
// tagging it at all.
async function skillByCode(code) {
  const normalized = normalizeSkillCode(code);
  if (!normalized) return null;
  const { rows } = await q(`SELECT id, code, name, category, description FROM skills WHERE code = $1`, [
    normalized,
  ]);
  return rows[0] || null;
}

// ---------------------------------------------------------------- categories

router.get('/categories', async (_req, res) => {
  const { rows } = await q(
    `SELECT category, count(*)::int AS count FROM questions WHERE active GROUP BY category`,
  );
  const counts = new Map(rows.map((r) => [r.category, r.count]));
  const names = [...new Set([...CATEGORIES, ...counts.keys()])];
  res.json({ categories: names.map((name) => ({ name, count: counts.get(name) || 0 })) });
});

// ---------------------------------------------------------------- skills

// The taxonomy plus the difficulty scale. A client never has to hard-code
// either of them.
router.get('/skills', async (_req, res) => {
  const { rows } = await q(
    `SELECT s.id, s.code, s.name, s.category, s.description,
            (SELECT count(*)::int FROM questions q WHERE q.skill_id = s.id AND q.active) AS question_count
       FROM skills s
      ORDER BY s.category, s.name`,
  );
  res.json({ skills: rows.map(skillView), difficulties: difficultyScale() });
});

router.post('/skills', async (req, res) => {
  const code = normalizeSkillCode(req.body?.code);
  const name = String(req.body?.name || '').trim();
  const category = String(req.body?.category || '').trim();
  const description = String(req.body?.description || '').trim() || null;

  const fields = {};
  const codeError = validateSkillCode(code);
  if (codeError) fields.code = codeError;
  const nameError = validateSkillName(name);
  if (nameError) fields.name = nameError;
  if (!category) fields.category = 'Category is required.';
  else if (!(await knownCategories()).includes(category)) {
    fields.category = `Unknown category: ${category}.`;
  }
  if (Object.keys(fields).length) {
    return res.status(400).json({ error: 'Please fix the highlighted fields.', fields });
  }

  const { rows: existing } = await q(`SELECT id FROM skills WHERE code = $1`, [code]);
  if (existing.length) {
    return res.status(409).json({ error: `The skill code "${code}" is already in use.`, code });
  }

  const { rows } = await q(
    `INSERT INTO skills (code, name, category, description) VALUES ($1,$2,$3,$4)
     RETURNING id, code, name, category, description`,
    [code, name, category, description],
  );
  res.status(201).json({ skill: skillView({ ...rows[0], question_count: 0 }) });
});

router.delete('/skills/:id', async (req, res) => {
  const { rows: found } = await q(`SELECT id, code FROM skills WHERE id = $1`, [req.params.id]);
  if (!found.length) return res.status(404).json({ error: 'Skill not found.' });

  // A skill a question uses cannot be deleted: the question would lose the
  // competency it is measured against.
  const { rows: used } = await q(
    `SELECT count(*)::int AS n FROM questions WHERE skill_id = $1`,
    [req.params.id],
  );
  if (used[0].n > 0) {
    return res.status(409).json({
      error: `This skill is used by ${used[0].n} question(s) and cannot be deleted.`,
      in_use: true,
    });
  }

  await q(`DELETE FROM skills WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

// ---------------------------------------------------------------- questions

router.get('/questions', async (req, res) => {
  const category = req.query.category ? String(req.query.category) : null;
  const skill = req.query.skill ? String(req.query.skill) : null;
  const difficulty =
    req.query.difficulty === undefined || req.query.difficulty === ''
      ? null
      : Number(req.query.difficulty);
  const { rows } = await q(
    `${QUESTION_SELECT}
      WHERE ($1::text IS NULL OR q.category = $1)
        AND ($2::text IS NULL OR s.code = $2)
        AND ($3::int IS NULL OR q.difficulty = $3)
      GROUP BY q.id, s.code, s.name
      ORDER BY q.created_at DESC`,
    [category, skill, difficulty],
  );
  res.json({ questions: rows.map(questionView) });
});

router.post('/questions', async (req, res) => {
  const category = String(req.body?.category || '').trim();
  if (!category) return res.status(400).json({ error: 'Category is required.' });

  const error = validateVariant(req.body?.variant);
  if (error) return res.status(400).json({ error });

  const difficultyError = validateDifficulty(req.body?.difficulty);
  if (difficultyError) return res.status(400).json({ error: difficultyError });

  let skillId = null;
  if (req.body?.skill) {
    const skill = await skillByCode(req.body.skill);
    if (!skill) {
      return res.status(400).json({ error: `Unknown skill: ${normalizeSkillCode(req.body.skill)}.` });
    }
    skillId = skill.id;
  }

  const variant = req.body.variant;
  const { rows: questions } = await q(
    `INSERT INTO questions (category, skill_id, difficulty) VALUES ($1,$2,$3)
     RETURNING id, category, active, created_at, difficulty`,
    [category, skillId, normalizeDifficulty(req.body?.difficulty)],
  );
  const question = questions[0];

  const { rows: variants } = await q(
    `INSERT INTO question_variants (question_id, stem, options, correct_idx)
     VALUES ($1,$2,$3,$4) RETURNING id, stem, options, correct_idx`,
    [
      question.id,
      String(variant.stem).trim(),
      variant.options.map((o) => String(o).trim()),
      Number(variant.correct),
    ],
  );

  res.status(201).json({
    // The same loader the other endpoints use, so the question comes back
    // with the skill and the difficulty it was created with.
    question: await loadQuestion(question.id),
  });
});

// The competency of a question: which skill it measures, how hard it is and
// which domain (its category) it belongs to. The question text and its
// variants stay immutable - this is the only way a question changes after it
// was created.
//
// Re-tagging the category does not rewrite an exam that already ran: the
// category is frozen with the paper (paper_questions.category).
router.post('/questions/:id/competency', async (req, res) => {
  const { rows: found } = await q(
    `SELECT id, skill_id, difficulty, category FROM questions WHERE id = $1`,
    [req.params.id],
  );
  if (!found.length) return res.status(404).json({ error: 'Question not found.' });

  const current = found[0];

  const difficultyError = validateDifficulty(req.body?.difficulty);
  if (difficultyError) return res.status(400).json({ error: difficultyError });

  let skillId = current.skill_id;
  if (req.body?.skill === null || req.body?.skill === '') {
    skillId = null;
  } else if (req.body?.skill !== undefined) {
    const skill = await skillByCode(req.body.skill);
    if (!skill) {
      return res.status(400).json({ error: `Unknown skill: ${normalizeSkillCode(req.body.skill)}.` });
    }
    skillId = skill.id;
  }

  const difficulty =
    req.body?.difficulty === undefined || req.body?.difficulty === ''
      ? current.difficulty
      : normalizeDifficulty(req.body.difficulty);

  let category = current.category;
  if (req.body?.category !== undefined && req.body?.category !== null && req.body?.category !== '') {
    const wanted = String(req.body.category).trim();
    if (!CATEGORIES.includes(wanted)) {
      return res.status(400).json({ error: `Unknown category: ${wanted}.` });
    }
    category = wanted;
  }

  await q(`UPDATE questions SET skill_id = $2, difficulty = $3, category = $4 WHERE id = $1`, [
    current.id,
    skillId,
    difficulty,
    category,
  ]);

  res.json({ question: await loadQuestion(current.id) });
});

router.post('/questions/:id/variants', async (req, res) => {
  const { rows: questions } = await q(`SELECT id FROM questions WHERE id = $1`, [req.params.id]);
  if (!questions.length) return res.status(404).json({ error: 'Question not found.' });

  const { rows: existing } = await q(
    `SELECT count(*)::int AS n FROM question_variants WHERE question_id = $1`,
    [req.params.id],
  );
  if (existing[0].n >= 4) {
    return res.status(409).json({ error: 'A question can have at most 4 variants.' });
  }

  const error = validateVariant(req.body);
  if (error) return res.status(400).json({ error });

  const { rows: variants } = await q(
    `INSERT INTO question_variants (question_id, stem, options, correct_idx)
     VALUES ($1,$2,$3,$4) RETURNING id, stem, options, correct_idx`,
    [
      req.params.id,
      String(req.body.stem).trim(),
      req.body.options.map((o) => String(o).trim()),
      Number(req.body.correct),
    ],
  );

  res.status(201).json({
    variant: variantView(variants[0]),
    question: await loadQuestion(req.params.id),
  });
});

router.delete('/variants/:id', async (req, res) => {
  // A variant that a paper uses cannot be deleted: the paper freezes its
  // variant ids, so removing one would drop the question from a live exam
  // and make an already submitted paper ungradable.
  const { rows: used } = await q(
    `SELECT p.id, p.status, p.email FROM papers p WHERE $1 = ANY(p.variant_ids) LIMIT 1`,
    [req.params.id],
  );
  if (used.length) {
    return res.status(409).json({
      error: used[0].status === 'active'
        ? 'This variant is in use by an exam that is still running. It cannot be deleted.'
        : 'This variant is in use by an exam that already ran. It cannot be deleted.',
      in_use: true,
    });
  }

  const { rows } = await q(
    `DELETE FROM question_variants WHERE id = $1 RETURNING question_id`,
    [req.params.id],
  );
  if (!rows.length) return res.status(404).json({ error: 'Variant not found.' });

  res.json({ ok: true, question: await loadQuestion(rows[0].question_id) });
});

// NOTE: no PATCH/PUT for questions or variants - intentionally missing, as in
// the contract. The competency of a question has its own endpoint.

export default wrapRouter(router);
