# ExamRobo — Phase 20 (v2.0) Strategic Review & Execution Blueprint

**Status:** approved 2026-11-05; amended 2026-11-06 for billing, plans, SMS OTP
and plan limits. Baseline frozen at `v1.5.0-baseline` (`3c6518b`), branch
`feat/saas-v2`.
**Authorization:** P20.0 baseline and the isolated G1 security proof
(`P2-0101`..`P2-0106`) are approved as of 2026-11-06. G1 is limited to an
isolated, synthetic PostgreSQL 16 harness and remains **VERIFYING**. On
2026-11-08 the owner authorized G2 **implementation** on synthetic/scratch
databases only; G2 is **IN-PROGRESS**, not approved, and every production tenant
change still requires G1 approval and a separate explicit G2 approval.
**Authoritative design:** `docs/Brain-Phase2-Production-Ready/` (38 files).
This file is the Brain entry point and the decision register, not a copy of the
pack.

---

## 1. Verdict

The Phase 2 pack is a **strong design blueprint, not an executable plan**. The
architecture is sound: forced Postgres RLS, per-institution taxonomy and bank,
frozen paper copies, expand → backfill → validate → enforce → cut over, and a
security proof before any product code. Do not replace it.

It cannot be executed as written because Brain's baseline is stale and the pack
still contains proposed identity decisions. The pack correctly states the source
baseline (`v1.5.0`, migrations `001–013`), but R-103 repeats a "globally unique
`students.email`" product rule even though no `students` table exists, and
ADR-IDENTITY-02 still asks whether global uniqueness is acceptable. The decision
register resolves both. The correct first move is not to write routes — it is to
freeze the real baseline, prove RLS in isolation, and only then start the tenant
schema.

The pack also leaves several product questions open. Those are now locked in
the decision register below; where the pack contradicts the register, the
register wins until the pack is amended.

## 2. Sources of truth

| Layer | Source | Rule |
|---|---|---|
| Reality | frozen code at `b5ddb76` (tag `v1.5.0`); docs baseline `3c6518b` (tag `v1.5.0-baseline`) + `server/sql/migrations/001..013` + `npm run verify` | wins every conflict |
| Intent | `docs/Brain-Phase2-Production-Ready/` | design authority; never edit to hide a gap |
| Memory | `Brain/` | state, decisions and task queue; correct it when reality moves |
| Reference | `Downloads\examrobo-frontend\web` / `server` | read-only contract reference |

A Brain file may be contradicted by reality. It must then be corrected, not
preserved. A pack requirement may be contradicted by a locked decision; the
decision register records the override.

## 3. Baseline audit

Verified against `b5ddb76` (v1.5.0, `main`) on 2026-11-05.

| Claim | Reality |
|---|---|
| Brain `compact.md`: v1.4.0 | `Brain/VERSION`, both `package.json` files: **1.5.0** |
| Brain `Start.md`: Phase 16, 131 unit, 156 smoke | **Phase 19**, v1.5.0, **161 unit, 187 smoke** (`T-1522`) |
| Brain `Start.md`: 13 tables; `Project.md`: 15 | **18 domain tables + `schema_migrations`** (19 `CREATE TABLE`) |
| `docs/VERSIONS.md`: migrations 001–010 | **001–013**; latest is `013_event_soft_delete.sql` |
| Original pack R-103 (corrected 2026-11-06): `students.email` is globally unique | **No `students` table exists.** Student login is roster-based (`server/routes/auth.js:53-56`); the token is `sub=email,eventId` (`:98`). Only `admins.email` is globally unique (`server/sql/schema.sql:12`). |
| Pack: staff/student principals already exist | They do not. v2.0 introduces them; they cannot be assumed by a migration. |
| Pack: current API is `/api` only | True, but the v2.0 contract must add `/api/v2` while leaving `/api` exam routes compatible. |

Working-tree decisions taken for the freeze:

