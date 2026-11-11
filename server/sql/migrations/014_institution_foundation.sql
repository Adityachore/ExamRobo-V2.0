-- Migration 014: institution foundation and tenant keys.
--
-- Expand only. This migration creates the tenant root, the legacy ParaRobo
-- institution, nullable institution_id columns on every tenant table, and the
-- composite unique keys a later composite foreign key will need.
--
-- It deliberately does NOT:
--   * set NOT NULL on institution_id
--   * enable or force RLS
--   * add composite foreign keys
--   * change the existing global skills.code / questions.source_key uniqueness
--
-- Those enforcement steps belong to the later G2 migrations once every write
-- path supplies a verified tenant context.

CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_norm text NOT NULL,
  slug text NOT NULL,
  college_code text,
  type text NOT NULL DEFAULT 'other'
    CHECK (type IN ('legacy', 'school', 'college', 'university', 'training', 'other')),
  review_state text NOT NULL DEFAULT 'approved'
    CHECK (review_state IN ('pending', 'info_requested', 'approved', 'rejected')),
  admin_state text NOT NULL DEFAULT 'enabled'
    CHECK (admin_state IN ('enabled', 'suspended', 'archived')),
  admin_state_reason text,
  suspended_at timestamptz,
  archived_at timestamptz,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT institutions_slug_key UNIQUE (slug)
);

CREATE TABLE IF NOT EXISTS institution_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  email_norm text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'primary'
    CHECK (role IN ('primary', 'billing', 'technical', 'other')),
  is_primary boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_institution_contacts_primary
  ON institution_contacts (institution_id)
  WHERE is_primary;

CREATE TABLE IF NOT EXISTS tenant_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  hostname text NOT NULL,
  hostname_norm text NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'disabled')),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hostname_norm),
  UNIQUE (institution_id, id)
);

-- The only legacy institution. A fixed UUID makes the migration deterministic;
-- no user-supplied identifier is ever used for ownership.
INSERT INTO institutions
  (id, name, name_norm, slug, type, review_state, admin_state, is_internal)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'ParaRobo', 'pararobo', 'pararobo',
   'legacy', 'approved', 'enabled', true)
ON CONFLICT DO NOTHING;

-- Tenant keys, nullable during the expand phase.
ALTER TABLE admins ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE roster_emails ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE question_variants ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE paper_sections ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE paper_questions ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE warnings ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE flags ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE proctor_events ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE admin_actions ADD COLUMN IF NOT EXISTS institution_id uuid;
ALTER TABLE paper_attempt_history ADD COLUMN IF NOT EXISTS institution_id uuid;

-- Backfill every existing row to the one verified legacy institution. Root
-- rows are assigned first; child rows derive ownership from their parent.
DO $$
DECLARE
  legacy uuid;
  unmapped text;
