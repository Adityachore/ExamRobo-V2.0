# Migration-by-Migration Implementation Sheets

**Important:** The numbering below is a proposal after verified migrations 001–013. Do not reserve these IDs until the real repository migration runner and current applied migration history are inspected. If numbering differs, preserve the dependency order and update all references before coding.

## Common requirements for every migration

Each migration pull request includes: purpose, preconditions, DDL, backfill (if any), constraints/indexes, grants/RLS effects, postconditions, expected lock duration, retry behavior, forward-repair plan, downgrade limitations and tests. Applied migration files are immutable. Migration checksums must be recorded.

## 014 — Institution foundation and tenant keys

**Changes:** institutions, contacts, internal legacy institution, nullable `institution_id` columns on every tenant table, composite unique keys on tenant parents, lookup indexes.

**Backfill:** assign existing rows to the approved internal legacy institution using verified ownership. Never use user-provided IDs. Derive child ownership through parent joins. Batch large tables by immutable primary key and record last key/checkpoint.

**Do not yet:** enforce NOT NULL or enable FORCE RLS before all app code supplies safe context.

**Postconditions:** every existing row maps to exactly one institution or is explicitly quarantined; no cross-tenant relation; row counts reconcile.

## 015 — Identity control plane

**Changes:** auth principals, login identifiers, credentials, membership, student-auth link if applicable, sessions, institution auth state, collision report tables/temporary staging.

**Precondition:** approved login policy and source collision report.

**Postconditions:** every login maps deterministically; unresolved rows remain blocked/quarantined, not guessed; role/account state synchronization is transactionally enforced.

## 016 — DB roles, context verifier and RLS

**Changes:** no-login function roles, auth lookup roles, context verifier, private key storage/rotation, tenant RLS policies, grants and function ACLs.

**Precondition:** G1 proof passed in isolated schema and independent review approved canonical signing/verification.

**Postconditions:** no ordinary runtime role owns tenant objects, has BYPASSRLS or can forge another tenant context; missing context denies access; Super Admin cannot query raw tenant rows through a wildcard.

## 017 — Plan catalogue, subscription periods and entitlements

**Changes:** plans/versions, subscriptions, entitlement projection/events, CHECK constraints, valid-period constraints, exclusion constraint using `btree_gist` where applicable.

**Preconditions:** approved plan catalogue, billing policy and state machine.

**Postconditions:** invalid status/period/overlap rejected by database; historical plan snapshots immutable; only reconciler mutates entitlement projection.

## 018 — Registration, OTP and anti-abuse

**Changes:** registration requests, OTP challenges, hashed status tokens, rate-limit/fraud fingerprints with approved retention.

**Preconditions:** approved OTP provider, data-minimization and retention decision.

**Postconditions:** OTP is one-time, expiry/attempt limits enforced, no raw OTP/token logged, approval is idempotent and public caller gains no tenant access.

## 019 — Invoices, payments and webhook inbox

**Changes:** invoices, invoice sequence, payments, refunds/adjustments if approved, webhook event inbox and idempotency ledger.

**Preconditions:** CA-approved invoice/tax rules, provider contract and test merchant configuration.

**Postconditions:** immutable invoice snapshots; provider amount/currency/order match; duplicate webhook cannot duplicate payment/entitlement; refund/chargeback transitions explicit.

## 020 — Job queue, execution history and outbox

**Changes:** job_queue, job_runs, dead letters, tenant job targets, notification outbox/delivery attempts.

**Postconditions:** concurrent claim is safe, lease expiry recoverable, retry schedule bounded, poison jobs visible, tenant execution requires valid scoped job context.

## 021 — Privacy requests and local references

**Changes:** application data-request workflow, opaque subject links, append-only request events, local tombstone references.

**Preconditions:** legal retention matrix and external durable ledger design accepted.

**Postconditions:** every request has an auditable state; duplicate processing is idempotent; local state can be reconstructed from external ledger.

## 022 — Final integrity hardening

**Changes:** remaining composite FKs, scoped unique indexes, audit extensions, table registry checks, ownership/grant corrections.

**Preconditions:** data validation reports all expected exceptions resolved.

**Postconditions:** tenant graph is complete; NULL tenant count zero for enforced tables; forced-RLS registry green; all migration checksums verified.

## Online operations and lock control

- Measure table size and write rate before choosing transaction strategy.
- `CREATE INDEX CONCURRENTLY` runs outside a transaction block; migration runner must support resumable/non-transactional steps and detect invalid indexes.
- Add large constraints as `NOT VALID` only where PostgreSQL semantics support it, then `VALIDATE CONSTRAINT` after backfill.
- Never use `IF NOT EXISTS` as a substitute for verifying the existing object's exact definition.
- Set statement/lock timeouts for production operations and define retry behavior.
- Pause cutover if replication lag, WAL growth, disk headroom or lock waits exceed approved thresholds.

## Migration completion report

For each migration record: commit SHA, checksum, DB version, start/end, duration, lock waits, WAL generated, row counts, index validity, constraint validation, warnings, rollback/forward-repair notes and independent reviewer.
