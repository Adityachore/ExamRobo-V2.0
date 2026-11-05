# Local Development and Test Environment Runbook

## 1. Goal

Any developer must be able to create a disposable local environment, apply migrations, load synthetic A/B tenants, run tests and destroy/reset the environment without accessing production data or credentials.

## 2. First-time local setup

Use the actual repository's documented package manager/runtime. The exact versions are not specified here because they must be read from the v1.5.0 lockfiles and deployment runtime.

1. Clone the repository and checkout the approved Phase 2 branch.
2. Install dependencies from the lockfile using immutable/frozen install mode.
3. Copy `.env.example` to local ignored `.env`; populate only local credentials.
4. Start disposable PostgreSQL 16 and optional Redis using the team's approved container/dev tooling.
5. Create only test roles, schemas and synthetic data.
6. Run migration status and apply migrations to an empty test DB.
7. Run unit and integration suites.
8. Seed Institution A and B with colliding identifiers.
9. Run direct SQL and HTTP tenant isolation tests.
10. Reset the environment and verify no production host/credential was used.

## 3. Required synthetic fixtures

- Institution A: one Admin, one Employee, two Students, two Events, questions, papers, answers, audit and one invoice.
- Institution B: same object shape and colliding natural keys; use deliberately similar display names and same question import key.
- Platform Admin: aggregate dashboard access only, no default raw access to tenant rows.
- Disabled staff and suspended institution.
- Pending registration request and OTP challenge.
- Scheduled/active/expired subscriptions and duplicate webhook event.
- Queued/running/expired-lease/dead-letter jobs.
- Privacy tombstone older than a simulated database backup.

All fixture data must be clearly synthetic and contain no real student information.

## 4. Required developer commands

The project owner must implement repository scripts with stable names equivalent to:

- `dev:setup` — validate runtime and config;
- `db:reset:test` — destroy/recreate disposable test DB;
- `db:migrate` — apply migrations;
- `db:status` — display migration IDs/checksums;
- `db:seed:tenants` — load A/B fixtures;
- `test:unit` — unit suite;
- `test:integration` — DB integration suite;
- `test:security` — tenant/auth/RLS suite;
- `test:api` — route contract suite;
- `test:all` — required local set;
- `test:compat` — v1.5 golden journeys;
- `test:load` — approved load profiles.

Names are expected interfaces for developer convenience; adapt to current package scripts but document equivalents in one place.

## 5. Safety guard

A destructive local/test DB command must verify the target database is disposable (for example, explicit test suffix and environment label). It must refuse unknown hosts, production labels and missing allow-list. Do not permit a CLI flag such as `--force` to bypass production protection in ordinary developer scripts.

## 6. Reset/teardown

Teardown removes test containers, volumes and temporary files only after a clear confirmation; it must not touch shared databases. CI creates a fresh isolated DB per job or uses a unique schema/database namespace with safe cleanup.

## 7. Troubleshooting evidence

When a local test fails, capture command, runtime version, DB version, migration status, sanitized logs, test ID and reproduction steps. Never attach `.env`, JWTs, OTPs, real student records or payment secrets to an issue.
