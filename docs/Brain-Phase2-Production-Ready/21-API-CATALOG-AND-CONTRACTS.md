# API Catalog and Contract Baseline

**Status:** Proposed v2 contract. Exact existing v1.5.0 paths and response shapes must be inventoried and reconciled before implementation. Existing routes must not be renamed merely to match this catalog.

## 1. Global rules

- Prefix new routes with `/api/v2` only if the existing versioning scheme supports it; otherwise use the project's established versioning strategy and document compatibility.
- JSON request/response, UTF-8, ISO-8601 UTC timestamps, UUIDs, pagination with bounded `limit` and opaque/validated cursor or stable offset policy.
- Derive `institution_id` from verified auth membership/context. Reject or ignore client-supplied tenant IDs on normal tenant routes.
- The Host header may select the Elite login/branding surface but must never be the sole tenant authorization source. Trial/Standard/Premium use the shared path; Elite uses its platform subdomain.
- All write operations validate body, authorization, ownership, plan entitlement and idempotency where retryable.
- Use `Idempotency-Key` for payment orders, institution approval, invitations, roster imports where duplicate submission could create effects, refunds and provider callbacks.
- Foreign-tenant object IDs return the same not-found behavior as nonexistent IDs.
- Never return SQL errors, table names, credential hashes, OTPs, access tokens, payment secrets or unredacted provider payloads.

## 2. Authentication and session API

| Method | Route | Auth | Outcome |
|---|---|---|---|
| POST | `/auth/login` | Public + rate limit | Resolve one principal/login path; generic failure |
| POST | `/auth/membership/select` | Authenticated pre-tenant session | Select only a membership returned for the principal |
| POST | `/auth/refresh` | Refresh credential | Rotate refresh token; detect reuse |
| POST | `/auth/logout` | Authenticated | Revoke current session |
| POST | `/auth/logout-all` | Reauthenticated / policy | Increment session version and revoke all sessions |
| POST | `/auth/password/forgot` | Public + rate limit | Generic acknowledgement |
| POST | `/auth/password/reset` | Single-use reset token | Change credential and revoke existing sessions |
| GET | `/auth/me` | Authenticated | Server-authoritative principal, membership and capabilities |
| POST | `/auth/ws-ticket` | Authenticated tenant context | One-use, short-lived tenant/session-bound socket ticket |

The student login route must preserve the verified v1.5 flow. If it is not the same principal/password model as staff, keep a distinct server-side resolver; do not force students into an unapproved global-email uniqueness rule.

## 3. Public registration

| Method | Route | Outcome |
|---|---|---|
| POST | `/public/institution-applications` | Create rate-limited application; no tenant access |
| POST | `/public/institution-applications/:id/otp/request` | Send OTP through approved provider adapter |
| POST | `/public/institution-applications/:id/otp/verify` | Verify/consume OTP; issue hashed, short-lived status token if used |
| GET | `/public/institution-applications/status` | Check status using a scoped status token; do not leak other applications |
| POST | `/public/institution-applications/:id/resend` | Apply resend throttles and cooldown |

No public endpoint creates an active tenant or accepts an initial Admin's durable password until the approved workflow says it may. The approval operation is a separate audited platform action.

## 4. Platform Super Admin API

| Method | Route | Permission | Outcome |
|---|---|---|---|
| GET | `/platform/dashboard` | `platform.dashboard.read` | Minimized aggregates |
| GET | `/platform/applications` | `platform.application.read` | Filtered registration queue |
| GET | `/platform/applications/:id` | `platform.application.read` | One application, minimized PII |
| POST | `/platform/applications/:id/approve` | `platform.application.approve` | Idempotent tenant/Admin creation workflow |
| POST | `/platform/applications/:id/reject` | `platform.application.reject` | Reason, audit, notification outbox |
| GET | `/platform/institutions` | `platform.institution.read` | Search and status filters |
| GET | `/platform/institutions/:id` | `platform.institution.read` | Minimized institution summary |
| PATCH | `/platform/institutions/:id/state` | `platform.institution.suspend` or reinstate | Separate admin state; reason required |
| GET | `/platform/plans` | `platform.plan.read` | Plan catalogue |
| POST/PATCH | `/platform/plans` and `/platform/plans/:id` | `platform.plan.manage` | Versioned plan change; existing subscription snapshots preserved |
| GET | `/platform/billing/reconciliation` | `platform.billing.read` | Mismatches and provider totals |
| POST | `/platform/support-grants` | `platform.support.grant` + MFA/reason | Scoped, expiring support grant |

