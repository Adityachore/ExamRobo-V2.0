# Gate test case template

Copy the block below for every case. Replace every `<...>` placeholder. A case
that another agent cannot execute without asking the author is incomplete.

## Case block

```markdown
### <GATE>-<AREA>-<NNN> - <short imperative title>

- Requirement / risk: <R-xxx, PRD section, ADR, threat ID>
- Severity: <Critical | High | Medium | Low>
- Owner: <agent or person>
- Automation: <automated | semi-automated | manual>
- Status: <NOT STARTED | IN PROGRESS | IMPLEMENTED | VERIFIED | BLOCKED | RETIRED>

#### Preconditions

- <branch/commit or frozen SHA>
- <services and versions>
- <fixtures and IDs>
- <required role, tenant, plan or state>

#### Test data

| Name | Value | Notes |
|---|---|---|
| Tenant A | <institution UUID> | <fixture> |
| Tenant B | <institution UUID> | <fixture> |
| Actor | <principal UUID/email> | <role> |

#### Steps

1. <exact command, API request or SQL>
2. <exact observation or state change>
3. <exact cleanup or next action>

#### Expected result

- <one observable result: HTTP status/body, row count, DB error code, audit row, log line>
- <state after the action>
- <what must NOT happen>

#### Negative and edge cases

- <malformed input>
- <wrong role / unauthenticated>
- <reverse tenant direction>
- <boundary value or exact time boundary>
- <concurrency / replay / duplicate event>

#### Evidence to capture

- <command output or artifact path>
- <machine-readable result>
- <audit/log excerpt with secrets and PII redacted>

#### Cleanup

- <drop scratch database, revoke grant, delete fixture, stop process>

#### Pass criteria

- <all expected results observed>
- <no unexpected data returned or mutated>
- <no Critical/High finding>
- <evidence complete>

#### Execution record

| Field | Value |
|---|---|
| Commit SHA | <sha> |
| Branch | <branch> |
| Working tree clean | <yes/no + note> |
| Environment | <OS, Node, PostgreSQL, image digest> |
| Command | <exact command> |
| Started | <ISO timestamp> |
| Finished | <ISO timestamp> |
| Result | <PASS/FAIL/BLOCKED> |
| Tester | <name> |
| Evidence | <path/link> |

#### Reviewer note

- Reviewer: <name>
- Date: <YYYY-MM-DD>
- Finding: <none/Critical/High/Medium/Low + description>
- Disposition: <accepted/rejected/conditional>
```

## Writing rules

1. **One case, one observable outcome.** Do not combine login, billing and
   tenant isolation into one case.
2. **Use valid cross-tenant IDs.** A malformed UUID does not prove isolation.
3. **State the role.** Every SQL/API step must say which DB role or principal
   executes it.
4. **State the expected failure.** For a denial test, include the exact error
   code or the zero-row result.
5. **Capture the complete run.** Do not paste only the last line of output.
6. **Include the reverse direction.** A -> B and B -> A.
7. **Test the boundary.** Exact expiry, last seat, last roster slot, last plan
   day and duplicate webhook delivery are separate cases.
8. **Separate setup from assertion.** Do not let a fixture error look like a
   security pass.
9. **Test the control, not the mock.** A mocked provider proves adapter
   behavior only; provider integration needs a test-mode run.
10. **No secrets or PII.** Redact before saving evidence.

## Example

```markdown
### G1-SEC-004 - Forged app.iid GUC must not grant tenant access

- Requirement / risk: R-102, threat T3
- Severity: Critical
- Owner: senior-backend-engineer-agent
- Automation: automated (`npm run test:g1`, case `SEC-004`)
- Status: VERIFIED

#### Preconditions

- Frozen G1 harness and `server/sql/g1-poc.sql`
- PostgreSQL 16.15 scratch database ending in `_test`
- Tenants A and B seeded by the harness
- Connection uses the `examrobo_app` role

#### Steps

1. Open a dedicated connection as `examrobo_app`.
2. Set `app.iid` to tenant B's UUID without a signed `app.tenant_context`.
3. Query tenant A and tenant B rows.
4. Repeat with a syntactically valid but unsigned context.

#### Expected result

- Zero rows from both tenants.
- No mutation succeeds.
- The verifier returns NULL rather than falling back to `app.iid`.

#### Negative and edge cases

- Empty `app.iid`.
- Valid tenant UUID with no signature.
- Valid signature for tenant A but `app.iid` set to tenant B.

#### Evidence to capture

- `docs/phase2/evidence/g1/test-output.txt`
- `docs/phase2/evidence/g1/results.json` (`SEC-004` pass)

#### Cleanup

- Close the dedicated connection; the harness drops the scratch database.

#### Pass criteria

- `rows=0` for both tenants.
- No error path that grants access.
- Independent reviewer agrees the test actually executes as `examrobo_app`.
```
