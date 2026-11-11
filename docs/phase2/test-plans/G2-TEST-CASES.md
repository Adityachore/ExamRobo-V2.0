# G2 - tenant isolation test cases

- Gate: G2
- Status: **WAITING FOR IMPLEMENTATION FREEZE - DO NOT EXECUTE YET**
- Source: `docs/Brain-Phase2-Production-Ready/03-IDENTITY-AUTH-RLS.md`,
  `04-DATABASE-MODEL.md`, `11-TEST-STRATEGY.md`, `29-API-AND-DOMAIN-ACCEPTANCE-TEST-CATALOG.md`
- Evidence target: `../evidence/g2/`
- Protocol: `../GATE-REVIEW-PROTOCOL.md`

G2 cannot start until G1 is approved and migrations `014+` are implemented and
frozen. Every case below must be expanded with exact endpoints, SQL, fixtures
and commands before execution. Do not record a pass before the implementation
freeze.

## 1. Case catalog

| Case | Title | Severity | Status |
|---|---|---|---|
| G2-MIG-001 | Clean install applies all migrations from empty | Critical | WAITING |
| G2-MIG-002 | Restored v1.5 fixture upgrades through all migrations | Critical | WAITING |
| G2-MIG-003 | Migration rerun and forward repair are idempotent | High | WAITING |
| G2-MIG-004 | Legacy `ParaRobo` backfill leaves no orphan or unmapped tenant | Critical | WAITING |
| G2-SCH-001 | Every tenant table is classified and registered | Critical | WAITING |
| G2-RLS-001 | Every tenant table has forced RLS and a tenant policy | Critical | WAITING |
| G2-FK-001 | Composite tenant foreign keys reject cross-tenant parents | Critical | WAITING |
| G2-UNQ-001 | Scoped unique indexes allow same value in different tenants | Critical | WAITING |
| G2-SQL-001 | Direct SQL tenant A cannot read B; reverse also denied | Critical | WAITING |
| G2-SQL-002 | Direct SQL tenant A cannot mutate B; reverse also denied | Critical | WAITING |
| G2-API-001 | API read/detail/search/count/pagination are tenant-scoped | Critical | WAITING |
| G2-API-002 | API create/update/delete/bulk are tenant-scoped | Critical | WAITING |
| G2-EXP-001 | CSV, PDF, export and signed URL cannot cross tenants | Critical | WAITING |
| G2-WS-001 | WebSocket ticket and room are tenant-scoped | Critical | WAITING |
| G2-REDIS-001 | Cache, lock and rate-limit keys are tenant-scoped | Critical | WAITING |
| G2-STOR-001 | Recordings, files and export paths are tenant-scoped | Critical | WAITING |
| G2-JOB-001 | Jobs, leases and retries cannot cross tenants | Critical | WAITING |
| G2-POOL-001 | Pooled connection reuse leaves no tenant context | Critical | WAITING |
| G2-NO-001 | No open Critical/High isolation finding remains | Critical | WAITING |

## 2. Detailed cases

### G2-MIG-001 - Clean install applies all migrations from empty

- Requirement / risk: M2, database gate
- Severity: Critical
- Automation: automated
- Status: WAITING

Setup:

- Disposable PostgreSQL 16 database ending in `_test`.
- No application schema preloaded.

Steps:

1. Run the migration runner from `001` through the latest approved migration.
2. Record every migration ID, checksum and duration.
3. Run the schema registry and privilege assertions.
4. Run the application preflight.

Expected result:

- All migrations apply in order with no manual fix.
- Schema version is the expected latest.
- Registry/privilege checks pass.
- No migration reads production data or live provider credentials.

Evidence:

- Migration log, schema version, registry report, privilege report.

Pass criteria:

- Clean install is reproducible from an empty database.

### G2-MIG-002 - Restored v1.5 fixture upgrades through all migrations

- Requirement / risk: M2, cutover safety
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Setup:

- Restored v1.5 fixture in a scratch database.
- Expected row counts and checksums from G0.

Steps:

1. Record pre-migration counts for every critical table.
2. Apply all migrations in order.
3. Run backfill and validation.
4. Compare counts/checksums and list every difference.
5. Run the two-tenant isolation smoke.

Expected result:

- Upgrade succeeds without data loss.
- Every difference is expected and explained.
- No orphan tenant key.

Evidence:

- Pre/post count report, migration log, backfill report, isolation smoke.

Pass criteria:

- A restored v1.5 database reaches the v2 schema safely.

### G2-MIG-003 - Migration rerun and forward repair are idempotent

- Requirement / risk: M2, migration safety
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Apply the migration set.
2. Rerun the idempotent subset.
3. Simulate a partially applied migration.
4. Run the documented forward-repair path.
5. Re-run registry/privilege assertions.

Expected result:

- Safe rerun does not duplicate rows, grants or policies.
- Forward repair reaches the same final schema.
- No partial migration is reported as success.

Evidence:

- Rerun log, repair log, final schema diff.

