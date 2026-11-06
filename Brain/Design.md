# ExamRobo Design

## Stack
React 19 + Vite + React Router 7 + Tailwind v4 + lucide-react. Express 4 + ws +
pg + ioredis. PostgreSQL 16 + Redis 7. Docker Compose (db, redis, api, nginx).

## Layout
- **Student critical path**: Login -> Waiting -> Exam gate -> Runner -> Result (or Locked).
- **Login**: split panel (46% brand aside / 54% form) at `lg`; brand aside hidden below `lg`; max-w-5xl.
- **Waiting / Exam gate / Result**: `StudentHeader` plus centered content, max-w-4xl (Waiting, Result) or max-w-5xl (Exam).
- **Exam gate**: two columns on `lg` (instructions 1.55fr, live readiness 1fr); single column on mobile. Begin is disabled until the server clock reaches `starts_at` and the window is open.
- **Runner**: sticky header (logo, event name, question position, warnings, autosave, Calculator, timer); 3-column shell at `xl` (section rail 220px, question, navigator 300px), 2 columns at `lg`, question-only on mobile. Sticky footer keeps Previous / Next / Questions / Review & submit visible. Fullscreen is required before the question is shown. The Calculator opens in a floating panel and is client-only.
- **Result**: completion hero, Exam/Submitted/Score summary, score ring + section bars, optional competency tabs, feedback, Finish & sign out.
- **Admin**: left nav (Dashboard, Events, Live, Results, Flags, Tickets, Bank), content right. Recording review is disabled.

## Component tree (candidate path)
```
App
  Login                 (split brand panel, email + inline validation, Contact Team)
  Waiting               (next-exam hero, server-anchored countdown, instructions)
  Exam                  (precheck -> readiness/instructions -> starting -> Runner)
  Runner                (useIntegrity, exam timer, autosave, Calculator,
                         section rail, Question Navigator, SubmitDialog)
  Result                (completion hero, score ring, section + competency breakdown,
                         pending/unavailable/expired result states)
  Locked                (integrity lockout notice, forced sign-out)
  Admin                 (AdminLogin, Events, Live, Results,
                         Flags, Tickets, Bank)
```

Shared candidate primitives live in `web/src/components/ui.jsx`: `Button`,
`Field`, `Input`, `Banner`, `Badge`, `Card`, `EmptyState`, `Modal`, `Drawer`,
`Toast`, `Tabs`. `Drawer` owns Escape close, a focus trap, body scroll lock and
focus restore. Exam-specific primitives live in
`web/src/components/exam/parts.jsx`: `ExamCountdown`, `FullscreenBlocker`,
`StartCountdown`, `AutosaveChip`, `AnswerOption`, `QuestionNavigator`,
`QuestionNavigatorPanel`, `SubmitDialog`, `Calculator`.

## Palette (exact design tokens)
Defined once in `web/src/index.css` under `@theme`:
- Canvas / background `#F5F8FC`; surface `#FFFFFF`; line `#DCE7F4`.
- Heading `#142B4D`; body `#1E3553`; muted `#62758D`.
- Primary `#2563EB`; hover `#1D4ED8`; soft `#EFF6FF`; ice `#EAF3FF`.
- Danger `#EF4444` (text `#B91C1C`, soft `#FEF2F2`).
- Warning `#F59E0B` (text `#92400E`, soft `#FFFBEB`).
- Success `#10B981` (text `#047857`, soft `#ECFDF5`); teal `#14B8A6`.
- Shape: controls 6px, cards 12px, large panels 16px.
- Shadows: `--shadow-card` (resting) and `--shadow-float` (modal / drawer).
- Semantic tones are expressed through `Badge` / `Banner` (`ok`, `warn`,
  `danger`, `info`), not ad-hoc colors. `text-muted` is the only secondary text
  token.

## Typography
System stack: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
"Helvetica Neue", Arial, sans-serif`. Root 15px. Page titles 24-28px;
question stem 17-18px / relaxed; base 15px; helper text 11-13px. Timer and
counts use tabular numerals (`.tnum`). Headings inherit `#142B4D`.

## UX rules
- Warning banner (amber) appears on every proctor event; the third warning is
  final and the exam submits.
- Countdown turns red under 5 minutes; the exam timer turns red under 2 minutes.
- Autosave indicator uses three honest states: "Saved", "Saving…", and
  "Not saved — retrying". It never claims success while a write is failing.
- Fullscreen is a hard block: outside fullscreen the question is hidden and the
  gate offers "Return to fullscreen". The warning is still counted.
- The Question Navigator is a Drawer on mobile/tablet and a persistent panel at
  `xl`; current / answered / unanswered states are visually and semantically
  distinct, not color-only.
