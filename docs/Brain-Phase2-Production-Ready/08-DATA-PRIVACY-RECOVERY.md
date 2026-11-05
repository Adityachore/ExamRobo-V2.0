# Data Lifecycle, Privacy Requests and Disaster Recovery

**Approval state:** Technical proposal only. Retention periods, legal roles, school/minor obligations, lawful bases, notice text, breach timelines and deletion duties require current legal review and CA review for financial records. Do not infer legal approval from this document.

## 1. Data inventory before policy

Maintain a data map across every store, not only PostgreSQL:

- PostgreSQL tables and materialized/derived data;
- Redis cache, sessions, rate limits and temporary results;
- object storage (logos, PDFs, exports, legacy recordings);
- provider systems (Razorpay, SMS, email);
- application logs, tracing, error reports and analytics;
- backups, WAL/PITR archives, snapshots and staging copies;
- support tickets and external recovery ledger.

For each category identify fields, purpose, institution/platform owner, access, legal basis, retention, deletion/anonymisation method, backup propagation and third-party processor.

## 2. Data classes

| Class | Examples | Required treatment |
|---|---|---|
| Student identity | name, email, student identifiers | Minimize; tenant access; approved retention and request handling |
| Exam activity | event, answers, scores, competency | Access restricted; determine retention separately from identity |
| Integrity evidence | warnings, proctor events, flags | Highly restricted; purpose/retention review; audit access |
| Staff identity | name, email, phone, credentials | Session revocation and account lifecycle |
| Institution contacts | contact details, GSTIN, address | Minimize; controlled exports and support access |
| Billing/tax | invoices, payment reference, tax details | Retain per CA/legal requirements; corrections through credit/refund flow |
| Fraud signals | trial-history keyed fingerprints | Keyed HMAC rather than plain hashes; purpose, access and expiry review |
| Authentication | password hashes, refresh hashes, OTP digests | Restricted access, short retention for transient tokens, never log plaintext |
| Security/audit | admin/platform actions, request IDs | Append-only; redact personal data where possible; retention policy |
| Notification payload | recipients and template variables | Minimize, encrypt where appropriate, purge after delivery window |

## 3. Legal and commercial approval questions

Counsel and the business owner must determine, based on actual processing facts:

- Which party is the relevant data fiduciary/controller and which party is processor/service provider for each purpose.
- Whether and when ExamRobo acts for its own purposes (billing, security, abuse prevention, support) rather than solely on an institution's instructions.
- DPA and subprocessor terms for each institution.
- Student notice, school notice and age/parental-consent responsibilities.
- Retention periods for identity, exam answers, integrity evidence, audit, billing, fraud signals and support cases.
- Access, correction, erasure and grievance workflows.
- Cross-border storage/processor conditions if applicable.
- Breach assessment, notification owner and required timelines.
- Whether anonymised results may be retained for product analytics and what standard makes them genuinely non-identifying.
- Whether hashed/derived trial fingerprints may be retained and for how long.
- Tax record retention and invoice correction procedures.

No school/minor onboarding or production student-data import until written legal sign-off is recorded.

## 4. Request workflow

Supported request types must be approved by counsel and implemented as explicit states:

`received → identity_verification_pending → verified → approved → processing → completed`

Alternative terminal states: `rejected`, `withdrawn`, `partially_completed`, `blocked_by_legal_hold`, `failed_retryable`.

Required metadata: request UUID, requesting institution, subject opaque ID, request type, verification method/result, scope/data categories, owner, due date, legal hold, state events, execution result and response timestamp. Never store raw identity documents or unnecessary sensitive information.

- Access export returns only the verified subject's own data and permitted metadata, not other students or institution-wide data.
- Correction requests update source-of-truth records and preserve a safe audit trail.
- Erasure/anonymisation is category-specific. Do not assume every record can or should be anonymised; financial, legal-hold, security or academic requirements may require different treatment.
- Each action is idempotent and restartable.
- Support access to a request is audited.

## 5. Durable erasure tombstone ledger (fix for F-16)

A `data_requests` table in the same PostgreSQL database is not sufficient as the sole restore-replay source. An older backup may predate the request row.

Use a separately protected recovery ledger in a distinct security/failure domain, such as a versioned append-only object store or separate managed ledger database with independent credentials and retention. Legal/security review selects the actual technology.

### Ledger record (minimum)

