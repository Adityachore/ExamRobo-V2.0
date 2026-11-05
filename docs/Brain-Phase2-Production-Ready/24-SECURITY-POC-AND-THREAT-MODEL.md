# Security Proof of Concept and Threat Model

## 1. Objective

Prove the hardest security property before tenantizing the real database: an ordinary runtime connection cannot read or mutate another institution's data, cannot forge its tenant context, and cannot use a broad platform privilege to bypass tenant boundaries.

## 2. Adversaries and failure modes

Test at minimum:

- authenticated tenant A user guesses tenant B UUIDs;
- malicious or compromised tenant A admin changes request JSON/query/path IDs;
- SQL injection executes arbitrary statements as the ordinary app role;
- developer accidentally omits tenant filter in a query;
- employee calls Admin-only route directly;
- stale JWT remains after staff disablement or institution suspension;
- worker lease expires while previous worker is still running;
- support operator attempts to inspect unrelated student/proctor data;
- pooled DB connection is reused after exception/timeout;
- malicious tenant uploads filename/path traversal or CSV formula payload;
- stolen webhook payload is replayed or signature omitted;
- secret/key rotation overlaps long-running application requests.

## 3. Required PostgreSQL roles

Create roles in a disposable PostgreSQL 16 cluster and test their memberships and grants:

- `examrobo_table_owner`: no login; tightly protected migration object owner; never a runtime credential;
- `examrobo_app`: ordinary tenant DML under forced RLS; no BYPASSRLS; not object owner;
- `examrobo_auth_fn`: no login; owns only narrow auth lookup functions; no tenant business-table access;
- `examrobo_auth_app`: dedicated connection identity; execute only approved auth/session functions;
- `examrobo_context_fn`: no login; owns context verification function; reads only private key/auth-state/support-grant metadata;
- `examrobo_worker`: claims work metadata through narrow functions; tenant execution obtains scoped context;
- `examrobo_platform_fn`: no login; owns purpose-specific platform functions/aggregate reads; no blanket tenant-table visibility;
- `examrobo_migrator`: ephemeral deployment identity; can assume owner role only during approved migration window.

For every role, produce a SQL report showing `rolsuper`, `rolbypassrls`, memberships, object ownership, table/column privileges, schema privileges, function EXECUTE, sequence privileges and default privileges. All ordinary runtime principals must be non-superuser and `NOBYPASSRLS`.

## 4. Signed tenant context proof

The implementation must prove, not assume:

1. Authentication resolves principal and approved membership.
2. Authorization checks account/session version, institution admin state, role and support grant if applicable.
3. Backend creates a canonical context payload with tenant, subject/service principal, scope, session/auth epoch, issued-at, expiry, key ID and nonce.
4. Context is HMAC-signed by a service that can access the signing key.
5. Database verifier can validate signature using a private secret unavailable to `examrobo_app`.
6. `SET LOCAL`/transaction-local context is used only inside a transaction.
7. RLS calls the verifier; unsigned/malformed/expired/stale context returns no access.
8. Transaction rollback/release leaves no tenant/system state on pooled connection.

The canonical encoding must be versioned, length-bounded, reject duplicate/unknown fields and use constant-time MAC comparison. Key rotation must allow a controlled overlap and retirement. Do not log envelope or key material. Independent security review must challenge the custom crypto boundary. If the reviewer rejects custom HMAC-in-Postgres, use a vetted alternative (e.g., per-tenant DB roles or a reviewed trusted-context broker) and update the ADR before proceeding.

## 5. Test fixture

Create exactly two test tenants with intentionally colliding business identifiers:

- Institution A and B;
- Admin A, Employee A, Student A;
- Admin B, Employee B, Student B;
- events, questions, papers, answers, results and invoices for each;
- one platform admin;
- one worker identity;
- one support grant restricted to one institution and read-only scope.

Seed matching IDs or similar natural keys where possible to catch filters that rely only on business keys.

## 6. Required attack tests

| Test ID | Attack | Required result |
|---|---|---|
| SEC-001 | A reads B row by guessed UUID | 0 rows/404 |
| SEC-002 | A updates B row | 0 rows; no mutation |
| SEC-003 | A inserts row with B institution ID | Rejected |
| SEC-004 | A changes `app.iid` GUC to B | Context verification fails |
| SEC-005 | Unsigned/malformed/expired context | Denied |
| SEC-006 | Reuse stale session after disable | Denied |
| SEC-007 | Reuse context after institution epoch changes | Denied |
| SEC-008 | App role calls auth lookup function | Permission denied |
| SEC-009 | Auth role selects student/business tables | Permission denied |
| SEC-010 | App role changes private HMAC key | Permission denied |
| SEC-011 | Platform dashboard requests raw B student rows | No access |
| SEC-012 | Scoped support grant reads another institution | Denied |
| SEC-013 | Pooled connection reused after failed transaction | No context inheritance |
| SEC-014 | Worker stale lease executes tenant mutation | Rejected |
| SEC-015 | Foreign tenant FK inserted | Composite FK rejects |
| SEC-016 | New tenant table omitted from registry | CI fails |

## 7. HTTP and non-database boundary tests

Test API list/count/search/export/download endpoints, Redis cache and locks, WebSocket rooms and fan-out, object-store paths and signed URLs, notifications, analytics and background jobs. A database RLS pass does not prove these stores are isolated.

## 8. G1 evidence package

- threat model and trust-boundary diagram;
- SQL migration for the isolated proof schema;
- exact PostgreSQL version/image digest;
- role/grant/ownership report;
- test source and command;
- complete test output, including intentionally failing negative tests before fix;
- connection-pool reuse test;
- independent reviewer report and disposition of findings.

G1 fails on any cross-tenant read/write, privilege escalation, context forgery, unresolved Critical/High issue or missing raw evidence.
