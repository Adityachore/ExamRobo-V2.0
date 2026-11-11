# G1 security proof evidence

- Date: 2026-11-08
- Branch: `feat/saas-v2`
- Gate: **G1 - security proof and architecture approval**
- Status: **PASS locally, independent review pending**
- Scope: isolated, synthetic PostgreSQL 16 proof only
- Database: PostgreSQL 16.15 (`x86_64-pc-linux-musl`)
- Compose image: `postgres:16-alpine`
- Image index digest: `sha256:aa6cb33cf4c19c765cefcf48d96176258800870a9a1e930ad126200f9d825139`
- `linux/amd64` manifest: `sha256:ac838714b7d794185a866e5a6b479b954e7d8a070568aa0acac6fe07c3070bf5`
- Image version: `16.15-alpine3.24` (created 2026-11-05)
- Digest source: `docker buildx imagetools inspect postgres:16-alpine` on
  2026-11-08. The local `RepoDigest` was not captured because Docker Desktop
  was stopped after the run; the reviewer should confirm the local image matches.
- Scratch database: `examrobo_g1_test` (created and dropped by the harness)
- Product schema: untouched; migrations `001..013` unchanged; no `014+`

This evidence does **not** approve G1. It proves the isolated security
properties and hands the result to an independent reviewer. G0 remains
**PARTIAL** and G2 production tenant work remains blocked.

## Authorization

The owner authorized the isolated G1 synthetic POC on 2026-11-06 while G0's
production-data items were blocked. That waiver covers this disposable proof
only. It does not pass G0, authorize production tenant data, or permit
self-approval of G1.

## Command

```powershell
cd server
# G1_PG_URL password is read from the root .env DB_PASSWORD and is not printed.
# Docker publishes IPv4 only, so the URL uses 127.0.0.1 instead of localhost.
$env:G1_PG_URL = "postgres://examrobo:***@127.0.0.1:5450/postgres"
npm run test:g1
```

The harness:

1. refuses any database name that does not end in `_test` or `_smoke`;
2. drops and recreates `examrobo_g1_test`;
3. creates the nine proof roles with `NOSUPERUSER NOBYPASSRLS`;
4. applies `server/sql/g1-poc.sql`;
5. inserts a random signing key and runs the role, tenant-isolation and attack
   suite;
6. writes `results.json` and `role-report.json`;
7. drops the scratch database and roles.

No live ExamRobo database is reachable from the harness.

## Result

| Check | Result |
| --- | --- |
| ROLE-01..ROLE-08 | PASS |
| SEC-001..SEC-016 | PASS |
| Total | **24 passed, 0 failed** |

Raw output: `test-output.txt`. Machine-readable results: `results.json`.
Full role, membership, ownership and grant report: `role-report.json`.
Threat model and trust-boundary diagram: `THREAT-MODEL.md`.
Executable test cases: `../../test-plans/G1-TEST-CASES.md`.
Independent reviewer handoff: `REVIEWER-REPORT.md`.
Protocol: `../../GATE-REVIEW-PROTOCOL.md`.

## Proof coverage

- Nine roles exist; every proof role is non-superuser and `NOBYPASSRLS`.
- Login is limited to the runtime and migration identities.
- `examrobo_table_owner` owns every proof table.
- `examrobo_migrator` is the only member of the table owner.
- Runtime privileges are narrow: no `TRUNCATE`, schema `CREATE`, key access,
  tenant-table access for auth/platform, or app-role auth lookup execution.
- Every tenant table has forced RLS and a `tenant_isolation` policy.
- The tenant-table registry detects a new unclassified table.
- Tenant A cannot read or update tenant B rows.
- A cross-tenant insert is rejected by RLS.
- A forged `app.iid` GUC does not verify or grant access.
- Unsigned, malformed, expired, tampered and wrong-key contexts return no rows.
- Disabled principals and changed institution epochs invalidate stale contexts.
- The app role cannot call the auth lookup function.
- The auth role cannot select tenant or auth tables directly.
- The app role cannot read or modify the private HMAC key.
- The platform dashboard cannot read raw tenant rows; the aggregate function
  returns only the projection.
- A support grant is scoped to one institution and one read scope.
- A pooled connection leaves no tenant context after commit, rollback or error.
- A stale worker lease cannot execute a tenant mutation.
- A composite foreign key rejects a foreign tenant parent with `23503`.
- The registry checker reports an omitted tenant table.

## Harness fixes applied while producing evidence

- RLS policies were moved after `app.current_iid()` is created.
- The role report is restricted to the nine proof roles, so the privileged
  `examrobo` admin login is not misreported as a runtime role.
- SEC-008 now calls `auth.lookup_login` through the app pool, matching its
  stated attack.
- SEC-004 uses a dedicated one-connection pool, so its forged `app.iid` cannot
  contaminate later tests on the shared app pool.

## Remaining limitations

- Synthetic fixtures only. No production data, backup, collision scan or real
  tenant rows were used.
- The custom HMAC-in-Postgres verifier still requires independent security
  review of canonical encoding, constant-time comparison, key rotation,
  transaction-local context and parser edge cases.
- HTTP, Redis, WebSocket, object-storage, export and background-job isolation
  are out of scope for this database POC; they remain G2 work.
- G0 production-data closure, named gate owner/reviewer and a signed reviewer
  disposition remain open.
- No `/api/v2` endpoint was added and no legacy v1.5 route changed.

## Reviewer checklist

- Confirm `results.json` and `test-output.txt` show 24/24.
- Confirm the nine roles and their memberships/grants in `role-report.json`.
- Challenge the signed-context design and reject it if the HMAC boundary is
  not acceptable; use a reviewed alternative and update the ADR before G2.
- Record any Critical/High finding and its disposition.
- Sign the G1 disposition separately. The harness cannot self-approve the gate.
