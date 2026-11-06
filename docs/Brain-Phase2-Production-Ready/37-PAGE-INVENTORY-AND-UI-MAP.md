# Page Inventory and UI Map

**Status:** Working UI design map for v2.0. Routes are proposed; existing v1.5 routes remain until migration.  
**Authority:** `13-UX-PORTALS-AND-FLOWS.md`, `00-PHASE-2-CHARTER.md` and `36-BUSINESS-AND-PRODUCT-DECISION-REGISTER.md`. If this file conflicts with file 36, file 36 wins.

## 1. Count

| Area | Screens |
|---|---:|
| Public / authentication | 8 |
| Super Admin portal | 10 |
| Institution portal (Owner / Admin / Employee) | 17 |
| Student portal | 5 |
| System-state screens | 5 |
| **Total UI screens** | **45** |

This count excludes reusable modals, drawers and overlays listed in section 6.

## 2. Design priority waves

| Wave | Screens | Why first |
|---|---|---|
| A - Entry and approval | P-01 to P-08, P-09 to P-11 | Nothing can be built or demoed without login, registration and platform approval |
| B - Institution core | P-19 to P-35 | Covers the actual institution product and role differences |
| C - Exam journey | P-36 to P-40 | Student exam experience must be preserved from v1.5 |
| D - Platform depth and states | P-12 to P-18, P-41 to P-45 | Analytics, audit, settings and shared failure states |

Recommended design order for fastest useful feedback: **Wave A -> B -> C -> D**.

## 3. Public / authentication

| ID | Proposed route | Page | Users | Priority | Required UI |
|---|---|---|---|---|---|
| P-01 | `/login` | Common Login | Staff, student, Elite-branded institution | P0 | One email field; generic failure; staff password path; student existing flow; Elite institution branding; no college selector; rate-limit and expired-session states |
| P-02 | `/platform/login` | Super Admin Login | Super Admin | P0 | Password + WebAuthn; separate platform host; no institution membership UI; lockout and device states |
| P-03 | `/register` | Institution Registration | Applicant | P0 | 4 steps: institution -> leadership/contact -> email+phone OTP -> review; privacy/terms consent; validation; resend timer; pending result |
| P-04 | `/application/status` | Application Status | Applicant | P0 | One-time hashed link/token; pending, more-information-requested, approved, rejected; no internal flags or reviewer notes |
| P-05 | `/invite/:token` | Invite / First Password Setup | Invited Owner/Admin/Employee | P0 | Token validity, password rules, confirm, forced change, expired/used token, session revoked state |
| P-06 | `/password/recover` | Password Recovery | Staff, Super Admin | P0 | Request form, generic acknowledgement, reset-token form, success, expired token; no account enumeration |
| P-07 | `/privacy` | Privacy Notice | Public | P0 | Readable legal layout, version/date, institution/school notice where required |
| P-08 | `/terms` | Terms of Service | Public | P0 | Readable legal layout, version/date, acceptance reference from registration |

## 4. Super Admin portal

| ID | Proposed route | Page | Priority | Required UI |
|---|---|---|---|---|
| P-09 | `/platform` | Dashboard | P0 | Total/active/trial/expired/suspended institutions, pending registrations, total students, exams this month, live count, MRR, expiry/payment alerts; aggregate only |
| P-10 | `/platform/registrations` | Registrations Queue | P0 | Status, type, submitted date, owner, verification, abuse signal marker; filter/search; approve/reject/request-more actions |
| P-11 | `/platform/registrations/:id` | Registration Review | P0 | Full application, contacts, verification evidence, reviewer checklist, reason, approval confirmation with Trial start and invite result |
| P-12 | `/platform/institutions` | Institutions List | P0 | Search/filter by type, plan, entitlement, administrative state; usage/health columns; pagination |
| P-13 | `/platform/institutions/:id` | Institution Detail | P0 | Tabs: Overview, Plan/Billing, Usage, Users, Events, Settings, Activity, Support; suspend/archive/owner-transfer actions; no raw student answers |
| P-14 | `/platform/plans` | Plans | P0 | Trial/Standard/Premium/Elite comparison; INR 10,000 and INR 20,000 per 30 days; roster/event/employee/Admin limits; GST shown as placeholder; edit drawer warns affected institutions; Elite contract-only |
| P-15 | `/platform/revenue` | Revenue and Invoices | P0 | Invoice/payment table, mismatch queue, refunds/credit adjustments, monthly/plan summary, CSV; pending/failed/refunded/chargeback states |
| P-16 | `/platform/analytics` | Analytics | P1 | 30/90/365/custom ranges; aggregate metrics; small-cell suppression; no student-identifying detail |
| P-17 | `/platform/audit-alerts` | Audit and Alerts | P1 | Platform audit stream, security alerts, support-access log, denied access, export; immutable event detail |
| P-18 | `/platform/settings` | Platform Settings | P1 | Support-access matrix, break-glass policy, notification settings, platform operators, retention references; no raw secrets |

