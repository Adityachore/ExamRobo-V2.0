# G3 - identity and money integrity test cases

- Gate: G3
- Status: **WAITING FOR IMPLEMENTATION FREEZE - DO NOT EXECUTE YET**
- Source: `docs/Brain-Phase2-Production-Ready/03-IDENTITY-AUTH-RLS.md`,
  `05-SUBSCRIPTIONS-BILLING.md`, `07-BACKGROUND-JOBS.md`,
  `29-API-AND-DOMAIN-ACCEPTANCE-TEST-CATALOG.md`
- Evidence target: `../evidence/g3/`
- Protocol: `../GATE-REVIEW-PROTOCOL.md`

G3 cannot start until G2 is approved and identity/billing code is implemented and
frozen. Expand each case with exact endpoint, fixture, provider test-mode setup
and command before execution. No live money, live provider keys or real student
data.

## 1. Case catalog

| Case | Title | Severity | Status |
|---|---|---|---|
| G3-AUTH-001 | Valid staff login resolves principal before tenant data | Critical | WAITING |
| G3-AUTH-002 | Unknown identifier returns a generic response | High | WAITING |
| G3-AUTH-003 | One staff principal cannot join a second institution | Critical | WAITING |
| G3-AUTH-004 | Student/staff identifier collision is blocked | Critical | WAITING |
| G3-AUTH-005 | Disabled staff cannot refresh an old session | Critical | WAITING |
| G3-AUTH-006 | Role change invalidates old claims | Critical | WAITING |
| G3-AUTH-007 | Institution suspension denies access immediately | Critical | WAITING |
| G3-AUTH-008 | Refresh-token replay revokes the family | Critical | WAITING |
| G3-AUTH-009 | Password reset revokes prior sessions | High | WAITING |
| G3-AUTH-010 | Logout rejects the current session | High | WAITING |
| G3-AUTH-011 | Active Admin blocks a second Admin invite | Critical | WAITING |
| G3-AUTH-012 | Pending Admin invitation reserves the slot | Critical | WAITING |
| G3-AUTH-013 | Owner disables Admin and creates replacement | Critical | WAITING |
| G3-AUTH-014 | Admin cannot create or replace another Admin | Critical | WAITING |
| G3-SEAT-001 | Concurrent employee creates at the last seat | Critical | WAITING |
| G3-SEAT-002 | Pending invite does not consume a seat | High | WAITING |
| G3-SEAT-003 | Disabled employee frees the seat; re-enable checks cap | Critical | WAITING |
| G3-SEAT-004 | Owner/Admin do not consume employee seats | High | WAITING |
| G3-SEAT-005 | Employee cannot manage staff or self-escalate | Critical | WAITING |
| G3-SEAT-006 | Concurrent roster imports cannot exceed event cap | Critical | WAITING |
| G3-SEAT-007 | Duplicate roster rows follow the approved policy | High | WAITING |
| G3-SEAT-008 | Student disablement revokes supported sessions | Critical | WAITING |
| G3-BILL-001 | Invalid subscription state/period rejected by DB | Critical | WAITING |
| G3-BILL-002 | Active periods cannot overlap concurrently | Critical | WAITING |
| G3-BILL-003 | Scheduled period starts at exact prior period end | Critical | WAITING |
| G3-BILL-004 | Duplicate webhook produces one financial effect | Critical | WAITING |
| G3-BILL-005 | Out-of-order webhook produces one financial effect | Critical | WAITING |
| G3-BILL-006 | Amount/currency/order/invoice/tenant mismatch cannot activate | Critical | WAITING |
| G3-BILL-007 | Success redirect without verified provider event cannot activate | Critical | WAITING |
| G3-BILL-008 | Failed/pending/refund/chargeback transitions are distinct | Critical | WAITING |
| G3-BILL-009 | Upgrade/downgrade uses approved effective-time rule | High | WAITING |
| G3-BILL-010 | Annual/proration paths are rejected for monthly plans | High | WAITING |
| G3-BILL-011 | Price and limits snapshot at period creation | Critical | WAITING |
| G3-BILL-012 | 18% GST placeholder cannot issue a live invoice | Critical | WAITING |
| G3-BILL-013 | Plan changes do not mutate existing invoice snapshot | High | WAITING |
| G3-BILL-014 | Usage counters reconcile with live counts | High | WAITING |
| G3-BILL-015 | Entitlement expiry blocks new attempts | Critical | WAITING |
| G3-BILL-016 | 15-minute recovery accepts only submit/reconnect | Critical | WAITING |
| G3-BILL-017 | Paused/disconnected attempt cannot extend end time | Critical | WAITING |
| G3-BILL-018 | Entitlement reconciler is the sole lifecycle writer | Critical | WAITING |
| G3-JOB-001 | Two workers cannot claim one lease | Critical | WAITING |
| G3-JOB-002 | Worker crash causes safe lease expiry and re-claim | Critical | WAITING |
| G3-JOB-003 | Late old worker cannot commit after losing lease | Critical | WAITING |
| G3-JOB-004 | Handler retries do not duplicate business effects | Critical | WAITING |
| G3-JOB-005 | Retry cap moves the job to DLQ with redacted diagnostics | High | WAITING |
| G3-JOB-006 | Replay requires operator, reason and idempotency | High | WAITING |
| G3-JOB-007 | Outbox failure does not mark notification delivered | High | WAITING |
| G3-PROV-001 | Provider test-mode signature and reconciliation pass | Critical | WAITING |
| G3-NO-001 | No open Critical/High identity/billing finding | Critical | WAITING |

