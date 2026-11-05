# Canonical Database Model — PostgreSQL 16

**Purpose:** Single source of truth for Phase 2 tables, tenant classification, relationships and database invariants. Actual executable DDL belongs in the application repository; this file specifies the required behavior.

## 1. Modeling rules

1. Every tenant-owned business row has `institution_id NOT NULL` after backfill.
2. Every tenant child-to-parent relationship is tenant-consistent at the database layer. Use composite `UNIQUE (institution_id, id)` on parent tables and composite foreign keys `(institution_id, parent_id)` from children.
3. A child-population trigger may copy `institution_id` from its parent, but if the caller supplies a different institution ID it must raise an error. Never silently rewrite a mismatched tenant ID.
4. RLS is enabled and forced on all tenant tables. See `03-IDENTITY-AUTH-RLS.md`.
5. All tenant unique indexes include `institution_id`, except deliberate global identity uniqueness and keys that already include a globally unique parent ID. Every exception must be listed here and tested.
6. App roles cannot TRUNCATE tenant tables or alter RLS, constraints, triggers or schema objects.
7. Currency values use integer minor units (paise) and explicit currency code. Never use floating point for financial arithmetic.
8. State columns have CHECK constraints or ENUM/domain constraints. Do not leave status as unconstrained free text.
9. Every new table is classified in this document in the same change that creates it; CI fails if classification is missing.

## 2. Core tenant tables

| Table | Tenant key | Classification | Important requirements |
|---|---|---|---|
| `institutions` | `id` | Tenant | One row per tenant; admin/review state only; no subscription-derived status writer |
| `institution_contacts` | `institution_id` | Tenant | Composite FK to institution; normalized contact email; primary-contact rule |
| `admins` | `institution_id` | Tenant | Only `admin`/`employee`; Super Admins stored separately; session version via auth directory |
| `students` | `institution_id` | Tenant | Global normalized email uniqueness is a deliberate v2 decision; preflight duplicates before migration |
| `exam_events` | `institution_id` | Tenant | `UNIQUE(institution_id,id)` for composite FKs |
| `roster_emails` | `institution_id` | Tenant | Preserve `UNIQUE(event_id,email)`; composite FK to event and optional student |
| `questions` | `institution_id` | Tenant | Source key unique per institution, not globally |
| `question_variants` | `institution_id` | Tenant | Composite FK to question; cannot cross institution |
| `papers` | `institution_id` | Tenant | Composite FK to event and student where applicable; preserve per-event candidate uniqueness |
| `answers` | `institution_id` | Tenant | Composite FK to paper and question/variant |
| `warnings` | `institution_id` | Tenant | Composite FK to paper |
| `proctor_events` | `institution_id` | Tenant | Composite FK to paper; sensitive event payload access restricted |
| `paper_questions` | `institution_id` | Tenant | Composite FK to paper and question |
| `paper_sections` | `institution_id` | Tenant | Composite FK to paper |
| `paper_attempt_history` | `institution_id` | Tenant | Composite FK to paper |
| `recordings` | `institution_id` | Tenant / legacy | Legacy rows only; no new writes or serving; storage deletion tracked separately |
| `feedback` | `institution_id` | Tenant | Composite FK to paper/event as applicable |
| `flags` | `institution_id` | Tenant | Composite FK to paper/event; actor references are tenant-consistent |
| `tickets` | `institution_id` | Tenant | Must be resolved from verified tenant context or explicit signed support request; no default-tenant fallback |
| `admin_actions` | `institution_id` | Tenant | Tenant audit entries append-only; no UPDATE/DELETE for runtime role |
| `subscriptions` | `institution_id` | Tenant | Constraint-protected timeline; all time values `timestamptz` |
| `tenant_entitlements` | `institution_id` | Tenant | One projection per institution, written only by entitlement reconciler |
| `invoices` | `institution_id` | Tenant | Immutable commercial snapshot after issue; corrections by approved credit/refund process |
| `payments` | `institution_id` | Tenant | Provider IDs unique; state machine and idempotency |

## 3. Global reference tables

| Table | RLS | Runtime permissions |
|---|---|---|
| `skills` | No tenant RLS | SELECT only for tenant app roles; no writes from tenant app |
| `plans` | No tenant RLS | SELECT for tenant roles; writes only through platform plan service; version/snapshot rules apply |

Global does not mean publicly queryable. GRANTs still restrict columns and operations.

## 4. Restricted system/control-plane tables

