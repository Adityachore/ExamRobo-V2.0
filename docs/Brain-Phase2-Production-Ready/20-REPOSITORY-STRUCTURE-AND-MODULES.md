# Repository Structure and Module Boundaries

## 1. Architecture style

Use a **modular monolith** for v2.0.0 unless source inspection proves that the current application already has a different stable service boundary. Do not introduce microservices solely because the product becomes multi-tenant. Preserve the current language, framework, build system and deployment path unless a measured blocker requires a separately approved change.

The objective is clear ownership and testability, not a wholesale rewrite.

## 2. Suggested logical backend modules

Adapt directory names to the actual repository conventions; preserve the boundaries.

| Module | Owns | Must not own |
|---|---|---|
| `identity` | Principals, login identifiers, credentials, sessions, revocation | Exam business data |
| `authorization` | Role/permission evaluation, membership selection, support grants | Password verification |
| `tenant-context` | Signed context issuance/verification and request propagation | Business policy |
| `institutions` | Institution profile, review/admin state, branding | Subscription-derived entitlement state |
| `students` | Roster records, import, student lifecycle | Global staff identity |
| `staff` | Admin/Employee membership, invitation, role changes | Platform-admin operations |
| `plans` | Plan catalogue and versioned features/limits | Invoice settlement |
| `subscriptions` | Periods, entitlement reconciliation and limit decisions | Provider HTTP transport |
| `billing` | Orders, invoices, payments, refunds, reconciliation | Unverified browser payment status |
| `registration` | Public applications, OTP, approval workflow | Tenant access before approval |
| `exams` | Existing event, attempt, timer, answer and result behavior | Tenant selection from client payload |
| `question-bank` | Institution-scoped question data/import | Cross-tenant reuse unless explicitly licensed |
| `notifications` | Templates, outbox dispatch, provider adapters | Durable business state |
| `jobs` | Queue claiming, leases, retries and dead letters | Unscoped tenant queries |
| `privacy` | Requests, anonymisation, restore tombstones | Ad hoc deletion from random route handlers |
| `platform` | Super Admin operations, minimized analytics, support grants | Unrestricted raw tenant-table access |
| `audit` | Append-only security/business audit events | Passwords, tokens or raw secrets |

## 3. Layering inside each backend module

Use these conceptual layers:

- **Route/controller:** parse HTTP, authenticate, validate input, call one application use case, map stable response.
- **Application service/use case:** enforce authorization and business workflow; owns transaction boundary.
- **Domain rules:** pure decisions such as plan limits, subscription transitions and permission checks.
- **Repository:** parameterized SQL and explicit tenant scope; never infer tenant from arbitrary body input.
- **Provider adapter:** external HTTP/API integration; never hold a database transaction open during network calls.

Controllers must not contain long SQL, billing state machines or cross-module write sequences. Repositories must not make provider calls. Domain services must not depend on Express/Fastify/React or other transport objects.

## 4. Frontend module boundaries

Preserve the current frontend framework/router. Create distinct route groups and authorization guards for:

- public/authentication;
- platform Super Admin;
- institution Admin;
- Employee;
- existing Student/exam experience.

A hidden navigation item is not authorization. Every action must be protected by backend policy and rendered from `/me` or equivalent server-authoritative capabilities. Do not hardcode plan limits or roles as the source of truth in the browser.

## 5. Dependency direction

Allowed direction:

`route -> application service -> domain/repository/provider interfaces`

Cross-module calls go through exported use cases or events. Do not import another module's private tables or controller. Billing may emit `payment.confirmed`; subscription reconciliation consumes it. The browser's redirect to a success page is not an authoritative payment event.

## 6. Tenant context propagation

The server derives institution scope from verified identity/membership or a one-use worker authorization. A request body `institution_id` is never authoritative.

Pass an immutable request context object through application services. The database adapter creates a transaction and installs the verified, signed context transaction-locally. The same context must be attached to audit events and job payload metadata. Validate ownership before constructing Redis keys, object paths, WebSocket rooms or export queries.

## 7. Transaction boundaries

Use one explicit transaction per business command where atomicity is required. Examples:

- create institution + first Admin + initial subscription/trial + audit event;
- add employee + check staff cap + update identity directory + audit event;
- activate payment + record payment + transition invoice + insert outbox event;
- update student status + revoke session + audit event.

Never call Razorpay, SMS, email or object storage while holding a database transaction open. Use an outbox or staged workflow.

## 8. Code ownership checks

- Every tenant repository query accepts a trusted context parameter or runs inside a transaction with verified context.
- Do not export an unscoped `query()` utility to feature modules.
- Expose separate interfaces for `tenantTransaction`, `authLookup`, `workerClaim` and narrow `platformOperation`.
- System access requires named, audited functions, not a boolean `{system:true}` flag.
- Add static checks/lint rules against direct database pool use outside the database module.
