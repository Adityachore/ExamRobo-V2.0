# ExamRobo Flow

## Happy path — student
1. Open site → Login page, enter email.
2. Email on roster → JWT, redirect `/waiting`.
3. Waiting room shows exam name, start time, exam window, paper time and a live countdown to `starts_at`.
4. At start: "Begin Exam" → server generates paper (random variant per question, shuffled) → exam UI.
5. Answer MCQs; each change autosaved (upsert + 15s snapshot). Fullscreen enforced. A client-only Calculator is available from the Runner header/mobile bar. The paper runs for the full sum of its section limits; the event duration only controls when an attempt may start.
6. Submit (or timer expiry → auto-submit) → grading → Result page with score.
7. The result also shows **what the exam measured**: the score per skill and
   per difficulty, read from the frozen competency of the paper.
8. Feedback form → close browser.

## Happy path — admin
1. `/admin` → email + password → dashboard.
2. Create exam event (name, start, duration, categories, per-category counts).
3. Paste roster emails → `roster_emails` upserted, `roster_updated_at` stamped.
4. Build the bank: add questions, then tag each one with the skill it measures
   and its difficulty. The Skills tab holds the taxonomy itself.
5. During exam: Live Sessions view (telemetry per paper), actions message / force-submit / flag.
6. After: Results + leaderboard + CSV export; result publication/extend/unpublish for manual events; Flags & Tickets triage. Recording review is disabled.
7. The Results page also shows the **cohort**: every skill and every difficulty of
   the exam with its accuracy across all submissions, the weakest first, exportable
   as CSV. Expanding a student shows their own breakdown.

## Competency flow (R-013)
- The bank page reads the taxonomy and the difficulty scale from the API
  (`GET /api/bank/skills`), so the levels shown are the levels the server uses.
- Tagging a question → `POST /api/bank/questions/:id/competency`. Only the
  competency moves; the text and the options are immutable after creation.
- A question with no skill shows an amber "Not tagged" badge — it cannot be
  reported on per skill, so the admin is told.
- A skill a question uses cannot be deleted (409): the question would lose the
  competency it is measured against. Deleting an unused skill is allowed.
- A paper freezes the competency of its questions when it is created. Re-tagging
  a question afterwards changes the bank, never an exam that already ran.

## Results analytics flow (R-014)
- After the grading, `GET /api/exam/result` returns the score **and** the
  competency: `competency.skills` and `competency.difficulties`, each bucket
  with `total`, `answered`, `correct` and `accuracy` (`correct / total`).
- The breakdown comes from `paper_questions` — the frozen copy — so the exam
  describes itself as it was, not as the bank looks today.
- An unanswered question is not a wrong answer: `answered` < `total` is normal
  and the numbers say so.
- A question with no skill lands in a bucket named "Not tagged" (amber), the
  same hole the bank page shows.
- Admin: `GET /api/admin/results` carries the breakdown per student;
  `GET /api/admin/analytics` adds the submissions of an exam up into a cohort
  (the weakest skill first) and `GET /api/admin/analytics.csv` exports it.
- The papers that ran before the taxonomy existed had no frozen competency, so
  the backfill rebuilds it at boot (today's tags — an approximation, and it says
  so). From then on it is frozen like any other paper.

## Domain selection flow (R-015)
- A domain-aware event (`exam_events.domain_mode = 'select'`) asks the student
  **which technical domain** it should test. The common part (`Aptitude`,
  `Logic`) is in every paper, exactly once.
- The waiting room reads the rules from `GET /api/student/event` → `domains`:
  what may be chosen (`allowed`), how many must and may be chosen (`min`/`max`)
  and what a domain is worth (`count`). A fixed event returns `enabled: false`
  and the picker never appears.
- The student picks in the waiting room, **before the timer starts**. The
  choice is kept in `sessionStorage` and sent with `POST /api/exam/start`.
- The server validates the choice again (`server/services/domains.js`): a
  selection that is refused (**400** `domains_required`, `unknown_domain`,
  `duplicate_domain`, `too_few_domains`, `too_many_domains`) leaves **no paper
  and no attempt** behind, so nothing is spent by a bad choice.
- The paper holds the common part plus the count of every chosen domain, and
  the **sections of the paper are its domains** — read from the frozen
  `paper_questions.category`.
- The choice is frozen with the paper (`papers.selected_categories`). A resume
  returns the same paper and never asks again; the waiting room shows the
  frozen choice read-only.
- Re-tagging a question to another domain changes the bank, never a paper that
  already used it — the same rule the skill and the difficulty follow.