## 2. Identity cases

### G3-AUTH-001 - Valid staff login resolves principal before tenant data

- Requirement / risk: AUTH-001; R-111
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Submit a valid staff identifier and credential.
2. Inspect the response and auth context.
3. Confirm no tenant business row is read before membership selection.

Expected result:

- Principal is resolved; tenant data is absent until membership/context is
  selected.
- Auth lookup cannot read tenant business tables.

Evidence:

- Auth response, DB query log, context payload.

Pass criteria:

- Identity resolution and tenant data access remain separate.

### G3-AUTH-002 - Unknown identifier returns a generic response

- Requirement / risk: AUTH-002; no enumeration
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Submit an unknown identifier, wrong password and disabled account.
2. Compare status code, body, timing and retry headers.

Expected result:

- Generic response; no account-existence signal.
- Rate limit still applies.

Evidence:

- Response matrix.

Pass criteria:

- No enumeration difference beyond approved timing tolerance.

### G3-AUTH-003 - One staff principal cannot join a second institution

- Requirement / risk: AUTH-003; DQ-01
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Create staff principal in institution A.
2. Invite the same principal to B.
3. Attempt login and tenant switch.

Expected result:

- Second membership is rejected.
- No tenant-switch path exists in v2.0.

Evidence:

- Invite response, DB membership state, login context.

Pass criteria:

- One institution per staff principal.

### G3-AUTH-004 - Student/staff identifier collision is blocked

- Requirement / risk: AUTH-004; identity collision
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Load a fixture with a colliding student/staff identifier.
2. Attempt login and migration/onboarding.
3. Confirm the collision policy blocks ambiguity.

Expected result:

- No arbitrary first match.
- Collision is reported with the approved remediation path.

Evidence:

- Collision report, login response, migration result.

Pass criteria:

- Ambiguity cannot silently grant access.

### G3-AUTH-005 - Disabled staff cannot refresh an old session

- Requirement / risk: AUTH-005; revocation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Log in as staff.
2. Disable the staff principal.
3. Attempt refresh and an authenticated request with the old token.

Expected result:

- Both rejected; session is revoked.

Evidence:

- Token timestamps, responses, audit event.

Pass criteria:

- Disabled staff loses access at the approved revocation SLO.

### G3-AUTH-006 - Role change invalidates old claims

- Requirement / risk: AUTH-006
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Log in as Admin.
2. Change the role to Employee.
3. Use the old token to call Admin-only operations.

Expected result:

- Old claims cannot retain Admin permission.
- Session is revoked or refreshed with the new role.

Evidence:

- Token/claims snapshot, API responses.

Pass criteria:

- No stale privilege survives the change.

### G3-AUTH-007 - Institution suspension denies access immediately

- Requirement / risk: AUTH-007
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Log in as tenant A staff.
2. Suspend institution A.
3. Call a tenant endpoint with the old session.

Expected result:

- Access denied at the approved revocation SLO.
- WebSocket is closed.

Evidence:

- Response timestamps, socket close code, audit event.

Pass criteria:

- Suspension cannot be bypassed by a live token.

### G3-AUTH-008 - Refresh-token replay revokes the family

- Requirement / risk: AUTH-008
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Log in and obtain a refresh token.
2. Use it once.
3. Replay the old refresh token.
4. Retry with the newly issued token.