- Restored `server/package-lock.json` and `web/package-lock.json`.
- Kept the graphify `.gitignore` entry and `opencode.json` (tooling, no secrets).
- Kept the deletion of the superseded question-pack PDF.
- Added the 38-file pack to the feature branch; it is not edited.
- Corrected `docs/VERSIONS.md`, `Brain/Start.md`, `Brain/compact.md`,
  `Brain/Project.md`, `Brain/PRD.md`, `Brain/TRD.md`.

## 4. Decision register (locked)

| ID | Area | Decision |
|---|---|---|
| D-01 | Tenancy | Multi-tenant on one Postgres; **forced RLS**; the app role never has `BYPASSRLS`. |
| D-02 | Institution URL | Elite only: `slug.examrobo.com`. Trial/Standard/Premium use the shared platform path. Custom domains are out of scope. |
| D-03 | Super Admin URL | `admin.examrobo.com`. |
| D-04 | Staff membership | One institution per staff principal. |
| D-05 | Staff roles | Owner (1) + **exactly one Admin** + Employees. Only the Owner creates/replaces/disables the Admin; the Admin manages employees. Owner and Admin manage billing; Employees cannot. |
| D-06 | Employee rights | Events, roster, proctor, results, publish. No delete/archive. |
| D-07 | Staff auth | Password; Admin sets a 24h temporary password; forced change. |
| D-08 | Super Admin auth | Password + WebAuthn; two Super Admins + backup codes. |
| D-09 | Student auth | Email OTP / magic link; no password; no self-registration. SMS OTP is for institution/staff contact verification, not student exam login. |
| D-10 | Student identity | Unique individual email per active student; one institution per student; shared family/guardian inboxes rejected. Final global uniqueness constraint/backfill is blocked by the mandatory legacy collision scan. |
| D-11 | OTP fallback | Invigilator-issued one-time PIN, 15-minute expiry, audited. |
| D-12 | Taxonomy | Per institution; `domains` + `skills`; starts empty. |
| D-13 | Bank | Per institution; 1100-question pack imported on request; papers keep frozen copies. |
| D-14 | API | New `/api/v2`; existing `/api` exam routes stay backward compatible. |
| D-15 | Release scope | Institutions + exams + billing/plans. Billing, plan catalogue, invoices, payments, GST and reconciliation are in v2.0. |
| D-16 | Limits | Plan table: Trial 700 roster/event, 10 events, 2 employees; Standard 300/30/5; Premium 700/100/15; Elite contract. Exactly one Owner and one Admin per institution; Owner/Admin are outside the employee cap. Absolute platform ceiling: 1000 students/event, 100 active events/institution, 50 concurrent exams/institution, 20 staff accounts/institution. Pending employee invitations do not consume seats; disabled employees free seats. Elite above the ceiling needs platform capacity approval. |
| D-17 | Admission | Warn at 80%, hard-block new starts at 100%; never interrupt a live exam. |
| D-18 | Sessions | 15-minute access token + 7-day rotating refresh. |
| D-19 | Plan expiry | No new attempts at/after entitlement expiry. Started attempts finish to their original scheduled end. A 15-minute submission/reconnect recovery window is allowed; no extra answer time. No 24-hour tenant grace. |
| D-20 | Closure | Deactivate institution + accounts; retain data; no automatic deletion. |
| D-21 | Purge | Manual, Super Admin only, after a full archive export; deletes students, bank, results; keeps staff/institution/audit. Invoices, payments and credit notes are retained for tax/audit. |
| D-22 | Export | Admin exports results only; Super Admin exports the full archive before purge. |
| D-23 | Minors | Institution is data controller; platform is processor; no DOB by default. |
| D-24 | Legacy | One internal, non-public institution `ParaRobo`; oldest admin → owner, rest → employees. |
| D-25 | Student transfer | New account at the new institution; old principal deactivated; old data stays; email reusable after deactivation. |
| D-26 | Exam history | Deferred to v2.1 (history + top-N). |
| D-27 | Hosting | Hostinger VPS for API/web/workers plus separate managed PostgreSQL, Redis and object storage. Exact managed providers, region/data residency and RPO/RTO remain open. Razorpay and Hostinger SMTP are selected; SMS provider remains open. |
| D-28 | Roster import | Import valid rows, report errors; event cannot start until the Admin acknowledges the report; re-import is idempotent. |
| D-29 | Owner transfer | Super Admin only. |
| D-30 | Staff invite | Admin sets a temporary password (no invite link). |
| D-31 | Pending institution | Status-only access until Super Admin approval. |
| D-32 | Email sender | Platform sender `no-reply@examrobo.com` + institution Reply-To. |
| D-33 | Billing lifecycle | Automated payment, renewal, expiry and limit enforcement plus manual Super Admin overrides. Manual actions call the same audited service, never bypass database constraints and never interrupt a live exam. The reconciler remains the sole writer of entitlement projection. |
| D-34 | Billing rights | Owner and Admin manage plan, payment and invoices; Employees cannot. Only the Owner can transfer ownership; only Super Admin can transfer an Owner. |
| D-35 | SMS OTP | Email + SMS OTP for institution/staff contact verification. Student exam login stays email OTP/magic link + invigilator PIN in v2.0 because roster/student records do not capture phone; student SMS is deferred. |
| D-36 | Plans and ceilings | The plan catalogue is versioned and price/limit snapshots are immutable. Trial free (7 days); Standard INR 10,000/30 days; Premium INR 20,000/30 days; monthly only. 18% GST is a placeholder until CA approval; refund terms remain placeholders. The platform ceiling protects capacity; Elite is a contract/licensing scope. |

