# ExamRobo — Project Profile

## Agent Version
v1.4.0 (`Brain/VERSION`)

## Detected Stack
- Website-first proctored exam platform (Phase 1 = website only, any OS)
- Backend: Node 20/24 + Express 4 + pg + ws + JWT + ioredis (ESM)
- Frontend: React 19 + Vite 8 + Tailwind v4 + React Router 7 + lucide-react
- DB: PostgreSQL 16 (Docker Compose, db port remapped 5450→5432 — local 5432 owned by hsk-pg)
- Cache/bus: Redis 7 (optional — the API runs single-instance without it)
- Deploy target: user's online server (Phase 7)

## Structure
- `server/` — Express API: `routes/` (auth, student, tickets, exam, admin, bank), `services/` (paper, grading, views, live, sessions, lockout, redis, integrity, competency, analytics), `middleware/` (auth, security, async), `scripts/` (seed, migrate, verify, waitfor, scratch-db), `sql/schema.sql` + `sql/migrations/` + `sql/taxonomy.sql` + `sql/backfill.sql`, `smoke.mjs`, `load/k6.js`
- `web/` — white-theme SPA (Login, Waiting, Exam, Result + admin: Events, Live, Results, Recordings, Flags, Tickets, Bank) — `/api` and `/ws` proxied by Vite (dev) and nginx (prod)
- `docker-compose.yml` — db (5450) + redis (6379) + api (4000) + web (8080)
- `..\Exam-Robo-TestLab\` — the test bench next to the app: start/stop/reset/status/check/scenario/collect, 52 automated checks, manual checklist, API reference, diagnostics collector

## Denied Rules / Locked Decisions
- Website only Phase 1 — no desktop app. **Changed 2026-10-21:** a Windows lockdown
  agent is designed (`Brain/LockdownAgent.md`, R-034) and scheduled for Phase 2;
  Phase 1 stays website-only and the agent is not built yet.
- No intranet / IP allowlist in Phase 1 (deferred by user)
- Raw MediaRecorder recording, no transcoding
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

## Key Technical Truths
- The paper row **is** the exam session: one `papers` row per (event, student).
- `answers.qno` is the 0-based position inside `papers.variant_ids` — the array is
  the answer key order, and `question_variants.correct_idx` never leaves the server.
  Grading must therefore shift the 1-based `WITH ORDINALITY` down by one
  (`ord.n::int - 1`) — it did not, and every score was off by one question.
- `ends_at = LEAST(now() + duration, starts_at + duration)`, computed once per paper.
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
  say so; the screen recording is the evidence. The bare OS key press is
  recorded as `os_chord` (logged, never penalised).
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

## Verified (current)
- `npm run verify` (server): all four phases green
  - `node --test`: 90/90 (lockout, redis lockout, rate limit, shared rate limit,
    paper randomization, grading, integrity policy, concurrency, browser signals,
    competency rules + taxonomy, analytics rules, async error safety net)
  - `server/smoke.mjs`: 96/96 against real Postgres (in-process, scratch database)
  - `npm run build` (web): clean
- `..\Exam-Robo-TestLab\check.bat`: 52/52 automated checks through nginx
  (repeatable, and once more after a full `reset.bat`)
- Docker: db + redis + api + web up; SPA, API, WS and the recording upload work
  through `http://localhost:8080`
- Live stack (2026-10-22): the bank serves 39 skills and the 5 difficulty levels,
  the skill/difficulty filters and the re-tag endpoint answer live; the answer
  path 11-18 ms, `GET /api/admin/live` 44 ms (was 101 ms), the fullscreen
  heartbeat 0 → 1 → 1 warnings, two clipboard presses = 2 warnings, the third
  warning auto-submits with `max_warnings`.
- Live stack (2026-10-22, analytics): a student who answered the whole paper with
  the admin key scored 9/9 and saw it broken down by skill and by difficulty; the
  admin cohort showed `students=4 analysed=4` with the weakest skill first, and
  each student's own breakdown came with the leaderboard row.

## Open
- The user still has to click through the new analytics UI in a browser (T-813);
  the API level is verified.
- Live-run scripts must use a **fresh event and a fresh roster address** each
  time: an expired event refuses the login ("This email is not eligible for
  this exam") and every failed login costs a lockout attempt (3 → 15 min block).
