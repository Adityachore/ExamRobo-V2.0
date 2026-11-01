# Project Issues & Technical Debt Log

## Exam-day issues batch (Phase 19) — 2026-11-01

Closed:

- ~~**One Alt-Tab cost two strikes**~~ — a `tab_blur` and the `fullscreen_exit`
  it causes arrived together and each counted. The three environment signals
  (`tab_blur`, `fullscreen_exit`, `display_change`) are now one incident inside
  a 4-second window; separate capture kinds still count one each. The smoke
  pins it. → T-1516.
- ~~**A retried warning could double-count**~~ — the client now sends one
  `client_event_id` (`crypto.randomUUID`, timestamp fallback) on every retry of
  the same signal; the partial unique index does the rest. → T-1516.
- ~~**Two warning kinds were dead**~~ — `recording_revoked` (recorder removed)
  and `share_surface` (no such signal) left the registry, the client labels and
  the tests. → T-1516.
- ~~**Deleting an event destroyed its papers**~~ — deletion now archives:
  `deleted_at`/`deleted_by`/`delete_reason` (migration 013), archived events
  leave the active list, remain under Completed with who/when/why, refuse edits,
  and open attempts are ended with `removed`. → T-1517.
- ~~**Blank screen after submit**~~ — mitigated, root cause still unproven: a
  root `ErrorBoundary`, the Result page retries six times before showing a
  "finishing" card instead of bouncing back to `/exam`, and `goResult` is
  bounded at 40 attempts with a readable error. → T-1515.
- ~~**The pg pool used the default 10**~~ — `PG_POOL_MAX` (default 20) leaves
  headroom for 50 students plus the dashboard. → T-1518.
- ~~**The k6 script described an older API**~~ — rewritten for `config` +
  `section_limits`, roster 201, section-by-section answers, and an admin
  polling scenario. → T-1518.

Open:

- ~~**The live database is the 10-question dev bank at migration 012**~~ —
  migrations 011-013 are applied and the live import reports `imported 1100,
  skipped 0`: 1110 active questions over 13 domains. `npm run seed:full`
  **truncates** first; it is for a fresh install, never for this database.
  → T-1508/T-1520.
- **The live database has no exam event right now** (0 events, 0 papers). The
  previous demo event was removed before this batch; create one on imported
  categories (e.g. Frontend / Backend / AI) before the next click-through.
- **`server/.env` has a stale database password.** The stack's own password
  works, so `npm run verify` must be given `VERIFY_PG_URL`/`VERIFY_REDIS_URL`
  (host port 5450 / 6379) for this machine; the preflight reports the auth
  failure as "timed out", which is misleading but honest about the phase being
  skipped. → T-1522.
- **The 50-VU run has not been executed** (`k6` is not installed on this
  machine). → T-1518.
- **No browser repro of the four submit paths yet.** → T-1521.

## Final release (Phase 18) — 2026-11-01

Open items for the canonical v1.5.0 release. Strike through as each closes.

- ~~**91 uncommitted files**~~ — committed in `6fe8a3e` / `00d8e5a`. → T-1502.
- ~~**Root deploy could not start**~~ — root `.env.example` and `DB_PASSWORD`
  are in place; the stack boots. → T-1503/T-1504.
- ~~**Production assets live only in the archive**~~ — `DEPLOY.md`, the import
  tooling and `docs/` are in the main tree. → T-1503.
- ~~**Seeded events have no sections**~~ — `seed.js` now derives
  `section_limits` evenly across the event's categories. → T-1506.
- ~~**bcrypt rounds disagree**~~ — both paths read `BCRYPT_ROUNDS`. → T-1506.
- ~~**Category name duplicated**~~ — `competency.js` no longer offers the spaced
  `Cyber Security`; migration `011` normalises the stored value and the bank
  importer writes `Cybersecurity`. → T-1507/T-1508.
- ~~**Cloudflare client IP is not forwarded**~~ — nginx maps
  `CF-Connecting-IP` / `X-Forwarded-Proto`. → T-1504.
- **1100-question bank is not imported** — the importer is committed
  (`00d8e5a`) and parses 1100 / 100-per-domain / 330-715-55, but the live DB is
  seeded with the 10-question dev bank. The stock seed event uses
  Aptitude/Logic, which are not among the 11 imported domains, so the import
  needs an event config on imported categories first. → T-1508.
- ~~**Verification has not run on a section-aware dataset**~~ — four phases
  PASS on 2026-11-01: 158 unit tests and 178/178 smoke assertions. → T-1509.

Closed in the section-aware verification pass (2026-11-01):

