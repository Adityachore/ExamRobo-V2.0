-- Migration 002: exam integrity hardening.
--
-- Adds the storage the integrity policy needs:
--   papers.lock_reason  - why the exam was locked (shown to the admin + the student)
--   warnings.detail     - what exactly was attempted (jsonb, free-form)
--
-- Widens two CHECK constraints so the new event kinds and the new submit
-- reason are storable:
--   proctor_events.kind       - clipboard / context_menu / print / screenshot_key /
--                               recording_revoked / second_window / second_session /
--                               display_change / devtools / share_surface / locked
--   papers.submit_reason      - 'integrity_lockout'
--
-- This file is re-applied on every boot (scripts/migrate.js runs every file in
-- the folder each time), so every statement must be idempotent. The CHECK
-- constraints are dropped and re-added for the same reason.

ALTER TABLE papers ADD COLUMN IF NOT EXISTS lock_reason text;
ALTER TABLE warnings ADD COLUMN IF NOT EXISTS detail jsonb;

ALTER TABLE proctor_events DROP CONSTRAINT IF EXISTS proctor_events_kind_check;
ALTER TABLE proctor_events
  ADD CONSTRAINT proctor_events_kind_check CHECK (kind IN (
    'started', 'submitted', 'tab_blur', 'fullscreen_exit', 'message',
    'clipboard', 'context_menu', 'print', 'screenshot_key', 'recording_revoked',
    'second_window', 'second_session', 'display_change', 'devtools',
    'share_surface', 'locked'
  )) NOT VALID;
ALTER TABLE proctor_events VALIDATE CONSTRAINT proctor_events_kind_check;

ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_submit_reason_check;
ALTER TABLE papers
  ADD CONSTRAINT papers_submit_reason_check CHECK (submit_reason IN (
    'student', 'time_expired', 'max_warnings', 'force_submit', 'integrity_lockout'
  )) NOT VALID;
ALTER TABLE papers VALIDATE CONSTRAINT papers_submit_reason_check;

CREATE INDEX IF NOT EXISTS idx_warnings_paper_kind ON warnings (paper_id, kind);
