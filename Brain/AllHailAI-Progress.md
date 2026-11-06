# AllHailAI Build Progress

> **Historical checkpoint (P13).** Superseded by v1.5.0/Phase 19 and the v2.0
> plan. Current state is in `Brain/Start.md` and `Brain/ProjectReview.md`.

**Phase**: P13 - domain selection is done (P1..P13 complete); the roadmap continues with exam history
**Tasks**: 94/104 done (T-504 / T-813 / T-814 / T-901 / T-960, T-1109 and the decisions remain)
**Current**: full stack runs in Docker (db + redis + api + web), the tiered integrity policy, the locked-exam state, the enforced fullscreen, the fast answer path and the competency model (skills + difficulty, frozen with the paper) are live, a result says what the exam measured, an exam can ask the student which technical domain it should test, and the whole verification is one command
**Next**: exam history + top-N selection, then option-order shuffle

## Completed
- Phase 1: scaffold, schema, JWT auth, roster login, lockout, tickets, waiting room, admin events/roster
- Phase 2: question bank CRUD, per-student paper generation, variant randomization tests
- Phase 3: exam start / autosave / snapshot / submit / grading, MCQ runner UI
- Phase 4: warning escalation, recording upload + MediaRecorder client, WS proctor channel, live dashboard
- Phase 5: results + breakdown, feedback, flag API (now with `flags.event_id`), flags & tickets UI
- Phase 6: results + leaderboard + CSV, results UI, recording review
- Phase 7: Redis lockout + WS pub/sub, security headers / CORS allowlist / rate limits /
  production fail-fast, `npm ci` + `.dockerignore` images, nginx `/ws` + upload limits,
  k6 script, runbook
- Phase 8: `Exam-Robo-TestLab\` (start / stop / reset / status / check / scenario / collect),
  52 automated checks through nginx, manual click-through checklist, API quick reference,
  troubleshooting guide, diagnostics collector
- Phase 9: the tiered integrity policy (lock / 3-strike warn / log-only) in one server-side
  engine, the locked-exam state with a lockout screen, server-side concurrency detection
  (`second_window` / `second_session`, mutually exclusive), the client guards, the proctor's
  manual lock, migration 002, and the one-command verification on a scratch database
- Phase 10: the four live exam defects — the clipboard is counted from the keyboard, the
  screenshot key is counted (with an honest limit in the UI), fullscreen is a hard block with
  a server-side backstop (migration 003), and the exam is fast (one statement per answer,
  one CTE for the live dashboard, a cheap `session_patch` instead of a full session read)
- Phase 11 (roadmap Phase 1): the question bank v2 — a real `skills` taxonomy (39 skills,
  seeded reference data) and a 1–5 difficulty scale, a question tagged with both, the paper
  freezing its own copy of that competency, and an admin UI that filters, tags and manages
  the taxonomy
- Phase 12 (roadmap Phase 3): results analytics — the student sees their score per skill and
  per difficulty, the admin sees the same per student plus a cohort view (the weakest skill
  first, exportable as CSV), all read from the **frozen** competency, and the papers that ran
  before the taxonomy existed get their snapshot backfilled
- Phase 13 (roadmap Phase 5, done as Plan A instead): domain selection — an exam can ask the
  student which technical domain it should test (the aptitude part is common to everybody),
  the choice is made in the waiting room before the timer starts, the server validates it and
  refuses it before a paper exists, and the choice plus the domain of every question are
  frozen with the paper; registration was dropped — the roster stays the eligibility list

## Fixes found by the bench
- Grading was off by one question (`WITH ORDINALITY` is 1-based, `answers.qno` is 0-based) → `ord.n::int - 1`
- Rate-limit counters were per process → shared through Redis (`examrobo:ratelimit:<name>:<id>`)
- Two tabs of one exam fought over the WebSocket → the reap matches the per-tab id, not the sign-in id
- A second device cost two strikes → `second_window` and `second_session` are mutually exclusive
- The warning banner showed the technical detail → the policy label wins
- The clipboard was never counted (the exam page has no editable field, so the DOM events never fired) → keyboard detection
- F11 looked like leaving fullscreen (no transition check) → a fullscreen exit is a true → false transition
- Every answer click ran six to seven database round trips and a full session read → one statement + a patch
- The admin event filter turned a uuid into `NaN`; a variant in use could be deleted; a name could become a CSV formula
- The async-error wrapper protected nothing: the routers call it *after* they register their
  routes, so a rejected promise took the whole API down → the wrapper now covers the handlers
  that are already registered (`server/test/async-errors.test.js` pins it)
- A `TRUNCATE ... CASCADE` follows the foreign keys from `questions` down to `skills`, so the
  taxonomy cannot live in a migration → it is reference data in `server/sql/taxonomy.sql`,
  re-applied on every boot, in every scratch database and right after the seed truncates
- The papers that ran before the taxonomy existed had no frozen competency, so nothing could be
  reported about what they measured → `server/sql/backfill.sql` rebuilds it (today's tags, and
  it says so), applied after the taxonomy because it reads the skill code

## Verification
- `npm run verify` → all four phases green: `node --test` 111/111 · `server/smoke.mjs` 119/119
  (in-process, scratch database) · web build clean
- `..\Exam-Robo-TestLab\check.bat` 52/52 through nginx (repeatable, and once after a full `reset.bat`)
- Docker stack up on :8080 (SPA, `/api`, `/ws`, recording upload)
- Live proof on the running stack: the answer path 11-18 ms, `GET /api/admin/live` 44 ms (was 101 ms),
  the fullscreen heartbeat 0 → 1 → 1 warnings, two clipboard presses = 2 warnings, the third
  warning auto-submits with `max_warnings`; the bank serves 39 skills and the 5 difficulty levels,
  and the filters and the re-tag endpoint answer live; a student who answered the whole exam with
  the key scores 9/9 and sees it broken down by skill and by difficulty, and the admin cohort
  adds the papers up with the weakest skill first

## Product roadmap (agreed, in this order)
1. ~~Phase 1 — question bank v2: a real `skills` taxonomy + `difficulty`, competency mapping, admin UI~~ **done 2026-10-22**
2. Phase 3 — results analytics: per-skill and per-difficulty breakdown for the student and the admin **done 2026-10-22**
3. Phase 4 — exam history and "selected": the top-N automatic selection of a student for an exam
4. Phase 2 — option-order shuffle per student (a question is not the same question in two papers)
5. ~~Phase 5 — registration: invited **and** self-registration~~ **dropped 2026-10-22 — the roster is the eligibility list; domain selection (Plan A) was built instead**

## Remaining
- The roadmap above (exam history + top-N selection first)
- T-504 / T-801 — HR auto-flag rule (needs a decision, see Brain/Issue.md)
- T-802 — recording retention policy (needs a decision)
- T-702 / T-814 — run the 1000-VU k6 scenario (script ready)
- T-901 — Judge0 coding round (Phase 1.5, deferred by design)
- T-960 — build the Windows lockdown agent (designed in `Brain/LockdownAgent.md`, needs 6 decisions)
- Online server deployment (the compose file is ready, the target server is not configured)
- Browser click-through by the user (T-813, and T-1109 for the domain picker)
