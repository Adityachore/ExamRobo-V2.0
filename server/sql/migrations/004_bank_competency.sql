-- Migration 004: question bank v2 - the competency model.
--
-- Adds:
--   skills              - the taxonomy. A stable code, a name and the category
--                         the skill belongs to. The code is the key the API
--                         and the admin UI use, so a skill can be renamed
--                         without breaking anything that points at it.
--   questions.skill_id  - the skill a question measures.
--   questions.difficulty - how hard the question is: 1 (foundation) to 5
--                         (expert). The scale lives in
--                         server/services/competency.js.
--   paper_questions     - the competency frozen with the paper. A question
--                         that is re-tagged after an exam ran must never
--                         rewrite the history of that exam, so the paper
--                         keeps its own copy of the skill and the difficulty.
--                         The skill code is copied as text on purpose: a
--                         deleted or renamed skill must not change a result
--                         that was already produced.
--
-- Seeds the taxonomy so every environment starts with the same skills. The
-- seed itself lives in sql/taxonomy.sql: a TRUNCATE ... CASCADE follows the
-- foreign keys down to the skills table, so the taxonomy has to be a file
-- that can be re-applied on its own after a truncate.
--
-- This file is re-applied on every boot (scripts/migrate.js runs every file in
-- the folder each time), so every statement must be idempotent. The CHECK
-- constraint is dropped and re-added for the same reason.

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questions ADD COLUMN IF NOT EXISTS skill_id uuid REFERENCES skills(id) ON DELETE SET NULL;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty int NOT NULL DEFAULT 3;

ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_difficulty_check;
ALTER TABLE questions
  ADD CONSTRAINT questions_difficulty_check CHECK (difficulty BETWEEN 1 AND 5) NOT VALID;
ALTER TABLE questions VALIDATE CONSTRAINT questions_difficulty_check;

CREATE TABLE IF NOT EXISTS paper_questions (
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  qno int NOT NULL CHECK (qno >= 0),
  variant_id uuid NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE SET NULL,
  skill_code text,
  difficulty int NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  PRIMARY KEY (paper_id, qno)
);

CREATE INDEX IF NOT EXISTS idx_paper_questions_skill ON paper_questions (skill_id);
CREATE INDEX IF NOT EXISTS idx_paper_questions_difficulty ON paper_questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_skill ON questions (skill_id);
