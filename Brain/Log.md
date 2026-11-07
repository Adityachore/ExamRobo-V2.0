# ExamRobo Log

## 2026-11-08 (G0 local verification + G1 POC authorization)

- **Checkpoint committed.** `a52acd9` — `chore(phase20): checkpoint v2 UI and
  docs before G0` (98 files, 3575 insertions, 290 deletions). `UI Reference/` is
  intentionally ignored and not committed. Remote
  `Adityachore/ExamRobo-V2.0` is empty; no push was made.
- **Authorization resolved.** Owner approved G0 plus an isolated, synthetic G1
  security POC only. G0 remains **partial** because no production-like backup or
  legacy collision report is available. The G1 POC proceeds under a recorded
  waiver; G2 and all production tenant work remain blocked.
- **G0-local verification passed.** `cd server && npm run verify`:
  preflight Postgres PASS, preflight Redis PASS, unit PASS, web build PASS, smoke
  test PASS (`187 passed, 0 failed`). The smoke test used the disposable
  `examrobo_smoke` scratch database.
- **Environment note.** Docker publishes IPv4 only, so verification used
  `127.0.0.1` and the root `.env` `DB_PASSWORD`; the `DATABASE_URL` password in
  `server/.env` is stale. No secret was printed.
- **Evidence.** Added `docs/phase2/evidence/baseline.md`. G0 production-data
  closure still needs a restore/checksum, collision report, and named reviewers.
- **Next:** confirm the clean tree, build the isolated G1 harness, run the
  SEC-001..016 attack suite, write G1 evidence, and stop for independent review.

## 2026-11-06 (v2.0 UI-first implementation, contract-only)

- **Approach locked with the user.** Build the UI before the v2 backend; call only
  `/api/v2` through one endpoint map; missing endpoints show an explicit
  contract-pending state; no fake product data. Existing v1.5 student and legacy
  admin screens stay functional until parity. No commit.
- **Contract layer.** Added `web/src/lib/endpoints.js` (canonical v2 paths +
  query helper + legacy paths), `web/src/lib/session.js` (UI-only staff/platform
  session and capability adapter), `web/src/hooks/useApi.js` (unwraps
  `{ data, meta }`), and `web/src/components/ContractPending.jsx`. Updated
  `web/src/lib/api.js` with the platform token/profile key and normalized
  `{ error: string }` / `{ error: { code, message, details } }` handling.
- **Shells and guards.** Added `AppShell`, `PlatformShell` and
  `RequireAuth`/`StaffGuard`/`PlatformGuard`/`OwnerOnly`/`ManagersOnly`. Guards
  are UX-only; the server remains the authorization authority.
- **Pages.** Created the public/legal/auth flow, the platform console (dashboard,
  registrations, institutions, plans, revenue, analytics, audit/alerts,
  settings), the institution workspace (dashboard, onboarding, events/workspace,
  students/detail, employees, admin, billing, activity, support access,
  settings), and shared states (404/403, maintenance, plan limit, institution
  state, offline banner). The 7 inventory screens without drafts use existing
  v1.5 pages or contract-pending states.
- **Legacy preservation.** `/`, `/seb`, `/waiting`, `/exam`, `/result`, `/locked`
  and `/admin/*` remain wired to the existing v1.5 implementation. `/app` and
  `/platform` are additive; no legacy redirect is enabled before parity.
- **Two defects found and fixed during wiring.** (1) platform pages initially
  used the default `admin` token role; all platform reads now pass
  `useApi(path, 'platform')` and the approve/reject calls pass
  `role: 'platform'`; (2) Onboarding still navigated with
  `window.location.assign('/app')`, now uses React Router `navigate`.
- **Verified:** `cd web && npm run build` -> Vite 8.3.5 clean, 2436 modules,
  JS `index-9k5f60zW.js` 725.19 kB (gzip 206.88 kB), CSS `index-ae3WU_Jc.css`
  54.64 kB. Only the existing chunk-size warning remains. No browser click-through
  yet.
