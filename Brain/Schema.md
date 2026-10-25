# ExamRobo Schema (PostgreSQL 16)

Source of truth: `server/sql/schema.sql` (applied by initdb on a fresh volume).
Existing databases catch up through `server/sql/migrations/*.sql`
(`npm run migrate`, also executed automatically by the API at boot).

15 tables: `admins`, `exam_events`, `roster_emails`, `skills`, `questions`,
`question_variants`, `papers`, `paper_questions`, `answers`, `warnings`,
`proctor_events`, `recordings`, `flags`, `tickets`, `feedback`.

## admins
| col | type | notes |
|---|---|---|
| id | uuid pk | gen_random_uuid() |
| email | text unique not null | lowercase |
| password_hash | text not null | bcrypt |
| name | text | |
| created_at | timestamptz | default now() |

## exam_events
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text not null | |
| starts_at | timestamptz not null | |
| duration_min | int not null | > 0 |
| categories | text[] not null | |
| question_counts | jsonb | `{"Aptitude":3,...}` per category (R-012) |
| domain_mode | text not null default 'fixed' | **added in migration 005** — `fixed` (everybody gets the same questions) or `select` (the student picks the technical domain, R-015) |
| domain_rules | jsonb not null default '{}' | **added in migration 005** — `{ common: [...], allowed: [...], min, max }`; empty for a fixed event |
| roster_updated_at | timestamptz | stamped on roster upload; drives R-043 |
| instructions | text | shown to students in the waiting room |
| created_by | uuid fk admins | |
| created_at | timestamptz | |

## roster_emails
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| event_id | uuid fk exam_events | |
| email | text not null | lowercase |
| name | text | |
| updated_at | timestamptz | stamped on every upsert |
| unique(event_id, email) | | |

## skills
The competency taxonomy (R-013). Reference data: the rows are seeded by
`server/sql/taxonomy.sql`, the rules live in `server/services/competency.js`.

| col | type | notes |
|---|---|---|
| id | uuid pk | |
| code | text unique not null | the stable machine key — `logical_reasoning` |
| name | text not null | shown to admins and on the result pages |
| category | text not null | one of the ten categories |
| description | text | what the skill measures |
| created_at | timestamptz | |

## questions
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| category | text not null | Aptitude, Logic, Frontend, … |
| skill_id | uuid fk skills | **added in migration 004** — the skill this question measures; `ON DELETE SET NULL`, so deleting a skill untags its questions instead of deleting them |
| difficulty | int not null default 3 | **added in migration 004** — 1 (foundation) to 5 (expert), CHECK bounded by the database |
| active | bool | default true |
| created_at | timestamptz | |

The list view has no `title` column: the title is the stem of the first variant.

## question_variants
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| question_id | uuid fk questions | cascade delete |
| stem | text not null | fully self-contained |
| options | text[] not null | length 4 |
| correct_idx | int not null | 0..3 — never leaves the server before submit |

## papers
One row = one exam session for one student in one event.

| col | type | notes |
|---|---|---|
| id | uuid pk | |
| event_id | uuid fk exam_events | |
| email | text not null | student identity (login email) |
| variant_ids | uuid[] not null | ordered, one variant per logical question |
| started_at | timestamptz | |
| ends_at | timestamptz | `LEAST(now() + duration, starts_at + duration)` |
| current_index | int not null default 0 | last question the student saw |
| status | text not null | `active` \| `submitted` (was `in_progress`) |
| submitted_at | timestamptz | |
| submit_reason | text | `student` \| `time_expired` \| `max_warnings` \| `force_submit` \| `integrity_lockout` |
| lock_reason | text | why the paper was locked (added in migration 002) |
| fullscreen_state | boolean | the last fullscreen state the server saw in a heartbeat (added in migration 003) — the backstop for the client's own fullscreen detection |
| score | int | graded total |
| selected_categories | text[] | **added in migration 005** — the technical domains the student chose, frozen with the paper (R-015) |
| unique(event_id, email) | | one paper per student per event |

## paper_questions
The competency **frozen with the paper** (added in migration 004). A question
that is re-tagged after an exam ran must not rewrite the history of that exam,
so the paper keeps its own copy.

