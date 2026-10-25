CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE exam_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  starts_at timestamptz NOT NULL,
  duration_min int NOT NULL,
  categories text[] NOT NULL DEFAULT '{}',
  question_counts jsonb NOT NULL DEFAULT '{}',
  roster_updated_at timestamptz,
  instructions text NOT NULL DEFAULT 'Stay in fullscreen. Do not switch tabs.',
  created_by uuid REFERENCES admins(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Domain selection (migration 005): 'fixed' or 'select', plus the rules of a
  -- domain-aware event (common categories, allowed domains, min/max).
  domain_mode text NOT NULL DEFAULT 'fixed',
  domain_rules jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE roster_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES exam_events(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

-- The competency taxonomy. A skill is a stable code, a name and the category
-- it belongs to. The rows are seeded by migration 004, not here: schema.sql
-- is the shape, the migration is the data.
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE SET NULL,
  difficulty int NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE question_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  stem text NOT NULL,
  options text[] NOT NULL,
  correct_idx int NOT NULL CHECK (correct_idx BETWEEN 0 AND 3)
);

CREATE TABLE papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES exam_events(id),
  email text NOT NULL,
  variant_ids uuid[] NOT NULL,
  started_at timestamptz,
  ends_at timestamptz,
  current_index int NOT NULL DEFAULT 0 CHECK (current_index >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','submitted')),
  submitted_at timestamptz,
  submit_reason text CHECK (submit_reason IN ('student','time_expired','max_warnings','force_submit','integrity_lockout')),
  lock_reason text,
  fullscreen_state boolean,
  score int,
  -- Delivery and connection state (006).
  last_seen_at timestamptz,
  source text NOT NULL DEFAULT 'web',
  -- The technical domains the student chose, frozen with the paper (005).
  selected_categories text[],
  UNIQUE (event_id, email)
);

CREATE TABLE answers (
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  qno int NOT NULL,
  choice int NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (paper_id, qno)
);

-- The competency frozen with the paper. A question that is re-tagged after
-- the exam ran must not rewrite the history of that exam, so the paper keeps
-- its own copy of the skill (as code text) and the difficulty.
CREATE TABLE paper_questions (
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  qno int NOT NULL CHECK (qno >= 0),
  variant_id uuid NOT NULL,
  skill_id uuid REFERENCES skills(id) ON DELETE SET NULL,
  skill_code text,
  difficulty int NOT NULL DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  -- The domain (the category) of the question, frozen with the paper (005).
  category text,
  PRIMARY KEY (paper_id, qno)
);

CREATE TABLE warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  kind text NOT NULL,
  detail jsonb,
  source text NOT NULL DEFAULT 'client',
  client_event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  chunk_no int NOT NULL,
  bytes bigint NOT NULL,
  path text NOT NULL,
  mime text NOT NULL DEFAULT 'video/webm',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (paper_id, chunk_no)
);

CREATE TABLE flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('HR_MISTAKE','MISCONDUCT')),
  subject_type text NOT NULL CHECK (subject_type IN ('student','event')),
  subject_id text NOT NULL,
  event_id uuid REFERENCES exam_events(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_by text NOT NULL DEFAULT 'system',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  reason text NOT NULL,
  source text NOT NULL DEFAULT 'contact' CHECK (source IN ('contact','lockout')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Live proctor event log (R-032 "event log"). Also the durable feed the
-- dashboard replays after a reload.
CREATE TABLE proctor_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES exam_events(id) ON DELETE CASCADE,
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  kind text NOT NULL CHECK (kind IN (
    'started','submitted','tab_blur','fullscreen_exit','message',
    'clipboard','context_menu','print','screenshot_key','recording_revoked',
    'second_window','second_session','display_change','devtools',
    'share_surface','os_chord','locked','network_gap'
  )),
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_warnings_paper ON warnings (paper_id, created_at);
CREATE INDEX idx_warnings_paper_kind ON warnings (paper_id, kind);
CREATE UNIQUE INDEX idx_warnings_client_event ON warnings (paper_id, client_event_id) WHERE client_event_id IS NOT NULL;
CREATE INDEX idx_papers_event ON papers (event_id, email);
CREATE INDEX idx_papers_started ON papers (started_at DESC);
CREATE INDEX idx_papers_last_seen ON papers (last_seen_at);
CREATE INDEX idx_questions_skill ON questions (skill_id);
CREATE INDEX idx_paper_questions_skill ON paper_questions (skill_id);
CREATE INDEX idx_paper_questions_difficulty ON paper_questions (difficulty);
CREATE INDEX idx_proctor_events_event ON proctor_events (event_id, created_at DESC);
CREATE INDEX idx_proctor_events_paper ON proctor_events (paper_id, created_at DESC);
CREATE INDEX idx_roster_email ON roster_emails (email);
CREATE INDEX idx_flags_event ON flags (event_id);
