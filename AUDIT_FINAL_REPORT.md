# ExamRobo — Final Version Audit

> **Historical document (2026-11-01).** This audit describes the earlier
> `ui/redesign` tree. Current baseline: v1.5.0 at `3c6518b`, migrations `001–013`,
> 161 unit tests and 187 smoke assertions. See `Brain/ProjectReview.md` and
> `Brain/Start.md` for the current state.

Audit date: 2026-11-01
Auditor role: senior developer / release owner
Scope: every ExamRobo tree on this machine, the Brain documentation set, git state,
and the runtime configuration.

The canonical final tree is **this repository** (`C:\Users\Asus\Desktop\Exam-Robo-main`,
branch `ui/redesign`). Every other tree is superseded or archived. The decisions
taken from this audit are recorded in `Brain/userRequirement.md` and `Brain/Log.md`.

## 1. Version inventory

| # | Location | What it is | Evidence | Verdict |
|---|---|---|---|---|
| 1 | `Desktop\Exam-Robo-main` | Newest code base: Phase 17 results visibility, sequential sections, resume/restart, option orders, calculator, motion UI, recorder intentionally removed, target-migration bridge | HEAD `7f1dca3` (2026-10-25) plus 91 uncommitted files (2026-10-28); 10 migrations; 19 test files; 175 smoke `ok()` checks; README documents recorder removal | **Final base** |
| 2 | `archive\versions\examrobo-3` (was `New folder\examrobo-3`) | Production snapshot of `examrobo.pararobo.in` | Cloudflare-aware nginx, production compose (`DB_PASSWORD`, `:8083`), `.env` / `.env.example`, `DEPLOY.md`, import tooling (221 questions), active recorder + Recordings page, `_target_archive/007-009`, two DB dumps (2026-10-23) | Archived; source of missing ops/content assets |
| 3 | `archive\versions\examrobo-6` (was `New folder\examrobo-6`) | Older feature cut | 9 migrations in the old numbering (`007_sections_and_shuffle`…), no `attempts` / `results` / `sections` / `event-config` / `section-flow` services, 16 test files | Archived; superseded |
| 4 | `Downloads\Exam-Robo-main` | 2026-10-27 backup of this tree | `migrate.js` is 454 lines behind; older README | Redundant backup |
| 5 | `Downloads\examrobo-frontend` | Reference deliverable: white-theme SPA + DEV mock API + `Exam-Robo-TestLab` (52 checks) + `Exam-Robo-v2.zip` | Mock README, 2026-10-21 | Reference only; keep TestLab |
| 6 | `Downloads\examrobo-frontend\Exam-Robo-main` | Divergent 2026-10-22 lineage | Migrations `007_category_cleanup`, `008_event_calculator`, `009_option_shuffle` | Superseded |
| 7 | `Downloads\examrobo-frontendv2` | 36-file fragment | Partial tree | Discard |
| 8 | `Downloads\examrobo-premium-ui` | 11 web-only UI files | — | UI reference only |
| 9 | `New folder\*.md` / `*.pdf` | Exact UI spec, domain-selection plan, 1100-question bank, 43-question PDF | — | Moved to `docs/` |

A SHA256 manifest of the archived trees and database dumps is in
`archive/MANIFEST.sha256` (5,585 files).

### Migration lineage warning

The old snapshots used migration numbers 007–009 for different files than the
final tree. `server/scripts/migrate.js` refuses to guess when it meets a
target-shaped `paper_sections`, and the historical files are preserved under
`server/sql/migrations/_target_archive/` for traceability. **Never merge the
`examrobo-6` migrations into the final tree.** The only supported upgrade path is
the bridge in `migrate.js` (verify baseline → validate target data → rename
`paper_sections` → adopt baseline checksums → copy sections).

## 2. Release blockers found and resolved by this release

1. 91 uncommitted files (the whole Phase 16/17 body of work) were not in git.
2. The documented Docker deploy could not start: the root `.env` had no
   `POSTGRES_PASSWORD` and there was no root `.env.example`.
3. No production runbook in the tree (`DEPLOY.md` existed only in `examrobo-3`).
4. Import tooling and the 1100-question bank were outside the tree.
5. Seeded events had no `section_limits`, so seeded papers were legacy
   single-deadline papers and never exercised the section engine.
6. bcrypt rounds were inconsistent between `seed.js` (10) and
   `create-admin.mjs` / `BCRYPT_ROUNDS` (12).
7. The taxonomy carried two spellings of the same category
   (`Cyber Security` vs `Cybersecurity`).
8. The deployed nginx did not forward the real Cloudflare client IP, so lockouts
   and rate limits were per-tunnel instead of per-student.

## 3. Intentional retention (not defects)

- Screen-recording upload is removed. The `recordings` table, the Docker volume
  and the event-delete cleanup are kept so existing data survives.
- `recording_revoked` remains a valid proctor-event kind for historical rows.
- No client module imports the removed `recorder.js` or `sections.js`.

## 4. Deferred work (tracked in `Brain/Later.md`)

- SEB `exam.seb` + Windows acceptance (T-1205 / T-1207).
- 1000-VU k6 run (T-814).
- HR auto-flag rule (R-043) and recording retention policy (T-802).
- Exam history + automatic top-N selection.
- Coding round (T-901, Phase 1.5) and Windows lockdown agent (T-960, Phase 2).

## 5. Verification status

`npm run verify` runs four phases on a scratch database and never touches the
live database. Phase 5 of the release executes it and records the counts in
`Brain/Log.md`. Local Docker/Postgres/Redis must be running for preflight and
smoke to report PASS instead of SKIPPED.