- ~~**`derivedDuration()` was exported but never called**~~ — an event that
  omitted `duration_min` got no paper length. `normalizeEventInput` now falls
  back to the duration derived from `section_limits`; an explicit
  `duration_min` still wins. T-1402 keeps `section_limits` required.
- ~~**The smoke answered the whole paper at once**~~ — only the active section
  accepts answers, and grading maps the *displayed* choice through
  `option_orders`. The main flow now answers each section, finishes it, and
  maps authored → displayed before answering.
- ~~**Publication failed after the integrity checks**~~ — publishing requires
  every paper submitted, but the fullscreen/tabs/reload checks leave live
  papers. The smoke now hands them in through the proctor force-submit
  endpoint before publishing, as an operator would.


## Critical & High Priority

- ~~**Copy and paste were never counted**~~ → Fixed. The exam page has no
  editable field (`<input type="radio" class="sr-only">` only), so the DOM
  `copy`/`cut`/`paste` events never fire there and the guard saw nothing. The
  clipboard is now detected from the keyboard — the only signal that is always
  available — and the keydown is prevented, which is also the only way to
  actually block a paste. Every press is an attempt and is counted; holding a
  key down is one attempt (`e.repeat` is ignored). The DOM event is still
  handled (the browser menu) and deduplicated against the key press.
  `web/src/lib/integrity-signals.js`, `web/src/lib/integrity.js`.

- ~~**The screenshot key was never counted**~~ → Fixed, and the limit is now
  stated honestly. The key press is detected and reported as a **warning for
  review**, never as an automatic ending. What the page cannot do is stop the
  operating system from taking the picture: `preventDefault()` on PrintScreen
  does not stop the capture and Windows consumes Win+Shift+S before the page
  ever sees it. The student instructions say so; the operating-system key press
  is recorded as `os_chord` (logged, never penalised).

- ~~**Fullscreen was not enforced, and F11 looked like leaving fullscreen**~~
  → Fixed. The `fullscreenchange` handler reported an exit on every event,
  without checking that fullscreen was actually left — F11 does not set
  `document.fullscreenElement`, so going fullscreen with F11 cost the student a
  warning for nothing. A `fullscreen_exit` is now reported on a true → false
  **transition** only, the window is compared with the screen (so F11 counts as
  fullscreen), and outside fullscreen the question is not rendered at all. The
  server keeps the last state (`papers.fullscreen_state`, migration 003) and
  the heartbeat carries it, so a client that lies or dies cannot hide the exit.
  One incident is one warning: the client report and the heartbeat are
  deduplicated.

- ~~**The exam was slow**~~ → Fixed. The answer path was six to seven
  sequential database round trips plus a Redis publish on every click, because
  it also re-read the whole session view for the proctor dashboard (16.7 ms by
  itself). The answer is now a single statement (the answer, the position and
  the exact answered count), and the dashboard gets a cheap patch instead of a
  full session. The live dashboard query was six correlated subqueries per
  paper; it is now one CTE over the scope (0.97 ms instead of 16.7 ms, and
  `GET /api/admin/live` went from 101 ms to 44 ms). The client clock ticked
  four times a second and re-rendered the whole runner; it ticks once.

- ~~**A variant an exam was using could be deleted**~~ → Fixed. The paper
  freezes its variant ids, so deleting a variant would drop a question from a
  live exam and make an already submitted paper ungradable. The delete is
  refused with 409.

- ~~**A student name could become a formula in the results CSV**~~ → Fixed. A
  name that starts with `=`, `+`, `-` or `@` is prefixed with a single quote,
  so a spreadsheet shows the text and never runs it.

- ~~**The admin event filter turned the event uuid into `NaN`**~~ → Fixed. The
  `EventSelect` component did `Number(e.target.value)` on a uuid, so every
  event filter sent "NaN" to the API.

- ~~**The grading was off by one question**~~ → Fixed. `services/grading.js`
  joined `unnest(papers.variant_ids) WITH ORDINALITY` (1-based) with
  `answers.qno` (0-based), so every answer was compared with the key of the
  *previous* question and the last question was never scored — a paper that was
  answered perfectly scored 5/9. Fixed with `ord.n::int - 1 AS qno`. Guards:
  `server/test/grading.test.js`, the smoke test (answers the whole paper with
  the admin answer key and expects a full score) and the Test Lab check
  "the answer key is graded correctly".

