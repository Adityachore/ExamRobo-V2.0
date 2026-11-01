# ExamRobo Log

## 2026-11-01 (final version selection and consolidation)

- **The root tree is the final version.** A read-only audit of all nine on-disk
  ExamRobo trees confirmed this repository (`Desktop\Exam-Robo-main`, branch
  `ui/redesign`, HEAD `7f1dca3` + 91 uncommitted Phase 16/17 files) is the
  newest and most complete code base. `examrobo-3` is a production snapshot
  (2026-10-23) used as the source of ops/content assets; `examrobo-6` is an
  older feature cut; the `Downloads\` copies are backups/fragments/reference.
- **The bank is 1100 questions, not 221.** `Internship_Exam_Question_Bank_1100.md`
  parses to exactly 1100 blocks, 11 domains × 100, 4 options each, 330 Basic /
  715 Medium / 55 High, 55 with a `Scenario:` line. `examrobo-3`'s
  `imported_questions.json` (221) is not the full bank.
- **Decisions locked** (also in `userRequirement.md`, `Not.md`, `Later.md`):
  recorder stays removed; adopt v3 production ops (Cloudflare nginx, `env_file`,
  `DB_PASSWORD`, `127.0.0.1:8083`, `examrobo.pararobo.in`); import the full bank;
  archive duplicates instead of deleting; Brain is the communication medium.
- **Phase 18 opened** in `NextSteps.md` (T-1501..T-1513) with seven phases:
  archive → git baseline → prod ops → code fixes → bank import → verify → release
  → cutover (approval required).
- **Release blockers found:** 91 uncommitted files; root `.env` lacks
  `POSTGRES_PASSWORD` and there is no root `.env.example`; `DEPLOY.md` and import
  tooling exist only in v3; the seed event has no `section_limits`; taxonomy
  carries both `Cyber Security` and `Cybersecurity`; nginx does not forward the
  Cloudflare client IP.
- **Archive created:** `archive/versions/examrobo-3`, `archive/versions/examrobo-6`,
  `archive/db/*.sql.gz`, integrity manifest `archive/MANIFEST.sha256`
  (5,585 files). `archive/`, `*.sql.gz` and `.zcode/` are gitignored.
- **Audit report written:** `AUDIT_FINAL_REPORT.md` (5 empty placeholder audit
  files removed). **Next:** commit the baseline and backfill the v3 assets.

## 2026-10-28 (target migration, results visibility, paper timing)

- **Results visibility is state-driven.** Added `server/services/results.js` and
  `GET /api/student/event` now returns the event visibility, publication time,
  expiry and a student-safe `results_code`. `GET /api/exam/result` returns
  `409 results_not_published`, `403 results_unavailable` or `403 results_expired`
  instead of a single pending response. Submitted students may sign in after the
  event window closes; result access is gated separately.
- **Admin results controls.** Manual events can be published, extended and
  unpublished (`POST /admin/events/:id/publish-results`,
  `/results/extend`, `/results/unpublish`); the legacy boolean `/results`
  endpoint remains as a compatibility wrapper. Publishing requires every
  existing paper to be submitted and an explicit expiry. `GET /admin/session`
  returns one session plus its event history for the live detail view.
- **Event window and paper deadline are separate.** `exam_events.duration_min`
  now controls only the start window. Every paper gets the full sum of its own
  section limits. The student event payload exposes `paper_minutes` and
  `min_paper_minutes`; Waiting/Exam label the window and paper time separately.
- **Option-order grading.** `papers.option_orders` stores display order per
  question. `answers.choice` is the displayed index, while grading and analytics
  map it back to the authored option before comparing with `correct_idx`.
  `submitPaper` now returns `option_orders` so the freeze survives submission.
- **Calculator ported.** `web/src/lib/calculator.js` and
  `web/src/components/exam/Calculator.jsx` add the client-only four-function
  calculator to the runner header and floating panel.
- **Student result states.** `Result.jsx` now handles unavailable, expired,
  after-all-submitted and manual pending responses with distinct copy and the
  expiry timestamp. Tests were added for result state, option-order grading and
  the calculator.
- **Verified:** `npm test` in `server` -> **153 pass**; `npm run build` in `web`
  -> clean (2390 modules, 628 kB JS). `npm run verify` -> unit and web build
  pass; preflight and smoke were **SKIPPED** because Postgres/Redis are not
  running locally.
- **Docs synced.** TRD, Schema, PRD, Flow and Design now describe results
  visibility, option orders, paper timing, the Calculator, and the disabled
  recorder. NextSteps marks the old recorder tasks superseded.
- **Still open:** target-shaped scratch DB and preflight; migration bridge and
  ledger checksum adoption; live cutover approval.

## 2026-10-26 (admin controls, section timing, resume/restart)
- **What was built.** Event CRUD (create, edit blocked after the first paper,
  typed-name delete with cascade cleanup and an active-session kick), roster CRUD
  (single add, edit, soft delete, bulk remove, restore, CSV export,
  `has_paper`), and live-session recovery (`POST /admin/resume`,
  `POST /admin/restart`). Every admin action is audited.
- **Migration 007** (`server/sql/migrations/007_admin_controls.sql`) adds
  `section_limits`, `paper_sections`, `admin_actions`, `paper_attempt_history`,
  roster soft-delete fields, `papers.access_revoked_at`, `papers.attempt_no`,
  `submit_reason='removed'` and the new proctor-event kinds. It is idempotent and
  `schema.sql` mirrors it.
- **Duration and section rules.** Event duration is derived from section limits
  (fixed = sum; select = common + largest allowed combination). Each select
  student's paper uses *their own* common + chosen limits. A section clock starts
  when its first question is opened; an expired section locks only itself while
  the overall paper stays live. Expired sections refuse answers and question
  opens with `code: 'section_expired'`.
- **Recovery rules.** Resume is limited to `integrity_lockout`, `force_submit`
  and `time_expired`; answers/progress survive, section clocks reset, admin
  minutes are added and a reason is required. Restart creates a fresh attempt
  with the same domains, clears answers/warnings/score, resets timers,
  increments `attempt_no` and snapshots the old attempt.
- **Roster removal.** Soft delete, active session kicked, current answers
  submitted with `submit_reason='removed'`, result retained. The removed student
  gets 403 `code:'removed'` from waiting/start; resume is refused with 409
  `student_removed`. Restore re-enables access but not the submitted paper.
- **Frontend.** Events/Roster/Live pages gained the CRUD dialogs, pagination and
  recovery actions; Runner gained section countdowns, locked-section navigation,
  expiry banners and removed/restarted/resumed socket handling; Waiting/Exam now
  read domain selection scoped by event id.
- **Smoke work and the two defects it exposed.** The new coverage initially
  failed on (1) assuming no section rows exist before a question is opened — the
  server correctly returns placeholder rows with null clocks — and (2) reusing
  the seeded event for resume after an earlier test moved a `Frontend` question
  to `Logic`, leaving only two `Frontend` questions while the seeded event needs
  three. The smoke now checks null clocks and gives resume/restart a dedicated
  1/1/1 event.
- **Verification status.** Docker Desktop was started, `docker compose up -d db
  redis` confirmed both containers running, and `cd server && npm run verify`
  passed all four phases: preflight **PASS**, 131 unit tests **PASS**, web build
  **PASS**, and 156/156 smoke assertions **PASS**. T-1309 is green; the earlier
  block was the Docker daemon, not an assertion failure.

## 2026-10-22 (domain selection — Plan A)
- **Decisions taken with the user.** Plan A only: the student picks the
  technical domain(s) the exam asks about. Common part = `Aptitude` + `Logic`;
  the eight technical domains of the taxonomy are selectable (`Frontend`,
  `Backend`, `Cybersecurity`, `Digital Marketing`, `WordPress`, `AI`,
  `Prompt Engineering`, `Machine Learning`). Policy = **a fixed count per
  chosen domain**, so the paper grows with the selection. The picker is in the
  **waiting room**, before "Begin Exam". **Registration is dropped** — the
  roster stays the only eligibility list (no registration table, no
  `/api/register`, no public events list, no Register page, no admin
  Registrations tab).
- **The model.** `exam_events.domain_mode` (`fixed` | `select`) and
  `exam_events.domain_rules` (`{ common, allowed, min, max }`); the count of a
  domain stays in `question_counts`, so there is one place that says what a
  category is worth. The choice is frozen with the paper
  (`papers.selected_categories`), and the domain of every question is frozen
  with it (`paper_questions.category`) — the same rule the skill and the
  difficulty already follow, so re-tagging never moves a section of an exam
  that already ran.
- **Migration 005** (`server/sql/migrations/005_domain_selection.sql`,
  idempotent, re-applied on every boot) + the `schema.sql` mirror + the
  category backfill in `server/sql/backfill.sql`.
- **Server.** `server/services/domains.js` is the single owner of the rules
  and of the validation of a selection. `paper.js` assembles the common part
  plus the chosen domains and refuses a bad selection **before** the paper (and
  the timer) exists. `routes/exam.js` takes `{ domains }`, `routes/student.js`
  carries the rules and the frozen choice, `routes/admin.js` creates a
  domain-aware event, `routes/bank.js` accepts a `category` in the competency
  endpoint.
- **Web.** The picker in `web/src/pages/student/Waiting.jsx` (toggle cards,
  the common part as read-only chips, a live total, the begin button disabled
  until the choice is valid); the choice travels in `sessionStorage`
  (`web/src/lib/domains.js`); `Exam.jsx` sends it and handles a refused
  selection; the admin event form got a "Domain selection" fieldset; the tag
  dialog got the category field.
- **Verified.** `server/test/domains.test.js` — 21 rules; the smoke test grew
  from 96 to **119** assertions (a refused selection leaves no paper, a domain
  that is not on offer is refused, the sections of the paper are its domains,
  re-tagging a question does not move a section of a running paper).
  `npm run verify`: unit + web build + smoke, **all phases passed**.
- **Live check** on the dev stack (`http://localhost:8080`): a domain-aware
  event was created, `/api/student/event` returned the rules, a start without
  a domain was refused with `domains_required`, an unknown domain with
  `unknown_domain`, and a start with `Frontend` produced a paper with the
  sections `Aptitude, Logic, Frontend` and the frozen choice.
- **Open:** the browser click-through of the picker (T-1109) needs the user.

## 2026-10-21
- Session start: AllHailAI invoked; Idea.md read; clarified 8 design points (stack, proctoring+screen recording, Option B variants, no-intranet P1, admin UI now, MCQ now/coding later, website-any-OS, network lockdown question answered as deferred).
- Plan approved ("go, but details" → "go"): raw MediaRecorder; paper at exam start.
- Wrote spec suite: PRD.md (R-001..R-070), Schema.md (12 tables), Flow.md, Design.md, NextSteps.md (43 tasks, T-101..T-801).
- Built Phase 1 (T-101..T-110): docker-compose (db remapped 5450), server (auth+lockout+tickets+waiting+admin events/roster/tickets/flags), web (Login/Waiting/Admin).
- Verified: unit 4/4, web build clean, live smoke 11/11. Initial commit 7736dbd.
- Browser run (agent-browser): found + fixed 2 bugs — Waiting showed 00:00:00 instead of STARTED (started flag ignored); /admin rendered console on a student token (now verifies admin before render). Vite proxy target is port 4000. Commit eb2b684.
- Clean close.

## 2026-10-21 (later — full-stack rebuild against the white-theme reference)
- Rebuilt the whole project on the white-theme SPA contract (root `web/` + `server/` are the read-only reference; this repo is the Postgres implementation).
- Postgres schema rewritten (`server/sql/schema.sql`) + 8 approved delta changes: `roster_emails.updated_at`, `tickets.source`, `papers.current_index`, `papers.submit_reason`, `papers.status`, `recordings.mime`, `exam_events.instructions`, new `proctor_events` table.
- Server written from scratch: `services/{paper,grading,views,live,sessions}.js`, `routes/{auth,student,tickets,exam,admin,bank}.js`, `index.js` (raw recorder mount before the JSON parser, WS `/ws`, expiry sweeper), `scripts/seed.js`, `smoke.mjs`.
- Contract pass against every frontend page: error dialect, role mismatch = 401, `examState` shape, paper without the answer key, `ends_at` computation, warning escalation, grading via `unnest(variant_ids) WITH ORDINALITY`.
- Frontend ported: `web/src` replaced with the 27 white-theme files, `index.html` + `vite.config.js` copied, `package.json` aligned to the reference, `npm run build` clean.
- Verification: `node --check` on 19 files, `node --test` 9/9, `smoke.mjs` 35/35 against real Postgres, build clean.
- Docker: db up on 5450 (13 tables), then the full stack (db + redis + api + web) verified through the nginx gateway on :8080 — SPA, assets, SPA fallback, `/api`, and the WebSocket all work.
- Phase 7 hardening: Redis for the lockout (TTL 15 min, shared across instances, in-memory fallback) and for the WS fan-out (pub/sub on `examrobo:ws`); security headers, CORS allowlist, auth/ticket/recording rate limits, production fail-fast on `JWT_SECRET`, admin bootstrap disabled in production, `.dockerignore` + `npm ci` in the images, `client_max_body_size` and the `/ws` location fixed in nginx, `k6` load script (`server/load/k6.js`).
- Bugs found and fixed during the hardening pass: an async rejection crashed the API (Express 4 does not catch them) → `middleware/async.js` + process guards; a student flag lost its event context → `flags.event_id` (migration 001) + API resolution; the smoke test was not repeatable with the Redis lockout → unique email per run + key cleanup.
- Documentation pass: Schema.md rewritten, TRD.md (the full API contract) created, Issue.md created, NextSteps.md statuses updated, Start.md (onboarding + runbook) created, Design.md refreshed, compact.md and AllHailAI-Progress.md updated.
- Open for the user: browser click-through, the 1000-VU k6 run, and the online-server deployment.

## 2026-10-21 (evening — Test Lab + grading bug)
- Built `Exam-Robo-TestLab\` next to the project: a one-click test bench that never edits the app — `start/stop/reset/status/check/scenario/collect` (.bat wrappers over .ps1), `config/testlab.json`, `checks/run-checks.mjs` (50 zero-dependency checks through nginx), `docs/{TEST-CHECKLIST,API-QUICK-REFERENCE,TROUBLESHOOTING}.md`, README, CREDENTIALS, .gitignore. Reports land in `Exam-Robo-TestLab\reports\`.
- **Bug found by the Test Lab and fixed: the grading was off by one question.** `services/grading.js` joined `unnest(papers.variant_ids) WITH ORDINALITY` (1-based) with `answers.qno` (0-based), so every answer was compared with the key of the *previous* question and the last question was never scored — a student answering all 9 questions correctly got 5/9. Fixed with `ord.n::int - 1 AS qno`.
- Regression guards: new `server/test/grading.test.js` (4 tests, the fake db emulates the Postgres ordinality), the smoke test now answers the whole paper with the admin answer key and asserts a full score (36/36), and the Test Lab has the check "the answer key is graded correctly (admin key, full score)".
- Verified: `node --test` 20/20, `smoke.mjs` 36/36, Test Lab 50/50 (twice, plus once after a full `reset`), scenario `live` (4 running sessions), `status` and `collect` verified.
- Other fixes while building the lab: the compose helpers no longer abort on docker's stderr output, the lab detects a stray `node index.js` holding port 4000, and the lab resolves the project path relative to its own folder.

## 2026-10-21 (night — audit + shared rate limits)
- Task audit: every open task in `NextSteps.md` was checked against the real code. Verified done: T-101..T-708, T-810..T-812. Verified still open: T-504/T-801 (HR auto-flag rule), T-802 (recording retention), T-702/T-814 (1000-VU k6 run), T-813 (browser click-through by the user), T-901 (Judge0 coding round, deferred by design) and the online-server deployment.
- Contract audit of the web client against the API: `admin/Results.jsx` (`data.results`), `student/Result.jsx` (`r.total`, `r.max`, `r.sections[].score/total`), `admin/Live.jsx` (session `key/event_id/current_index/answered/warnings/gaps/chunk_count/last_chunk_at`), `admin/Recordings.jsx` (`data.recordings`, `rec.key`), `admin/Events.jsx` (`data.events`, `categories`), `admin/Roster.jsx` (`data.roster`), `admin/Flags.jsx` (`data.flags`), `admin/Tickets.jsx` (`data.tickets`), `admin/Bank.jsx` (`questions`, `categories[].count`), `student/Waiting.jsx` (`data.event`, `server_time`) — all match the running API. The stale side was `TRD.md`, which has been corrected.
- **T-803 done: the rate-limit counters now live in Redis.** `server/services/redis.js` gained `incrWindow()` (INCR + PEXPIRE on the first hit) and `server/middleware/security.js` grew `createRateLimiter()`: the auth, ticket and recording limiters share a fixed-window counter (`examrobo:ratelimit:<name>:<id>`) across every API instance, and fall back to the in-process map when Redis is down (never fail closed).
- Regression guards: 3 new unit tests in `server/test/security.test.js` (shared counter, per-client counters, Redis-down fallback) and 2 new Test Lab checks ("the rate-limit counter is shared through redis", "the public ticket endpoint is rate limited per IP"). The suite now clears the Redis counters before and after the run so a previous run cannot block the next one.
- Verified: `node --test` 23/23, `smoke.mjs` 36/36, Test Lab 52/52. Live proof: the counter key `examrobo:ratelimit:auth:<ip>|<email>` appears in Redis with a 60 s TTL and counts 3 failed logins.

## 2026-10-21 (late — integrity hardening, Phase 9)
- **Decision: web hardening plus a Windows lockdown agent design.** The Denied Rule "website only for Phase 1 — no desktop app, no lockdown agent" was changed: Phase 1 stays website-only, but a Windows lockdown agent is now designed (`Brain/LockdownAgent.md`, R-034) and scheduled for Phase 2 (T-959/T-960). The user chose "web hardening now, agent design now, build later".
- **Policy (R-030, three tiers, one engine).** `server/services/integrity.js` is the single source of truth: Tier A instant lock (`screenshot_key`, `recording_revoked`), Tier B 3-strike warning (`tab_blur`, `fullscreen_exit`, `clipboard`, `context_menu`, `print`, `second_window`, `second_session`, `display_change`), Tier C log-only (`devtools`, `share_surface`). The client detects; the server decides. The database CHECK constraint rejects a kind the policy does not know.
- **Decisions confirmed by the user:** the Tier-B strike budget is **shared across all warning kinds** (one budget of three, not three per kind); `display_change` is a **warning only** and never raises a `MISCONDUCT` flag on its own.
- **Lock consequence:** the paper is submitted and graded normally with `submit_reason = integrity_lockout`, a `MISCONDUCT` flag is raised, the student is signed out and lands on the lockout screen. Every later answer/start/event call is refused with 409 `locked: true`.
- **Concurrency detection is server-side.** The student JWT carries a sign-in id (`sid`), the client sends a per-tab id (`?tab=`, kept in `sessionStorage`). The socket registry reaps a stale socket on the same tab (a reload) and counts the rest: two tabs of one sign-in are a `second_window`, two sign-ins are a `second_session`. The two are **mutually exclusive** — one mistake never costs two strikes.
- Migration 002 (`server/sql/migrations/002_integrity_hardening.sql`, append-only, idempotent): `papers.lock_reason`, `warnings.detail`, widened `proctor_events.kind` and `papers.submit_reason` CHECKs, `idx_warnings_paper_kind`. `schema.sql` mirrors it.
- Client guards in `web/src/lib/integrity.js` + `web/src/hooks/useIntegrity.js`: clipboard, context menu, print, the screenshot key, window focus, fullscreen, display-surface change, devtools; the recorder reports `recording_revoked` when the capture ends by itself. The start order is fullscreen → paper → recording.
- Proctor dashboard (`web/src/pages/admin/Live.jsx`): violation-kind badges, a locked badge, the lock reason and a manual lock action (`POST /api/admin/lock`).
- **Bugs found by the audit of my own work and fixed:** (1) two tabs of the same exam fought over the WebSocket, because the reap matched the browser-wide sign-in id — now the reap matches the per-tab id; (2) `second_window` and `second_session` were both counted, so one second device cost two of the three strikes — now mutually exclusive; (3) the warning banner showed the technical detail ("Blocked copy.") instead of the policy label — the label wins now.
- **The test loop, and the fix for it.** The earlier session kept retrying `docker version` and re-launching Docker Desktop, which burned minutes without producing information, and the smoke test was destructive and had never actually been run. Three changes: (a) `server/app.js` was split out of `index.js` so a test can boot the API **in-process on an ephemeral port** — no second process, no fixed port, nothing left behind; (b) `server/scripts/waitfor.mjs` gives every wait a deadline, and `server/scripts/verify.mjs` runs the whole verification as **one command with four phases** (preflight → unit → web build → smoke) where a failed phase is recorded and the next phase still runs, a phase that cannot start is reported SKIPPED, and nothing ever launches an application; (c) the smoke test can no longer touch the live database — `server/scripts/scratch-db.mjs` refuses any database whose name does not end in `_smoke`/`_test`, and `npm run verify` creates the scratch database, tests against it and drops it.
- **First-ever execution of the smoke test:** 47/48 on the first run; the one failure was a stale assertion (the leaderboard now has four examinees, not two, because the integrity students were added). After the fix: **51/51 smoke assertions, 40/40 unit tests, clean web build, all four verify phases green.** The live database was checked afterwards and is untouched (1 admin, 1 event, 10 questions, 2 roster, 1 paper) and no scratch database was left behind.
- The live stack was rebuilt and runs the refactored code: `docker compose up -d --build` → API on :4000 healthy, web on :8080 serving 200, migrations 001 + 002 applied.
- Documentation: PRD (R-030 rewritten, R-033, R-034, Denied Rules changed), TRD (the new contract: `sid`, `?tab=`, the integrity event table, `POST /api/admin/lock`, the locked shapes, the `locked` socket message), Schema (migration 002), Design (the tier model), Flow (the lockout and concurrency paths), Issue (the browser limits, the agent decisions still needed), NextSteps (Phase 9, T-950..T-960), Start (the `npm run verify` runbook) and this log.

## 2026-10-21 (late — the four live exam defects)
- **What the user reported, measured, and fixed.** A real exam session showed: copy/paste never counted, the screenshot key never counted, fullscreen not enforced, and the exam slow. Every diagnosis was taken from the live database and from timings, not from a guess.
- **Clipboard: the DOM events never fired.** The exam page has no editable field (`<input type="radio" class="sr-only">`), so `copy`/`cut`/`paste` never fire and the old guard saw nothing — the live database had **0** clipboard rows. The keyboard is the only signal that is always available, and preventing the keydown is also the only way to block a paste. Every press counts (the user's decision); holding a key down is one attempt; the DOM event (browser menu) is deduplicated against the key press.
- **Screenshot: counted, but the browser cannot stop it.** The key press ends the exam on the first occurrence (the policy already said so) and the clipboard is wiped. What the page cannot do is stop the OS from taking the picture — `preventDefault()` on PrintScreen does not stop the capture and Windows consumes Win+Shift+S. The instructions now say this honestly; the screen recording is the evidence. The bare operating-system key press is recorded as `os_chord` (Tier C, logged, never penalised) because it is the only in-page trace of the snipping tool.
- **Fullscreen: the real bug was a false positive.** The `fullscreenchange` handler reported an exit without checking that fullscreen was actually left. F11 does not set `document.fullscreenElement`, so *entering* fullscreen with F11 looked like leaving it and cost the student a warning. Now: a true → false **transition** only, the window is compared with the screen (±16 px), a 1 s watchdog and a resize check catch the rest, and outside fullscreen the question is not rendered at all (hard block, the user's decision). The server keeps the last state (`papers.fullscreen_state`, migration 003) and the heartbeat carries it, so a client that lies or dies cannot hide the exit; the client report and the heartbeat are deduplicated, so one incident is one warning.
- **Performance, measured before and after.** The answer path was 6-7 sequential database round trips plus a Redis publish on every click, because it also re-read the whole session view for the proctor dashboard (16.7 ms on its own). It is now a single statement (the answer, the position and the **exact** answered count — the count was wrong before when a question was re-answered), and the dashboard gets a cheap `session_patch` instead of a full session. The live dashboard query was six correlated subqueries per paper; it is now one CTE over the scope: **16.7 ms → 0.97 ms**, `GET /api/admin/live` **101 ms → 44 ms**, the answer round trip **11-18 ms**. The client clock ticked 250 ms (four re-renders of the whole runner per second); it ticks 1 s and the countdown owns its own ticker.
- **Four more defects found on the way.** The admin event filter turned a uuid into `NaN`; a variant an exam was using could be deleted (the paper freezes its variant ids — a live exam would lose a question and a submitted paper would become ungradable); a student name could become a formula in the results CSV; the results page showed an empty badge for a lockout.
- **New files:** `web/src/lib/integrity-signals.js` (the pure signal rules, no browser globals, so the server can test the exact code the browser runs) and `server/test/client-signals.test.js` (17 tests). Migration `003_exam_integrity_v2.sql` (`papers.fullscreen_state`, `os_chord` in the `proctor_events.kind` CHECK, `idx_papers_started`) is append-only and idempotent.
- **Verified:** `npm run verify` → preflight ✓, **59/59 unit tests** (40 → 59), web build clean, **63/63 smoke assertions** (51 → 63) on the scratch database, all four phases green. Live proof on the running stack: the heartbeat in fullscreen = 0 warnings, leaving fullscreen = 1 warning, staying out = still 1; two clipboard presses = 2 warnings; the third warning auto-submitted with `max_warnings`; the answered count went 1 → 2 → 3 exactly. The live database was not seeded or truncated by any of this.

## 2026-10-22 (question bank v2 — the competency model, roadmap Phase 1)
- **What was asked:** the first step of the product roadmap — a real `skills` taxonomy and a `difficulty` on every question, a competency mapping, and an admin UI. Decided with the user: the competency is the full skills + difficulty taxonomy, "selected" stays a top-N automatic selection, backend first with a thin UI.
- **The model.** A skill is a stable code (`logical_reasoning`), a name, a category and a description; a question carries one skill and one difficulty (1 foundation … 5 expert, default 3). The code is the key, so a skill can be renamed without breaking a question, a paper or a report. The rules live in one place (`server/services/competency.js`): the categories, the scale, the code normalisation and the validation. The API, the tests and the admin UI all go through it, so they cannot drift apart.
- **The paper freezes the competency.** `paper_questions` (paper_id, qno, variant_id, skill_id, skill_code, difficulty) is written in the same statement as the paper, so a re-tag never rewrites an exam that already ran. The frozen row keeps the skill code as *text*, so it survives a rename or a delete of the skill. The smoke test proves it: it re-tags a question an exam used and reads the frozen row back.
- **The taxonomy is reference data, not a migration.** A `TRUNCATE ... CASCADE` follows the foreign keys from `questions` down to `skills`, so the seed truncates the bank and then wipes the taxonomy. The 39 skills therefore live in `server/sql/taxonomy.sql`, applied on every boot (`applyTaxonomy()`), in every scratch database, and right after the seed truncate. A migration cannot hold them: it is re-applied on every boot and cannot restore what a truncate removed.
- **New API.** `GET /api/bank/skills` (the taxonomy and the scale, so no client hard-codes either), `POST /api/bank/skills`, `DELETE /api/bank/skills/:id` (409 when a question uses it), `?skill=` / `?difficulty=` filters on the question list, `skill` + `difficulty` on question creation, and `POST /api/bank/questions/:id/competency` — the only way a question changes after it was created. There is deliberately no PATCH on a question: the text and the options are immutable, only the competency moves.
- **New UI.** The admin bank page has a Questions tab (skill and difficulty filters, skill and difficulty badges, a tag dialog) and a Skills tab (the taxonomy by category, add a skill, delete an unused one).
- **Two bugs the work exposed, both fixed.** (1) The `DELETE /api/bank/skills/:id` handler used `req` where the parameter was named `_req` → a `ReferenceError`. (2) **The async-error safety net protected nothing.** `middleware/async.js` patched the router's methods, but every router calls it at the *end* of the file — after its routes are registered — so no handler was ever wrapped. A rejected promise therefore reached Node as an unhandled rejection and **killed the API** (it did, in the smoke run: the process died on the bug above). The wrapper now also covers the handlers that are already registered, and `server/test/async-errors.test.js` pins it: a failing route answers 500 and the server keeps running.
- **The dev environment was not seeded or truncated.** The 10 dev questions were tagged in place with an UPDATE (6 skills, difficulties 1–3), so the existing papers, the roster and the leftover `livetest@example.com` row survived. The API and web images were rebuilt (`docker compose up -d --build api web`) and the API applied migration 004 at boot.
- **Verified:** `npm run verify` → preflight ✓, **83/83 unit tests** (59 → 83: 19 competency rules + 5 async-error), web build clean, **84/84 smoke assertions** (63 → 84), all four phases green. Live on the running stack: 39 skills and the 5 difficulty levels served, the skill and difficulty filters answer, a re-tag answers 200, an invalid difficulty is 400 and a duplicate code is 409.
- **Documentation:** PRD (R-013, two new decisions), TRD (the bank contract + the competency rules), Schema (the `skills` table, the `questions` columns, `paper_questions`, the indexes, migration 004 and why the taxonomy is a data file), NextSteps (Phase 11, T-1001..T-1010), Design, Flow, compact, Project and this log.
- **Next:** results analytics per skill and per difficulty (T-1010) — the frozen `paper_questions` rows are already the data it needs.

## 2026-10-22 (results analytics — the competency model put to work, roadmap Phase 3)
- **What was asked:** T-1010 — results analytics per skill and per difficulty, the next
  step of the agreed roadmap. The frozen `paper_questions` rows were already the data it
  needed; nothing was invented.
- **The rule that shaped everything: the analytics read the FROZEN competency, never the
  bank as it looks today.** A question re-tagged tomorrow must not change what today's
  exam measured. The smoke test proves it through the public API: it re-tags a question an
  exam used, reads the result again and gets the same numbers.
- **Three numbers per bucket, not one.** `total` (the questions of that bucket in the
  paper), `answered` (the ones the student answered) and `correct`. **An unanswered
  question is not a wrong answer** — so the accuracy is `correct / total`, and the numbers
  next to it say how much of the paper the student actually reached. A question with no
  skill lands in a bucket called "Not tagged" (amber, the same hole the bank page shows).
- **New service `server/services/analytics.js`:** one batched query over
  `paper_questions` + `question_variants` + `answers` + `skills` for the whole scope.
  `competencyOfPaper(paperId)` (the student), `competencyByPaper(paperIds)` (a map, one
  query) and `cohortOf(byPaper)` (the scope added up, the weakest skill first). Only
  counts leave the server — the key never does.
- **New API:** `GET /api/exam/result` carries `competency`; `GET /api/admin/results`
  carries it per student; `GET /api/admin/analytics` is the cohort of an exam
  (`event_id`, `students`, `analysed`, `skills`, `difficulties`);
  `GET /api/admin/analytics.csv` exports it
  (`dimension,key,label,category,total,answered,correct,accuracy`). The CSV keeps the
  formula-injection guard of the results CSV (`csvCell`).
- **The backfill (`server/sql/backfill.sql`).** The papers that ran before the taxonomy
  existed have no frozen competency, so there was nothing to report about what they
  measured. The backfill rebuilds it from the **current** tags and says so in the file —
  it is an approximation (today's tags, not the tags of the day the exam ran); nothing else
  is invented, and from then on it is frozen like any other paper. It is applied on every
  boot **after** the taxonomy (it reads the skill code) and to every scratch database, and
  it is idempotent (`NOT EXISTS` + `ON CONFLICT (paper_id, qno) DO NOTHING`).
- **New UI.** The student result gained a "What this exam measured" card (By skill / By
  difficulty); the admin results page gained the cohort panel, the per-student breakdown in
  the expanded row and the CSV export. `Tabs` moved from `components/admin.jsx` to
  `components/ui.jsx`, because two roles now need it and it cannot live in the admin
  bundle any more.
- **Verified:** `npm run verify` → preflight ✓, **90/90 unit tests** (83 → 90: 7 analytics
  rules), web build clean, **96/96 smoke assertions** (84 → 96: 12 new), all four phases
  green. The live stack was rebuilt and the backfill ran on the 3 legacy dev papers (9
  snapshot rows each, 5 distinct skills).
- **Live proof through nginx on :8080:** a student who answered the whole exam with the
  admin key scored 9/9 and saw it broken down — 5 skills (Quantitative Reasoning 3/3, HTML
  & CSS 2/2, JavaScript Fundamentals 1/1, Logical Reasoning 1/1, Pattern Recognition 2/2)
  and 3 difficulty levels (Foundation 5/5, Easy 3/3, Medium 1/1); the admin cohort showed
  `students=4 analysed=4` with the weakest skill first, and the leaderboard carried each
  student's own breakdown.
- **Two live-run defects of my own scripts, not of the app:** a duplicate `-Method` argument
  in the PowerShell call aborted the first student run (no paper, so "No exam session." —
  the server was right), and the first event had expired, so `student@example.com` was
  refused ("This email is not eligible for this exam") and two lockout attempts were spent
  on that address. Both were script problems; the second cost a real attempt on the
  lockout budget, so the next live run needs a fresh event and a fresh address.
- **Documentation:** PRD (R-014), TRD (the result shape, the two analytics endpoints, the
  analytics rules), Schema (the backfill as a data file), NextSteps (Phase 12, T-1011..T-1016),
  Design (the analytics UI), Flow (the analytics flow), Start, Project, Project_Guide,
  AllHailAI-Progress and this log.
- **Next:** exam history and the automatic top-N selection of a student for an exam
  (roadmap Phase 4), then option-order shuffle and the registration/slots/approval work.

## 2026-10-22 (candidate exam path - exact UI specification)
- **What was asked:** apply `ExamRobo_Exact_UI_Design_Specification.md` to the existing React
  SPA. Decided with the user: critical candidate path only (login, waiting, instructions,
  runner, navigator, submit, result, locked), **web only**, no API/schema/behaviour changes.
- **Tokens and shell.** `web/src/index.css` now carries the exact canvas/surface/line, ink/body/
  muted, primary/hover/soft/ice, danger/warn/ok (+ ink/soft) and teal palette, the 6/12/16 px
  radii, card/float shadows, 15 px base, visible focus rings and safe-area helpers.
  `index.html` gained `viewport-fit=cover`, the theme colour and the product title.
- **Shared UI.** `ui.jsx`: `Logo`, `Button` (including `size="lg"`), `Field`/`Input`/`Select`/
  `Textarea`, `Badge`/`Banner`, `EmptyState`/`Card`, `Modal` (rounded-2xl + float shadow) and a
  new exported `Drawer` with Escape close, focus trap, body scroll lock and focus restore.
- **Login.** 46/54 split panel at `lg`, brand aside with the exam-session illustration,
  "Smarter Exams. Safer Tomorrow.", "Welcome Back" form, inline email validation, Contact Team
  preserved. No password, remember-me or forgot-password UI was invented: the API has none.
- **Waiting.** Next-exam hero, schedule/duration chips, server-anchored countdown, started/waiting
  states, instructions from the exam team, explicit loading/missing/offline states. No exam list
  and no question count were invented (neither exists in `/student/event`).
- **Exam gate.** Instructions with four numbered rules, live readiness sidebar backed by
  `/api/health`, fullscreen and screen-share capability checks, server-time start gate and
  closed-window gate, a three-step starting progress panel, and blocked/checking states.
  `begin()` still requests fullscreen, starts the paper, then starts the recorder in the same
  order; no server call changed.
- **Runner.** Sticky header (event, question position, warnings, autosave, recording, timer),
  mobile status row, section rail with progress, 3-column shell with a persistent navigator at
  `xl`, question card, responsive footer with Review & submit, navigator Drawer on smaller
  screens, and the submission dialog. Autosave, the 15 s snapshot, WebSocket reconciliation,
  integrity reporting, expiry, fullscreen blocking and resume all keep their original logic.
- **Submit dialog.** Answered / Unanswered / Total tiles from the client's current answers, with
  a warning when questions remain. It deliberately does not show "marked for review": there is
  no persistence model for it. The result API also does not expose answered/unanswered counts,
  so the result page does not fabricate them.
- **Result and Locked.** Completion hero, Exam/Submitted/Score summary, score ring with the token
  colours, section bars, competency tabs (by skill / by difficulty) and feedback; "Finish & sign
  out" is primary. The lockout screen keeps its notice, forced sign-out and recording/flag copy,
  with the new danger/ice background treatment.
- **Review fixes.** A Retry button inside the login form is now `type="button"` (it could submit
  the form twice), an automatic lock/submit now closes a stale SubmitDialog, modal/drawer initial
  focus ignores disabled controls, and the Exam header now aligns with its max-w-5xl content.
- **Verified:** `npm run build` in `web` -> clean, **1967 modules**, JS
  `index-CFsKT0pX.js` (425.74 kB / 124.99 kB gzip), CSS `index-D05cebHI.css` (48.74 kB / 8.95 kB
  gzip). `npm run verify` in `server` -> unit and web build pass; preflight and smoke are
  **SKIPPED**, not green, because Postgres (`localhost:5450`) and Redis (`localhost:6379/9`) are
  not running in this environment.
- **Not done:** a manual browser click-through at 320/390/tablet/1280 px and a screen-reader pass.
  Static review covered focus handling, landmarks, labels, color-only state and overflow, but it
  is not a substitute for the browser run.
- **Documentation:** this entry, `Brain/Design.md` (candidate layout, tokens, primitives, data
  constraints), `Brain/NextSteps.md` (Phase 13, T-1030..T-1039) and `Brain/Issue.md` (open UI/data
  limits). No backend files were touched.
- **Next:** run the browser click-through (T-1039); when Postgres/Redis are back, re-run
  `npm run verify` so preflight and smoke are green too.

## 2026-10-22 — 1B/1C delivery and connection hardening

- **Per-question delivery.** `/exam/start` now returns a manifest (`paper_id`, section/question ids
  only); `GET /exam/question/:index` hydrates one stem/options on demand. The runner caches one
  question, shows loading/retry states and never renders a stale question under a new index.
- **Delivery metadata.** Migration 006 and `schema.sql` add `papers.last_seen_at/source`,
  `warnings.source/client_event_id`, the partial unique warning index and `network_gap` in the
  proctor-event kind check. `touchPaper()` records `seb`/`web`; snapshots persist last contact.
- **Network gaps.** A snapshot gap of `NETWORK_GAP_SEC` (default 45s) is a server-only `LOG`
  event: it reaches the proctor log, never the warning count, and never submits.
- **Limits and auth.** Per-student fixed-window limits cover start/question/answer/snapshot/event/
  submit/result/feedback; JWT lifetime is 4h (`JWT_TTL` overrides).
- **WebSocket tickets.** `POST /api/ws/ticket` issues a 48-hex, one-time, 60s ticket (Redis with
  in-memory fallback). `/ws` accepts only `?ticket=`; `?token=` is gone. Runner, admin Live and
  smoke use the ticket endpoint.
- **Headers and resilience.** API responses now carry CSP `default-src 'none'` plus no-store;
  nginx adds the frontend CSP/security headers. The client shows an Online/Reconnecting/Offline
  badge and persists pending answers in `localStorage`, flushing on mount/online/submit.
- **Verified:** `node --test` -> **127 pass**; `npm run build` in `web` -> clean;
  `npm run verify` -> all four phases pass, including **132/132 smoke assertions**.
  The API/web Docker images were rebuilt so migration 006 and the new frontend are
  live; ngrok reaches `/admin/login` and the health endpoint. `Brain/NextSteps.md`
  records T-1208..T-1211.
- **Next:** run `cd server && npm run verify` when the services are up; then T-1205/T-1207 (real
  SEB file and Windows acceptance).
