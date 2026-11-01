-- Deleting an event archives it instead of destroying the audit trail.
-- Papers, warnings, results and recordings stay attached to the event; the
-- event itself is hidden from every active flow and shown under Completed.
ALTER TABLE exam_events
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by text,
  ADD COLUMN IF NOT EXISTS delete_reason text;

CREATE INDEX IF NOT EXISTS idx_exam_events_deleted ON exam_events (deleted_at);