Expected result:

- Replay is detected; the token family is revoked; security event recorded.

Evidence:

- Token family state, response, audit event.

Pass criteria:

- Replayed refresh token cannot create a new session.

### G3-AUTH-009 - Password reset revokes prior sessions

- Requirement / risk: AUTH-009
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Log in on two sessions.
2. Complete password reset.
3. Use both old access and refresh tokens.

Expected result:

- Prior sessions are rejected.

Evidence:

- Response matrix and token state.

Pass criteria:

- Reset invalidates old sessions.

### G3-AUTH-010 - Logout rejects the current session

- Requirement / risk: AUTH-010
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Log in.
2. Log out.
3. Reuse the access and refresh token.

Expected result:

- Current session rejected on subsequent requests.

Evidence:

- Response matrix.

Pass criteria:

- Logout is effective server-side.

### G3-AUTH-011 - Active Admin blocks a second Admin invite

- Requirement / risk: AUTH-011; single Admin
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Institution A has one active Admin.
2. Owner invites a second Admin.
3. Attempt to accept the invite.

Expected result:

- Invite is rejected; the slot remains with the active Admin.

Evidence:

- Invite response, DB slot state.

Pass criteria:

- Only one active Admin exists.

### G3-AUTH-012 - Pending Admin invitation reserves the slot

- Requirement / risk: AUTH-012
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Create a pending Admin invite.
2. Create a second Admin invite before acceptance.
3. Accept the first invite.

Expected result:

- Second invite is rejected while the first is pending.
- Acceptance leaves exactly one active Admin.

Evidence:

- Invite state, acceptance result, DB slot state.

Pass criteria:

- Pending invite reserves the slot atomically.

### G3-AUTH-013 - Owner disables Admin and creates replacement

- Requirement / risk: AUTH-013
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Owner disables the current Admin.
2. Create and accept a replacement Admin.
3. Verify the old Admin row remains for audit.

Expected result:

- Slot is freed after disablement.
- Replacement succeeds.
- Old row remains; old session is revoked.

Evidence:

- DB rows, session state, audit log.

Pass criteria:

- Replacement is atomic and auditable.

### G3-AUTH-014 - Admin cannot create or replace another Admin

- Requirement / risk: AUTH-014; Owner-only
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Log in as Admin.
2. Attempt to create/disable/replace another Admin.
3. Repeat with a forged role field.

Expected result:

- Denied; only Owner can manage the Admin.
- Server-side role matrix is authoritative.

Evidence:

- API responses and audit log.

Pass criteria:

- Admin cannot escalate itself or another user.

## 3. Seat and roster cases

### G3-SEAT-001 - Concurrent employee creates at the last seat

- Requirement / risk: seat cap; concurrency
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Plan allows N seats; N-1 are used.
2. Open two real DB connections.
3. Create two employees concurrently.
4. Check final DB state.

Expected result:

- Exactly one succeeds; the other gets the approved cap error.
- No over-cap row.

Evidence:

- Transaction logs, final counts.

Pass criteria:

- Atomic seat enforcement under concurrency.

### G3-SEAT-002 - Pending invite does not consume a seat

- Requirement / risk: seat counting
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Fill N-1 seats.
2. Create a pending employee invite.
3. Create another employee directly.
4. Accept the pending invite.

Expected result:

- Pending invite does not consume a seat.
- Acceptance checks the cap atomically.

Evidence:

- Invite state, seat count, response.

Pass criteria:

- No double-count and no over-cap acceptance.

### G3-SEAT-003 - Disabled employee frees the seat; re-enable checks cap

- Requirement / risk: seat counting
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Fill all seats.
2. Disable one employee.
3. Re-enable when a seat is free.
4. Fill the seat, then attempt re-enable again.

Expected result:

- Disable frees the seat immediately.
- Re-enable succeeds only if a seat exists.
- No over-cap state.

Evidence:

- Seat counts and responses.

Pass criteria:

- Seat count is correct after every transition.

### G3-SEAT-004 - Owner/Admin do not consume employee seats

- Requirement / risk: seat counting
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Create Owner and Admin.
2. Fill all employee seats.
3. Confirm the absolute 20-staff ceiling still applies.

Expected result:

- Owner/Admin excluded from employee seats but included in the absolute
  ceiling.

Evidence:

- Counts and cap responses.

Pass criteria:

- Both limits are enforced correctly.

