# Identity, Authentication, Authorization and RLS

**Priority:** P0 / security gate G1.  
**Design status:** Proposed; requires database-security review and executable PostgreSQL proof before tenant implementation.

## 1. Core correction

Do not define pre-authentication `SECURITY DEFINER` functions over RLS-protected `admins` or `students` tables and assume the migration/table-owner role can read them. Do not make the migration owner the owner of runtime lookup functions. Do not grant a broad `BYPASSRLS` role to the API.

PostgreSQL behavior relevant to this design:

- `SECURITY DEFINER` runs with function-owner privileges.
- Table owners normally bypass RLS, but `FORCE ROW LEVEL SECURITY` subjects the owner to policies.
- Superusers and roles with `BYPASSRLS` bypass RLS.
- `SECURITY DEFINER` functions must use a trusted `search_path` and carefully restricted execution grants.

Official references: PostgreSQL 16 Row Security Policies, `CREATE FUNCTION`, `CREATE POLICY` and `SET LOCAL` are linked in `README.md`.

## 2. Identity model

Use a dedicated authentication control-plane model. Separate `auth_principals`, `auth_login_identifiers`, `auth_memberships`, `auth_credentials` and `auth_sessions`. It is not a general tenant-data model and is not readable directly by the ordinary app role. See ADR-IDENTITY-02. A student roster row is not automatically an authenticatable principal.

### `auth_principals` / `auth_login_identifiers` / `auth_memberships`

Use these normalized entities rather than a single overloaded directory row:

- `auth_principals`: stable principal ID and global account state.
- `auth_login_identifiers`: principal ID, identifier type, normalized value, verified state and timestamps; unique by `(identifier_type, normalized_value)`.
- `auth_memberships`: principal ID, institution ID, role, domain account reference, membership state and authorization epoch. A principal has exactly one institution membership in v2.0; membership selection is out of scope. Each institution has exactly one active `owner` and at most one active `admin`; a partial unique index enforces the single active Admin. A pending Admin invitation reserves the single Admin slot. Only the Owner may create, replace or disable the Admin.
- `auth_identity_directory` may remain as a materialized/control-plane lookup projection if performance requires it, but it is derived and transactionally synchronized; it is not a second source of truth.

### Optional `auth_identity_directory` projection

If lookup performance requires a denormalized projection, it contains only the fields required for identifier resolution and points to the normalized principal/membership records. It is rebuildable and is not the source of truth. A principal has one institution/role in v2.0, but the projection still points to the membership record.

Minimum projection fields: `principal_id`, `identifier_type`, `normalized_identifier`, `verified_state`, `principal_state`, `credential_ref`, `updated_at`. Unique lookup is by the approved `(identifier_type, normalized_identifier)` key. Memberships are loaded only after credential verification, through the authenticated principal's permitted memberships.

### Credential storage

- Keep credential hashes out of registration request payloads and logs.
- Store staff password hashes in a restricted credential table or approved auth store; never return the hash to the browser.
- Student authentication continues to use the existing verified flow until its behavior is inspected in v1.5.0. Do not invent a new student password requirement.
- Reset/invite tokens are random, one-time, hashed at rest, purpose-bound and expire. Never email passwords.

### Synchronization

`auth_identity_directory` is the authoritative lookup index. Staff/student creation, email change, disablement, role change and institution-state change update the directory in the same database transaction. Use carefully scoped trigger functions or a single enforced domain write path. A consistency audit detects orphaned or stale directory rows. No asynchronous delay is allowed for disablement or role revocation.

## 3. Pre-authentication lookup

Provide narrowly scoped functions with separated responsibilities, such as `auth.lookup_login(identifier_type, normalized_identifier)` and `auth.list_memberships(principal_id, session_id)`.

`auth.lookup_login` contract:

- Returns only principal ID, identifier type, principal state and credential reference/hash needed by the approved verifier.
- Does not return institution names, tenant business data or an arbitrary first membership.
- Does not query tenant business tables.
- Reads only the auth principal, login identifier and credential records.
- Does not reveal whether an identifier exists through the public API response.

`auth.list_memberships` contract:

- Is callable only after successful authentication and is bound to the authenticated principal/session.
- Returns the principal's one current institution membership, including institution ID, membership ID, role, state and minimal display metadata.
- A selected membership is revalidated against current state before tenant context is issued.
- Membership selection is not part of v2.0; an unexpected second membership fails closed.

Both functions use a fixed trusted `search_path`, schema-qualified object references and revoked `PUBLIC` execution. Application rate limiting and security logging must not include raw password, OTP, refresh token or recovery token values.

Function owner role `examrobo_auth_fn`:

- `NOLOGIN`, `NOBYPASSRLS`.
- Not owner of tenant tables.
- Has only SELECT access to the required auth directory and credential columns.
- Has no SELECT on `students`, `admins`, papers, answers, invoices or other tenant tables.
- Is not a member of the migration owner or system role.

Separate login role `examrobo_auth_app` connects through a dedicated auth pool and receives EXECUTE only. The regular `examrobo_app` role cannot call pre-auth lookup functions.

The principal, login identifier and membership records are kept current in the same transaction as source account changes. If an optional lookup projection is used, synchronize it transactionally. Its synchronization must be database-enforced or implemented through one centrally enforced write service; a best-effort asynchronous copy is not acceptable for disablement or role revocation. A nightly consistency job is detection, not the primary synchronization control.

`examrobo_auth_app` receives `EXECUTE` on the lookup/session functions only; it receives no direct SELECT on auth credential tables and no tenant business-table access. `examrobo_app` cannot execute pre-auth identity lookup functions. Membership binding is derived from the authenticated principal/session and cannot accept an arbitrary principal or institution ID from the browser. Use a separate connection pool/credential and, where operationally feasible, a separately deployed authentication service. This limits the damage from an injection in an ordinary tenant query path.

## 4. Database roles

| Role | Login | BYPASSRLS | Object access |
|---|---:|---:|---|
| `examrobo_table_owner` | No | Yes, owner-only migration authority | Owns schema objects; no runtime secret |
| `examrobo_migrator` | CI-only / ephemeral | No direct runtime use | Can `SET ROLE examrobo_table_owner` only during migration window |
| `examrobo_app` | Yes | No | Required DML/SELECT on tenant tables subject to forced RLS; execute approved functions |
| `examrobo_auth_fn` | No | No | Auth directory/credential minimum only; owns auth lookup functions |
| `examrobo_auth_app` | Yes, dedicated auth pool/service | No | EXECUTE on approved auth/session functions only; no tenant business-table SELECT/DML |
| `examrobo_context_fn` | No | No | Reads private context keys and minimal auth/tenant-state/support-grant records; no tenant business tables |
| `examrobo_billing_fn` | No | No | Executes narrowly scoped tenant billing operations under RLS context |
| `examrobo_worker` | Yes | No | Claims system jobs/outbox; no direct tenant-wide access |
| `examrobo_platform_fn` | No | No | Explicit, limited platform operations and aggregate queries; audited |

`examrobo_table_owner` is a privileged role and must not have a normal application credential. The CI migration identity is time-limited, protected by deployment approvals and disabled outside migration windows. Do not use the migration role as a `SECURITY DEFINER` owner.

If a future function truly requires cross-tenant metadata, create a function-specific owner with only column-level/table-level privileges it requires and a narrow output contract. Do not solve permission errors by granting `BYPASSRLS` to the whole worker or API.

## 5. Signed tenant context (do not trust a plain GUC)

A plain `SET app.iid = '...'` is not an adequate tenant boundary when the shared app database role can set arbitrary custom parameters. An application bug or SQL injection that can issue arbitrary SQL may change it. The RLS policy must not trust an unsigned tenant identifier.

### Required design

Use a short-lived, signed context envelope generated only after authentication and authorization. The envelope binds:

- version and key ID;
- `institution_id`;
- subject/principal ID (human or registered service principal);
- principal type;
- role/scope;
- session version;
- institution authorization epoch;
- issued-at and expiry timestamps;
- request/transaction nonce.

The backend signs the canonical payload using HMAC-SHA-256. PostgreSQL verifies it through a reviewed `SECURITY DEFINER` helper using `pgcrypto` HMAC. The HMAC key is available to the authentication service through a secrets manager and to the context-verifier function through a private schema/table. `examrobo_app` cannot SELECT the key table or change the verifier function.

The application sets only the signed envelope using `SET LOCAL app.tenant_context = ...` inside the transaction. `app.current_iid()` validates signature, key ID, expiry and canonical encoding, then checks the current principal status/session version and current institution auth epoch/state against the minimal control-plane records before returning the institution UUID. A support grant must also be current, scoped and unexpired. The `examrobo_context_fn` owner has SELECT only on the private key table, human auth directory, service-principal table, institution auth-state table and support-grant table; it has no tenant business-table privileges. Any invalid/missing/expired token or stale auth epoch returns NULL or raises a fail-closed authorization error. RLS policies use only this verified helper.

This mechanism is security-sensitive custom code. Before adoption, require an independent review of canonical serialization, HMAC comparison, key rotation, transaction pooling, expiry skew and parser edge cases. If that review rejects it, choose an independently reviewed equivalent rather than reverting to an unsigned GUC.

