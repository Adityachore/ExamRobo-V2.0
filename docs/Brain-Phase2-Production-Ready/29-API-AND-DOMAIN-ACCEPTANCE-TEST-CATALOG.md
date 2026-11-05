# API and Domain Acceptance Test Catalog

## 1. Identity and authorization

| ID | Scenario | Expected |
|---|---|---|
| AUTH-001 | Valid staff login | Principal resolved, no tenant data before membership selection |
| AUTH-002 | Identifier unknown | Generic response; no account enumeration |
| AUTH-003 | Same staff principal has two approved memberships | User may select only listed membership |
| AUTH-004 | Student and staff identifiers collide | Migration/auth policy blocks ambiguity; no arbitrary first match |
| AUTH-005 | Disabled staff refreshes old token | Session rejected |
| AUTH-006 | Role changed while session active | Old claims cannot retain prior permission |
| AUTH-007 | Institution suspended during session | Tenant access denied immediately per approved revocation SLO |
| AUTH-008 | Refresh token replayed | Token family revoked and security event recorded |
| AUTH-009 | Password reset | Prior sessions revoked |
| AUTH-010 | Logout | Current session rejected on subsequent request |

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

- Two concurrent staff creates at one remaining slot: exactly one succeeds.
- Employee cannot create/disable staff or change own permission scope.
- Employee permissions come from server-side role matrix, never submitted role field.
- Concurrent student imports cannot exceed approved caps.
- Duplicate roster rows follow explicit update/skip/conflict policy.
- Student disablement revokes any supported current auth session.

## 5. Subscription and billing

- Invalid state and invalid period rejected at DB level.
- Active periods cannot overlap under concurrent transactions.
- Scheduled period activates at exact prior period end without an expired gap.
- Duplicate and out-of-order webhook produces one financial effect.
- Amount, currency, order, invoice and tenant mismatch cannot activate.
- Browser success redirect without verified provider event does not activate.
- Failed, pending, refunded, chargeback and disputed payment have distinct transitions.
- Plan upgrade/downgrade uses approved effective-time rule.
- Plan price/limit changes do not mutate existing invoice/subscription snapshots.
- Usage counters and live counts reconcile under concurrency.

## 6. Background jobs

- Two workers cannot claim one lease at the same time.
- Worker crash causes lease expiry and safe re-claim.
- Late old worker cannot commit after losing lease.
- Handler retries do not duplicate business effects.
- Retry cap moves job to dead letter with redacted diagnostic.
- Replay requires authorized operator, reason and idempotency protection.
- Queue/outbox failure does not mark user-visible notification as delivered.

## 7. Privacy and recovery

- Access/export request returns only verified subject's allowed data.
- Erasure request verified, categorized, approved and idempotent.
- Request ledger survives restore of pre-request database backup.
- Restore remains quarantined until tombstone replay and verification pass.
- Deletion/anonymisation covers database, search indexes, Redis, object storage, exports, logs and backups according to approved policy.
- Legal hold blocks only categories legally required; all exceptions audited and time-bounded.

## 8. v1.5 compatibility

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

## 9. Evidence format

Each test artifact includes test ID, commit SHA, environment/DB version, command, fixture ID, start time, outcome, logs/report link, known flaky status and reviewer. Redact secrets and student PII.
