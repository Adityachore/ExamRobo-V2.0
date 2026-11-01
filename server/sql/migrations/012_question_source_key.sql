-- Stable identity for imported questions. The bank repeats a stem across
-- difficulty tiers with shuffled options, so a stem hash is not unique; the
-- source id (FE-001, BE-021, ...) is. The column is nullable because questions
-- authored in the admin UI have no external source.
--
-- Re-applied on every boot, so every statement must be idempotent.

ALTER TABLE questions ADD COLUMN IF NOT EXISTS source_key text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_source_key
  ON questions (source_key)
  WHERE source_key IS NOT NULL;