Super Admin APIs must use narrow platform functions/aggregate projections. Do not implement an unfiltered `SELECT * FROM tenant_table` endpoint.

## 5. Institution Admin API

| Method | Route | Permission | Outcome |
|---|---|---|---|
| GET/PATCH | `/institution/profile` | `institution.read` / `institution.manage` | Own institution profile only |
| GET | `/institution/usage` | `usage.read` | Entitlements and usage counters |
| GET/POST | `/institution/employees` | `staff.read` / `staff.invite` | Staff roster; cap under lock |
| PATCH | `/institution/employees/:id` | `staff.manage` | Own tenant; role/state change revokes sessions |
| GET/POST | `/institution/students` | `students.read` / `students.manage` | Roster and bounded import |
| PATCH | `/institution/students/:id` | `students.manage` | Own tenant; status changes revoke eligible sessions |
| GET/POST | `/institution/events` | `events.read` / `events.create` | Event cap checked atomically |
| PATCH/DELETE | `/institution/events/:id` | `events.manage` | Existing exam lifecycle constraints apply |
| POST | `/institution/events/:id/roster/import` | `roster.import` | Idempotent batch result with per-row outcome |
| GET/POST | `/institution/question-bank` | `questions.read` / `questions.manage` | Own institution question bank |
| GET | `/institution/billing` | `billing.read` | Own subscriptions, invoices, payments |
| POST | `/institution/billing/orders` | `billing.manage` | Server-calculated order and durable pending state |
| POST | `/institution/billing/verify` | `billing.manage` | Provider-side verification; browser result is not trusted |
| GET | `/institution/billing/invoices/:id` | `billing.read` | Own invoice metadata |
| GET | `/institution/billing/invoices/:id/pdf` | `billing.read` | Authenticated stream or short-lived signed URL |
| GET | `/institution/audit` | `audit.read` | Own institution's allowed audit events |

## 6. Existing exam API

All existing exam routes must be inventoried and assigned a row in `10-COMPATIBILITY-PERFORMANCE.md` evidence. For each route record: method, path, actor, permission, tenant source, query tables, writes, side effects, response contract, WebSocket/export/storage effects and regression test. No route is accepted as tenant-safe solely because its controller has an `institution_id` filter.

## 7. Webhook API

| Method | Route | Rules |
|---|---|---|
| POST | `/webhooks/razorpay` | Raw-body signature verification; durable unique inbox receipt before 2xx; async idempotent processing |

Webhook events must validate provider account, event ID, order/payment IDs, amount, currency and invoice/institution mapping. Never activate a subscription from a browser redirect.

## 8. Request and response conventions

Example successful response:

```json
{
  "data": { "id": "<uuid>", "state": "pending" },
  "meta": { "request_id": "<uuid>" }
}
```

Example error response:

```json
{
  "error": {
    "code": "plan_limit",
    "message": "The institution has reached this plan limit.",
    "details": { "limit": "employees", "used": 5, "max": 5 }
  },
  "meta": { "request_id": "<uuid>" }
}
```

Do not include tenant internals or sensitive existence information in public auth/registration errors.

## 9. Pagination, filtering and exports

- Require server-side tenant scope before applying caller filters.
- Enforce maximum page size; define stable sort with unique tie-breaker.
- Exports execute with the same RLS context as the initiating request or a narrowly authorized worker ticket.
- Export files are tenant-prefixed, private, encrypted where supported, short-lived and access-audited.
- CSV formula injection must be neutralized for untrusted cell values.
- Large exports use background jobs and an outbox/notification; never return a public object-store URL.

## 10. Contract-test checklist

Every route needs: schema validation, auth state, role denial, tenant A/B ownership test, pagination/filter test, retry/idempotency test where applicable, stable error test and response compatibility snapshot.
