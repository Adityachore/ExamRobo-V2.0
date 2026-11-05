# CI/CD Pipeline and Quality Gates

## 1. Pull-request pipeline

Required pipeline order:

1. checkout exact commit and verify lockfile;
2. formatting and lint;
3. type checking/static analysis where supported by current stack;
4. unit tests;
5. build frontend/backend artifacts;
6. dependency/license/security scanning according to approved policy;
7. spin up disposable PostgreSQL 16 and Redis if required;
8. apply all migrations from empty database;
9. upgrade a restored v1.5.0 fixture through migrations;
10. run schema registry/RLS/privilege assertions;
11. run integration/API tests;
12. run two-tenant security suite;
13. run migration idempotency/forward-repair tests;
14. publish immutable test artifacts and coverage report.

A failed mandatory job blocks merge. Security/migration jobs cannot be `continue-on-error` or silently skipped.

## 2. Scheduled/nightly pipeline

- Full regression suite against current branch head.
- Cross-tenant fuzz/property tests.
- Concurrent subscription and cap-enforcement tests.
- Worker crash/lease/retry simulations.
- Dependency vulnerability refresh.
- Backup/restore drill in isolated environment.
- Migration upgrade and application rollback compatibility test.

## 3. Release pipeline

1. Create immutable versioned build from reviewed commit.
2. Generate SBOM/provenance if toolchain supports it.
3. Verify migration checksums and target DB version.
4. Require deployment approval for staging and production separately.
5. Run pre-deploy backup/PITR verification and migration preconditions.
6. Apply backward-compatible expand migrations.
7. Deploy application with tenant features disabled.
8. Run smoke and synthetic tenant isolation checks.
9. Enable internal legacy tenant and internal users.
10. Enable pilot tenant through explicit allow-list.
11. Public registration remains disabled until pilot exit approval.

## 4. Required quality gates

| Gate | CI evidence |
|---|---|
| Formatting/static analysis | Green required jobs |
| Unit | All tests green; no skipped security-critical tests |
| Database | Clean install and upgrade migration both pass |
| Schema registry | All tenant tables forced RLS and classified |
| Privilege | Runtime-role grants and ownership report passes |
| API | Contract snapshots and role/tenant tests pass |
| Isolation | Two-tenant direct SQL + API + WS + export tests pass |
| Billing | Duplicate/out-of-order webhook and concurrency tests pass |
| Privacy | Tombstone replay/restore tests pass |
| Performance | Ratified budgets met under reproducible workload |
| Compatibility | v1.5.0 golden journeys pass |
| Security | No open Critical/High findings for release |

## 5. Artifact retention

Retain pipeline logs, JUnit/test reports, migration logs, schema/grant reports, benchmark charts, SBOM/scans and deployment record for the period approved by security/legal. Strip secrets and student PII before artifact publication.

## 6. Branch protection

Require review count appropriate to risk, passing required CI, resolved conversations, signed commits if adopted, no force-push to protected branches and CODEOWNERS for database/security/billing/privacy folders. Changes to RLS policies, authentication, migration runner and billing state machine require an assigned specialist reviewer.
