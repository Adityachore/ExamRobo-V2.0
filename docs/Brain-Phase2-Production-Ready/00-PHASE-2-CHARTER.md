# Phase 2 Charter — Multi-Tenant SaaS

## 1. Mission

Convert ExamRobo v1.5.0 into a production-grade, shared-database multi-tenant SaaS while preserving the exam experience and data integrity already delivered by v1.5.0.

The Phase 2 outcome is a tenant platform in which:

- every institution-owned row has one authoritative institution owner;
- application authorization and database row security independently constrain tenant access;
- login identity resolves deterministically before tenant access is granted;
- tenant context cannot be forged by changing an ordinary session variable;
- subscription, payment and entitlement state remains correct under retries and concurrency;
- background work is recoverable and idempotent;
- privacy requests survive restore of older backups;
- existing v1.5.0 behavior remains compatible or is explicitly migrated;
- no pilot or production release passes without reproducible evidence.

## 2. Product shape

| Actor | Scope |
|---|---|
| Super Admin | ExamRobo platform operations: institution approval, plans, billing operations, global KPIs and restricted support actions |
| Admin | Own institution profile, billing, staff, students, events, question bank and results |
| Employee | Own institution exam operations within the fixed permission matrix |
| Student | Exam participation using the existing roster-based student flow |

One shared PostgreSQL database is the v2.0.0 tenancy model. Database-per-tenant is out of scope for the standard SaaS plan. Elite client-hosted licensing remains a later, separately designed product.

## 3. Existing behavior to preserve

Unless a formally approved requirement says otherwise, Phase 2 must preserve:

- student exam start and submission rules;
- timer and autosave behavior;
- per-question delivery and attempt history;
- integrity tiers, warnings and proctor events;
- results visibility and competency analytics;
- question bank import behavior, except for tenant-scoping changes;
- existing API response shapes, adding fields rather than silently removing or renaming them;
- existing support and deployment workflows where they remain applicable.

## 4. Plans (commercial values are proposals until signed off)

| Plan | Duration | Base price (ex-GST) | Students/event | Events/period | Employees |
|---|---:|---:|---:|---:|---:|
| Trial | 7 days | Free | 700 | 10 | 2 |
| Standard | 30 days | ₹10,000 | 300 | 30 | 5 |
| Premium | 30 days | ₹20,000 | 700 | 100 | 15 |
| Elite | Contract | Contract | Unlimited/custom | Unlimited/custom | Custom |

Premium mobile app access is a feature flag only in this phase. Elite is contract metadata only; client-hosted licensing is not implemented.

GST rate, invoice wording, place-of-supply logic, refund policy and plan terms require business-owner and CA confirmation. Never ship an assumed value as a production decision.

## 5. Architecture principles

1. **Tenant ownership is explicit.** Every tenant-owned table has a non-null `institution_id`, including audit-sensitive, contact and billing tables.
2. **Deny by default.** Missing, malformed, stale or unverifiable tenant context yields no tenant rows or an authorization error; never fall back to a default tenant.
3. **RLS is defense in depth.** Every tenant table has enabled and forced RLS. Service checks remain mandatory. RLS is not represented as protection against a fully compromised DB superuser or application server.
4. **No broad Super Admin bypass.** Platform operators use explicit, scoped and audited platform functions. A `super_admin` claim must never turn tenant RLS into `TRUE` for all rows.
5. **No statement-settable elevation.** No `app.system=on`, unrestricted `SET ROLE`, or request parameter can grant cross-tenant access.
6. **Database constraints protect invariants.** Unique keys, composite foreign keys, CHECK constraints and exclusion constraints reject invalid persisted states.
7. **One lifecycle writer.** Subscription entitlement projection is written only by the reconciliation component.
8. **External I/O is outside business transactions.** Use transactional outbox/inbox patterns and idempotent workers.
9. **Restore is a product workflow.** Backup recovery includes replaying privacy tombstones, payment state and external work records before traffic resumes.
10. **Release gates require evidence.** A design statement or checkbox does not prove implementation.

## 6. Non-goals for v2.0.0

- Mobile app implementation.
- Client-hosted Elite installer or offline license engine.
- SSO / Google Workspace / Microsoft login.
- Cross-college question sharing.
- Per-employee custom permission toggles.
- Impersonation of institution users.
- White-label custom domains.
- Razorpay autopay / UPI mandates unless a later approved scope adds it.
- Multi-currency billing, annual plan/proration and mid-period price recalculation.
- Reintroducing screen recording.

## 7. Definition of project success

- No cross-tenant read, write, count, export, socket, cache or storage access in the approved isolation suite.
- No invalid subscription overlap or incorrect entitlement at a boundary under concurrent execution.
- No duplicate financial effect from duplicate or reordered provider events.
- A disabled/suspended identity loses access within the approved revocation SLO.
- A restore from a pre-erasure backup does not re-expose anonymised personal data.
- Existing v1.5.0 exam workflows pass regression tests on the migrated system.
- Performance meets ratified absolute and relative budgets on recorded hardware.
- No unresolved Critical/High security finding at production cutover.
- Every P0 product requirement has implementation, test evidence and an owner/reviewer sign-off.

## 8. Current approval state

This charter and the linked specifications define a target architecture. It is not evidence of production readiness. The project remains in planning until source inventory, decision closure, role design review and G1 evidence are complete.
