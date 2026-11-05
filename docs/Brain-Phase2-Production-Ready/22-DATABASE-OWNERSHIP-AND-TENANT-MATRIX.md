# Database Ownership and Tenant Classification Matrix

## 1. Why this file exists

A multi-tenant database is not complete until every table, view, materialized view, function, trigger, sequence, index and external store has an explicit owner and access policy. This matrix is a required source inventory output; the entries below are target classifications, not proof that the current v1.5.0 schema matches them.

## 2. Table classification

| Classification | Tenant key | RLS expectation | Access pattern |
|---|---|---|---|
| `TENANT` | `institution_id NOT NULL` | ENABLE + FORCE | Normal app role under verified context |
| `TENANT_ROOT` | Institution `id` is the tenant key | ENABLE + FORCE or reviewed narrow access | Institution-scoped operation |
| `GLOBAL_REFERENCE` | None | No tenant RLS unless data is tenant-specific | Read-only app access to non-sensitive catalogue |
| `AUTH_CONTROL` | Principal/membership scope | No broad app access; narrow auth/context functions | Dedicated auth/context roles |
| `PLATFORM_CONTROL` | Explicit platform scope | Restricted function/API; never blanket tenant bypass | Narrow platform functions/aggregates |
| `WORKER_CONTROL` | Job/lease scope | Worker functions claim metadata; tenant payload access requires signed job context | Worker functions |
| `PRIVACY_CONTROL` | Request/subject opaque references | Highly restricted; external durable tombstone too | Privacy service/function |
| `UNASSIGNED_INTAKE` | No tenant until verified | No tenant access | Quarantined support/registration intake |

## 3. Target table inventory

| Table family | Expected tables (confirm exact v1 names) | Class | Required relation rule |
|---|---|---|---|
| Institution | institutions, institution_contacts | TENANT_ROOT/TENANT | Contact must reference same institution |
| Staff | admins or staff_accounts, staff_memberships | TENANT | Membership institution must match staff authorization context |
| Student | students, student_rosters, roster_imports | TENANT | Student-to-event/roster relations tenant-consistent |
| Exams | events, papers, answers, warnings, proctor_events, results | TENANT | Every child FK includes institution key where parent is tenant-owned |
| Questions | questions, variants, question_assets | TENANT | Import/source uniqueness scoped per tenant |
| Plans | plans, plan_versions, feature catalogue | GLOBAL_REFERENCE | Subscription stores immutable plan/price/limits snapshot |
| Subscription | subscriptions, tenant_entitlements, entitlement_events | TENANT | Institution lock and non-overlap rule |
| Billing | invoices, payments, refunds, billing_adjustments | TENANT | Same tenant across invoice/payment/subscription references |
| Identity | auth_principals, auth_login_identifiers, auth_credentials, auth_sessions, auth_memberships | AUTH_CONTROL | Membership is the only source of tenant membership |
| Registration | registration_requests, otp_codes, trial_history | UNASSIGNED_INTAKE/AUTH_CONTROL | No tenant access before approval; minimize PII |
| Audit | audit_events, platform_actions | TENANT or PLATFORM_CONTROL | Never mix tenant and platform visibility implicitly |
| Webhooks | webhook_events | WORKER_CONTROL | Unique provider/event ID; minimized encrypted payload |
| Jobs | job_queue, job_runs, job_dead_letters, tenant_job_targets | WORKER_CONTROL | Claimed metadata separate from tenant execution context |
| Notifications | notification_outbox, delivery_attempts | TENANT/WORKER_CONTROL | Payload minimized; provider send idempotency |
| Privacy | data_requests, data_request_events, data_request_subjects | PRIVACY_CONTROL | Mapping restricted and replayable from external tombstone ledger |
| Support | support_intake, support_access_grants | PLATFORM_CONTROL/UNASSIGNED_INTAKE | No default-tenant fallback; scope and expiry mandatory |

## 4. Principal and membership model recommendation

Do not force one global unique email onto every student row. Use distinct concepts:

- `auth_principals`: one authenticatable human/service identity;
- `auth_login_identifiers`: verified unique login identifiers mapped to a principal;
- `auth_credentials`: hashed authentication material;
- `auth_memberships`: principal-to-institution membership with role and account state;
- `students`: institution roster identity, which may not be an authenticatable principal;
- `student_auth_links`: optional link only where the existing student sign-in flow requires a principal.

A staff member may belong to more than one institution only if product/security owners approve the membership-selection experience. The user selects one of their authorized memberships before tenant context is issued. A student may share guardian contact details; such contact data must not be assumed to be a unique login identifier. If v1.5.0 relies on student email login, preserve it only after collision analysis and an approved deterministic resolution policy.

This recommendation supersedes any assumption that all staff and students must have one globally unique email. Record the approved identity policy in an ADR before migration.

## 5. Required inventory columns

Create a CSV/Markdown inventory (outside Brain, in repository evidence) with one row per DB object:

`schema, object_name, object_type, classification, tenant_key, owner_role, runtime_grants, RLS_enabled, RLS_forced, policies, FK_parent_objects, unique_indexes, read_paths, write_paths, PII_class, retention_class, migration_owner, reviewer, evidence`.

For views/functions include `security_invoker`/`security_definer`, owner, search_path and EXECUTE grants. For sequences include USAGE/UPDATE grants. For external stores include tenant prefix, IAM policy and retention.

## 6. CI registry assertions

CI must fail when:

- a new table is created without classification;
- a tenant table lacks the tenant key or forced RLS;
- a runtime role owns a tenant table or has `BYPASSRLS`;
- tenant child FK omits tenant ownership where required;
- unique indexes permit cross-tenant collisions or are unreviewed;
- a `SECURITY DEFINER` function has unsafe search_path or PUBLIC execute;
- a view exposes tenant rows outside reviewed access;
- a tenant object is written by an unscoped worker/job;
- object-store/Redis key construction accepts raw client tenant ID.

## 7. Ownership rule

Every data object has one module owner. Shared writes go through the owning module's use case or a reviewed database function. Other modules may consume a stable read model or event; they must not silently modify the owning module's tables.
