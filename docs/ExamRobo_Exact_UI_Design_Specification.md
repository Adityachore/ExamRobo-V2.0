# ExamRobo — Exact UI Design Specification

> Screen-by-screen blueprint based on the generated light-theme concept collage. Planning only; no project files or business logic are modified.

> **Current-state note:** this is a UI blueprint, not a backend contract. Screen
> recording is disabled in v1.5; the Recording & Monitoring section below is
> superseded by the proctor event log.

![ExamRobo UI concept collage](a_wide_high_resolution_clean_ui_ux_concept_collag.png)

## How to use this specification

Treat the collage as the visual north star: airy light surfaces, blue primary actions, pale-blue supporting surfaces, a quiet navigation rail, clear tables, and compact status badges.

**Limitation:** No source repository, PRD, route tree or API definitions were attached. Route names and feature availability are therefore unverified. The 16 panels below describe screens/patterns visible in the concept; check each route, action, role permission and field against the code before implementation.

## Shared light-theme design system

### Color tokens

| Token | Name | Hex | Use |
|---|---|---|---|
| Brand / primary | Royal Blue | #2563EB | Primary actions, selected controls, active nav indicator |
| Brand / hover | Blue 700 | #1D4ED8 | Hover/pressed primary buttons |
| Brand / pale | Pale Blue | #EFF6FF | Selected rows, callouts, soft feature cards |
| Brand / ice | Ice Blue | #EAF3FF | Illustration or hero panel wash; subtle decorative surface |
| Text / primary | Midnight Navy | #142B4D | Headings and main text |
| Text / body | Ink | #1E3553 | Body copy, form labels, table content |
| Text / muted | Slate | #62758D | Helper text, metadata, secondary labels |
| Surface / app | Canvas | #F5F8FC | Outer application background |
| Surface / card | White | #FFFFFF | Cards, forms, table panels, dialogs |
| Border | Line | #DCE7F4 | Inputs, dividers, table borders |
| Success | Green | #10B981 | Submitted, saved, available; always pair with text/icon |
| Warning | Amber | #F59E0B | Upcoming, attention, pending |
| Error | Red | #EF4444 | Validation, failed, unanswered alert where semantically appropriate |
| Info / teal accent | Teal | #14B8A6 | Secondary data accents only |

### Typography

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| Display / page title | 24-28 px / 1.2 | 600-700 | Page name / primary result |
| Section heading | 17-20 px / 1.3 | 600-700 | Card and content heading |
| Body | 14-16 px / 1.5 | 400 | Instructions, question text, body copy |
| Table / control | 13-14 px / 1.4 | 400-500 | Rows, controls, buttons |
| Metadata | 12-13 px / 1.4 | 400-500 | Timestamps and helpers |

### Layout tokens

- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40 px.
- Content max width: 1440 px; desktop gutters 24-32 px, mobile gutters 16 px.
- Admin sidebar: 220-240 px expanded; 64-72 px collapsed if needed. Top bar: 56-64 px desktop, 52-56 px mobile.
- Controls: 40-44 px standard, 44-48 px for touch. Radius: 6 px controls, 10-12 px cards, 14-18 px large panels.
- Surfaces: #F5F8FC outer canvas, white cards, #DCE7F4 dividers, subtle shadows used sparingly.
- Typeface: Inter if already included; otherwise retain the existing neutral sans-serif.

### Shared component contract

- **Buttons:** Primary blue filled; secondary white/blue outline; text button for low-emphasis actions. Consistent height/radius. Include hover, focus, pressed, disabled and loading variants.
- **Inputs:** Persistent visible labels, optional helper text, inline error below field, clear disabled/read-only state. Never use placeholder as the only label.
- **Status badges:** Compact capsule with text and optional icon. Standardize terms; do not communicate status with color alone.
- **Tables:** Consistent column alignment, header, row padding, hover/focus, empty/loading/error states, pagination and overflow strategy.
- **Cards:** White surface, subtle border, 10-12 px radius. Use cards to group meaningful content, not to wrap every single label.
- **Dialogs/drawers:** Clear title, one-sentence purpose, explicit close/cancel path, proper focus handling, Escape support if non-destructive.
- **Alerts/toasts:** Use concise messages and appropriate status icon. Persistent errors belong inline; transient confirmations may use a toast.
- **Icons:** One consistent outline icon family, 16-20 px in controls, 20-24 px for feature cards. Always include text for important action/status.
- **Loading/empty/error:** Skeletons for expected structured content, empty states with a useful next step, errors with retry when retry is safe.
- **Navigation:** Consistent labels and active-state treatment; active item uses pale-blue background and blue icon/text, not a bright full-width bar.