- **Still open:** G0 is unchanged (Postgres/Redis unavailable on the last known
  verify attempt); v2 API endpoints are not connected by design; legacy
  `/admin/*` redirects wait for parity; `docs/phase2/evidence/baseline.md` still
  does not exist. Brain records updated; changes remain uncommitted.

## 2026-11-06 (v2.0 business/architecture decision lock)

- **Locked:** exactly one Owner and one Admin per institution; employee seats
  Trial 2 / Standard 5 / Premium 15; pending employee invitations do not consume
  seats; disabled employees free seats; only the Owner manages the Admin.
- **Commercial:** Trial free/7 days; Standard INR 10,000/30 days; Premium INR
  20,000/30 days; monthly only; 18% GST placeholder; refund/cancellation terms
  remain placeholders; Elite is a contract/licensing scope.
- **Limits:** 700/300/700 are roster-per-event caps; events/period 10/30/100;
  absolute ceiling 1000/event, 100 events, 50 concurrent, 20 staff.
- **Expiry:** no new attempts after entitlement expiry; started attempts finish
  to the original scheduled end; 15-minute submission/reconnect recovery only;
  no 24-hour tenant grace.
- **Support:** restricted default; sensitive access requires institution
  approval or approved break-glass, scoped, step-up authenticated and audited.
- **Providers/domains:** Razorpay; Hostinger SMTP; Hostinger VPS plus managed
  PostgreSQL/Redis/object storage; Elite-only platform subdomain; non-Elite uses
  the shared path; custom domains out of scope.
- **Still blocking:** legal/privacy, legacy email-collision scan, CA-approved
  GST/refund, Elite licensing terms, SMS/DLT, SMTP domain authentication,
  Razorpay KYC, managed-service region/RPO/RTO.
- **Docs:** `36-BUSINESS-AND-PRODUCT-DECISION-REGISTER.md` rewritten; Brain and
  pack cascaded. Docs-only; no code/tests changed; uncommitted by user direction.

## 2026-11-06 (v2.0 decision amendment: billing, plans, SMS, limits)

- **Billing/plans moved into v2.0** by owner decision, overriding the earlier
  “no billing” baseline. Owner and Admin manage plan/payment/invoices; automated
  lifecycle and manual Super Admin overrides share one audited service; invoices,
  payments and credit notes survive tenant purge.
- **Plan table approved:** Trial 700/10/2, Standard 300/30/5, Premium 700/100/15,
  Elite contract (students/events/staff). Absolute ceiling: 1000 per event, 100
  active events, 50 concurrent and 20 staff per institution; staff counts
  Owner + Admins + Employees.
- **OTP scope:** email + SMS verify institution/staff contacts. Student exam login
  stays email OTP/magic link + invigilator PIN because roster records have no
  phone; student SMS is deferred.
- **Identity conflicts resolved:** one institution per staff principal; one
  active individual student email; shared family email rejected. Pack R-103,
  ADR-IDENTITY-02, R-101, R-106, R-120 and the role matrix were corrected.
- **Docs aligned:** ProjectReview D-05/D-09/D-15/D-16/D-21/D-27/D-33..D-36,
  NextSteps/Issue, compact/Project/Not/Later/userRequirement, and the Phase 2
  pack charter/requirements/billing/API/UX/ADR/dependencies/readiness files.
  Docs-only; no code or tests changed; uncommitted by user direction.
- **G0 remains open:** the stack is up, but `npm run verify` was not re-run after
  this docs pass; no baseline evidence file exists yet.

## 2026-11-06 (documentation truth audit, P0 + P1)

- **Audited 86 project Markdown files** (excluding `Brain/skills/**`,
  `node_modules` and `archive`) against the v1.5.0 tree. Applied docs-only P0+P1
  corrections; no code, tests, Phase 2 pack or skills were changed.
- **P0 facts fixed:** bank import is idempotent on `questions.source_key` (not
  stem hash); event delete archives and keeps files; section clocks start when
  the paper is created; retired integrity kinds (`recording_revoked`,
  `share_surface`) are historical CHECK values only; `removeRecordingDirs`
  removed from TRD.
