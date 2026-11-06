# Business and Product Decision Register — ExamRobo Phase 2

**Register version:** 1.1  
**Last updated:** 2026-11-06  
**Approval source:** Explicit product-owner selections in the project conversation on 2026-11-06.  
**Purpose:** Authoritative record of product/business decisions that affect the Phase 2 architecture, implementation and acceptance tests.

## Decision-state rules

- `APPROVED` means the product owner explicitly selected the decision. It does not mean implementation, legal review, security review or tests are complete.
- `PROPOSED` is a recommended default awaiting explicit owner approval.
- `OPEN` means required information/decision is still missing.
- `PARTIALLY APPROVED` means the core policy is approved but one or more operational edge cases remain unresolved.
- Do not infer approval from a recommendation, an earlier draft, or an implementation convenience.
- When a decision changes, append a revision entry; do not erase its history. Update all affected requirements, architecture, schema/API contracts, backlog and tests in the same change.

## Approval summary

| ID | Decision | State | Approval date | Remaining work |
|---|---|---|---|---|
| DEC-01 | Staff seats, single-Admin model and disabled/pending rules | **APPROVED** | 2026-11-06 | Implement employee seats, single-Admin uniqueness, pending-Admin reservation and disabled-slot release |
| DEC-02 | School plan eligibility and limits | **APPROVED** | 2026-11-06 | Legal, privacy and identity gates still block school/minor production onboarding |
| DEC-03 | Super Admin support access | **APPROVED (policy)** | 2026-11-06 | Security owner must finalize the detailed data/action matrix before enabling sensitive support |
| DEC-04 | Expired examination behavior | **APPROVED** | 2026-11-06 | Implement scheduled-end completion and the 15-minute technical recovery window |
| DEC-05 | Plan prices, GST placeholder, paid duration and Elite terms | **APPROVED (conditional)** | 2026-11-06 | Live invoicing remains blocked until CA approval of GST/refund/invoice treatment; Elite licensing remains a separate scope |
| DEC-06 | Legacy email-collision scan and identity migration disposition | **OPEN / MANDATORY PREFLIGHT** | — | Run read-only scan against actual v1.5.0 data and approve resolution workflow |
| DEC-07 | Providers, hosting and domain model | **PARTIALLY APPROVED** | 2026-11-06 | Managed-service providers, region, DNS/TLS, SMS and delivery evidence remain open |

---

## DEC-01 — Staff seats, single-Admin model and disabled/pending rules

**State:** APPROVED  
**Approved:** 2026-11-06

**Decision:** Each institution has exactly one Owner and at most one Admin. Employee seats are Trial 2, Standard 5 and Premium 15. Owner and Admin do not consume employee seats. The absolute platform ceiling remains 20 active staff accounts per institution.

**Required implementation behavior:**
1. Enforce exactly one active Admin per institution with a database uniqueness rule and a transactional service check.
2. Only the Owner may create, replace or disable the Admin. The Admin may manage employees but may not create another Admin.
3. A pending Admin invitation reserves the single Admin slot. A second active or pending Admin must be rejected.
4. Disabling the Admin frees the Admin slot for a replacement; the disabled record and its audit history remain.
5. Pending employee invitations do not consume employee seats. The employee cap is checked atomically when an invitation is accepted.
6. Disabled employees do not consume employee seats. Re-enabling a disabled employee requires an available employee seat.
7. Disablement revokes the affected staff member's sessions/tokens according to the session-revocation SLO and must not restore access before authorization state is refreshed.
8. Usage reporting, billing snapshots and reconciliation must use the same seat-counting rules.
9. The absolute 20-staff ceiling counts Owner, Admin and active employees; Elite above the ceiling requires platform capacity approval.

**Alternatives considered:** multiple Admins per institution (rejected); disabled staff consuming seats (rejected); pending employee invitations consuming seats (rejected); Admin included in the employee cap (rejected).

**Risk if implemented incorrectly:** two Admins with conflicting control, over-allocation under concurrency, billing/report mismatch, or access retained after disablement.

**Affected documents:** `01-PRODUCT-REQUIREMENTS.md` R-101/R-106/R-118; `03-IDENTITY-AUTH-RLS.md`; `04-DATABASE-MODEL.md`; `05-SUBSCRIPTIONS-BILLING.md`; `13-UX-PORTALS-AND-FLOWS.md`; `29-API-AND-DOMAIN-ACCEPTANCE-TEST-CATALOG.md`; employee/Admin API and usage projections.

