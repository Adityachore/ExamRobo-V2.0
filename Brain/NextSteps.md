# ExamRobo NextSteps

Statuses: `[ ]` PENDING `[>]` IN-PROGRESS `[V]` VERIFYING `[X]` COMPLETED `[B]` BLOCKED

## Phase 1 — Scaffold & Auth

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-101 | R-001 | Scaffold monorepo: docker-compose (pg/api/web), server + web packages, git init | senior-devops-engineer-agent | — | [X] COMPLETED |
| T-102 | — | SQL schema (Schema.md) + mount as initdb | senior-backend-engineer-agent | T-101 | [X] COMPLETED |
| T-103 | R-001 | Auth: JWT, student login against roster, role split student/admin | senior-backend-engineer-agent | T-102 | [X] COMPLETED |
| T-104 | R-002 | 3-attempt lockout (15 min, email+IP) | senior-backend-engineer-agent | T-103 | [X] COMPLETED |
| T-105 | R-003 | Contact-Team ticket endpoint + auto-ticket on lockout | senior-backend-engineer-agent | T-104 | [X] COMPLETED |
| T-106 | R-004 | Waiting room API (next event + countdown data) | senior-backend-engineer-agent | T-103 | [X] COMPLETED |
| T-107 | R-001,R-002,R-003 | Student Login + Waiting UI (error popup, Contact Team, countdown) | senior-frontend-engineer-agent | T-103 | [X] COMPLETED |
| T-108 | R-005,R-006 | Admin login + create event + paste roster endpoints | senior-backend-engineer-agent | T-102 | [X] COMPLETED |
| T-109 | R-006 | Admin Events/Roster UI | senior-frontend-engineer-agent | T-108 | [X] COMPLETED |
| T-110 | R-001..R-006 | P1 tests (lockout, roster parse, login) + web build verify | critique-agent | T-104,T-105,T-107,T-109 | [X] COMPLETED |

## Phase 2 — Bank & Papers

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-201 | R-010 | Question + variant CRUD API | senior-backend-engineer-agent | T-102 | [X] COMPLETED |
| T-202 | R-010 | Admin question bank UI (per-category, variant editor) | senior-frontend-engineer-agent | T-201 | [X] COMPLETED |
| T-203 | R-011,R-012 | Paper generation at start (random variant per question, shuffle) | senior-backend-engineer-agent | T-201,T-106 | [X] COMPLETED |
| T-204 | R-011 | Variant randomization tests | critique-agent | T-203 | [X] COMPLETED |

## Phase 3 — Exam Runner

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-301 | R-020,R-022 | Start exam API (one-sitting guard, server timer) | senior-backend-engineer-agent | T-203 | [X] COMPLETED |
| T-302 | R-021 | Autosave upsert API + 15s snapshot | senior-backend-engineer-agent | T-301 | [X] COMPLETED |
| T-303 | R-023 | Submit + auto-submit-on-expiry + grading service | senior-backend-engineer-agent | T-302 | [X] COMPLETED |
| T-304 | R-020 | Exam UI: MCQ runner, section nav, timer, autosave, resume | senior-frontend-engineer-agent | T-303 | [X] COMPLETED |
| T-305 | R-021 | Autosave idempotency + crash-resume tests | critique-agent | T-304 | [X] COMPLETED |

## Phase 4 — Proctoring

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-401 | R-030 | Warning capture API + 3-strike server enforcement | senior-backend-engineer-agent | T-301 | [X] COMPLETED |
| T-402 | R-030 | useProctor hook (fullscreen, tab-blur, escalation) | senior-frontend-engineer-agent | T-401 | [X] COMPLETED |
| T-403 | R-031 | Recording chunk upload endpoint (disk, retry-safe) | senior-backend-engineer-agent | T-301 | [X] SUPERSEDED - recorder removed; table/files retained |
| T-404 | R-031 | Client MediaRecorder + chunked upload hook | senior-frontend-engineer-agent | T-403 | [X] SUPERSEDED - recorder removed |
| T-405 | R-032 | WS proctor channel: telemetry + force-submit + message | senior-backend-engineer-agent | T-401 | [X] COMPLETED |
| T-406 | R-032 | Live proctor dashboard UI | senior-frontend-engineer-agent | T-405 | [X] COMPLETED |

