# API and Domain Acceptance Test Catalog

## 1. Identity and authorization

| ID | Scenario | Expected |
|---|---|---|
| AUTH-001 | Valid staff login | Principal resolved, no tenant data before membership selection |
| AUTH-002 | Identifier unknown | Generic response; no account enumeration |
| AUTH-003 | Same staff principal attempts a second institution membership | Rejected; one institution per staff principal in v2.0 |
| AUTH-004 | Student and staff identifiers collide | Migration/auth policy blocks ambiguity; no arbitrary first match |
| AUTH-005 | Disabled staff refreshes old token | Session rejected |
| AUTH-006 | Role changed while session active | Old claims cannot retain prior permission |
| AUTH-007 | Institution suspended during session | Tenant access denied immediately per approved revocation SLO |
| AUTH-008 | Refresh token replayed | Token family revoked and security event recorded |
| AUTH-009 | Password reset | Prior sessions revoked |
| AUTH-010 | Logout | Current session rejected on subsequent request |
| AUTH-011 | Institution already has an active Admin; a second Admin invite is created | Rejected; the single Admin slot is already occupied |
| AUTH-012 | Pending Admin invitation exists; another Admin invite is created | Rejected; pending invitation reserves the single Admin slot |
| AUTH-013 | Owner disables the Admin and creates a replacement | Slot is freed; old row remains for audit; new Admin succeeds |
| AUTH-014 | Admin attempts to create/replace another Admin | Denied; only the Owner may manage the Admin |

## 2. Tenant boundary

For every tenant endpoint repeat tests as A, B, Employee and Admin:

- list, detail, count, search, filter and pagination;
- create, update, delete and bulk import;
- export, PDF, signed URL and download;
- event roster, questions, papers, answers, results, proctor events;
- caches, socket rooms and notification delivery.

Expected: a tenant cannot read, mutate, infer counts for or obtain links to another tenant's protected data. Negative tests must use valid IDs belonging to the other tenant, not only malformed IDs.

## 3. Registration

- Rate limit by approved dimensions without trusting forwarded IP headers from untrusted proxies.
- OTP request cooldown and per-identifier/per-IP attempt ceilings.
- Wrong, expired, reused and brute-forced OTP denied.
- Status token stored hashed, rotated and single-use as specified.
- Duplicate application retry is idempotent.
- Approval repeated twice creates one institution, one initial Admin and one trial/period according to approved policy.
- Rejection does not grant access and notifications are outbox-driven.

## 4. Staff and student limits

- Two concurrent employee creates at one remaining seat: exactly one succeeds.
- Pending employee invitations do not consume seats; acceptance checks the cap atomically.
- Disabled employees free their seat immediately; re-enable fails if no seat exists.
- Exactly one Admin; pending Admin invitation reserves the slot; Owner-only Admin management.
- Owner/Admin do not consume employee seats; the absolute 20-staff ceiling still applies.
- Employee cannot create/disable staff or change own permission scope.
- Employee permissions come from server-side role matrix, never submitted role field.
- Concurrent student imports cannot exceed the roster-per-event cap.
- Duplicate roster rows follow explicit update/skip/conflict policy.
- Student disablement revokes any supported current auth session.
- Shared family/guardian student email is rejected; legacy collisions block onboarding until resolved.

## 5. Subscription and billing

- Invalid state and invalid period rejected at DB level.
- Active periods cannot overlap under concurrent transactions.
- Scheduled period activates at exact prior period end without an expired gap.
- Duplicate and out-of-order webhook produces one financial effect.
- Amount, currency, order, invoice and tenant mismatch cannot activate.
- Browser success redirect without verified provider event does not activate.
- Failed, pending, refunded, chargeback and disputed payment have distinct transitions.
- Plan upgrade/downgrade uses approved effective-time rule.
- Standard/Premium are 30-day monthly; annual/proration paths are rejected.
- INR 10,000/20,000 prices and roster/event/employee limits snapshot at period creation.
- The 18% GST placeholder cannot issue a live invoice before CA approval.
- Plan price/limit changes do not mutate existing invoice/subscription snapshots.
- Usage counters and live counts reconcile under concurrency.
- At entitlement expiry, no new attempt starts; a started attempt finishes to its original scheduled end.
- The 15-minute recovery window accepts submission/reconnect only; it grants no extra answer time.
- A paused or disconnected attempt cannot extend its scheduled end; results are read-only after finalization.

## 6. Support access and domains

- Default Super Admin support view returns aggregate/minimized data only.
- Sensitive access without institution approval or approved break-glass is denied.
- Break-glass requires security and product approval, dual control, reason, expiry and audit.
- Support grant expiry/revocation immediately removes access; denied attempts are audited.
- Student answers, recordings/evidence, billing identifiers and exports are unavailable without the full sensitive-access path.
- No impersonation, password retrieval, silent result changes or generic RLS bypass exists.
- Elite subdomain resolves the correct institution for login/branding.
- Trial/Standard/Premium use the shared path and cannot claim the Elite subdomain.
- A forged Host header cannot change tenant authorization.
- Wildcard TLS/cookie scope works across the Elite subdomain without leaking to non-Elite paths.

## 7. Background jobs

- Two workers cannot claim one lease at the same time.
- Worker crash causes lease expiry and safe re-claim.
- Late old worker cannot commit after losing lease.
- Handler retries do not duplicate business effects.
- Retry cap moves job to dead letter with redacted diagnostic.
- Replay requires authorized operator, reason and idempotency protection.
- Queue/outbox failure does not mark user-visible notification as delivered.

## 8. Privacy and recovery

- Access/export request returns only verified subject's allowed data.
- Erasure request verified, categorized, approved and idempotent.
- Request ledger survives restore of pre-request database backup.
- Restore remains quarantined until tombstone replay and verification pass.
- Deletion/anonymisation covers database, search indexes, Redis, object storage, exports, logs and backups according to approved policy.
- Legal hold blocks only categories legally required; all exceptions audited and time-bounded.

## 9. v1.5 compatibility

Golden journeys are captured before code changes and replayed after each major tenantization slice:

- login and student roster resolution;
- admin/employee workflows;
- exam creation and configuration;
- start exam, question delivery, timer, autosave and submission;
- refresh/reconnect and duplicate submit;
- proctoring/warnings/integrity events;
- result calculation and visibility;
- question bank imports/exports;
- analytics and reports.

A regression is not waived because a new SaaS portal works.

## 10. Evidence format

Each test artifact includes test ID, commit SHA, environment/DB version, command, fixture ID, start time, outcome, logs/report link, known flaky status and reviewer. Redact secrets and student PII.