**Verification required:** single-Admin uniqueness; pending-Admin reservation; Owner-only Admin management; disabled employee exclusion; disabled Admin slot release; re-enable seat checks; concurrent employee acceptance; old-token and WebSocket revocation; 20-staff ceiling.

## DEC-02 — School eligibility and plan limits

**State:** APPROVED  
**Approved:** 2026-11-06

**Decision:** Schools and colleges are eligible for the same Trial, Standard, Premium and Elite plan catalogue and receive the same published limits for the same plan version. Institution type remains a separate classification attribute and must not silently alter plan eligibility or cap calculations.

**Boundary:** This approval is a product/pricing eligibility decision only. It is not legal approval to process minors' data, collect consent, onboard schools, import student records or launch school production accounts. LEG-01, LEG-02 and LEG-03 remain mandatory gates.

**Alternatives considered:** separate school caps; Trial-only school eligibility; school-specific plan catalogue. Not selected.

**Risk if implemented incorrectly:** hidden institution-type branching creates inconsistent entitlements; treating this decision as legal clearance could expose minors' data without approved safeguards.

**Affected documents:** `01-PRODUCT-REQUIREMENTS.md`; `05-SUBSCRIPTIONS-BILLING.md`; registration validation, plan display and entitlement tests; `15-OPEN-DEPENDENCIES.md`.

**Verification required:** same plan version yields the same plan features/limits for school and college fixtures; school/minor onboarding remains disabled until legal and privacy gate evidence is approved.

## DEC-03 — Restricted Super Admin support access

**State:** APPROVED (policy)  
**Approved:** 2026-11-06

**Decision:** Super Admin support access is restricted. A platform role is not a blanket authorization to inspect or mutate tenant data. The default platform experience uses aggregate/minimized information. No generic tenant RLS bypass is permitted.

**Minimum control requirements:**
1. Any tenant support access must be tied to a support ticket or recorded operational reason.
2. Grant must identify institution, resource/data scope, permitted action(s), start and expiry; least privilege is mandatory.
3. Require step-up authentication for sensitive support grants.
4. Sensitive access requires institution authorization. If the institution cannot authorize, an approved break-glass path requires security and product approval, dual control and a documented emergency reason.
5. Log grant creation, approval, use, denied attempts, revocation and expiry to an append-only platform audit stream.
6. Revoke access automatically at expiry and support explicit early revocation.
7. Student answers and proctor recordings/evidence are unavailable to default support access. Access to these classes is sensitive and requires the full approval path.
8. Do not implement impersonation, password retrieval, silent result changes or a generic “view as tenant” bypass.

**Sensitive classes:** student PII/contact data beyond aggregate counts, answers, recordings/evidence, billing identifiers, and tenant data exports.

**Open implementation detail:** The security owner must define the exact support-access matrix, approval separation and emergency revocation procedure before sensitive support features are enabled.

**Risk if implemented incorrectly:** cross-tenant disclosure, insider misuse, untraceable access or privilege escalation.

**Affected documents:** `01-PRODUCT-REQUIREMENTS.md` R-101/R-112/R-113/R-122; `03-IDENTITY-AUTH-RLS.md`; `08-DATA-PRIVACY-RECOVERY.md`; `13-UX-PORTALS-AND-FLOWS.md`; `14-ARCHITECTURE-DECISIONS.md`; support APIs and security tests.

**Verification required:** deny-by-default tests; scope/expiry/revocation tests; institution-approval and break-glass tests; no RLS bypass tests; append-only audit tests; sensitive-data exclusion tests.

## DEC-04 — Examination behavior at entitlement expiry

**State:** APPROVED  
**Approved:** 2026-11-06

**Decision:** At the exact entitlement end boundary, no new examination attempt may start. A student attempt that validly started before expiry may finish under its already-established exam schedule, through the original scheduled end. A 15-minute technical recovery window after the scheduled end is permitted only for final submission and reconnection. It does not add answer time. This is not a general tenant grace period and does not authorize new attempts or new exam creation.

**Required behavior:**
1. Use the authoritative server-side entitlement and exam schedule; do not trust client clocks.
2. The attempt's pre-expiry start authorization and established scheduled end must be durable and auditable.
3. New attempt-start requests at/after expiry are denied, including retries and alternate API/WebSocket paths.
4. A paused attempt remains governed by its original scheduled end; entitlement expiry does not extend it.
5. A disconnected student may reconnect only inside the 15-minute recovery window and only to continue/finish the existing attempt.
6. Final submission is accepted only inside the original exam rules plus the 15-minute recovery window; no extra answer time is granted.
7. Other tenant operations follow the expired/read-only policy; this exception is limited to already-running attempts.
8. Results become read-only after the attempt is finalized.