## Screen-by-screen specification

### 01. Admin Login

- **Purpose:** Give authorized staff a calm, credible entry point into the administration area.
- **Role:** Administrator / authorized staff
- **Priority:** High
- **Route status:** Unverified; use the existing login route if present. Do not create a parallel auth flow.

**Exact composition**
- Use a centered page canvas with a large white, rounded surface (target radius 14-18 px) split into two columns at desktop widths of 1024 px and above. Left branding panel approximately 46% wide; right form panel approximately 54%.
- Left panel: ExamRobo symbol and name near the top third, short statement “Smarter Exams. Safer Tomorrow.”, small trust line, and one restrained blue exam-device illustration near the lower half. Use a very pale blue background/gradient; no dark theme.
- Right panel: “Welcome Back” heading, short support line, labeled email and password inputs, remember-me checkbox, forgot-password link only if the existing auth supports it, full-width blue Sign In button, and a small support/contact link. Align form to a readable max width of roughly 360 px.

**Components to reuse:** Brand mark, TextField, PasswordField with show/hide control, Checkbox, PrimaryButton, InlineValidationMessage, loading button state.

**Behavior and logic guardrails:** Validate required fields inline; preserve server-auth response and error messages; disable submit while the real request is pending; Enter submits; password show/hide is keyboard accessible. Never imply login success before authentication succeeds.

**Responsive behavior:** Below 720 px, stack into a compact single-column form. Reduce decorative illustration or hide it; keep logo, heading, fields and action visible without scrolling on common mobile heights. No horizontal split panel on phones.

**Required states:** Initial; invalid email; missing fields; incorrect credentials; network/server error; submitting; authenticated redirect. Password reset is a link only if that real workflow exists.

**Acceptance criteria:** The split-panel desktop composition and compact mobile variant match the collage; every field has a visible label; errors are associated with fields; the existing auth contract and redirect are unchanged.

### 02. Candidate Dashboard

- **Purpose:** Answer three questions quickly: what is next, when does it start, and what action can I take?
- **Role:** Candidate / student
- **Priority:** High
- **Route status:** Unverified; map to the current candidate landing route.

**Exact composition**
- Use the shared white top bar and narrow left navigation used in the collage. Sidebar: Dashboard, Exams, Question Bank only if candidate-visible today, Results, Settings; show only actual authorized areas.
- Main content starts with a greeting and short subheading. Place a “Next Exam” feature card near the top with exam title, scheduled date/time, duration, and one primary “View Instructions” button. The feature card uses pale blue wash and a small right-side exam illustration.
- Below, “Upcoming Exams” is a compact list with one row per exam: small subject icon, title, date/time, state badge (Upcoming / Scheduled / In progress only where applicable), and View action. Keep status labels text-based, not color-only.

**Components to reuse:** AppHeader, CandidateSidebar, WelcomeHeader, NextExamCard, ExamListRow, StatusBadge, EmptyState.

**Behavior and logic guardrails:** View Instructions opens the existing exam details/entry flow; row action opens the corresponding exam; upcoming and past lists use real data; show an explicit empty state when no exams are available.

**Responsive behavior:** Sidebar becomes a menu/drawer; top-level next action remains above the fold; exam rows collapse to stacked title/date/status/action groups; avoid horizontal scrolling.

**Required states:** Loading skeleton; no upcoming exams; API error with retry; exam unavailable/cancelled if backend defines it; scheduled exam; active exam if the system supports re-entry.

**Acceptance criteria:** Next action is visually first; all dates use the user’s locale/timezone convention; only real exam records/statuses are shown; mobile layout has no clipped actions.

### 03. Exam Instructions & Entry

- **Purpose:** Make exam rules and system readiness explicit before the candidate starts.
- **Role:** Candidate / student
- **Priority:** Critical
- **Route status:** Unverified; use the current pre-exam/instructions route if present.

