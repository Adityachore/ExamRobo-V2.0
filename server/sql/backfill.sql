-- Reconstruct the frozen competency of the papers that ran before the
-- taxonomy existed.
--
-- A paper freezes the competency of its questions when it is created
-- (server/services/paper.js). The papers of the exams that ran before
-- migration 004 have no such snapshot, so there is nothing to report about
-- what they measured. This file rebuilds that snapshot from the competency
-- the questions carry today.
--
-- It is an APPROXIMATION and it is honest about it: the tags are today's
-- tags, not the tags of the day the exam ran. Nothing else is invented - the
-- variants, the order and the skills are the real ones. The result is
-- frozen from now on, like any other paper.
--
-- It runs after the taxonomy (scripts/migrate.js applies sql/taxonomy.sql
-- first), because the skill code is read from the skills table.
--
-- Idempotent: a paper that already has a snapshot is left alone, and
-- ON CONFLICT keeps the insert safe if it runs twice.

INSERT INTO paper_questions
  (paper_id, qno, variant_id, skill_id, skill_code, difficulty, institution_id)
SELECT p.id, t.ord - 1, t.variant_id, qq.skill_id, s.code, qq.difficulty, p.institution_id
  FROM papers p
  CROSS JOIN LATERAL unnest(p.variant_ids) WITH ORDINALITY AS t(variant_id, ord)
  JOIN question_variants v ON v.id = t.variant_id
  JOIN questions qq ON qq.id = v.question_id
  LEFT JOIN skills s ON s.id = qq.skill_id
 WHERE NOT EXISTS (SELECT 1 FROM paper_questions pq WHERE pq.paper_id = p.id)
ON CONFLICT (paper_id, qno) DO NOTHING;

-- The domain (the category) of every question of every paper, frozen the same
-- way the skill and the difficulty are. The sections of a paper are its
-- domains, and a paper that ran before the domain selection existed must not
-- change its sections because the bank was re-tagged. Same approximation as
-- above: today's category, not the category of the day the exam ran.
UPDATE paper_questions pq
   SET category = qq.category
  FROM question_variants v
  JOIN questions qq ON qq.id = v.question_id
 WHERE v.id = pq.variant_id
   AND pq.category IS NULL;