## Phase 5 — Results & Flags

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-501 | R-040 | Grading + result API + score breakdown | senior-backend-engineer-agent | T-303 | [X] COMPLETED |
| T-502 | R-040,R-041 | Result page + feedback form | senior-frontend-engineer-agent | T-501 | [X] COMPLETED |
| T-503 | R-042 | Flag API (kinds, resolve) + proctor flag action | senior-backend-engineer-agent | T-405 | [X] COMPLETED |
| T-504 | R-043 | HR auto-flag job (roster stale at start−2h) | senior-backend-engineer-agent | T-108 | [ ] PENDING — rule needs clarification (Brain/Issue.md) |
| T-505 | R-052 | Flags & Tickets admin UI | senior-frontend-engineer-agent | T-503,T-105 | [X] COMPLETED |

## Phase 6 — Admin Dashboard

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-601 | R-050 | Results + leaderboard API + CSV export | senior-backend-engineer-agent | T-501 | [X] COMPLETED |
| T-602 | R-050 | Results admin UI | senior-frontend-engineer-agent | T-601 | [X] COMPLETED |
| T-603 | R-051 | Recording review API + player UI | senior-frontend-engineer-agent | T-403 | [X] SUPERSEDED - recording review removed |

## Phase 7 — Hardening & Deploy

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-701 | R-060 | Redis pub/sub WS scaling | performance-optimization-engineer-agent | T-405 | [X] COMPLETED |
| T-702 | R-060 | k6 load test script to 1000 VUs | performance-optimization-engineer-agent | T-701 | [V] VERIFYING — script written (`server/load/k6.js`), the 1000-VU run is not executed yet |
| T-703 | R-061 | Compose deployment + runbook | senior-devops-engineer-agent | T-702 | [X] COMPLETED (local compose verified; the online server is still pending) |
| T-704 | R-061 | Security pass (headers, secrets, upload limits, rate limits) | senior-audit-engineer-agent | T-703 | [X] COMPLETED |
| T-705 | R-060 | Redis-backed lockout (survives restart, shared across instances) | senior-backend-engineer-agent | T-701 | [X] COMPLETED |
| T-706 | — | Async-error safety net (no crash on a rejected promise) | senior-backend-engineer-agent | — | [X] COMPLETED |
| T-707 | — | `flags.event_id` migration (event context for student flags) | senior-backend-engineer-agent | T-503 | [X] COMPLETED |
| T-708 | — | Grading off-by-one fix (`ord.n - 1`) + regression test | senior-backend-engineer-agent | T-501 | [X] COMPLETED |

