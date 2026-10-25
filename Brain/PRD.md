# ExamRobo PRD

Website-first proctored exam platform. Any OS, any PC. Phase 1 = MCQ only; coding round = Phase 1.5.

## Phase 1 — Auth & Scaffolding

## Requirement R-001 — Email-allowlist login
- Description: Student enters email. If present on the event roster, issue student JWT and redirect to waiting room. If not, show error popup.
- Priority: P0

## Requirement R-002 — 3-attempt lockout
- Description: 3 consecutive failed logins for the same email+IP blocks further attempts for 15 minutes.
- Priority: P0

## Requirement R-003 — Contact Team ticket
- Description: "Contact Team" button posts a ticket (email + reason). Staff see tickets in admin UI. Auto-created ticket when 3 failed logins occur.
- Priority: P1

## Requirement R-004 — Waiting room countdown
- Description: After login, student sees exam name, start time, and live countdown. Exam must be completed in one sitting within the stipulated duration.
- Priority: P0

## Requirement R-005 — Admin login
- Description: Admin authenticates with email + password (ADMIN_EMAILS / ADMIN_PASSWORD env). Separate role in JWT.
- Priority: P0

## Requirement R-006 — Admin: exam event + roster upload
- Description: Admin creates exam events (name, start, duration, categories) and pastes/uploads a roster of eligible emails. Roster update stamps roster_updated_at (used by R-031).
- Priority: P0

## Phase 2 — Question Bank & Papers

## Requirement R-010 — Question bank CRUD
- Description: Admin creates logical questions with 3–4 fully self-contained variants (stem, 4 options, correct index) per question, tagged by category (Aptitude, Logic, Frontend, Backend, Cybersecurity, Digital Marketing, WordPress, AI, Prompt Engineering, Machine Learning, …).
- Priority: P0

## Requirement R-013 — Competency taxonomy (question bank v2)
- Description: Every question states **what it measures** and **how hard it is**.
  - A **skill** is a stable code (`logical_reasoning`), a name, a category and a
    description. The code is the key everything points at, so a skill can be
    renamed without breaking a question, a paper or a report. The taxonomy is
    reference data that ships with the project and is re-applied on every boot
    (an admin can add skills of their own; a later boot never removes them).
  - A **difficulty** is 1 (foundation) to 5 (expert), default 3. The scale is
    owned by the server and handed to the client, so no client hard-codes it.
  - The question text and its variants never change after creation. The
    competency is changed through its own endpoint.
  - **A paper freezes the competency of its questions.** Re-tagging a question
    after an exam ran must not rewrite the history of that exam, so each paper
    keeps its own copy of the skill (as code text) and the difficulty.
  - The admin can filter the bank by skill and by difficulty, tag a question,
    and manage the taxonomy itself.
- Priority: P1

## Requirement R-014 — Results analytics per skill and per difficulty
- Description: A result says **what** was measured, not only how many answers
  were right.
  - The **student** sees their own score per skill and per difficulty, next to
    the sections. It is the competency the paper froze, so it is the exam that
    is being described - a question re-tagged afterwards does not change it.
  - The **admin** sees the same breakdown per student, and a cohort view: the
    accuracy of every skill and every difficulty across all submissions of an
    exam, the weakest first. It is exportable as CSV.
  - An **unanswered question is not a wrong answer**. Every bucket reports
    three numbers: the questions it holds (`total`), the ones the student
    answered (`answered`) and the ones that were right (`correct`). The
    accuracy is `correct / total`.
  - Only counts leave the server. The answer key never does.
  - The numbers come from the frozen competency (`paper_questions`), never
    from the questions as they are today.
- Priority: P1

