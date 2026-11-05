# Team Workflow, Code Review and Pull Request Templates

## 1. Roles and accountability

Every work item names one accountable owner and one implementer. Critical changes also name an independent reviewer. One person may hold multiple roles on a small team, but the author cannot be the sole approver of security, RLS, billing, data migration or privacy recovery changes.

## 2. Required code ownership

Assign CODEOWNERS (or repository equivalent) for:

- database migrations/schema/RLS;
- auth/session/tenant context;
- subscription/payment/invoices;
- privacy/anonymisation/recovery;
- worker/outbox;
- deployment/secrets/CI;
- frontend permission guards and exports.

## 3. Pull request template

Every PR description includes:

```text
Requirement/task IDs:
User/business outcome:
Modules and files changed:
Database migration(s):
API/schema changes:
Tenant impact:
Security/permission impact:
Payment/privacy impact:
Compatibility impact:
Tests added and commands run:
Negative/failure tests:
Migration upgrade/restore evidence:
Observability/runbook impact:
Screenshots only if UI change:
Known limitations/open decisions:
Rollback/forward-repair plan:
Evidence links (CI, logs, report):
Implementer:
Independent reviewer(s):
```

## 4. Review checklist

- Does request tenant ID come from trusted auth context?
- Does the DB enforce the same tenant boundary?
- Are composite FKs and tenant-scoped uniqueness correct?
- Is any new SECURITY DEFINER function narrowly owned, ACL-restricted and search-path safe?
- Are errors safe and stable?
- Is every external call outside a DB transaction?
- Are retries idempotent?
- Is audit event written atomically with the business change where required?
- Do tests cover another tenant's valid object ID?
- Does the change preserve v1.5.0 exam behavior?
- Are logs free from PII/secrets?
- Is rollback/restore behavior accurate?

## 5. AI-assisted implementation rules

AI tools may implement bounded tasks with repository context, but:

- give one task ID and its exact acceptance criteria at a time;
- ask the tool to inspect files/call sites before editing;
- prohibit unrelated refactors and dependency upgrades;
- require a diff summary and exact test commands/results;
- manually inspect migrations, auth and billing changes;
- do not allow AI to self-certify security, legal or production readiness;
- never paste production secrets, student data or credentials into prompts.

## 6. Definition of review rejection

Reject the PR if the task scope is unclear, a required test is missing, migration is not reproducible, a tenant boundary relies only on controller filtering, error paths are untested, logs leak sensitive values, reviewer cannot reproduce evidence or documentation contradicts behavior.
