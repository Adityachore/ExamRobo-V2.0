# ExamRobo

## Project Goal
Website-first proctored exam platform (Phase 1 = MCQ only, any OS, any browser).
The Postgres-backed API is the system of record; the white-theme React SPA is
the client. Deployment target: the user's online server (Phase 7).

## Documentation Map
1. **Start.md**: (You are here) Onboarding map + runbook.
2. **Brain/PRD.md**: Product requirements (R-001..R-070).
3. **Brain/TRD.md**: Technical requirements — the API contract, error dialect, WS protocol.
4. **Brain/Schema.md**: The 13 database tables and their columns.
5. **Brain/Design.md**: UI layout, palette, component tree, integrity tiers.
6. **Brain/Flow.md**: Happy paths and failure paths.
7. **Brain/compact.md**: State snapshot and technical truths.
8. **Brain/NextSteps.md**: Current task queue.
9. **Brain/Issue.md**: Technical debt and open questions.
10. **Brain/Log.md**: Decision history.
11. **Brain/LockdownAgent.md**: The Phase-2 Windows lockdown agent (design only).

## Core Constraints
- No hard-deletes on business entities.
- Always read files before editing.
- Denied Rules must be respected (website only in Phase 1, no intranet in Phase 1,
  raw MediaRecorder, paper generated at exam start, coding round = Phase 1.5).
- The reference implementation in `C:\Users\Asus\Downloads\examrobo-frontend\web`
  and `...\server` is read-only: it defines the contract, this project implements it.
- The correct answer never leaves the server before submit.
- **The integrity policy is server-side.** The client reports a kind; the server
  decides the tier and the outcome.

## Current Phase
Phase 12 — results analytics (the competency model, put to work). Phases 1–11
are implemented and verified. A result says what the exam measured: the
student sees their score per skill and per difficulty, the admin sees the same
per student plus a cohort view (the weakest skill first, exportable as CSV),
and every number comes from the competency the paper froze. `npm run verify` →
90/90 unit tests, 96/96 smoke assertions against a scratch database, clean web
build.

## Verification — one command

```powershell
cd server
npm run verify
```

Four phases, each run once, each with a hard deadline:

| Phase | What it does | On failure |
|---|---|---|
| 0 preflight | postgres + redis reachable (45 s cap, in parallel) | reported as SKIPPED, the run continues |
| 1 unit | `node --test` | recorded, the next phase still runs |
| 2 web build | `vite build` | recorded, the next phase still runs |
| 3 smoke | the full API smoke test | recorded, the summary still prints |

The smoke phase creates the database `examrobo_smoke`, boots the API
in-process on an ephemeral port, runs the assertions and drops the database
again. **The live database is never reachable from a test** — the code in
`server/scripts/scratch-db.mjs` refuses any database whose name does not end
in `_smoke` or `_test`.

Rules that keep the verification from stalling:
- A phase that fails is recorded; the next phase still runs.
- A phase that cannot start is reported SKIPPED — never retried.
- Nothing in the verification launches an application (no Docker Desktop, no
  background server, no fixed port).
- Every wait has a deadline. A service that is down is reported, not waited on.


## Runbook

### The Test Lab (recommended way to test)
```
C:\Users\Asus\Downloads\examrobo-frontend\Exam-Robo-TestLab\
```
Double-click `start.bat` (boots, seeds, opens the browser), then `check.bat`
(52 automated checks), then work through `docs\TEST-CHECKLIST.md` by hand.
`scenario.bat live` fills the admin Live dashboard with running exams,
`collect.bat` writes logs + database counts into `reports\<timestamp>\`.
The lab never edits this project — it only drives it through Docker and HTTP.

### Everything in Docker (recommended)
```powershell
cd C:\Users\Asus\Downloads\examrobo-frontend\Exam-Robo-main
docker compose up -d --build          # db (5450), redis (6379), api (4000), web (8080)
docker compose exec api node scripts/seed.js   # seed data (truncates first)
```
Then open <http://localhost:8080>.
- Student: `student@example.com` / `john.doe@example.com` (no password).
- Admin: `admin@examrobo.dev` / `admin123` (change before any real use).
- Reset everything: `docker compose down -v && docker compose up -d --build`.

### Development without Docker for the API
```powershell
cd server
npm install
npm run migrate      # apply server/sql/migrations to the running database
npm run seed         # truncate + seed
npm start            # API on :4000
npm test             # unit tests
npm run verify       # the full verification (unit + web build + smoke on a scratch DB)
```
The SPA dev server (`web`: `npm run dev`) proxies `/api` and `/ws` to `:4000`.

### Useful commands
| Command | Purpose |
|---|---|
| `npm run verify` | **the whole verification**: preflight → unit → web build → smoke (safe, uses a scratch database) |
| `docker compose ps` | container health |
| `docker compose logs api --tail 40` | API log |
| `docker compose exec db psql -U examrobo -d examrobo` | database shell |
| `npm run migrate` | apply pending migrations |
| `npm run seed` | truncate + reseed (destructive, manual) |
| `node smoke.mjs` | 96-assertion end-to-end check — needs `DATABASE_URL` to point at a `*_smoke` database, refuses to run otherwise |
| `k6 run server/load/k6.js` | load test (needs k6 installed) |

### Environment
| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `postgres://examrobo:examrobo@localhost:5450/examrobo` | |
| `REDIS_URL` | `redis://localhost:6379` | optional; absent = single-instance mode |
| `JWT_SECRET` | `dev-secret-change-me` | **must** be unique in production (the API refuses to start otherwise) |
| `ADMIN_EMAILS` / `ADMIN_PASSWORD` | empty | bootstrap of the first admin; ignored in production |
| `RECORDINGS_DIR` | `./data/recordings` | where recording chunks are written |
| `PORT` | `4000` | |
| `CORS_ORIGINS` | localhost 5173/8080 | comma-separated allowlist |
| `AUTH_RATE_LIMIT` / `TICKET_RATE_LIMIT` / `RECORDING_RATE_LIMIT` | 30 / 10 / 30 | per minute |

### Exam-day checklist
1. `docker compose up -d --build` — all four containers healthy.
2. `docker compose exec api node scripts/seed.js` — or create the event in the UI.
3. Upload the roster; check the student count on the Events page.
4. Open the admin Live dashboard in a second browser before the start time.
5. Keep `docker compose logs -f api` open during the exam.
6. After the exam: Results + CSV export, then Recordings review.

## The Working Process
Decision → Implementation → Documentation.
