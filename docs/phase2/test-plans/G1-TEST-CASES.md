# G1 - security proof test cases

- Gate: G1
- Status: **VERIFIED locally, independent review pending**
- Command: `npm run test:g1` from `server/`
- Evidence: `../evidence/g1/`
- Reviewer report: `../evidence/g1/REVIEWER-REPORT.md`
- Threat model: `../evidence/g1/THREAT-MODEL.md`
- Protocol: `../GATE-REVIEW-PROTOCOL.md`

G1 is not approved by a passing local run. The implementation agent cannot be
the only reviewer. The independent reviewer must rerun the suite and sign
`../evidence/g1/REVIEWER-REPORT.md`.

## 1. Common preconditions

- Frozen source at the recorded commit SHA; record `git status --short`.
- Node and dependencies installed for `server/`.
- Docker Desktop running, with `examrobo-db` on `127.0.0.1:5450`.
- Root `.env` contains the current `DB_PASSWORD`; never print it.
- `G1_PG_URL` uses `127.0.0.1`, not `localhost`.
- Scratch database `examrobo_g1_test` ends in `_test` and is dropped by the
  harness.
- The harness creates nine roles with `NOSUPERUSER NOBYPASSRLS`.
- Fixtures include tenant A and tenant B, 15 proof tables and a random HMAC key.
- Contexts use a short TTL (60 seconds in the POC).
- No production database is reachable from the harness.

## 2. Role cases

### G1-ROLE-01 - Required roles exist

- Requirement / risk: R-101, role separation
- Severity: Critical
- Automation: automated (`ROLE-01`)
- Status: VERIFIED

Steps:

1. Connect to the scratch database.
2. Query `pg_roles` for the nine proof roles.
3. Compare the set exactly; do not accept extra runtime superusers.

Expected result:

- Exactly these roles exist:
  `examrobo_table_owner`, `examrobo_migrator`, `examrobo_app`,
  `examrobo_auth_fn`, `examrobo_auth_app`, `examrobo_context_fn`,
  `examrobo_worker`, `examrobo_platform_fn`, `examrobo_platform_app`.

Observed:

- `PASS ROLE-01 required roles exist - 9 roles`.

Evidence:

- `test-output.txt`, `results.json` case `ROLE-01`.

Pass criteria:

- Nine roles, exact names, no missing role.

### G1-ROLE-02 - Every proof role is NOSUPERUSER and NOBYPASSRLS

- Requirement / risk: R-101, no RLS bypass
- Severity: Critical
- Automation: automated (`ROLE-02`)
- Status: VERIFIED

Steps:

1. Query `pg_roles` for `rolsuper`, `rolbypassrls` and `rolcanlogin`.
2. Assert every proof role is `NOSUPERUSER` and `NOBYPASSRLS`.

Expected result:

- All nine roles are clean.
- No role can bypass RLS.

Observed:

- `PASS ROLE-02 every role is NOSUPERUSER and NOBYPASSRLS - all clean`.

Evidence:

- `role-report.json` roles section.

Pass criteria:

- Zero proof roles with superuser or bypass capability.

### G1-ROLE-03 - Login is limited to runtime and migration identities

- Requirement / risk: R-101, least privilege
- Severity: Critical
- Automation: automated (`ROLE-03`)
- Status: VERIFIED

Steps:

1. Inspect `rolcanlogin` for all proof roles.
2. Confirm only the runtime and migration identities can log in.
3. Confirm function-owner roles are not normal login identities.

Expected result:

- The login split is correct; owner/function roles are `NOLOGIN` where designed.

Observed:

- `PASS ROLE-03 login is limited to the runtime and migration identities - split is correct`.

Evidence:

- `role-report.json` roles section.

Pass criteria:

- No unexpected role can log in.

### G1-ROLE-04 - Table owner owns every proof table

- Requirement / risk: R-101, ownership separation
- Severity: High
- Automation: automated (`ROLE-04`)
- Status: VERIFIED

Steps:

1. Query `pg_class` for every proof table in `app`, `auth`, `platform` and
   `app_private`.
2. Compare the owner to `examrobo_table_owner`.

Expected result:

- The table owner owns all 15 proof tables.
- No runtime role owns a table.

Observed:

- `PASS ROLE-04 table owner owns every proof table - 15 tables`.

Evidence:

- `role-report.json` objects/owner fields.

Pass criteria:

- 15/15 tables owned by the table owner.

### G1-ROLE-05 - Migrator is only a member of the table owner

- Requirement / risk: R-101, migration authority
- Severity: High
- Automation: automated (`ROLE-05`)
- Status: VERIFIED

Steps:

1. Query `pg_auth_members` for memberships involving proof roles.
2. Compare the exact membership set.