## Phase 8 — Test Lab (test bench next to the app)

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-810 | — | `Exam-Robo-TestLab\` scripts: start / stop / reset / status / check / scenario / collect | senior-devops-engineer-agent | T-703 | [X] COMPLETED |
| T-811 | — | 52 automated checks through nginx (stack, web, auth, exam, admin live, bank/flags/recordings) | critique-agent | T-810 | [X] COMPLETED |
| T-812 | — | Manual click-through checklist + API quick reference + troubleshooting guide | specs-agent | T-811 | [X] COMPLETED |
| T-813 | — | Browser click-through by the user | — | T-812 | [ ] PENDING — needs the user |
| T-814 | — | The 1000-VU k6 run | performance-optimization-engineer-agent | T-702 | [ ] PENDING |

## Deferred — exam-day operations

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-801 | R-043 | HR auto-flag job | senior-backend-engineer-agent | T-108 | [ ] PENDING — needs a decision first |
| T-802 | R-031 | Recording retention/cleanup policy | senior-devops-engineer-agent | T-403 | [ ] PENDING — needs a decision first |
| T-803 | R-060 | Rate-limit counters in Redis (multi-instance) | senior-backend-engineer-agent | T-701 | [X] COMPLETED |

## Phase 9 — Integrity hardening (2026-10-21)

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-950 | R-030 | Tiered policy engine (`server/services/integrity.js`): tier table, `evaluate`, `recordViolation`, `lockPaper` | senior-backend-engineer-agent | T-401 | [X] COMPLETED |
| T-951 | R-030 | Migration 002 (`papers.lock_reason`, `warnings.detail`, widened CHECKs) + `schema.sql` mirror | senior-backend-engineer-agent | T-950 | [X] COMPLETED |
| T-952 | R-030 | Server-side event endpoint driven by the policy (tier, count, lock) | senior-backend-engineer-agent | T-950 | [X] COMPLETED |
| T-953 | R-030 | Concurrency detection: per-tab id, socket registry, `second_window` / `second_session` (mutually exclusive) | senior-backend-engineer-agent | T-950 | [X] COMPLETED |
| T-954 | R-030,R-033 | Locked-exam state: 409 `locked`, lockout screen, forced sign-out, proctor lock action | senior-backend-engineer-agent | T-950 | [X] COMPLETED |
| T-955 | R-030 | Client guards: clipboard, context menu, print, screenshot key, focus, fullscreen, display surface, devtools | senior-frontend-engineer-agent | T-950 | [X] COMPLETED |
| T-956 | R-032 | Proctor dashboard: violation kinds, locked badge, manual lock | senior-frontend-engineer-agent | T-954 | [X] COMPLETED |
| T-957 | R-030 | Regression guards: `server/test/integrity.test.js`, `server/test/concurrency.test.js`, 16 new smoke assertions | critique-agent | T-950,T-953 | [X] COMPLETED |
| T-958 | — | One-command verification (`npm run verify`): preflight → unit → build → smoke on a scratch database | senior-devops-engineer-agent | T-950 | [X] COMPLETED |
| T-959 | R-034 | Windows lockdown agent — design only (`Brain/LockdownAgent.md`) | senior-audit-engineer-agent | T-950 | [X] COMPLETED (design) / [ ] PENDING (build) |
| T-960 | R-034 | Build the lockdown agent (Phase 2) | senior-audit-engineer-agent | T-959 | [ ] PENDING — needs the decisions listed in Brain/Issue.md |

## Phase 10 — Live exam fixes (2026-10-21, night)

The four defects the user hit in a real exam session: copy/paste and the
screenshot key were never counted, fullscreen was not enforced, and the exam
was slow. Fixed with evidence, not guesses.

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-970 | R-030 | Clipboard counted from the keyboard (the exam page has no editable field, so the DOM copy/paste events never fire) | senior-frontend-engineer-agent | T-955 | [X] COMPLETED |
| T-971 | R-030 | Screenshot key + OS-chord signals, honest UI (the browser cannot stop an OS capture) | senior-frontend-engineer-agent | T-955 | [X] COMPLETED |
| T-972 | R-030 | Fullscreen hard block: the question is hidden outside fullscreen, the exit is a warning, the server keeps the state | senior-frontend-engineer-agent | T-955 | [X] COMPLETED |
| T-973 | R-030 | Server-side fullscreen backstop: the heartbeat carries the state, one incident is one warning | senior-backend-engineer-agent | T-972 | [X] COMPLETED |
| T-974 | R-030 | Migration 003 (`papers.fullscreen_state`, `os_chord` in the CHECK, `idx_papers_started`) + `schema.sql` mirror | senior-backend-engineer-agent | T-973 | [X] COMPLETED |
| T-975 | R-050 | Performance: the answer path is one statement, the live dashboard is one CTE query, the dashboard gets a cheap patch instead of a full session | senior-backend-engineer-agent | T-972 | [X] COMPLETED |
| T-976 | R-050 | The client clock ticks once a second instead of four times | senior-frontend-engineer-agent | T-975 | [X] COMPLETED |
| T-977 | — | The admin event filter no longer turns a uuid into NaN | senior-frontend-engineer-agent | T-975 | [X] COMPLETED |
| T-978 | R-030 | A variant an exam uses can no longer be deleted | senior-backend-engineer-agent | T-975 | [X] COMPLETED |
| T-979 | R-051 | The results CSV cannot execute a formula a name contains | senior-backend-engineer-agent | T-975 | [X] COMPLETED |
| T-980 | — | Regression guards: `server/test/client-signals.test.js` (17), the effective-constraint test, 12 new smoke assertions | critique-agent | T-970..T-979 | [X] COMPLETED |

## Phase 11 — Question bank v2 (roadmap Phase 1, 2026-10-22)

The product roadmap starts here: a real competency model for the question
bank, so a result can say *what* was measured, not only how many were right.

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1001 | R-013 | Migration 004 (`skills`, `questions.skill_id`/`difficulty`, `paper_questions`) + `schema.sql` mirror | senior-backend-engineer-agent | — | [X] COMPLETED |
| T-1002 | R-013 | The taxonomy as reference data (`server/sql/taxonomy.sql`, 39 skills) + `applyTaxonomy()` on boot, in the scratch DB and after the seed truncate | senior-backend-engineer-agent | T-1001 | [X] COMPLETED |
| T-1003 | R-013 | `server/services/competency.js`: the categories, the difficulty scale, the skill-code rules (one source of truth) | senior-backend-engineer-agent | T-1001 | [X] COMPLETED |
| T-1004 | R-013 | Bank API: skills CRUD, `?skill=`/`?difficulty=` filters, `POST /bank/questions/:id/competency` | senior-backend-engineer-agent | T-1003 | [X] COMPLETED |
| T-1005 | R-013 | The paper freezes its competency (`paper_questions`), written in the same statement as the paper | senior-backend-engineer-agent | T-1001 | [X] COMPLETED |
| T-1006 | R-013 | Admin bank UI: skills tab, skill/difficulty filters, tag dialog, taxonomy manager | senior-frontend-engineer-agent | T-1004 | [X] COMPLETED |
| T-1007 | R-013 | The dev bank is tagged (10 questions, 6 skills) and the seeded bank is tagged too | senior-backend-engineer-agent | T-1002 | [X] COMPLETED |
| T-1008 | — | Regression guards: `server/test/competency.test.js` (19), `server/test/async-errors.test.js` (5), 21 new smoke assertions | critique-agent | T-1004,T-1005 | [X] COMPLETED |
| T-1009 | — | Fix: the async error wrapper never applied (the routers wrap after they register) — a rejected promise took the API down | senior-backend-engineer-agent | T-1008 | [X] COMPLETED |
| T-1010 | R-013 | Results analytics per skill and per difficulty (the next roadmap step) | senior-backend-engineer-agent | T-1005 | [X] COMPLETED |

## Phase 12 — Results analytics (roadmap Phase 3, 2026-10-22)

The result now says what the exam measured. The cohort can see where it is
weak, and the breakdown is exportable.

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1011 | R-014 | `server/services/analytics.js`: the competency of a paper and of a cohort, from the **frozen** rows, in one query for the whole scope | senior-backend-engineer-agent | T-1010 | [X] COMPLETED |
| T-1012 | R-014 | The student result carries the breakdown (`GET /api/exam/result`); the admin sees it per student (`GET /api/admin/results`) | senior-backend-engineer-agent | T-1011 | [X] COMPLETED |
| T-1013 | R-014 | The cohort view: `GET /api/admin/analytics` and `GET /api/admin/analytics.csv`, the weakest skill first | senior-backend-engineer-agent | T-1011 | [X] COMPLETED |
| T-1014 | R-014 | The backfill: the frozen competency of the papers that ran before the taxonomy existed (`server/sql/backfill.sql`, applied after the taxonomy) | senior-backend-engineer-agent | T-1011 | [X] COMPLETED |
| T-1015 | R-014 | The web: the student breakdown ("what this exam measured"), the admin cohort panel, `Tabs` moved to `ui.jsx` so both roles share it | senior-frontend-engineer-agent | T-1012,T-1013 | [X] COMPLETED |
| T-1016 | — | Regression guards: `server/test/analytics.test.js` (7), 12 new smoke assertions, including that re-tagging a question does not change the result of the exam that used it | critique-agent | T-1011..T-1015 | [X] COMPLETED |

## Phase 13 - Candidate exam UI redesign (2026-10-22)

The exact UI specification was applied to the critical candidate path only.
Server, API, schema and exam/proctoring behaviour were not changed.

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1030 | - | Exact palette tokens, base typography, focus rings, safe-area helpers, shared `Button` / `Field` / `Banner` / `Badge` / `Card` / `Modal` / `Drawer` primitives | senior-frontend-engineer-agent | - | [X] COMPLETED |
| T-1031 | R-001 | Login split-panel redesign with field-level email validation, Contact Team preserved | senior-frontend-engineer-agent | T-1030 | [X] COMPLETED |
| T-1032 | R-004 | Waiting room redesign with next-exam hero, server-anchored countdown and instructions | senior-frontend-engineer-agent | T-1030 | [X] COMPLETED |
| T-1033 | R-020 | Exam gate: instructions, real health check, fullscreen/share capability rows, start-time and window gates, starting progress | senior-frontend-engineer-agent | T-1030 | [X] COMPLETED |
| T-1034 | R-020,R-021 | Runner: sticky header, section rail, persistent navigator at `xl`, navigator Drawer, submission dialog, responsive footer; all exam logic preserved | senior-frontend-engineer-agent | T-1030 | [X] COMPLETED |
| T-1035 | R-040 | Result: completion hero, summary, score ring, section bars, competency tabs, feedback; no invented counts | senior-frontend-engineer-agent | T-1030 | [X] COMPLETED |
| T-1036 | R-030 | Locked screen polish; lockout notice and forced sign-out preserved | senior-frontend-engineer-agent | T-1030 | [X] COMPLETED |
| T-1037 | - | Web production build after the final edits | senior-frontend-engineer-agent | T-1031..T-1036 | [X] COMPLETED (`1967` modules, JS `index-CFsKT0pX.js`, CSS `index-D05cebHI.css`) |
| T-1038 | - | Full `npm run verify` after the redesign | senior-devops-engineer-agent | T-1037 | [X] COMPLETED - all four phases pass: preflight, unit, web build, smoke (132 assertions) |
| T-1039 | - | Manual browser responsive / accessibility click-through at 320, 390, tablet and 1280 px | critique-agent | T-1037 | [ ] PENDING - needs a browser / the user |

## Phase 14 - Domain selection (2026-10-22)

Plan A: the student picks the technical domain the exam asks about, in the
waiting room, before the timer starts. The aptitude part is common to
everybody. Registration is not a feature - the roster is the eligibility list.

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1100 | R-015 | Migration 005 (`exam_events.domain_mode`/`domain_rules`, `papers.selected_categories`, `paper_questions.category`) + `schema.sql` mirror + the category backfill | senior-backend-engineer-agent | - | [X] COMPLETED |
| T-1101 | R-015 | `server/services/domains.js`: the rules (common, allowed, min/max) and the validation of a selection - one source of truth | senior-backend-engineer-agent | T-1100 | [X] COMPLETED |
| T-1102 | R-015 | The paper builder assembles the common part plus the chosen domains, and refuses a bad selection **before** the paper exists | senior-backend-engineer-agent | T-1101 | [X] COMPLETED |
| T-1103 | R-015 | The API: `POST /api/exam/start` takes the domains, `GET /api/student/event` carries the rules and the frozen choice, `POST /api/admin/events` creates a domain-aware event | senior-backend-engineer-agent | T-1102 | [X] COMPLETED |
| T-1104 | R-015 | The frozen domain of every question: the sections of a paper are its domains and never move when the bank is re-tagged | senior-backend-engineer-agent | T-1102 | [X] COMPLETED |
| T-1105 | R-015 | The bank can move a question to another domain (`POST /api/bank/questions/:id/competency` takes `category`) | senior-backend-engineer-agent | T-1104 | [X] COMPLETED |
| T-1106 | R-015 | The web: the domain picker in the waiting room, the start payload, the admin event form, the category field in the tag dialog | senior-frontend-engineer-agent | T-1103 | [X] COMPLETED |
| T-1107 | - | Regression guards: `server/test/domains.test.js` (21), 23 new smoke assertions | critique-agent | T-1101..T-1106 | [X] COMPLETED |
| T-1108 | - | Live check on the dev stack (`http://localhost:8080`): a domain-aware event, a refused selection, a frozen choice, the sections of the paper | senior-devops-engineer-agent | T-1107 | [X] COMPLETED |
| T-1109 | - | Browser click-through of the picker (320/390/tablet/1280 px) | critique-agent | T-1106 | [ ] PENDING - needs a browser / the user |
| T-1110 | R-015 | Registration: **dropped**, not built. The roster stays the only eligibility list (no `event_registrations`, no `/api/register`, no public events list, no Register page, no admin Registrations tab) | senior-backend-engineer-agent | - | [X] COMPLETED (nothing to build) |

