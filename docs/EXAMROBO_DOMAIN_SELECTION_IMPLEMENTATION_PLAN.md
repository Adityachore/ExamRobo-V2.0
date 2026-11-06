# ExamRobo — Student-Selected Technical Domains

**Document type:** Implementation plan  
**Status:** Proposed; repository audit required before coding  
**Primary requirement:** Aptitude questions are common to every student. Technical questions depend on one or more domains the student selects before starting the exam.

> **Historical plan (pre-v1.5).** Domain selection is implemented. Current
> behavior is in `Brain/Flow.md`, `Brain/Schema.md` and `Brain/PRD.md`.

## 1. Goal and expected behaviour

A student taking a domain-aware exam must be able to select one technical domain or multiple technical domains before the exam timer starts. The exam then contains:

- **Aptitude:** common questions for all students, included once regardless of the number of selected domains.
- **Technical:** questions drawn only from the selected domain(s).
- **Results:** an overall result plus aptitude and per-domain breakdowns where the current result architecture allows it.

Domain names must come from ExamRobo's configured question bank/exam setup, not from a hardcoded list in the student UI.

## 2. Important rules

1. A domain-aware exam defines which technical domains are available to candidates.
2. A student must select at least one domain and may select multiple domains, subject to the exam's configured limits.
3. Aptitude is a shared section. Selecting three technical domains must not duplicate the common aptitude set three times.
4. The chosen domain IDs are validated by the backend against the exam's allowed-domain configuration.
5. The selected domains and assembled question list are saved against the exam attempt when the attempt starts.
6. Once an attempt is `IN_PROGRESS`, its selected domains and question list are locked. Refreshing or resuming the attempt must not regenerate the paper or change the domains.
7. The timer starts only after the server successfully creates the attempt and its question list.
8. The UI must show the selected domains, estimated question count, and exam duration before the student confirms Start Exam.
9. Existing exams that do not use domain selection must continue to work as they do today.
10. Do not expose correct answers or solution fields in student-facing question APIs before submission/review is permitted by the existing exam rules.

## 3. Phase 0 — Audit the actual existing flow before changing code

No implementation should begin by assuming routes, table names, or component names. First inspect the repository and document the current implementation.

### 3.1 Trace the student journey

Find and record the actual files/functions for:

1. Student login/session and exam listing or assigned-exam screen.
2. Exam instruction/details screen and the current Start Exam action.
3. Attempt creation and the point where the timer starts.
4. Question retrieval, question ordering, option shuffling, and question navigation.
5. Answer save/autosave, reconnect/refresh, and resume behaviour.
6. Submit/auto-submit, scoring, result calculation, and result display.

### 3.2 Trace the admin/question-bank journey

Inspect the existing admin screens, APIs, database models, migrations, imports, and seeds for:

- Creating/editing an exam and configuring duration, number of questions, marks, negative marks, and question sources.
- Creating/importing questions and assigning their current subject/category/topic metadata.
- Activating, archiving, or deleting questions.
- Managing exam-to-question relationships or random question selection.
- Roles/permissions that restrict exam and question-bank changes.

### 3.3 Produce an audit table

Before coding, document:

| Area | What to record |
|---|---|
| Student UI | Existing screens, components, route transitions, and start action |
| Backend | Existing routes/controllers/services used for exam and attempt operations |
| Data model | Tables/models for exams, questions, options, attempts, answers, and results |
| Question tagging | Whether section/domain/subject fields already exist and their meanings |
| Timer and resume | Where start time/end time are stored and how remaining time is computed |
| Scoring | Current scoring path and any section-level score support |
| Compatibility | How existing exams without domain selection are represented |
| Risks | Missing metadata, hardcoded lists, direct question queries, or frontend-only validation |

Use the project's existing conventions and extend existing abstractions where possible. Avoid creating parallel exam/attempt/question systems.

**Available reference only:** An ExamRobo test-interface mockup shows an Aptitude question label, a question navigator, saved/recording status, and a timer. Treat this as a UI reference, not proof of the current runtime implementation. No ExamRobo source repository was available during preparation of this plan, so exact file paths and endpoint names must come from the audit.