**Exact composition**
- Use standard app shell, with the exam title and compact metadata row at the top: duration, question count and total marks where available.
- Desktop main area is two columns: wider “Read Instructions” panel on the left with numbered, easy-to-scan rules; narrower “Before you start” panel on the right with checklist rows and status icons for connectivity, permissions, microphone/camera only if required, and other real prerequisites.
- Primary “Start Exam” button spans the lower width of the main content. It should be the strongest action, but visually separate from the instructions so a candidate can review first.

**Components to reuse:** ExamMetaStrip, InstructionList, ReadinessChecklist, PermissionStatus, PrimaryButton, HelpLink.

**Behavior and logic guardrails:** Readiness checks must reflect actual browser/API state. If a permission is required and missing, explain the next step and disable start only if existing requirements demand it. Starting must call the current entry action exactly once and respect server-side availability/time gates.

**Responsive behavior:** Stack metadata, instructions, checklist and CTA. Keep the CTA full width and reachable. Long instructions may scroll; preserve heading/context.

**Required states:** Checking readiness; all ready; optional permission not granted; required check blocked; exam not yet open; exam closed; network failure; start request pending.

**Acceptance criteria:** No fake green checks; the CTA does not bypass existing scheduling or permission rules; instruction text remains readable at 320 px wide; starting cannot create duplicate attempts.

### 04. Active Examination

- **Purpose:** Maximize focus and readability while making time, answer state, navigation and saving status clear.
- **Role:** Candidate / student
- **Priority:** Critical
- **Route status:** Unverified; retain the existing attempt/question route and navigation semantics.

**Exact composition**
- Use a dedicated exam shell, visually quieter than admin pages: white background, thin ice-blue dividers, no marketing art. Header contains ExamRobo mark, section/question context, persistent countdown timer and compact save/recording indicators supported by the current system.
- Desktop split: a restrained section/question rail at left, question content in the center (widest area), and an optional question navigator at right when screen width permits. At compact desktop widths, collapse the navigator into a drawer instead of squeezing the question.
- Question card shows “Question N of total”, optional “Mark for review”, prompt text at 16-18 px with generous line-height, and vertically stacked answer options. Each option has a radio indicator, letter/label and large hit area. Selected state uses a blue border and pale blue fill; keyboard focus is distinct.
- Footer action row: Previous, Save Progress only if meaningful in the existing flow, and Next. Keep Submit Exam in an explicit end-of-attempt flow rather than presenting it as an ordinary next action.

**Components to reuse:** ExamHeader, CountdownTimer, SaveStatus, RecordingStatus (if current app supplies it), QuestionPrompt, AnswerOption, ReviewToggle, QuestionNavigatorDrawer, ExamActionBar, WarningBanner.

**Behavior and logic guardrails:** Preserve the current timer source and auto-submit behavior. Answers must use the existing autosave/persistence model; indicate pending/saved/failed only from actual persistence state. Keyboard operation must work for options and navigation. Warn on navigation only if unsaved data can truly be lost.

**Responsive behavior:** On tablet, hide/collapse section rail and open navigator via icon. On mobile, use a compact sticky header with timer, one-column prompt/options and bottom action bar that respects safe areas; navigator opens as a full-height drawer. No horizontal scrolling.

**Required states:** Loading question; answer selected; saving; saved; save failure; timer warning; expired/auto-submitting; offline/reconnecting; recording inactive/failed if relevant; attempt already submitted.

**Acceptance criteria:** No timer, autosave, recording or submission logic is rewritten by UI work. Timer remains visible throughout. The current question is never identified only by color. A real failure is announced accessibly and never represented as saved.

### 05. Question Navigator Drawer

- **Purpose:** Let candidates move among questions and understand answered, current, review-marked and unanswered states at a glance.
- **Role:** Candidate / student
- **Priority:** Critical
- **Route status:** A state of the Active Examination screen, not necessarily a standalone route.

**Exact composition**
- Match the collage: slide-out/overlay panel labeled “Question Navigator”, with compact numbered tiles in a regular grid. A selected/current tile receives a strong blue outline or fill; answered, marked and unanswered states each have an additional shape/icon or label distinction.
- Include a clear legend below or beside the grid. Show section grouping only where the existing exam model has sections. Include a visible close button and a clear active-question focus state.
- A dimmed backdrop may cover the question view behind the panel, but maintain readable context and avoid making the drawer look like a separate page.

**Components to reuse:** Drawer, QuestionNumberTile, QuestionStateLegend, SectionGroup, CloseButton.