Pass criteria:

- Re-running or repairing does not corrupt data or permissions.

### G2-MIG-004 - Legacy `ParaRobo` backfill leaves no orphan or unmapped tenant

- Requirement / risk: M2, legacy data mapping
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Load the approved legacy fixture.
2. Run the backfill.
3. Query for rows with null/unknown tenant key.
4. Query for rows whose tenant key points to the wrong institution.
5. Reconcile counts by legacy source.

Expected result:

- Zero orphan tenant keys.
- Zero unmapped rows.
- Every mapping follows the approved source-of-truth rule.

Evidence:

- Backfill report, orphan query, reconciliation counts.

Pass criteria:

- No legacy row is silently dropped or assigned to the first match.

### G2-SCH-001 - Every tenant table is classified and registered

- Requirement / risk: M2, schema registry
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Enumerate every table in `app`, `auth`, `platform` and storage metadata.
2. Classify each as tenant-bearing, global or private.
3. Compare against the registry.
4. Add a synthetic unregistered table and run the checker.

Expected result:

- Every tenant-bearing table is registered.
- An unregistered table is reported.
- Global/private classification is explicit.

Evidence:

- Registry report and synthetic failure output.

Pass criteria:

- No unclassified table can reach a release.

### G2-RLS-001 - Every tenant table has forced RLS and a tenant policy

- Requirement / risk: M2, forced RLS
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Query `relrowsecurity`, `relforcerowsecurity` and `pg_policies`.
2. Check insert/update/delete policies and `WITH CHECK`.
3. Test a table owner connection with RLS active.
4. Add a table without a policy and run the checker.

Expected result:

- Every tenant table has forced RLS and a policy for select/insert/update/delete.
- Missing policy is a hard failure.

Evidence:

- Schema/RLS report and synthetic failure output.

Pass criteria:

- No bypassable tenant table.

### G2-FK-001 - Composite tenant foreign keys reject cross-tenant parents

- Requirement / risk: M2, referential integrity
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Insert parent rows for tenant A and B.
2. Insert a child for A referencing B.
3. Insert a child for B referencing A.
4. Insert a valid same-tenant child.

Expected result:

- Cross-tenant inserts fail with `23503`.
- Valid same-tenant insert succeeds.

Evidence:

- SQL output with error codes and row counts.

Pass criteria:

- No cross-tenant parent reference can exist.

### G2-UNQ-001 - Scoped unique indexes allow same value in different tenants

- Requirement / risk: M2, tenant-scoped identity
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Insert the same email/name/slug in tenant A and B where the approved rule
   allows it.
2. Attempt a duplicate inside one tenant.
3. Attempt a cross-tenant reference where the rule forbids it.

Expected result:

- Same value across tenants succeeds only where approved.
- Duplicate inside one tenant fails with the expected unique violation.
- Collision policy is not bypassed by a global unique index.

Evidence:

- SQL output and constraint names.

Pass criteria:

- Uniqueness is correctly tenant-scoped, not accidentally global or absent.

### G2-SQL-001 - Direct SQL tenant A cannot read B; reverse also denied

- Requirement / risk: R-103..R-110, tenant isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Setup:

- Two tenants with real rows in every tenant table.
- Valid signed context for each.

Steps:

1. Set tenant A context; query every tenant table by B's valid IDs.
2. Set tenant B context; query every tenant table by A's valid IDs.
3. Call count, search, filter and pagination.
4. Check no existence signal in error text.

Expected result:

- Zero rows and zero counts in both directions.
- No mutation and no foreign-key path to B.

Evidence:

- Full SQL matrix output.

Pass criteria:

- 100% denial in both directions.

### G2-SQL-002 - Direct SQL tenant A cannot mutate B; reverse also denied

- Requirement / risk: R-103..R-110, tenant isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Set tenant A context; attempt insert/update/delete on B rows.
2. Set tenant B context; attempt the reverse.
3. Attempt bulk update and `ON CONFLICT` paths.
4. Verify B rows are unchanged.

Expected result:

- Every cross-tenant mutation is denied or affects zero rows.
- No side effect in audit or child tables.

Evidence:

- SQL output and post-mutation row snapshots.

Pass criteria:

- No cross-tenant write path.

### G2-API-001 - API read/detail/search/count/pagination are tenant-scoped

- Requirement / risk: API isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Authenticate as tenant A staff.
2. Call list/detail/search/count/pagination with B's valid IDs and filters.
3. Repeat as tenant B against A.
4. Compare response codes, bodies and counts.

Expected result:

- No B data, count, existence signal or leaked field.
- Reverse direction also denied.
- Errors follow the approved contract.

Evidence:

- API request/response capture and status matrix.

Pass criteria:

- Every read path is tenant-scoped.

### G2-API-002 - API create/update/delete/bulk are tenant-scoped

- Requirement / risk: API isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. As tenant A, create/update/delete/bulk rows, including B's IDs.
2. Repeat as tenant B against A.
3. Verify B state after tenant A attempts.