### G3-SEAT-005 - Employee cannot manage staff or self-escalate

- Requirement / risk: role matrix
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Log in as Employee.
2. Attempt to create/disable staff, change own role and submit a role field.
3. Attempt billing settings.

Expected result:

- All denied; server-side role matrix wins.

Evidence:

- Response matrix and audit log.

Pass criteria:

- No employee escalation path.

### G3-SEAT-006 - Concurrent roster imports cannot exceed event cap

- Requirement / risk: roster cap; concurrency
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Event has one remaining roster slot.
2. Run two imports concurrently.
3. Check final roster count and import results.

Expected result:

- Exactly one import consumes the slot.
- No over-cap roster.

Evidence:

- Import logs and final count.

Pass criteria:

- Atomic roster cap.

### G3-SEAT-007 - Duplicate roster rows follow the approved policy

- Requirement / risk: import policy
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Import a row twice in one file and across two files.
2. Test update, skip and conflict modes.
3. Check the error report.

Expected result:

- Behavior follows the approved policy; no silent duplicate.
- Error report persists.

Evidence:

- Import output and DB rows.

Pass criteria:

- Duplicate policy is deterministic.

### G3-SEAT-008 - Student disablement revokes supported sessions

- Requirement / risk: revocation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Log in as student.
2. Disable the student.
3. Use access/refresh tokens and WebSocket ticket.

Expected result:

- All supported sessions are revoked.

Evidence:

- Response matrix, socket close, audit event.

Pass criteria:

- Disabled student cannot continue.

## 4. Billing cases

### G3-BILL-001 - Invalid subscription state/period rejected by DB

- Requirement / risk: billing constraints
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Attempt bad status, null start, nonpositive interval and bad end.
2. Attempt an overlap.
3. Capture constraint names.

Expected result:

- Every invalid row is rejected at the DB level.
- No application-only validation is the sole control.

Evidence:

- SQL output with constraints.

Pass criteria:

- DB rejects every invalid state/period.

### G3-BILL-002 - Active periods cannot overlap concurrently

- Requirement / risk: period integrity
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Open two transactions.
2. Insert overlapping active periods for one institution.
3. Commit both.

Expected result:

- One fails with the overlap constraint.
- Final state has no overlap.

Evidence:

- Transaction logs and final rows.

Pass criteria:

- No overlapping active period.

### G3-BILL-003 - Scheduled period starts at exact prior period end

- Requirement / risk: renewal boundary
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Create a period ending at T.
2. Schedule the next period.
3. Run the activation at T-1 second, T and T+1 second.

Expected result:

- No expired gap; activation happens at the approved boundary.
- No duplicate period.

Evidence:

- Timestamps and period rows.

Pass criteria:

- Boundary behavior is exact.

### G3-BILL-004 - Duplicate webhook produces one financial effect

- Requirement / risk: webhook idempotency
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Deliver the same signed webhook twice.
2. Check invoice, subscription, entitlement, audit and outbox.

Expected result:

- One financial effect; duplicate is ignored or reconciled.

Evidence:

- Webhook log, DB state, outbox count.

Pass criteria:

- No duplicate charge/period.

### G3-BILL-005 - Out-of-order webhook produces one financial effect

- Requirement / risk: webhook ordering
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Deliver later and earlier events in reverse order.
2. Include a stale event after a newer state.
3. Check final state.

Expected result:

- Final state follows the approved event precedence.
- No duplicate or regressed entitlement.

Evidence:

- Event log and final state.

Pass criteria:

- Out-of-order delivery is safe.

### G3-BILL-006 - Amount/currency/order/invoice/tenant mismatch cannot activate

- Requirement / risk: payment integrity
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Send a valid signature with wrong amount.
2. Repeat with wrong currency, order, invoice and tenant.
3. Check activation.

Expected result:

- Each mismatch is rejected; entitlement does not change.

Evidence:

- Response, DB state, audit.

Pass criteria:

- No mismatch can activate a plan.

### G3-BILL-007 - Success redirect without verified provider event cannot activate

- Requirement / risk: payment integrity
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Open the success redirect URL directly.
2. Do not send a provider event.
3. Check subscription/entitlement.

Expected result:

- No activation without a verified event.

Evidence:

- Response and DB state.

Pass criteria:

- Redirect is not proof of payment.

### G3-BILL-008 - Failed/pending/refund/chargeback transitions are distinct