| Table | Purpose | Runtime access |
|---|---|---|
| `platform_admins` | Platform operator records | Auth/platform functions only |
| `service_principals` | Approved worker/service identities | Context/auth functions only; no human login |
| `platform_actions` | Global platform audit | Insert via approved platform function; read via restricted platform API |
| `platform_tenant_aggregate` | Minimized per-tenant KPI projection for platform dashboards | Platform aggregate function only; no row-level student data |
| `support_access_grants` | Purpose/scope/expiry for scoped platform support | Platform function and context verifier only |
| `auth_principals`, `auth_login_identifiers`, `auth_memberships`, optional `auth_identity_directory` projection | Deterministic principal/login/membership resolution | Auth lookup function only; no direct app SELECT |
| `auth_credentials` | Credential hashes / credential references | Auth function only |
| `auth_sessions` | Refresh token hashes, JTI, session revocation and expiry | Auth/session service only |
| `institution_auth_state` | Current institution auth epoch and administrative access state | Auth/context functions; updated transactionally |
| `registration_requests` | Unapproved public institution requests | Registration/platform service only |
| `otp_codes` | Hashed OTPs, attempts, expiry and consumption | Auth/registration functions only |
| `trial_history` | Abuse-prevention keyed fingerprints | Registration service only; retention policy required |
| `webhook_events` | Durable provider webhook inbox | Webhook/worker only |
| `invoice_seq` | Financial year sequence | Billing function only |
| `job_queue` | Work claims, leases and next-run times | Worker functions only |
| `tenant_job_targets` | Minimal tenant ID/due-time index for global schedulers | Scheduler function/worker only; no business payload |
| `job_runs` | Execution history and heartbeat | Worker writes; ops read-only |
| `job_dead_letters` | Exhausted jobs and replay metadata | Worker/platform controlled |
| `notification_outbox` | Email/SMS notification payloads | Notification worker/functions only; PII-minimized |
| `data_requests` | Application-side subject request workflow | Privacy service only |
| `data_request_subjects` | Opaque mapping from request to affected subject IDs/data classes | Privacy function only; restricted PII mapping |
| `support_intake` | Unresolved support request before institution is verified | Support intake service only; never default tenant |
| `data_request_events` | Append-only data request state changes | Privacy service insert only; audit read |
| `schema_migrations` | Migration history | Migration role only |

System tables are not automatically safe. They often contain PII or security state and require restrictive grants, encryption and audit.

## 5. Required new/changed table fields

### `institutions`
- `id UUID PRIMARY KEY`.
- `name`, `name_norm`, `college_code`, `type`, approved contact and address data.
- Separate `review_state` (`pending`, `info_requested`, `approved`, `rejected`) from `admin_state` (`enabled`, `suspended`, `archived`).
- `admin_state_reason`, `suspended_at`, `archived_at`, `created_at`, `updated_at`.
- No stored `trial/active/expired` field. Those values are derived from `tenant_entitlements`.
- `UNIQUE(id)` and indexes for registration/admin search.

### `institution_contacts`
- `id`, `institution_id`, contact fields, `is_primary`, normalized email and audit timestamps.
- `FOREIGN KEY (institution_id) REFERENCES institutions(id)`.
- At most one primary contact per institution using a partial unique index.
- Contact email is not itself a second login credential; the identity directory determines login ownership.

### `admins`
- Tenant staff only: role `admin` or `employee`; non-null institution ID.
- Super Admin accounts move to `platform_admins`.
- Password hash and session version live in the restricted auth store; the business staff row references `principal_id`.
- Composite unique key `(institution_id,id)` and FK to institution.

### `students`
- `id`, `institution_id`, `principal_id` nullable only if legacy student auth flow genuinely does not create a principal, `normalized_email`, `name`, `status`, timestamps.
- Global unique index on normalized email only after explicit owner approval and collision preflight.
- Do not put global unique constraints on `roster_emails` or `papers`; per-event uniqueness remains.

### `subscriptions`
- `id`, `institution_id NOT NULL`, `plan_id`, `starts_at NOT NULL`, `ends_at`, `status NOT NULL`, `events_used NOT NULL DEFAULT 0`, `limits_snapshot NOT NULL`, `price_snapshot_paise`, `currency`, `source`, audit timestamps.
- Allowed status set: `scheduled`, `trial`, `active`, `expired`, `cancelled`.
- `CHECK (ends_at IS NULL OR ends_at > starts_at)`.
- `CHECK (events_used >= 0)`.
- Composite FK `(institution_id, plan_id)` only if the plan catalogue is tenant-specific; current plans are global so use ordinary plan FK.
- Exclusion constraint per institution on half-open `tstzrange(starts_at, ends_at, '[)')` for statuses `scheduled`, `trial`, `active`.
- `btree_gist` extension must be installed/verified before the exclusion constraint.