BEGIN
  SELECT id INTO legacy
    FROM institutions
   WHERE slug = 'pararobo' AND is_internal
   LIMIT 1;

  IF legacy IS NULL THEN
    RAISE EXCEPTION 'migration 014: the internal ParaRobo institution is missing';
  END IF;

  UPDATE admins SET institution_id = legacy WHERE institution_id IS NULL;
  UPDATE exam_events SET institution_id = legacy WHERE institution_id IS NULL;
  UPDATE skills SET institution_id = legacy WHERE institution_id IS NULL;
  UPDATE questions SET institution_id = legacy WHERE institution_id IS NULL;
  UPDATE tickets SET institution_id = legacy WHERE institution_id IS NULL;

  UPDATE question_variants qv
     SET institution_id = q.institution_id
    FROM questions q
   WHERE qv.question_id = q.id
     AND qv.institution_id IS NULL;

  UPDATE roster_emails r
     SET institution_id = e.institution_id
    FROM exam_events e
   WHERE r.event_id = e.id
     AND r.institution_id IS NULL;

  UPDATE papers p
     SET institution_id = e.institution_id
    FROM exam_events e
   WHERE p.event_id = e.id
     AND p.institution_id IS NULL;

  UPDATE paper_sections s
     SET institution_id = p.institution_id
    FROM papers p
   WHERE s.paper_id = p.id
     AND s.institution_id IS NULL;

  UPDATE answers a
     SET institution_id = p.institution_id
    FROM papers p
   WHERE a.paper_id = p.id
     AND a.institution_id IS NULL;

  UPDATE paper_questions pq
     SET institution_id = p.institution_id
    FROM papers p
   WHERE pq.paper_id = p.id
     AND pq.institution_id IS NULL;

  UPDATE warnings w
     SET institution_id = p.institution_id
    FROM papers p
   WHERE w.paper_id = p.id
     AND w.institution_id IS NULL;

  UPDATE recordings r
     SET institution_id = p.institution_id
    FROM papers p
   WHERE r.paper_id = p.id
     AND r.institution_id IS NULL;

  UPDATE feedback f
     SET institution_id = p.institution_id
    FROM papers p
   WHERE f.paper_id = p.id
     AND f.institution_id IS NULL;

  UPDATE paper_attempt_history h
     SET institution_id = p.institution_id
    FROM papers p
   WHERE h.paper_id = p.id
     AND h.institution_id IS NULL;

  UPDATE proctor_events pe
     SET institution_id = e.institution_id
    FROM exam_events e
   WHERE pe.event_id = e.id
     AND pe.institution_id IS NULL;

  UPDATE proctor_events pe
     SET institution_id = p.institution_id
    FROM papers p
   WHERE pe.paper_id = p.id
     AND pe.institution_id IS NULL;

  UPDATE flags f
     SET institution_id = e.institution_id
    FROM exam_events e
   WHERE f.event_id = e.id
     AND f.institution_id IS NULL;

  UPDATE flags SET institution_id = legacy WHERE institution_id IS NULL;

  UPDATE admin_actions a
     SET institution_id = e.institution_id
    FROM exam_events e
   WHERE a.event_id = e.id
     AND a.institution_id IS NULL;

  UPDATE admin_actions a
     SET institution_id = p.institution_id
    FROM papers p
   WHERE a.paper_id = p.id
     AND a.institution_id IS NULL;

  UPDATE admin_actions SET institution_id = legacy WHERE institution_id IS NULL;

  SELECT string_agg(table_name, ', ' ORDER BY table_name)
    INTO unmapped
    FROM (
      SELECT 'admins' AS table_name FROM admins WHERE institution_id IS NULL
      UNION ALL
      SELECT 'exam_events' FROM exam_events WHERE institution_id IS NULL
      UNION ALL
      SELECT 'roster_emails' FROM roster_emails WHERE institution_id IS NULL
      UNION ALL
      SELECT 'skills' FROM skills WHERE institution_id IS NULL
      UNION ALL
      SELECT 'questions' FROM questions WHERE institution_id IS NULL
      UNION ALL
      SELECT 'question_variants' FROM question_variants WHERE institution_id IS NULL
      UNION ALL
      SELECT 'papers' FROM papers WHERE institution_id IS NULL
      UNION ALL
      SELECT 'paper_sections' FROM paper_sections WHERE institution_id IS NULL
      UNION ALL
      SELECT 'answers' FROM answers WHERE institution_id IS NULL
      UNION ALL
      SELECT 'paper_questions' FROM paper_questions WHERE institution_id IS NULL
      UNION ALL
      SELECT 'warnings' FROM warnings WHERE institution_id IS NULL
      UNION ALL
      SELECT 'recordings' FROM recordings WHERE institution_id IS NULL
      UNION ALL
      SELECT 'flags' FROM flags WHERE institution_id IS NULL
      UNION ALL
      SELECT 'tickets' FROM tickets WHERE institution_id IS NULL
      UNION ALL
      SELECT 'feedback' FROM feedback WHERE institution_id IS NULL
      UNION ALL
      SELECT 'proctor_events' FROM proctor_events WHERE institution_id IS NULL
      UNION ALL
      SELECT 'admin_actions' FROM admin_actions WHERE institution_id IS NULL
      UNION ALL
      SELECT 'paper_attempt_history' FROM paper_attempt_history WHERE institution_id IS NULL
    ) missing;

  IF unmapped IS NOT NULL THEN
    RAISE EXCEPTION 'migration 014: unmapped tenant rows remain in %', unmapped;
  END IF;
END $$;

-- Composite keys the later composite foreign keys will reference. The legacy
-- primary keys remain unchanged; these are additional indexes.
CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_institution_id ON admins (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_events_institution_id ON exam_events (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roster_emails_institution_id ON roster_emails (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_skills_institution_id ON skills (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_institution_id ON questions (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_question_variants_institution_id ON question_variants (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_papers_institution_id ON papers (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_paper_sections_institution_paper_category ON paper_sections (institution_id, paper_id, category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_answers_institution_paper_qno ON answers (institution_id, paper_id, qno);
CREATE UNIQUE INDEX IF NOT EXISTS idx_paper_questions_institution_paper_qno ON paper_questions (institution_id, paper_id, qno);
CREATE UNIQUE INDEX IF NOT EXISTS idx_warnings_institution_id ON warnings (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recordings_institution_id ON recordings (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_flags_institution_id ON flags (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tickets_institution_id ON tickets (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_institution_id ON feedback (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_proctor_events_institution_id ON proctor_events (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_actions_institution_id ON admin_actions (institution_id, id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_paper_attempt_history_institution_id ON paper_attempt_history (institution_id, id);

-- Per-tenant lookup paths that do not already start with institution_id.
CREATE INDEX IF NOT EXISTS idx_papers_institution_event ON papers (institution_id, event_id);
CREATE INDEX IF NOT EXISTS idx_roster_emails_institution_event ON roster_emails (institution_id, event_id);
CREATE INDEX IF NOT EXISTS idx_questions_institution_skill ON questions (institution_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_question_variants_institution_question ON question_variants (institution_id, question_id);
CREATE INDEX IF NOT EXISTS idx_proctor_events_institution_event ON proctor_events (institution_id, event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_institution_created ON admin_actions (institution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skills_institution_code ON skills (institution_id, code);
CREATE INDEX IF NOT EXISTS idx_questions_institution_source_key ON questions (institution_id, source_key)
  WHERE source_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_institution_contacts_institution ON institution_contacts (institution_id);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_institution ON tenant_domains (institution_id);
