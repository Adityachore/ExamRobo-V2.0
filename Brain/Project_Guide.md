# Project Guide & File Index

## Documentation Index
Refer to the files in `Brain/` for project documentation.

### Core Onboarding
- **Start.md**: onboarding map, runbook, environment, exam-day checklist.
- **compact.md**: state snapshot and technical truths.

### Execution & Tracking
- **NextSteps.md**: task queue.
- **Log.md**: decision history.
- **Issue.md**: technical debt and open questions.

### Specifications
- **PRD.md**: product requirements (R-001..R-070).
- **TRD.md**: technical requirements — the API contract, error dialect, WS protocol.
- **Schema.md**: the 13 database tables.
- **Design.md**: UI layout, palette, component tree.
- **Flow.md**: happy paths and failure paths.
- **Plan.md**: implementation plan (per phase).
- **FutureUpdates.md**: planned changes after the current release.

### Source Code
| Path | What lives there |
|---|---|
| `server/index.js` | Express app, route mounts, error handling, WebSocket `/ws`, expiry sweeper |
| `server/routes/` | `auth`, `student`, `tickets`, `exam`, `admin`, `bank` |
| `server/services/` | `paper`, `grading`, `views`, `live`, `sessions`, `lockout`, `redis`, `integrity`, `competency`, `analytics` |
| `server/middleware/` | `auth` (JWT + roles), `security` (headers, CORS, rate limits — shared through Redis when it is up), `async` (crash-safe routes) |
| `server/scripts/seed.js` | truncate + seed (admin, students, 10 tagged bank questions, one event) |
| `server/scripts/migrate.js` | applies `server/sql/migrations/*.sql` in order, then the taxonomy, then the backfill |
| `server/sql/schema.sql` | full schema (initdb on a fresh volume) |
| `server/sql/migrations/` | append-only incremental changes |
| `server/sql/taxonomy.sql` | the skills reference data (39 skills), re-applied on every boot and after a truncate |
| `server/sql/backfill.sql` | rebuilds the frozen competency of the papers that predate the taxonomy, applied after the taxonomy |
| `server/smoke.mjs` | 156-assertion end-to-end contract test (truncates the DB first) |
| `server/load/k6.js` | k6 load scenario (setup creates the event + roster) |
| `server/test/` | unit tests: `lockout`, `redis-lockout`, `security`, `paper`, `grading`, `integrity`, `concurrency`, `client-signals`, `competency`, `analytics`, `async-errors` |
| `web/src/` | the white-theme SPA (27 files, ported 1:1) |
| `web/nginx.conf` | production routing: SPA + `/api` + `/ws` |
| `web/vite.config.js` | dev server + proxy to `:4000` |
| `docker-compose.yml` | db (5450), redis (6379), api (4000), web (8080) |

### Test Lab (sibling folder, `..\Exam-Robo-TestLab\`)
| Path | What it is |
|---|---|
| `Exam-Robo-TestLab\start.bat` | boot the stack, wait for health, seed, open the browser |
| `Exam-Robo-TestLab\stop.bat` | stop the containers, keep the data |
| `Exam-Robo-TestLab\reset.bat` | wipe the volumes and rebuild from scratch |
| `Exam-Robo-TestLab\status.bat` | containers, endpoints, events, live sessions, results |
| `Exam-Robo-TestLab\check.bat` | 52 automated checks (`checks\run-checks.mjs`) + a markdown report |
| `Exam-Robo-TestLab\scenario.bat` | demo data: `now`, `waiting`, `live`, `many` |
| `Exam-Robo-TestLab\collect.bat` | logs + database counts + error scan into `reports\<timestamp>\` |
| `Exam-Robo-TestLab\config\testlab.json` | project path, URLs, ports, credentials, timeouts |
| `Exam-Robo-TestLab\docs\` | `TEST-CHECKLIST.md`, `API-QUICK-REFERENCE.md`, `TROUBLESHOOTING.md` |
| `Exam-Robo-TestLab\README.md`, `CREDENTIALS.md` | how to use it, the dev logins |

### Reference (read-only, outside this project)
| Path | What it is |
|---|---|
| `C:\Users\Asus\Downloads\examrobo-frontend\web` | the white-theme SPA — the contract reference |
| `C:\Users\Asus\Downloads\examrobo-frontend\server` | the DEV mock server — the source of the error dialect |

## Conventions
- ESM everywhere (`"type": "module"`), 2-space indent, single quotes, semicolons.
- Routes are thin: business rules live in `server/services/`.
- Every async route handler is wrapped by `wrapRouter` — a rejected promise must
  never crash the API.
- SQL only through `q()` in `server/db.js` (parameterised, never string-concatenated).
- Database changes: edit `server/sql/schema.sql` **and** add a new file in
  `server/sql/migrations/` — never edit an applied migration.
- Brain files are updated in the same session as the change they describe.
