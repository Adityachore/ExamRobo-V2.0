# Architecture Decision Record — Phase 2

**Status vocabulary:** PROPOSED = recommended but not approved; ACCEPTED = owner-approved; REJECTED = do not implement; SUPERSEDED = replaced by a later decision. The current archive is a proposal; decision owners must record approval in the project repository. The approved decision register is `Brain/ProjectReview.md` D-01..D-36; where this table is older, the register wins.

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
| ADR-012 | Subscription access is represented by periods plus a derived `tenant_entitlements` projection | Separates administrative suspension from paid/trial lifecycle | ACCEPTED (D-15/D-33); product/backend owner |
| ADR-013 | One `reconcileInstitution` service/function is the only lifecycle writer | Avoid competing expiry, payment and manual-plan writers | ACCEPTED (D-33); backend owner |
| ADR-014 | Exclusion constraint enforces non-overlapping valid subscription intervals | Database final defense against concurrent overlap | Proposed; database reviewer |
| ADR-015 | Jobs use at-least-once delivery with idempotent effects, leases and dead letters | Exactly-once across external providers is not a reliable general guarantee | Proposed; backend/DevOps |
| ADR-016 | Webhook inbox is durable before 2xx response | Provider retries can recover local DB unavailability | ACCEPTED (D-15/D-33); billing owner |
| ADR-017 | Privacy tombstones live in a separate protected failure/security domain | Older DB restore must not erase knowledge of accepted erasure actions | Proposed; legal/security/DevOps |
| ADR-018 | Restore runs in quarantine and replays applicable privacy tombstones before ingress | Prevent reappearance of pre-erasure personal data | Proposed; recovery owner |
| ADR-019 | Unresolved support intake is not assigned to default institution | Avoid false tenant attribution and access leak | Proposed; product owner |
| ADR-020 | Schema migrations are expand/backfill/validate/enforce/cutover; applied migrations immutable | Reduce lock and rollback risk | Proposed; database/DevOps |
| ADR-021 | Prefer forward application rollback on the migrated schema; restore is disaster recovery, not routine rollback | Restore may lose post-backup SaaS writes and v1.5 may lack new context | Proposed; CTO/owner |
| ADR-022 | Existing exam behavior is protected by golden regression tests | Tenantization must not rewrite exam functionality implicitly | Carried forward; QA owner |
| ADR-023 | Student email is intended to be unique per active individual student; shared family/guardian inboxes are rejected; final constraint/backfill awaits the collision scan | Deterministic login and one owning institution without guessing legacy merge behavior | ACCEPTED INTENT (D-10/DEC-06); product owner + data reviewer |
| ADR-024 | No school/minor production onboarding before legal sign-off | Minors' processing, notices and consent responsibilities are not determined here | Mandatory gate; counsel |
| ADR-025 | Prices/durations are approved; tax/refund treatment remains non-production until CA/business owner approval; 18% GST is a placeholder only | No assumed tax/refund term can become a production invoice | ACCEPTED (DEC-05); CA/business owner gates live invoicing |
| ADR-026 | Institution roles are Owner (one), Admin (exactly one), Employee (many); Owner and Admin manage billing; only Owner manages the Admin | Clear ownership, billing rights, single-Admin uniqueness and staff cap | ACCEPTED (D-05/D-34/DEC-01); product owner |
| ADR-027 | Billing, plans, invoices, payments, GST and reconciliation are in v2.0 | Owner-approved scope change from the 2026-11-05 baseline | ACCEPTED (D-15); business owner |
| ADR-028 | SMS OTP verifies institution/staff contacts only; student SMS is deferred | Roster/student records do not capture phone | ACCEPTED (D-35); product owner |
| ADR-029 | Plan table uses employee seats plus one Admin; pending invitations do not consume seats; disabled staff free seats; absolute platform ceiling remains | Commercial promise matches DB limits without unsafe overcommit | ACCEPTED (D-16/D-36/DEC-01); business owner |
| ADR-030 | Hostinger VPS plus separate managed PostgreSQL/Redis/object storage; Razorpay and Hostinger SMTP selected; Elite-only platform subdomain; custom domains out of scope | Controlled deployment without shared-hosting limits; Host header is not tenant authorization | ACCEPTED DIRECTION (DEC-07); providers/region open |

## Change protocol

An architecture decision change requires: decision ID, problem statement, considered options, selected option, security/data migration consequences, compatibility impact, test impact, rollback path, owner, reviewer and date. Update affected docs in the same change. Do not silently modify an accepted decision in code.


## ADR-IDENTITY-02 — Principal, login identifier and institution membership separation

**Status:** SUPERSEDED by D-04 (one institution per staff principal in v2.0; no membership selection).
**Decision:** Do not assume every student has a globally unique email. Model a principal separately from login identifiers, institution memberships and student roster rows. A staff principal has exactly one institution membership in v2.0. Student roster identity remains institution/event scoped; link it to an auth principal only where the v1.5.0 student login flow requires it.
**Reason:** Shared guardian email, imported student records and staff working across institutions can make a global email uniqueness rule invalid.  
**Consequence:** Login resolution must be deterministic. Ambiguous identifiers are blocked until resolved; the system never chooses the first row. Student auth compatibility is established from source inventory, not redesigned by assumption.

## ADR-PLATFORM-02 — No global Super Admin RLS wildcard

**Status:** PROPOSED / mandatory security constraint.  
**Decision:** Super Admin actions use narrow platform functions, minimized aggregate projections and scoped support grants. No generic platform session bypasses all tenant RLS policies. Any support access is purpose-bound, institution-scoped, permission-scoped, time-limited, step-up authenticated and audited. Sensitive access requires institution authorization or an approved break-glass path with dual control.

## ADR-STACK-01 — Preserve the existing v1.5.0 technology stack

**Status:** PROPOSED / default.  
**Decision:** Phase 2 is not a framework rewrite. Read exact manifests, lockfiles and runtime configuration, then extend the existing stack. New services/dependencies require measurable need, threat-model impact, operational owner and an ADR.
