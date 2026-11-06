# Registration and API Contract — Phase 2

## 1. API principles

- All tenant routes derive institution context from the authenticated principal and verified membership, not request body/query values.
- Platform routes require a current `super_admin` identity and explicit action-level authorization.
- A platform request targeting a tenant must name the target in the route, verify permission, record purpose/reason and create scoped context. It does not receive a wildcard tenant role.
- Foreign tenant IDs return 404. Do not disclose another institution's existence.
- Role/permission mismatch retains the existing API contract where feasible; any change to 401/403 semantics must be documented and regression-tested.
- Mutating requests accept an idempotency key for operations that may be retried.
- Validation occurs server-side. Client-supplied amount, role, institution ID, plan limit and account status are never authoritative.
- Responses use stable error codes and correlation IDs; never return stack traces, SQL text, password hashes, OTPs or provider secrets.

## 2. Common authentication

Proposed endpoints (final path names must be reconciled with actual v1.5 routes):

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/identify` | Resolve login path without account enumeration |
| POST | `/api/auth/staff/login` | Verify staff credentials and issue session |
| POST | `/api/auth/student/continue` | Preserve existing student login/eligibility flow |
| POST | `/api/auth/session/refresh` | Rotate refresh session; detect reuse |
| POST | `/api/auth/session/logout` | Revoke current session |
| POST | `/api/auth/password/forgot` | Generic 200 response; queue reset if eligible |
| POST | `/api/auth/password/reset` | One-time token; bump session version |
| GET | `/api/auth/session` | Return current role, institution, entitlement and feature state |

The `identify` response must not reveal whether an email exists. Staff/student path ambiguity is resolved by `auth_identity_directory`; collisions stop migration. Exact student OTP/roster behavior is inherited from the v1.5 source after audit.

## 3. Public institution registration

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/public/registrations` | Create unverified request |
| POST | `/api/public/registrations/:id/verify` | Verify OTPs atomically |
| POST | `/api/public/registrations/:id/resend` | Rate-limited OTP resend |
| GET | `/api/public/registrations/status` | Status by hashed one-time token |
| POST | `/api/public/registrations/respond` | Submit requested information |

Registration is not institution activation. It creates a pending request only. Password setup should occur after approval via a one-time invite link, not by emailing credentials. If pre-approval password capture is retained for UX, store only a modern hash in a restricted credential store with expiry, and obtain security review.

## 4. Super Admin API

Proposed `/api/platform/*` or existing `/api/sa/*` route family:

| Method | Route | Scope |
|---|---|---|
| GET | `/api/sa/dashboard` | Aggregate KPIs only |
| GET | `/api/sa/registrations` | Registration queue |
| POST | `/api/sa/registrations/:id/approve` | Idempotent create institution + admin + Trial + outbox |
| POST | `/api/sa/registrations/:id/reject` | Reason required; audited |
| POST | `/api/sa/registrations/:id/request-info` | Message required; audited |
| GET | `/api/sa/institutions` | Search/list via restricted platform function |
| GET | `/api/sa/institutions/:id/summary` | Minimum operational summary |
| POST | `/api/sa/institutions/:id/suspend` | Reason and audit required |
| POST | `/api/sa/institutions/:id/reinstate` | Reason and audit required |
| POST | `/api/sa/institutions/:id/archive` | Reason and policy checks required |
| POST | `/api/sa/institutions/:id/plan` | Billing service; institution lock |
| POST | `/api/sa/institutions/:id/extend-trial` | Reason, cap and audit |
| GET | `/api/sa/plans` | List plans |
| POST/PATCH | `/api/sa/plans` | Platform plan management |
| GET | `/api/sa/revenue` | Aggregate finance view |
| GET | `/api/sa/invoices` | Filtered invoice operations with tenant scope |
| GET | `/api/sa/analytics` | Aggregate growth only |

Student answers, raw proctor events and broad user exports are not exposed through default platform endpoints. Add a separately approved support-access endpoint only if operations prove it necessary.

## 5. Institution Admin and Employee API

