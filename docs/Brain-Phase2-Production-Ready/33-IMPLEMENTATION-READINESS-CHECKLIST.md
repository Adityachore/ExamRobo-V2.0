# Implementation Readiness Checklist and Current Decision

## 1. What can start immediately

- [ ] Establish exact v1.5.0 source and database baseline.
- [ ] Reproduce local build and full existing test suite.
- [ ] Restore backup to disposable database.
- [ ] Inventory all routes, tables, queries, jobs, caches, WebSockets and files.
- [ ] Confirm source-of-truth ownership for every legacy row.
- [ ] Close login identity and student shared-contact decisions.
  - [x] Student shared-contact decision closed 2026-11-06: unique individual email, shared rejected.
  - [x] Staff role model closed: one institution per principal, Owner/Admin/Employee, Owner+Admin billing.
  - [ ] Staff/legacy email collision scan still required.
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
| Identity policy | Product owner | Unique-email intent approved; final constraints/backfill blocked by the collision scan |
| Tenant ownership policy | Product + DBA | Mapping rules and collision report |
| DB security design | Security + DBA | G1 proof and independent review |
| Plan catalogue | Business owner | **Approved 2026-11-06:** Trial free/7 days, Standard INR 10,000/30 days, Premium INR 20,000/30 days, monthly only, 700/300/700 roster per event, employee seats 2/5/15, one Admin; Elite licensing terms remain open |
| Exam expiry policy | Product owner | **Approved 2026-11-06:** scheduled-end completion plus 15-minute submission/reconnect; no new attempts after expiry |
| GST/invoice/refund | CA + business owner | Prices approved; 18% GST and refund terms remain placeholders until written CA/business approval |
| Provider readiness | Ops/product | Razorpay and Hostinger SMTP selected; Hostinger VPS + managed services direction approved; accounts, credentials, region and test evidence remain |
| Privacy/minor data | Legal counsel | Data map, DPA, retention, school/minor responsibility |
| Team capacity | Project owner | Named owners, allocation and independent reviewers |

## 5. Project decision today

**Decision: APPROVED TO BEGIN BASELINE AND G1 PROOF WORK ONLY.**  
**Decision: NOT APPROVED FOR FULL TENANT IMPLEMENTATION OR PRODUCTION.**

The product decisions D-01..D-36 are approved as of 2026-11-06, including billing/plans in v2.0, Owner + Admin billing, email + SMS contact OTP, plan limits and the platform ceiling. This still does not authorize full tenant implementation: G0 must be green and G1 must pass first.

## 6. First task to assign

Assign `P2-0001` and `P2-0101` as the first two linked work items:

- P2-0001: pin the existing source/database baseline;
- P2-0101: build the isolated PostgreSQL 16 two-tenant security harness.

The exact first developer instruction is in `32-IMPLEMENTATION-AGENT-INSTRUCTIONS.md`.