Expected result:

- Only `examrobo_migrator -> examrobo_table_owner` exists.
- No runtime role is a member of the table owner or migrator.

Observed:

- `PASS ROLE-05 migrator is only a member of the table owner - examrobo_migrator->examrobo_table_owner`.

Evidence:

- `role-report.json` memberships.

Pass criteria:

- Exact one membership pair; no extra inheritance.

### G1-ROLE-06 - Runtime privileges are narrow

- Requirement / risk: R-101, least privilege
- Severity: Critical
- Automation: automated (`ROLE-06`)
- Status: VERIFIED

Steps:

1. Check `examrobo_app` cannot `TRUNCATE`, `CREATE`, read the private key or
   call the auth lookup.
2. Check `examrobo_auth_app` and `examrobo_platform_app` cannot read students.
3. Check the context function can read the key but not students.
4. Check the app can call the context verifier.

Expected result:

- Every boolean in the privilege report is correct:

```json
{
  "app_can_truncate": false,
  "app_can_create": false,
  "app_can_read_key": false,
  "auth_can_read_students": false,
  "platform_can_read_students": false,
  "app_can_call_auth": false,
  "app_can_call_context": true,
  "context_can_read_key": true,
  "context_can_read_students": false
}
```

Observed:

- `PASS ROLE-06 runtime privileges are narrow` with the JSON above.

Evidence:

- `results.json` case `ROLE-06`.

Pass criteria:

- No runtime role has an extra privilege.

### G1-ROLE-07 - Every tenant table has forced RLS and a tenant policy

- Requirement / risk: R-101, fail-closed RLS
- Severity: Critical
- Automation: automated (`ROLE-07`)
- Status: VERIFIED

Steps:

1. Query `pg_class` for `relrowsecurity` and `relforcerowsecurity`.
2. Query `pg_policies` for the tenant policy.
3. Check every tenant table, including child tables.

Expected result:

- Every tenant table has `RLS=true`, `FORCE=true` and a `tenant_isolation`
  policy.
- Observed for institutions, invoices, students, tenant_children,
  tenant_parents: `true/true/true`.

Observed:

- `PASS ROLE-07 every tenant table has forced RLS and a tenant policy`.

Evidence:

- `role-report.json` objects and policies.

Pass criteria:

- 100% of tenant tables forced; zero unclassified table.

### G1-ROLE-08 - Tenant table registry covers every classified table

- Requirement / risk: R-101, classification
- Severity: High
- Automation: automated (`ROLE-08`)
- Status: VERIFIED

Steps:

1. Compare the registry to the proof tenant tables.
2. Insert or simulate an unregistered table in the checker path.
3. Confirm the checker reports it.

Expected result:

- Every classified table is registered.
- An omitted table produces `tenant_unregistered`.

Observed:

- `PASS ROLE-08 tenant table registry covers every classified table - all registered`.

Evidence:

- `results.json` case `ROLE-08`.

Pass criteria:

- No silent unclassified table.

## 3. Tenant and context attack cases

### G1-SEC-001 - Tenant A cannot read tenant B by guessed UUID

- Requirement / risk: R-102, threat T1
- Severity: Critical
- Automation: automated (`SEC-001`)
- Status: VERIFIED

Steps:

1. Set a valid tenant A context.
2. Query tenant B's row by its real UUID.
3. Record the row count.

Expected result:

- Zero rows; no existence signal.

Observed:

- `rows=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-001`.

Pass criteria:

- No tenant B data returned.

### G1-SEC-002 - Tenant A cannot update tenant B row

- Requirement / risk: R-102, threat T1
- Severity: Critical
- Automation: automated (`SEC-002`)
- Status: VERIFIED

Steps:

1. Set a valid tenant A context.
2. Attempt to update a tenant B event row by UUID.
3. Re-read tenant B's row as the owner fixture.

Expected result:

- `updated=0`; tenant B name remains `Event One`.

Observed:

- `updated=0, name=Event One`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-002`.

Pass criteria:

- No tenant B mutation.

### G1-SEC-003 - Tenant A cannot insert a row with tenant B institution id

- Requirement / risk: R-102, threat T2
- Severity: Critical
- Automation: automated (`SEC-003`)
- Status: VERIFIED

Steps:

1. Set a valid tenant A context.
2. Insert a tenant parent row with tenant B's institution UUID.
3. Capture the database error.

Expected result:

- RLS rejects the insert with `42501`.
- No row is created.

Observed:

- `42501: new row violates row-level security policy for table "tenant_parents"`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-003`.

Pass criteria:

- Insert denied; zero rows created.

### G1-SEC-004 - Forged app.iid GUC does not verify or grant access

