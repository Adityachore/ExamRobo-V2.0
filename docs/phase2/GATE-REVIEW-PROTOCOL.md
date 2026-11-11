# Phase 2 gate review and test protocol

- Status: active
- Applies to: G0, G1, G2, G3, G4, G5
- Source of truth: `docs/Brain-Phase2-Production-Ready/17-DELIVERY-AND-RELEASE-GATES.md`
- Test strategy: `docs/Brain-Phase2-Production-Ready/11-TEST-STRATEGY.md`
- Acceptance catalog: `docs/Brain-Phase2-Production-Ready/29-API-AND-DOMAIN-ACCEPTANCE-TEST-CATALOG.md`

## 1. Purpose

This protocol prevents a gate from being marked "passed" because a checklist
was filled in. Every gate must have an implementation boundary, an executable
test plan, a complete run artifact and an independent disposition.

The rule is:

**Implement -> freeze the commit SHA -> write the gate `TEST-CASES.md` ->
execute every case -> fix and rerun the full gate -> independent review ->
approve or reject the gate.**

Testing a moving implementation is not a gate result. A partial feature is not
a pass. A passing happy-path test does not cancel a failing security case.

## 2. Non-negotiable rules

1. **Implementation first.** Start gate testing only after the gate's scope is
   implemented and frozen at a recorded commit SHA. Requirements/design review
   can happen earlier; execution cannot count before the freeze.
2. **One gate, one test file.** Every gate has
   `docs/phase2/test-plans/GX-TEST-CASES.md`. Cases are expanded from the
   requirement and acceptance catalog, not invented after a pass.
3. **Run artifacts only.** A checklist, screenshot, opinion or agent summary is
   not evidence. Evidence must include commit SHA, environment, DB version,
   command, timestamp, result and reviewer.
4. **No self-approval.** The person or agent who implemented the gate cannot be
   the only approver. G1 and every security-sensitive gate require an
   independent reviewer.
5. **No partial pass.** All Critical/High cases must pass. A skipped mandatory
   case is a failure, not an unknown.
6. **Fail closed.** A missing test environment, missing fixture or skipped
   security command blocks the gate.
7. **No cross-tenant waiver.** Confirmed cross-tenant read/write/existence
   leakage is automatic NO-GO and cannot be waived.
8. **No production data in test.** Scratch databases must end in `_test` or
   `_smoke`. Tests must refuse production-looking connection strings.
9. **No secrets or student PII in artifacts.** Redact passwords, tokens, keys,
   student names, emails, phone numbers and answers.
10. **One failing phase does not stop the session, but it does stop the gate.**
    Record it, continue collecting the remaining evidence, and leave the gate
    unapproved.

## 3. Gate sequence and approval

| Gate | Name | Required run | Named approver |
|---|---|---|---|
| G0 | Baseline and decision readiness | `npm run verify` plus restore/inventory/collision checks | Tech lead + project owner |
| G1 | Security proof and architecture approval | `npm run test:g1` plus independent code review | Security reviewer + database reviewer |
| G2 | Tenant isolation | `npm run test:g2` (when implemented) | Database reviewer + security reviewer |
| G3 | Identity and money integrity | `npm run test:g3` (when implemented) | Product owner + security reviewer + finance owner |
| G4 | Privacy and recovery | `npm run test:g4` (when implemented) | Privacy/legal owner + operations owner |
| G5 | Production release | `npm run test:g5` plus release rehearsal | Project owner + security owner + operations owner |

No gate starts before the prior gate is `APPROVED`. The only exception is a
recorded, scope-limited waiver from the project owner. A waiver never passes a
gate and never authorizes production tenant data.

## 4. Required artifacts per gate

Every gate must have this shape:

```text
docs/phase2/test-plans/
  GX-TEST-CASES.md              # stable executable plan

docs/phase2/evidence/gX/
  README.md                     # scope, environment, command, result
  REVIEWER-REPORT.md            # self-contained reviewer handoff
  results.json                  # machine-readable outcome, if produced
  test-output.txt               # complete stdout/stderr, if produced
  <gate-specific artifacts>     # restore report, grant report, k6 summary, etc.
```

The evidence folder must link to the test plan. The test plan must link back to
the evidence folder only after a run exists. A plan without a run is
`IMPLEMENTED`, not `VERIFIED`.

## 5. Status model

| Status | Meaning |
|---|---|
| `NOT STARTED` | No implementation or evidence. |
| `IN PROGRESS` | Implementation underway; no gate result. |
| `IMPLEMENTED` | Code/migration exists and is frozen; tests not yet complete. |
| `VERIFIED` | Every mandatory case passed and evidence is complete. |
| `VERIFYING` | Evidence is complete and independent review is in progress. |
| `APPROVED` | Independent reviewer accepted the evidence and signed disposition. |
| `REJECTED` | Reviewer found a blocking issue; fix and rerun. |
| `BLOCKED` | A prerequisite or external input prevents safe progress. |

