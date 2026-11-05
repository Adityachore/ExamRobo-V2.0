# Phase 2 Execution Tracker Template

Copy this template into the application repository at `docs/phase2/execution-tracker.md`. Update it in every weekly project review and after every release gate.

## 1. Project header

| Field | Value |
|---|---|
| Project | ExamRobo Phase 2 multi-tenant SaaS |
| Target release | v2.0.0 (target; not a date commitment) |
| Source baseline SHA | TBD |
| Current branch | TBD |
| PostgreSQL target/actual | 16 target / TBD verified |
| Project owner | TBD |
| Tech lead | TBD |
| Security reviewer | TBD |
| Database reviewer | TBD |
| QA lead | TBD |
| Operations owner | TBD |
| Last updated | YYYY-MM-DD |

## 2. Work package tracker

| Task ID | Description | Owner | Reviewer | Estimate | Dependency | Status | PR/commit | Test evidence | Blocker |
|---|---|---|---|---:|---|---|---|---|---|
| P2-0001 | Pin v1.5 baseline | TBD | TBD | TBD | None | NOT STARTED | | | |
| P2-0002 | Inventory routes/schema/jobs/stores | TBD | TBD | TBD | P2-0001 | NOT STARTED | | | |
| P2-0101 | PostgreSQL security proof harness | TBD | TBD | TBD | P2-0001 | NOT STARTED | | | |
| P2-0102 | Auth lookup privilege proof | TBD | TBD | TBD | P2-0101 | NOT STARTED | | | |
| P2-0103 | Signed context proof | TBD | TBD | TBD | P2-0101 | NOT STARTED | | | |
| P2-0104 | FORCE RLS A/B tests | TBD | TBD | TBD | P2-0102/0103 | NOT STARTED | | | |

Add the remaining tasks from `16-IMPLEMENTATION-BACKLOG.md` without deleting completed history.

## 3. Decision tracker

| ID | Decision | Owner | Due date | Status | Decision/evidence | Dependent tasks |
|---|---|---|---|---|---|---|
| DQ-01 | Principal/login/membership rules | Product owner | TBD | OPEN | | P2-0302 |
| DQ-02 | Student login/shared contact behavior | Product owner | TBD | OPEN | | P2-0302 |
| EXT-01 | GST/invoice policy | CA/business | TBD | OPEN | | P2-0404 |
| EXT-02 | Refund/chargeback policy | Business owner | TBD | OPEN | | P2-0406 |
| LEG-01..07 | Privacy/legal decisions | Counsel | TBD | OPEN | | P2-0601 |
| TECH-01 | Signed-context review | Security reviewer | TBD | OPEN | | P2-0103 |

## 4. Gate evidence tracker

| Gate | Required evidence links | Decision | Approver | Date | Open findings |
|---|---|---|---|---|---|
| G0 | | NOT REVIEWED | | | |
| G1 | | NOT REVIEWED | | | |
| G2 | | NOT REVIEWED | | | |
| G3 | | NOT REVIEWED | | | |
| G4 | | NOT REVIEWED | | | |
| G5 | | NOT REVIEWED | | | |

## 5. Weekly risk review

For each risk record: ID, description, likelihood, impact, severity, trigger, mitigation, owner, due date, residual risk, evidence. Do not close a risk because a task is marked complete; verify the control.

## 6. Status rule

- `NOT STARTED`: no work evidenced.
- `IN PROGRESS`: implementation underway, no accepted proof yet.
- `BLOCKED`: a prerequisite prevents safe progress.
- `IMPLEMENTED`: change exists in source/migration/config.
- `VERIFIED`: required tests and evidence pass.
- `APPROVED`: authorized reviewer accepted the evidence/gate.