**Alternatives considered:** stop every attempt immediately at expiry (rejected); a tenant-wide 24-hour grace period (rejected); an unlimited reconnect window (rejected).

**Risk if implemented incorrectly:** unfairly terminating live exams or allowing unauthorized post-expiry attempts/time.

**Affected documents:** `01-PRODUCT-REQUIREMENTS.md` R-126; `05-SUBSCRIPTIONS-BILLING.md`; `13-UX-PORTALS-AND-FLOWS.md`; exam start/submit APIs, timers, sockets and QA tests.

**Verification required:** controlled-clock boundary tests for start denial; in-progress continuation; exact scheduled-end enforcement; 15-minute submission/reconnect; no extra answer time; paused/disconnected behavior; results read-only after finalization.

## DEC-05 — Plan prices, GST placeholder, paid duration and Elite terms

**State:** APPROVED (conditional)  
**Approved:** 2026-11-06

**Decision:** The approved commercial catalogue is:

| Plan | Duration | Base price (ex-GST) | Roster/event | Events/period | Employee seats | Admin seats |
|---|---:|---:|---:|---:|---:|---:|
| Trial | 7 days | Free | 700 | 10 | 2 | 1 |
| Standard | 30 days | INR 10,000 | 300 | 30 | 5 | 1 |
| Premium | 30 days | INR 20,000 | 700 | 100 | 15 | 1 |
| Elite | Contract | Contract | Contract | Contract | Contract | 1 |

**Commercial rules:**
1. Standard and Premium are monthly 30-day plans in v2.0. Annual plans and proration remain out of scope.
2. The 18% GST value is a placeholder only. Live invoices must not be issued from it until CA approval of GST, place-of-supply and invoice treatment.
3. Refund, cancellation, chargeback and upgrade/downgrade commercial terms remain placeholders until approved. The refund state machine may be implemented, but the policy must stay disabled for live use.
4. Elite is an open/licensed contract. Elite custom limits and licensing terms require a separate signed contract; client-hosted licensing remains a separate scope.
5. Price and limit snapshots are immutable at invoice/period creation. A plan edit applies only to future periods.
6. Do not invent any additional price, duration, tax rate or unbounded limit.

**Blocked work:** production checkout, live invoice amount configuration, public pricing claims using unapproved tax/refund terms, and final plan seeds that could issue live invoices.

**Required evidence:** signed plan catalogue, CA review for GST/invoice treatment, and approved refund/cancellation terms.

**Affected documents:** `00-PHASE-2-CHARTER.md`; `01-PRODUCT-REQUIREMENTS.md` R-104/R-105; `05-SUBSCRIPTIONS-BILLING.md`; `06-REGISTRATION-API-CONTRACT.md`; `13-UX-PORTALS-AND-FLOWS.md`; billing tests and invoice snapshots.

**Verification required:** 30-day period boundaries; price and limit snapshots; 18% GST placeholder cannot reach a live invoice; monthly-only checkout; Elite cannot be self-serve; no annual/proration path.

## DEC-06 — Legacy email-collision scan and identity migration disposition

**State:** OPEN / MANDATORY PREFLIGHT

**Decision:** Before identity migration, run a read-only scan against a verified v1.5.0 production backup or approved representative snapshot. Do not infer collision counts from design documents or sample CSVs.

**Scan coverage:**
- duplicate normalized email values within students;
- same normalized email across students, staff, Admins and platform users;
- same email across multiple institutions;
- null, blank, malformed and whitespace/case-variant values;
- any uniqueness constraints/indexes and authentication lookup behavior currently enforced by v1.5.0.

**Output:** collision category, stable source record IDs, institution references, normalized collision key in a restricted report, proposed manual resolution path and row counts. Avoid plaintext credentials and unnecessary personal data. Store the report under controlled access; do not include sensitive raw email lists in general project documentation.

**Rules:** no automatic deletion, merge, reassignment or “first row wins.” Preserve source data and record every manually approved resolution. Reconcile R-103 with the principal/login identifier/membership design before creating the target uniqueness constraints.

**Current identity intent:** one active individual student email with one owning institution; shared family/guardian inboxes are rejected; roster-level per-event email uniqueness is preserved. Final global uniqueness constraints and production backfill remain blocked by this scan.

