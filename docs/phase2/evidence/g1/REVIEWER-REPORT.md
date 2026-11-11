# G1 independent reviewer report

- Gate: G1 - security proof and architecture approval
- Status: **VERIFYING - independent review pending**
- Implementer: Brain agent / senior backend work
- Reviewer: **TBD**
- Review date: **TBD**
- Current local result: **24 passed, 0 failed**
- Evidence root: `docs/phase2/evidence/g1/`
- Test plan: `docs/phase2/test-plans/G1-TEST-CASES.md`
- Threat model: `docs/phase2/evidence/g1/THREAT-MODEL.md`
- Protocol: `docs/phase2/GATE-REVIEW-PROTOCOL.md`

This report is the handoff for an independent agent or human reviewer. A local
24/24 run is **not** G1 approval. The implementer cannot sign this gate alone.

## 1. Executive summary

G1 is an isolated, synthetic PostgreSQL 16 proof. It checks role separation,
forced RLS, signed tenant context, fail-closed behavior, support scoping, worker
leases, composite foreign keys and pooled-connection reuse.

What is proven:

- nine proof roles exist and none is `SUPERUSER` or `BYPASSRLS`;
- tenant A cannot read or mutate tenant B using valid IDs;
- forged, unsigned, malformed, expired, tampered and wrong-key contexts fail;
- disabled principals and changed institution epochs invalidate stale contexts;
- app, auth, platform and support paths cannot exceed their intended scope;
- pooled connections do not retain tenant context;
- stale worker leases cannot mutate tenant data;
- composite tenant FKs reject foreign parents;
- the registry detects an unclassified table.

What is **not** proven:

- the API mints a correct context (only the database verifier is proven);
- HTTP, WebSocket, Redis, object storage, exports and background jobs are fully
  isolated (G2);
- production data, restore, collision backfill or real tenants were used;
- the custom HMAC verifier is accepted by a security reviewer until this report
  is signed;
- G0 is green (G0 remains PARTIAL).

## 2. Files under review

The SHA-256 values freeze the handoff. Verify them before rerunning. The rerun
will overwrite `results.json` and `role-report.json`; preserve these original
hashes in the review record.

| File | SHA-256 |
|---|---|
| `docs/phase2/evidence/g1/README.md` | `f7d0b917277a30a9b854c1f9a7f8d5564b2cc4b13d26b9a4f823fc91e0982c9b` |
| `docs/phase2/evidence/g1/THREAT-MODEL.md` | `e64bad13bea2dfa193d1aa82135d24ee954c7972c75d68d6d400dd9290ca6337` |
| `docs/phase2/evidence/g1/results.json` | `dd0cb4439ec5ec521e1375d90ae589d289718eca045ffd861048b3ea9bdf27fa` |
| `docs/phase2/evidence/g1/role-report.json` | `ffee378e12b0fe039bb887d460ad5f375d48cf26aebd886dccb008e0cd7c3297` |
| `docs/phase2/evidence/g1/test-output.txt` | `247e5ff1807393d60ce77e60aa906e661419fc2167bc67930f5675db836cc3d3` |
| `docs/phase2/test-plans/G1-TEST-CASES.md` | `672ac33b020994f49a0dd3a42ba008a9b72a284c5ba8aa461ff4f7c40670a2c8` |
| `server/scripts/g1.mjs` | `b85bf5e0f7653b802524c8976ccf98b501087477b3b243dd677dcaa897ad2715` |
| `server/sql/g1-poc.sql` | `57ce5015fb3098540d693f47ffc52687caf4694bedd9f9c8a8c36b96a497a255` |
| `server/package.json` | `2f200941aa8d759cf43a4a8a065510557a6c5e51f8cb0a113c26f986d46a22ac` |

Verify with:

```powershell
Get-FileHash -Algorithm SHA256 `
  docs\phase2\evidence\g1\README.md,
  docs\phase2\evidence\g1\THREAT-MODEL.md,
  docs\phase2\evidence\g1\results.json,
  docs\phase2\evidence\g1\role-report.json,
  docs\phase2\evidence\g1\test-output.txt,
  docs\phase2\test-plans\G1-TEST-CASES.md,
  server\scripts\g1.mjs,
  server\sql\g1-poc.sql,
  server\package.json
