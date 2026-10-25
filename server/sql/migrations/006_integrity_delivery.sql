-- Migration 006: delivery and connection hardening.
--
-- Re-applied on every boot, so every statement must be idempotent.

ALTER TABLE papers ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'web';

ALTER TABLE warnings ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'client';
ALTER TABLE warnings ADD COLUMN IF NOT EXISTS client_event_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_warnings_client_event
  ON warnings (paper_id, client_event_id)
  WHERE client_event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_papers_last_seen ON papers (last_seen_at);

ALTER TABLE proctor_events DROP CONSTRAINT IF EXISTS proctor_events_kind_check;
ALTER TABLE proctor_events
  ADD CONSTRAINT proctor_events_kind_check CHECK (kind IN (
    'started', 'submitted', 'tab_blur', 'fullscreen_exit', 'message',
    'clipboard', 'context_menu', 'print', 'screenshot_key', 'recording_revoked',
    'second_window', 'second_session', 'display_change', 'devtools',
    'share_surface', 'os_chord', 'locked', 'network_gap'
  )) NOT VALID;
ALTER TABLE proctor_events VALIDATE CONSTRAINT proctor_events_kind_check;
