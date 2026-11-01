# Project: ExamRobo

## Why
Website-first proctored exam platform. Phase 1 = MCQ only, any OS, any browser.
A student signs in with an invited email, takes a one-sitting proctored exam in
the browser, and gets an immediate result. Staff create events, upload the
roster, watch the exam live, and export the results.

## What was done
- **Spec suite**: PRD (R-001..R-070 + R-013 + R-014), Schema (15 tables), TRD (full API contract),
  Design, Flow, NextSteps (93 tasks), Issue ledger, a Phase-2 lockdown agent design.
- **Backend**: Express 4 + pg + ws + ioredis, ESM, WebSocket telemetry,
  server-side grading, section/paper timing, results visibility, option-order
  mapping and a three-tier integrity policy. Active screen recording is removed.
- **Frontend**: the white-theme React SPA (React 19, Vite 8, Tailwind v4,
  Router 7) - student flow (Login -> Waiting -> Exam -> Result -> Locked) with
  the in-exam Calculator, and the admin console (Events, Live, Results, Flags,
  Tickets, Bank).
- **Infrastructure**: docker-compose (PostgreSQL 16, Redis 7, API, nginx),
  migrations, seed script, a 156-assertion smoke test, k6 load script, runbook,
  and a one-command verification (`npm run verify`) that runs on a scratch
  database and can never touch the live one.
- **Test bench**: `..\Exam-Robo-TestLab\` — one-click start/stop/reset/status/
  check/scenario/collect scripts, 52 automated checks through nginx, a manual
  click-through checklist, an API quick reference, a troubleshooting guide and a
  diagnostics collector.
- **Verified**: `npm run verify` green — 111/111 unit tests, 119/119 smoke
  assertions, clean production build, full stack running on :8080.
- **Competency model (bank v2)**: a `skills` taxonomy (39 seeded skills) and a
  1–5 difficulty scale; a question states what it measures, and a paper freezes
  its own copy of that competency so re-tagging never rewrites a finished exam.
- **Results analytics**: a result says what the exam measured — per skill and
  per difficulty for the student, per student and for the whole cohort for the
  admin, exportable as CSV — all read from the frozen competency, with the
  papers that predate the taxonomy backfilled.
- **Domain selection**: an exam can ask the student which technical domain it
  should test. The aptitude part is common to everybody, the choice is made
  in the waiting room before the timer starts, the server validates it, and
  the choice and the domain of every question are frozen with the paper.
  Registration is not a feature: the roster is the eligibility list.

## Architecture
```
web (nginx, :8080)  →  /api, /ws  →  api (Express, :4000)
                                        ├→ PostgreSQL 16 (db, :5450)   system of record
                                        └→ Redis 7 (redis, :6379)       lockout + WS pub/sub + rate limits
```
- `server/` — `app.js` (routes + sockets, importable so a test can boot it
  in-process), `index.js` (process bootstrap), `routes/` (auth, student,
  tickets, exam, admin, bank), `services/` (paper, grading, views, live,
  sessions, lockout, redis, **integrity**, **competency**, **analytics**,
  **domains**),
  `middleware/` (auth,
  security, async), `scripts/` (seed, migrate, **verify**, **waitfor**,
  **scratch-db**), `sql/` (schema + migrations + **taxonomy** + **backfill**), `smoke.mjs`,
  `load/k6.js`.
- `web/` — the ported white-theme SPA (`src/` with 27 files), `nginx.conf`,
  `vite.config.js` (dev proxy to :4000).
- `Brain/` — the documentation set (Start, PRD, TRD, Schema, Design, Flow,
  compact, NextSteps, Issue, Log, **LockdownAgent**).

## What remains
- Exam history and the automatic top-N selection of a student for an exam.
- Option-order shuffle per student.
- Browser click-through by the user (the API level is verified).
- The 1000-VU k6 run (script ready, not executed).
- Deployment to the user's online server (compose file ready).
- Building the Windows lockdown agent (designed, needs six decisions).
- Two open decisions in `Brain/Issue.md`: the HR auto-flag rule (R-043) and the
  recording retention policy.

## Next steps
See `Brain/NextSteps.md` — the exam history + top-N selection (the next
roadmap step), T-702/T-814 (k6 run), T-801/T-802 (decisions), T-813 (browser
click-through by the user), T-960 (the agent build), then the online deployment.

## Domain
coding shared

## Installed
- Agents: 18
- Skills: 862
