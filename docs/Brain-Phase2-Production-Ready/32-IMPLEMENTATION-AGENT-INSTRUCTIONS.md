# Implementation Agent Instructions — ExamRobo Phase 2

Use this document when assigning implementation work to Claude Code, OpenCode, Codex or a human developer. This is a task execution contract, not permission to redesign the architecture.

## 1. Required task input

Every implementation request must identify:

- Task ID from `16-IMPLEMENTATION-BACKLOG.md` or `27-FIRST-IMPLEMENTATION-SPRINTS.md`;
- exact requirement IDs;
- exact files/modules to inspect;
- acceptance criteria and required negative tests;
- dependencies already approved;
- explicit out-of-scope areas;
- test command and evidence location.

## 2. Mandatory execution sequence

1. Read the relevant Brain documents and current source files.
2. Search all call sites, routes, database functions and tests affected by the task.
3. Report the existing behavior and proposed minimal change before editing.
4. Identify compatibility, tenant, security, data and migration risks.
5. Implement only the bounded task; no unrelated refactor or dependency upgrade.
6. Add/modify tests before claiming completion.
7. Run focused tests, then all relevant regression/security tests.
8. Inspect the final diff for accidental scope changes, secrets, PII and generated files.
9. Update documentation and evidence ledger.
10. Report `IMPLEMENTED`, `VERIFIED` or `BLOCKED` with exact proof. Never claim `APPROVED`.

## 3. Non-negotiable restrictions

- Do not bypass RLS, turn off FORCE RLS or grant runtime BYPASSRLS to make tests pass.
- Do not use a default tenant when context is missing or support institution is unknown.
- Do not trust `institution_id` from client input.
- Do not trust browser payment success.
- Do not store raw OTP, refresh token, reset token or provider secret.
- Do not silently change student identity semantics.
- Do not make a destructive production migration or a data-losing rollback.
- Do not implement a security design that has not passed its gate.
- Do not invent tax, refund, retention, minor-consent or provider decisions.

## 4. Required final response from implementer

```text
Task ID and requirement IDs:
Files inspected:
Files changed:
Behavior before/after:
Migration details:
Security/tenant impact:
Tests added:
Commands executed:
Actual results (include failures):
Evidence locations:
Known gaps/blockers:
Rollback/forward repair:
Status: IMPLEMENTED / VERIFIED / BLOCKED
Reviewer required:
```

## 5. Review authority

The project architect approves architecture decisions; database/security reviewers approve RLS/roles/context; product owner approves business behavior; CA/legal approve finance/privacy matters; QA validates evidence; release owner alone approves production release.