- Requirement / risk: R-102, threat T3
- Severity: Critical
- Automation: automated (`SEC-004`)
- Status: VERIFIED

Steps:

1. Open a dedicated connection as `examrobo_app`.
2. Set `app.iid` to tenant B's UUID without a signed `app.tenant_context`.
3. Query tenant A and tenant B.
4. Repeat with an unsigned but syntactically valid context.

Expected result:

- Zero rows from both tenants.
- The verifier returns NULL; `app.iid` is never trusted alone.

Observed:

- `rows=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-004`.

Pass criteria:

- No access from a forged GUC.

### G1-SEC-005 - Unsigned, malformed, expired, tampered and wrong-key contexts are denied

- Requirement / risk: R-102, threat T4
- Severity: Critical
- Automation: automated (`SEC-005`)
- Status: VERIFIED

Steps:

1. Build an unsigned context.
2. Build a malformed/truncated context.
3. Build a correctly signed but expired context.
4. Build a valid context with one tampered field.
5. Sign with the wrong key.
6. Query tenant rows for each case.

Expected result:

- Every case returns zero rows.
- No parser error grants access.

Observed:

- `unsigned=0, malformed=0, expired=0, tampered=0, wrongKey=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-005`.

Pass criteria:

- All five variants fail closed.

### G1-SEC-006 - Stale context is denied after principal disablement

- Requirement / risk: R-102, threat T5
- Severity: Critical
- Automation: automated (`SEC-006`)
- Status: VERIFIED

Steps:

1. Create a valid context for a staff principal.
2. Disable the principal.
3. Query tenant rows with the still-valid signed context.

Expected result:

- Zero rows; the context is invalidated by the principal state.

Observed:

- `rows=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-006`.

Pass criteria:

- Disabled principal cannot reuse a live context.

### G1-SEC-007 - Stale context is denied after institution epoch change

- Requirement / risk: R-102, threat T6
- Severity: Critical
- Automation: automated (`SEC-007`)
- Status: VERIFIED

Steps:

1. Create a valid context for institution A.
2. Increment the institution auth epoch.
3. Query tenant rows with the old context.

Expected result:

- Zero rows; the old epoch is stale.

Observed:

- `rows=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-007`.

Pass criteria:

- Old epoch cannot access data.

### G1-SEC-008 - App role cannot call auth lookup function

- Requirement / risk: R-102, threat T7
- Severity: Critical
- Automation: automated (`SEC-008`)
- Status: VERIFIED

Steps:

1. Connect through the app pool as `examrobo_app`.
2. Call `auth.lookup_login`.
3. Capture the error.

Expected result:

- Permission denied; no tenant data or auth data returned.

Observed:

- `42501: permission denied for schema auth`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-008`.

Pass criteria:

- App role has no auth lookup execution path.

### G1-SEC-009 - Auth role cannot select student or auth tables directly

- Requirement / risk: R-102, threat T8
- Severity: Critical
- Automation: automated (`SEC-009`)
- Status: VERIFIED

Steps:

1. Connect as the auth role.
2. Select from `app.students`.
3. Select from `auth.principals`.
4. Attempt to call the tenant context function.

Expected result:

- All direct reads are denied.

Observed:

- `42501: permission denied for function current_iid`;
  `42501: permission denied for table principals`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-009`.

Pass criteria:

- Auth role cannot read tenant/auth tables directly.

### G1-SEC-010 - App role cannot read or change the private HMAC key

- Requirement / risk: R-102, threat T9
- Severity: Critical
- Automation: automated (`SEC-010`)
- Status: VERIFIED

Steps:

1. Connect as `examrobo_app`.
2. Select from the private key table.
3. Attempt a write/update.

Expected result:

- Permission denied; key is never exposed.

Observed:

- `42501: permission denied for schema app_private`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-010`.

Pass criteria:

- App role has no key path.

### G1-SEC-011 - Platform dashboard cannot read raw tenant rows but can read aggregate

- Requirement / risk: R-102, threat T10
- Severity: Critical
- Automation: automated (`SEC-011`)
- Status: VERIFIED

Steps:

1. Connect as `examrobo_platform_app`.
2. Select raw tenant rows directly.
3. Call the platform aggregate function.

Expected result:

- Raw row count is zero.
- Aggregate returns only the approved projection.

Observed:

- `raw=0, direct=true, aggregate=1`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-011`.

Pass criteria:

- No raw tenant read path for platform.

### G1-SEC-012 - Scoped support grant cannot read another institution

- Requirement / risk: R-102, threat T11
- Severity: Critical
- Automation: automated (`SEC-012`)
- Status: VERIFIED

Steps:

1. Create a support grant for institution A with one read scope.
2. Use it against institution A.
3. Use it against institution B.
4. Attempt a row outside the granted scope.

Expected result:

- Own tenant read succeeds once; wrong tenant and out-of-scope rows return zero.

Observed:

- `wrongGrant=0, ownTenant=1, otherRow=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-012`.

Pass criteria:

- Support grant is institution- and scope-bound.

### G1-SEC-013 - Pooled connection reuse leaves no tenant context behind

- Requirement / risk: R-102, threat T12
- Severity: Critical
- Automation: automated (`SEC-013`)
- Status: VERIFIED

Steps:

1. Run a tenant A transaction on a pool connection.
2. Commit.
3. Run a transaction with no context.
4. Run a transaction that errors and rolls back.
5. Query tenant rows after each reuse.

Expected result:

- A sees its row; later no-context and post-error queries see zero.

Observed:

- `A=1, empty=0, afterError=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-013`.

Pass criteria:

- No transaction-local context leaks across pool reuse.

### G1-SEC-014 - Stale worker lease cannot execute a tenant mutation

- Requirement / risk: R-102, threat T13
- Severity: Critical
- Automation: automated (`SEC-014`)
- Status: VERIFIED

Steps:

1. Claim a worker job with a lease.
2. Expire or supersede the lease.
3. Attempt the tenant mutation with the stale lease token.

Expected result:

- `updated=0`; the stale worker cannot commit.

Observed:

- `updated=0`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-014`.

Pass criteria:

- No mutation from a stale lease.

### G1-SEC-015 - Composite foreign key rejects a foreign tenant parent

- Requirement / risk: R-102, threat T14
- Severity: Critical
- Automation: automated (`SEC-015`)
- Status: VERIFIED

Steps:

1. Set a valid tenant A context.
2. Insert a child row whose parent belongs to tenant B.
3. Capture the database error.

Expected result:

- Composite foreign key rejects with `23503`.
- No child row is created.

Observed:

- `23503: insert or update on table "tenant_children" violates foreign key constraint "tenant_children_same_tenant_fk"`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-015`.

Pass criteria:

- Cross-tenant parent reference rejected.

### G1-SEC-016 - New tenant table omitted from the registry is detected

- Requirement / risk: R-102, threat T15
- Severity: High
- Automation: automated (`SEC-016`)
- Status: VERIFIED

Steps:

1. Create a synthetic tenant table in the checker path.
2. Do not add it to the registry.
3. Run the registry checker.

Expected result:

- Checker reports `tenant_unregistered`.

Observed:

- `tenant_unregistered`.

Evidence:

- `test-output.txt`, `results.json` case `SEC-016`.

Pass criteria:

- Omitted table is detected, not silently accepted.

## 4. Manual review checks

These checks are not replaced by the 24 automated cases.

| ID | Check | What the reviewer must confirm |
|---|---|---|
| G1-REV-001 | No live database | Harness refuses names not ending `_test`/`_smoke`; no production host/connection string. |
| G1-REV-002 | Tests run as intended roles | Each case uses `SET ROLE` or a dedicated pool; no accidental superuser connection. |
| G1-REV-003 | RLS is forced | `relforcerowsecurity` is true; the policy is not only `ENABLE` but bypassable by owner. |
| G1-REV-004 | Context parser is fail-closed | Unknown/duplicate fields, truncation, invalid base64/JSON, wrong key and expiry all return NULL. |
| G1-REV-005 | Signature comparison is sound | Canonical encoding is unambiguous; comparison does not leak through early exit. |
| G1-REV-006 | Key handling is separated | App cannot read the key; context function owns the private read; no key in logs/artifacts. |
| G1-REV-007 | Support grant is scoped | Grant is bound to institution, scope, expiry and revocation; denied attempts are auditable. |
| G1-REV-008 | Pool test is real | It uses a pooled connection, commit/rollback/error paths and a later no-context query. |
| G1-REV-009 | No test theater | The denial cases use valid cross-tenant IDs, not malformed IDs; assertions check zero rows and no mutation. |
| G1-REV-010 | Evidence integrity | `results.json` says 24/24; `role-report.json` shows 9 roles and 1 membership; output matches. |

## 5. G1 exit criteria

G1 is `APPROVED` only when:

- all `ROLE-01..08` and `SEC-001..016` cases pass on the reviewer's rerun;
- all manual review checks are dispositioned;
- the PostgreSQL version and image digest are recorded;
- no Critical/High finding remains;
- the independent reviewer signs `../evidence/g1/REVIEWER-REPORT.md`;
- Brain status moves from `VERIFYING` to `APPROVED`.

Until then, G2 and migrations `014+` remain blocked.
