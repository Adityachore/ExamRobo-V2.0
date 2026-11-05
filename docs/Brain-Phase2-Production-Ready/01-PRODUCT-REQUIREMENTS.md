# Product Requirements — Phase 2 SaaS

**Requirement range:** R-100–R-137.  
**Priority:** P0 = mandatory for v2.0.0; P1 = expected if capacity permits; P2 = deferred.

## 1. Personas and permission boundaries

| Capability | Super Admin | Admin | Employee | Student |
|---|---|---|---|---|
| Approve/reject/suspend/archive institutions | Yes | No | No | No |
| Manage plan catalogue and platform billing rules | Yes | No | No | No |
| Global KPIs and revenue totals | Yes, aggregate/minimized | No | No | No |
| Read institution profile and users | Scoped platform operation, audited | Own institution | No | No |
| Manage institution profile/branding | Scoped platform operation, audited | Own institution | No | No |
| Manage employees | Scoped platform operation, audited | Own institution | No | No |
| Billing and invoices | Platform finance operations | Own institution | No | No |
| Manage students and rosters | Scoped platform operation, audited | Own institution | Own institution | No |
| Create/manage events | Scoped platform operation, audited | Own institution | Own institution | No |
| Live monitoring / force submit / lock | Explicit support grant, audited | Own institution | Own institution | No |
| Results / analytics / CSV | Aggregate or scoped support only | Own institution | Own institution | Own results only |
| Question bank | Scoped support only | Own institution | Own institution | No |
| Take exam | No | No | No | Yes |

Employees have a fixed permission set in v2.0.0. Platform-wide access must not be implemented as a general RLS bypass.

## 2. Requirements

### R-100 — Tenant isolation (P0)
Every tenant row belongs to exactly one institution. Service authorization, tenant-scoped database access, RLS, composite foreign keys and tenant-scoped indexes must agree. A foreign tenant identifier returns 404 without confirming existence. Isolation applies to APIs, direct SQL, exports, WebSockets, Redis, object storage, background jobs and search/cache keys.

**Acceptance:** the full two-tenant negative test suite passes for every registered tenant table and every data egress path.

### R-101 — Roles (P0)
Roles are `super_admin`, `admin`, `employee` and `student`. `super_admin` has no institution membership. Platform operators use explicit platform functions; tenant requests always execute under one institution context. Role mismatch preserves the existing 401 behavior unless an approved API compatibility decision changes it.

### R-102 — Common login (P0)
One common login entry point preserves the existing student login flow and staff password login. The identity lookup must resolve exactly one principal or fail closed. Login responses must not disclose whether an email exists. Password and OTP paths are rate-limited.

### R-103 — Student roster identity (P0)
Students are created/managed by institution staff; no student self-registration. Existing product rule: `students.email` is globally unique and has one owning institution; `roster_emails` and `papers` retain per-event uniqueness. Migration must preflight duplicates and shared-family-email cases. No automatic winner is selected. School onboarding is blocked until the owner confirms that unique individual student email is operationally acceptable or approves an alternate student identifier flow.

### R-104 — Plan catalogue (P0)
Plans are database records. Price and limits are snapshotted at invoice/period creation. A plan edit applies to future periods unless an explicit contract amendment says otherwise.

### R-105 — Subscription and entitlement lifecycle (P0)
One non-overlapping subscription timeline per institution. Trial starts on approval and lasts seven days. Paid periods use approved plan durations. Early renewal creates a scheduled successor period. All writes serialize on the institution row and are protected by database constraints. An entitlement reconciler is the only writer of the current entitlement projection. Administrative suspension/archive state is independent from subscription entitlement.

### R-106 — Limit enforcement (P0)
Event creation, roster size and employee headcount are enforced server-side and atomically. Event count is per period and archived events do not refund it. Staff is a live headcount; disabled employees do not count. At a limit, return `402 plan_limit`; do not delete data or interrupt a running examination.

### R-107 — Institution registration (P0)
Public registration captures institution identity, type, address, institution code, official email, contacts, optional GSTIN/logo and terms/privacy acceptance. Input is validated server-side and stored as an unapproved request.

### R-108 — OTP verification (P0)
Email and SMS OTPs are stored as keyed digests, expire after the approved TTL, have bounded attempts and are rate-limited by target, IP and request. OTP consumption is atomic and single-use.

### R-109 — Trial-abuse prevention (P0)
Duplicate institution code, official email, phone, normalized name and approved fraud signals are evaluated. Public responses are generic; detailed signals are visible only to authorized reviewers. Hashing/fingerprint retention requires legal approval and a documented false-positive/appeal path.

### R-110 — Registration approval (P0)
A registration requires Super Admin approval. Outcomes are approve, reject with reason or request more information. Trial starts at approval, not registration. Approval is an idempotent transaction that creates institution, primary Admin, identity records, trial period, entitlement and notification outbox event.

### R-111 — Super Admin creates institution (P0)
A scoped, audited flow creates an institution using the same validation and uniqueness rules as public registration. Credential setup uses a one-time invite; never email a password.

### R-112 — Super Admin dashboard (P0)
Show institution counts, pending registrations, student/exam volume, live exam count, expiry alerts, payment alerts and MRR. Default dashboards use aggregate/minimized data, not student answer or proctor telemetry.

### R-113 — Institution management (P0)
Search/filter and scoped institution details, plan/billing, usage, users, exams summary, settings and activity. Suspend, reinstate, archive, extend trial and change plan require reason and audit event.

### R-114 — Plan management (P0)
Super Admin can manage plan terms, limits and features. Changes warn about affected institutions and do not mutate already-issued invoices or period snapshots.

