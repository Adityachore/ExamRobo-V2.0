# ExamRobo Brain — Phase 2: Production-Ready Multi-Tenant SaaS

**Document set:** Phase 2 architecture and delivery baseline  
**Product version target:** v2.0.0  
**Current project state:** Planning / implementation not started  
**Source baseline stated by the project:** ExamRobo v1.5.0, migrations 001–013  
**Last plan revision reviewed:** 2026-11-06
**Approval state:** Product decisions D-01..D-36 are approved; authorized for baseline discovery and isolated G1 proof work only; **not authorized for full tenant implementation or production**

## Purpose

This folder is the rebuilt Phase 2 Brain for converting ExamRobo from its existing single-institution deployment into a shared-database, multi-tenant SaaS. It replaces the previous SaaS planning pack as the Phase 2 source of truth. The 2026-11-06 amendment adds billing/plans, Owner + Admin billing rights, email + SMS contact OTP, the plan table/platform ceiling and billing-record retention; remaining owner/legal/finance decisions are tracked in `15-OPEN-DEPENDENCIES.md`.

The goal is not merely to add `institution_id` columns. The goal is to establish tenant isolation, deterministic identity, database integrity, safe billing, recoverable jobs, privacy-aware restoration, compatibility with v1.5.0, and a release process that cannot pass without evidence. The implementation start sequence and first work packages are specified in files 19–33.

## Important status distinction

- **Specified:** a design or rule is documented here.
- **Implemented:** code, migration, configuration or infrastructure exists in the repository.
- **Verified:** the implementation passed its required automated and independent tests.
- **Approved:** the accountable owner/reviewer accepted the evidence and the gate.

This folder documents the intended design. It does not claim that migrations, controls, tests, infrastructure, provider accounts, legal approvals or production behavior already exist.

## Reading order

| Order | File | Authority |
|---:|---|---|
| 1 | `00-PHASE-2-CHARTER.md` | Objectives, boundaries, principles and success conditions |
| 2 | `01-PRODUCT-REQUIREMENTS.md` | Product requirements R-100 onward and acceptance criteria |
| 3 | `02-SYSTEM-ARCHITECTURE.md` | Components, trust boundaries and runtime architecture |
| 4 | `03-IDENTITY-AUTH-RLS.md` | Identity, role model, session revocation, RLS and database roles |
| 5 | `04-DATABASE-MODEL.md` | Canonical schema, tenant table registry and invariants |
| 6 | `05-SUBSCRIPTIONS-BILLING.md` | Plans, limits, invoice/payment lifecycle and reconciliation |
| 7 | `06-REGISTRATION-API-CONTRACT.md` | Public registration, portals, API and error contracts |
| 8 | `07-BACKGROUND-JOBS.md` | Queue, leases, workers, outbox, retries and recovery |
| 9 | `08-DATA-PRIVACY-RECOVERY.md` | Data lifecycle, subject requests, erasure ledger and restore |
| 10 | `09-MIGRATION-CUTOVER-ROLLBACK.md` | Migration order, backfill, cutover and rollback constraints |
| 11 | `10-COMPATIBILITY-PERFORMANCE.md` | v1.5.0 compatibility and capacity model |
| 12 | `11-TEST-STRATEGY.md` | Test layers, negative tests and evidence requirements |
| 13 | `12-OPERATIONS-DEPLOYMENT.md` | Environments, secrets, observability, SLOs and runbooks |
| 14 | `13-UX-PORTALS-AND-FLOWS.md` | Portal scope, UI states and end-to-end workflows |
| 15 | `14-ARCHITECTURE-DECISIONS.md` | Accepted design decisions and decision log |
| 16 | `15-OPEN-DEPENDENCIES.md` | Decisions and external dependencies that must be closed |
| 17 | `16-IMPLEMENTATION-BACKLOG.md` | Sequenced work packages, owners and dependencies |
| 18 | `17-DELIVERY-AND-RELEASE-GATES.md` | Milestones, gate criteria and release authority |
| 19 | `18-AUDIT-TRACEABILITY.md` | Mapping from previous audit findings to corrections and tests |

## Implementation-ready execution documents

The original 00–18 documents establish the product, architecture, domain design, migration strategy, QA, operations and gates. The following execution documents make the plan actionable for developers:

