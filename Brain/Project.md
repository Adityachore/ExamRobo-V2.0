# Project: ExamRobo

## Why
Website-first proctored exam platform. Phase 1 = MCQ only, any OS, any browser.
A student signs in with an invited email, takes a one-sitting proctored exam in
the browser, and gets an immediate result. Staff create events, upload the
roster, watch the exam live, and export the results.

## What was done
- **Spec suite**: PRD (R-001..R-070 + R-013 + R-014), Schema (18 domain tables + ledger), TRD (full API contract),
  Design, Flow, NextSteps (93 tasks), Issue ledger, a Phase-2 lockdown agent design.
- **Backend**: Express 4 + pg + ws + ioredis, ESM, WebSocket telemetry,
  server-side grading, section/paper timing, results visibility, option-order
  mapping and a three-tier integrity policy. Active screen recording is removed.
- **Frontend**: the white-theme React SPA (React 19, Vite 8, Tailwind v4,
  Router 7) - student flow (Login -> Waiting -> Exam -> Result -> Locked) with
  the in-exam Calculator, and the admin console (Events, Live, Results, Flags,
  Tickets, Bank).
- **Infrastructure**: docker-compose (PostgreSQL 16, Redis 7, API, nginx),
  migrations, seed script, a 187-assertion smoke test, k6 load script, runbook,
  and a one-command verification (`npm run verify`) that runs on a scratch
  database and can never touch the live one.
- **Test bench**: `..\Exam-Robo-TestLab\` — one-click start/stop/reset/status/
  check/scenario/collect scripts, 52 automated checks through nginx, a manual
  click-through checklist, an API quick reference, a troubleshooting guide and a
  diagnostics collector.
- **Verified**: v1.5.0 (Phase 19) — `npm run verify` green: 161 unit tests,
  187/187 smoke assertions, clean production build. (Older baseline: 111/111
  unit, 119/119 smoke.)
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
web (nginx, :8083)  →  /api, /ws  →  api (Express, :4000)
                                        ├→ PostgreSQL 16 (db, :5450)   system of record
                                        └→ Redis 7 (redis, :6379)       lockout + WS pub/sub + rate limits
```
- `server/` — `app.js` (routes + sockets, importable so a test can boot it
  in-process), `index.js` (process bootstrap), `routes/` (auth, student,
  tickets, exam, admin, bank, seb, ws), `services/` (paper, grading, views, live,
  sessions, lockout, redis, **integrity**, **competency**, **analytics**,
  **domains**, **attempts**, **event-config**, **results**, **seb**,
  **section-flow**, **ws-tickets**),
  `middleware/` (auth,
  security, async), `scripts/` (seed, migrate, **verify**, **waitfor**,
  **scratch-db**), `sql/` (schema + migrations + **taxonomy** + **backfill**), `smoke.mjs`,
  `load/k6.js`.
- `web/` — the ported white-theme SPA (`src/` with 38 files), `nginx.conf`,
  `vite.config.js` (dev proxy to :4000).
- `Brain/` — the documentation set (Start, PRD, TRD, Schema, Design, Flow,
  compact, NextSteps, Issue, Log, **ProjectReview**, **LockdownAgent**).

## What remains
- **v2.0 multi-tenant SaaS (Phase 20)** — see `Brain/ProjectReview.md` and
  `docs/Brain-Phase2-Production-Ready/`. Baseline freeze first, then gate G1.
- Browser click-through by the user (T-1521; the API level is verified).
- The 50-VU k6 run (T-1518; script ready, not executed).
- v1.5 production cutover (T-1513) is superseded by v2.0; v1.5 is the rollback.
- Building the Windows lockdown agent (designed, needs six decisions).
- Two open decisions in `Brain/Issue.md`: the HR auto-flag rule (R-043) and the
  recording retention policy.
- Deferred to v2.1: exam history and automatic top-N selection. Billing/plans are
  in v2.0 (amended 2026-11-06).

## Next steps
See `Brain/NextSteps.md` — Phase 20 (v2.0 SaaS): baseline freeze, G1 security
proof, tenant schema (migrations 014+), identity/API v2, then privacy/ops/capacity.
T-1521 and T-1518 remain v1.5 handoff items; neither blocks a deploy.

## Domain
coding shared

## Installed
- Agents: 18
- Skills: 862
