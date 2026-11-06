# User Requirements & Brainstorming Ledger

## Project Vision

Website-first proctored exam platform (Phase 1 = MCQ only, any OS, any browser).
A student signs in with an invited email, takes a one-sitting proctored exam in
the browser, and gets a result; staff create events, upload the roster, watch the
exam live and export results. Phase 2 adds the Windows lockdown agent; Phase 1.5
adds the gated coding round.

## Brainstorming Log

### 2026-11-05 — v2.0 multi-tenant SaaS direction (approved)

The user reviewed the 38-file Phase 2 production pack and approved v2.0 /
Phase 20. The full decision register is in `Brain/ProjectReview.md`; the pack is
`docs/Brain-Phase2-Production-Ready/`. Summary:

- **Tenancy:** forced Postgres RLS; the app role never has `BYPASSRLS`.
- **Domains:** Elite only at `slug.examrobo.com`; Trial/Standard/Premium use the
  shared platform path; custom domains out of scope. Super Admin at
  `admin.examrobo.com`.
- **Staff:** one institution per principal; exactly one owner, exactly one admin,
  plus employees; only the owner manages the admin; owner transfer only by Super
  Admin.
- **Staff auth:** password; Admin sets a 24h temp password; forced change.
- **Super Admin:** password + WebAuthn; two accounts + backup codes.
- **Students:** email OTP/magic link; unique individual email; one institution;
  no self-registration; invigilator PIN fallback (15 min, audited). Shared
  family/guardian inboxes are rejected; final uniqueness/backfill awaits the
  collision scan. Student SMS OTP is deferred because roster records have no phone.
- **Staff contact verification:** email + SMS OTP.
- **Content:** per-institution taxonomy and bank; the 1100 pack is imported on
  request; papers keep frozen copies.
- **API:** new `/api/v2`; existing `/api` exam routes stay compatible.
- **Scope:** institutions + exams + billing/plans.
- **Limits:** plan table Trial free/7 days, 700 roster/event, 10 events, 2
  employees; Standard INR 10,000/30 days, 300/30/5; Premium INR 20,000/30 days,
  700/100/15; Elite contract/licensing. Monthly only; 18% GST placeholder.
  Absolute ceiling 1000 students/event, 100 active events, 50 concurrent and
  20 staff per institution. Exactly one Owner and one Admin outside the employee
  cap; pending employee invitations do not consume seats; disabled staff free
  seats.
- **Sessions:** 15-min access + 7-day rotating refresh.
- **Billing:** Owner/Admin manage plan, payment and invoices; automated lifecycle
  plus manual Super Admin overrides through one audited service; the reconciler
  is the sole entitlement writer. Billing records survive purge.
- **Lifecycle:** optional plan expiry; no new attempts after expiry; started
  attempts finish to the original scheduled end with a 15-minute
  submission/reconnect window; manual purge only, annual review; purge deletes
  students/bank/results and keeps staff/institution/audit/invoices/payments/
  credit notes.
- **Export:** Admin results only; Super Admin full archive before purge.
- **Legal:** institution is controller; platform is processor; no DOB by default.
- **Legacy:** internal non-public `ParaRobo` institution; oldest admin -> owner,
  rest -> employees.
- **Transfers:** new account at the new institution; old principal deactivated;
  old data stays.
- **Deferred:** exam history/top-N (v2.1), custom domains, shared family emails,
  student SMS OTP.
- **Execution:** P20.0 baseline freeze only; G1+ needs separate approval.

**Amended 2026-11-06:** billing/plans are in v2.0; Owner + Admin manage billing;
email + SMS verify institution/staff contacts; the plan table and platform
ceiling above replace the old 5/500/50/1000 limits; invoices/payments/credit
notes are retained on purge. Prices are INR 10,000/20,000 monthly with 18% GST
placeholder; exactly one Admin; Elite subdomain only; Hostinger VPS + managed
services; expiry uses scheduled-end completion plus 15-minute recovery.

### 2026-11-01 — Final version consolidation (approved plan)

The user asked for a single final version of ExamRobo after several trees had
accumulated. The following decisions were taken explicitly:

- **Canonical base:** this repository (`Desktop\Exam-Robo-main`, branch
  `ui/redesign`). It is the newest code and the tree the Brain already calls the
  authoritative main tree.
- **Scope of "final":** a clean canonical repo release **and** a verified
  deployable bundle.
- **Recordings:** stay removed. The table, Docker volume and event-delete
  cleanup are retained for existing data only. No active recorder is restored.
- **Deployment profile:** adopt the `examrobo-3` production operations
  (Cloudflare-aware nginx, `env_file`, `DB_PASSWORD`, `127.0.0.1:8083`,
  `examrobo.pararobo.in`).
- **Content:** import the full 1100-question bank (11 domains × 100).
- **Duplicates:** archive `examrobo-3` and `examrobo-6` into `archive/versions/`
  with a SHA256 manifest; other copies on `Downloads\` stay outside the repo.
- **Brain is the communication medium:** every decision is written to
  `Brain/Log.md`, every task status to `NextSteps.md`, every gap to `Issue.md`.

## Current Brainstorming State

v2.0 / Phase 20 approved. Baseline frozen at tag `v1.5.0-baseline`; branch
`feat/saas-v2`. G0 verification stays open until Postgres is up; G1+ has not
started. Task queue: `NextSteps.md` P20-01..P20-08.