```

## 3. Environment prerequisites

- Windows PowerShell 5.1 or a compatible shell.
- Node/npm dependencies installed in `server/`.
- Docker Desktop running.
- `examrobo-db` reachable at `127.0.0.1:5450`.
- Root `.env` contains the current `DB_PASSWORD`.
- No production database is reachable.
- Scratch database name ends in `_test` or `_smoke`.

Record the environment before running:

```powershell
cd C:\Users\Asus\Desktop\Exam-Robo-main
git rev-parse HEAD
git status --short
node --version
docker info --format '{{.ServerVersion}}'
docker inspect examrobo-db --format '{{.Image}}'
docker image inspect postgres:16-alpine --format '{{json .RepoDigests}}'
```

Expected database:

- PostgreSQL 16.15 (`x86_64-pc-linux-musl`, Alpine 15.2.0).
- Compose tag `postgres:16-alpine`.
- Registry index digest at evidence time:
  `sha256:aa6cb33cf4c19c765cefcf48d96176258800870a9a1e930ad126200f9d825139`.
- `linux/amd64` manifest:
  `sha256:ac838714b7d794185a866e5a6b479b954e7d8a070568aa0acac6fe07c3070bf5`.

The local `RepoDigest` was not captured after the run because Docker Desktop
was stopped. Confirm it on the review run.

## 4. Run the suite

Do not edit the SQL or harness before the run. The harness creates and drops
`examrobo_g1_test` and creates/drops the nine proof roles.

```powershell
cd C:\Users\Asus\Desktop\Exam-Robo-main
$line = Get-Content -LiteralPath ".env" |
  Where-Object { $_ -match '^DB_PASSWORD=' } |
  Select-Object -First 1
