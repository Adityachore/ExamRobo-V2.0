# Implementation Start Here — Phase 2 Execution Manual

**Audience:** Project owner, tech lead, backend, frontend, database, QA and DevOps contributors.  
**Purpose:** Convert the Phase 2 Brain from an architecture plan into a controlled engineering project.

## 1. What this plan authorizes

This plan authorizes **repository inspection, baseline verification, local test infrastructure and the G1 security proof of concept**. It does not yet authorize production schema changes, tenant data cutover, student-data onboarding or public registration.

The first implementation objective is not a portal screen. It is a reproducible proof that PostgreSQL can resolve login identity and enforce tenant isolation under the actual runtime roles.

## 2. Start sequence — do these in order

| Step | Action | Output required | Stop condition |
|---|---|---|---|
| 1 | Create a protected Phase 2 branch from the exact v1.5.0 release commit | Branch name and source SHA in project log | Source SHA unknown |
| 2 | Install and run the existing project exactly as documented | Reproduction notes and commands | Baseline does not run |
| 3 | Run all current tests without modifying application code | Raw test/CI output and baseline counts | Existing failures not triaged |
| 4 | Restore a copy of the current database to a disposable local database | Restore log and verified counts | Backup cannot be restored |
| 5 | Inventory routes, SQL, tables, indexes, triggers, jobs, storage, Redis and WebSockets | Machine-readable inventory | Any store/path is unknown |
| 6 | Resolve identity and tenant-ownership decisions in `15-OPEN-DEPENDENCIES.md` | Approved decision records | Login collisions or account ownership unresolved |
| 7 | Build the PostgreSQL 16 security proof harness | Reproducible SQL/test harness | Harness uses mocks only |
| 8 | Prove auth lookup, signed context and forced RLS under separate roles | G1 evidence package | Any bypass, leakage or unexplained behavior |
| 9 | Obtain independent DB/security review | Signed G1 decision | Reviewer unavailable or high issue open |
| 10 | Only after G1, begin full tenant migration and application code | G1-approved implementation ticket | G1 not passed |

## 3. Repository baseline record

Create `docs/phase2/evidence/baseline.md` in the application repository with:

- Git remote and exact v1.5.0 commit/tag;
- Node/runtime/package-manager versions and lockfile hash;
- frontend and backend framework versions discovered from manifests;
- PostgreSQL major/minor version, extensions and collation;
- migration IDs/checksums and schema dump hash;
- database backup identifier, timestamp and restore-test result;
- environment topology (API, workers, Redis, object storage, email/SMS/payment providers);
- test commands and raw results;
- table/route/job/object-store inventory;
- current known defects and approved exceptions.

Do not infer stack versions from old documentation. Read the lockfiles, runtime image and deployed environment.

## 4. Working branch and pull-request policy

- `main` contains only reviewed, releasable code.
- Use short-lived branches: `phase2/P2-xxxx-short-description`.
- One task or tightly coupled change per pull request.
- Schema changes, code using the schema and tests must be reviewed together.
- Never combine a broad refactor with tenant-security changes in one pull request.
- Require a second reviewer for auth, RLS, billing, migrations and privacy code.
- No author may self-approve a security gate they implemented.
- Do not merge if required CI jobs are skipped or marked allowed-to-fail.

## 5. Definition of Ready for a task

A task may start only when it has:

1. Requirement ID(s) and a plain-language outcome.
2. Exact module/table/API scope.
3. Dependencies and decisions closed.
4. Acceptance criteria with positive and negative cases.
5. Migration and compatibility impact identified.
6. Test layer and evidence artifact identified.
7. Named implementer and independent reviewer.

## 6. Definition of Done for a task

A task is complete only when:

- code and migration are committed;
- unit, integration and relevant security tests pass;
- failure paths and retry behavior are tested;
- logs/metrics and safe error responses exist where operationally relevant;
- API/schema documentation is updated;
- migration is tested from a clean database and an upgraded v1.5.0 copy;
- a reviewer approves the actual diff and evidence;
- the evidence ledger links commit, CI run and test report.

A checkbox, mock, screenshot or developer statement alone is not evidence.

## 7. First work item to implement

Implement **P2-0101: PostgreSQL role/RLS security proof of concept**. It must use disposable PostgreSQL 16, two synthetic institutions, real runtime roles, FORCE RLS, auth lookup functions, signed tenant context and adversarial tests. The proof is isolated from the production schema and does not require modifying existing v1.5.0 tables.

## 8. What can happen in parallel before G1

Allowed: UI wireframes with mocked data, existing-system inventory, baseline testing, dependency closure, threat modeling, local CI setup and the isolated security proof.

Not allowed: tenantizing production tables, broad route changes, live payment activation, real student imports, disabling existing access controls or public registration.

## 9. Project status labels

Use only: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `IMPLEMENTED`, `VERIFIED`, `APPROVED`. `IMPLEMENTED` is not `VERIFIED`; `VERIFIED` is not `APPROVED`.
