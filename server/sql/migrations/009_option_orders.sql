-- Migration 009: per-paper option order and paper duration.
--
-- Re-applied on every boot, so every statement must be idempotent.
--
-- option_orders[qno] is the display order of the authored option indexes for
-- that question. A legacy paper has an empty array and is displayed in the
-- authored order. answers.choice stores the displayed index; grading maps it
-- back through this array before comparing with question_variants.correct_idx.

ALTER TABLE papers ADD COLUMN IF NOT EXISTS duration_min int;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS option_orders jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE papers
   SET duration_min = GREATEST(
         1,
         ROUND(EXTRACT(EPOCH FROM (ends_at - started_at)) / 60)::int
       )
 WHERE duration_min IS NULL
   AND started_at IS NOT NULL
   AND ends_at IS NOT NULL;
