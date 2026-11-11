# G5 - production release test cases

- Gate: G5
- Status: **WAITING FOR IMPLEMENTATION FREEZE - DO NOT EXECUTE YET**
- Source: `docs/Brain-Phase2-Production-Ready/10-COMPATIBILITY-PERFORMANCE.md`,
  `12-OPERATIONS-DEPLOYMENT.md`, `17-DELIVERY-AND-RELEASE-GATES.md`,
  `29-API-AND-DOMAIN-ACCEPTANCE-TEST-CATALOG.md`
- Evidence target: `../evidence/g5/`
- Protocol: `../GATE-REVIEW-PROTOCOL.md`

G5 cannot start until G4 is approved and the release candidate is frozen. No
production launch, live keys or real student data before the final signed
approval.

## 1. Case catalog

| Case | Title | Severity | Status |
|---|---|---|---|
| G5-COMPAT-001 | Login and student roster golden journey | Critical | WAITING |
| G5-COMPAT-002 | Admin and employee workflows | Critical | WAITING |
| G5-COMPAT-003 | Exam creation and configuration | Critical | WAITING |
| G5-COMPAT-004 | Start, question delivery, timer, autosave, submit | Critical | WAITING |
| G5-COMPAT-005 | Refresh, reconnect and duplicate submit | Critical | WAITING |
| G5-COMPAT-006 | Proctoring, warnings and integrity events | Critical | WAITING |
| G5-COMPAT-007 | Result calculation and visibility | Critical | WAITING |
| G5-COMPAT-008 | Question bank import/export | High | WAITING |
| G5-COMPAT-009 | Analytics and reports | High | WAITING |
| G5-PERF-001 | 20/50/1,000 VU profiles within ratified budgets | Critical | WAITING |
| G5-PERF-002 | Soak test has no leak or degradation | Critical | WAITING |
| G5-SEC-001 | Penetration/security review has no open Critical/High | Critical | WAITING |
| G5-REST-001 | Backup and restore rehearsal passes | Critical | WAITING |
| G5-REST-002 | Failover rehearsal meets RPO/RTO | Critical | WAITING |
| G5-REST-003 | Application rollback to v1.5 passes | Critical | WAITING |
| G5-REST-004 | Feature disablement works without redeploy | Critical | WAITING |
| G5-OPS-001 | RPO/RTO and SLO are signed off | Critical | WAITING |
| G5-OPS-002 | Runbooks, on-call and incident response are ready | Critical | WAITING |
| G5-OPS-003 | Provider live keys, CA and legal approvals complete | Critical | WAITING |
| G5-PILOT-001 | Pilot acceptance criteria are met | Critical | WAITING |
| G5-REL-001 | Release record and explicit production approval | Critical | WAITING |

## 2. Compatibility cases

Use golden journeys captured from v1.5.0 before tenantization. Replay after the
release candidate is frozen. A new SaaS portal working does not waive a legacy
regression.

### G5-COMPAT-001 - Login and student roster golden journey

- Requirement / risk: v1.5 compatibility
- Severity: Critical
- Automation: automated + browser QA
- Status: WAITING

Steps:

1. Replay the v1.5 login journey for staff and student.
2. Resolve the roster for an existing event.
3. Compare status, fields, redirects and errors to the golden snapshot.

Expected result:

- Journey completes with the same externally visible behavior.
- No tenant feature breaks legacy login/roster.

Evidence:

- Golden snapshot diff and browser session recording.

Pass criteria:

- No approved regression.

### G5-COMPAT-002 - Admin and employee workflows

- Requirement / risk: v1.5 compatibility
- Severity: Critical
- Automation: automated + browser QA
- Status: WAITING

Steps:

1. Replay admin event setup, staff management and employee workflows.
2. Compare permissions and visible actions.

Expected result:

- Legacy admin/employee behavior remains compatible.

Evidence:

- Snapshot diff and API responses.

Pass criteria:

- No permission or workflow regression.

### G5-COMPAT-003 - Exam creation and configuration

- Requirement / risk: v1.5 compatibility
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Create an exam with sections, questions, duration and settings.
2. Compare the stored configuration and generated exam key.
3. Start the exam.

Expected result:

- Same configuration semantics and start behavior.

Evidence:

- Config snapshot and DB rows.

Pass criteria:

- No exam setup regression.

### G5-COMPAT-004 - Start, question delivery, timer, autosave, submit

- Requirement / risk: v1.5 compatibility
- Severity: Critical
- Automation: automated + browser QA
- Status: WAITING

Steps:

1. Start an exam as a student.
2. Deliver questions, wait across timer boundaries and autosave.
3. Submit and read the result.
4. Compare timing and payloads to the golden journey.