Expected result:

- Cross-tenant mutation denied or zero-row.
- Valid same-tenant mutation succeeds.
- No partial bulk write across tenants.

Evidence:

- API capture, DB snapshots, audit output.

Pass criteria:

- No cross-tenant write path.

### G2-API-003 - Counts, search, filters and pagination do not leak B

- Requirement / risk: side-channel isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Create distinguishable counts in A and B.
2. Query counts, aggregates, search and pagination as A.
3. Try filters, sort and cursor boundaries that could include B.
4. Compare exact counts.

Expected result:

- A sees only A counts/rows.
- No total-count or timing signal reveals B.
- Pagination cannot return a B row.

Evidence:

- Count matrix and response bodies.

Pass criteria:

- No inferred B existence or count.

### G2-EXP-001 - CSV, PDF, export and signed URL cannot cross tenants

- Requirement / risk: export isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. As A, request export/PDF/CSV by B's event/result/roster IDs.
2. Reuse an A export token with a B object ID.
3. Try a guessed filename/path.
4. Repeat in reverse.

Expected result:

- No B data and no valid signed URL.
- Token is bound to tenant, object and scope.
- Expired/reused token fails.

Evidence:

- Response capture, generated file hash, URL scope.

Pass criteria:

- No cross-tenant export path.

### G2-WS-001 - WebSocket ticket and room are tenant-scoped

- Requirement / risk: realtime isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Obtain a WS ticket as A.
2. Try to join B's room or replay the ticket.
3. Attempt message send/filter against B.
4. Revoke the session and retry.

Expected result:

- Ticket is single-use and bound to A, role and exam/room.
- B room join and replay are denied.
- Revocation closes the socket.

Evidence:

- WebSocket log, close codes, room membership.

Pass criteria:

- No cross-tenant room or replay path.

### G2-REDIS-001 - Cache, lock and rate-limit keys are tenant-scoped

- Requirement / risk: cache isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Populate a cache value as A.
2. Try to read/overwrite it as B.
3. Attempt a lock key collision across tenants.
4. Inspect rate-limit buckets by tenant/IP/target.

Expected result:

- Keys include tenant scope where required.
- B cannot read or invalidate A's cache/lock.
- Rate-limit decisions do not cross tenants.

Evidence:

- Redis key dump (redacted), cache/lock behavior, rate-limit results.

Pass criteria:

- No cross-tenant cache or lock effect.

### G2-STOR-001 - Recordings, files and export paths are tenant-scoped

- Requirement / risk: storage isolation
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Upload a file for A and B.
2. Try A's path/name with B's credentials.
3. Try path traversal, guessed recording/export names and signed URL reuse.
4. Re-run after token expiry.

Expected result:

- Paths are tenant-scoped and validated server-side.
- Traversal and guessed names fail.
- No B bytes are returned.

Evidence:

- Upload/download log, path validation results, signed URL scope.

Pass criteria:

- No cross-tenant file access.

### G2-JOB-001 - Jobs, leases and retries cannot cross tenants

- Requirement / risk: background isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Enqueue jobs for A and B.
2. Claim as worker; attempt mutation with a job ID from the other tenant.
3. Expire the lease and retry with the old worker.
4. Inject handler failure and replay.

Expected result:

- A job can affect only A.
- Stale lease and replay cannot mutate tenant data.
- Retry does not duplicate effects.

Evidence:

- Job/lease log, DB snapshots, retry/DLQ output.

Pass criteria:

- No cross-tenant job effect.

### G2-POOL-001 - Pooled connection reuse leaves no tenant context

- Requirement / risk: context leakage
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Run a transaction for A and commit.
2. Run a no-context query on the same pool connection.
3. Run a transaction that errors and rolls back.
4. Run a B transaction and then a no-context query.

Expected result:

- No inherited context after commit, rollback or error.
- No session-level `SET` remains.

Evidence:

- Connection trace and row counts.

Pass criteria:

- No tenant context leak across pooled reuse.

### G2-NO-001 - No open Critical/High isolation finding remains

- Requirement / risk: gate exit
- Severity: Critical
- Automation: manual review
- Status: WAITING

Steps:

1. Collect all G2 findings.
2. Classify severity and assign an owner.
3. Verify every fix with a rerun of the full G2 suite.
4. Confirm no Critical/High finding is open or waived.

Expected result:

- Zero open Critical/High isolation findings.
- Any Medium/Low finding has an owner, due date and compensating control.

Evidence:

- Finding register and final rerun.

Pass criteria:

- Independent reviewer approves G2.

## 3. G2 exit criteria

- G1 is `APPROVED`.
- Migrations and backfill are frozen and rehearsed on a restored v1.5 fixture.
- Every case above is `VERIFIED`.
- Two-tenant SQL/API/WS/Redis/storage/job suites pass in both directions.
- No open Critical/High isolation finding.
- Database and security reviewers sign the G2 disposition.