`VERIFIED` is not `APPROVED`. Only the named approver can move a gate to
`APPROVED`.

## 6. Evidence standard

Every run artifact must include:

- gate ID and test-plan version;
- commit SHA and branch;
- whether the working tree was clean;
- OS, Node version, PostgreSQL version and Docker image digest where relevant;
- exact command and environment variables used, with secrets redacted;
- start/end timestamp and duration;
- pass/fail/skip counts;
- complete output or a link to an immutable artifact;
- named tester and named reviewer;
- known limitations and flaky tests;
- the reviewer's disposition.

If any of these are missing, the gate remains `VERIFIED` at best, not
`APPROVED`.

## 7. Test-case requirements

Each case must be executable by another agent without asking the author what
was meant. A complete case contains:

- ID, title, requirement/risk link and severity;
- preconditions and fixture IDs;
- exact commands, API calls or SQL;
- one observable expected result;
- negative, boundary, reverse-direction, concurrency or replay cases where the
  risk requires them;
- evidence to capture;
- cleanup;
- pass/fail criteria;
- automation status;
- execution record and reviewer note.

Test cases must include the reverse tenant direction and the unauthenticated or
system-role path. Testing only "malformed ID" is not a tenant isolation test;
use a valid ID owned by the other tenant.

## 8. G0-G5 minimum scope

### G0 - baseline

- exact v1.5.0 SHA/tag and clean-tree check;
- `npm run verify` four phases;
- restore a production-like backup into a scratch database;
- route, table, query, job, cache, WebSocket and storage inventory;
- login identity collision report;
- named owner/reviewer for every gate;
- external dependencies and legal questions assigned;
- no unresolved architecture contradiction.

### G1 - security proof

- auth lookup with no tenant context;
- function owner has no tenant business-table access;
- app, worker, auth, context, platform and migration roles tested separately;
- signed context forgery/tamper/expiry tested and independently reviewed;
- Super Admin has no unscoped RLS wildcard;
- support access is scoped and audited;
- Elite Host header is not tenant authorization;
- missing/invalid context fails closed;
- key/role separation and pooled-connection reuse pass.

### G2 - tenant isolation

- every tenant table classified with forced RLS;
- tenant-aware query contract implemented;
- composite tenant foreign keys and scoped unique indexes;
- API, CSV/PDF, WebSocket, Redis, storage and jobs scoped;
- two-tenant direct SQL and application suites pass in both directions;
- no open Critical/High isolation finding.

### G3 - identity and money

- login, collision policy, session revocation;
- single-Admin uniqueness, pending slot and Owner-only Admin management;
- employee seat counting and concurrency;
- subscription state/period constraints and concurrent lifecycle;
- entitlement reconciler and expiry/recovery behavior;
- webhook inbox, signature, amount/currency and replay;
- price/limit snapshots and GST placeholder protection;
- provider test-mode proof.

### G4 - privacy and recovery

- legal review, DPA, minor/school decision and retention matrix;
- durable external privacy ledger with audited access;
- anonymisation inventory across DB, logs, exports, Redis and storage;
- restore from pre-erasure backup replays tombstones before ingress;
- restore/recovery report approved.

### G5 - production release

- v1.5.0 golden journeys pass;
- performance budgets and 20/50/1,000 VU profiles pass;
- penetration/security review has no open Critical/High;
- backup/restore, failover, application rollback and feature disablement
  rehearsed;
- RPO/RTO and SLO signed off;
- operations, support and incident response ready;
- provider/live keys, legal and CA approvals complete;
- pilot acceptance signed;
- production owner explicitly approves.

## 9. Failure handling

1. Stop the failing case and capture the exact output.
2. Classify severity: Critical, High, Medium, Low.
3. Fix only after recording the failure.
4. Rerun the **entire** gate suite, not only the failed case.
5. Update `results.json`, `test-output.txt` and the reviewer report.
6. If the failure is external, mark the gate `BLOCKED` with the owner and next
   decision. Do not mark it passed.
7. Never reissue the same failing command more than twice without changing the
   approach.

## 10. Release record

At G5, the release record must contain:

- version/tag and commit SHA;
- migrations applied and target DB version;
- backup/PITR position;
- evidence links for G0-G5;
- gate approvals with names, dates and findings;
- open risks and known limitations;
- on-call roster and support plan;
- rollback/restore plan;
- customer communication and feature-flag state;
- explicit production approval.