## Requirement R-015 — Domain selection (the student picks the technical domain)
- Description: An exam can ask the student **which technical domain** it should
  test, instead of giving everybody the same questions.
  - The **common part** is included in every paper, exactly once: `Aptitude`
    and `Logic`. It is not negotiable.
  - The **technical domains** are the eight of the taxonomy: `Frontend`,
    `Backend`, `Cybersecurity`, `Digital Marketing`, `WordPress`, `AI`,
    `Prompt Engineering`, `Machine Learning`. The event says which of them
    are on offer and how many the student must and may pick.
  - The **count of a domain is fixed** (`question_counts`). The paper of a
    selection holds the common part plus the count of every chosen domain, so
    the length of the paper follows the selection.
  - The student picks in the **waiting room**, before the timer starts. The
    choice is validated by the server again when the paper is created; a
    refused selection leaves no paper and no attempt behind.
  - The **choice is frozen with the paper** (`papers.selected_categories`), so
    a resume never asks again and a later change of the event cannot move an
    exam that already ran.
  - The **sections of a paper are its domains**. The domain of every question
    is frozen with the paper (`paper_questions.category`), exactly like the
    skill and the difficulty: re-tagging a question never moves a section of
    an exam that already ran.
- Priority: P1

## Requirement R-011 — Per-student paper generation
- Description: At exam start, server picks one random variant per logical question and a random question order, unique per student. Generated once per student per event.
- Priority: P0

## Requirement R-012 — Exam config
- Description: Event configures duration, sections/categories, and per-category question counts.
- Priority: P0

## Phase 3 — Exam Runner

## Requirement R-020 — MCQ exam UI
- Description: One question per view, 4 options, section navigation, server-authoritative timer. No answer visible to client before submit.
- Priority: P0

## Requirement R-021 — Autosave
- Description: Every answer change is POSTed immediately; server upserts into answers keyed (paper_id, qno). Periodic snapshot every 15s. Crash-safe: rejoin within sitting restores all saved answers.
- Priority: P0

## Requirement R-022 — One-sitting enforcement
- Description: Server rejects start if paper already submitted or event ended. Rejoin allowed only while time remains.
- Priority: P0

## Requirement R-023 — Submit
- Description: Student submits or timer expires → auto-submit. Graded immediately; result shown.
- Priority: P0

## Phase 4 — Proctoring

## Requirement R-030 — Tiered integrity enforcement
- Description: The exam runs in fullscreen and the client reports proctor
  events. Every event is classified by the server into one of three tiers:
  - **Tier A — instant lock**: `screenshot_key`, `recording_revoked`. The exam is
    submitted immediately, graded normally, a `MISCONDUCT` flag is raised and
    the student is signed out.
  - **Tier B — 3-strike warning**: `tab_blur`, `fullscreen_exit`, `clipboard`,
    `context_menu`, `print`, `second_window`, `second_session`, `display_change`.
    The strikes are **shared across all Tier-B kinds**; the third one
    auto-submits the exam.
  - **Tier C — log only**: `devtools`, `share_surface`, `os_chord`. Recorded,
    never penalised.
- The tier table is the single source of truth (`server/services/integrity.js`);
  the client may not decide the outcome and the database CHECK constraint
  rejects a kind the policy does not know.
- The two concurrency signals are mutually exclusive: two live tabs of one
  sign-in are a `second_window`, two sign-ins of the same account are a
  `second_session`. One mistake never costs two strikes.
- **One incident is one warning.** A fullscreen exit is seen by the client and
  by the server heartbeat; the server keeps the last fullscreen state
  (`papers.fullscreen_state`) and refuses a repeat within 10 s.
- **Fullscreen is a hard block**: outside fullscreen the question is not
  rendered. A `fullscreen_exit` is a true → false *transition* (F11 does not
  set `document.fullscreenElement`), and the window is compared with the screen
  so F11 counts as fullscreen.
- **The clipboard is detected from the keyboard.** The exam page has no
  editable field, so the DOM `copy`/`cut`/`paste` events never fire there;
  the keydown is the only always-available signal and preventing it is the only
  way to block a paste. Every press is an attempt and counts; holding a key
  down is one attempt.
- **The browser cannot stop an operating-system capture.** The screenshot key
  is counted and ends the exam, but the picture is still taken — the student
  instructions say so plainly and the screen recording is the evidence. The
  bare operating-system key press is logged as `os_chord`.
- Priority: P0

## Requirement R-031 — Screen recording
- Description: MediaRecorder captures screen during exam; chunks uploaded every ~10s to server disk (raw, no transcoding). Upload failures retry with backoff. Missing-chunk gaps are tolerated and logged. A recording that stops without the student stopping it is a Tier-A `recording_revoked` event.
- Priority: P0

## Requirement R-032 — Live proctor dashboard
- Description: Staff sees live sessions: student identity, current question, warning count, recording heartbeat, event log. Actions: send message, force-submit, lock session, flag student.
- Priority: P0