**Behavior and logic guardrails:** Selecting a question navigates via the existing question-change function and closes the drawer where appropriate. If answers are saving, do not lose pending edits. Escape closes the drawer; focus returns to the trigger; focus stays trapped inside while the modal drawer is open.

**Responsive behavior:** Desktop: 300-340 px side panel; tablet: narrower overlay; mobile: full-height drawer with 4-5 columns depending on available width and thumb-friendly tile sizes (minimum target 44×44 px).

**Required states:** Navigator loading; all unanswered; mixed answered/unanswered; review-marked; active/current; disabled/locked question only if the exam rules support it.

**Acceptance criteria:** The legend matches the tile states; states are distinguishable without color; drawer supports keyboard and screen reader use; choosing a number never changes the saved answer state by itself.

### 06. Submission Confirmation

- **Purpose:** Prevent accidental final submission by summarizing the attempt before the irreversible action.
- **Role:** Candidate / student
- **Priority:** Critical
- **Route status:** Confirmation state/modal in the existing exam submission flow.

**Exact composition**
- Center a focused white confirmation card with a restrained checklist/shield illustration at the top, title “Confirm Submission” and clear helper text (“You have answered X out of Y questions”).
- Show three compact summary tiles: Answered, Unanswered and Marked for review. Use icon + text + count, with restrained green, red/amber and blue accents.
- Actions: secondary “Back to Exam” and primary “Submit Exam”. Explain that answers may not be editable after submission only if that is the actual product behavior. Avoid placing an equally prominent destructive action next to the primary CTA without spacing.

**Components to reuse:** ConfirmationPanel, SubmissionSummaryTile, PrimaryButton, SecondaryButton, IrreversibleActionDialog if a second confirmation is required by current product rules.

**Behavior and logic guardrails:** Summary counts must be computed from the current attempt. Back returns without submitting. Submit invokes the real submit endpoint once, disables controls while pending and handles duplicate-clicks safely.

**Responsive behavior:** Single-column card with vertically stacked metrics and full-width buttons on small screens. Keep the primary and secondary actions visually distinct.

**Required states:** Ready to submit; submission pending; submission success transition; submission failure with retry/return guidance; data still syncing, if supported.

**Acceptance criteria:** Counts agree with the navigator and stored answers; no submission occurs merely by opening the panel; failure does not falsely show success or discard the attempt.

### 07. Exam Completion & Results

- **Purpose:** Confirm that the attempt was submitted and provide only result information available to the candidate.
- **Role:** Candidate / student
- **Priority:** High
- **Route status:** Unverified; use the current submission completion/result route.

**Exact composition**
- Show a prominent green check/status icon, “Exam Submitted Successfully!” heading and short acknowledgement. Keep green as a status accent, not as a page background.
- Below, show exam name and completion date/time plus small summary tiles such as total questions, answered, unanswered and marked for review where the system exposes them.
- Provide a primary “View Results” action only if candidate results are released and available; provide a secondary “Back to Dashboard” action. When scores are withheld, show submitted status and release guidance rather than a fake score.

**Components to reuse:** SuccessStatus, AttemptSummaryCard, ResultAvailabilityNotice, PrimaryButton, SecondaryButton.

**Behavior and logic guardrails:** Read submission state from the server/attempt record. Results action respects release rules and permissions. Browser refresh must not accidentally resubmit the exam.

**Responsive behavior:** Single-column success panel, with summary tiles becoming a 2×2 grid or stacked list. Ensure primary next step is obvious.

**Required states:** Submitted/results available; submitted/results pending; submission verified after reconnect; result lookup failure; session expired but submission persisted.

**Acceptance criteria:** The UI never fabricates score, percentage or breakdown. The submitted status remains after refresh if the backend confirms it. Links lead only to supported destinations.

### 08. Admin Dashboard

- **Purpose:** Present operational status and next actions, not decorative analytics.
- **Role:** Administrator / exam operations
- **Priority:** High
- **Route status:** Unverified; map to the existing admin landing route.

**Exact composition**
- Use shared admin shell with persistent left navigation and top utility header (search/notifications/profile only if already supported). Main content begins “Welcome back, Admin” with concise subtitle.
- Four small KPI cards across desktop: Active Exams, Total Candidates, Completed, Pending Review. Each metric must map to existing data and define its time/filter scope. Use simple icons and small status accents, no oversized charts.
- Lower content is a two-column layout: “Recent Activity” list on the left with avatar/icon, event, actor/subject and relative time; “Quick Actions” on the right with Create Exam, Add Question, Add Candidate and View Reports only where permissions allow.

