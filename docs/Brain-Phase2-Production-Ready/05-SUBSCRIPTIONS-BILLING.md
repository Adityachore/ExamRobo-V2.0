# Subscriptions, Entitlements and Billing

## 1. State ownership

Separate three concepts; do not overload one `institutions.status` field:

1. **Review state:** `pending`, `info_requested`, `approved`, `rejected`.
2. **Administrative state:** `enabled`, `suspended`, `archived`.
3. **Subscription entitlement state:** `trial`, `active`, `expired`, `none`, derived from subscription periods and stored as a projection in `tenant_entitlements`.

Effective access is computed from all three. A payment must never clear an administrative suspension. An expiry job must never overwrite the admin state.

## 2. Subscription period invariant

For each institution, there may be no overlap between any two periods whose status is `scheduled`, `trial` or `active`.

- Period boundaries are half-open: `[starts_at, ends_at)`.
- `starts_at` is NOT NULL.
- `ends_at` is NULL only for a formally approved unbounded contract; NULL means unbounded upper range, not unknown expiry.
- `ends_at > starts_at` when present.
- Period status is CHECK-constrained.
- Exclusion constraint on `(institution_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)` is the last-line database invariant.
- All mutation paths lock the institution row before touching period, invoice or payment rows.
- Lock order: institution → subscriptions → invoices → payments → entitlement projection.

Never use a service-level pre-check as the only overlap defense.

## 3. Authoritative mutation protocol

Every mutation calls the same domain service and DB operation:

`mutateSubscription(institutionId, operation, actor, idempotencyKey)`

Within one transaction:

1. Verify actor authorization and idempotency key.
2. `SELECT institutions ... FOR UPDATE` for target institution.
3. Lock current and scheduled subscription rows in deterministic order.
4. Validate invoice/payment and plan snapshots.
5. Expire periods whose `ends_at <= now` and activate due scheduled periods.
6. Apply the requested change (trial approval, renewal, upgrade, extension, cancellation, refund/manual adjustment).
7. Let the DB exclusion/check constraints reject invalid intervals.
8. Call `reconcileInstitution(institutionId, now)`.
9. Recompute `tenant_entitlements` and increment projection version only if changed.
10. Write audit and outbox events in the same transaction.
11. Commit.

`reconcileInstitution` is the only writer of period lifecycle transitions and entitlement projection. Other services may request it; they do not directly set institution lifecycle fields. Revoke direct `INSERT/UPDATE/DELETE` on `tenant_entitlements` from `examrobo_app`. Where practical, revoke direct status/period DML on `subscriptions` and expose a narrowly scoped `SECURITY DEFINER` billing function owned by a `NOLOGIN`, `NOBYPASSRLS` role. That function must retain tenant RLS enforcement under the verified signed context and must not have privileges on unrelated tenant tables.

Administrative `admin_state` is managed by institution administration and never by the subscription reconciler.

## 4. Lifecycle rules

| Event | Required behavior |
|---|---|
| Approval | Create Trial period and entitlement in one transaction; first admin invite is queued |
| Paid new subscription | Verify provider payment and invoice; create active period if no future/active period; reconcile |
| Early renewal | Create `scheduled` period with `starts_at = current.ends_at`; do not end the current period early |
| Exact boundary | Reconciler expires old period and activates scheduled successor in one institution-locked transaction; no gap |
| Upgrade | No proration in v2.0.0; close current period at now and create new period from now only after explicit confirmation and conflict rules |
| Downgrade | Schedule for next period; if existing usage violates future cap, require a resolution before activation or apply the pre-approved over-limit read-only rule |
| Plan edit | Existing period keeps frozen limit/feature/price snapshot; new plan version applies to future periods |
| Refund | Payment state changes through provider event; period effect follows approved refund policy and audited action |
| Suspension | Set administrative state; entitlement timeline remains intact; access policy blocks tenant operations |
| Reinstatement | Re-enable administrative state only; current entitlement is re-read/reconciled |
| Expiry | Entitlement becomes expired only when no period covers now; existing live attempts follow approved grace/continuation rule |
| Archive | Administrative read-only archive; no erasure implication; privacy schedule continues separately |