### Pack resolutions

| Pack item | Resolution |
|---|---|
| R-103 / ADR-IDENTITY-02 (global student email uniqueness, shared-family preflight) | Product owner **confirms unique individual student email** (D-10). One active institution per student; no shared family email. The principal/roster separation is retained; the legacy duplicate/shared-email preflight is still mandatory before migration. Pack R-103 was corrected on 2026-11-06. |
| ADR-IDENTITY-02 (staff may have multiple memberships if approved) | **Not approved** (D-04): one institution per staff principal. Pack ADR-IDENTITY-02 is superseded. |
| 05-SUBSCRIPTIONS-BILLING | **In scope for v2.0** (D-15/D-33): billing tables, plans, invoices, payments, GST and reconciliation. Manual Super Admin overrides share the audited service; billing records survive purge. |
| 06-REGISTRATION-API-CONTRACT | Institution onboarding is Super Admin-approved, status-only until then (D-31). Student self-registration is rejected (`Brain/Not.md`). |
| ADR-PLATFORM-02 (no global RLS wildcard) | **Adopted** (D-01). Super Admin uses narrow, purpose-bound, time-limited, audited functions. |
| ADR-STACK-01 (preserve the v1.5 stack) | **Adopted.** No framework rewrite; `/api/v2` extends the existing Express app. |
| The pack's `students` table assumption | **No such table in v1.5.** v2.0 creates the principal/membership tables in migration 014+; the legacy backfill starts from `roster_emails`, `papers` and `admins`. |

## 5. Target architecture

### 5.1 Identity and tenancy

- `institutions` — tenant root, slug, status (`pending|active|suspended|closed`),
  plan/limits, deactivation deadline.
- `plans`, `subscriptions`, `invoices`, `payments`, `webhook_events` — versioned
  billing catalogue/snapshots, entitlement periods and reconciliation.
- `staff_principals` — one row per staff person; `email` is the login identity.
- `staff_memberships` — `(institution_id, principal_id, role)` with one
  institution per principal; owner is unique per institution.
- `student_principals` — one active institution per student email; the email is
  the login identity, not a roster row.
- `student_memberships` — `(institution_id, principal_id)`, status and history.
- The existing `admins` table becomes the legacy source for the `ParaRobo`
  backfill; it is not the v2.0 identity table.
- Super Admins are platform-level, not tenant rows.

### 5.2 RLS pattern

- Every tenant table carries `institution_id`.
- The API opens a transaction, sets the tenant context (session GUC), then runs
  the query. Policies use the context and fail closed when it is missing.