| col | type | notes |
|---|---|---|
| paper_id | uuid fk papers | cascade delete |
| qno | int | the position inside `papers.variant_ids` |
| variant_id | uuid | the variant the student was given |
| skill_id | uuid fk skills | `ON DELETE SET NULL` |
| skill_code | text | the code as text — it survives a rename or a delete |
| difficulty | int not null default 3 | 1..5, CHECK bounded |
| category | text | **added in migration 005** — the domain (the category) of the question, frozen with the paper, so re-tagging a question never moves a section of an exam that already ran (R-015) |
| pk(paper_id, qno) | | one row per question of the paper |

## answers
| col | type | notes |
|---|---|---|
| paper_id | uuid fk papers | cascade delete |
| qno | int | 0-based position inside `papers.variant_ids` |
| choice | int | 0..3 |
| updated_at | timestamptz | |
| pk(paper_id, qno) | | idempotent upsert target |

## warnings
One row = one recorded strike. The count of these rows is the shared Tier-B
budget (R-030) — every warning kind spends from the same budget of three.

| col | type | notes |
|---|---|---|
| id | uuid pk | |
| paper_id | uuid fk papers | |
| kind | text | `tab_blur` \| `fullscreen_exit` \| `clipboard` \| `context_menu` \| `print` \| `second_window` \| `second_session` \| `display_change` |
| detail | jsonb | free-form payload (added in migration 002) |
| created_at | timestamptz | |

## proctor_events
Full event log for the live dashboard (R-032).

| col | type | notes |
|---|---|---|
| id | uuid pk | |
| paper_id | uuid fk papers | cascade delete |
| event_id | uuid fk exam_events | cascade delete |
| kind | text | `tab_blur` \| `fullscreen_exit` \| `clipboard` \| `context_menu` \| `print` \| `screenshot_key` \| `recording_revoked` \| `second_window` \| `second_session` \| `display_change` \| `devtools` \| `share_surface` \| `os_chord` \| `message` \| `force_submit` \| `flag` \| `locked` |
| detail | jsonb | free-form payload |
| created_at | timestamptz | |

## recordings
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| paper_id | uuid fk papers | cascade delete |
| chunk_no | int | |
| bytes | bigint | |
| path | text | server disk under `RECORDINGS_DIR` |
| mime | text | `video/webm` etc. (added in the 8-change delta) |
| created_at | timestamptz | |
| unique(paper_id, chunk_no) | | retry-safe |

## flags
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| kind | text | `HR_MISTAKE` \| `MISCONDUCT` |
| subject_type | text | `student` \| `event` |
| subject_id | text | student email, or the event uuid for an event-wide flag |
| event_id | uuid fk exam_events | **added by migration 001** — the event the flag belongs to (cascade delete) |
| reason | text | |
| created_by | text | `system` or admin email |
| resolved | bool | default false |
| created_at | timestamptz | |

`flags.event_id` exists because a flag used to carry the student email *or* the event
uuid, never both — the event context of a student flag was lost. The API now
resolves the student's event when the dashboard does not send one.

## tickets
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| email | text | |
| reason | text | |
| source | text | `contact` \| `lockout` (added in the 8-change delta) |
| status | text | `open` \| `resolved` |
| created_at | timestamptz | |

## feedback
| col | type | notes |
|---|---|---|
| id | uuid pk | |
| paper_id | uuid fk papers | cascade delete |
| rating | int | 1..5 |
| comment | text | max 1000 chars |
| created_at | timestamptz | |

## Indexes
- `answers (paper_id, qno)` — pk covers the autosave path
- `roster_emails (email)` — login lookup
- `papers (event_id, email)` — unique, login lookup
- `recordings (paper_id, chunk_no)` — unique
- `warnings (paper_id, created_at)` — live proctor queries
- `warnings (paper_id, kind)` — **added in migration 002**, the violation-kind rollup
- `proctor_events (event_id, created_at DESC)` — live feed
- `proctor_events (paper_id, created_at DESC)` — per-student feed
- `flags (event_id)` — flag filtering per event
- `idx_papers_started` — **added in migration 003**, `(started_at DESC)` for the live session list
- `idx_questions_skill` — **added in migration 004**, the questions of one skill
- `idx_paper_questions_skill` — **added in migration 004**, the per-skill rollup of an exam
- `idx_paper_questions_difficulty` — **added in migration 004**, the per-difficulty rollup of an exam

