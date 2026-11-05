# ExamRobo TRD — Technical Requirements & API Contract

The API is the system of record. This document is the contract the SPA codes
against; it was derived from the white-theme reference implementation and is
verified by `server/smoke.mjs` (187 assertions, run by `npm run verify`).

> **v2.0 note (Phase 20):** v2.0 adds `/api/v2` for auth/session, institutions,
> staff, roster and results. The existing `/api` exam routes stay backward
> compatible. The authoritative v2 contract is
> `docs/Brain-Phase2-Production-Ready/21-API-CATALOG.md` (plus 03/04/12/13);
> locked decisions are in `Brain/ProjectReview.md`.

Base URL v1.5: `/api`. All request and response bodies are JSON. Screen recording
upload and review are disabled; the legacy `recordings` table and files are
retained but no API writes or serves them.

## Auth model
| | |
|---|---|
| Student token payload | `{ sub: <email>, role: 'student', eventId: <uuid>, sid: <uuid> }` |
| Admin token payload | `{ sub: <email>, role: 'admin' }` |
| Header | `Authorization: Bearer <token>` |
| Role mismatch | **401** (never 403) |
| WebSocket auth | `ws(s)://<host>/ws?token=<token>&tab=<tab id>` — invalid token closes with code `4401` |

`sid` identifies the **sign-in** (one per successful student login) and `tab`
identifies the **browser tab** (a per-tab id kept in `sessionStorage`). The
server needs both: the tab id tells a reload from a second window, the sign-in
id tells a second window from a second device. A client that sends no `tab`
falls back to the sign-in id, which is correct for a single-tab client.

Student sign-in (`POST /api/auth/student`) returns `{ token, email, name }`.
Admin sign-in (`POST /api/auth/admin`) returns `{ token, email, name }`.

## Error dialect
Every error response is `{ "error": "<message>" }` plus optional fields:

| Situation | Status | Body |
|---|---|---|
| Unknown route under `/api` | 404 | `{ error: 'Not found.' }` |
| Wrong role / missing token | 401 | `{ error: 'Not authorized.' }` |
| Email not on a roster | 403 | `{ error: 'This email is not eligible for this exam. Use the invited email address.', attemptsLeft }` |
| 3 failed sign-ins | 429 | `{ error: 'Too many attempts.', retryAfterSec: 900 }` |
| Rate limit hit | 429 | `{ error: 'Too many requests.', retryAfterSec }` |

Rate limits are fixed windows. With Redis reachable the counter is shared by
every API instance (`examrobo:ratelimit:<name>:<id>`: auth = ip + email,
tickets = ip); without Redis the API falls back to a per-process counter.
| Exam not started | 409 | `{ error: 'The exam has not started yet.', code: 'not_started', starts_at, server_time }` |
| Exam over | 409 | `{ error: 'This exam has ended.', code: 'ended' }` |
| Already submitted | 409 | `{ error: 'Exam already submitted.', code: 'submitted' }` |
| Result before submit | 409 | `{ error: 'Not submitted yet.', code: 'active' }` |
| Result waiting for all papers | 409 | `{ error, code: 'results_not_published', visibility: 'after_all_submitted', results_expires_at }` |
| Result hidden by admin | 409 | `{ error, code: 'results_not_published', visibility: 'manual', results_expires_at }` |
| Result never available | 403 | `{ error, code: 'results_unavailable', visibility: 'never', results_expires_at }` |
| Result window closed | 403 | `{ error, code: 'results_expired', visibility, results_expires_at }` |
| Access removed | 403 | `{ error, code: 'removed' }` |
| Invalid event payload | 400 | `{ error: 'Please fix the highlighted fields.', fields: { name: '...' } }` |
| Public ticket without body | 400 | `{ error: 'Email and reason are required.' }` |
| Any call on a locked exam | 409 | `{ error: 'This exam was ended for an integrity violation.', code: 'locked', locked: true, lock_reason }` |

## Endpoints

### Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/student` | — | roster email; 3-attempt lockout (email+IP, 15 min) |
| POST | `/api/auth/admin` | — | `admins` table is authoritative; env bootstrap only outside production |