## 5. Institution portal

Roles: Owner and Admin see billing and institution settings. Employee sees only permitted operational pages. Exactly one Owner and at most one Admin exist.

| ID | Proposed route | Page | Roles | Priority | Required UI |
|---|---|---|---|---|---|
| P-19 | `/app/onboarding` | First-Login Onboarding | Owner | P0 | Confirm institution, password, logo, contacts, phone/email verification, invite first employee; progress and skip rules |
| P-20 | `/app` | Institution Dashboard | All staff | P0 | Exam stats, plan strip, usage bars, remaining limits, expiry/read-only banner, upgrade prompt, live count, alerts |
| P-21 | `/app/students` | Students Directory and Import | All staff | P0 | Search/filter/status, add student, paste/CSV import drawer, row results: added/updated/conflict/invalid, roster uniqueness warning |
| P-22 | `/app/students/:id` | Student Detail | All staff | P1 | Profile, email, institution, status, roster/event links, results where allowed, disable action, audit reference |
| P-23 | `/app/events` | Events List | All staff | P0 | Upcoming/live/completed/archived, plan event count, create/edit/archive, empty and limit states |
| P-24 | `/app/events/:id` | Event Workspace | All staff | P0 | Tabs: Overview, Roster, Papers/Questions, Schedule, Live, Results, Settings; archive keeps data; no deletion of live exam |
| P-25 | `/app/questions` | Question Bank | All staff | P1 | Search/filter, import, duplicate source-key conflict, institution-only bank, usage in papers |
| P-26 | `/app/live` | Live Monitor | All staff | P0 | Active attempts, connection status, pause/resume/force-submit per permission, proctor events, no cross-tenant data |
| P-27 | `/app/results` | Results | All staff | P0 | Finalized/read-only states, filters, export, result detail, expired-plan read-only, no silent edits |
| P-28 | `/app/flags` | Flags | All staff | P1 | Integrity flags, event context, severity, evidence, reviewer action, audit |
| P-29 | `/app/tickets` | Tickets | All staff | P1 | Candidate support queue, status, assignment, resolved state, minimal PII |
| P-30 | `/app/employees` | Employees and Invitations | Owner, Admin | P0 | Employee list, invite, disable/enable, seat count (2/5/15), pending invite not counted, disabled frees seat, re-enable needs seat, 20-staff ceiling |
| P-31 | `/app/admin` | Admin Management | Owner only | P0 | Exactly one Admin slot; invite/replace/disable; pending invite reserves slot; disabled frees slot; audit history; Admin cannot create another Admin |
| P-32 | `/app/billing` | Billing and Plan | Owner, Admin | P0 | Current plan/period/usage, Trial/Standard/Premium/Elite comparison, pay/renew/upgrade, pending payment, invoices, GST placeholder, read-only expiry state |
| P-33 | `/app/settings` | Institution Settings | Owner, Admin | P0 | Profile, contacts, branding/logo, privacy notice, locale; Elite subdomain shown read-only; Trial/Standard/Premium shared path; no custom domains |
| P-34 | `/app/activity` | Activity and Audit | Owner, Admin | P1 | Institution-visible audit entries, filters, actor/time/target, no platform-only metadata |
| P-35 | `/app/support-access` | Support Access Approvals | Owner, Admin | P1 | Pending platform support requests, scope, reason, expiry, approve/deny, break-glass notice, audit link; no implicit access |

## 6. Student portal

| ID | Proposed route | Page | Priority | Required UI |
|---|---|---|---|---|
| P-36 | `/seb` | Browser and System Check | P0 | Secure browser check, device/connection check, retry, unsupported browser, instructions; v1.5 behavior preserved |
| P-37 | `/waiting` | Waiting Room | P0 | Candidate identity, exam name, start time, countdown, connection badge, instructions, no college selector |
| P-38 | `/exam` | Exam Runner | P0 | Timer, sections, question palette, answers, save state, connection/reconnect, integrity warning, submit confirmation, auto-submit, 15-minute recovery state |
| P-39 | `/result` | Result | P0 | Own result where allowed, read-only, withheld/not-published states, print/export if approved |
| P-40 | `/locked` | Locked / Access Ended | P0 | Lockout, force-submit, expired, revoked and support guidance; no sensitive detail |

## 7. System-state screens

These are shared state screens, not separate business pages. They still need distinct visual designs.