## Migration 002 — integrity hardening
`server/sql/migrations/002_integrity_hardening.sql` (append-only, idempotent,
re-applied on every boot):
- `papers.lock_reason text` — why the paper was locked.
- `warnings.detail jsonb` — the free-form payload of a strike.
- The `proctor_events.kind` and `papers.submit_reason` CHECK constraints are
  widened to the full set of integrity kinds and submit reasons.
- `idx_warnings_paper_kind` — `(paper_id, kind)` for the violation rollup.
- `schema.sql` (fresh volumes) mirrors all of it.

## Migration 003 — exam integrity v2
`server/sql/migrations/003_exam_integrity_v2.sql` (append-only, idempotent,
re-applied on every boot):
- `papers.fullscreen_state boolean` — the last fullscreen state the server saw
  in a heartbeat. The client detects leaving fullscreen on its own, but the
  server keeps the state so a client that lies (or dies) cannot hide the exit.
- The `proctor_events.kind` CHECK is re-created with `os_chord` in the list
  (the operating-system key press — logged, never penalised). The constraint is
  dropped and re-added because a migration is re-applied on every boot.
- `idx_papers_started` — `(started_at DESC)`, the order of the live session list.
- `schema.sql` (fresh volumes) mirrors all of it.

## Migration 004 — question bank v2 (competency)
`server/sql/migrations/004_bank_competency.sql` (append-only, idempotent,
re-applied on every boot):
- `skills` — the taxonomy table.
- `questions.skill_id` (fk, `ON DELETE SET NULL`) and `questions.difficulty`
  (1..5, CHECK bounded). The CHECK is dropped and re-added because a
  migration is re-applied on every boot.
- `paper_questions` — the competency frozen with the paper.
- The three indexes above. `schema.sql` (fresh volumes) mirrors all of it.

**The taxonomy is a data file, not a migration.** `server/sql/taxonomy.sql`
holds the 39 seeded skills and is applied on every boot
(`scripts/migrate.js` → `applyTaxonomy()`) and to every scratch database
(`scripts/scratch-db.mjs`). It has to be a file of its own because a
`TRUNCATE ... CASCADE` follows the foreign keys from `questions` down to
`skills` — the seed truncates the bank, so the taxonomy is re-applied right
after the truncate (`scripts/seed.js`).

## Migration 005 — domain selection (R-015)
`server/sql/migrations/005_domain_selection.sql` (append-only, idempotent,
re-applied on every boot):
- `exam_events.domain_mode` — `fixed` (the default) or `select`.
- `exam_events.domain_rules` — `{ common, allowed, min, max }`; empty for a
  fixed event.
- `papers.selected_categories` — the technical domains the student chose,
  frozen with the paper.
- `paper_questions.category` — the domain of every question of the paper,
  frozen with it, so the sections of a paper never move when the bank is
  re-tagged.

`schema.sql` (fresh volumes) mirrors all of it. The backfill file also fills
`paper_questions.category` for the papers that ran before the migration, the
same way it fills the skill and the difficulty — today's tags, frozen from
then on.

## The backfill — data file, not a migration
`server/sql/backfill.sql` rebuilds the frozen competency of the papers that
ran **before** the taxonomy existed: they have no `paper_questions` rows, so
there is nothing to report about what they measured. The file is applied on
every boot **after** the taxonomy (`scripts/migrate.js` →
`applyBackfill()`) and to every scratch database, because it reads the skill
code from the `skills` table.

It is honest about being an approximation: the tags are today's tags, not the
tags of the day the exam ran. Nothing else is invented — the variants, the
order and the skills are the real ones — and the result is frozen from then
on, like any other paper. A paper that already has a snapshot is left alone.

## Notes
- No `students` table in Phase 1: identity = roster email; the paper row is the
  exam identity.
- Correct answers never leave the server before submit.
- Migrations are append-only: never edit an applied migration, add a new file.
- The `proctor_events.kind` CHECK is the backstop for the policy: a kind the
  policy does not know cannot be written to the database at all.