### Public
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/tickets` | — | contact-team form: `{ email, reason }` |

### Student
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/student/event` | student | waiting room; carries `paper_minutes`/`min_paper_minutes`, `results_visibility`, `results_published*`, `results_expires_at`, `results_available`/`results_code`, and a domain-aware event's `domains` block |
| POST | `/api/exam/start` | student | creates/returns the paper; full `examState`; a domain-aware event takes `{ domains: [...] }` |
| POST | `/api/exam/answer` | student | `{ question_id, choice, index? }` upsert → `{ ok, answered, saved_at }` — `answered` is the exact number of answered questions |
| POST | `/api/exam/snapshot` | student | `{ current_index?, fullscreen? }` heartbeat → `{ ok, warnings, max_warnings, submitted, ends_at, server_time }` |
| POST | `/api/exam/event` | student | proctor event — see [Integrity events](#integrity-events) |
| POST | `/api/exam/section/finish` | student | lock the current section early; `{ section }` |
| POST | `/api/exam/submit` | student | grades immediately; returns `option_orders` |
| GET | `/api/exam/result` | student | `{ total, max, sections, competency, submitted_at, submit_reason, event_name, feedback_sent }`; **409** `results_not_published` or **403** `results_unavailable`/`results_expired` when hidden |
| POST | `/api/exam/feedback` | student | `{ rating, comment }`, once per paper |

### Admin
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/admin/events` | admin | `{ events, server_time }` |
| POST | `/api/admin/events` | admin | create event; a domain-aware event adds `domain_mode: 'select'` and `domain_rules` (see [Domain selection](#domain-selection-r-015)) |
| PATCH | `/api/admin/events/:id` | admin | edit event configuration before the first paper; **409** after a paper exists |
| DELETE | `/api/admin/events/:id` | admin | typed-name delete; cascade cleanup, active-session kick and audit |
| POST | `/api/admin/events/:id/publish-results` | admin | manual mode only; `{ expires_in }` preset or `{ expires_at }`; all existing papers must be submitted |
| POST | `/api/admin/events/:id/results/extend` | admin | extend `results_expires_at` |
| POST | `/api/admin/events/:id/results/unpublish` | admin | clear publication and expiry |
| POST | `/api/admin/events/:id/results` | admin | compatibility alias for publish-results |
| GET | `/api/admin/events/:id/roster` | admin | `{ roster, roster_updated_at }` |
| POST | `/api/admin/events/:id/roster` | admin | `{ text }` → `{ added, updated, invalid, roster_updated_at }` |
| GET | `/api/admin/live` | admin | `{ sessions, events, server_time }`; sessions carry `paper_id`, `current_section`, `section_name` |
| GET | `/api/admin/session` | admin | `?key=` one session plus full event history |
| POST | `/api/admin/force-submit` | admin | `{ key }` |
| POST | `/api/admin/resume` | admin | resume a locked/expired session with preserved answers |
| POST | `/api/admin/restart` | admin | snapshot the old attempt and reset section clocks; audited replacement for target `/retry` |
| POST | `/api/admin/lock` | admin | `{ key, reason }` — locks the session like an automatic lockout |
| POST | `/api/admin/message` | admin | `{ key, message }` |
| GET | `/api/admin/flags` | admin | `{ flags }` (optional `?event_id=`) |
| POST | `/api/admin/flags` | admin | `{ kind, email?, event_id?, reason }` |
| PATCH | `/api/admin/flags/:id` | admin | `{ status: 'open'\|'resolved' }` |
| GET | `/api/admin/tickets` | admin | `{ tickets }` |
| PATCH | `/api/admin/tickets/:id` | admin | `{ status }` |
| GET | `/api/admin/results` | admin | `{ results }` (rank, name, email, total, max, sections, competency) |
| GET | `/api/admin/results.csv` | admin | text/csv, header `rank,name,email,total,max,submitted_at` |
| GET | `/api/admin/analytics` | admin | `{ event_id, students, analysed, skills, difficulties }` - the cohort: the accuracy of every skill and every difficulty across all submissions, the weakest first |
| GET | `/api/admin/analytics.csv` | admin | text/csv, header `dimension,key,label,category,total,answered,correct,accuracy` |

### Bank
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/bank/categories` | admin | category list with counts (the router is admin-only) |
| GET | `/api/bank/skills` | admin | `{ skills, difficulties }` — the taxonomy and the difficulty scale, so no client hard-codes either |
| POST | `/api/bank/skills` | admin | `{ code, name, category, description? }` — **201**; **400** with `fields`; **409** when the code is taken |
| DELETE | `/api/bank/skills/:id` | admin | **409** (`in_use`) when a question uses it, **404** when it does not exist |
| GET | `/api/bank/questions` | admin | question list + variants; filters `?category=`, `?skill=` (a code), `?difficulty=` (1–5) |
| POST | `/api/bank/questions` | admin | `{ category, variant: { stem, options, correct }, skill?, difficulty? }` — **400** on an unknown skill or a difficulty outside 1–5 |
| POST | `/api/bank/questions/:id/competency` | admin | `{ skill?, difficulty?, category? }` — the only way a question changes after it was created; `skill: null` untags it; `category` moves it to another domain; **404** when the question does not exist |
| GET | `/api/bank/questions/:id/variants` | admin | variants of one question |
| DELETE | `/api/bank/variants/:id` | admin | delete a variant — **409** when a paper uses it (the paper freezes its variant ids) |

There is deliberately no PATCH/PUT for questions or variants: the question text
and its options do not change after creation. Only the competency does.

### Competency (bank v2)
- A **skill** is a stable code (`logical_reasoning`), a name, a category and a
  description. The code is the key everything else points at, so a skill can be
  renamed without breaking a question, a paper or a report.
- A **difficulty** is 1 (foundation) to 5 (expert), default 3. The scale is
  bounded by a database CHECK, not only by the API.
- A question carries one skill and one difficulty.
- A **paper freezes** the competency of its questions (`paper_questions`), so
  re-tagging a question never rewrites an exam that already ran. The frozen
  row keeps the skill code as text, so it survives a rename or a delete.

### Competency analytics (R-014)
- `server/services/analytics.js` answers every "what did this measure"
  question from the **frozen** rows, in one query for the whole scope.
- `competencyOfPaper(paperId)` - one paper: the student result.
- `competencyByPaper(paperIds)` - a scope: one query, a map per paper.
- `cohortOf(byPaper)` - the scope added up: the weakest skill first.
- Three numbers per bucket: `total` (the questions in the bucket), `answered`
  (the ones the student answered - an unanswered question is not a wrong
  answer) and `correct`. `accuracy` is `correct / total` in percent.
- Only counts leave the server. The key never does.

### Ops
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | — | `{ ok: true }` |

### Domain selection (R-015)
An event is either **fixed** (everybody gets the same questions - the default)
or **select** (the student picks the technical domain in the waiting room).

`POST /api/admin/events` takes the rules of a domain-aware event:
```json
{
  "name": "Frontend certification",
  "starts_at": "2026-10-22T10:00:00.000Z",
  "duration_min": 60,
  "config": { "Aptitude": 5, "Logic": 5, "Frontend": 20, "Backend": 20 },
  "domain_mode": "select",
  "domain_rules": { "common": ["Aptitude", "Logic"], "allowed": ["Frontend", "Backend"], "min": 1, "max": 2 }
}
```
- `common` - the categories every paper holds, exactly once.
- `allowed` - the technical domains the student may pick.
- `min` / `max` - how many of them the student must and may pick.
- Every common category and every allowed domain needs a question count in
  `config`; a domain without a count is not offered (there would be nothing to
  put in the paper).
- **400** with `fields.domain_rules` when there is no selectable domain, when
  `max < min`, or when a domain has no question count.

`GET /api/student/event` carries the rules for the waiting room:
```json
"domains": {
  "enabled": true,
  "common":  [ { "code": "Aptitude", "name": "Aptitude", "count": 5 } ],
  "allowed": [ { "code": "Frontend", "name": "Frontend", "count": 20 } ],
  "min": 1, "max": 2,
  "selected": [],
  "planned": 30
}
```
- `selected` is the **frozen** choice of the paper (empty before the exam).
- `planned` is the number of questions the paper holds for the current choice.
- A fixed event returns `enabled: false` and empty lists.

`POST /api/exam/start` takes the choice of the student:
```json
{ "domains": ["Frontend"] }
```
- The selection is validated by the server before the paper (and the timer)
  exists. **400** with a `code`: `domains_required`, `unknown_domain`,
  `duplicate_domain`, `too_few_domains`, `too_many_domains`.
- A refused selection leaves **no paper and no attempt** behind.
- A resume ignores the body: the paper keeps the choice it was created with.

`GET /api/admin/events` returns `domain_mode` and `domain_rules` per event.

## Shapes

### examState (`POST /api/exam/start`)
```json
{
  "status": "active",
  "paper": { "sections": [ { "name": "Aptitude", "questions": [ { "id": "<uuid>", "n": 1, "stem": "...", "options": ["a","b","c","d"] } ] } ] },
  "answers": { "0": 2 },
  "current_index": 0,
  "warnings": 0,
  "max_warnings": 3,
  "selected_domains": ["Frontend"],
  "locked": false,
  "lock_reason": null,
  "started_at": "2026-10-21T10:00:00.000Z",
  "ends_at": "2026-10-21T11:00:00.000Z",
  "server_time": "2026-10-21T10:00:00.000Z"
}
```
- The paper never contains the answer key (`correct` / `correct_idx`).
- `answers` is keyed by the 0-based question position.
- `status` is `active`, `submitted` (already submitted), or `insufficient`
  (bank too small for the requested counts → `{ status, category }`).
- `locked` is `true` when the session ended for an integrity violation;
  `lock_reason` explains why.
- `selected_domains` is the technical domain(s) the student chose, frozen with
  the paper. It is empty for a fixed event.
- The **sections of the paper are its domains**: the names come from the
  frozen `paper_questions.category`, never from the question bank as it is
  today.

### Live session (`GET /api/admin/live` → `sessions[]`)
```json
{
  "key": "<event_id>:<email>",
  "event_id": "<uuid>",
  "email": "student@example.com",
  "name": "Student One",
  "status": "active",
  "current_index": 3,
  "answered": 4,
  "total": 9,
  "warnings": 0,
  "submit_reason": null,
  "locked": false,
  "lock_reason": null,
  "violation_kinds": ["tab_blur"],
  "started_at": "2026-10-21T10:00:00.000Z",
  "ends_at": "2026-10-21T11:00:00.000Z"
}
```
- `violation_kinds` lists the distinct integrity kinds recorded for the paper.
- `locked` / `lock_reason` describe an integrity lockout; `submit_reason` is
  the reason the paper was submitted.

### Flag
```json
{ "id": "<uuid>", "kind": "MISCONDUCT", "email": "student@example.com", "event_id": "<uuid>",
  "reason": "...", "status": "open", "created_at": "2026-10-21T10:00:00.000Z" }
```

### Paper timing and option ordering
`exam_events.duration_min` is the event/start window only. A paper's deadline is
the sum of its own `section_limits`; `papers.ends_at` is no longer clamped to the
event window. `section_limits` is canonical and `module_minutes` is retained as
a dormant alias. `papers.option_orders` stores the displayed option order per
question; `answers.choice` is the displayed index and grading maps it through
`option_orders` to the authored index before comparing `correct_idx`.

### Calculator
The in-exam Calculator is client-only (`web/src/lib/calculator.js` +
`web/src/components/exam/Calculator.jsx`), opened from the Runner header or
mobile bar; it never calls the API.

### Result visibility
`results_visibility` is `immediate`, `after_all_submitted`, `manual` or `never`.
`immediate` is visible as soon as the student submits, including mid-event.
`after_all_submitted` waits for every existing paper to be submitted and ignores
students without a paper. `manual` waits for an admin publish and an expiry.
`never` hides student results while admins retain access. The target's stored
value is preserved exactly; post-target-`009` events are not blanket-flipped.

### Result
```json
{ "total": 7, "max": 9, "sections": [ { "name": "Aptitude", "score": 2, "total": 3 } ],
  "competency": {
    "skills": [ { "code": "logical_reasoning", "name": "Logical Reasoning", "category": "Logic",
                  "total": 2, "answered": 2, "correct": 1, "accuracy": 50 } ],
    "difficulties": [ { "level": 3, "label": "Medium", "total": 4, "answered": 4, "correct": 2, "accuracy": 50 } ]
  },
  "started_at": "...", "submitted_at": "...", "submit_reason": "student",
  "locked": false, "lock_reason": null,
  "event_name": "...", "feedback_sent": false }
```

`submit_reason` is `student` | `time_expired` | `max_warnings` | `force_submit` |
`integrity_lockout`. A locked paper always carries `submit_reason:
"integrity_lockout"` and `locked: true`.

`total` is the number of correct answers, `max` the number of questions in the
paper. There is no `score` or `percentage` field - the web client computes the
percentage itself.

`competency` is what the exam measured: the competency the paper **froze**,
broken down per skill and per difficulty. `total` is the number of questions
of that bucket in the paper, `answered` the ones the student answered
(unanswered is not wrong), `correct` the ones that were right. `accuracy` is
`correct / total` as a percentage. A question with no skill lands in a bucket
with `code: null` and the name "Not tagged". The answer key is never part of
it.

### Integrity events
`POST /api/exam/event` with `{ kind, detail? }`. The kind decides the tier; the
client cannot choose the outcome. An unknown kind is **400**.

| Tier | Kinds | Outcome |
|---|---|---|
| A — instant lock | `screenshot_key`, `recording_revoked` | exam submitted, `MISCONDUCT` flag raised, student signed out |
| B — warning | `tab_blur`, `fullscreen_exit`, `clipboard`, `context_menu`, `print`, `second_window`, `second_session`, `display_change` | strike counted against a shared budget of 3; the third submits the exam |
| C — log only | `devtools`, `share_surface`, `os_chord` | recorded in the event feed, no strike |

`os_chord` is the bare operating-system key press: Windows consumes the
snipping-tool chord (Win+Shift+S) before the page ever sees it, so this is the
only in-page trace of it. It is recorded, never penalised.

Response:
```json
{ "ok": true, "tier": "warn", "action": "warn", "warnings": 2, "max_warnings": 3,
  "submitted": false, "locked": false, "lock_reason": null }
```
- `tier` is `lock` | `warn` | `log`; `action` is `lock` | `submit` | `warn` | `log`.
- On a lock the response also carries `submitted: true`, `locked: true` and
  `lock_reason`, and the student socket receives `submitted` (reason
  `integrity_lockout`) followed by `locked`.
- The shared strike budget counts every Tier-B kind together (R-030).
- **One incident is one warning.** A `fullscreen_exit` seen by the client *and*
  by the server heartbeat is one strike: the server keeps the last fullscreen
  state (`papers.fullscreen_state`) and refuses a repeat within 10 s. The
  heartbeat reports `submitted: true` when the server ended the exam on its
  own, so the client learns about it even without a websocket.

## WebSocket protocol (`/ws?token=&tab=`)
Server → client messages:
| Message | When |
|---|---|
| `{ type: 'snapshot', sessions, events, server_time }` | admin connects |
| `{ type: 'session', session }` | a session changed in a way that needs the whole view (a warning, a lock) |
| `{ type: 'session_patch', key, patch }` | a cheap update: `patch` carries only what changed (`answered`, `current_index`, `last_seen_at`). The dashboard merges it into the session it already has — this is what every answer click and heartbeat sends, instead of a full session read |
| `{ type: 'event', event }` | a proctor event was logged |
| `{ type: 'message', text, at }` | admin → student message |
| `{ type: 'submitted', reason }` | student was force-submitted or auto-submitted |
| `{ type: 'locked', reason, kind }` | the session was locked for an integrity violation |

Client → server: none. Close code `4401` means the token was rejected. Close
code `4000` means the socket was replaced by a newer one (a reload of the same
tab) — the client may reconnect.

With Redis enabled the API publishes these messages on `examrobo:ws` and every
instance delivers them to its own clients, so a dashboard on instance A sees a
student on instance B.

## Screen recording (disabled)
- Active client capture, chunk upload, recording review routes and the
  Recordings admin page are removed.
- The `recordings` table, existing rows, `RECORDINGS_DIR` volume and compose
  mount are retained for data preservation. Admin event deletion may still
  clean the directory through `removeRecordingDirs`.
- `recording_revoked` remains an accepted historical integrity kind; it is not
  emitted by the current client.

## Operational rules
- The server never exposes `correct_idx` before submit.
- The server is the clock: `ends_at` is computed once per paper and every
  response carries `server_time`.
- Timers expire server-side too (sweeper every 30 s), so a closed browser still
  ends the exam on time.