## Failure paths

### Bad email (R-001)
- Not on any roster → popup: "This email is not eligible for this exam. Use the invited email address."
- 3 failed attempts (email+IP) → 15-min block + auto-ticket (R-002/R-003).
- Student clicks "Contact Team" → ticket created, staff notified in admin UI.

### Crash / power loss mid-exam (R-021)
- Browser closes → answer rows already on server (upsert on every change).
- Reopen within `ends_at`, same email+event → paper rehydrated at last answered question; timer still server-authoritative.
- Past `ends_at` → paper auto-submitted server-side at next request; no rejoin.

### Screen recording (R-031, disabled)
- Active capture, upload and review are removed. Existing recordings data is preserved but never served.

### Result release (R-040)
- `immediate`: shown on result page immediately after submit, including mid-event.
- `after_all_submitted`: hidden with `results_not_published` until every existing paper is submitted; students without a paper do not block it.
- `manual`: hidden until an admin publishes with an expiry; admins can extend, unpublish or republish.
- `never`: hidden from students with `results_unavailable`; admins retain access.
- Expired manual results return `results_expired`.

### Tab-blur escalation (R-030)
- blur → warning row + live event; client banner count updates.
- 3rd warning → client auto-submits; server also enforces max-3 server-side.
- The budget is shared by every warning kind, so a blur, a print attempt and a
  clipboard block all spend from the same three strikes.

### Integrity lockout (R-030, R-033)
- The client detects a violation and posts the **kind**; the server decides the
  tier and the outcome.
- Tier A (screenshot key, recording revoked): the server submits the paper
  with `submit_reason = integrity_lockout`, writes the lock reason, raises a
  `MISCONDUCT` flag, pushes `submitted` + `locked` over the socket and signs
  the student out. Every later call on that paper is refused with 409
  `locked: true`.
- Tier B: the strike is counted and the banner shows the new count. The third
  strike submits the paper with `submit_reason = max_warnings`.
- Tier C: the event is logged, nothing else changes.
- The proctor can lock a session by hand from the Live dashboard; the student
  sees the same lockout screen with the proctor's reason.
- The lockout screen (`/locked`) is reachable without a token, so the student
  still sees why the exam ended after the sign-out.

### Second window vs second device (R-030)
- One sign-in, two browser tabs → `second_window` (one strike). The reload of
  a tab is *not* a second window: the tab id is stable across a reload, so the
  stale socket is reaped instead of counted.
- Two sign-ins of the same account (another browser, another device) →
  `second_session` (one strike).
- The two never both count: one mistake never costs two strikes.

### Leaving fullscreen (R-030)
- The client watches the state (the `fullscreenchange` event, a resize and a
  1 s poll) and compares the window with the screen, so F11 counts as
  fullscreen even though `document.fullscreenElement` stays null.
- A true → false **transition** posts `fullscreen_exit`; the question is hidden
  from then on and the nav buttons are disabled — the exam is paused, not
  ended.
- The server is the backstop: the heartbeat carries `fullscreen`, the server
  compares it with `papers.fullscreen_state` and counts the exit itself. The
  client report and the heartbeat are deduplicated, so one incident is one
  strike.
- The third strike submits the paper with `submit_reason = max_warnings`; the
  heartbeat reports `submitted: true` so the client knows even without a
  websocket.

### Clipboard attempt (R-030)
- The keydown is caught, prevented and posted as `clipboard`; the browser menu
  path is caught by the DOM event and deduplicated against the key press.
- Every press counts as an attempt; holding the key down is one attempt.
- The clipboard is wiped when the browser allows it.

### Screenshot key (R-030)
- The key press posts `screenshot_key` (Tier A) and the exam ends on the spot.
- The page cannot stop the operating system from taking the picture — the
  student instructions say so, and the screen recording is the evidence.

### Force-submit by proctor (R-032)
- Proctor action → WS kick + paper graded immediately regardless of remaining time.

### HR roster not updated (R-043)
- At event start−2h, if `roster_updated_at` is NULL or older than 2h → HR_MISTAKE flag on event, `created_by=system`.

### Server restart mid-exam
- Stateless API; papers/answers in Postgres; WS clients reconnect with backoff; no in-memory exam state.
- Login-attempt counters live in Redis when `REDIS_URL` is set (survive a restart, shared across instances) and in memory otherwise — the accepted P1 ceiling.

### Flag raised for a student (R-042)
- The dashboard sends the student email only → the API resolves the event from the student's latest paper and stores it in `flags.event_id`, so a flag always keeps its event context.
