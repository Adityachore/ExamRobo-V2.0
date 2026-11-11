# G4 - privacy and recovery test cases

- Gate: G4
- Status: **WAITING FOR IMPLEMENTATION FREEZE - DO NOT EXECUTE YET**
- Source: `docs/Brain-Phase2-Production-Ready/08-DATA-PRIVACY-RECOVERY.md`,
  `09-MIGRATION-CUTOVER-ROLLBACK.md`, `11-TEST-STRATEGY.md`,
  `29-API-AND-DOMAIN-ACCEPTANCE-TEST-CATALOG.md`
- Evidence target: `../evidence/g4/`
- Protocol: `../GATE-REVIEW-PROTOCOL.md`

G4 cannot start until G3 is approved and the privacy/recovery implementation is
frozen. Use synthetic data and approved legal fixtures. Do not use real student
data or a real erasure request.

## 1. Case catalog

| Case | Title | Severity | Status |
|---|---|---|---|
| G4-LEGAL-001 | Current legal review, DPA, minor/school decision and retention matrix | Critical | WAITING |
| G4-LEDGER-001 | Durable external privacy ledger is available and audited | Critical | WAITING |
| G4-EXPORT-001 | Access/export returns only the verified subject's allowed data | Critical | WAITING |
| G4-EXPORT-002 | Export is tenant- and subject-scoped across files and signed URLs | Critical | WAITING |
| G4-ERASE-001 | Erasure request is verified, categorized, approved and idempotent | Critical | WAITING |
| G4-ERASE-002 | Anonymisation covers DB, search, Redis, storage, exports and logs | Critical | WAITING |
| G4-ERASE-003 | Legal hold blocks only required categories and is audited | Critical | WAITING |
| G4-LEDGER-002 | Privacy ledger survives restore of a pre-request backup | Critical | WAITING |
| G4-REST-001 | Restore remains quarantined until tombstone replay passes | Critical | WAITING |
| G4-REST-002 | Replayed tombstone does not corrupt retained legal data | Critical | WAITING |
| G4-REST-003 | Ingress is blocked until restore verification completes | Critical | WAITING |
| G4-REST-004 | Restore/recovery report is complete and approved | Critical | WAITING |
| G4-DUAL-001 | External ledger/database dual-write reconciles | High | WAITING |
| G4-PARTIAL-001 | Partial erasure is visible, retryable and not reported complete | High | WAITING |
| G4-NO-001 | No open Critical/High privacy/recovery finding | Critical | WAITING |

## 2. Detailed cases

### G4-LEGAL-001 - Current legal review, DPA, minor/school decision and retention matrix

- Requirement / risk: G4 legal readiness
- Severity: Critical
- Automation: manual
- Status: WAITING

Steps:

1. Verify counsel review is current and signed.
2. Verify DPA and school/minor responsibility decision.
3. Verify the retention matrix by data category and location.
4. Map each matrix row to an implementation control.
5. Record every open legal question with an owner.

Expected result:

- Legal documents are current.
- Retention/deletion rules are approved and implementable.
- No engineer is making a legal decision without an owner.

Evidence:

- Signed legal review, DPA, retention matrix, control mapping.

Pass criteria:

- Privacy/legal owner approves the gate input.

### G4-LEDGER-001 - Durable external privacy ledger is available and audited

- Requirement / risk: privacy ledger
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Write a privacy request to the external ledger.
2. Read it back through the approved access path.
3. Attempt unauthorized read/write/delete.
4. Restore the primary database and confirm the ledger is unchanged.

Expected result:

- Ledger is durable outside the primary database.
- Access is authenticated, authorized and audited.
- No normal application path can silently delete a ledger entry.

Evidence:

- Ledger read/write log, access audit, restore comparison.

Pass criteria:

- Ledger survives primary database restore.

### G4-EXPORT-001 - Access/export returns only the verified subject's allowed data

- Requirement / risk: access request
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Verify a subject identity through the approved process.
2. Request export as that subject.
3. Try another subject's ID, tenant and export ID.
4. Inspect every file and field.

Expected result:

- Only the verified subject's allowed data is returned.
- No other tenant, staff note or protected category leaks.

Evidence:

- Export manifest, file hashes, response logs.

Pass criteria:

- Subject scope is exact.

### G4-EXPORT-002 - Export is tenant- and subject-scoped across files and signed URLs

- Requirement / risk: export isolation
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Generate exports for A and B.
2. Reuse A's token with B's export ID.
3. Try guessed filenames/paths and expired URLs.
4. Check CSV formula injection escaping and PDF metadata.

Expected result:

- Cross-tenant export fails.
- URL is bound to tenant, subject, object and expiry.
- CSV/PDF output is safe.

Evidence:

- Response matrix, file inspection, URL scope.

Pass criteria:

- No cross-tenant or formula-injection path.

### G4-ERASE-001 - Erasure request is verified, categorized, approved and idempotent

- Requirement / risk: erasure workflow
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Submit an erasure request.
2. Verify identity and categorize the request.
3. Approve it through the required role.
4. Submit the same request twice.
5. Replay the approved job.

Expected result:

- One request, one decision, one effect.
- Duplicate/replay is idempotent.
- Every state transition is audited.

Evidence:

- Request rows, approval audit, job output, final state.

Pass criteria:

- No duplicate deletion or silent completion.

### G4-ERASE-002 - Anonymisation covers DB, search, Redis, storage, exports and logs

- Requirement / risk: full anonymisation
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Seed subject data in DB tables, search index, Redis, object storage, an old
   export and application logs.
2. Run the approved anonymisation.
3. Query every location for the subject identifiers.
4. Check the audit trail retains only what is legally required.

Expected result:

- Every inventory location is covered.
- No reversible identifier remains where policy requires deletion.
- Required audit/retention data is preserved.

Evidence:

- Location-by-location before/after report with redacted values.

Pass criteria:

- The anonymisation inventory is complete.

### G4-ERASE-003 - Legal hold blocks only required categories and is audited

- Requirement / risk: legal hold
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Place a legal hold on one category.
2. Run erasure.
3. Verify held data remains and other categories are erased.
4. Remove the hold after the approved period and rerun.

Expected result:

- Hold blocks only the required category.
- Every exception is audited and time-bounded.
- Re-run after hold release completes the erasure.

Evidence:

- Hold record, before/after rows, audit.

Pass criteria:

- No over-retention or over-deletion.

### G4-LEDGER-002 - Privacy ledger survives restore of a pre-request backup

- Requirement / risk: restore replay
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Create an accepted erasure request.
2. Restore a backup created before that request.
3. Verify the external ledger still has the request.
4. Replay the tombstone before ingress.

Expected result:

- Ledger survives restore.
- Replay is required; ingress cannot skip it.

Evidence:

- Ledger comparison, replay log, ingress state.

Pass criteria:

- Pre-erasure backup cannot resurrect erased data.

### G4-REST-001 - Restore remains quarantined until tombstone replay passes

- Requirement / risk: restore quarantine
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Restore a pre-erasure backup into a scratch environment.
2. Attempt application ingress before replay.
3. Run tombstone replay and verification.
4. Enable ingress only after approval.

Expected result:

- Ingress is blocked while quarantined.
- Replay must pass before opening access.

Evidence:

- Ingress attempts, replay report, approval.

Pass criteria:

- No quarantined database serves users.

### G4-REST-002 - Replayed tombstone does not corrupt retained legal data

- Requirement / risk: replay correctness
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Restore a backup with legally retained data.
2. Replay a tombstone that overlaps the retained category.
3. Compare rows, hashes and audit.

Expected result:

- Only the erasable data is removed.
- Retained legal data is intact.
- Replay is idempotent.

Evidence:

- Before/after report and replay log.

Pass criteria:

- No over-deletion or corruption.

### G4-REST-003 - Ingress is blocked until restore verification completes

- Requirement / risk: recovery control
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Start a restore.
2. Attempt API, worker and WebSocket ingress.
3. Complete verification.
4. Retry ingress.

Expected result:

- All ingress paths are blocked before approval.
- Ingress opens only after verification.

Evidence:

- Ingress matrix and timestamps.

Pass criteria:

- No partial access to a restoring database.

### G4-REST-004 - Restore/recovery report is complete and approved

- Requirement / risk: gate evidence
- Severity: Critical
- Automation: manual review
- Status: WAITING

Steps:

1. Record backup position, restore duration, row counts and replay result.
2. Record every mismatch and disposition.
3. Get operations and privacy owner approval.

Expected result:

- Report is complete and signed.
- No unexplained mismatch.

Evidence:

- Restore report with approvals.

Pass criteria:

- Independent reviewer can reproduce the result.

### G4-DUAL-001 - External ledger/database dual-write reconciles

- Requirement / risk: dual-write consistency
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Write a request while the primary DB succeeds and the ledger fails.
2. Repeat with the ledger succeeding and the DB failing.
3. Run reconciliation.

Expected result:

- No request is lost silently.
- Reconciliation identifies and repairs divergence.
- Every repair is audited.

Evidence:

- Failure-injection log and reconciliation report.

Pass criteria:

- Dual-write divergence is detectable and repairable.

### G4-PARTIAL-001 - Partial erasure is visible, retryable and not reported complete

- Requirement / risk: partial completion
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Fail one anonymisation location.
2. Run the request.
3. Check the user-visible and admin-visible status.
4. Retry and complete.

Expected result:

- Status is partial/failed, not complete.
- Retry is idempotent.
- Final completion covers every location.

Evidence:

- Status transitions and retry log.

Pass criteria:

- No false completion.

### G4-NO-001 - No open Critical/High privacy/recovery finding

- Requirement / risk: gate exit
- Severity: Critical
- Automation: manual review
- Status: WAITING

Steps:

1. Collect all G4 findings.
2. Classify, assign owner and verify fixes.
3. Rerun the full G4 suite.
4. Confirm no open Critical/High finding.

Expected result:

- Zero open Critical/High findings.
- Medium/Low findings have owner, due date and compensating control.

Evidence:

- Finding register and final rerun.

Pass criteria:

- Privacy/legal and operations owners approve G4.

## 3. G4 exit criteria

- G3 is `APPROVED`.
- Legal review, DPA, minor/school decision and retention matrix are current.
- External privacy ledger is durable and audited.
- Anonymisation covers every inventory location.
- Restore replay from a pre-erasure backup passes.
- No open Critical/High privacy/recovery finding.
- Privacy/legal and operations owners sign the G4 disposition.