### `tenant_entitlements`
- `institution_id PRIMARY KEY`.
- `access_state` (`trial`, `active`, `expired`, `none`).
- `current_subscription_id`, `plan_id`, `effective_from`, `effective_until`, `limits_snapshot`, `feature_snapshot`, `version`, `reconciled_at`.
- This is a projection used by API authorization/limits; subscription rows remain the historical source of truth.
- Only the subscription reconciliation function can write it.

### `plans`
- `code` CHECK/unique: `trial`, `standard`, `premium`, `elite`.
- `billing_mode` CHECK: `free`, `self_serve`, `contract`.
- `price_paise` integer; contract plans may be NULL; free plans are zero; self-serve plans are positive.
- CHECK enforces `billing_mode='contract'` iff `price_paise IS NULL` only if no other contract pricing representation exists.
- Duration and numeric limits must be positive or NULL for approved unlimited values.
- JSON feature data is schema-validated by application and a stable versioned contract.

### `auth_principals` / `auth_login_identifiers` / `auth_memberships` / `auth_credentials` / `auth_sessions`

See `03-IDENTITY-AUTH-RLS.md` and ADR-IDENTITY-02. A login identifier must resolve deterministically to one principal for its identifier type, but student roster/guardian email is not globally unique by default. Staff with multiple institution memberships must select one verified membership before tenant context is issued. Student records link to a principal only if the verified existing login flow requires it. Credential and session data are restricted and are not directly readable by ordinary app roles.

### `registration_requests`
- Never store raw OTP, raw status token or plaintext password.
- Prefer password creation after approval using an invite; if a password must be collected at registration, store a modern password hash in the auth credential store with short pending lifetime, not in the arbitrary JSON payload.
- Status token stored as a hash, one-time/rotatable and expiring.
- Payload is encrypted or field-minimized; access audited.

### Billing tables

- `invoices` snapshot plan code/description, price, currency, tax rate, tax components, place of supply, buyer details, issued document reference and state.
- A paid invoice is not overwritten to change tax/price. Use credit note/refund/adjustment records under CA-approved policy.
- `payments` use unique provider order ID and payment ID; store amount/currency/status, not card data.
- `webhook_events` has unique `(provider,event_id)` and processing state; raw payload retention minimized/encrypted.
- `invoice_seq` update is atomic within invoice transaction.

## 6. Mandatory constraints and indexes

- CHECK every status column; no unconstrained status strings.
- `starts_at NOT NULL`; `ends_at IS NULL OR ends_at > starts_at`.
- `institution_id NOT NULL` on tenant rows after cutover.
- Composite FK binds tenant and parent identity.
- Unique `(institution_id, source_key)` for question import keys.
- Preserve per-event unique `(event_id,email)` on roster and papers.
- Unique normalized login identifier by approved identifier type; never impose global student-email uniqueness without product decision and collision evidence.
- Partial unique index permits only one open payment order per `(institution_id, plan_id)` if that behavior remains desired.
- `webhook_events(provider,event_id)` unique.
- `payments(provider_payment_id)` unique where non-null.
- Idempotency key unique within the business operation scope.
- Outbox/job indexes match claim predicates and sort order.

## 7. Composite foreign-key example

```sql
ALTER TABLE exam_events
  ADD CONSTRAINT exam_events_iid_id_uq UNIQUE (institution_id, id);

ALTER TABLE papers
  ADD CONSTRAINT papers_event_same_tenant_fk
  FOREIGN KEY (institution_id, event_id)
  REFERENCES exam_events (institution_id, id);
```

Apply equivalent constraints for papers→answers/warnings/proctor events, questions→variants, events→rosters and any other tenant parent link. If the existing schema uses non-UUID keys, adapt the pair to its real key types after source inspection.

## 8. Tenant table registry CI gate

CI must query `pg_class`, `pg_namespace`, `pg_policy`, `pg_attribute` and `information_schema` to assert:

- every expected table exists;
- every table is classified exactly once;
- every tenant table has `institution_id` or the documented `id` tenant key;
- `relrowsecurity = true` and `relforcerowsecurity = true`;
- expected command policies exist;
- runtime roles have no TRUNCATE/DDL grants;
- every foreign key between tenant tables includes the tenant key;
- every unique index is tenant-scoped or explicitly allow-listed;
- no new table can be merged without classification.

## 9. Unassigned support intake

Do not assign an unresolved ticket to `ParaRobo Default`. Create a system-scoped `support_intake` row with minimal contact data, no tenant access, a pending classification state and an assigned support owner. After verified institution resolution, move/attach it in a transaction and audit the linkage. This prevents accidental cross-tenant attribution.

## 10. Data model status

This specification is a target model, not executable DDL. The exact existing column names, indexes, triggers and FK types must be inventoried from `server/sql/schema.sql` before migration authoring. No guessed constraint should be applied to production.
