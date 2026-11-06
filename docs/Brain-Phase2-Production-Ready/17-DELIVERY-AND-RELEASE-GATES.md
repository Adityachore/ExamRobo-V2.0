# Delivery Plan and Release Gates

## 1. Scheduling policy

Do not publish calendar dates until the resource matrix and external dependency owners are filled. The prior 18–22 week timeline was based on an assumed team and does not include the additional security proof, external recovery ledger and migration hardening in this revised pack. Re-estimate after P2-0001 through P2-0006.

Use dependency-driven milestone scheduling. Parallelize UI shells and non-tenant design work, not database/security work that depends on unresolved decisions.

## 2. Milestones

| Milestone | Scope | Exit condition |
|---|---|---|
| M0 — Baseline | Source/DB inventory, restored scratch DB, duplicate scan, owners and decisions | G0 passes |
| M1 — Security proof | Auth lookup, signed context, role separation, Super Admin scope | G1 passes |
| M2 — Tenant foundation | Tenant keys, composite FKs, RLS, query contract, API/WS/cache/storage scoping | G2 passes |
| M3 — Identity and business integrity | Sessions, subscription, entitlement, limits, billing test mode | G3 passes |
| M4 — Registration and jobs | OTP, approval, notification outbox, queue/recovery | Job/API checks pass |
| M5 — Privacy and compatibility | Legal approvals, request ledger, restore replay, v1.5 regression | G4 passes |
| M6 — Hardening | Performance, penetration, UX, ops runbooks, rollback rehearsal | G5 pre-pilot passes |
| M7 — Pilot | 1–2 approved institutions, supervised exam day and reconciled payment | Pilot acceptance signed |
| M8 — Production | Controlled cutover, registration enabled last | Production authorization signed |

## 3. Hard gates

### G0 — Baseline and decision readiness

Required:
- actual v1.5.0 commit, schema and production backup pinned;
- full route/table/query/job/storage inventory;
- restored scratch DB verified;
- all login identity collisions reported and resolved or approved remediation path;
- named owners and reviewers;
- external dependencies and legal questions assigned;
- no unresolved architectural contradiction in the Phase 2 docs.

No tenant schema migration work on production before G0.

### G1 — Security proof and architecture approval

Required:
- executable PostgreSQL 16 proof of auth lookup with no tenant context;
- function owner has no tenant business table access;
- app, worker, auth, context, platform and migration roles tested independently;
- signed context is tamper/expiry/forgery tested and independently reviewed;
- Super Admin has no unscoped RLS wildcard;
- sensitive support access requires institution approval or approved break-glass and is fully audited;
- Elite subdomain routing does not trust the Host header as tenant authorization;
- missing/invalid context fails closed;
- key/role separation and pooled connection tests pass.

Only after G1 may the team begin full tenant-data implementation.

### G2 — Tenant isolation

Required:
- all tenant tables classified and forced RLS enabled;
- tenant-aware query contract implemented;
- composite tenant foreign keys and scoped unique indexes validated;
- APIs, CSV/PDF, WS, Redis, storage and jobs scoped;
- two-tenant direct SQL and application isolation suite 100% pass;
- no open Critical/High isolation finding.

### G3 — Database, identity and money integrity

Required:
- account lookup, collision policy and session revocation pass;
- single-Admin uniqueness, pending-Admin slot and Owner-only Admin management pass;
- employee seat counting excludes pending/disabled staff and handles re-enable concurrency;
- invalid subscription states/periods rejected by DB;
- concurrent renewal/expiry/plan changes tested;
- entitlement reconciler is sole lifecycle writer;
- expired entitlement blocks new attempts while started attempts finish to the original scheduled end with the 15-minute recovery window;
- webhook inbox, amount/currency verification and provider reconciliation pass;
- approved price/duration catalogue is snapshotted; 18% GST placeholder cannot reach a live invoice;
- CA-approved GST/invoice and refund policy;
- test-mode provider proof.

### G4 — Privacy and recovery

Required:
- current legal review, DPA, school/minor decision and retention matrix;
- durable external privacy ledger available and access audited;
- anonymisation inventory covers DB, logs, exports, Redis and object storage;
- restore from pre-erasure backup replays tombstones before ingress;
- restore/recovery report approved.

### G5 — Production release

Required:
- v1.5.0 compatibility report passes;
- performance budgets ratified and benchmarks pass;
- penetration/security review has no open Critical/High findings;
- backup/restore, failover, application rollback and feature disablement rehearsed;
- RPO/RTO and SLO signed off;
- operations/support runbooks, on-call and incident response ready;
- provider/live keys, CA and legal approvals complete;
- pilot success criteria achieved;
- production owner explicitly approves.

## 4. Pilot controls

- One or two institutions initially.
- Written pilot agreement and data processing terms.
- Limited student cohort and supervised exam schedule.
- Public registration remains disabled.
- Daily payment/webhook/entitlement reconciliation.
- Daily isolation/authorization log review.
- Named support/on-call owner during exam windows.
- Pilot exit review with incidents, performance, support burden and data correctness.

## 5. Production go/no-go

A release meeting reviews evidence, not opinions. Each gate has a named approver and artifact links. Any Critical finding is automatic NO-GO. High findings are NO-GO unless the independent security owner documents why it is not a release blocker and approves a time-bound compensating control; confirmed cross-tenant exposure cannot be waived. Business/legal/finance decisions cannot be made by engineers on behalf of the owner.

## 6. Release record

Record: version/tag, commit SHA, migrations, DB version, backup/PITR position, evidence links, gate approvals, open risks, known limitations, on-call roster, rollback/restore plan, customer communications, feature flags and explicit approver/time.
