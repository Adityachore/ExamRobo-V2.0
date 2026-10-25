-- Migration 001: flags keep the event they were raised against.
-- A student flag needs BOTH the student (subject_id) and the event
-- (event_id); before this the event context was lost.
ALTER TABLE flags ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES exam_events(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_flags_event ON flags (event_id);