## 5. Race and idempotency controls

- Unique provider event ID and payment ID.
- Unique invoice/payment idempotency key.
- One institution row lock for every operation modifying periods or entitlements.
- Exclusion constraint prevents overlap if a code path forgets the pre-check.
- `subscriptions.status` CHECK, period validity CHECK, NOT NULL institution/start fields and composite tenant foreign keys prevent invalid rows from being committed directly.
- Conditional state transitions prevent `failed → paid` or `refunded → paid` regressions unless a separately approved correction event exists.
- A refund never silently reactivates or extends a period.
- Out-of-order webhook events are stored and parked for reconciliation; they are not blindly applied.
- If a provider amount/currency/order/invoice mismatch exists, keep payment in reconciliation hold and do not activate entitlement.

## 6. Payment and invoice rules

- Server computes all amounts from approved plan version and tax configuration.
- Store integer minor units and currency code.
- Snapshot plan code, description, base price, tax values, rate, place of supply, buyer fields and invoice number at issue time.
- CA signs off GST and invoice behavior before live keys.
- Invoice sequence increments atomically using a per-financial-year row lock/update.
- Paid invoices are immutable. Corrections use approved credit notes/refunds/adjustments.
- Payment provider handles card data; ExamRobo must not store PAN/CVV.
- Raw webhook body is captured only for the webhook route. Validate signature before parsing/processing.
- Persist verified webhook event in `webhook_events` before returning 2xx. If durable persistence fails, return a retryable non-2xx so provider delivery can retry.
- Webhook handler should do minimal durable receipt work; background worker applies the event.
- Reconcile local payment state against provider state for stale/pending/mismatched events.

## 7. Limit enforcement

| Limit | Source | Atomic rule |
|---|---|---|
| Events per period | `subscriptions.events_used` or event creation ledger | Conditional increment in same transaction as event creation; archived events remain counted |
| Students per event | Tenant-scoped roster rows | Lock event or use bounded insert/count strategy; prevent concurrent roster imports from exceeding cap |
| Employees | Active `admins` with role `employee` | Lock institution row, count and insert/update in same transaction |
| Features | Plan feature snapshot merged with approved institution overrides | Deny by default for unknown features |

If multiple import workers can add roster rows concurrently, an institution lock alone may be insufficient if imports for different events share one cap; lock the event for per-event roster cap and use unique constraints for deduplication.

## 8. Plan catalogue

`plans` is global read-only for tenant app roles. Plan changes are platform-only and versioned. A plan row update cannot rewrite existing `limits_snapshot` or invoice snapshots. Unlimited values are explicit NULL only where contract policy authorizes them; do not interpret missing values as unlimited without a CHECK and UI contract.

## 9. Billing reconciliation report

Daily reconciliation compares:

- provider order/payment/refund status;
- `webhook_events` receipt and processing state;
- local `payments` state;
- invoice status and amount/currency;
- subscription/entitlement state;
- provider settlement report (when available).

Every mismatch appears in an exception queue with owner, age, resolution, and audit reference. No silent correction.

## 10. Required tests

- Two concurrent renewals for one institution with different invoices/plans.
- Two renewals for different institutions.
- Duplicate and out-of-order webhooks.
- Webhook received but worker delayed/restarted.
- Invalid signature, amount mismatch, currency mismatch and wrong order.
- Early renewal exactly at boundary.
- Reconcile delayed by multiple hours/days.
- Worker runs twice and concurrently.
- Plan edited mid-period; active snapshot unchanged.
- Downgrade with over-limit current usage.
- Refund after activation and refund before activation.
- Admin suspension while entitlement active.
- Exclusion constraint direct SQL negative tests.
- Deadlock/serialization retry and idempotent replay.