- **P1 indexes fixed:** 18 domain tables + ledger, 48 taxonomy skills, 187 smoke
  assertions, 38 web source files, 38-file Phase 2 pack, web port 8083, current
  route/service/test lists, migrations 011-013, and the `app.js`/`index.js`
  split. Historical documents (audit report, AllHailAI progress, checkpoint,
  domain plan, UI spec) got explicit supersession banners instead of rewrites.

## 2026-11-05 (v2.0 / Phase 20 planning + baseline freeze)

- **Reviewed the 38-file Phase 2 pack** against the actual tree at `b5ddb76`
  (v1.5.0). Verdict: strong design blueprint, not an executable plan. Brain's
  baseline was stale (v1.4.0, Phase 16, 131/156, 13 tables, migrations 001-010),
  and the pack's R-103 still states a `students.email` rule for a `students` table
  that does not exist. The decision register resolves both.
- **Baseline frozen** in `3c6518b` on `main`; tag `v1.5.0-baseline`; branch
  `feat/saas-v2` created. Restored both package locks; kept the graphify
  `.gitignore`/`opencode.json` setup and the superseded PDF deletion; corrected
  `docs/VERSIONS.md` to migrations 001-013 and refreshed Start/compact/Project/
  PRD/TRD.
- **Locked decisions** (full register in `Brain/ProjectReview.md`): forced RLS
  with no `BYPASSRLS`; `slug.examrobo.com` + `admin.examrobo.com`; owner/admins/
  employees; staff password + 24h temp password; Super Admin password + WebAuthn;
  student email OTP/magic link, unique email, one institution; invigilator PIN
  fallback; per-institution taxonomy and bank; `/api/v2` with `/api` exam routes
  compatible; institutions + exams only (no billing — **superseded 2026-11-06**);
  5 events / 500 students / 50 concurrent / 1000 total — **superseded by the plan
  table and platform ceiling on 2026-11-06**; 80% warn, 100% block new starts,
  never interrupt;
  15-min access + 7-day rotating refresh; expiry deferred until live papers end
  (max 24h); deactivate + manual purge only; Admin results export / Super Admin
  full archive; institution is controller, platform processor; `ParaRobo` legacy
  institution; roster import with acknowledged errors; platform sender + Reply-To;
  status-only access while pending.
- **Authorization:** P20.0 baseline only. G1 security proof onward requires a
  separate approval; T-1513 v1.5 cutover is superseded, v1.5 remains rollback.
- **Verified:** `npm run verify` -> 161 unit tests PASS, web build PASS,
  `preflight:postgres` + smoke SKIPPED (localhost:5450 down). G0 stays open until
  a green run with the stack up.

## 2026-11-01 (v1.5.0 release)

- **Phase 19 committed** in `e0a6c4e` on `release/final`: event archive, incident
  grouping, section rail, bounded submit path, load safety and the Cloudflare
  host-proxy runbook.
- **Versions aligned**: `Brain/VERSION`, `server/package.json` and
  `web/package.json` (and their lockfile roots) are `1.5.0`.
- **Release pushed**: `release/final` and `main` are identical, annotated tag
  `v1.5.0` points at the release commit.
- **Handoff gaps, stated honestly**: the browser click-through (T-1521) and the
  real 50-VU k6 run (T-1518) are still pending; neither blocks a deploy.

## 2026-11-01 (exam-day issues batch, Phase 19)

- **Parity first, then only three v6 ideas.** The current runner matched
  `examrobo-3` everywhere except nine hook/lib files, so only the section rail,
  the footer order and the countdown presentation came from `examrobo-6`.
- **Section rail above the runner.** `SectionRail` shows the chips, the active
  countdown and one Finish action; the finish dialog is shared with the card
  footer. `sections.test.js` now pins the "no extra time at `ends_at`" boundary.
- **One Alt-Tab, one strike.** Blur, fullscreen exit and display change are one
  incident for 4 seconds; the warning retries reuse one `client_event_id`;
  `recording_revoked` and `share_surface` are retired.