**Components to reuse:** AdminShell, PageHeader, MetricCard, RecentActivityList, QuickActionList, EmptyState, PermissionGuard.

**Behavior and logic guardrails:** KPI clicks navigate to relevant filtered lists only if that behavior is implemented. Quick actions navigate to actual flows. Data refresh/error states must not present placeholders as live counts.

**Responsive behavior:** KPI cards become 2 columns then 1 column; Recent Activity and Quick Actions stack; sidebar collapses to drawer.

**Required states:** Loading cards; no recent activity; partial API failure; no permission for action; stale data with last-updated cue if available.

**Acceptance criteria:** Only metrics backed by real APIs appear; cards align and share type/spacing; dashboard has one clear information hierarchy; all quick actions are permission-aware.

### 09. Exam Management

- **Purpose:** Let staff find, understand and manage exams through a predictable searchable list.
- **Role:** Administrator / exam manager
- **Priority:** High
- **Route status:** Unverified; use current exams list/create/edit routes.

**Exact composition**
- Page heading “Exams” with short helper line; right-aligned primary “Create Exam” button. Under it, one filter row: search input and status dropdown; add other filters only if data supports them.
- Use a table with Name, Type, Duration, Start Time, Status and Actions columns. Display exam names strongly, date/time on a second line if needed, compact status badges and an overflow menu for secondary actions.
- Pagination appears below the table, with current range and page controls. Empty state includes context-aware “Create Exam” only when user can create exams.

**Components to reuse:** PageHeader, SearchField, SelectFilter, DataTable, StatusBadge, RowActionMenu, Pagination, EmptyState, ConfirmDialog.

**Behavior and logic guardrails:** Search, filters, sort and pagination must work on real data; preserve query/state across navigation when appropriate. Destructive actions require confirmation and permission checks.

**Responsive behavior:** Below tablet widths, render each row as a stacked record with name/status first and row actions reachable without horizontal overflow. A horizontally scrollable table is a fallback only for dense information.

**Required states:** Loading skeleton; no exams; no filter matches; create/update failure; archived/closed state if supported; delete confirmation and success/failure.

**Acceptance criteria:** Search and filter combination is coherent; date/time formats are consistent; row actions match real permissions; mutations refresh data truthfully.

### 10. Question Bank

- **Purpose:** Make it easy to find, categorize, verify and create questions.
- **Role:** Administrator / question author
- **Priority:** High
- **Route status:** Unverified; use current question-bank route.

**Exact composition**
- Page title “Question Bank” and description; primary “Add Question” button on right. Place search, subject/category, type and difficulty filters in one aligned toolbar.
- Table columns: Question preview, Subject, Type, Difficulty and Actions. Render a short text snippet with ellipsis; keep tags/badges compact. Row actions include edit/preview/delete only if those operations exist.
- Pagination and result count appear below. Category management/add-category control belongs in the filter area only if the product supports category creation.

**Components to reuse:** SearchField, FilterSelect, QuestionTable, DifficultyBadge, QuestionPreview, AddQuestionForm/Modal, Pagination, DeleteConfirmDialog.

**Behavior and logic guardrails:** Search and filters combine; question preview opens a read-only preview; add/edit validates type-specific required fields and answer keys; import flows and math rendering only if currently implemented. Confirm deletion.

**Responsive behavior:** Toolbar wraps into two rows and then a filter drawer; table becomes stacked rows on phones. Keep question text readable and action labels discoverable.

**Required states:** Loading; empty bank; no results; validation errors; duplicate/import errors only if import exists; save pending/failure; preview.

**Acceptance criteria:** Question list uses real categories and types; answer keys are not exposed in candidate-facing views; form validation is specific to question type; no unimplemented import UI is introduced.

### 11. Candidate & User Management

- **Purpose:** Find candidates, inspect assignments and understand account status without leaking unnecessary personal information.
- **Role:** Administrator / authorized staff
- **Priority:** High
- **Route status:** Unverified; use existing candidates/users routes if available.

**Exact composition**
- Heading “Candidates” and helper text; “Add Candidate” action at upper right. A single filter bar contains search, status and assigned exam filters only when supported.
- Table columns: Name, Email, Exam Assigned, Status and Actions. Use compact avatar initials or neutral profile icon; do not rely on portrait photos. Status labels use text plus icon.
- Row action menu opens supported detail/edit/assignment options. Destructive or access-revoking operations require a confirmation dialog with consequences stated plainly.