## 4. Proposed student flow

1. **Open exam:** Student opens an assigned/available exam and reads its instructions.
2. **Choose technical domains:** For domain-aware exams, show a domain-selection step before the timer begins. Display available domains as accessible selectable cards or checkboxes. Clearly mark Aptitude as a common section that is automatically included and is not a technical-domain choice.
3. **Show test composition:** As the student selects domains, update the expected technical sections, total question count, and duration according to the exam's configured rules.
4. **Validate selection:** Disable continuation until the minimum selection is met; enforce the maximum, if configured. Explain unavailable domains instead of silently accepting them.
5. **Review and confirm:** Show Aptitude + selected domains, question count/section breakdown, duration, and any rules about whether selection can be changed.
6. **Start attempt:** Student confirms Start Exam. The backend validates selection, creates the attempt, assembles and persists the question list, and records the start time consistently. Only then should the exam UI and timer begin.
7. **Take exam:** Preserve current navigation, timer, answer-save, and submission features. Show the current section/domain label on each question if the existing UI supports it.
8. **Resume:** Reopen the same attempt with the same domains and exact question order. Do not ask the student to select domains again after an attempt has started.
9. **Submit/results:** Calculate the overall result using existing scoring rules and add aptitude and per-domain breakdowns if supported by the agreed scoring model.

For exams that do not require selection, skip the domain-selection step and use the existing flow.

## 5. Question and domain model

Use existing fields if they already represent these concepts correctly. Do not add duplicate columns/tables just to match the names below.

### 5.1 Question classification

Each question needs reliable classification equivalent to:

- `section_type`: `APTITUDE` or `TECHNICAL`.
- `domain_id`: null/not applicable for common Aptitude questions; required for Technical questions.
- Existing fields for question text, options, correct answer, marks, negative marks, difficulty, active status, and explanation/solution should remain authoritative.

Examples:

| Section type | Domain | Used for |
|---|---|---|
| `APTITUDE` | None | Common aptitude pool for every eligible student |
| `TECHNICAL` | `AI_ML` | AI/ML-selected attempts |
| `TECHNICAL` | `WEB_DEVELOPMENT` | Web Development-selected attempts |
| `TECHNICAL` | `JAVA` | Java-selected attempts |

The domains above are examples only. The actual options must be derived from existing data and/or admin configuration.

### 5.2 Domain registry

If the current application does not already have an equivalent, use a managed domain record with fields such as:

- Stable ID/slug, display name, description, active status, display order.
- Optional icon/label for UI presentation.

Questions should reference stable domain IDs, not display names. Renaming a domain should not break existing attempts.

### 5.3 Exam domain rules

For each domain-aware exam, configure:

- Whether student domain selection is enabled.
- Allowed technical domains.
- Minimum and maximum selectable domains.
- Aptitude question count/rules.
- Technical question-count strategy and per-domain counts.
- Difficulty distribution, marks, negative marks, and duration policy, using the current exam configuration conventions.

**Question-count strategy decision:** The implementation must establish the exam's policy rather than infer it from the number selected. Recommended first option for domain exploration: keep Aptitude fixed and take a configured number of Technical questions from each selected domain. The total question count then increases with selected domains, and the UI shows this before start. If candidates must complete comparable-length exams, use a fixed technical total distributed across the selected domains instead. Do not silently mix these policies; store the chosen policy in exam configuration and test it.

### 5.4 Attempt snapshot

Persist the selected domains with the attempt and persist the questions allocated to that attempt, including ordering and any values needed for reproducible scoring. Follow the existing schema if it already provides equivalent attempt-question snapshots.

This is essential so an admin editing a question bank later cannot change a student's in-progress exam or historical result.

## 6. Question selection and validation logic

When the student starts the attempt, the backend should:

1. Confirm the student is authorized to take the exam and that the exam is open/available.
2. Validate that every submitted domain belongs to the exam's allowed set, is active, and is not duplicated.
3. Enforce the configured minimum/maximum selection count.
4. Verify that enough active Aptitude questions exist for the configured common section.
5. Verify that enough eligible Technical questions exist for every selected domain and the configured difficulty/count rules.
6. If any pool is insufficient, return a clear validation error and do not create a partially started attempt.
7. Select the questions using the project's existing randomization/difficulty rules, without duplicate questions in the same attempt.
8. Persist selected domains, the allocated question IDs/order, marks/rules needed for scoring, and start time as one consistent operation/transaction where supported by the stack.
9. Return only the data the student UI needs; keep answer keys server-side.