| File | Use |
|---|---|
| `19-IMPLEMENTATION-START-HERE.md` | Exact first steps, repository baseline, readiness and task rules |
| `20-REPOSITORY-STRUCTURE-AND-MODULES.md` | Module boundaries, layering, transactions and dependencies |
| `21-API-CATALOG-AND-CONTRACTS.md` | Proposed endpoint catalog, auth scope and request/response conventions |
| `22-DATABASE-OWNERSHIP-AND-TENANT-MATRIX.md` | Table classification, data ownership and CI registry rules |
| `23-MIGRATION-BY-MIGRATION-IMPLEMENTATION-SHEETS.md` | Migration sequence, preconditions, postconditions and operational controls |
| `24-SECURITY-POC-AND-THREAT-MODEL.md` | G1 proof, adversarial tests and security evidence |
| `25-ENVIRONMENT-CONFIGURATION-AND-SECRETS.md` | Environment variables, pools, secrets and config validation |
| `26-CI-CD-AND-QUALITY-GATES.md` | Required PR, nightly and release pipeline |
| `27-FIRST-IMPLEMENTATION-SPRINTS.md` | First tasks to assign, dependencies and sprint exit criteria |
| `28-LOCAL-DEV-AND-TEST-ENVIRONMENT.md` | Local setup, fixtures, commands and safety guards |
| `29-API-AND-DOMAIN-ACCEPTANCE-TEST-CATALOG.md` | Executable acceptance scenarios by domain |
| `30-LEGACY-DATA-BACKFILL-MAPPING.md` | Legacy row ownership, collision handling and backfill proof |
| `31-TEAM-WORKFLOW-AND-PR-TEMPLATES.md` | Code review, owner and AI-assisted development rules |
| `32-IMPLEMENTATION-AGENT-INSTRUCTIONS.md` | Reusable bounded-task instructions for coding agents/developers |
| `33-IMPLEMENTATION-READINESS-CHECKLIST.md` | What can start now, what remains gated and first assignments |
| `34-REQUIREMENT-TRACEABILITY-MATRIX.md` | Maps R-100 through R-137 to modules, tests and gates |
| `35-EXECUTION-TRACKER-TEMPLATE.md` | Copyable project, work-package, decision and gate tracker |
| `36-BUSINESS-AND-PRODUCT-DECISION-REGISTER.md` | Authoritative record of approved/open business and architecture decisions |
| `37-PAGE-INVENTORY-AND-UI-MAP.md` | Complete page inventory, design waves and UI review checklist |
| `00-FILE-MANIFEST.md` | Contents and authority summary |

## Technology selection rule

The plan deliberately preserves the existing v1.5.0 runtime, language, framework, router, ORM/query layer and deployment approach until the actual repository is inspected. PostgreSQL 16 is the stated target database, but verify the deployed version before authoring migrations. Do not start a framework rewrite as part of tenantization. Every new infrastructure dependency requires a recorded ADR and owner.

## First implementation path

1. Follow `19-IMPLEMENTATION-START-HERE.md`.
2. Copy `35-EXECUTION-TRACKER-TEMPLATE.md` into the application repository.
3. Complete `P2-0001` baseline inventory and restore test.
4. Complete `P2-0101` and the rest of Iteration 1 in `27-FIRST-IMPLEMENTATION-SPRINTS.md`.
5. Pass G1 with independent evidence.
6. Only then proceed to tenant foundation work in `16-IMPLEMENTATION-BACKLOG.md` and migration sheets in `23-MIGRATION-BY-MIGRATION-IMPLEMENTATION-SHEETS.md`.

## Authority rules

1. This Phase 2 folder is authoritative for SaaS v2.0.0 design. Existing v1.5.0 documents remain authoritative for unchanged exam behavior.
2. If a Phase 2 document changes an existing v1.5.0 behavior, the change must be identified in `14-ARCHITECTURE-DECISIONS.md` and approved before implementation.
3. Where a Phase 2 document conflicts with another Phase 2 document, `01-PRODUCT-REQUIREMENTS.md` defines the product outcome; `03-IDENTITY-AUTH-RLS.md`, `04-DATABASE-MODEL.md` and `05-SUBSCRIPTIONS-BILLING.md` define their technical domains. Record and resolve the conflict rather than guessing.
4. No status may be changed to VERIFIED from a document-only review. Evidence must identify the exact commit, migration, CI run, test report, benchmark or approval record.
5. Applied migrations are append-only. Correct them with a forward migration, never by silently editing an applied migration.
6. Only Markdown files belong in this Brain folder. Executable SQL, source code, test fixtures and reports belong in the application repository and are linked from the evidence register.

## Product summary

ExamRobo becomes a shared-database SaaS for schools and colleges. ExamRobo platform operators are Super Admins. Each institution has an isolated workspace managed by an Admin and Employees. Students remain roster-based exam participants; student self-registration is not introduced in this phase. Plans, limits, onboarding, payment, invoices, institution branding and platform analytics are added without changing the existing examination engine's accepted behavior.

## Baseline carried forward

The previous plan states that v1.5.0 had migrations 001–013, 187 smoke assertions and 161 unit tests. These are **baseline claims to re-verify from the source repository and CI**, not independently verified facts in this folder. Phase 2 must record the actual Git commit, database backup identifier, Node/runtime versions, PostgreSQL version, test run IDs and measured performance before changing the system.

## Official technical references

- PostgreSQL 16 Row Security Policies: https://www.postgresql.org/docs/16/ddl-rowsecurity.html
- PostgreSQL 16 `CREATE POLICY`: https://www.postgresql.org/docs/16/sql-createpolicy.html
- PostgreSQL 16 `CREATE FUNCTION` and security attributes: https://www.postgresql.org/docs/16/sql-createfunction.html
- PostgreSQL 16 `SET` / `SET LOCAL`: https://www.postgresql.org/docs/16/sql-set.html
- PostgreSQL 16 locking and `SKIP LOCKED`: https://www.postgresql.org/docs/16/sql-select.html
- PostgreSQL 16 range types and exclusion constraints: https://www.postgresql.org/docs/16/rangetypes.html
- PostgreSQL 16 `btree_gist`: https://www.postgresql.org/docs/16/btree-gist.html
- PostgreSQL 16 `pgcrypto`: https://www.postgresql.org/docs/16/pgcrypto.html

## Final rule

**Do not start tenant-data implementation until G1 passes. Do not onboard real student data or open production registration until all legal, security, migration, recovery, performance and operational release gates pass.**