**Components to reuse:** CandidateTable, Avatar, SearchField, FilterSelect, StatusBadge, CandidateForm, AssignmentSelector, ConfirmDialog.

**Behavior and logic guardrails:** Search name/email; filter by status/assignment; add/edit uses server validation; never expose admin-only data to candidate roles. Bulk actions only if present in the existing product.

**Responsive behavior:** Cards replace wide table rows on mobile; email can wrap/break safely; actions become a menu or detail page link.

**Required states:** Loading; no candidates; no matching candidates; invite/create failure; inactive/suspended status if real; permission denied.

**Acceptance criteria:** Displayed fields are permission-appropriate; status vocabulary matches backend; destructive actions are confirmed; user creation does not imply a sent invite unless the system confirms it.

### 12. Results & Reports

- **Purpose:** Show reliable outcomes and allow controlled filtering/export.
- **Role:** Administrator / candidate depending on permission
- **Priority:** Medium
- **Route status:** Unverified; use current results/reports route.

**Exact composition**
- Heading “Results & Reports” with primary Export button aligned right only if export exists. Use a compact tab row such as All Exams, Performance, Analytics, Export only for actually implemented sections.
- Filters: exam selector and date range. Main table includes Candidate, Email/identifier, Exam, Score, Status and Completed At. Percent/score should be visually prominent but compact; status badges are secondary.
- If charting is supported and backed by complete data, place one simple chart after the table or on the Analytics tab; avoid adding charts merely for decoration.

**Components to reuse:** ReportTabs (optional), DateRangeFilter, ExamSelect, ResultsTable, ScoreCell, StatusBadge, ExportButton, EmptyState.

**Behavior and logic guardrails:** Filters update result rows and any chart together. Export reflects visible filter scope and returns a truthful success/failure state. Scores shown only when authorized and released.

**Responsive behavior:** Table turns into stacked result cards or provides a carefully labeled overflow surface on phone. Filters move into a drawer. Export remains available but does not crowd the title.

**Required states:** Loading; no published results; no data for selected range; export in progress/failure; partial data; permission denied.

**Acceptance criteria:** Totals and chart values agree with source data; export contains the selected scope; hidden/withheld results are not inferred; all filter controls have a clear reset path.

### 13. Recording & Monitoring

> **Superseded:** active recording capture/review is removed in v1.5. Use the
> proctor event log and the Live dashboard; do not build recording playback.

- **Purpose:** Provide an operational overview of recording status and monitoring signals without overwhelming staff or exposing more candidate data than needed.
- **Role:** Administrator / proctor
- **Priority:** High if feature exists; otherwise hold until verified
- **Route status:** Unverified; only map if live recording/monitoring routes and APIs exist.

**Exact composition**
- Heading “Recording & Monitoring” with filters for candidate, exam, status and date range where supported. Use a compact table, matching the collage.
- Columns: Candidate, Exam, Recording Status, Warnings, Duration and Actions. Statuses such as Available/Processing/Failed must reflect actual storage/processing state. Warning count should be clickable only if a real event detail view exists.
- Actions are compact icon/text buttons such as play/view details only when supported. A recording player should open with clear access controls, metadata and loading/error handling, not embed a player in every row.

**Components to reuse:** MonitoringFilterBar, RecordingTable, RecordingStatusBadge, WarningCount, RecordingPlayer/DetailPanel (if present), PermissionGate.

**Behavior and logic guardrails:** Check access permissions before showing or playing recordings. Distinguish no recording, processing and failure. Avoid auto-play. Preserve audit/security requirements already in place.

**Responsive behavior:** On mobile, stack candidate/exam first, then state/warnings/duration; place player in a full-screen modal or separate route.

**Required states:** Loading; none available; processing; playable; failed/unavailable; access denied; playback error; no warnings.

**Acceptance criteria:** No invented recordings or warning events; status colors include text; access control is unchanged; sensitive content is not preloaded for unauthorized viewers.

### 14. Settings

- **Purpose:** Make account/profile configuration scannable and safe to edit.
- **Role:** Administrator / user
- **Priority:** Medium
- **Route status:** Unverified; use the current profile/settings route and existing setting sections.