- Empty, loading, offline and missing states are explicit inline panels; no
  invented exam history, question counts or marked-for-review data.
- Errors are inline banners, never `alert()`. Focus-visible rings use the primary
  token. Modals and the Drawer trap focus, close on Escape when dismissible, and
  restore focus to the trigger.
- Safe-area padding is applied to the Runner footer and Drawer footer on
  notched devices.

## Candidate-path data constraints (2026-10-22)
- `/student/event` is the only candidate landing data; there is no exam list.
- The pre-start payload has no question count or total marks, so the gate does
  not claim them.
- `/exam/result` has no answered/unanswered counts. The Submit dialog derives
  those from the client's current answers; the result page does not fabricate
  them.
- There is no persisted "marked for review" model, so the UI does not offer it.
- `/api/health` backs the "Exam server" readiness row; browser capability checks
  back Fullscreen and Screen sharing. Readiness is informational, not a
  substitute for the rules or the server's start decision.
- `EmptyState` + `TableSkeleton` for every list view; `ConfirmDialog` before
  destructive actions.

## Server-driven rules (the API is the system of record)
- The timer is server-authoritative: every response carries `server_time` and
  `ends_at`; the client only renders the countdown.
- The answer key stays on the server: the paper payload never contains
  `correct` / `correct_idx`.
- Warnings are cumulative and enforced server-side (3 → auto-submit), so a
  modified client cannot skip the escalation.
- Sessions are broadcast over WebSocket; with Redis the messages are shared
  across API instances.

## Competency model (bank v2)
- A question says **what it measures** (a skill) and **how hard it is** (a
  difficulty). The scale is 1 foundation … 5 expert, default 3.
- The taxonomy and the scale are **server-driven**: the admin UI reads them
  from `GET /api/bank/skills` and never hard-codes a level or a category.
- A skill is shown by its name; its **code** is the key the API speaks
  (`logical_reasoning`). The code survives a rename, so nothing breaks.
- The bank list shows the skill and the difficulty as badges next to the
  category, and a "Not tagged" badge in amber when a question has no skill —
  an untagged question cannot be reported on.
- Tagging is a dialog, not an inline edit: the question text and its options
  never change after creation, only the competency does.
- The **paper freezes** the competency of its questions, so re-tagging never
  rewrites an exam that already ran.

## Domain selection (R-015)
- The **picker lives in the waiting room**, above "Begin Exam" — the choice is
  made before the timer starts, never inside the exam.
- The waiting room reads the rules from the API (`domains.enabled`, `common`,
  `allowed`, `min`, `max`, `count`). The client hard-codes no domain and no
  count: a fixed event simply has no picker.
- The common part is shown as read-only chips ("Every exam includes …"); the
  selectable domains are a grid of toggle cards with their question count and a
  check mark. A domain beyond `max` is disabled instead of hidden, so the
  student sees the whole menu.
- A badge counts the choice ("2 of 3 chosen"), the live total says how many
  questions the paper will hold, and "Begin Exam" stays disabled until the
  choice is valid.
- The choice is kept in `sessionStorage` (`web/src/lib/domains.js`) and sent
  with `POST /api/exam/start`. The server validates it again — the client is
  never the authority.
- A paper that already exists shows the **frozen** choice read-only: no
  toggles, no changing the mind, no second attempt.
- A refused selection sends the student back to the waiting room with the
  reason, never into an empty exam.
- The admin event form has a **Domain selection** fieldset: the mode, the
  common categories, the selectable domains and the min/max. A category can
  only take one role, and only a category with a question count can be
  offered.

## Results analytics
- A result says **what the exam measured**, next to how many answers were
  right. The student sees a "What this exam measured" card with two tabs —
  **by skill** and **by difficulty** — each row a bar of `correct / total`.
- The admin gets the same breakdown per student (in the expanded row of the
  leaderboard) and a **cohort panel** above it: every skill and every
  difficulty of the exam, the weakest first, with the count of students
  analysed. One button exports the cohort as CSV.
- Every bucket shows three numbers, not one: `total` (the questions it holds),
  `answered` and `correct`. An unanswered question is **not** a wrong answer,
  so the bar is the accuracy (`correct / total`) and the numbers explain it.
- A skill with no name is "Not tagged" — the same amber the bank uses, so an
  untagged question is visible as a hole in the coverage, not silently folded
  into a neighbour.
- The numbers come from the frozen competency; the client never recomputes
  them and never sees the key.

## Integrity model
The policy is a three-tier table in `server/services/integrity.js`. The client
detects, the server decides.