- Roles: `examrobo_table_owner`, `examrobo_app`, `examrobo_auth_fn`,
  `examrobo_auth_app`, `examrobo_context_fn`. No runtime `BYPASSRLS`.
- The G1 proof must show: tenant A cannot read/write tenant B, a missing context
  returns zero rows, and the app role cannot bypass a policy.

### 5.3 Auth flows

- Staff: password → session. Temporary password forces a change; 24h expiry.
- Super Admin: password + WebAuthn; two accounts + backup codes; audited.
- Student: email OTP / magic link → 15-minute access + 7-day rotating refresh.
- Contact verification: email + SMS OTP for institution/staff contacts; student
  SMS is deferred.
- Fallback: invigilator issues a one-time PIN (15 min), recorded in the audit log.
- Legacy: existing exam tokens stay valid for the v1.5 routes until cutover.

### 5.4 API

- `/api/v2` for institutions, staff, roster, students, sessions, results, plans
  and billing operations.
- `/api` keeps the exam runner, autosave, submit, result, WS tickets and admin
  event routes working for v1.5 clients during the bridge.
- The API remains the clock and the grader; the answer key never leaves the
  server before submit.

### 5.5 Data migration

- New migrations start at **014**; never reuse 001–013.
- Expand → backfill → validate → enforce → cut over.
- Create the `ParaRobo` institution; map the oldest admin to owner and the rest
  to employees; backfill every existing event, roster row, paper, result and
  audit row into the tenant.
- Validate row counts and orphan checks before enabling NOT NULL / RLS.
- Keep a rehearsed rollback: v1.5 remains the rollback baseline.

### 5.6 Content

- Per-institution taxonomy and bank; the 1100 pack is imported on request.
- Papers freeze skills/question copies, so a later re-tag never rewrites a
  finished exam.
- The platform's existing 1110-question content is not automatically shared;
  the `ParaRobo` import is explicit.

### 5.7 Operations

- Hostinger VPS for API/web/workers; separate managed PostgreSQL, Redis and
  object storage. Region/data residency, providers and RPO/RTO remain open.
- Backups + restore rehearsal before cutover.
- Admission control at 80%/100% and the plan/platform ceilings.
- Plan expiry blocks new attempts; started attempts finish to the original
  scheduled end; 15-minute submission/reconnect recovery only. It never deletes.
  Purge is manual and audited.
- Billing: Owner/Admin self-serve plan, payment and invoices; Super Admin can
  adjust or extend with audit. Razorpay and Hostinger SMTP are selected; CA/GST,
  refund and provider credentials remain gates before G3.
- SMS: registration/staff contact verification only; provider/DLT remains open;
  student SMS is deferred.
- Email: Hostinger SMTP with platform sender and institution Reply-To;
  SPF/DKIM/DMARC required.

### 5.8 Frontend

- Elite institutions get `slug.examrobo.com`; Trial/Standard/Premium use the
  shared platform path. Custom domains are out of scope. Super Admin console is
  at `admin.examrobo.com`.
- Student OTP/magic-link screens, waiting room, runner and result stay familiar.
- Admin console adds staff/membership management, plan/billing, import status and
  usage.
- Exactly one Admin per institution; only the Owner manages the Admin.
- Owner and Admin see billing; Employees do not. Owner transfer stays Super
  Admin-only.
- Pending institutions see status only, not tenant data.

## 6. Execution plan