**Exact composition**
- Standard admin shell; heading “Settings”. Use an in-page vertical tab/secondary navigation at the left of the content for the existing sections (the collage shows Profile selected with other preference/security categories).
- Main white form panel “Profile Information” includes avatar/profile image action only if supported, name, email and role (role read-only unless role changes are explicitly allowed). Place Save Changes at the bottom right of the form.
- Separate account, notification, security and integration settings only when they actually exist. Group related fields and clearly distinguish immutable or admin-managed fields.

**Components to reuse:** SettingsSubnav, ProfileForm, TextField, SelectField, AvatarUpload (if supported), SaveButton, InlineFeedback.

**Behavior and logic guardrails:** Dirty-state handling; validation on blur/submit; save success only after server confirmation; unsaved-changes warning if navigating away would lose edits. Do not permit self-role escalation via UI.

**Responsive behavior:** Secondary nav becomes horizontal scroll/tab strip or dropdown; forms become single-column; actions remain visible near the end of the form.

**Required states:** Loaded; unsaved changes; saving; saved; validation error; server error; disabled/read-only field.

**Acceptance criteria:** Fields align to current API schema and permissions; successful state follows API response; no settings categories are added without actual support.

### 15. Candidate Dashboard - Mobile

- **Purpose:** Preserve the same priorities and actions as desktop in a phone-native layout.
- **Role:** Candidate / student on phone
- **Priority:** High
- **Route status:** Responsive state of the candidate dashboard, not a separate route unless the application already has one.

**Exact composition**
- Match the phone mockup: white mobile canvas with compact top bar (ExamRobo mark, notification/profile control only if present), friendly greeting and one next-exam card.
- Next exam card shows title, schedule and one full-width “View Details”/“View Instructions” action. Upcoming exam rows become vertically stacked with date/time, status and a chevron or explicit View action.
- Bottom navigation has a small number of primary destinations (Home, Exams, Results, Profile) only if each destination exists and the current app’s permissions allow them. Use labels below icons, not icons alone.

**Components to reuse:** MobileHeader, NextExamCard, UpcomingExamList, BottomNavigation, StatusBadge.

**Behavior and logic guardrails:** Tap targets at least 44×44 CSS px; bottom navigation updates the current route; safe-area padding; no horizontal swipes required to discover core actions.

**Responsive behavior:** Treat 360-430 px as the primary target; also test 320 px and large phones. Stack content, minimize decoration and maintain 16 px minimum body text where feasible.

**Required states:** Same data states as desktop; offline/network feedback; no exams; pending loading.

**Acceptance criteria:** All desktop essentials remain reachable; bottom navigation does not cover content; touch targets and labels are accessible; no mobile-only fake data.

### 16. Reusable Components & Design System

- **Purpose:** Make every page feel like one product and allow one component fix to improve the full application.
- **Role:** All users / all screens
- **Priority:** Critical dependency
- **Route status:** Shared library, not a user-facing route.

**Exact composition**
- Create a component reference page/story collection corresponding to the collage: Buttons; Form Elements; Status Badges; Tables; Cards; Alerts & Notifications; Icons; navigation patterns; empty/loading/error states.
- Primary, Secondary and Outline buttons use consistent heights, radii and disabled/loading behavior. Fields share label/help/error treatment. Tables share header treatment, row height, zebra/hover behavior, overflow and pagination.
- Use semantic status system: success/available (green), warning/pending (amber), error/failed (red), info/selected (blue), neutral/inactive (slate). Pair every color with text/icon/pattern where meaning matters.

**Components to reuse:** Design tokens, button variants, TextField, Select, Checkbox/Radio, StatusBadge, DataTable, Card, Modal/Dialog, Drawer, Toast/Alert, Skeleton, EmptyState, IconButton, Breadcrumb, Pagination.

**Behavior and logic guardrails:** Define focus-visible, hover, active, disabled, loading, invalid and success states. All clickable controls must have real actions; all component state variants must be documented.

**Responsive behavior:** Document breakpoints and component adaptations in one place; components should not hardcode page-specific widths unless required by the interaction.

**Required states:** Every relevant component has normal, focus, disabled, loading and error variants. Status, table and form controls tested with keyboard and long content.

**Acceptance criteria:** No duplicate one-off button/form/table styles remain in redesigned pages; tokens are used consistently; responsive behavior is shared; no component pretends an action succeeded.