## Requirement R-033 — Locked exam state
- Description: A locked exam is submitted, graded and shown to the student as
  a lockout screen with the reason. Every later answer, start or event call is
  refused with **409** and `locked: true`. The lock reason and the violation
  kinds are visible to the proctor on the Live dashboard.
- Priority: P0

## Requirement R-034 — Windows lockdown agent (Phase 2, designed only)
- Description: A supervised Windows helper that the exam client launches to
  enforce the controls a browser cannot: a kiosk-mode fullscreen shell, a
  blocked task manager / process kill, a blocked clipboard, a blocked screen
  capture and a blocked virtual display. The browser remains the system of
  record; the agent only reports and enforces locally. The design is in
  `Brain/LockdownAgent.md`. **Not built in Phase 1.**
- Priority: P2

## Phase 5 — Results & Flags

## Requirement R-040 — MCQ grading
- Description: Auto-grade on submit: correct choice per variant. Score + per-section breakdown shown to student.
- Priority: P0

## Requirement R-041 — Feedback
- Description: After result, feedback form (rating + comment) stored.
- Priority: P1

## Requirement R-042 — Flag taxonomy
- Description: Two disjoint kinds: HR_MISTAKE (admin-added same-day student, roster errors) and MISCONDUCT (proctor-driven). Stored with reason; resolvable.
- Priority: P0

## Requirement R-043 — HR auto-flag
- Description: If roster_updated_at is more than 2h before event start at the 2h mark, auto-create HR_MISTAKE flag on the event.
- Priority: P1

## Phase 6 — Admin Dashboard

## Requirement R-050 — Results & leaderboard
- Description: Per-event scores, filterable, CSV export.
- Priority: P0

## Requirement R-051 — Recording review
- Description: Admin can list and play back stored recordings per student.
- Priority: P1

## Requirement R-052 — Flag + ticket management
- Description: List/resolve flags and tickets in admin UI.
- Priority: P0

## Phase 7 — Hardening & Scale

## Requirement R-060 — 1000-concurrent load
- Description: Stateless API + Nginx; WS telemetry via Redis pub/sub when scaling beyond one node; load-tested with k6 to 1000 virtual users (login/start/answer cadence) with p95 under budget.
- Priority: P0

## Requirement R-061 — Deployment
- Description: docker-compose deployment to the online server; runbook for start, backup, and exam-day checklist.
- Priority: P0

## Phase 1.5 (deferred) — Coding Round

## Requirement R-070 — Judge0 coding round
- Description: Self-hosted Judge0; only offered to students who cleared MCQ; multiple languages supported.
- Priority: P2

## Denied Rules / Decisions
- Website only for Phase 1 — no desktop app. **Changed 2026-10-21:** a Windows
  lockdown agent is now designed (`Brain/LockdownAgent.md`, R-034) and scheduled
  for Phase 2. Phase 1 stays website-only; the agent is not built yet.
- No intranet requirement, no IP allowlist in Phase 1 (deferred by user).
- Raw MediaRecorder (no ffmpeg/transcoding).
- Paper generated at exam start (not pre-generated).
- Coding round excluded from Phase 1.
- The Tier-B strike budget is shared across all warning kinds (one budget of
  three), decided 2026-10-21.
- `display_change` is a warning only: it never raises a `MISCONDUCT` flag on
  its own, decided 2026-10-21.
- The competency of a question has its own endpoint
  (`POST /api/bank/questions/:id/competency`), not a PATCH on the question:
  the question text and its options are immutable after creation, decided
  2026-10-22.
- The skills taxonomy is reference data in its own file
  (`server/sql/taxonomy.sql`), not a migration: a `TRUNCATE ... CASCADE`
  follows the foreign keys down to the skills table, so the seed re-applies the
  taxonomy right after it truncates, decided 2026-10-22.
- **Registration is not a feature.** The exam is invite-only: the roster of an
  event *is* the eligibility list, there is no registration step, no public
  event list and no self-service sign-up. Decided 2026-10-22 (Plan A).
- **The domain selection is a fixed count per chosen domain**, not a fixed
  paper length: the paper grows with the number of domains the student picks.
  Decided 2026-10-22.