## Phase 15 — High-stakes hardening, batch 1 (2026-10-22)

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1201 | R-030 | Warn-and-continue policy: capture/recording are warnings, warnings never submit, `second_window`/`second_session` are server-only | senior-backend-engineer-agent | T-950 | [X] COMPLETED |
| T-1202 | R-030 | Candidate copy and admin review UI: no "third warning submits", capture warnings, review badge, recording column hidden until Phase 2 | senior-frontend-engineer-agent | T-1201 | [X] COMPLETED |
| T-1203 | R-034 | SEB server gate: 64-hex Config Key, SHA256(exact URL + key), constant-time compare, `/api/seb/status`, `/api/seb/config`, `/exam/*` gate, startup warning, nginx forwarded-proto fix | senior-backend-engineer-agent | T-1201 | [X] COMPLETED (unit 127 pass) |
| T-1204 | R-034 | Candidate SEB path: `/seb` page, download link, pre-check, SEB-mode kiosk detection, Fullscreen API bypass, login/waiting links | senior-frontend-engineer-agent | T-1203 | [X] COMPLETED (web build pass) |
| T-1205 | R-034 | Generate the real `exam.seb` with SEB Config Tool for the stable exam URL, copy it to `server/assets/exam.seb`, set `SEB_REQUIRED=true` and `SEB_CONFIG_KEY` | senior-devops-engineer-agent | T-1203,T-1204 | [B] BLOCKED — needs the stable hostname and the SEB Config Tool output; a free ngrok URL changes and does not suit this |
| T-1206 | — | `npm run verify` after batch 1 | critique-agent | T-1203,T-1204 | [X] COMPLETED — preflight + unit + web build + smoke PASS (132 smoke assertions) |
| T-1207 | R-034 | Windows SEB manual acceptance: start outside SEB is refused, start inside SEB works, fullscreen not required, config hash survives nginx/ngrok | critique-agent | T-1205 | [ ] PENDING — needs the user's Windows machine and SEB |
| T-1208 | R-034 | Per-question delivery: `hydrateManifest`/`hydrateQuestion`, `GET /exam/question/:index`, `papers.last_seen_at/source`, `warnings.source/client_event_id`, `network_gap`, migration 006, per-student rate limits, JWT 4h | senior-backend-engineer-agent | T-1201 | [X] COMPLETED (unit 127 pass; smoke 132/132 pass) |
| T-1209 | R-034 | One-time WebSocket tickets: Redis + memory service, `POST /api/ws/ticket`, ticket-only `/ws`, Runner/Admin ticket fetch, smoke coverage | senior-backend-engineer-agent | T-1208 | [X] COMPLETED (unit 127 pass; smoke 132/132 pass) |
| T-1210 | R-034 | Connection indicator and persistent answer queue: `useConnectionStatus`, `ConnectionBadge`, Runner offline/flush/queue-persist, admin last-contact | senior-frontend-engineer-agent | T-1208 | [X] COMPLETED (web build pass; live run pending) |
| T-1211 | R-034 | Frontend hardening: nginx CSP/no-store, k6 per-question load, admin `last_seen_at` | senior-devops-engineer-agent | T-1208 | [X] COMPLETED (web build pass; k6 not run) |