**Blocked work:** final identity uniqueness constraints, production backfill and cutover. A dry-run scan can be prepared using synthetic fixtures before production data is available.

## DEC-07 — Providers, hosting and domain model

**State:** PARTIALLY APPROVED  
**Approved:** 2026-11-06

**Decision:**
- Payment provider: Razorpay.
- Email: Hostinger SMTP.
- Hosting: Hostinger VPS for the API, web app and workers, with separate managed PostgreSQL, Redis and object storage for production.
- Domain model: only Elite receives a platform subdomain. Trial, Standard and Premium use the shared platform path. Custom domains remain out of scope.
- The Host header must never be the sole source of tenant authorization. Tenant context still comes from the authenticated session and server-side resolution.

**Still open:**
- Exact managed PostgreSQL, Redis, object-storage providers and Hostinger VPS region/data residency.
- DNS, wildcard TLS and cookie-domain setup for Elite subdomains.
- SMS provider, DLT templates and delivery evidence.
- Hostinger SMTP SPF/DKIM/DMARC and delivery test.
- Razorpay KYC, test/live credentials and signed webhook proof.
- RPO/RTO and backup topology.

**Risk if implemented incorrectly:** host-header tenant spoofing, broken TLS/cookies on Elite subdomains, shared-hosting resource exhaustion, or production dependency on an unverified provider.

**Affected documents:** `00-PHASE-2-CHARTER.md`; `02-SYSTEM-ARCHITECTURE.md`; `03-IDENTITY-AUTH-RLS.md`; `04-DATABASE-MODEL.md`; `12-OPERATIONS-DEPLOYMENT.md`; `13-UX-PORTALS-AND-FLOWS.md`; `15-OPEN-DEPENDENCIES.md`; `21-API-CATALOG-AND-CONTRACTS.md`; `25-ENVIRONMENT-CONFIGURATION-AND-SECRETS.md`.

**Verification required:** host-resolution tests; Elite subdomain routing and TLS; non-Elite path routing; no host-header authorization bypass; provider credential isolation; SMTP delivery authentication.

---

## Remaining dependency register

| Dependency | State after this approval | Required next action |
|---|---|---|
| DEC-06 identity collision scan | OPEN / MANDATORY | Run read-only scan and approve manual resolution workflow |
| DQ-01/DQ-02 identity and student login model | PARTIALLY CLOSED | Keep unique individual-email intent; final constraints blocked by scan |
| DQ-03 school plan eligibility | CLOSED | Same plans approved; legal/privacy gates remain |
| DQ-04 expiry behavior | CLOSED | Implement scheduled end plus 15-minute recovery |
| DQ-05 commercial catalogue | PARTIALLY CLOSED | Prices/durations/limits approved; GST/refund/Elite licensing evidence open |
| DQ-06 support matrix | PARTIALLY CLOSED | Security owner finalizes data/action matrix and break-glass controls |
| DQ-07 staff email/multi-institution | PARTIALLY CLOSED | One institution per staff principal approved; collision scan remains |
| LEG-01/02/03 privacy, DPA, school/minor notices/consent | OPEN / GATING | Obtain current counsel review and approved documents/workflows before school/minor production onboarding |
| EXT-01/02 finance and refunds | OPEN / GATING FOR LIVE BILLING | CA/business approval for tax, invoice, refund and cancellation behavior |
| EXT-03 Razorpay | PARTIALLY CLOSED | Provider selected; KYC, credentials and webhook proof remain |
| EXT-04 SMS provider | OPEN | Select provider/DLT and prove delivery |
| EXT-05 email | PARTIALLY CLOSED | Hostinger SMTP selected; SPF/DKIM/DMARC and delivery proof remain |
| TECH-01/02 signed context and DB grants | OPEN / GATING | Independent security review and executed privilege/RLS evidence |
| TECH-03/04 legacy inventory and restore | OPEN / GATING | Complete source inventory and verified restore before migration/backfill |
| TECH-05 hosting sizing/region | PARTIALLY CLOSED | Hostinger VPS selected; managed-service providers, region and capacity remain |

## Revision history

| Date | Change | Authority |
|---|---|---|
| 2026-11-06 | Initial register created; DEC-01/02/03 approved; DEC-04 core policy partially approved; DEC-05/06 left open | Explicit product-owner selections |
| 2026-11-06 | v1.1: single-Admin model, employee seat values, prices/GST placeholder, 30-day monthly plans, scheduled-end expiry with 15-minute recovery, provider/domain decisions; corrected approval states | Explicit product-owner selections |