### Context lifetime and replay

- Context is transaction-local; never use session-level `SET`.
- Maximum context lifetime is short (proposed 60 seconds) and must be no longer than the approved maximum request transaction.
- Token includes a random nonce and is bound to one tenant and subject. For a worker, it also binds job ID, job type and lease token; a stale worker lease cannot continue a tenant operation. Replay cannot change tenant identity; a context from another tenant must fail the current operation.
- Key rotation supports a current and previous key ID for a bounded overlap; old key is removed after all tokens have expired.
- The token is not a replacement for route-level authorization; its verifier does re-check current auth/session/tenant state so a revoked session or suspended institution cannot keep using a previously minted context until its short expiry. Full compromise of the application host or database administration plane remains outside the protection offered by this token.

## 6. RLS policy model

Every tenant-owned table has:

```sql
ALTER TABLE <tenant_table> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <tenant_table> FORCE ROW LEVEL SECURITY;
```

A standard tenant row policy uses the verified context:

```sql
CREATE POLICY tenant_isolation ON <tenant_table>
  USING (institution_id = app.current_iid())
  WITH CHECK (institution_id = app.current_iid());
```

Use command-specific policies if SELECT/INSERT/UPDATE/DELETE privileges differ. `USING` protects rows that may be read/updated/deleted; `WITH CHECK` protects inserted/updated rows. Never use a broad platform-role OR expression in a tenant policy.

`institutions` is keyed by `id`; its policy is `id = app.current_iid()`. `institution_contacts` uses `institution_id`. System and global tables follow `04-DATABASE-MODEL.md` classification and are not silently treated as tenant tables.

RLS does not govern `TRUNCATE`, table ownership, superuser access or all side channels. Revoke `TRUNCATE`, `REFERENCES`, `TRIGGER`, schema CREATE and unneeded privileges from runtime roles. Avoid tenant-sensitive functions that leak counts or existence.

## 7. Super Admin and support access

- Super Admin identity is stored separately from institution staff.
- Super Admin global dashboard queries run through restricted aggregate functions and return minimum necessary fields.
- Reading one institution's operational data requires an explicit support grant: target institution, purpose, actor, read/write scope, expiration and audit record.
- Sensitive support access requires institution authorization. If the institution cannot authorize, break-glass requires security and product approval, dual control, a documented emergency reason, a short expiry and full audit.
- Sensitive classes are student PII/contact data beyond aggregate counts, answers, recordings/evidence, billing identifiers and tenant exports.
- That operation obtains a short-lived tenant context for only the target institution; the Host header is never sufficient authorization.
- Student answers and proctor evidence are excluded from default support access.
- Every platform action is written to a separate append-only platform audit table.
- No impersonation, password retrieval or silent result-change feature is included in v2.0.0.

## 8. Current authorization checks

For each protected API request, validate current state from the authoritative auth/session records:

1. JWT signature, issuer, audience, expiry and key ID.
2. Session ID/JTI status and refresh rotation state.
3. Principal exists and is active.
4. Role and tenant membership match current state.
5. Session version matches current principal version.
6. Institution authorization epoch and administrative state are current.
7. Subscription entitlement allows the requested operation.
8. Route permission and target tenant match the signed context.

If the authoritative state store is unavailable, fail closed for protected writes and sensitive reads. A cache can accelerate lookup only with an explicitly approved maximum revocation delay; a requirement for immediate revocation means the DB/session source must be checked or the bounded delay must be explicitly accepted.

WebSocket tickets are one-use, short-lived, tenant-bound and session-bound. On revocation, publish a close event. Also revalidate session/epoch on heartbeat so a lost Redis event cannot leave a socket valid indefinitely. All socket joins and messages verify tenant ownership.

## 9. Security tests required before G1

- Auth lookup works with no tenant context and cannot read tenant base tables.
- Auth lookup role cannot SELECT unrelated columns/tables.
- `PUBLIC` cannot execute security-definer functions.
- Wrong `search_path` objects cannot shadow function references.
- Plain `app.iid` or `app.role` changes do not affect RLS.
- Missing, malformed, expired, tampered and wrong-tenant signed contexts fail closed.
- Valid signed context sees only one tenant.
- App role cannot read HMAC key or auth directory directly.
- Table owner, migrator, app, worker, auth and platform roles are tested separately.
- Pooled connection reused after tenant A, tenant B and invalid context has no leaked state.
- Super Admin has no unscoped direct table access.
- Account disable, role change, password reset, suspension and archive revoke HTTP and WebSocket access.
