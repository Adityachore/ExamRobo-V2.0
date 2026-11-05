# Audit Traceability — Previous Findings to Phase 2 Corrections

**Previous audit plan:** EXR-SAAS-2026-001, prior and updated Brain-SaaS document sets.  
**Current pack:** Phase 2 production-ready tenant architecture proposal.  
**Status rule:** A finding is **DESIGN ADDRESSED** only if this pack specifies a correction. It is not IMPLEMENTED or VERIFIED until code and test evidence exist.

## 1. Previous findings F-01–F-20

| Finding | Previous issue | Current correction | Source file | Required evidence |
|---|---|---|---|---|
| F-01 | Institution/contact tenant data not under RLS | Both are tenant tables with forced RLS and scoped access | 03, 04, 11 | Direct SQL A/B test |
| F-02 | System privilege boundary unclear | Separate roles; runtime roles no BYPASSRLS; migration-only owner | 03, 07, 09 | Role/grant report and pool tests |
| F-03 | Subscription concurrency | Institution lock + exclusion constraint + valid status/range constraints | 04, 05 | Concurrent DB test |
| F-04 | Early renewal/expiry race | Separate entitlement projection and one reconciler | 05, 13 | Controlled-clock boundary test |
| F-05 | Session revocation unclear | Current auth directory, session version, institution epoch and socket tickets | 03 | HTTP/refresh/WS revocation tests |
| F-06 | Elite price constraint conflict | Explicit billing mode and coherent NULL/price checks | 04, 05 | Fresh/upgrade migration seed test |
| F-07 | Conflicting query APIs | Single `q()` contract and transaction policy | 02, 03 | Source inventory and integration tests |
| F-08 | Timeline crossed G1 | Dependency-driven milestones; tenant work after G1 | 16, 17 | Dependency graph review |
| F-09 | External dependencies unresolved | Separate decision register with owners/evidence | 15, 17 | Signed dependency closure |
| F-10 | Privacy/retention incomplete | Full data map, legal gate, durable recovery ledger | 08, 15 | Counsel approval and restore test |
| F-11 | Jobs/recovery incomplete | Queue schema, lease token, at-least-once semantics and DLQ | 07 | Multi-worker crash/replay tests |
| F-12 | Performance budgets unverified | Baseline-first workload and reproducible report | 10, 17 | Baseline/load/soak reports |
| F-13 | v1.5 compatibility not proven | Source inventory and golden exam regression | 10, 11 | Compatibility report |
| F-14 | Staffing unconfirmed | Named capacity matrix is G0 prerequisite | 15, 16 | Owner-approved resource plan |
| F-15 | SECURITY DEFINER and FORCE RLS conflict | Lookup function reads restricted auth directory only; separate function owner | 03 | PostgreSQL role/function tests |
| F-16 | Data request ledger absent / same-DB restore gap | External append-only privacy tombstone ledger + restore quarantine | 08 | Pre-erasure backup restore test |
| F-17 | Subscription status/range constraints incomplete | CHECK status, non-null starts, positive interval and exclusion constraint | 04, 05 | Direct SQL negative tests |
| F-18 | Multiple lifecycle writers | Separate admin state from entitlement; reconciler sole entitlement writer | 05 | Code search + lifecycle integration tests |
| F-19 | `job_runs` schema/migration inconsistency | Complete job_queue/job_runs/dead-letter schema spec | 07 | Fresh/upgraded DB migration test |
| F-20 | P0 Definition of Done stale | R-100–R-137 complete evidence traceability and G5 checklist | 01, 11, 17 | Requirement-to-test/evidence report |

## 2. Additional risks addressed in this pack

| ID | Risk | Correction | Evidence needed |
|---|---|---|---|
| N-01 | Super Admin broad RLS wildcard | Explicit scoped platform functions and support grants; no wildcard policy | Role and platform route penetration tests |
| N-02 | Plain tenant GUC can be forged | Signed context or independently reviewed equivalent | Tamper/forgery test and security review |
| N-03 | Cross-tenant parent relation | Composite tenant foreign keys | Negative FK tests |
| N-04 | Unresolved ticket assigned to default tenant | System `support_intake`; no fallback | API and data ownership tests |
| N-05 | Old v1.5 rollback may fail or lose writes | Forward application rollback; restore is separate DR path | Tested rollback/recovery rehearsal |
| N-06 | RLS does not govern TRUNCATE/DDL | Revoke runtime structural privileges | Grant audit |
| N-07 | Identity collisions across principal types | Global identity collision preflight and explicit account policy | Migration report |
| N-08 | Object storage/Redis/logs omitted from isolation/privacy | Full store inventory and tenant key policy | Store-by-store isolation/erasure tests |
| N-09 | Webhook 2xx before durable inbox write | Durable receipt before acknowledgment | DB-failure retry test |
| N-10 | No shared family email handling for schools | Explicit product gate before school onboarding | Signed product decision and pilot feedback |

## 3. Evidence ledger template

For every finding/requirement record:

| Field | Value |
|---|---|
| Finding / requirement ID | |
| State | NOT STARTED / IN PROGRESS / IMPLEMENTED / VERIFIED / APPROVED / BLOCKED |
| Code commit | |
| Migration(s) | |
| Test name / CI run | |
| Test result / artifact | |
| Environment and DB version | |
| Owner | |
| Independent reviewer | |
| Open limitation / expiry | |
| Approval date | |

## 4. Current verdict

**Architecture design status:** substantially specified for Phase 2, pending owner/security/legal/finance decisions and PostgreSQL proof of concept.  
**Implementation status:** not evidenced by the documentation archive.  
**Production status:** NOT APPROVED.

This pack intentionally does not claim that any previous finding is fixed in code. It defines the target corrections and the evidence required to close them.
