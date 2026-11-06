# Open Decisions and External Dependencies

**Rule:** An unresolved item is not a default value. Every blocker needs an accountable owner, due date, decision/evidence and dependent work package. Do not close an item because a developer chose a convenient assumption.

## 1. Product and identity decisions

| ID | Decision required | Risk if unresolved | Owner/evidence required |
|---|---|---|---|
| DQ-01 | Approve principal/login-identifier/membership model, identifier types, staff multi-institution membership selection and existing student login compatibility | Ambiguous common login and migration collision | Product owner; source collision scan and written UX decision. **Partially closed 2026-11-06:** roles and one institution per staff principal are approved; login collision scan remains. |
| DQ-02 | Confirm student login identifier requirements; do not assume student/guardian email is unique; preserve roster identity if individual authentication is not required | Real school roster imports may be impossible or incorrectly merged | **Partially closed 2026-11-06:** one active individual student email with one institution; shared family/guardian inboxes rejected; roster-level uniqueness preserved; final constraints/backfill blocked by the collision scan. |
| DQ-03 | Confirm schools can use Trial and same plan limits as colleges | Wrong plan eligibility | **CLOSED 2026-11-06:** same plan catalogue/limits approved; legal/privacy gates still block school/minor onboarding. |
| DQ-04 | Confirm expired exam behavior and grace period | Scheduled exam may be blocked mid-session or allowed beyond contract | **CLOSED 2026-11-06:** no new attempts after expiry; started attempts finish to original scheduled end; 15-minute submission/reconnect only; no extra answer time. |
| DQ-05 | Confirm plan duration, staff/student/event limits and Elite contract behavior | Commercial promise may not match database limits | **Partially closed 2026-11-06:** Trial free/7 days, Standard INR 10,000/30 days, Premium INR 20,000/30 days, monthly only; 700/300/700 roster per event; employee seats 2/5/15; one Admin; ceiling 1000/100/50/20. 18% GST and refund terms remain placeholders; Elite licensing/terms remain open. |
| DQ-06 | Confirm support access scope for Super Admin; default is aggregate and minimized, no answer/proctor access | Excessive access to student data | **Partially closed 2026-11-06:** restricted policy approved; sensitive access requires institution approval or approved break-glass; security owner finalizes the data/action matrix. |
| DQ-07 | Confirm whether staff email can be shared across institutions; current proposed login model forbids ambiguous duplicate principals | Existing contact/admin records may collide | **Partially closed 2026-11-06:** one institution per staff principal approved; collision scan remains. |

## 2. Finance and provider dependencies

| ID | Dependency | Blocks | Required evidence |
|---|---|---|---|
| EXT-01 | GST rate, company GSTIN/state, place-of-supply and invoice/credit-note behavior | Live billing | Written CA approval and test invoice calculations |
| EXT-02 | Refund, cancellation, chargeback and subscription access policy | Pilot billing | Approved policy and state-transition tests |
| EXT-03 | Razorpay KYC, test/live credentials, merchant account and webhook setup | Live payment | **Provider selected 2026-11-06;** test transaction, signed webhook and live approval remain |
| EXT-04 | SMS provider, sender ID, DLT templates and delivery test | Institution/staff contact OTP (required before G3) | Provider approval and delivery evidence |
| EXT-05 | Email provider, sender domain, SPF/DKIM/DMARC and delivery test | Email OTP/invites/receipts | **Hostinger SMTP selected 2026-11-06;** domain authentication and tested delivery remain |
| EXT-06 | Autopay feasibility | Deferred unless scope changes | Provider/mandate limits checked against final plan invoice amount |
| EXT-07 | Elite subdomain DNS, wildcard TLS and cookie-domain setup | Elite subdomain launch | DNS records, certificate proof and host-routing tests |

## 3. Legal/privacy dependencies

| ID | Dependency | Blocks | Required evidence |
|---|---|---|---|
| LEG-01 | Current India privacy-law review for actual processing model | Production student data | Written counsel opinion against current law/rules |
| LEG-02 | Institutional DPA and subprocessor terms | Institution onboarding | Approved contract templates |
| LEG-03 | School/minor notices and consent responsibilities | School onboarding | Written counsel decision and workflow |
| LEG-04 | Retention by category, legal holds and deletion/anonymisation rules | Privacy jobs and production data | Approved retention matrix |
| LEG-05 | Backup/restore tombstone approach and ledger retention | Disaster recovery | Legal/security approval and restore proof |
| LEG-06 | Breach assessment and notification owner/timelines | Production operations | Current counsel-approved incident runbook |
| LEG-07 | Fraud fingerprint purpose, keyed hashing and expiry | Trial abuse control | Legal basis, data minimization and retention approval |

## 4. Technical/security dependencies

| ID | Dependency | Blocks | Required evidence |
|---|---|---|---|
| TECH-01 | Signed tenant-context design independent review | G1 | Threat model, canonical format, key rotation and PostgreSQL PoC |
| TECH-02 | Role/grant/function ownership matrix review | G1 | Executed SQL report for every runtime/function role |
| TECH-03 | Existing v1.5 source inventory | Migration | Route, table, index, trigger, SQL call-site and job inventory |
| TECH-04 | v1.5 production backup and restore | Backfill rehearsal | Restore evidence and checksum report |
| TECH-05 | Target host/database sizing, Hostinger VPS region/data residency and managed-service providers | Performance/cutover | **Hostinger VPS direction approved 2026-11-06;** baseline environment and capacity report remain |
| TECH-06 | Tenant data storage inventory | RLS/privacy | PostgreSQL, Redis, object storage, logs and exports mapped |
| TECH-07 | Recovery ledger technology and separate IAM domain | Privacy restore gate | Selected service, durability/versioning test, access audit |

## 5. Resource dependencies

The owner must fill actual names and capacity; do not retain assumed team size as fact.

| Role | Named owner | Allocation | Reviewer | Status |
|---|---|---:|---|---|
| Product/business owner | TBD | TBD | TBD | BLOCKED |
| Principal architect | TBD | TBD | Independent security reviewer | BLOCKED |
| Database/migration engineer | TBD | TBD | Separate DB reviewer | BLOCKED |
| Backend/auth/billing engineers | TBD | TBD | Senior backend | BLOCKED |
| Frontend engineers | TBD | TBD | UX/QA | BLOCKED |
| QA automation/load engineer | TBD | TBD | QA lead | BLOCKED |
| DevOps/SRE | TBD | TBD | Security/architect | BLOCKED |
| Legal counsel | TBD | TBD | Business owner | BLOCKED |
| CA/finance reviewer | TBD | TBD | Business owner | BLOCKED |

## 6. Decision closure format

For each DQ/EXT/LEG/TECH item, record: `ID`, current state, owner, due date, decision, evidence URL/artifact, dependent task IDs, reviewer and closure date. Do not erase closed decisions; append a closure record.
