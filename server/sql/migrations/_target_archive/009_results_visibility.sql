-- Migration 009: results visibility controls
--
-- Manual publishing by default for new events. Existing events backfilled to
-- immediate so current behavior stays intact.

ALTER TABLE exam_events
  ADD COLUMN IF NOT EXISTS results_visibility TEXT NOT NULL DEFAULT 'manual'
    CHECK (results_visibility IN ('immediate','after_all_submitted','manual','never')),
  ADD COLUMN IF NOT EXISTS results_published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS results_expires_at TIMESTAMPTZ;

-- Backfill existing events to immediate to keep current behavior intact
UPDATE exam_events SET results_visibility = 'immediate' WHERE results_visibility = 'manual';
