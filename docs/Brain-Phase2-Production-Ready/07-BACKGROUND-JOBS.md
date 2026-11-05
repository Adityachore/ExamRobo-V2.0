# Background Jobs, Queue, Outbox and Worker Recovery

## 1. Delivery guarantee

Use **at-least-once job delivery** with idempotent business handlers. Do not claim exactly-once processing across PostgreSQL, Redis, SMTP, SMS, Razorpay or object storage. A process can crash after an external provider accepts a request but before local success is recorded; idempotency/reconciliation is the protection.

## 2. Table design

### `job_queue`

| Column | Purpose |
|---|---|
| `id` | UUID primary key |
| `job_type` | Allow-listed handler name |
| `tenant_id` | Nullable only for truly global jobs |
| `payload` | Validated, minimized JSON payload; no secrets |
| `status` | `queued`, `running`, `completed`, `dead`, `cancelled` |
| `available_at` | Next eligible time |
| `attempts`, `max_attempts` | Retry accounting |
| `idempotency_key` | Unique operation key |
| `worker_id` | Current worker |
| `lease_token` | Random ownership token |
| `lease_until` | Lease expiration |
| `heartbeat_at` | Long-job liveness |
| `created_at`, `updated_at`, `completed_at` | Lifecycle |

### `job_runs`

Append-only execution record: job ID, worker ID, started/finished times, attempt, outcome, error class/code, duration, correlation ID and redacted detail. Do not store secrets or full student payloads.

### `job_dead_letters`

Stores exhausted job reference, reason, last error class, attempt history reference, replay count, operator, replay/discard reason and timestamps. Replaying creates a new attempt against the same idempotency key unless an explicit new business operation is intended.

### `notification_outbox`

Stores notification intent and minimized delivery payload, recipient reference, template/version, provider, idempotency key, status, next attempt, lease, provider message ID and sent time. Sensitive content is encrypted or minimized and purged per approved retention policy.

### `webhook_events`

Durable inbox with unique provider event ID, received time, signature verification result, processing state, payload digest, encrypted/minimized payload and reconciliation status.

## 3. Worker claim protocol

Use one short transaction to claim jobs:

```sql
WITH picked AS (
  SELECT id
  FROM job_queue
  WHERE (status = 'queued' AND available_at <= now())
     OR (status = 'running' AND lease_until < now())
  ORDER BY available_at, id
  FOR UPDATE SKIP LOCKED
  LIMIT $1
)
UPDATE job_queue q
SET status = 'running',
    worker_id = $2,
    lease_token = gen_random_uuid(),
    lease_until = now() + $3::interval,
    heartbeat_at = now(),
    attempts = attempts + 1,
    updated_at = now()
FROM picked
WHERE q.id = picked.id
RETURNING q.*;
```

The actual migration must define the UUID generator/extension and verify the query plan/indexes. The worker must complete/update a row only when both `worker_id` and `lease_token` still match; a worker whose lease was stolen cannot complete the newer owner's attempt.

Do not keep the row lock open while performing provider network calls. Claim/commit, perform work, then record result in a new transaction.

## 4. Retry policy

- Retry only transient and classified errors.
- Use exponential backoff with jitter and a hard upper bound.
- Stop after configured maximum attempts or hard deadline.
- Permanent validation/security errors go directly to dead letter or failed state.
- Each retry retains idempotency key and records attempt history.
- Replay from dead letter requires an authorized operator, reason and audit event.
- Do not retry unknown errors indefinitely.

## 5. Tenant-aware workers

The general worker role does not have BYPASSRLS and does not directly scan all tenant business tables.

1. Claim system queue row using worker function.
2. Read the tenant ID from the job envelope; validate it exists and matches the job's target.
3. Acquire a tenant context through the approved worker signer after job authorization.
4. Begin tenant transaction and set local signed context.
5. Execute tenant business action through normal service/domain function and RLS.
6. Commit domain change and any follow-up outbox intent.
7. Record job completion only if the lease token still matches.

Global scheduler jobs use `tenant_job_targets` (tenant ID, target type and due time only) or narrowly scoped functions that return due tenant IDs. They do not need unrestricted SELECT on student/exam tables.

## 6. Singleton jobs

Use advisory locks only for true singleton scheduling, not for queue work. The lock must be held by a dedicated system connection for the job duration and released in `finally`; connection loss releases a session-level lock. Key allocation is centrally documented and collision-free. A second instance skips the tick and records a skipped heartbeat; it must not report a false successful run.

Every singleton job must still be idempotent and catch up based on persisted state, not number of ticks.

## 7. Notification delivery

- Business transaction inserts notification intent in the same commit as state change.
- Worker sends outside transaction.
- Provider idempotency key is the stable outbox ID where provider supports it.
- If provider does not support idempotency, duplicate delivery is possible after ambiguous timeout; templates and business process must tolerate it, and provider status reconciliation should reduce uncertainty.
- Record provider message ID and delivery status where available.
- Never place OTP/password/reset token in logs. OTP delivery payload is short-lived and purged.
- Dead-letter alerts notify operations; user-visible status must not claim delivery until provider result supports it.

## 8. Required job types

| Job | Trigger/cadence | Tenant scope |
|---|---|---|
| Subscription reconciler | Scheduled / every few minutes | Per institution |
| Payment reconciliation | Provider inbox and stale orders | Per invoice/institution |
| Email/SMS outbox | Continuous poll | Notification worker |
| Registration OTP cleanup | Hourly | System only |
| Registration abuse review | On registration | System then tenant creation after approval |
| Expiry reminders | Hourly/daily | Per institution |
| Retention/archive | Daily | Per institution; legal retention rules |
| Privacy request/anonymisation | Approved request and schedule | Per subject/tenant |
| Privacy tombstone replication | On accepted request | Separate ledger |
| Storage cleanup | Scheduled | Per tenant object prefix |
| Audit retention | Scheduled | Tenant/platform policy |

## 9. Observability

Metrics: queue depth by type, oldest queued age, jobs running, lease expirations, retries, dead letters, run duration, job heartbeat age, outbox delivery latency, provider failures, webhook inbox lag and idempotency conflicts.

Alerts: no heartbeat within SLA, queue age above SLA, dead-letter creation, repeated lease expiry, outbox backlog, webhook lag, duplicate business-effect prevention, failed privacy replay, and any job accessing a tenant without valid signed context.

## 10. Required tests

- Two workers claim one queue in parallel; each job has one active lease owner.
- Lease expiry and reassignment; old worker cannot complete after token change.
- Worker killed before work, during external call, after external success and before local success.
- Provider retry and no-idempotency provider behavior.
- Retry exhaustion and manual replay/discard audit.
- Singleton duplicate tick and process crash.
- Worker cannot SELECT tenant business tables globally.
- Tenant-scoped worker with wrong/missing/tampered context fails.
- Outbox privacy retention and log redaction.
