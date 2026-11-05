# ExamRobo version history

One canonical tree, one release line. This file records what each on-disk copy
was and where it went.

## Final version

| Field | Value |
|---|---|
| Base tree | `C:\Users\Asus\Desktop\Exam-Robo-main` (branch `release/final`, merged to `main`) |
| Release | `v1.5.0` |
| Source of ops assets | `examrobo-3` production snapshot (2026-10-23) |
| Question content | `docs/question-bank/Internship_Exam_Question_Bank_1100.md` (1,100 questions) |

## Trees on this machine

| Location | Role | State |
|---|---|---|
| `Desktop\Exam-Robo-main` | canonical development tree | active |
| `archive\versions\examrobo-3` | production snapshot of `examrobo.pararobo.in` | archived, read-only |
| `archive\versions\examrobo-6` | older feature cut (pre-Phase 16) | archived, read-only |
| `archive\db\*.sql.gz` | database dumps taken 2026-10-23 | archived |
| `Downloads\Exam-Robo-main` | 2026-10-27 backup | superseded |
| `Downloads\examrobo-frontend` | white-theme reference SPA + DEV mock + TestLab | reference only |
| `Downloads\examrobo-frontend\Exam-Robo-main` | divergent 2026-10-22 lineage | superseded |
| `Downloads\examrobo-frontendv2` | 36-file fragment | discard |
| `Downloads\examrobo-premium-ui` | 11 UI-only files | reference only |

The integrity manifest for the archive is `archive/MANIFEST.sha256`
(5,585 files). `archive/`, `*.sql.gz` and `.zcode/` are gitignored.

## Migration lineage

The final tree uses migrations `001`–`013`:

| File | Purpose |
|---|---|
| `001_flags_event_id.sql` | event context on flags |
| `002_integrity_hardening.sql` | integrity columns and proctor kinds |
| `003_exam_integrity_v2.sql` | fullscreen state and delivery guards |
| `004_bank_competency.sql` | skills, difficulty, frozen paper questions |
| `005_domain_selection.sql` | event domains and domain rules |
| `006_integrity_delivery.sql` | WS tickets and network gap policy |
| `007_admin_controls.sql` | section limits, paper sections, admin actions, attempt history |
| `008_sequential_sections_results.sql` | sequential section engine, resume/restart |
| `009_option_orders.sql` | persisted per-paper option order |
| `010_results_visibility.sql` | result state machine columns |
| `011_normalize_cybersecurity_category.sql` | normalise the `Cyber Security` taxonomy row |
| `012_question_source_key.sql` | stable source key for idempotent bank imports |
| `013_event_soft_delete.sql` | archive events instead of destroying them |

`server/sql/migrations/_target_archive/` holds the target's original
`007_sections_and_shuffle.sql`, `008_resume_event.sql` and
`009_results_visibility.sql`. They are reference material for the bridge in
`server/scripts/migrate.js`, **not** part of the applied sequence. Never merge
the `examrobo-6` migrations: they reuse 007–009 for different files.

## Asset provenance

| Asset | Came from |
|---|---|
| `server/DEPLOY.md` | `examrobo-3`, adapted for the removed recorder and the final host |
| `server/import_questions.js` + `server/imported_questions.json` | `examrobo-3` (221-question legacy import) |
| `server/scripts/import-bank.mjs` | new — imports the full 1,100-question bank |
| root `.env.example` | derived from `examrobo-3`, recorder keys removed |
| `web/nginx.conf` Cloudflare maps | `examrobo-3` |
| `docker-compose.yml` production profile | `examrobo-3` |
