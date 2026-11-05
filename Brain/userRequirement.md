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
- **Domains:** institution at `slug.examrobo.com`; Super Admin at `admin.examrobo.com`.
- **Staff:** one institution per principal; owner + multiple admins + employees;
  owner transfer only by Super Admin.
- **Staff auth:** password; Admin sets a 24h temp password; forced change.
- **Super Admin:** password + WebAuthn; two accounts + backup codes.
- **Students:** email OTP/magic link; unique email; one institution; no
  self-registration; invigilator PIN fallback (15 min, audited).
- **Content:** per-institution taxonomy and bank; the 1100 pack is imported on
  request; papers keep frozen copies.
- **API:** new `/api/v2`; existing `/api` exam routes stay compatible.
- **Scope:** institutions + exams; no billing in v2.0.
- **Limits:** 5 active events, 500 students/event, 50 concurrent per institution,
  1000 total; warn at 80%, block new starts at 100%, never interrupt live exams.
- **Sessions:** 15-min access + 7-day rotating refresh.
- **Lifecycle:** optional plan expiry; deactivate; deferred until live papers end
  (max 24h); manual purge only, annual review; purge deletes students/bank/
  results and keeps staff/institution/audit.
- **Export:** Admin results only; Super Admin full archive before purge.
- **Legal:** institution is controller; platform is processor; no DOB by default.
- **Legacy:** internal non-public `ParaRobo` institution; oldest admin -> owner,
  rest -> employees.
- **Transfers:** new account at the new institution; old principal deactivated;
  old data stays.
- **Deferred:** billing, exam history/top-N (v2.1), custom domains, shared family
  emails.
- **Execution:** P20.0 baseline freeze only; G1+ needs separate approval.

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
