# Requirement-to-Implementation Traceability Matrix

**Purpose:** No product requirement is considered implemented unless it maps to a module, data/API boundary, acceptance test and release gate. The rows below are target traceability; exact source paths and test filenames are filled during repository inventory.

| Requirement | Owning module(s) | Data/API area | Minimum verification | Gate |
|---|---|---|---|---|
| R-100 Tenant isolation | authorization, tenant-context, all tenant modules | RLS, composite FK, all tenant routes | SEC-001..016 + A/B API matrix | G1/G2 |
| R-101 Roles | authorization, staff, platform | membership/permission matrix | direct route denial by role | G2/G3 |
| R-102 Common login | identity | login identifiers and login API | AUTH-001..004 | G1/G3 |
| R-103 Student roster identity | students, identity | roster/student auth link | duplicate/shared-contact collision tests | G0/G3 |
| R-104 Plan catalogue | plans | plans and plan API | schema/seed/permission tests | G3 |
| R-105 Subscription lifecycle | subscriptions | periods/entitlements | concurrent boundary/state tests | G3 |
| R-106 Limit enforcement | subscriptions, students, staff, exams | usage/counters and create routes | parallel requests at final slot | G3 |
| R-107 Institution registration | registration | public application endpoints | abuse/idempotency tests | G4 |
| R-108 OTP verification | registration, notifications | OTP challenge/provider adapter | expiry/reuse/brute-force tests | G4 |
| R-109 Trial-abuse prevention | registration | keyed fingerprint/retention | collision, false-positive and expiry tests | G4 |
| R-110 Registration approval | platform, registration | atomic approve workflow | duplicate approval/retry tests | G4 |
| R-111 Super Admin creates institution | platform, institutions | platform function/API | no raw tenant wildcard tests | G2/G3 |
| R-112 Super Admin dashboard | platform | minimized aggregate projection | aggregate leakage and authorization tests | G2/G5 |
| R-113 Institution management | institutions | tenant profile/state API | A/B profile and suspension tests | G2/G3 |
| R-114 Plan management | plans | versioned plan catalogue | historic snapshot tests | G3 |
| R-115 Revenue/invoices | billing | immutable invoice/payment records | CA-reviewed invoice tests | G3 |
| R-116 Payment integration | billing | orders/webhook inbox | signature, amount, replay and reconciliation tests | G3 |
| R-117 Growth analytics | platform, analytics | minimized aggregate read model | aggregation accuracy/privacy tests | G5 |
| R-118 Admin onboarding/employees | staff, identity | memberships/invitations | staff cap and revocation tests | G3 |
| R-119 Employee scope | authorization, staff | permission matrix | direct HTTP denial tests | G2/G3 |
| R-120 Per-institution question bank | question-bank | tenant questions/assets | duplicate natural key and A/B tests | G2 |
| R-121 Tenant branding | institutions, storage | tenant profile/object storage | signed URL/path isolation | G2/G5 |
| R-122 Audit log | audit | tenant/platform audit events | immutable/tenant visibility tests | G2/G5 |
| R-123 Notifications | notifications, jobs | outbox/provider delivery | retry, duplicate and PII-redaction tests | G4 |
| R-124 Premium mobile flag | plans, feature access | versioned feature snapshot | entitlement/flag tests | G3 |
| R-125 Elite licensing | plans, billing | contract metadata | no accidental self-serve/nullable-price tests | G3 |
| R-126 Retention/archive | privacy, institutions, jobs | archive and retention state | category retention/restore tests | G4 |
| R-127 Isolation test gate | QA, authorization | CI tenant registry/security suite | mandatory green security suite | G2 |
| R-128 Session revocation | identity, authorization | sessions/session version/auth epoch | AUTH-005..010 | G3 |
| R-129 Reliable background jobs | jobs, notifications, billing | leases/runs/outbox | worker crash/duplicate/replay tests | G4 |
| R-130 Data lifecycle/privacy | privacy | data requests and external tombstone ledger | restore-before-traffic test | G4 |
| R-131 v1.5 compatibility | all affected modules | existing routes/exam engine | golden journeys/regression report | G5 |
| R-132 Subscription integrity | subscriptions, billing | DB constraints/reconciler | invalid/overlap/concurrent tests | G3 |
| R-133 Deterministic login identity | identity | principal/login identifier/membership | collisions and selection tests | G1/G3 |
| R-134 Unforgeable tenant context | tenant-context, DB | signed envelope/context verifier | SEC-004..007 and pool tests | G1 |
| R-135 Tenant-consistent relationships | database | composite FK/unique registry | foreign-tenant relationship inserts rejected | G2 |
| R-136 Privacy recovery tombstones | privacy, operations | external ledger and replay | pre-request backup restore | G4 |
| R-137 Safe rollback/recovery | operations, database | PITR, outbox/payment/privacy reconciliation | rehearsed rollback/restore report | G5 |

## Traceability completion rule

During implementation, add columns to the evidence ledger: `source_path`, `implementation_commit`, `migration_id`, `test_file`, `CI_run`, `artifact_link`, `reviewer`, `status`, `open_defect`. A requirement with an empty required-evidence field remains `NOT VERIFIED`.