Expected result:

- Question delivery, timer, autosave and submit match the baseline.
- No answer loss.

Evidence:

- Timing trace, payload capture, result.

Pass criteria:

- No answer/timer/submit regression.

### G5-COMPAT-005 - Refresh, reconnect and duplicate submit

- Requirement / risk: v1.5 compatibility
- Severity: Critical
- Automation: automated + browser QA
- Status: WAITING

Steps:

1. Refresh during an exam.
2. Drop and restore the network.
3. Submit twice.

Expected result:

- Reconnect resumes the same attempt; duplicate submit is idempotent; no blank
  screen or redirect loop.

Evidence:

- Browser trace, server state, result count.

Pass criteria:

- No duplicate paper or lost attempt.

### G5-COMPAT-006 - Proctoring, warnings and integrity events

- Requirement / risk: v1.5 compatibility
- Severity: Critical
- Automation: automated + browser QA
- Status: WAITING

Steps:

1. Trigger blur, fullscreen exit and display change.
2. Confirm one incident per approved window.
3. Check warning audit and review UI.

Expected result:

- Warning behavior and audit match the baseline.
- Warnings never submit the exam.

Evidence:

- Incident rows, browser trace, audit.

Pass criteria:

- No proctoring regression.

### G5-COMPAT-007 - Result calculation and visibility

- Requirement / risk: v1.5 compatibility
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Submit a known answer set.
2. Calculate and publish the result.
3. Compare score, visibility and export.

Expected result:

- Same calculation and visibility rules.

Evidence:

- Expected/actual score and result API.

Pass criteria:

- No result regression.

### G5-COMPAT-008 - Question bank import/export

- Requirement / risk: v1.5 compatibility
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Import the golden question bank.
2. Export it.
3. Compare normalized content and IDs.

Expected result:

- Round-trip is stable; invalid rows follow the approved report.

Evidence:

- Import/export files and diff.

Pass criteria:

- No silent content loss.

### G5-COMPAT-009 - Analytics and reports

- Requirement / risk: v1.5 compatibility
- Severity: High
- Automation: automated
- Status: WAITING

Steps:

1. Replay analytics and report views.
2. Compare counts, filters and export.

Expected result:

- Same visible behavior and counts.

Evidence:

- Snapshot diff and report files.

Pass criteria:

- No report regression.

## 3. Performance and security cases

### G5-PERF-001 - 20/50/1,000 VU profiles within ratified budgets

- Requirement / risk: capacity
- Severity: Critical
- Automation: automated load test
- Status: WAITING

Steps:

1. Freeze and record the ratified budgets.
2. Run 20, 50 and 1,000 virtual-user profiles on the approved environment.
3. Record p50/p95/p99 latency, error rate, DB saturation and queue depth.
4. Compare to budgets.

Expected result:

- Every profile meets the approved budget.
- No tenant isolation error under load.

Evidence:

- k6 summary, charts, DB metrics, error sample.

Pass criteria:

- Performance and correctness budgets pass.

### G5-PERF-002 - Soak test has no leak or degradation

- Requirement / risk: stability
- Severity: Critical
- Automation: automated load test
- Status: WAITING

Steps:

1. Run the approved soak duration.
2. Monitor memory, connections, queues, Redis, storage and latency.
3. Compare start/end resource behavior.

Expected result:

- No unbounded memory/connection growth or latency drift.

Evidence:

- Soak metrics and leak review.

Pass criteria:

- Stable over the approved duration.

### G5-SEC-001 - Penetration/security review has no open Critical/High

- Requirement / risk: release security
- Severity: Critical
- Automation: manual security review
- Status: WAITING

Steps:

1. Run the approved penetration/security review.
2. Record every finding with severity and owner.
3. Verify fixes and retest.
4. Confirm no open Critical/High remains.

Expected result:

- No open Critical/High finding.
- Confirmed cross-tenant exposure is automatic NO-GO.

Evidence:

- Security report and retest evidence.

Pass criteria:

- Security owner signs the release.

## 4. Recovery and operations cases

### G5-REST-001 - Backup and restore rehearsal passes

- Requirement / risk: recovery
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Take a fresh backup/PITR marker.
2. Restore into an isolated environment.
3. Run preflight, smoke and tenant isolation checks.
4. Compare counts and checksums.

Expected result:

- Restore meets RPO/RTO and data checks.

Evidence:

- Restore report, timings, smoke output.

Pass criteria:

- Operations owner accepts the restore.

### G5-REST-002 - Failover rehearsal meets RPO/RTO

- Requirement / risk: availability
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Simulate the approved failure mode.
2. Execute failover.
3. Measure data loss and downtime.
4. Run smoke/isolation checks.

Expected result:

- RPO/RTO met; no tenant cross-talk after failover.

Evidence:

- Failover timeline and smoke output.

Pass criteria:

- Signed RPO/RTO.

### G5-REST-003 - Application rollback to v1.5 passes

- Requirement / risk: rollback
- Severity: Critical
- Automation: semi-automated
- Status: WAITING

Steps:

1. Deploy the release candidate with expand migrations.
2. Run golden journeys.
3. Roll back the application to v1.5.
4. Run v1.5 smoke and inspect data compatibility.

Expected result:

- v1.5 remains restorable and functional for the approved rollback window.
- No destructive migration blocks rollback.

Evidence:

- Rollback log, v1.5 smoke, data check.

Pass criteria:

- Rollback is rehearsed and safe.

### G5-REST-004 - Feature disablement works without redeploy

- Requirement / risk: kill switch
- Severity: Critical
- Automation: automated
- Status: WAITING

Steps:

1. Disable v2 registration, billing and Elite features through the approved
   control.
2. Verify legacy routes still work.
3. Re-enable one at a time.

Expected result:

- Feature flags take effect without redeploy.
- Public registration remains off until approval.

Evidence:

- Flag state and route matrix.

Pass criteria:

- Kill switch is effective and reversible.

### G5-OPS-001 - RPO/RTO and SLO are signed off

- Requirement / risk: operations
- Severity: Critical
- Automation: manual
- Status: WAITING

Steps:

1. Record recovery objectives and service-level objectives.
2. Map them to monitoring and alert thresholds.
3. Get operations and business approval.

Expected result:

- RPO/RTO/SLO are explicit, measurable and signed.

Evidence:

- Signed objectives and monitoring map.

Pass criteria:

- No undefined recovery target.

### G5-OPS-002 - Runbooks, on-call and incident response are ready

- Requirement / risk: operations
- Severity: Critical
- Automation: manual
- Status: WAITING

Steps:

1. Verify deploy, rollback, restore, failover, privacy incident and provider
   outage runbooks.
2. Verify on-call roster and escalation.
3. Run a tabletop incident exercise.

Expected result:

- Runbooks are current; on-call is named; exercise findings are closed.

Evidence:

- Runbook links, roster, exercise notes.

Pass criteria:

- Operations owner approves readiness.

### G5-OPS-003 - Provider live keys, CA and legal approvals complete

- Requirement / risk: launch dependencies
- Severity: Critical
- Automation: manual
- Status: WAITING

Steps:

1. Confirm Razorpay live activation/KYC and webhook setup.
2. Confirm SMTP SPF/DKIM/DMARC and sender readiness.
3. Confirm CA GST/invoice/refund approval.
4. Confirm legal/DPA/minor decisions and Elite licensing.
5. Confirm region/data-residency and DNS/TLS/cookie setup.

Expected result:

- Every live dependency is approved and recorded.
- No placeholder reaches production.

Evidence:

- Provider/legal/CA evidence and owner sign-off.

Pass criteria:

- No unowned launch dependency.

## 5. Pilot and release cases

### G5-PILOT-001 - Pilot acceptance criteria are met

- Requirement / risk: pilot exit
- Severity: Critical
- Automation: manual + metrics
- Status: WAITING

Steps:

1. Run 1-2 approved institutions for the approved period.
2. Review incidents, performance, support burden, data correctness and payment
   reconciliation.
3. Get pilot exit approval.

Expected result:

- Pilot exit criteria are met.
- Critical incidents are closed or accepted with a control.

Evidence:

- Pilot report and exit sign-off.

Pass criteria:

- Pilot owner approves wider release.

### G5-REL-001 - Release record and explicit production approval

- Requirement / risk: go/no-go
- Severity: Critical
- Automation: manual
- Status: WAITING

Steps:

1. Assemble the release record.
2. Verify every gate link and approval.
3. Review open risks and known limitations.
4. Get explicit production approval.

Expected result:

- Release record contains version/tag, SHA, migrations, DB version,
  backup/PITR, evidence links, approvals, on-call, rollback plan and feature
  flags.
- Any Critical finding is automatic NO-GO.

Evidence:

- Release record and signed approval.

Pass criteria:

- Production owner explicitly approves; no engineering-only launch.

## 6. G5 exit criteria

- G4 is `APPROVED`.
- v1.5 golden journeys pass.
- Performance and soak budgets pass.
- Penetration/security review has no open Critical/High.
- Backup/restore, failover, application rollback and feature disablement are
  rehearsed.
- RPO/RTO/SLO, runbooks and on-call are signed.
- Provider, CA, legal and Elite dependencies are complete.
- Pilot acceptance is signed.
- The release record is complete and the production owner explicitly approves.