A selection or question-pool error must leave the student on the pre-exam setup screen with a useful message. It must not start the timer or consume an attempt unintentionally.

## 7. Admin and question-bank work

Add to the existing admin workflow rather than creating a separate admin module:

- Domain assignment during question creation/edit/import.
- Validation that Technical questions have a valid active domain.
- Validation that common Aptitude questions are classified as Aptitude and are not accidentally assigned to a technical domain unless the current model specifically requires it.
- Exam configuration for allowed domains and selection limits.
- Question quota/policy settings needed to calculate the paper.
- A validation/warning before publishing an exam if its question bank cannot satisfy the configured counts or difficulty distribution.
- Filters by section and domain in the question bank so admins can audit content coverage.

For existing questions with incomplete or ambiguous classification, create a review/mapping step. Do not guess a domain based only on question text and do not silently classify unknown questions as Aptitude.

## 8. Backend/API changes

During the repository audit, map the following logical operations to existing routes/services. Reuse existing endpoints when appropriate; the names here are conceptual, not prescribed endpoint names.

- Retrieve exam configuration and domains available to the student.
- Validate a domain selection and return a composition preview (counts/duration), if the current architecture supports a preview request.
- Start an attempt with `exam_id` and selected domain IDs.
- Retrieve the persisted attempt and allocated questions on resume.
- Save answers and submit through the current mechanisms.
- Return overall and section/domain result summaries where allowed.

All eligibility, selection validation, question filtering, timing, and scoring rules must be enforced server-side. Frontend validation is for usability, not security. Avoid sending correct answers in question-list responses. Use the project's existing API response/error conventions and authorization middleware.

## 9. UI requirements

### Domain selection screen

- Clear title such as **Choose your technical domain(s)**.
- A fixed explanatory row: **Aptitude is included in every exam.**
- Selectable domain cards/checkboxes with domain name and description from configuration.
- Single-select and multi-select must both work naturally; use checkboxes rather than radio controls when multiple selection is enabled.
- Show selected count and min/max selection requirements.
- Live summary of section/question counts and duration.
- Clear empty/loading/error states when domain configuration or question availability cannot be loaded.
- A confirmation step before the timer starts.
- Keyboard access, visible focus states, readable error messages, and responsive layouts.

### Active exam screen

Keep existing exam navigation, timer, save state, recording/proctoring indicators, and submission behaviour intact. Add or preserve the current question's section/domain label. Do not redesign unrelated parts as part of this functional change unless necessary for the domain selector to fit the current design system.

## 10. Scoring and results

- Preserve the current mark and negative-mark rules.
- Include Aptitude only once in the total.
- Attribute each Technical answer to the selected domain for per-domain results.
- Show overall score and, where enabled, Aptitude score plus each selected domain's score/accuracy.
- Define how total score is interpreted when students select different numbers of domains. If total question count differs, percentage and per-section results are more comparable than raw marks alone. Do not introduce a new ranking/comparison formula without product approval.
- Store enough attempt-time information to reproduce the result after question-bank edits.

## 11. Compatibility, migration, and release safety

1. Add migrations using the repository's existing migration pattern; avoid destructive changes.
2. Backfill classification only when existing metadata provides a reliable mapping. Generate a review report for unknown/unmapped questions.
3. Keep old exams working by treating domain selection as disabled unless explicitly configured, or by using the existing exam configuration's equivalent flag.
4. Ensure existing attempts/results remain readable after the migration.
5. Do not rebuild the attempt flow separately. Extend the current one.
6. If the project uses feature flags or staged release settings, release domain selection behind the existing mechanism; otherwise use a per-exam enable/disable setting.
7. Include a rollback path for schema and configuration changes.

## 12. Implementation phases

### Phase 1 — Repository audit and design confirmation