| Step | Gate | Deliverable | Exit criterion | Status |
|---|---|---|---|---|
| P20-01 | G0 | Baseline freeze: locks, docs, tag, branch | tag `v1.5.0-baseline`; no unrelated diff | **done** (`3c6518b`) |
| P20-02 | G0 | Decision register + Brain sync | this file + PRD/TRD pointers + task queue | **done** |
| P20-03 | G0 | Verify with Postgres + Redis up | all four phases PASS | **partial** — local verification green; production-data closure blocked |
| P20-03a | G0 | Clean tree, four-phase verify, baseline evidence | all four phases PASS + `docs/phase2/evidence/baseline.md` | **DONE** — 4/4 phases green at clean HEAD `1791455`; smoke 187/187 |
| P20-03b | G0 | Restore production-like backup; identity collision scan; owners/reviewers | restore + collision report accepted | **blocked** — no backup or collision evidence available; G0 stays partial |
| P20-04 | G1 | Isolated RLS proof: roles, policies, cross-tenant denial, no `BYPASSRLS` | every attack case denied; app role cannot bypass | **passing locally** — 24/24; evidence in `docs/phase2/evidence/g1/`; independent review pending; G1 not approved; G2 implementation authorized only under waiver |
| P20-05 | G2 | Tenant schema, migrations 014+, `ParaRobo` backfill, RLS enforced | migration rehearsal on a restored copy passes; counts match | **in progress** — `014` implemented, mirrored and scratch-verified; seed/import write legacy key; `015` waits on login policy + collision report; no production schema/data; G2 not approved |
| P20-06 | G3 | Identity + `/api/v2` + sessions/OTP/PIN + billing/plans + legacy bridge | contract tests, staff/super/student flows, billing/plan tests, `/api` still green | pending |
| P20-07 | G4 | Privacy/export/purge, India hosting, backup/restore, load/limits | restore rehearsal, 80/100% admission, plan-ceiling proof | pending |
| P20-08 | G5 | Cutover + rollback rehearsal | production smoke, rollback tested, v1.5 restorable | pending |

### Gate definitions

- **G0 — baseline:** the tree is clean, the tag exists, and `npm run verify` is
  green. Skipped phases do not count as green. A production-like restore and the
  identity collision report are required; without them G0 is **partial**, never
  green.
- **G1 — security proof:** forced RLS is proven in isolation before any product
  route is written. This is the hard gate; failing it stops the project. The
  owner approved the isolated synthetic POC on 2026-11-06 despite G0's
  production-data items being blocked. This is a recorded waiver for the POC
  only; it does not pass G0 and does not authorize G2.
- **G2 — data:** migrations and the `ParaRobo` backfill survive a restore and
  a rehearsal; no orphan rows.
- **G3 — product:** identities, `/api/v2`, billing and plans work; old `/api`
  routes still pass.
- **G4 — operations:** backup/restore, limits, privacy and exports are proven.
- **G5 — release:** cutover and rollback are both rehearsed; v1.5 remains
  restorable.

## 7. Risks and mitigations

| Risk | Mitigation |
|---|---|
| A query runs without tenant context and RLS is bypassed | fail-closed policies, transaction-scoped GUC, G1 attack suite, no `BYPASSRLS` role |
| Legacy identity collision when creating staff principals | preflight report from the live DB; decide merge/split before backfill |
| One student email can only be active at one institution | unique active membership; transfer deactivates the old principal first |
| Partial roster import leaves an event unusable | import valid rows, persist the error report, block start until acknowledged, idempotent re-import |
| Purge destroys bank/results | full archive export required first; Super Admin only; audit every purge |
| Plan expiry interrupts a live exam | allow started attempts to finish to the original scheduled end; 15-minute submission/reconnect only; no new attempts |
| Plan limits disagree between the catalogue, UI and DB | one plan version + limit snapshot; DB checks and contract tests read the same source |
| Billing/provider or GST approval delays G3 | provider selected and CA policy approved before P20-06; test-mode proof first |
| SMS OTP delivery fails | email OTP + invigilator PIN remain fallback; DLT templates and delivery tested |
| Long migration locks a live table | expand/backfill/validate in batches; enforce in a short window; rehearse on a restore |
| OTP email lands in spam | SPF/DKIM/DMARC, platform sender, tested deliverability, invigilator PIN fallback |
| Provider/legal choice blocks launch | provider after G1; DPA/privacy/minors attestation tracked in `Issue.md` |
| Frontend rework breaks v1.5 clients during the bridge | `/api` compatibility tests; feature-flag the v2 UI |

## 8. Open inputs

