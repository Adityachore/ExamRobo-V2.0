-- Per-section timers and per-student option shuffle (Phase 16).
--
-- A paper's sections are frozen when the paper is created, with their own
-- clock. A paper without rows here is a legacy paper and keeps using
-- papers.ends_at as its single deadline.
--
-- option_orders[qno] is the display order of the authored option indexes for
-- that question: [2,0,1,3] means display position 0 shows authored option 2.
-- answers.choice stores the display position, so grading maps it back through
-- this array.

ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS module_minutes jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS duration_min integer;
ALTER TABLE papers ADD COLUMN IF NOT EXISTS option_orders jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS paper_sections (
  paper_id    uuid    NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  idx         integer NOT NULL,
  category    text    NOT NULL,
  qcount      integer NOT NULL CHECK (qcount > 0),
  minutes     integer NOT NULL CHECK (minutes > 0),
  started_at  timestamptz,
  ends_at     timestamptz,
  finished_at timestamptz,
  PRIMARY KEY (paper_id, idx)
);

CREATE INDEX IF NOT EXISTS paper_sections_open
  ON paper_sections (paper_id) WHERE finished_at IS NULL;