Deliver the actual file/route/schema map, current flow diagram, classification coverage report, and a list of exact files likely to change. Confirm how current timers, autosave, randomization, and scoring work.

### Phase 2 — Data model and question classification

Add or reuse domain/section metadata and exam domain rules. Prepare safe migrations and identify questions requiring manual classification. Add validations to question create/import/update paths.

### Phase 3 — Admin configuration

Allow admins to define allowed domains, selection limits, question-count strategy, and any duration policy. Add a publish-time question-pool validation.

### Phase 4 — Pre-exam domain selection

Implement domain selection, summary preview, client-side usability checks, and start confirmation. Keep timer stopped until the backend confirms attempt creation.

### Phase 5 — Attempt assembly and persistence

Implement server-side domain validation, question-pool checks, common Aptitude assembly, selected-domain Technical assembly, and persisted attempt-question ordering. Ensure refresh/resume reuses the stored paper.

### Phase 6 — Results and reporting

Add domain breakdowns without breaking existing overall results. Confirm handling of variable question totals and historical attempts.

### Phase 7 — Testing and controlled rollout

Run tests against both new domain-aware exams and legacy exams. Enable the feature first for a test exam, verify real question coverage and timing, then roll it out to other eligible exams.

## 13. Test and acceptance checklist

The feature is ready only when the following cases pass:

- [ ] Aptitude questions are included for every domain-aware attempt exactly once.
- [ ] One selected domain returns Technical questions only from that domain.
- [ ] Multiple selected domains return Technical questions from every selected domain and none from unselected domains.
- [ ] Duplicate, inactive, or exam-disallowed domain IDs are rejected by the backend.
- [ ] Empty selection and over-limit selection cannot start an exam.
- [ ] Insufficient Aptitude or per-domain questions are detected before the timer starts.
- [ ] The displayed counts/duration match the actual persisted paper.
- [ ] Attempt start time is recorded only after successful attempt creation.
- [ ] Refresh, reconnect, and resume preserve the selected domains, question order, answers, and remaining time.
- [ ] The student cannot change domains after the attempt has started.
- [ ] Repeated start requests do not accidentally create duplicate active attempts where the existing rules prohibit that.
- [ ] Correct answers are not exposed in pre-submission student responses.
- [ ] Scoring includes Aptitude once and reports Technical sections/domains correctly.
- [ ] Existing exams without domain selection still follow the previous flow.
- [ ] Existing attempts and results remain readable after migration.
- [ ] Question imports/edits enforce valid section/domain classification.
- [ ] Mobile/responsive, keyboard, loading, and failure states are usable.

## 14. Decisions to confirm before implementation

These decisions should be taken from current product rules or confirmed with the product owner; do not invent them in code:

1. **Domain list:** Which technical domains exist now, and who maintains them?
2. **Question allocation:** Fixed number of Technical questions per selected domain, or a fixed overall Technical total split across chosen domains? Recommended: make one explicit exam-level policy.
3. **Duration:** Fixed duration for all choices, or duration that scales with selected domains/question count? Display the resulting duration before Start Exam.
4. **Selection limits:** Is there a minimum/maximum number of domains, and must every exam allow multi-select?
5. **Domain scoring:** Should results show per-domain marks/accuracy only, or affect the overall score/ranking in a specific way?
6. **Post-start changes:** Recommended rule is that domains cannot be changed after the attempt begins.

Where a decision is still open, implement a small, explicit configuration rather than hardcoding it across frontend and backend.

## 15. Implementation guardrails for the coding agent

- Inspect the actual repository before editing and report the current flow and file map.
- Follow the project's framework, naming, API, database, migration, validation, and test conventions.
- Reuse existing exam, question, attempt, answer, and result services where possible.
- Do not rename or replace unrelated modules.
- Do not seed fake/live-looking exam questions or hardcode domain names in production logic.
- Do not start the timer before the server has successfully created a valid attempt.
- Do not regenerate a paper on refresh/resume.
- Add automated tests for server-side selection, question composition, timer/start handling, scoring, and legacy compatibility.
- After implementation, report the changed files, migrations, tests executed, remaining decisions, and any cases that could not be verified.