- ~~**A rejected promise crashed the API process**~~ → Fixed, and the first fix
  did not work. Express 4 does not catch async handler rejections. The first
  attempt wrapped every router with `server/middleware/async.js`
  (`wrapRouter`) — but every router calls that wrapper at the *end* of the
  file, after its routes are registered, so patching the router's methods
  protected **nothing**. A rejected promise still reached Node as an unhandled
  rejection and killed the process; it did exactly that during the bank-v2
  work (a `ReferenceError` in one route took the API down mid-smoke). The
  wrapper now also covers the handlers that are already registered, and
  `server/test/async-errors.test.js` pins it: a failing route answers 500 and
  the server keeps running. `server/index.js` still traps
  `unhandledRejection` / `uncaughtException` as the last line of defence.

- ~~**Student flags lost their event context**~~ → Fixed. `flags` had a single
  `subject_id` (email *or* event uuid). Migration
  `server/sql/migrations/001_flags_event_id.sql` adds `flags.event_id`; the API
  resolves the student's event when the dashboard does not send one.

- ~~**WebSocket path never matched in nginx**~~ → Fixed. `location /ws/` does
  not match the socket path `/ws`. Now `location /ws` with
  `proxy_read_timeout 3600s`.

- ~~**nginx rejected recording chunks**~~ → Fixed. The default body limit is
  1 MB while the API accepts 8 MB chunks — `client_max_body_size 12m` added.

- ~~**Docker images installed host dependencies**~~ → Fixed. `COPY . .` copied
  the host `node_modules` over the image. `.dockerignore` files added and both
  Dockerfiles now use `npm ci` with the lock file.

## Medium Priority

- **The browser cannot close the gaps the policy wants to close.** This is a
  limit, not a bug. A website cannot prevent the OS screenshot key, a second
  physical device on another network, an external capture card, a camera
  filming the screen, or a student who patches the client JavaScript before it
  loads. The client guards stop the ordinary accident; the server decides the
  outcome so a patched client still gets the same strikes. The controls that
  need the operating system are designed in `Brain/LockdownAgent.md` (R-034)
  and are **not built in Phase 1**. The student instructions now say this
  plainly instead of implying the page can stop a capture.

- **A lockout is decided by the server, so a modified client can still hide a
  violation from itself** — it cannot hide it from the server. The consequence
  is that a student who patches the client can avoid the *warning* they would
  have seen; the recorded strike is the same either way.

- **In-memory lockout does not survive a restart** → Partially fixed. The
  lockout runs on Redis when `REDIS_URL` is reachable (TTL 15 minutes, shared
  across instances) and falls back to the in-memory counter otherwise.

- **WS fan-out was single-instance only** → Fixed. `server/services/redis.js`
  publishes every socket message on `examrobo:ws`; each instance delivers to its
  own clients. Without Redis the behaviour is unchanged (local delivery).

- **Default dev credentials in the environment** → Open by design. `server/.env`
  and the compose `.env` carry `admin@examrobo.dev` / `admin123` for local
  testing. The compose `.env` holds a random `JWT_SECRET`; the API refuses to
  start in production with the default secret or with the admin bootstrap
  enabled.

- **Smoke test wiped the database** → Fixed by construction.
  `server/smoke.mjs` refuses to run unless `DATABASE_URL` points at a database
  whose name ends in `_smoke` or `_test`; otherwise it exits with code 2 and
  touches nothing. `npm run verify` creates the scratch database, runs the
  test in-process and drops it again, so the live database is never
  reachable from a test. `npm run seed` still truncates and reseeds — that is
  its job, and it is a manual command.

- **Smoke test was not repeatable with Redis** → Fixed. The lockout email is
  unique per run and the Redis key is removed afterwards.

- **Rate limits are per process** → Fixed. `server/middleware/security.js` now
  uses a shared fixed-window counter (`examrobo:ratelimit:<name>:<id>`) in
  Redis when `REDIS_URL` is reachable, so every API instance counts against the
  same budget. Without Redis it falls back to the in-process map and never
  fails closed. Covered by 4 unit tests plus 2 Test Lab checks.

- **A question could not say what it measures** → Fixed in the bank v2. The
  questions carried a category and nothing else, so a result could say how
  many were right but not *what* was tested. A question now carries a skill
  and a difficulty, and the paper freezes its own copy of that competency
  (`paper_questions`) so re-tagging a question never rewrites an exam that
  already ran. The taxonomy is reference data in its own file
  (`server/sql/taxonomy.sql`) because a `TRUNCATE ... CASCADE` follows the
  foreign keys down to the skills table.

- **The taxonomy is re-applied on every boot** → By design, and it is the
  reason the skills live in a data file. The seed truncates the bank (the
  foreign keys reach the skills table), so the taxonomy is applied right after
  the truncate, on every boot and in every scratch database. A skill an admin
  added survives, because the seed only re-applies the reference rows.