- Stable request UUID and monotonically ordered ledger sequence.
- Opaque subject ID / stable data-subject key, not raw email.
- Institution ID and affected data categories.
- Requested operation (`erase`, `anonymise`, `restrict`, `correct`, etc.).
- Verification and authorization state.
- Accepted and completed timestamps.
- Execution version and replay status.
- Cryptographic integrity metadata and audit correlation ID.

Minimize personal data in the ledger. Use encryption, access separation, versioning/immutability controls, backups and access logging. Keep tombstones at least as long as any backup or archive containing the pre-request data can be restored, unless counsel requires longer. Do not use the ledger as a general student database.

### Reliable acceptance protocol

1. Create request UUID and verify/authorize the request.
2. Write an `accepted` event to the durable ledger. If this fails, do not tell the requester the operation was accepted.
3. Insert the application `data_requests` row and processing job with the same UUID.
4. A reconciler repairs the case where external ledger write succeeded but database insert failed.
5. Process category-specific operations idempotently.
6. Append `completed`/partial/error event to the external ledger and database event log.
7. Send requester/institution confirmation only after verified completion.

No distributed transaction is assumed. The stable UUID, append-only ledger and reconciliation process close the dual-write gap.

## 6. Anonymisation design

- Create a data inventory/relationship map before writing any anonymisation SQL.
- Use stable opaque subject IDs to find every record and store, including answers, paper email snapshots, flags, proctor events, exports and object metadata.
- Replace direct identifiers with irreversible per-record tokens only when legally appropriate; use a keyed token scheme to prevent guessable email dictionary attacks.
- Remove credential hashes and revoke sessions.
- Remove or rotate contact details from logs and queued notifications.
- Delete object files where required and retain a non-identifying tombstone only if legally permissible.
- Recompute or invalidate caches/search indexes.
- Do not claim anonymisation if any retained field can reasonably re-identify the subject in context.
- Verify no original identifier remains in all inventoried stores; test known alias, case, whitespace and normalized variants.

## 7. Backup and restore protocol

Backups may contain pre-erasure data. Therefore restore is quarantined until privacy replay and consistency verification finish.

1. Restore PostgreSQL and object-store snapshots into an isolated recovery environment.
2. Record the database recovery target (WAL LSN/recovery time) and snapshot identifiers.
3. Disable public ingress, outbound email/SMS, webhooks and scheduled workers.
4. Obtain and verify the latest external recovery-ledger sequence from its independent security domain.
5. Replay all applicable accepted anonymisation/erasure tombstones for any subject that can exist in the restored backup. Replaying all still-relevant tombstones is safer than relying only on wall-clock comparison and must be idempotent.
6. Reconcile provider/payment inboxes and outbox events to avoid duplicate or lost external effects.
7. Rebuild/invalidate Redis and other derived stores; do not restore a stale cache as authoritative state.
8. Verify tenant isolation, row relationships, audit continuity, tombstone completion and payment state.
9. Generate a restore evidence report and get the recovery approver's sign-off.
10. Only then permit application ingress and worker execution.

If the external ledger cannot be reached or verified, do not open traffic. Escalate to the recovery owner.

## 8. Archive versus deletion

- Archive is an access/operational state and is not erasure.
- A blanket "never hard delete business entities" rule cannot override applicable privacy or statutory obligations.
- Define treatment by data class. Some invoice/tax records may require retention; student identifiers may require erasure/anonymisation; exam evidence may have a different approved window.
- Archive must not preserve unnecessary direct identifiers indefinitely.
- Reactivation does not restore credentials or bypass a prior deletion request.

## 9. Breach response

Define an incident runbook with: triage owner, containment authority, forensic evidence handling, tenant scope assessment, subprocessor coordination, legal assessment, notification approval, regulator/individual communication where required, remediation, post-incident review and evidence retention. Timelines and notification duties must come from current legal advice.

## 10. Mandatory privacy tests

- Access export never returns another subject's data.
- Request cannot be accepted without identity/authority verification.
- Duplicate request UUID does not duplicate effects.
- Restore from backup predating request replays tombstone before ingress.
- Ledger unavailable prevents false completion claims.
- External-ledger success / DB-write failure is reconciled.
- All relevant tables/files/logs/caches are covered by anonymisation inventory.
- Repeated anonymisation is safe and idempotent.
- Legal hold blocks destructive action and records why.
- Retention expiry is tested against approved policy, not a hard-coded assumption.
