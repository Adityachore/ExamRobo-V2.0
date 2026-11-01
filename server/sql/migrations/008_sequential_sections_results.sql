-- Migration 008: sequential section completion and result publication.
--
-- Re-applied on every boot, so every statement must be idempotent.

ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS results_published boolean NOT NULL DEFAULT false;
ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS results_published_at timestamptz;
ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS results_published_by text;

ALTER TABLE paper_sections ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE papers ADD COLUMN IF NOT EXISTS result_snapshot jsonb;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS result_graded_at timestamptz;

DELETE FROM feedback older
USING feedback newer
WHERE older.paper_id = newer.paper_id
  AND older.id <> newer.id
  AND (older.created_at, older.id) < (newer.created_at, newer.id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_paper_unique ON feedback (paper_id);

CREATE INDEX IF NOT EXISTS idx_paper_sections_active
  ON paper_sections (paper_id, position)
  WHERE completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_papers_active_event
  ON papers (event_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_papers_submitted_event
  ON papers (event_id, submitted_at DESC)
  WHERE status = 'submitted';

CREATE INDEX IF NOT EXISTS idx_paper_questions_category
  ON paper_questions (paper_id, category);
