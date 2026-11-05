# ExamRobo — Project Profile

## Agent Version
v1.5.0 (`Brain/VERSION`)

## Detected Stack
- Website-first proctored exam platform (Phase 1 = website only, any OS)
- Backend: Node 20/24 + Express 4 + pg + ws + JWT + ioredis (ESM)
- Frontend: React 19 + Vite 8 + Tailwind v4 + React Router 7 + lucide-react
- DB: PostgreSQL 16 (Docker Compose, db port remapped 5450→5432 — local 5432 owned by hsk-pg)
- Cache/bus: Redis 7 (optional — the API runs single-instance without it)
- Deploy target v1.5: user's online server (Phase 7). v2.0: India-region managed
  Postgres + two stateless API instances + Redis; provider chosen after gate G1.

## Structure
- `server/` — Express API: `routes/` (auth, student, tickets, exam, admin, bank), `services/` (paper, grading, views, live, sessions, lockout, redis, integrity, competency, analytics), `middleware/` (auth, security, async), `scripts/` (seed, migrate, verify, waitfor, scratch-db), `sql/schema.sql` + `sql/migrations/` + `sql/taxonomy.sql` + `sql/backfill.sql`, `smoke.mjs`, `load/k6.js`
- `web/` — white-theme SPA (Login, Waiting, Exam with Calculator, Result + admin: Events, Live, Results, Flags, Tickets, Bank) — `/api` and `/ws` proxied by Vite (dev) and nginx (prod)
- `docker-compose.yml` — db (5450) + redis (6379) + api (4000) + web (8080)
- `..\Exam-Robo-TestLab\` — the test bench next to the app: start/stop/reset/status/check/scenario/collect, 52 automated checks, manual checklist, API reference, diagnostics collector

## Skills
- **graphify** — codebase knowledge graph. Source: `Brain/skills/graphify/SKILL.md`
  (project cache, registered for opencode via `opencode.json` →
  `skills.paths`). CLI: `graphifyy` v0.9.102 (`uv tool install graphifyy`;
  binaries in `C:\Users\Asus\.local\bin`). Use for onboarding/architecture
  questions, pre-change impact analysis, PR blast-radius checks, and exploring
  `server/services/` + `routes/` relationships. Do not use when the exact
  file/symbol is already known — grep/read is faster.

## Denied Rules / Locked Decisions
- Website only Phase 1 — no desktop app. **Changed 2026-10-21:** a Windows lockdown
  agent is designed (`Brain/LockdownAgent.md`, R-034) and scheduled for Phase 2;
  Phase 1 stays website-only and the agent is not built yet.
- No intranet / IP allowlist in Phase 1 (deferred by user)
- Screen-recording upload is removed; the `recordings` table, existing rows and
  the Docker volume are retained. There is no active recorder client or route.
- Paper generated at exam start, not pre-generated
- Coding round (Judge0) = Phase 1.5 only, after MCQ clearance
- Live proctor dashboard required in Phase 1 (P4)
- Question bank: 3–4 fully self-contained variants per question (Option B)
- 1000 concurrent target — P7 load test
- Integrity: three tiers (lock / 3-strike warn / log-only) in one server-side
  engine; the client only reports the kind
- The Tier-B strike budget is **shared across all warning kinds** (one budget of 3)
- `display_change` is a warning only — it never raises a MISCONDUCT flag itself
- `second_window` and `second_session` are mutually exclusive — one mistake never
  costs two strikes

### Phase 20 (v2.0 SaaS) — locked decisions (2026-11-05)
- Multi-tenant; forced Postgres RLS; the app role never has `BYPASSRLS`.
- Institution at `slug.examrobo.com`; Super Admin at `admin.examrobo.com`.
- Staff: one institution per principal; owner + multiple admins + employees;
  owner transfer only by Super Admin.
- Staff auth: password; Admin sets a 24h temp password; forced change.
- Super Admin: password + WebAuthn; two accounts + backup codes.
- Student auth: email OTP / magic link; unique email per student; one institution
  per student; no self-registration.
- OTP fallback: invigilator-issued one-time PIN, 15-min expiry, audited.
- Taxonomy and bank are per institution; the 1100-question pack is imported on
  request; papers keep frozen copies.
- New API under `/api/v2`; existing exam routes stay backward compatible.
- Release scope: institutions + exams; **no billing** in v2.0.
- Limits: 5 active events, 500 students/event, 50 concurrent per institution,
  1000 total platform-wide.
- Admission: warn at 80%, hard block new starts at 100%, never interrupt live exams.
- Sessions: 15-min access + 7-day rotating refresh.
- Plan expiry: optional date; auto-deactivate; deferred until live papers end (max 24h).
- Closure: deactivate, retain data; manual purge only, annual review.
- Purge (Super Admin only): students, bank, results; keep staff/institution/audit.
- Export: Admin results only; Super Admin full archive before purge.
- Minors: institution is controller; platform is processor; no DOB by default.
- Legacy: internal non-public institution `ParaRobo`; oldest admin -> owner, rest
  -> employees.
- Student transfer: new account at the new institution; old principal deactivated;
  old data stays.
- Exam history / top-N: deferred to v2.1.
- Hosting: India region, managed Postgres + 2 API + Redis; provider after G1.
- Roster import: valid rows import, errors reported; event cannot start until the
  Admin acknowledges errors; re-import is idempotent.
- Email: platform sender (`no-reply@examrobo.com`) + institution Reply-To.
- Pending institution: status-only access until Super Admin approval.

## Key Technical Truths
- The paper row **is** the exam session: one `papers` row per (event, student).
- `answers.qno` is the 0-based position inside `papers.variant_ids` — the array is
  the answer key order, and `question_variants.correct_idx` never leaves the server.
  Grading must therefore shift the 1-based `WITH ORDINALITY` down by one
  (`ord.n::int - 1`) — it did not, and every score was off by one question.
- `exam_events.duration_min` is only the start window. A paper's `ends_at` is
  its start plus the full sum of its own `section_limits`; the event window
  never truncates the paper deadline.
- `papers.option_orders` stores each question's displayed option order.
  `answers.choice` is the displayed index and is mapped back to the authored
  option before grading or analytics.
- Results are state-driven: `immediate`, `after_all_submitted`, `manual` and
  `never`. Manual publication has an expiry; `results_published` is only a
  compatibility mirror of `results_published_at`.
- The SPA (`C:\Users\Asus\Downloads\examrobo-frontend\web`) is the read-only
  contract reference; `server/` + `server/index.js` next to it is the read-only
  mock that defined the error dialect.
- Redis is optional: absent → in-memory lockout + local WS fan-out.
- Rate-limit counters are shared through Redis (`examrobo:ratelimit:<name>:<id>`,
  INCR + PEXPIRE); without Redis the limiter falls back to the in-process map.
- The API is the clock and the grader; the client only renders.
- The integrity policy is server-side in `server/services/integrity.js`; the
  database CHECK on `proctor_events.kind` is the backstop for an unknown kind.
- A lock is terminal: the paper is submitted (`integrity_lockout`), a MISCONDUCT
  flag is raised, later calls are refused with 409 `locked: true`.
- Concurrency needs two ids: the JWT `sid` identifies the **sign-in**, the
  `?tab=` id identifies the **browser tab**. The reap matches the tab (a reload
  is not a second window); two sign-ins are a second device.
- **The exam page has no editable field**, so the DOM `copy`/`cut`/`paste`
  events never fire there. The clipboard is detected from the keyboard, and
  preventing the keydown is the only way to actually block a paste.
- **A website cannot stop an operating-system capture.** The screenshot key is
  counted and ends the exam, but the picture is still taken. The instructions
  say so; screen recording is disabled, so the proctor event log is the
  evidence. The bare OS key press is recorded as `os_chord` (logged, never
  penalised).
- **F11 does not set `document.fullscreenElement`.** A fullscreen exit is a
  true → false transition, never an event: F11 used to look like leaving
  fullscreen. The window is compared with the screen (±16 px) instead.
- **One incident is one warning.** The client report and the server heartbeat
  both see the same fullscreen exit; they are deduplicated (10 s window on the
  server, plus the stored `papers.fullscreen_state`).
- The client rules live in `web/src/lib/integrity-signals.js` (pure, no browser
  globals) so the server can test the exact code the browser runs.
- **A skill is a stable code, a name and a category**; a question carries one
  skill and one difficulty (1 foundation … 5 expert, default 3). The code is
  the key, so a skill can be renamed without breaking anything.
- **The paper freezes the competency of its questions** (`paper_questions`), so
  re-tagging a question never rewrites an exam that already ran. The frozen
  row keeps the skill code as text, so it survives a rename or a delete.
- **The taxonomy is reference data in its own file, not a migration.** A
  `TRUNCATE ... CASCADE` follows the foreign keys from `questions` down to
  `skills`, so the seed truncates the bank and then re-applies
  `server/sql/taxonomy.sql`. It is also applied on every boot and to every
  scratch database.
- **The backfill is reference data too, and it runs after the taxonomy.**
  `server/sql/backfill.sql` rebuilds the frozen competency of the papers that
  ran before the taxonomy existed, from today's tags — an approximation, and
  the file says so. Idempotent, applied on every boot and to every scratch
  database.
- **The analytics read the frozen competency, never the bank of today.** A
  re-tag changes the bank, never the result of an exam that already ran.
- **Three numbers per bucket: `total`, `answered`, `correct`.** An unanswered
  question is not a wrong answer; `accuracy` is `correct / total`. A question
  with no skill lands in a "Not tagged" bucket. Only counts leave the server.
- **`wrapRouter` must cover the handlers that are already registered.** The
  routers call it at the end of the file, after their routes exist — patching
  the router's methods alone protected nothing, and a rejected promise took
  the whole API down.
- `server/app.js` holds the routes and sockets, `server/index.js` only the
  process bootstrap — that split is what lets a test boot the API in-process.
- **Verification is one command: `npm run verify`.** Phases: preflight → unit →
  web build → smoke. Each runs once with a deadline; a failed phase is recorded
  and the next still runs; nothing launches an application.
- **A test may only touch a database named `*_smoke` or `*_test`** —
  `server/scripts/scratch-db.mjs` enforces it in code, not in a readme.
- **The live dashboard is one CTE query over the scope** (0.97 ms), not six
  correlated subqueries per paper (16.7 ms). The answer path is one statement,
  and the dashboard is updated with a cheap `session_patch` instead of a full
  session read on every click.
- **An event's duration is derived from its section limits.** Fixed events use
  the sum of their limits; select events use the common part plus the largest
  allowed combination. Each select student's paper deadline is their own common
  part plus the limits of the sections they chose.
- **A section clock starts when its first question is opened.** An expired
  section locks only itself; the rest of the paper and the overall deadline stay
  live. Expired-section answers and question opens are refused with
  `code: 'section_expired'`.
- **Resume is deliberately narrow:** only `integrity_lockout`, `force_submit`
  and `time_expired` papers can be resumed. Answers and progress are preserved,
  section clocks reset, admin minutes are added and a reason is mandatory.
- **Restart is a fresh attempt:** same selected domains, no answers/warnings/
  score, reset timers, `attempt_no + 1`, and the old attempt is snapshotted in
  `paper_attempt_history`.
- **Event edits stop after the first paper exists.** Deletion is still allowed
  with a typed event-name confirmation and cascades the event's data.
- **Roster removal is a soft delete with consequences:** active sessions are
  kicked and submitted with `submit_reason='removed'`; the result is kept and
  re-adding the email restores access but never resurrects the submitted paper.
- **Domain selection is scoped to the event id**, not to a bare session-storage
  array, so two events cannot leak a chosen domain into each other.

## Verified (current)
- **2026-11-01 (v1.5.0, Phase 19):** `cd server && npm run verify` green on the
  release machine: preflight PASS, 161 unit tests PASS, web build PASS,
  187/187 smoke assertions PASS.
- Prior green baseline: 2026-10-26 (Phase 16), 131 unit / 156 smoke.
- Older baseline: 90/90 unit, 96/96 smoke; Test Lab 52/52 through nginx; live
  analytics proof (`students=4 analysed=4`, weakest skill first).
- `Brain/NextSteps.md` T-1309 is COMPLETED.
- **2026-11-05:** baseline docs corrected (migrations 001-013, v1.5.0 counts,
  18 domain tables + ledger); lockfiles restored. The local verify re-run has no
  Postgres/Redis, so preflight and smoke are reported SKIPPED, not green.

## Open
- T-1521 browser click-through (four submit paths + archived-event UI) and
  T-1518 real 50-VU k6 run are still pending; neither blocks a v1.5 deploy.
- T-1513 v1.5 production cutover is **superseded** by v2.0/Phase 20; v1.5 stays
  the rollback baseline.
- `server/.env` has a stale DB password and the live DB has no exam event;
  re-check both before any live migration.
- Phase 20 external inputs: hosting provider (after G1), SMTP host/credentials +
  SPF/DKIM/DMARC, legal DPA/privacy/terms + minors attestation, legacy
  email-collision report (needs the live DB), RPO/RTO targets.
- Live-run scripts must use a **fresh event and a fresh roster address** each
  time: an expired event refuses the login ("This email is not eligible for
  this exam") and every failed login costs a lockout attempt (3 → 15 min block).