### R-115 — Revenue and invoices (P0)
Show invoice status, totals, GST breakdown, place of supply and provider reconciliation. Invoice and payment records are append-oriented; corrections use credit note/refund/adjustment records according to CA-approved policy rather than rewriting paid invoices.

### R-116 — Payment integration (P0)
Server calculates amount. Provider signature is verified over raw request bytes. A webhook event is durably recorded before acknowledging success. Duplicate, delayed and reordered events are idempotent. Subscription activation occurs only after provider state and invoice amount/currency match.

### R-117 — Growth analytics (P1)
Track institution growth/churn, trial conversion, ARPC, student/exam volume, plan movement, retention and state distribution. Aggregation must not expose tenant personal data.

### R-118 — Admin onboarding and employees (P0)
First login forces password setup/change and profile completion. Admin can create/disable/re-enable employees subject to limits. All credential and role changes increment session version.

### R-119 — Employee scope (P0)
Employees receive only the fixed role-matrix capabilities. Billing, institution configuration and staff administration are denied server-side, not merely hidden in the UI.

### R-120 — Per-institution question bank (P0)
Question bank data is tenant-owned. Skills taxonomy remains global read-only reference data. Existing bank is assigned to the legacy/default institution. Cross-college sharing is out of scope.

### R-121 — Tenant branding (P1)
Institution name/logo appears on approved student login, waiting-room and result surfaces. ExamRobo brand remains identifiable. Uploaded files are validated, scanned and stored with tenant-scoped object keys.

### R-122 — Audit log (P0)
Every privileged mutation records actor, role, tenant, target, reason, request ID, timestamp and safe metadata. Audit rows are append-only to runtime roles. Platform-global actions use a separate restricted platform audit stream.

### R-123 — Notifications (P0)
Transactional email and approved SMS use durable outbox delivery with retries, idempotency, dead-letter handling and provider delivery telemetry. No external network call occurs inside the business transaction.

### R-124 — Premium mobile app flag (P2)
Feature flag only; no mobile app implementation.

### R-125 — Elite licensing (P2)
Contract metadata only; no client-hosted installer or offline licensing engine.

### R-126 — Retention and archive (P0)
Expired institutions become read-only according to the approved policy; existing running exams complete; no new attempts start after entitlement expiry. Archive is not automatically equivalent to erasure. Legal retention and privacy requests override generic no-hard-delete rules where required.

### R-127 — Isolation test gate (P0)
Automated tests cover reads, writes, counts, joins, IDOR, CSV/PDF exports, WebSockets, Redis, object storage, background jobs and direct SQL under forced RLS. New tenant tables without classification fail CI.

### R-128 — Session validity and revocation (P0)
Every protected request validates current identity status, role, session version, membership and institution access state. WebSocket tickets are single-use and bound to identity, tenant and session version. Disablement, role/password change, suspension and archive revoke access within the approved revocation SLO.

### R-129 — Reliable background jobs (P0)
Workers use atomic claiming, leases, heartbeats, retries, idempotency keys, dead-letter storage and audited replay. The system supports at-least-once execution with effectively-once business effects; it does not claim general exactly-once delivery.

### R-130 — Data lifecycle and privacy (P0)
Data inventory, legal roles, notices, retention, access export, correction, anonymisation/deletion, school/minor handling, breach process, backup retention and restore replay are approved by counsel before production student data is onboarded.

### R-131 — v1.5.0 compatibility (P0)
Actual source and database are inventoried. Golden API/behavior tests, migration rehearsal, row/relationship reconciliation and exam-day regression tests pass on the new release.

### R-132 — Subscription integrity (P0)
Every institution has one non-overlapping valid timeline. DB constraints reject invalid status and invalid ranges. One row-lock protocol serializes all subscription mutations. Entitlement projection is derived only by the reconciler.

### R-133 — Deterministic login identity (P0)
One normalized login identifier resolves to exactly one principal and authentication path in v2.0.0. Global email collisions across students/staff/Super Admins are detected before migration. No arbitrary account winner is selected. If multiple memberships are required, the product must approve a separate principal-membership and context-selection design.

### R-134 — Unforgeable tenant database context (P0)
RLS policies must not trust a plain, user-settable `app.iid` or `app.role` variable. A reviewed signed context mechanism or an equally strong alternative binds tenant, subject, role, session version, auth epoch and short expiry to each tenant transaction. Missing/invalid context fails closed.

### R-135 — Tenant-consistent relationships (P0)
Tenant child rows cannot reference parent rows from another institution. Composite foreign keys or equivalent DB-enforced constraints bind `(institution_id, parent_id)` pairs. Triggers may populate a missing tenant ID but must reject mismatch.

### R-136 — Privacy recovery tombstones (P0)
Accepted erasure/anonymisation instructions are stored in a durable, separately protected ledger that survives restoring an older application database backup. Restore remains quarantined until applicable instructions are replayed and verified.

### R-137 — Safe rollback and recovery (P0)
Release rollback cannot silently discard post-cutover SaaS writes. Application rollback, feature rollback and disaster recovery are separate procedures with explicit data-loss/RPO rules. v1.5.0 can only be redeployed against the new database if a tested compatibility path exists.

## 3. Denied rules

- No tenant ID accepted from ordinary request body/query for tenant identity.
- No broad `OR role='super_admin'` RLS policy.
- No runtime app or worker role with `BYPASSRLS`.
- No tenant access through a plain `SET app.iid` value.
- No fallback of unresolved support tickets to the default institution.
- No payment activation from browser success callback alone.
- No price/amount trusted from browser.
- No service-only invariant where DB can enforce it.
- No external network call inside a database transaction.
- No production use of unapproved GST, refund, SMS, email, Razorpay or legal assumptions.
- No hard-coded claim that a privacy request is complete until all relevant stores/backups are covered.