## Phase 16 — Admin controls, section timing and attempt recovery (2026-10-26)

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1301 | R-005 | Migration 007 (`section_limits`, `paper_sections`, `admin_actions`, `paper_attempt_history`, roster soft-delete, `access_revoked_at`, `attempt_no`, `submit_reason='removed'`) + `schema.sql` mirror | senior-backend-engineer-agent | T-1201 | [X] COMPLETED |
| T-1302 | R-005 | Event configuration service: validation, derived duration, question range, per-student `paperDuration` for select events | senior-backend-engineer-agent | T-1301 | [X] COMPLETED |
| T-1303 | R-006 | Event CRUD: create, edit blocked after the first paper, typed-name delete, cascade cleanup, active-session kick and audit | senior-backend-engineer-agent | T-1302 | [X] COMPLETED |
| T-1304 | R-006 | Roster CRUD: single add, edit, soft delete, bulk remove, restore, CSV export, `has_paper`, transactional upsert | senior-backend-engineer-agent | T-1301 | [X] COMPLETED |
| T-1305 | R-020 | Section timing engine: clocks start on first question open, expired sections lock while the paper stays live, server-side answer/question guards | senior-backend-engineer-agent | T-1301 | [X] COMPLETED |
| T-1306 | R-032 | Resume/restart: only lockout/force-submit/expiry, preserved answers, reset section clocks, admin minutes and reason; restart snapshots the old attempt and increments `attempt_no` | senior-backend-engineer-agent | T-1305 | [X] COMPLETED |
| T-1307 | R-032 | Admin UI: Events/Roster/Live CRUD dialogs, pagination, resume/restart actions and new proctor kinds | senior-frontend-engineer-agent | T-1303,T-1304,T-1306 | [X] COMPLETED |
| T-1308 | R-015 | Event-scoped domain selection in Waiting/Exam, section countdowns/locks in Runner, removed/restarted/resumed socket handling | senior-frontend-engineer-agent | T-1305 | [X] COMPLETED |
| T-1309 | — | Regression guards: `event-config.test.js` and smoke coverage for per-student duration, section expiry, resume/restart, removal and restored access | critique-agent | T-1305,T-1306 | [X] COMPLETED — all phases PASS; 131 unit tests, web build, 156/156 smoke assertions |
| T-1310 | — | Documentation sync for Phase 16 | memory-agent | T-1309 | [X] COMPLETED |

