-- Migration 007: event administration, section timing and attempt control.
--
-- Re-applied on every boot, so every statement must be idempotent.

ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS section_limits jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE roster_emails ADD COLUMN IF NOT EXISTS removed_at timestamptz;
ALTER TABLE roster_emails ADD COLUMN IF NOT EXISTS removed_reason text;
ALTER TABLE roster_emails ADD COLUMN IF NOT EXISTS removed_by text;

ALTER TABLE papers ADD COLUMN IF NOT EXISTS access_revoked_at timestamptz;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS attempt_no int NOT NULL DEFAULT 1;

ALTER TABLE papers DROP CONSTRAINT IF EXISTS papers_submit_reason_check;
ALTER TABLE papers
  ADD CONSTRAINT papers_submit_reason_check CHECK (submit_reason IN (
    'student','time_expired','max_warnings','force_submit','integrity_lockout','removed'
  )) NOT VALID;
ALTER TABLE papers VALIDATE CONSTRAINT papers_submit_reason_check;

CREATE TABLE IF NOT EXISTS paper_sections (
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  position int NOT NULL CHECK (position >= 0),
  category text NOT NULL,
  limit_min int NOT NULL CHECK (limit_min > 0),
  started_at timestamptz,
  ends_at timestamptz,
  PRIMARY KEY (paper_id, category),
  UNIQUE (paper_id, position)
);

CREATE INDEX IF NOT EXISTS idx_paper_sections_paper ON paper_sections (paper_id, position);

CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text NOT NULL,
  action text NOT NULL,
  event_id uuid REFERENCES exam_events(id) ON DELETE SET NULL,
  paper_id uuid REFERENCES papers(id) ON DELETE SET NULL,
  target_email text,
  reason text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_event ON admin_actions (event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_paper ON admin_actions (paper_id, created_at DESC);

CREATE TABLE IF NOT EXISTS paper_attempt_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  attempt_no int NOT NULL,
  event_id uuid NOT NULL,
  email text NOT NULL,
  variant_ids uuid[] NOT NULL DEFAULT '{}',
  selected_categories text[] NOT NULL DEFAULT '{}',
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  section_state jsonb NOT NULL DEFAULT '[]'::jsonb,
  score int,
  submit_reason text,
  started_at timestamptz,
  ended_at timestamptz,
  reason text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paper_attempt_history_paper ON paper_attempt_history (paper_id, created_at DESC);

ALTER TABLE proctor_events DROP CONSTRAINT IF EXISTS proctor_events_kind_check;
ALTER TABLE proctor_events
  ADD CONSTRAINT proctor_events_kind_check CHECK (kind IN (
    'started','submitted','tab_blur','fullscreen_exit','message',
    'clipboard','context_menu','print','screenshot_key','recording_revoked',
    'second_window','second_session','display_change','devtools',
    'share_surface','os_chord','locked','network_gap',
    'resumed','restarted','removed'
  )) NOT VALID;
ALTER TABLE proctor_events VALIDATE CONSTRAINT proctor_events_kind_check;