$pw = (($line -replace '^DB_PASSWORD=', '').Trim()).Trim('"').Trim("'")
$env:G1_PG_URL = "postgres://examrobo:$([uri]::EscapeDataString($pw))@127.0.0.1:5450/postgres"
cd server
npm run test:g1 2>&1 | Tee-Object -FilePath "..\docs\phase2\evidence\g1\reviewer-test-output.txt"
```

Expected final line:

```text
24 passed, 0 failed
```

Expected per-case output:

- `ROLE-01` through `ROLE-08`: PASS.
- `SEC-001` through `SEC-016`: PASS.
- No skipped case.

## 5. Verify machine-readable evidence

```powershell
cd C:\Users\Asus\Desktop\Exam-Robo-main
node -e "const r=require('./docs/phase2/evidence/g1/results.json'); console.log({pass:r.pass,fail:r.fail,tests:r.results.length,pg:r.postgres_version})"
node -e "const r=require('./docs/phase2/evidence/g1/role-report.json'); console.log({roles:r.roles.length,memberships:r.memberships.length,objects:r.objects.length,functions:r.functions.length,table_grants:r.table_grants.length,schema_grants:r.schema_grants.length,routine_grants:r.routine_grants.length})"
```

Expected:

```text
{ pass: 24, fail: 0, tests: 24, pg: 'PostgreSQL 16.15 ...' }
{ roles: 9, memberships: 1, objects: 15, functions: 7, table_grants: 155, schema_grants: 19, routine_grants: 13 }
```

If any count differs, record it as a finding. Do not "fix" the count by editing
the evidence file.

## 6. Manual code review

Read these files completely:

- `server/sql/g1-poc.sql`
- `server/scripts/g1.mjs`
- `docs/phase2/evidence/g1/THREAT-MODEL.md`
- `docs/phase2/test-plans/G1-TEST-CASES.md`

Check the following:

| ID | Check | What proves it |
|---|---|---|
| G1-REV-001 | No live DB | Connection guard rejects names not ending `_test`/`_smoke`; only `127.0.0.1:5450` is used. |
| G1-REV-002 | Real roles | Each case uses `SET ROLE` or a dedicated pool; no accidental admin connection. |
| G1-REV-003 | Forced RLS | Every tenant table has `ENABLE` and `FORCE` RLS plus insert/update/delete policy checks. |
| G1-REV-004 | Context parser | Unknown/duplicate fields, malformed base64/JSON, truncation and expiry return NULL. |
| G1-REV-005 | Signature | Canonical encoding is unambiguous; comparison does not return early on a prefix match. |
| G1-REV-006 | Key separation | App cannot read the key; context function owns the private read; no key appears in output. |
| G1-REV-007 | Support scope | Grant binds institution, scope, expiry and revocation; denied attempts are auditable. |
| G1-REV-008 | Pool reuse | The test uses a real pool, commit/rollback/error paths and a later no-context query. |
| G1-REV-009 | No test theater | Denial cases use valid cross-tenant IDs; assertions check zero rows and no mutation. |
| G1-REV-010 | Evidence match | `results.json` and `test-output.txt` agree; role counts match the expected report. |

Specific challenge points:

1. Can an attacker set `app.iid` and still read data? SEC-004 must prove no.
2. Can the app call the auth lookup or read the private key? ROLE-06/SEC-008/SEC-010
   must prove no.
3. Can the platform app read raw tenant rows? SEC-011 must prove no.
4. Can a support grant or stale worker lease mutate another tenant? SEC-012/SEC-014
   must prove no.
5. Can a pooled connection retain a tenant after commit, rollback or error?
   SEC-013 must prove no.
6. Are the denial cases using tenant B's real UUID, not a malformed UUID? If not,
   reject the evidence.
7. Is the HMAC comparison constant-time and the encoding canonical? If not, record
   a Critical/High finding and reject G1 until fixed.

## 7. Suggested extra adversarial checks

These are reviewer checks, not replacements for the 24 cases:

1. Set `app.tenant_context` to an empty string and query every tenant table.
2. Set `app.iid` to tenant B and make no signed context; query A and B.
3. Copy a valid tenant A context, change one character in the signature, query.
4. Reuse a valid context after 61 seconds; query.
5. Call `auth.lookup_login` as `examrobo_app`; confirm permission denied.
6. Select from `app_private` as `examrobo_app`; confirm permission denied.
7. Run a no-context query on a pool connection previously used for tenant A.
8. Insert a child row referencing a parent from the other tenant.
9. Create a new tenant table without a policy and run the registry checker.
10. Inspect `role-report.json` for any runtime role with `SUPERUSER` or
    `BYPASSRLS`.

Capture the command and complete output for every extra check. Do not paste
secrets or student PII.

## 8. Stop conditions

G1 must be **REJECTED** or held as **VERIFYING** if any of these occur:

- a mandatory case fails or is skipped;
- the rerun does not produce 24/24;
- a test uses the admin connection instead of the intended role;
- a denial case uses only a malformed ID and not a valid cross-tenant ID;
- the context parser is not fail-closed or the signature comparison is weak;
- a pooled connection retains tenant context;
- the local image/version does not match the recorded environment;
- evidence files were edited to match the expected result;
- a Critical/High finding remains open.

A confirmed cross-tenant read/write/existence leak is automatic NO-GO and cannot
be waived.

## 9. Known gaps at handoff

- G0 remains PARTIAL: production-like restore, identity collision report and
  named gate owners/reviewers are still missing.
- The local PostgreSQL `RepoDigest` was not captured; the registry digest and
  version are recorded instead.
- The custom HMAC-in-Postgres verifier still needs this independent review.
- HTTP, WebSocket, Redis, storage, exports and background-job isolation are G2
  work, not G1.
- No `/api/v2` endpoint exists and no v1.5 route was changed.

## 10. Disposition

Reviewer must complete this section. An unsigned report is not approval.

```text
Decision: APPROVED / CONDITIONAL / REJECTED
Reviewer name:
Reviewer role:
Date:
Reviewed commit SHA:
Working tree clean: yes/no
Environment:
PostgreSQL version:
Local image digest:
Rerun result: __ passed, __ failed, __ skipped
Original evidence hashes verified: yes/no
Findings:
  - ID / severity / description / disposition
Conditions (if conditional):
Expiry (if conditional):
Signature:
```

## 11. Exit rule

G1 becomes `APPROVED` only when:

- all 24 automated cases pass on the reviewer's rerun;
- all manual review checks are dispositioned;
- the environment and image digest are recorded;
- no Critical/High finding remains;
- the reviewer signs this report;
- `Brain/NextSteps.md` and `Brain/ProjectReview.md` are updated.

Until then, G1 stays `VERIFYING` and G2/migrations `014+` remain blocked.
