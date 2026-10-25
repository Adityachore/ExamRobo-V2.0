-- Domain selection (R-015).
--
-- A domain-aware event lets the student choose the technical domain(s) the
-- exam asks about, before the timer starts. The aptitude part is common to
-- everyone and is always included once.
--
-- Append-only and idempotent, re-applied on every boot.

-- The mode of the event:
--   'fixed'  - the categories of the event, as before (the default)
--   'select' - the student chooses the technical domains
ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS domain_mode text NOT NULL DEFAULT 'fixed';

-- The rules of a domain-aware event:
--   common  - the categories every student gets (Aptitude, Logic)
--   allowed - the technical domains the student may choose from
--   min/max - how many of them the student must and may choose
-- The question count of a category stays in exam_events.question_counts, so
-- there is exactly one place that says how many questions a category is worth.
ALTER TABLE exam_events ADD COLUMN IF NOT EXISTS domain_rules jsonb NOT NULL DEFAULT '{}'::jsonb;

-- The domains the student chose, frozen with the paper.
ALTER TABLE papers ADD COLUMN IF NOT EXISTS selected_categories text[];

-- The category (the domain) of every question of the paper, frozen with it.
-- The sections of a paper are its domains, and they must not change when the
-- bank changes - the same rule the skill and the difficulty already follow.
ALTER TABLE paper_questions ADD COLUMN IF NOT EXISTS category text;
