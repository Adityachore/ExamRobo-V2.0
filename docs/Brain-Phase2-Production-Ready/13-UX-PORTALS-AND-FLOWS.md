# UX, Portals and End-to-End Flows

## 1. Portal map

| Portal | Main users | Routes/pages |
|---|---|---|
| Public | Applicants, staff/student login | Common login, institution registration, application status, invite/reset |
| Super Admin | ExamRobo platform staff | Dashboard, registrations, institutions, plans, revenue, analytics, settings, audit/alerts |
| Institution Admin | College/school owner | Dashboard, users, students, events, bank, live, results, billing, institution settings, activity |
| Employee | Institution staff | Students, events, bank, live, results, flags/tickets per permission matrix |
| Student | Rostered exam candidate | Existing identify/login, waiting room, exam, submission, own results where allowed |

## 2. Shared UI rules

- Every page shows current institution identity where relevant; never trust a tenant name/logo supplied by the browser.
- Plan/usage strip shows current entitlement state, period dates and remaining limits.
- `402 plan_limit` shows a clear upgrade/limit state without implying data was deleted.
- Expired access clearly distinguishes read-only results from blocked create/start actions.
- Suspended institution, pending approval and archived tenant have separate states and support contact guidance.
- Errors are inline banners/forms, not browser alerts. Preserve accessibility, keyboard focus and screen-reader labels.
- Loading, empty, partial-success, retry and provider-pending states are designed explicitly.
- Do not expose another tenant's name, account existence or record ID in an error.

## 3. Public pages

### Common login

One login entry. Identify response is generic and does not reveal whether an email belongs to staff/student. Staff sees password flow; student follows the existing v1.5 flow. Rate-limit errors are actionable without revealing account state.

### Register institution

Four-step flow: institution → leadership/contact → verification → review status. Show privacy notice and terms before submit. OTPs are masked; resend timer; no plaintext OTP/password stored in browser logs. Registration is pending until Super Admin approval.

### Application status

Use one-time, hashed, expiring status token. Display pending, more-information-requested, approved or rejected. Do not show internal abuse flags or reviewer notes.

### Invite/password setup

One-time expiring token; password rules; token consumed atomically; existing sessions revoked if account recovery/reset.

## 4. Super Admin pages

### Dashboard

Aggregate: total/active/trial/expired/suspended institutions, pending registrations, total students, exams this month, live exam count, MRR, expiry and payment alerts. Avoid direct student answers or proctor data in default view.

### Registrations

Queue with review status, required fields, verification evidence and abuse signals visible only to authorized reviewer. Actions: approve, reject with reason, request more information. Approval confirmation states the Trial start date and sends invite through outbox.

### Institutions

Search/filter by type, state, plan, entitlement and administrative state. Institution detail tabs: overview, plan/billing, usage, users, event summaries, settings, activity. Sensitive support access requires a reason and scope grant.

### Plans

Compare Trial/Standard/Premium/Elite. Edit drawer shows affected active/future institutions. Explicitly state that edits affect future periods only.

### Revenue

Invoice/payment table, mismatch queue, refunds/credit adjustments, monthly/plan summary and CSV. Amounts match invoice snapshots and provider reconciliation.

### Analytics

30/90/365-day/custom. Use aggregate metrics; suppress small-cell data where it could identify a student or institution contact.

## 5. Institution pages

- First login: complete profile, set password, confirm institution details, upload logo, invite first employee.
- Dashboard: existing exam stats plus plan strip, usage bars and upgrade prompt.
- Students: directory, search, status, paste/CSV import, row-level validation results (`added`, `updated`, `conflict`, `invalid`).
- Employees: add/invite, disable/enable, role and cap count; Admin only.
- Events/Live/Results/Flags/Tickets/Bank: existing functionality scoped to own tenant.
- Billing: plan, period, usage, pay/renew/upgrade, invoices, pending payment reconciliation.
- Institution: profile, contact, brand; Admin only.
- Activity: audit entries available to the institution without exposing platform-only metadata.

## 6. Student pages

Preserve v1.5 behavior. Add only institution branding and approved privacy notice. Do not add college selection unless a product decision explicitly changes R-103. If shared family email or identity collisions are found, the user cannot be silently assigned to one student record; block onboarding until the identifier policy is resolved.

## 7. End-to-end workflows

### H1 — Institution registers and is approved

1. Applicant submits registration.
2. Server normalizes/validates fields, rate-limits and records request.
3. Email and phone OTP verification is single-use.
4. Abuse checks produce private reviewer flags and generic public response.
5. Request enters pending queue.
6. Super Admin approves with audit reason.
7. One transaction creates institution, contacts, Admin business row, auth identity, Trial subscription and entitlement.
8. Notification outbox queues invite; applicant can set password with one-time token.

### H2 — Staff manages institution

1. Authenticate and resolve current session state.
2. Verify role and institution.
3. Mint signed database context.
4. Run tenant operation under RLS and tenant-scoped FK.
5. Audit mutation and write outbox intent in same transaction.

### H3 — Roster import

1. Parse and validate input; cap file size/rows.
2. Normalize email/identifier.
3. Detect existing tenant student and cross-tenant/global collision.
4. Enforce event cap under lock.
5. Write roster/student rows with composite tenant FK.
6. Return per-row result without disclosing other tenant existence.

### H4 — Renewal and payment

1. Admin requests order; server calculates amount/tax from approved snapshots.
2. Store invoice/payment/order intent and idempotency key.
3. Call provider outside transaction.
4. Browser checkout result is informational only.
5. Webhook signature is verified; durable inbox row written before 2xx.
6. Worker reconciles provider and local records.
7. Under institution lock, invoice/payment/period/entitlement state updates atomically.

### H5 — Expiry and ongoing exam

1. Entitlement reconciler marks period expired when end boundary passes.
2. Existing live attempts follow approved continuation policy and finish safely.
3. New attempts and create operations are blocked.
4. Results remain readable according to policy.
5. Archive and privacy retention jobs run separately.

### H6 — Support ticket cannot be resolved

Create unassigned system intake; do not put it in the default tenant. Resolve identity and tenant, then attach/audit. A failed match remains unassigned.

### H7 — Restore

Restore in quarantine, replay privacy tombstones, reconcile providers/queues, rebuild caches, verify tenant isolation and obtain sign-off before reopening traffic.

## 8. Responsive/browser QA

Verify 320, 390, tablet, 1280 and large desktop widths; keyboard navigation, focus order, contrast, accessible form errors, table overflow, CSV states, checkout callback states, session expiry, and WebSocket reconnect. Existing student exam UI receives regression-focused testing and must not be visually or behaviorally changed unintentionally.
