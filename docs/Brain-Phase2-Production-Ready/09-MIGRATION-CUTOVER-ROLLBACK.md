# Migration, Backfill, Cutover and Rollback Plan

## 1. Preconditions

No production migration begins until the team has:

- exact v1.5.0 commit/tag and runtime versions;
- source schema and migration inventory for 001–013;
- production backup and verified restore to scratch;
- database size, row counts, largest tables, index sizes and write-rate baseline;
- all unique indexes and foreign keys inventoried;
- student/staff email collision report;
- unresolved/orphan relation report;
- target tenant ownership decision for all legacy rows;
- signed resource/capacity plan;
- G1 isolation design approval.

## 2. Migration strategy: expand → backfill → validate → enforce → cut over

Do not assume a single all-table transaction is operationally safe. Large backfills, index builds and table locks must be measured. Use additive changes first and separate long-running/index operations as needed.

### Stage A — Expand

- Create `institutions` and internal legacy tenant record.
- Add nullable `institution_id` columns to existing tenant tables.
- Add new identity/control-plane tables without exposing them to runtime roles.
- Add indexes using an online strategy appropriate to the actual database/version; `CREATE INDEX CONCURRENTLY` must be run outside a transaction block.
- Keep existing v1.5 app path available until the new code is ready; do not enable RLS prematurely without an app-compatible context plan.

### Stage B — Backfill

- Backfill existing rows to the explicit internal legacy tenant (previous plan calls it `ParaRobo Default`; confirm whether that should be an internal tenant not visible as a real college).
- Backfill in bounded primary-key batches for large tables; track last key and row counts.
- Derive child tenant IDs from verified parent relationships, not arbitrary request values.
- Build `students`/auth directory only after duplicate/collision preflight.
- Preserve existing IDs and relationships.
- Record before/after row counts and checksums/aggregate reconciliation for critical data.

### Stage C — Validate relationships

- Find NULL tenant IDs.
- Find missing parents and cross-tenant parent links.
- Validate all unique keys after tenant scoping.
- Validate source-key duplicates per institution.
- Validate student identity collisions.
- Validate every row belongs to exactly one intended institution.
- Validate default-tenant data is complete and not mixed with new tenants.

### Stage D — Enforce

- Add CHECK and foreign key constraints, potentially `NOT VALID` then `VALIDATE CONSTRAINT` where supported and operationally appropriate.
- Add composite tenant foreign keys.
- Set non-null tenant key only when zero NULL rows are demonstrated.
- Enable and FORCE RLS after policies and signed context helper exist.
- Apply least-privilege grants.
- Revoke TRUNCATE and all DDL privileges from runtime roles.
- Run tenant table classification and direct SQL isolation checks.

### Stage E — Cutover

- Freeze schema/code changes.
- Announce maintenance window; prohibit new events/attempts during the cutover according to the approved maintenance runbook.
- Take final backup and record PITR/WAL position.
- Apply migrations in the reviewed order.
- Deploy new application version with tenant feature flag disabled.
- Run smoke, auth/RLS, migration, billing test-mode and exam-day regression suites.
- Enable internal legacy tenant and internal staff first.
- On explicit G1/G2 approvals, onboard pilot institutions.
- Keep public registration disabled until pilot sign-off.

## 3. Migration ordering proposal

Actual numbering must be reconciled with existing 001–013 and migration runner behavior. Draft sequence:

| Migration | Intent |
|---|---|
| 014 | Institution foundation; nullable tenant keys; legacy tenant; backfill support |
| 015 | Auth principals, identity directory, credentials/session records; collision guards |
| 016 | Signed context verifier, DB roles, grants, tenant RLS and FORCE RLS |
| 017 | Plans, subscription periods, entitlement projection and constraints |
| 018 | Registration, OTP, trial-abuse data and request status |
| 019 | Invoices, payments, webhook inbox and financial sequence |
| 020 | Job queue, job runs, dead letters and notification outbox |
| 021 | Privacy request workflow and local tombstone references |
| 022 | Audit extension, composite FK/unique-index hardening and final registry checks |

If the existing migration system cannot safely support online/non-transactional operations, improve the migration runner before large production backfills.

## 4. Migration rules

- Source schema (`schema.sql`) and migration update in the same commit.
- Applied migrations are immutable; fixes use a new migration.
- Migration runner stores checksums and refuses unexpected mutation of an already-applied migration.
- Migration operations are retry-safe; do not assume `IF NOT EXISTS` proves an object has the correct definition.
- Every migration has preconditions, postconditions and rollback/forward-repair notes.
- Destructive operations require manual approval and a restored rehearsal.
- Never run a destructive seed on production.
- CI only connects to databases with approved `_test`/`_smoke` suffixes; production credentials cannot be loaded by tests.

## 5. Backfill evidence

Produce `backfill-report.md` (outside this Brain folder, in the release evidence store) containing:

- source/target commit and backup ID;
- row counts before/after per table;
- checksum/aggregate comparisons for critical tables;
- orphan and cross-tenant relationship counts;
- duplicate unique-key report;
- student/auth collision report;
- NULL tenant-key count;
- index validity and constraint validation;
- duration, WAL growth, lock waits and peak DB storage;
- sampling of legacy exam journeys;
- independent reviewer signature.

All invariant counts must be zero except explicitly approved legacy exceptions with owner, expiry and remediation.

## 6. Rollback correction

A database restore to a pre-cutover backup can lose all legitimate writes made after that backup. Redeploying v1.5.0 against a tenantized database may also fail because the old binary may not supply tenant context or understand new constraints.

Therefore distinguish:

### Application rollback

Prefer redeploying the last known good v2 application binary while keeping the migrated schema. This is allowed only when migrations are backward-compatible with that binary and the compatibility matrix has been tested.

### Feature rollback

Disable public registration, new billing workflows or nonessential portals by feature flag while keeping tenant auth/isolation intact. Never turn off RLS as an incident workaround.

### Legacy v1.5 fallback

Only if a separate `examrobo_legacy` DB role/policy and routing path has been explicitly designed and tested to restrict the old binary to the internal legacy tenant. This does not make all SaaS tenants available through v1.5. It is not assumed to exist.

### Disaster recovery

Restore to a defined PITR point, reconcile external payments/webhooks/outbox, replay privacy tombstones, verify tenant invariants, then reopen ingress. Document the accepted RPO/data-loss window and business approval. Restore is not a routine software rollback.

Never silently discard post-cutover payments, student submissions, exam attempts or tenant registrations.

## 7. Cutover go/no-go checklist

- [ ] Exact v1.5.0 commit and database backup identified.
- [ ] Scratch restore and migration rehearsal passed.
- [ ] Backfill counts/checksums and relationship report passed.
- [ ] Auth identity collisions resolved.
- [ ] RLS and signed context proof passed.
- [ ] API/WS/Redis/storage isolation suite passed.
- [ ] Billing test mode and webhook replay passed.
- [ ] Privacy ledger and restore replay passed.
- [ ] Performance budgets met.
- [ ] v1.5.0 regression suite passed.
- [ ] Rollback decision tree and data-loss window approved.
- [ ] Operations, support, legal and finance owners signed.
- [ ] Registration flag remains off until pilot approval.