## Global shell and navigation

### Admin desktop shell
- Use #F5F8FC canvas, white main surfaces, quiet left sidebar, stable navigation order, pale-blue active state, and a restrained utility header.
- Only show navigation items and utilities that exist and are authorized. Do not add decorative icons without behavior.
- Each page has one clear heading, a short explanation when useful, and a consistently aligned primary action.

### Candidate shell
- Keep the candidate navigation set smaller and separate the active exam into a distraction-free shell.
- On mobile, use a drawer or bottom navigation according to actual routes; do not duplicate targets.

## Recommended implementation sequence

### Phase 0 — Source audit and baseline

Inspect PRD/project brain, README/instructions, package scripts, router, role/permission gates, all page components, API calls and current design tokens. Capture actual screenshots at desktop/mobile. Build a confirmed route/screen inventory and compare it to the 16 visual target panels.

**Exit gate:** Deliverable: verified route map and feature/state checklist. Gate: every proposed screen is tagged “exists”, “state of an existing page”, “does not exist” or “needs product decision”.

### Phase 1 — Design tokens and shared shell

Implement tokens, typography, focus treatment, buttons, fields, badges, cards, alerts, tables, pagination, dialogs and responsive app shells. Create component variants and states before applying them screen by screen.

**Exit gate:** Deliverable: approved shared component catalogue close to panel 16. Gate: reusable styles can be applied without altering data/business logic.

### Phase 2 — Critical candidate exam path

Restyle Instructions & Entry, Active Examination, Question Navigator, Submission Confirmation and Completion. Prioritize question readability, timer, save status and action hierarchy.

**Exit gate:** Deliverable: complete candidate exam journey. Gate: regression suite proves timer, autosave, recording, navigation and submission behavior is unchanged.

### Phase 3 — Candidate discovery and account views

Apply the system to Candidate Dashboard and the mobile dashboard pattern; verify any profile/results views that exist before redesigning them.

**Exit gate:** Deliverable: responsive candidate entry point with real exam state and usable mobile navigation.

### Phase 4 — Admin operations

Restyle Admin Dashboard, Exam Management, Question Bank, Candidate/User Management, Results & Reports, Recording & Monitoring and Settings only where the modules actually exist.

**Exit gate:** Deliverable: consistent admin workflows, filters and table patterns with permission-aware actions.

### Phase 5 — Cross-screen verification

Run visual comparison against the collage, keyboard and screen-reader checks, responsive checks, API failure tests, role-permission checks and full exam workflow regression.

**Exit gate:** Deliverable: sign-off checklist with screenshots at 1440 px, 1024 px, 768 px, 390 px and 320 px widths where applicable.

## Global acceptance checklist

- [ ] Visual consistency: same canvas, card, typography, button, form, table and status styles across every implemented page.
- [ ] Light theme only: no dark-mode treatment; use navy for text and brand accents, white/near-white surfaces and restrained pastel blue backgrounds.
- [ ] Behavioral fidelity: routes, API contracts, authentication, permissions, database behavior and current feature semantics remain intact.
- [ ] Exam integrity: timer source, auto-submit threshold, autosave cadence, answer payload, recording pipeline and submission endpoint are unchanged and regression-tested.
- [ ] Honest UI state: no hard-coded success, fake KPI, fake score, fake warning, fake recording status or invented available action.
- [ ] Accessibility: keyboard operability; visible focus; semantic labels; error announcements; contrast review; touch targets; no color-only status meaning.
- [ ] Responsive: no clipped content or hidden core actions on desktop, tablet and mobile; table overflow behavior is intentional.
- [ ] Failure handling: loading, empty, no-results, validation, API failure, permission denied and retry paths are considered for each relevant page.
- [ ] Visual regression: before/after screenshots exist at representative sizes and all critical differences are intentional.
- [ ] Approval gate: no implementation starts until route/feature mapping is verified against the actual source and this plan is approved.

## Verify in the codebase before implementation

- Which panels are existing routes versus states/responsive variants?
- Canonical routes, role access and redirects for each role.
- Available API fields for metrics, results release state, warning events and recordings.
- Existing components, styling and libraries to reuse.
- Supported browsers, project constraints and test commands.

> Final note: this specification captures the visual direction and compositions in the concept collage while leaving unverified technical facts open until the repository is inspected. The goal is a close visual match without regressing existing ExamRobo behavior.