## Phase 17 - Target migration, results visibility and paper timing (2026-10-28)

The authoritative main tree is being prepared for an in-place target upgrade.
The target's data, Calculator, import tooling, option shuffle, section timing
and recordings data must survive; active recorder usage is removed.

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1401 | R-005 | Results schema: `results_visibility`, `results_published_at`, `results_published_by`, `results_expires_at`; option-order columns and migrations 009/010 | senior-backend-engineer-agent | T-1301 | [X] COMPLETED |
| T-1402 | R-020 | Separate event start window from full paper deadline; explicit section limits; persisted option orders | senior-backend-engineer-agent | T-1401 | [X] COMPLETED |
| T-1403 | R-040 | Central result state machine and student/admin result routes, including manual publish/extend/unpublish and post-event sign-in | senior-backend-engineer-agent | T-1401 | [X] COMPLETED |
| T-1404 | R-040 | Map display choices through `option_orders` in grading and analytics | senior-backend-engineer-agent | T-1402 | [X] COMPLETED |
| T-1405 | R-006 | Admin Events/Results/Live UI: window + visibility fields, result actions, live session detail | senior-frontend-engineer-agent | T-1403 | [X] COMPLETED |
| T-1406 | R-020,R-040 | Student result blocked states, paper-time labels and Calculator port | senior-frontend-engineer-agent | T-1403,T-1405 | [X] COMPLETED |
| T-1407 | - | Result, calculator and option-order regression tests; unit suite and web build | critique-agent | T-1404,T-1406 | [X] COMPLETED - 153 unit tests, web build clean; verify preflight/smoke skipped because services are down |
| T-1408 | - | Target-shaped scratch DB restore and preflight | senior-devops-engineer-agent | T-1407 | [B] BLOCKED - Postgres/Redis are not running locally |
| T-1409 | - | Target migration bridge, section/proctor data mapping and ledger checksum adoption | senior-backend-engineer-agent | T-1408 | [B] BLOCKED - needs the scratch DB |
| T-1410 | - | Live target cutover and post-cutover smoke | senior-devops-engineer-agent | T-1409 | [B] BLOCKED - explicit user approval required |
| T-1411 | - | Documentation sync: results visibility, paper timing, option orders, Calculator, disabled recorder | memory-agent | T-1407 | [X] COMPLETED |

