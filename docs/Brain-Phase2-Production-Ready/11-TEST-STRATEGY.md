# Test Strategy and Evidence Standard

## 1. Evidence rule

A test is considered passing only when the evidence identifies commit SHA, environment, database version, test script/version, execution timestamp, result and reviewer. A checklist without a run artifact is not evidence. Mocks prove adapter behavior, not provider integration or database isolation.

## 2. Test layers

| Layer | Purpose | Required checks |
|---|---|---|
| Static/lint | Prevent forbidden patterns | No direct tenant SQL outside approved repository; no `qs()` in request module; no raw `institution_id` trust; no secrets/logging; table classification |
| Unit | Pure business rules | Plan limits, GST math, identity normalization, state machine, retry/backoff |
| DB integration | PostgreSQL semantics | Forced RLS, roles, signed context, constraints, transaction rollback, concurrency |
| API integration | Route authorization | Tenant A/B, role matrix, error contracts, idempotency |
| WebSocket/Redis | Realtime isolation | Ticket scope, room scope, message filtering, revocation, reconnect |
| Worker integration | Recovery | Lease, worker crash, retries, DLQ, duplicate events |
| Privacy/recovery | Restore correctness | Older backup + tombstone replay + quarantine |
| Compatibility | Preserve v1.5.0 | Golden route, exam and data comparison |
| Performance | Capacity | 20/50/1,000 VU profiles and soak tests |
| Security review | Adversarial behavior | IDOR, SQL injection assumptions, RLS context forgery, role abuse, enumeration, uploads |
| Browser QA | Actual usability | All portals, viewport matrix, keyboard and error states |

## 3. Two-tenant isolation matrix

Create two institutions A and B with separate admins, employees, students, events, questions, papers, answers, invoices and files. For every operation, authenticate as A and try to access B by UUID, event key, export ID, filename, socket room, Redis key, filter, pagination cursor and guessed reference.

Expected result: no B data, no B counts, no B existence signal, no mutation. Test the reverse direction and unauthenticated/system roles as well.

## 4. Direct SQL/RLS test matrix

Execute as each DB role (app, auth function, context function, billing function, worker, platform function, migrator/table owner) and assert:

- app with no context sees zero tenant rows or fails closed;
- forged/unsigned GUC is ignored;
- malformed, tampered, expired and wrong-key signed contexts fail;
- valid A context sees A only;
- valid B context sees B only;
- inserts/updates with wrong institution are rejected by `WITH CHECK` and composite FKs;
- child row cannot reference parent of another tenant;
- app cannot TRUNCATE, CREATE, ALTER, change policies or read private key;
- auth function can resolve login without tenant context but cannot read tenant tables;
- worker can claim job rows but cannot scan tenant business tables;
- Super Admin has no broad table bypass;
- migration owner is inaccessible to normal runtime connections;
- pooled connection reuse does not leak previous context.

## 5. Concurrency tests

Use multiple database connections and true concurrent transactions, not sequential mocked calls.

- Two tenant staff inserts at last available staff slot.
- Two roster imports at last available event capacity.
- Two event creations at last event quota.
- Two subscription activations with different invoices/plans for one institution.
- Renewal at exact expiry boundary while sweeper runs.
- Duplicate webhook worker claims.
- Outbox lease expiry while original worker returns late.
- Data request double-submission and restore replay.
- Concurrent plan edit and subscription creation.

Assert final DB state and absence of duplicate external side effects.

## 6. Authentication tests

- Staff/student/platform principal identification.
- Email collisions block migration or use approved membership disambiguation.
- Unknown email has generic response.
- Rate limits by email/IP/target.
- Bad password/OTP, expired OTP, replayed OTP and lockout.
- Disabled user, password reset, role change, institution suspension/archive.
- Old access and refresh tokens rejected.
- WebSocket closed and ticket cannot be replayed.
- Auth state store unavailable fails closed.

## 7. Subscription/payment tests

- All allowed and forbidden status transitions.
- Constraint negative tests for bad status, null start, nonpositive interval and overlap.
- Trial approval, renewal, upgrade, downgrade, schedule, expiry and cancellation.
- Duplicate, delayed and out-of-order provider events.
- Bad signature, wrong merchant, wrong order, wrong currency and amount mismatch.
- Provider timeout before and after possible acceptance.
- Refund and chargeback policy paths.
- Invoice immutability and credit-note correction.

## 8. Privacy/recovery tests

- Data export tenant/subject scope.
- Legal hold and partial completion.
- Idempotent anonymisation across every inventory location.
- External ledger/database dual-write reconciliation.
- Restore from backup that predates an accepted erasure request.
- Application ingress blocked until tombstone replay.
- Replayed tombstone does not corrupt retained legally required data.

## 9. Test execution and gates

- `npm run verify` includes existing unit/smoke tests plus new DB isolation tests.
- Never reduce the v1.5.0 assertion/test baseline without an approved explanation.
- Scratch database names must end in `_test` or `_smoke`; tests must refuse production-looking connection strings.
- CI must not have production DB, provider live keys or storage write credentials.
- Security suite runs on every pull request touching auth, tenancy, RLS, queries, exports, WebSockets, jobs or storage.
- Full load/restore/penetration tests run at the milestone gates and before production.
- Critical/High failures block merge/release; exceptions require named owner, expiry, compensating control and written approval, and no exception can waive a confirmed cross-tenant exposure.

## 10. Required evidence artifacts

Store immutable CI run links/artifacts for: test summary, SQL role/RLS report, table registry, migration/backfill report, concurrency test output, webhook replay report, privacy restore report, compatibility snapshots, k6 summary, security review, browser QA, backup restore and rollback rehearsal. Link them from the release record.
