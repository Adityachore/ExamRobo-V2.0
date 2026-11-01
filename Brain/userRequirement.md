# User Requirements & Brainstorming Ledger

## Project Vision

Website-first proctored exam platform (Phase 1 = MCQ only, any OS, any browser).
A student signs in with an invited email, takes a one-sitting proctored exam in
the browser, and gets a result; staff create events, upload the roster, watch the
exam live and export results. Phase 2 adds the Windows lockdown agent; Phase 1.5
adds the gated coding round.

## Brainstorming Log

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

Final-version plan approved. Execution runs as Phase 18 in `NextSteps.md`
(T-1501..T-1513).