## Phase 18 — Final version delivery (2026-11-01)

Single canonical tree, one verified deployable bundle, one tagged release.
Plan approved by the user; `Brain/` is the communication medium.

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-1501 | - | Freeze and archive: audit all trees, move `examrobo-3`/`examrobo-6` to `archive/versions/`, copy DB dumps to `archive/db/`, SHA256 manifest, consolidate audit placeholders | senior-devops-engineer-agent | - | [X] COMPLETED — 5,585 files hashed; `AUDIT_FINAL_REPORT.md` written |
| T-1502 | - | Git baseline: branch `release/final`, commit all Phase 16/17 work and deletions, commit lockfiles | senior-devops-engineer-agent | T-1501 | [X] COMPLETED — `6fe8a3e` |
| T-1503 | - | Backfill v3 assets: `server/DEPLOY.md`, `import_questions.js`, `imported_questions.json`, `_target_archive/007-009`, root `.env.example`, `docs/` content pack | senior-backend-engineer-agent | T-1502 | [X] COMPLETED — `0552d30` |
| T-1504 | - | Adopt v3 production compose (`env_file`, `DB_PASSWORD`, `127.0.0.1:8083`, healthchecks) and Cloudflare-aware nginx | senior-devops-engineer-agent | T-1503 | [X] COMPLETED — `4676544`, `docker compose config` OK |
| T-1505 | - | Align `README.md` and `DEPLOY.md` with the single port, env naming and Cloudflare prerequisite | reference-agent | T-1504 | [X] COMPLETED — `4676544` |
| T-1506 | R-005,R-020 | Code fixes: seed `section_limits`, env-driven bcrypt rounds, legacy-recorder comment cleanup, option-order analytics regression test | senior-backend-engineer-agent | T-1505 | [X] COMPLETED — `8285b6f`; 158 unit tests, web build clean |
| T-1507 | R-010 | Add `import-bank.mjs`: parse the 1100-question markdown, map domain/skill/difficulty, idempotent `--dry-run`/`--replace` | senior-backend-engineer-agent | T-1506 | [X] COMPLETED — dry run 1100 / 100-per-domain / 330-715-55 |
| T-1508 | R-010 | Normalize `Cyber Security`/`Cybersecurity`, import the full bank, validate 1100 / 100-per-domain / 330-715-55 / 4 options | senior-backend-engineer-agent | T-1507 | [>] IN PROGRESS — migrations 011/012 written; real import awaits the Docker daemon |
| T-1509 | - | Full verification: `docker compose up -d --build`, migrate, seed, `npm run verify` (four phases PASS), web build | critique-agent | T-1508 | [ ] PENDING |
| T-1510 | R-020,R-040 | Browser click-through 320/390/tablet/1280: login, waiting, domain picker, sections, calculator, submit, result, admin CRUD | critique-agent | T-1509 | [ ] PENDING |
| T-1511 | - | Documentation sync: PRD/TRD/Schema/Flow/Design, `Start`, `Project`, `Project_Guide`, `compact`, rotate log if needed | memory-agent | T-1510 | [ ] PENDING |
| T-1512 | - | Release: bump `Brain/VERSION` to v1.5.0, align package versions, merge `release/final` → `main`, push, tag `v1.5.0` | senior-devops-engineer-agent | T-1511 | [ ] PENDING |
| T-1513 | - | Production cutover: fresh backup, scratch restore + bridge rehearsal, deploy, post-cutover smoke, rollback ready | senior-devops-engineer-agent | T-1512 | [B] BLOCKED — explicit user approval required |

## Phase 1.5 — Coding Round (deferred)

| ID | Req | Task | Agent | Depends On | Status |
|---|---|---|---|---|---|
| T-901 | R-070 | Self-hosted Judge0 + gated coding round | startup-engineering-team-agent | - | [ ] PENDING |