- Hostinger VPS region/data residency, managed-service providers and capacity.
- Hostinger SMTP credentials and SPF/DKIM/DMARC proof.
- SMS provider, sender ID, DLT templates and delivery test.
- Razorpay KYC/credentials + test/live webhook proof.
- CA-approved GST/invoice/credit-note treatment and refund/cancellation policy.
- Elite contract/licensing terms and any custom limit schedule.
- Legal DPA/privacy/terms + minors attestation.
- Legacy email-collision report (requires the live DB).
- RPO/RTO targets.
- DNS/wildcard TLS/cookie-domain setup for Elite subdomains.
- T-1521 browser click-through (v1.5, user action).
- T-1518 real 50-VU k6 run (v1.5, k6 not installed).

## 9. Non-goals for v2.0

Custom domains, exam history/top-N, shared family emails, student self-registration,
student SMS OTP (roster phone is not captured), the Windows lockdown agent,
recordings, cross-tenant bank editing, runtime `BYPASSRLS`, automatic deletion,
staff MFA, mobile apps.

## 10. Evidence

- Baseline commit: `3c6518b` — `chore(baseline): freeze v1.5.0 and correct stale docs`.
- Release commit: `b5ddb76` — tag `v1.5.0`.
- Phase 2 branch: `feat/saas-v2`; checkpoint `a52acd9`.
- The local stack is healthy (`examrobo-db`, `examrobo-redis`, `examrobo-api`,
  `examrobo-web`).
- `npm run verify` (2026-11-05): unit PASS, web build PASS,
  `preflight:postgres` SKIPPED (45s timeout), smoke SKIPPED (scratch DB not
  created). G0 is therefore **open**, not green.
- 2026-11-06 authorization: G0 + isolated G1 POC only. G0 is **partial** because
  no production-like backup or legacy collision report is available. G1 uses
  synthetic fixtures only.
- 2026-11-08 G0-local: preflight Postgres PASS, preflight Redis PASS, unit tests
  PASS, web build PASS, smoke test PASS (187/187), repeated on a clean tree at
  `1791455`. Evidence: `docs/phase2/evidence/baseline.md`. Production-data
  closure remains blocked.
- 2026-11-08 G1: isolated POC passes **24/24** on PostgreSQL 16.15. Evidence:
  `docs/phase2/evidence/g1/`. G1 remains **not approved** until independent
  review.
- 2026-11-08 G2 `014`: institution foundation implemented on scratch and
  old-shape databases; legacy `ParaRobo` row, 20 institution columns, zero null
  tenant rows, ledger 14 and idempotent second run. Fixture backfill mapped all
  18 tenant tables; seed and 1100-question import wrote the legacy key. Unit
  tests **167/167**. `schema.sql` mirrors the shape. Uncommitted.
- 2026-11-08 gate test protocol: `docs/phase2/GATE-REVIEW-PROTOCOL.md` now
  requires implement -> freeze SHA -> execute every `TEST-CASES.md` case ->
  independent review. Per-gate plans are in `docs/phase2/test-plans/`; the G1
  reviewer handoff is `docs/phase2/evidence/g1/REVIEWER-REPORT.md`.
- 2026-11-08 owner directive: **"go for g2 I will provide test audit at last."**
  This authorizes G2 implementation to begin under a **scope-limited waiver**:
  migrations/routes may be written and rehearsed on synthetic/scratch databases,
  but no production schema change, no production data backfill and no tenant
  cutover may run. It does **not** approve G1 or G2. G1 remains **VERIFYING**
  until independent review; G2 acceptance still requires the documented test
  plan, evidence and independent review. The owner will provide the external G2
  test audit after implementation.
- Next action: finish `014` hygiene, then `015` identity control plane once the
  approved login policy and source collision report exist. G2 remains
  **IN-PROGRESS**, not approved.
- Decision amendment (2026-11-06): billing/plans, Owner + Admin billing rights,
  email + SMS contact OTP, plan-table limits with a platform ceiling, and
  billing-record retention on purge are now in v2.0.
