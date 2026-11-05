# First Implementation Iterations — Start-to-G1 Backlog

**This is the actionable starting backlog.** Estimates are relative and must be re-estimated after the repository inventory. A sprint is a planning timebox, not a promise of completion.

## Iteration 0 — Source baseline and project setup

| ID | Task | Owner role | Dependency | Deliverable / acceptance |
|---|---|---|---|---|
| S0-01 | Create Phase 2 branch and record v1.5.0 SHA | Tech lead | Repository access | Exact source baseline committed in evidence |
| S0-02 | Reproduce install, build, start and all current tests | Backend/Frontend | S0-01 | Commands and raw results recorded |
| S0-03 | Restore production-like backup to disposable DB | DBA/DevOps | Authorized backup | Restore and checksum report |
| S0-04 | Inventory migrations 001–013 and schema objects | DBA | S0-03 | Machine-readable object inventory |
| S0-05 | Inventory all API routes and authorization middleware | Backend | S0-01 | Route catalogue linked to v1.5 journeys |
| S0-06 | Inventory Redis, WebSocket, jobs, storage and exports | Backend/DevOps | S0-01 | Non-Postgres tenant surfaces listed |
| S0-07 | Run identity collisions/orphan relations/tenant ownership scans | DBA/Product | S0-03 | No unresolved row silently assigned |
| S0-08 | Confirm identity, trial, plan and exam-expiry decisions | Product owner | S0-07 | Signed decision records |
| S0-09 | Create disposable PostgreSQL 16 CI service and migration test runner | DevOps/DBA | S0-01 | CI can build and reset DB safely |
| S0-10 | Threat model and role matrix workshop | Architect/Security | S0-04..06 | Reviewed threat model and role matrix |

**Iteration 0 exit:** Existing v1.5.0 is reproducible; actual schema/route inventory exists; decisions affecting login/tenant ownership are closed or have a documented no-go path.

## Iteration 1 — G1 security proof

| ID | Task | Owner role | Dependency | Deliverable / acceptance |
|---|---|---|---|---|
| S1-01 | Create isolated two-tenant test schema | DBA | S0-09 | Repeatable seed and reset scripts |
| S1-02 | Create all proposed database roles and grants | DBA/Security | S0-10 | Grants report matches role matrix |
| S1-03 | Implement minimal auth principal/login/membership fixture | Backend/DBA | Identity ADR | Auth lookup without tenant context works |
| S1-04 | Implement narrow auth lookup function and generic API response | Backend/Security | S1-02/03 | Auth role has no business-table access |
| S1-05 | Implement signed context canonicalization and verifier | Backend/DBA | Independent design review | Tamper, expiry, wrong-tenant tests pass |
| S1-06 | Apply FORCE RLS to test tenant tables | DBA | S1-05 | App role denied without context and limited with context |
| S1-07 | Test connection pool cleanup and transaction failure paths | Backend/DBA | S1-06 | No context/system privilege leakage |
| S1-08 | Test platform aggregates and scoped support grant | Backend/Security | S1-02 | No blanket tenant-data bypass |
| S1-09 | Run adversarial SEC-001..016 suite | QA/Security | S1-01..08 | All tests pass with artifacts |
| S1-10 | Independent review and G1 decision | Independent reviewer | S1-09 | G1 signed PASS or blockers recorded |

**Iteration 1 exit:** G1 passed. If a custom signed-context mechanism is rejected, stop and revise the ADR; do not continue full tenant implementation using an unreviewed alternative.

## Iteration 2 — Tenant foundation (only after G1)

| ID | Task | Owner role | Dependency | Deliverable / acceptance |
|---|---|---|---|---|
| S2-01 | Implement additive institution/tenant-key migration | DBA | G1 | Upgrade migration tested on copy |
| S2-02 | Backfill legacy rows in checkpointed batches | DBA | S2-01 | Counts/checksums reconcile |
| S2-03 | Add composite tenant FKs and scoped unique indexes | DBA | S2-02 | No cross-tenant relationship |
| S2-04 | Implement tenant DB transaction adapter | Backend | G1 | All feature queries use explicit context |
| S2-05 | Implement middleware and `/auth/me` membership resolution | Backend | Auth ADR | Current role/state loaded safely |
| S2-06 | Scope existing exam routes read-only first | Backend | S2-04 | A/B route tests pass |
| S2-07 | Scope writes and side effects in small route groups | Backend | S2-06 | Tenant and existing exam tests pass |
| S2-08 | Scope Redis, WebSocket and export paths | Backend | S0-06/S2-04 | Cross-tenant boundary tests pass |
| S2-09 | Force RLS and enable registry CI gate | DBA/DevOps | S2-03..08 | All tenant table assertions green |
| S2-10 | G2 independent tenant-isolation review | Security/QA | S2-09 | G2 PASS |

## Work after G2

Continue with the detailed package IDs in `16-IMPLEMENTATION-BACKLOG.md` and migration sheets in `23-MIGRATION-BY-MIGRATION-IMPLEMENTATION-SHEETS.md`.

## Daily development cadence

- Start: confirm one task, its dependency and acceptance tests.
- During: commit small diffs; run focused tests; do not broaden scope silently.
- End: record blockers, changed assumptions, evidence and next action.
- Review: code owner reviews code; independent security/DB reviewer reviews critical boundaries.

## Work-in-progress limits

Do not start more high-risk tasks than available reviewers can inspect. Keep at most one unreviewed change affecting tenant context/RLS and one unreviewed billing-state change in flight. Avoid parallel conflicting migrations.