- **Event delete became archive.** Migration 013 adds the deleted columns, the
  default admin list hides archived events, `include_deleted=1` shows them under
  Completed, edits are refused, and open papers are ended with `removed`. The
  papers, results and recordings stay.
- **Blank screen after submit**: root `ErrorBoundary`, Result shows a finishing
  card after six bounded retries instead of redirecting, `goResult` is bounded
  at 40 attempts. Root cause still needs a browser repro.
- **50-student readiness**: `PG_POOL_MAX` (default 20), the k6 script rewritten
  for the section API plus an admin polling scenario, and `npm run load` with a
  one-line install hint. The 50-VU run is still not executed.
- **Cloudflare runbook** now covers the existing host proxy: forward
  `CF-Connecting-IP`/`X-Forwarded-Proto`, upgrade `/ws`, keep `TRUST_PROXY=1`,
  Full (strict), origin closed to Cloudflare ranges.
- **Bank import proven in a scratch DB**: 1100 questions, 11 domains x 100, no
  duplicate source keys; the second run imports 0 and skips 1100. `seed:full`
  truncates, so it is not the command for the current database.
- **Live stack rebuilt and imported.** `api` and `web` rebuilt, migration 013
  applied, `imported 1100, skipped 0`. The live DB now has 1110 active
  questions over 13 domains (1100 imported + the 10 dev rows) and no event.
- **Verified:** `npm run verify` -> preflight + 161 unit tests + web build +
  **187/187 smoke assertions** PASS (with `VERIFY_PG_URL`/`VERIFY_REDIS_URL`
  pointed at host port 5450/6379 because `server/.env` holds a stale password).

## 2026-11-01 (section-aware verification and live stack)

- **`npm run verify` is fully green.** Four phases PASS: preflight, 158 unit
  tests, web build and 178/178 smoke assertions. The previous run aborted in the
  domain block; the fixes below closed it.
- **Duration now derives from the section limits.** `derivedDuration()` existed
  but was never called, so an event that omitted `duration_min` got no paper
  length. `normalizeEventInput` now falls back to the derived value; an explicit
  `duration_min` still wins. T-1402 keeps `section_limits` required.
- **The smoke speaks the section engine's language.** The main flow answered all
  9 questions at once, but only the active section accepts answers, and grading
  maps the *displayed* choice through `option_orders`. The flow now answers each
  section, finishes it, and maps authored → displayed before answering.
- **Publication waits for every paper.** The integrity checks leave live papers
  (fullscreen/tabs/reload); the smoke now hands them in through the proctor
  force-submit endpoint before publishing, as an operator would.
- **The stray `Cyber Security` category is gone** from `competency.js`; the test
  now expects 15 technical domains (the bank importer writes `Cybersecurity`).
- **Live stack rebuilt and seeded.** `examrobo-api` (new code) and
  `examrobo-web` are healthy; the dev bank is seeded (event
  `333eaa54-7c1e-421a-b7a4-c89cf7fddb59`, starts 2026-11-01T16:02:48Z). The
  full 1100-question import is still pending because the stock seed event uses
  Aptitude/Logic, which are not bank domains (T-1508).

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
- **Baseline and ops adopted:** `release/final` from `ui/redesign`; `6fe8a3e`
  (88 files) then `0552d30` (v3 `DEPLOY.md`, import tooling, `docs/`, root
  `.env.example`). Production compose and Cloudflare nginx landed in `4676544`,
  code fixes in `8285b6f`. The seed event now derives `section_limits` evenly
  across its categories (60 min / 3 → 20 min per section).
- **Bank importer built.** `server/scripts/import-bank.mjs` parses all 1100
  blocks, maps 11 domains to taxonomy categories and the locked difficulty
  scale (Basic 1 / Medium 3 / High 5), and imports under
  `source_key = examrobo-bank:<ID>` so the 275 intentional repeated stems are
  kept as distinct rows. `--dry-run` reports 1100 / 100 per domain /
  330-715-55 / 4 options. Migrations `011` (rename the stray `Cyber Security`
  category) and `012` (nullable `source_key` + partial unique index) make the
  importer idempotent. **Next:** real import, then verify.

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