Keep existing `/api/admin/*` and `/api/bank/*` shapes where possible, but derive institution from auth context:

| Method | Route | Required behavior |
|---|---|---|
| GET/POST | `/api/admin/employees` | Owner or Admin only; live staff cap under institution lock |
| PATCH | `/api/admin/employees/:id` | Own institution; Owner/Admin; role/status change bumps session version |
| GET | `/api/admin/students` | Own institution, paged and filtered |
| POST | `/api/admin/students/import` | Atomic/partial-batch contract defined; return added/updated/conflicts/invalid |
| PATCH | `/api/admin/students/:id` | Own institution; disabling revokes session |
| GET/PATCH | `/api/admin/institution` | Owner or Admin only; branding and profile |
| GET | `/api/admin/usage` | Values from entitlement projection and tenant counts |
| GET | `/api/admin/billing` | Owner or Admin only; current and future periods, invoices, payments |
| POST | `/api/admin/billing/orders` | Owner or Admin; server-side plan/price/tax; idempotency key |
| POST | `/api/admin/billing/verify` | Owner or Admin; provider lookup; never trust browser success alone |
| GET | `/api/admin/billing/invoices/:id/pdf` | Owner or Admin; own institution only; signed short-lived storage URL or authenticated stream |
| POST | `/api/admin/events` | Enforce event cap under transaction |
| POST | `/api/admin/events/:id/roster` | Event lock/tenant scope; enforce roster cap and identity conflict policy |

All existing exam routes are tenant-scoped. Route-by-route inventory is mandatory before implementation. Do not assume the route names above exhaust v1.5.0.

## 6. Razorpay webhook contract

`POST /api/webhooks/razorpay`

1. Capture raw request bytes for this endpoint only.
2. Verify provider signature before JSON parsing or state mutation.
3. Validate event schema/version and expected merchant account.
4. Persist `(provider,event_id)` and raw/minimized payload durably with a unique constraint.
5. Return 2xx only after durable inbox receipt.
6. Worker processes event idempotently under invoice/payment state machine.
7. If provider lookup is needed, call outside DB transaction and persist the fetched result.
8. Amount, currency, order ID, invoice ID and institution mapping must all match.
9. Bad signature returns 400 and changes no financial state.
10. Database failure before durable receipt returns retryable failure.

## 7. Stable error contract

| Code | HTTP | Meaning |
|---|---:|---|
| `validation_error` | 400 | Invalid input |
| `unauthenticated` | 401 | Missing/invalid session |
| `session_revoked` | 401 | Current session no longer valid |
| `forbidden` | 401 or approved compatibility code | Role/action mismatch under existing contract |
| `not_found` | 404 | Missing or foreign-tenant object |
| `institution_pending` | 403 | Institution not approved; no protected tenant work |
| `institution_suspended` | 403 | Institution administratively suspended |
| `subscription_expired` | 402 | Entitlement expired for create/start actions; approved read-only access may remain |
| `plan_limit` | 402 | Limit reached; include `{limit, used, max, upgrade:true}` |
| `scheduled_period_exists` | 409 | Conflicting plan change while paid successor is scheduled |
| `idempotency_conflict` | 409 | Same key reused with different operation payload |
| `rate_limited` | 429 | Rate limit exceeded |
| `provider_pending` | 202 | External state not yet reconciled; no activation claim |
| `temporarily_unavailable` | 503 | Required authorization/data service unavailable; fail closed |

Never expose SQL constraint names or internal tenant IDs to unauthenticated callers. Log correlation ID and safe structured details.

## 8. API contract tests

- Snapshot every existing v1.5.0 route and response before implementation.
- Add tenant A/B route matrix for every GET/list/count/create/update/delete/export route.
- Verify foreign IDs produce indistinguishable 404s.
- Verify employee endpoints cannot invoke staff/billing/settings actions even by direct HTTP.
- Verify request body/query institution ID is ignored or rejected on ordinary tenant routes.
- Verify pagination/filter/export cannot widen tenant scope.
- Verify malformed and duplicate idempotency keys.
- Verify provider webhook retries and failures.
