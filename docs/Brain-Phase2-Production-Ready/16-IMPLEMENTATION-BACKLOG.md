# Phase 2 Implementation Backlog

**Status at creation:** All work is NOT STARTED unless source/CI evidence proves otherwise. This file is a proposed execution order, not a claim that work is underway.

## Work package 0 — Baseline and architecture closure

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0001 | Pin v1.5.0 Git commit, runtime versions and production schema baseline | Repository access | Baseline record |
| P2-0002 | Inventory routes, SQL call sites, tables, indexes, triggers, jobs, Redis/socket/storage | P2-0001 | Machine-readable inventory |
| P2-0003 | Restore production backup to isolated scratch and record metrics | P2-0001 | Restore + checksum report |
| P2-0004 | Run identity collision and student email/shared-email analysis | P2-0002 | Collision report and owner decision |
| P2-0005 | Complete tenant data map including logs, exports, Redis and object storage | P2-0002 | Data-store inventory |
| P2-0006 | Close DQ/EXT/LEG/TECH decisions needed for implementation start | Inputs above | Signed decision register |

## Work package 1 — Security proof of concept (before full tenant coding)

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0101 | Build isolated PostgreSQL 16 role/RLS test schema with synthetic A/B tenants | P2-0001 | Reproducible harness |
| P2-0102 | Implement/prototype auth identity lookup without querying tenant tables | P2-0101, DQ-01 | Auth role grants + function tests |
| P2-0103 | Implement/prototype signed tenant-context verification and key rotation | TECH-01 | Forgery/tamper/expiry/pooled tests |
| P2-0104 | Prove Super Admin scoped access without global RLS wildcard | P2-0101 | Unauthorized broad query denied |
| P2-0105 | Review all function owners, search_path, EXECUTE grants and runtime role permissions | P2-0102..0104 | Independent security sign-off |
| P2-0106 | G1 design gate review | P2-0101..0105 | Written approval to begin tenant implementation |

## Work package 2 — Schema, tenant graph and migration

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0201 | Finalize canonical schema and exhaustive table registry | P2-0002, P2-0106 | Schema review |
| P2-0202 | Add tenant keys and legacy tenant backfill in expand batches | P2-0201 | Backfill report |
| P2-0203 | Add tenant composite FKs, scoped unique indexes and checks | P2-0202 | Constraint validation report |
| P2-0204 | Add RLS policies/FORCE RLS and grants | P2-0106, P2-0203 | DB role/RLS test suite |
| P2-0205 | Add signed-context transaction-aware `q()` contract | P2-0204 | Context and pool tests |
| P2-0206 | Scope APIs, exports, WebSockets, Redis and object storage | P2-0205 | Cross-tenant matrix |
| P2-0207 | Run full tenant isolation suite and G2 review | P2-0206 | Green suite + reviewer approval |

## Work package 3 — Identity and session security

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0301 | Create auth identity directory/credentials/session schema | P2-0106, P2-0201 | DDL + schema tests |
| P2-0302 | Backfill principals and stop on unresolved collisions | P2-0004, P2-0301 | Zero unexplained collisions |
| P2-0303 | Add transactional identity synchronization and consistency audit | P2-0302 | Trigger/service consistency tests |
| P2-0304 | Implement common auth lookup and generic responses | P2-0303 | Auth/API tests |
| P2-0305 | Implement refresh rotation, revocation and session version/epoch | P2-0304 | Old-token invalidation tests |
| P2-0306 | Implement single-use tenant-bound WebSocket tickets and revocation | P2-0305 | Socket revocation tests |

## Work package 4 — Subscription, entitlement and billing

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0401 | Create plans, subscriptions and entitlement projection | P2-0207 | Migration/constraint report |
| P2-0402 | Implement institution-lock mutation protocol and reconciler | P2-0401 | Concurrent lifecycle tests |
| P2-0403 | Implement event/staff/roster limit enforcement | P2-0402 | Simultaneous cap tests |
| P2-0404 | Implement invoice snapshot/sequence and provider adapter | EXT-01, EXT-03 | CA-reviewed invoice + test payment |
| P2-0405 | Implement durable webhook inbox and reconciliation | P2-0404 | Duplicate/out-of-order replay report |
| P2-0406 | Implement refund/chargeback state machine | EXT-02 | Approved policy tests |
| P2-0407 | G3 financial integrity review | P2-0401..0406 | Sign-off |

## Work package 5 — Registration, jobs and notifications

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0501 | Implement registration/OTP/status-token schema and API | EXT-04, EXT-05 | Verified OTP/registration tests |
| P2-0502 | Implement approval workflow and atomic institution/admin/trial creation | P2-0303, P2-0402 | Idempotent approval tests |
| P2-0503 | Implement job queue, leases, heartbeat, retry and dead letters | P2-0201 | Concurrent worker tests |
| P2-0504 | Implement notification outbox/provider adapters | EXT-04, EXT-05 | Provider test deliveries |
| P2-0505 | Implement alerts and audited dead-letter replay | P2-0503 | Operational recovery test |

## Work package 6 — Privacy and recovery

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0601 | Obtain legal data map/retention/DPA/minor approval | LEG-01..07 | Written counsel approval |
| P2-0602 | Select and provision separate durable recovery ledger | TECH-07 | Access/durability/restore test |
| P2-0603 | Implement request ledger dual-write reconciliation | P2-0601, P2-0602 | Failure-injection tests |
| P2-0604 | Implement access export and category-aware anonymisation | P2-0601, P2-0207 | Full-store verification |
| P2-0605 | Implement quarantine restore and tombstone replay | P2-0602..0604 | Pre-erasure backup restore test |
| P2-0606 | G4 privacy/recovery approval | P2-0605 | Legal + security sign-off |

## Work package 7 — Compatibility, portals, performance and launch

| ID | Task | Depends on | Acceptance evidence |
|---|---|---|---|
| P2-0701 | Implement Super Admin, public and institution portals | P2-0207, P2-0306, P2-0407 | Browser QA |
| P2-0702 | Run all v1.5 exam golden and regression journeys | P2-0002, P2-0207 | Compatibility report |
| P2-0703 | Run 20/50/1,000-VU and soak profiles | TECH-05 | Benchmark report |
| P2-0704 | Complete penetration/security review | P2-0207, P2-0306 | No open Critical/High |
| P2-0705 | Run backup, restore, forward rollback and incident rehearsals | P2-0606 | Drill report |
| P2-0706 | Complete staffing, provider, finance and ops readiness | Resource matrix, external deps | Signed launch pack |
| P2-0707 | Pilot approval and controlled pilot | G0-G4 | Pilot acceptance report |
| P2-0708 | Production cutover approval | Pilot accepted | G5 sign-off |

## Assignment rules

Every task must have one accountable owner, implementer, independent reviewer, estimate, dependency and evidence artifact. AI agents may implement bounded tasks but cannot approve their own security/architecture work. Do not mark work complete based on generated documentation alone.
