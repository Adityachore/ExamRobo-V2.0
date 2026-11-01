-- Migration 010: result visibility modes and manual expiry.
--
-- Re-applied on every boot, so every statement must be idempotent.
--
-- results_visibility is authoritative:
--   immediate            - visible as soon as the student submits
--   after_all_submitted  - visible once every existing paper is submitted
--   manual               - visible after an admin publishes, until expiry
--   never                - hidden from students
--
-- results_published is kept as a manual-mode compatibility mirror.
-- results_published_at / results_expires_at are authoritative for manual mode.
-- Existing events are manual. Previously published legacy rows keep their
-- publication timestamp and keep results_expires_at NULL (never auto-expire).

ALTER TABLE exam_events
  ADD COLUMN IF NOT EXISTS results_visibility text NOT NULL DEFAULT 'manual';
ALTER TABLE exam_events
  ADD COLUMN IF NOT EXISTS results_expires_at timestamptz;

ALTER TABLE exam_events
  DROP CONSTRAINT IF EXISTS exam_events_results_visibility_check;
ALTER TABLE exam_events
  ADD CONSTRAINT exam_events_results_visibility_check
  CHECK (results_visibility IN ('immediate','after_all_submitted','manual','never'))
  NOT VALID;
ALTER TABLE exam_events
  VALIDATE CONSTRAINT exam_events_results_visibility_check;

UPDATE exam_events
   SET results_visibility = 'manual'
 WHERE results_visibility IS NULL;

UPDATE exam_events
   SET results_published_at = COALESCE(results_published_at, created_at),
       results_published = true
 WHERE results_published
   AND results_published_at IS NULL;