- Requirement / risk: billing state machine
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Exercise failed, pending, refunded, chargeback and disputed events.
2. Attempt forbidden transitions.
3. Check entitlement and invoice state.

Expected result:

- Every state follows the approved transition table.
- Forbidden transitions are rejected.

Evidence:

- State-machine matrix and DB rows.

Pass criteria:

- No ambiguous or skipped transition.

### G3-BILL-009 - Upgrade/downgrade uses approved effective-time rule

- Requirement / risk: plan change
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Change plan at the approved boundary and mid-period.
2. Check invoice, period and limits.
3. Test concurrent plan change and renewal.

Expected result:

- Effective time and proration follow the approved rule.
- No double activation.

Evidence:

- Period/invoice rows and timestamps.

Pass criteria:

- Plan change is deterministic and safe.

### G3-BILL-010 - Annual/proration paths are rejected for monthly plans

- Requirement / risk: plan catalogue
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Attempt annual subscription.
2. Attempt proration paths not approved for v2.0.
3. Check DB/API rejection.

Expected result:

- Only monthly 30-day Standard/Premium paths succeed.

Evidence:

- Response matrix.

Pass criteria:

- Unapproved billing paths cannot reach an invoice.

### G3-BILL-011 - Price and limits snapshot at period creation

- Requirement / risk: catalogue snapshot
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Create a period with current price/limits.
2. Change the plan catalogue.
3. Read the period, invoice and enforcement.

Expected result:

- Existing period/invoice keep their snapshot.
- New periods use the new catalogue.

Evidence:

- Snapshot rows and enforcement results.

Pass criteria:

- No retroactive mutation.

### G3-BILL-012 - 18% GST placeholder cannot issue a live invoice

- Requirement / risk: CA/GST
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Attempt a live invoice with placeholder GST.
2. Attempt a test-mode invoice.
3. Check the guard and audit.

Expected result:

- Placeholder cannot reach a live invoice before CA approval.
- Test-mode is labeled and cannot be mistaken for live.

Evidence:

- Invoice rows, response, audit.

Pass criteria:

- No unapproved tax/financial document.

### G3-BILL-013 - Plan changes do not mutate existing invoice snapshot

- Requirement / risk: invoice immutability
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Create an invoice.
2. Change plan price/limits.
3. Re-read the invoice and credit-note path.

Expected result:

- Invoice is immutable; corrections use a credit note.

Evidence:

- Invoice hash/rows and correction document.

Pass criteria:

- No in-place invoice mutation.

### G3-BILL-014 - Usage counters reconcile with live counts

- Requirement / risk: limits
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Create employees, rosters and events concurrently.
2. Compare counters to live counts.
3. Run the reconciler.

Expected result:

- Counters match; reconciler is idempotent.

Evidence:

- Counter/live-count matrix and reconciler output.

Pass criteria:

- No drift after concurrency.

### G3-BILL-015 - Entitlement expiry blocks new attempts

- Requirement / risk: exam expiry policy
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Let entitlement expire.
2. Attempt a new exam start.
3. Check an already-started attempt.

Expected result:

- New attempt blocked.
- Started attempt finishes to its original scheduled end.

Evidence:

- Start responses and attempt timestamps.

Pass criteria:

- Expiry blocks new work but does not cut off a started exam improperly.

### G3-BILL-016 - 15-minute recovery accepts only submit/reconnect

- Requirement / risk: recovery window
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Start an exam and reach scheduled end.
2. Test submit and reconnect within 15 minutes.
3. Test new answer time, new question delivery and an attempt after 15 minutes.

Expected result:

- Submit/reconnect accepted; no extra answer time; after 15 minutes denied.

Evidence:

- Timestamps and server responses.

Pass criteria:

- Recovery window is time-boxed and does not extend the exam.

### G3-BILL-017 - Paused/disconnected attempt cannot extend end time

- Requirement / risk: timer integrity
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Pause/disconnect during an attempt.
2. Reconnect near and after the scheduled end.
3. Submit a late answer.

Expected result:

- Scheduled end unchanged; late answer rejected.

Evidence:

- Server timestamps and submission response.

Pass criteria:

- Client pause cannot extend server time.

### G3-BILL-018 - Entitlement reconciler is the sole lifecycle writer

- Requirement / risk: lifecycle ownership
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Attempt a direct lifecycle write from an API/admin path.
2. Attempt a write from the webhook handler.
3. Run the reconciler.

Expected result:

- Only the reconciler writes lifecycle state.
- Other paths emit events or requests.

Evidence:

- Privilege report, code path review, DB writes.

Pass criteria:

- No bypass writer.

## 5. Job cases

### G3-JOB-001 - Two workers cannot claim one lease

- Requirement / risk: job lease
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Enqueue one job.
2. Start two real workers/connections.
3. Attempt simultaneous claim.

Expected result:

- Exactly one lease is granted.

Evidence:

- Lease rows and worker logs.

Pass criteria:

- No double claim.

### G3-JOB-002 - Worker crash causes safe lease expiry and re-claim

- Requirement / risk: recovery
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Claim a job.
2. Kill/stop the worker before completion.
3. Wait for lease expiry.
4. Re-claim with another worker.

Expected result:

- Lease expires safely; another worker completes exactly once.

Evidence:

- Lease timeline and final job state.

Pass criteria:

- Crash recovery does not duplicate effects.

### G3-JOB-003 - Late old worker cannot commit after losing lease

- Requirement / risk: stale lease
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Claim a job.
2. Let the lease expire.
3. Let a second worker claim and complete it.
4. Let the first worker return late.

Expected result:

- Late commit is rejected; no duplicate business effect.

Evidence:

- Worker logs, job state, side-effect counts.

Pass criteria:

- Stale worker cannot commit.

### G3-JOB-004 - Handler retries do not duplicate business effects

- Requirement / risk: idempotency
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Inject a failure after a side effect.
2. Retry the handler.
3. Check invoice/email/outbox/DB state.

Expected result:

- One business effect; retry is idempotent.

Evidence:

- Side-effect counts and retry log.

Pass criteria:

- No duplicate charge/email/row.

### G3-JOB-005 - Retry cap moves the job to DLQ with redacted diagnostics

- Requirement / risk: DLQ
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Force repeated failures.
2. Reach the retry cap.
3. Inspect the DLQ entry and logs.

Expected result:

- Job moves to DLQ; diagnostics are redacted; alert is emitted.

Evidence:

- DLQ row, logs, alert.

Pass criteria:

- No infinite retry and no secret/PII leak.

### G3-JOB-006 - Replay requires operator, reason and idempotency

- Requirement / risk: replay control
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Attempt replay without authority.
2. Attempt with an operator but no reason.
3. Replay twice with a valid operator/reason.

Expected result:

- Unauthorized replay denied.
- Valid replay is idempotent and audited.

Evidence:

- Replay attempts, audit rows, final state.

Pass criteria:

- Replay is controlled and idempotent.

### G3-JOB-007 - Outbox failure does not mark notification delivered

- Requirement / risk: outbox integrity
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Fail the queue/outbox write.
2. Check the user-visible notification state.
3. Fail provider delivery after commit.

Expected result:

- Notification is not marked delivered until delivery is confirmed.
- Retry path is explicit.

Evidence:

- Outbox rows, delivery status, retry log.

Pass criteria:

- No false "delivered" state.

## 6. Provider proof

### G3-PROV-001 - Provider test-mode signature and reconciliation pass

- Requirement / risk: provider integration
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Use the provider test-mode credentials only.
2. Send signed success, failure, duplicate and out-of-order events.
3. Reconcile the provider report with local state.
4. Verify no live key or live money is used.

Expected result:

- Signature, amount, currency and order checks pass.
- Local state matches the provider report.
- Test-mode artifacts are clearly labeled.

Evidence:

- Provider dashboard/report, local state, signature log.

Pass criteria:

- Test-mode provider proof is complete; live keys are absent.

### G3-NO-001 - No open Critical/High identity/billing finding

- Requirement / risk: gate exit
- Severity: Critical
- Automation: manual review
- Status: WAITING

Steps:

1. Collect all G3 findings.
2. Classify, assign owner and verify fixes.
3. Rerun the full G3 suite.
4. Confirm no open Critical/High finding.

Expected result:

- Zero open Critical/High findings.
- Medium/Low findings have owner, due date and control.

Evidence:

- Finding register and final rerun.

Pass criteria:

- Independent reviewer approves G3.

## 7. G3 exit criteria

- G2 is `APPROVED`.
- Identity, seat, billing, job and provider code is frozen.
- Every case above is `VERIFIED`.
- Provider test-mode proof and CA/GST guard pass.
- No open Critical/High finding.
- Product owner, security reviewer and finance owner sign the G3 disposition.
