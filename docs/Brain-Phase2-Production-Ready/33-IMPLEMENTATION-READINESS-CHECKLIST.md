# Implementation Readiness Checklist and Current Decision

## 1. What can start immediately

- [ ] Establish exact v1.5.0 source and database baseline.
- [ ] Reproduce local build and full existing test suite.
- [ ] Restore backup to disposable database.
- [ ] Inventory all routes, tables, queries, jobs, caches, WebSockets and files.
- [ ] Confirm source-of-truth ownership for every legacy row.
- [ ] Close login identity and student shared-contact decisions.
- [ ] Confirm database version and deployment topology.
- [ ] Build CI PostgreSQL 16 test service.
- [ ] Run isolated G1 role/context/RLS proof.

These activities are safe starting work because they do not require tenantizing production data.

## 2. What cannot start before G1

- [ ] Full tenant-key backfill against production.
- [ ] Enabling FORCE RLS on real tenant tables.
- [ ] Broad conversion of API routes to tenant-scoped repositories.
- [ ] Pilot institution onboarding.
- [ ] Import of real student data.
- [ ] Public registration or live billing.

## 3. What cannot launch before G2–G5

- G2: complete database/API/Redis/socket/storage/job tenant isolation.
- G3: identity, session revocation, subscription and payment integrity.
- G4: legal approval, privacy request workflow and restore replay.
- G5: compatibility, performance, security review, operations, backup/restore, pilot and production approval.

## 4. Minimum approvals before implementation start

| Approval | Owner | Required evidence |
|---|---|---|
| v1.5.0 baseline accepted | Tech lead | SHA, migrations, passing baseline, backup restore |
| Identity policy | Product owner | ADR for unique identifiers, memberships and student login |
| Tenant ownership policy | Product + DBA | Mapping rules and collision report |
| DB security design | Security + DBA | G1 proof and independent review |
| Plan catalogue | Business owner | Signed plans, durations, limits and Elite semantics |
| Exam expiry policy | Product owner | Grace/ongoing attempt and read-only behavior |
| GST/invoice/refund | CA + business owner | Written calculations and policy |
| Provider readiness | Ops/product | Accounts, approved credentials and test evidence |
| Privacy/minor data | Legal counsel | Data map, DPA, retention, school/minor responsibility |
| Team capacity | Project owner | Named owners, allocation and independent reviewers |

## 5. Project decision today

**Decision: APPROVED TO BEGIN BASELINE AND G1 PROOF WORK ONLY.**  
**Decision: NOT APPROVED FOR FULL TENANT IMPLEMENTATION OR PRODUCTION.**

This is a deliberate staged authorization. The project can start immediately with safe discovery and proof work; it must not skip the security gate to appear productive.

## 6. First task to assign

Assign `P2-0001` and `P2-0101` as the first two linked work items:

- P2-0001: pin the existing source/database baseline;
- P2-0101: build the isolated PostgreSQL 16 two-tenant security harness.

The exact first developer instruction is in `32-IMPLEMENTATION-AGENT-INSTRUCTIONS.md`.