- **A result could not say what it measured** → Fixed in the results analytics
  (R-014). The score alone cannot tell a student or a teacher what an exam
  tested. The result now carries the competency per skill and per difficulty,
  the admin sees the same per student and as a cohort across an exam, and all
  of it is read from the **frozen** `paper_questions` rows — so re-tagging a
  question never rewrites the report of an exam that already ran.

- **The papers that ran before the taxonomy existed have no frozen
  competency** → Fixed by the backfill (`server/sql/backfill.sql`), with one
  honest limit: the tags are **today's** tags, not the tags of the day the
  exam ran. The exam is described as it looks now, which is the best that can
  be reconstructed, and the file says so in a comment. Nothing else is
  invented — the variants, the order and the counts are the real ones.

- **An unanswered question used to be indistinguishable from a wrong one**
  → Fixed. Every bucket reports `total`, `answered` and `correct`, so a
  student who ran out of time is not told they failed the questions they never
  reached. The accuracy stays `correct / total` (the share of the paper that
  was right) and the numbers next to it say how much of the paper was
  attempted.

## Known candidate-path UI/data limits (2026-10-22)

- **"Marked for review" is intentionally absent from the runner.** There is no
  server field or table for it, so adding the control would create a state that
  disappears on refresh. The navigator shows answered / unanswered / current
  only. Add the persistence first if the feature is wanted.
- **The result page has no answered/unanswered counts.** `GET /api/exam/result`
  returns score, sections, competency and timestamps, but not how many
  questions were attempted. The SubmitDialog derives its three tiles from the
  client's current answers; the result page does not guess.
- **There is no candidate exam-history/list endpoint.** `/waiting` therefore
  shows the single next exam from `/student/event`, not a cards list. The design
  board's multiple-exam list is not implementable without an API change.
- **The pre-start payload has no question count or total marks**, so the gate
  does not promise either. Those numbers only exist after `/exam/start`.
- **Verification status:** the redesign's production build is clean and the
  database-only `verify` phases now pass (preflight + unit + web build + smoke,
  132 assertions) with Postgres and Redis running. A browser responsive/a11y
  click-through is still outstanding (T-1039).

## Clarifications Required

- **Safe Exam Browser configuration is blocked on external input.** The server
  gate and candidate setup page are implemented, but a real `exam.seb` must be
  generated with the SEB Config Tool for the final exam URL. The Config Key is a
  64-hex hash produced by that tool, not a human-chosen password; changing the
  `startURL` changes it. A free ngrok hostname is not stable enough for the exam
  configuration. The current code therefore defaults to `SEB_REQUIRED=false`
  until the file and key are supplied.

- **The SEB hash depends on the public origin.** `web/nginx.conf` now preserves
  ngrok's `X-Forwarded-Proto`; without that, Express builds `http://` and every
  SEB hash fails. The final hostname, scheme, port and `startURL` must match the
  URL the SEB Config Tool used.

- **Verification after batch 1.** Unit tests (127), the web production build and
  the database-backed smoke test (132/132) pass. The SEB route, WS tickets,
  migration 006, per-question delivery and `network_gap` policy are covered.
  Migration 006 is applied in the Docker database after rebuilding the API image.
  A Windows SEB acceptance test remains before this is production-ready.
- **Offline queue is best-effort.** Pending answers are stored in
  `localStorage` per paper and flushed on mount/online/submit. A browser cleared
  mid-exam loses that local queue; the server remains authoritative for answers
  it already received. Submission is blocked while the local queue is non-empty.
- **Connection badge polls `/api/health`.** Each visible badge checks every 15s;
  this is a liveness signal, not proof that the exam websocket is healthy (the
  runner also shows its own websocket reconnecting banner).

- **The Windows lockdown agent (R-034) is designed but not built.** The design
  is in `Brain/LockdownAgent.md`. It needs decisions before it can be built:
  which controls are mandatory vs best-effort, how the agent is installed and
  updated on the exam machines, what happens when the agent is missing or
  crashes mid-exam, and whether the exam is allowed to start at all without it.

- **HR auto-flag (R-043) not implemented.** The requirement says: when the
  roster is older than 2 hours at `starts_at − 2h`, create an `HR_MISTAKE` flag
  on the event. The rule needs a decision: does it fire once per event, and is
  it allowed to re-fire after every roster upload? No job exists yet.

- **Recording storage has no lifecycle.** Chunks are written to
  `RECORDINGS_DIR` and never expire. Decide the retention window and whether
  the delete rule is manual or automatic before the exam day.

- **`permissions.camera=()` in the security headers** — the exam does not use
  the camera, only `getDisplayMedia`, so this is intentional. Remove it if a
  camera-based identity check is added later.