| ID | Proposed route/state | Screen | Priority | Required UI |
|---|---|---|---|---|
| P-41 | `*`, `/403` | Not Found / Forbidden | P0 | 404, 403, role-denied, safe back action; never reveal another tenant record |
| P-42 | `/maintenance` | Maintenance / Service Unavailable | P1 | Planned maintenance, retry, status message, support link |
| P-43 | App state | Suspended / Pending / Archived Institution | P0 | Suspended, pending approval, archived, read-only; distinct copy and support path |
| P-44 | Global state | Offline / Reconnecting | P0 | Offline banner, retry, queued-save state, reconnect success; critical for exam |
| P-45 | App state | Plan Limit / Upgrade Required | P0 | `402 plan_limit`, which limit was hit, current usage, upgrade path, no claim that data was deleted |

## 8. Reusable overlays, not counted as pages

Design these with the same visual system, but do not add them to the page count:

- plan edit drawer;
- invoice/payment detail drawer;
- refund/credit adjustment modal;
- institution suspend/archive/owner-transfer confirmation;
- support-access request and break-glass approval modal;
- employee invite/disable/enable drawer;
- Admin invite/replace/disable modal;
- student add/edit drawer;
- CSV import and per-row result drawer;
- event create/edit and archive modal;
- question import and duplicate-resolution drawer;
- event roster add/edit/import drawer;
- results export and read-only confirmation;
- exam submit, auto-submit and reconnect modals;
- session-expired and re-authenticate modal;
- payment checkout redirect and provider-pending state.

## 9. Must-have UI states

Every page must define the relevant subset:

- loading, empty, populated, partial success;
- validation error, server error, network error, retry;
- session expired and re-authenticate;
- no permission / wrong role;
- institution pending, suspended, archived;
- plan limit, plan expired read-only, pending payment;
- provider pending/failed/refunded;
- conflict, duplicate, invalid import row;
- offline/reconnecting;
- success and audit confirmation.

Exam-specific states:

- system check failed;
- waiting;
- active;
- reconnecting;
- submitted;
- auto-submitted;
- locked/force-submitted;
- expired;
- result withheld.

## 10. UI review checklist

Use this to check whether a design is on track:

- Exactly one Admin; no “add another Admin” action.
- Owner-only Admin management is visually distinct from Admin employee management.
- Employee seats are 2/5/15; pending invites do not count; disabled employees free seats.
- Owner/Admin are outside employee seats but count toward the 20-staff ceiling.
- No unlimited plan, annual plan or proration UI.
- Standard INR 10,000/30 days, Premium INR 20,000/30 days.
- GST is shown as an unapproved placeholder, not a final tax-inclusive price.
- No 24-hour grace period; only the 15-minute submission/reconnect recovery state.
- No custom-domain settings; Elite-only subdomain; Trial/Standard/Premium use the shared path.
- No student college selector; no shared family/guardian email.
- Support access requires institution approval or approved break-glass; sensitive data is not in the default view.
- Employees never see billing or institution settings.
- Expired plan shows read-only results, not a blocked live exam.
- Every destructive or financial action has confirmation and audit feedback.

## 11. Existing v1.5 page mapping

| v2 screen | Existing v1.5 source | Reuse status |
|---|---|---|
| P-01 Common Login | `web/src/pages/student/Login.jsx`, `/` | Reuse with staff/student identify and Elite branding |
| P-02 Super Admin Login | `web/src/pages/admin/AdminLogin.jsx`, `/admin/login` | Reuse structure; add WebAuthn and platform host |
| P-23 Events | `web/src/pages/admin/Events.jsx` | Reuse and tenant-scope |
| P-24 Event Workspace / Roster | `web/src/pages/admin/Roster.jsx` | Reuse pieces; restructure as event tabs |
| P-25 Question Bank | `web/src/pages/admin/Bank.jsx` | Reuse and tenant-scope |
| P-26 Live Monitor | `web/src/pages/admin/Live.jsx` | Reuse and tenant-scope |
| P-27 Results | `web/src/pages/admin/Results.jsx` | Reuse and add read-only/expiry states |
| P-28 Flags | `web/src/pages/admin/Flags.jsx` | Reuse and tenant-scope |
| P-29 Tickets | `web/src/pages/admin/Tickets.jsx` | Reuse and tenant-scope |
| P-36 System Check | `web/src/pages/student/Seb.jsx` | Reuse and restyle |
| P-37 Waiting Room | `web/src/pages/student/Waiting.jsx` | Reuse and add branding |
| P-38 Exam Runner | `web/src/pages/student/Exam.jsx` | Preserve behavior; restyle only with evidence |
| P-39 Result | `web/src/pages/student/Result.jsx` | Reuse and add withheld/read-only states |
| P-40 Locked | `web/src/pages/student/Locked.jsx` | Reuse and add support guidance |

## 12. What is not in v2.0 UI

- custom domain configuration;
- annual plans, proration or self-serve refunds;
- multiple Admins;
- shared family/guardian student login;
- student self-registration or college selection;
- exam history/top-N (deferred to v2.1);
- sensitive platform access without institution approval or break-glass;
- client-hosted/on-premise licensing screens.
