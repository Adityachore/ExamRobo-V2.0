# Architecture Decision Record — Phase 2

**Status vocabulary:** PROPOSED = recommended but not approved; ACCEPTED = owner-approved; REJECTED = do not implement; SUPERSEDED = replaced by a later decision. The current archive is a proposal; decision owners must record approval in the project repository.

| ID | Decision | Rationale | State / required owner |
|---|---|---|---|
| ADR-001 | Use one shared PostgreSQL database with `institution_id` tenant ownership for standard SaaS | Preserves one deployment/data plane while isolating institutions logically | Carried forward; owner confirm |
| ADR-002 | Force RLS on every tenant table, including institutions and contacts | Prevent missing service filters from becoming cross-tenant reads | Proposed; security reviewer |
| ADR-003 | Use composite tenant foreign keys for all tenant parent-child relationships | Prevent cross-tenant references even when a service supplies a valid foreign UUID | Proposed; database reviewer |
| ADR-004 | Separate platform operators from institution staff records | Avoid nullable tenant identity and avoid platform wildcard in tenant RLS | Proposed; owner |
| ADR-005 | Keep Super Admin access explicit, scoped, purpose-bound and audited | Global role must not automatically bypass RLS | Proposed; security reviewer |
| ADR-006 | Use an authentication directory for deterministic pre-auth lookup | Avoid SECURITY DEFINER lookup functions over tenant tables with conflicting RLS context | Proposed; security reviewer |
| ADR-007 | One normalized login identifier maps to exactly one principal in v2.0.0 | Common login requires deterministic routing | Proposed; product owner; migration collision scan required |
| ADR-008 | Do not trust plain `app.iid` or `app.role` custom GUCs for RLS | Shared runtime role can set custom parameters | Proposed; security PoC/reviewer required |
| ADR-009 | Use short-lived signed tenant context verified inside PostgreSQL, or an independently reviewed equivalent | Prevent ordinary runtime SQL from forging another tenant ID by changing an unsigned GUC | Proposed; cryptographic review and PoC |
| ADR-010 | Migration/table-owner role is separate, non-runtime and unavailable to API/workers | Prevent application path from owning/bypassing tenant tables | Proposed; DevOps/security |
| ADR-011 | Runtime app, auth, worker and platform function roles have no BYPASSRLS | Least privilege and clear role boundaries | Proposed; database reviewer |
| ADR-012 | Subscription access is represented by periods plus a derived `tenant_entitlements` projection | Separates administrative suspension from paid/trial lifecycle | Proposed; product/backend owner |
| ADR-013 | One `reconcileInstitution` service/function is the only lifecycle writer | Avoid competing expiry, payment and manual-plan writers | Proposed; backend owner |
| ADR-014 | Exclusion constraint enforces non-overlapping valid subscription intervals | Database final defense against concurrent overlap | Proposed; database reviewer |
| ADR-015 | Jobs use at-least-once delivery with idempotent effects, leases and dead letters | Exactly-once across external providers is not a reliable general guarantee | Proposed; backend/DevOps |
| ADR-016 | Webhook inbox is durable before 2xx response | Provider retries can recover local DB unavailability | Proposed; billing owner |
| ADR-017 | Privacy tombstones live in a separate protected failure/security domain | Older DB restore must not erase knowledge of accepted erasure actions | Proposed; legal/security/DevOps |
| ADR-018 | Restore runs in quarantine and replays applicable privacy tombstones before ingress | Prevent reappearance of pre-erasure personal data | Proposed; recovery owner |
| ADR-019 | Unresolved support intake is not assigned to default institution | Avoid false tenant attribution and access leak | Proposed; product owner |
| ADR-020 | Schema migrations are expand/backfill/validate/enforce/cutover; applied migrations immutable | Reduce lock and rollback risk | Proposed; database/DevOps |
| ADR-021 | Prefer forward application rollback on the migrated schema; restore is disaster recovery, not routine rollback | Restore may lose post-backup SaaS writes and v1.5 may lack new context | Proposed; CTO/owner |
| ADR-022 | Existing exam behavior is protected by golden regression tests | Tenantization must not rewrite exam functionality implicitly | Carried forward; QA owner |
| ADR-023 | Student email remains globally unique only after shared-email/collision policy approval | Keeps current no-college-selector flow but may not suit school rosters | Proposed; product owner |
| ADR-024 | No school/minor production onboarding before legal sign-off | Minors' processing, notices and consent responsibilities are not determined here | Mandatory gate; counsel |
| ADR-025 | Commercial values/tax treatment remain non-production until CA/business owner approval | No assumed GST/refund/plan term can become a production invoice | Mandatory gate; CA/business owner |

## Change protocol

An architecture decision change requires: decision ID, problem statement, considered options, selected option, security/data migration consequences, compatibility impact, test impact, rollback path, owner, reviewer and date. Update affected docs in the same change. Do not silently modify an accepted decision in code.


## ADR-IDENTITY-02 — Principal, login identifier and institution membership separation

**Status:** PROPOSED; product owner approval required before identity migration.  
**Decision:** Do not assume every student has a globally unique email. Model a principal separately from login identifiers, institution memberships and student roster rows. A staff principal may have multiple memberships only if the product approves membership selection. Student roster identity remains institution/event scoped; link it to an auth principal only where the v1.5.0 student login flow requires it.  
**Reason:** Shared guardian email, imported student records and staff working across institutions can make a global email uniqueness rule invalid.  
**Consequence:** Login resolution must be deterministic. Ambiguous identifiers are blocked until resolved; the system never chooses the first row. Student auth compatibility is established from source inventory, not redesigned by assumption.

## ADR-PLATFORM-02 — No global Super Admin RLS wildcard

**Status:** PROPOSED / mandatory security constraint.  
**Decision:** Super Admin actions use narrow platform functions, minimized aggregate projections and scoped support grants. No generic platform session bypasses all tenant RLS policies. Any support access is purpose-bound, institution-scoped, permission-scoped, time-limited, step-up authenticated and audited.

## ADR-STACK-01 — Preserve the existing v1.5.0 technology stack

**Status:** PROPOSED / default.  
**Decision:** Phase 2 is not a framework rewrite. Read exact manifests, lockfiles and runtime configuration, then extend the existing stack. New services/dependencies require measurable need, threat-model impact, operational owner and an ADR.