| Tier | Kinds | Client behaviour | Server outcome |
|---|---|---|---|
| A — lock | `screenshot_key` | report and keep the UI honest | exam submitted, `MISCONDUCT` flag, signed out |
| B — warn | `tab_blur`, `fullscreen_exit`, `clipboard`, `context_menu`, `print`, `second_window`, `second_session`, `display_change` | report, show the amber banner | strike against a shared budget of 3; the third submits |
| C — log | `devtools`, `os_chord` | report | event feed only |

- The strike budget is **shared across all Tier-B kinds**: one mistake budget
  of three, not three per kind.
- The client may not choose the tier, the label or the outcome. It sends a
  kind; the server answers with the tier, the new count and whether the paper
  is now `locked`.
- The client guards are best-effort and one-directional: they stop the
  ordinary accident (a paste, a right-click, a print dialog, a lost focus).
  They are not a security boundary against a determined student.
- **The clipboard is detected from the keyboard, not from the DOM events.** The
  exam page has no editable field, so `copy`/`cut`/`paste` never fire there;
  the keydown is the only signal that is always available, and preventing it is
  the only way to actually block a paste. Every press is an attempt and counts.
- **Fullscreen is a hard block.** Outside fullscreen the question is not
  rendered at all. A `fullscreen_exit` is a true → false *transition* — F11
  does not set `document.fullscreenElement`, so an event-based check used to
  charge a student for *entering* fullscreen. The server keeps the last state
  (`papers.fullscreen_state`) and the heartbeat carries it, so one incident is
  one warning even when the client and the server both see it.
- **The browser cannot stop an operating-system capture.** The screenshot key
  is counted and ends the exam, but the picture is still taken; the instructions
  say so; screen recording is disabled, so the proctor event log is the evidence. `os_chord` (the bare
  operating-system key) is the only in-page trace of the snipping tool and is
  logged, never penalised.
- The server never trusts the client for concurrency. Two live tabs of one
  sign-in are detected from the socket registry (`second_window`); two sign-ins
  of one account are detected from the sign-in id (`second_session`). The two
  are mutually exclusive.
- A lock is terminal: the paper is submitted, every later answer, start or
  event call is refused with 409 `locked: true`, and the student lands on the
  lockout screen.

## v2 UI-first shell and route architecture (2026-11-06)

The v2 UI is additive. Existing student pages and `/admin/*` remain untouched
until v2 parity; no legacy route is redirected yet.

### Route tree
- Public: `/login`, `/register`, `/application/status`, `/invite/:token`,
  `/password/recover`, `/privacy`, `/terms`.
- Platform: `/platform/login`; guarded `/platform` shell with dashboard,
  registrations (queue + review), institutions (list + detail), plans, revenue,
  analytics, audit/alerts and settings.
- Institution: guarded `/app` shell with dashboard, onboarding (Owner only),
  events (list + workspace), students (list + detail), question bank, live,
  results, flags, tickets, employees/billing/activity/support access/settings
  (Owner or Admin).
- Preserved v1.5: `/`, `/seb`, `/waiting`, `/exam`, `/result`, `/locked`;
  `/admin/login` and legacy `/admin/*`.
- Shared states: `/403`, `/maintenance`, `/plan-limit`, `*` → NotFound.

### Data and auth boundary
- `web/src/lib/endpoints.js` is the only endpoint map. All new calls use
  `/api/v2`; legacy paths live under `ENDPOINTS.legacy`.
- `web/src/hooks/useApi.js` unwraps `{ data, meta }`; `useApi(path, 'platform')`
  selects the platform token, default `admin` selects the staff token.
- `web/src/lib/session.js` is a UI capability adapter only. It assumes Owner
  when no staff role is present; the server still enforces authorization.
- `web/src/lib/api.js` keeps separate storage keys for student, admin and
  platform; a 401 clears only that role and dispatches
  `examrobo:unauthorized`.
- Missing v2 endpoints render `ContractPending` / `ApiErrorState`. No placeholder
  metrics, students, events or invoices are invented.
- `AppShell` navigation is role-filtered: Operations are visible to all staff;
  Manage items require Owner/Admin; Admin management is Owner-only.

### Layout
- `AppShell`: 232 px left nav at `lg`, mobile drawer below, sticky top bar with
  role badge and log out, content max-w-7xl.
- `PlatformShell`: dark platform identity, same responsive nav/content pattern.
- Tables use `TableWrap` with a minimum width and horizontal scroll; skeletons
  are used only while a real request is in flight.
- All async sections use `Spinner` / `TableSkeleton` / `EmptyState` /
  `ApiErrorState` consistently.
