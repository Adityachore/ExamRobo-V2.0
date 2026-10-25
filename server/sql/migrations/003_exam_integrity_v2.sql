-- Migration 003: exam integrity v2.
--
-- Adds the storage the new fullscreen enforcement needs:
--   papers.fullscreen_state - the last fullscreen state the server saw in a
--                              heartbeat. The client detects leaving
--                              fullscreen on its own, but the server keeps
--                              the state so a client that lies (or dies)
--                              cannot hide the exit.
--
-- Widens the proctor_events CHECK so the new "operating-system key" signal
-- can be recorded.
--
-- Adds the index the live dashboard needs: the session list is ordered by
-- started_at and the table grows with every attempt.
--
-- This file is re-applied on every boot (scripts/migrate.js runs every file in
-- the folder each time), so every statement must be idempotent. The CHECK
-- constraint is dropped and re-added for the same reason.

ALTER TABLE papers ADD COLUMN IF NOT EXISTS fullscreen_state boolean;

ALTER TABLE proctor_events DROP CONSTRAINT IF EXISTS proctor_events_kind_check;
ALTER TABLE proctor_events
  ADD CONSTRAINT proctor_events_kind_check CHECK (kind IN (
    'started', 'submitted', 'tab_blur', 'fullscreen_exit', 'message',
    'clipboard', 'context_menu', 'print', 'screenshot_key', 'recording_revoked',
    'second_window', 'second_session', 'display_change', 'devtools',
    'share_surface', 'os_chord', 'locked'
  )) NOT VALID;
ALTER TABLE proctor_events VALIDATE CONSTRAINT proctor_events_kind_check;

CREATE INDEX IF NOT EXISTS idx_papers_started ON papers (started_at DESC);
