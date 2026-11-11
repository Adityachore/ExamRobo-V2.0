# G0 - baseline and decision readiness test cases

- Gate: G0
- Status: **PARTIAL** - local baseline is green; production-data closure is blocked
- Evidence: `../evidence/baseline.md`
- Protocol: `../GATE-REVIEW-PROTOCOL.md`
- Rule: do not mark G0 green until every mandatory case is `VERIFIED` and a
  named approver signs the disposition.

## 1. Current state

| Case | Title | Status |
|---|---|---|
| G0-BASE-001 | Exact v1.5.0 source is pinned | PASS |
| G0-BASE-002 | Baseline tree and lockfiles are recorded | PASS |
| G0-BASE-003 | Four-phase verify passes on a clean baseline | PASS |
| G0-RESTORE-001 | Production-like backup restores into a scratch database | BLOCKED |
| G0-RESTORE-002 | Restore counts and checksums match | BLOCKED |
| G0-INV-001 | Route/table/query/job/cache/storage inventory is complete | NOT STARTED |
| G0-ID-001 | Login identity collision report is produced | BLOCKED |
| G0-ID-002 | Identity policy decisions are recorded | PASS |
| G0-OWN-001 | Gate owners and independent reviewers are named | NOT STARTED |
| G0-DOC-001 | No unresolved architecture contradiction remains | NOT STARTED |
| G0-EXT-001 | External dependencies and legal questions are assigned | PARTIAL |
| G0-EVID-001 | Baseline evidence artifact is linked from the tracker | PASS |

## 2. Test cases

### G0-BASE-001 - Exact v1.5.0 source is pinned

- Requirement / risk: M0 baseline; release traceability
- Severity: Critical
- Automation: manual
- Status: PASS

Preconditions:

- Repository checkout available.

Steps:

1. Run `git rev-parse HEAD`.
2. Run `git tag --points-at HEAD`.
3. Run `git branch --show-current`.
4. Record the SHA, tag and branch in the execution record.

Expected result:

- Baseline commit `3c6518b` is tagged `v1.5.0-baseline`.
- Release commit `b5ddb76` is tagged `v1.5.0`.
- Work is on `feat/saas-v2`.
- No ambiguous or missing baseline SHA.

Evidence:

- Command output in `../evidence/baseline.md`.
- Release record entry with SHA and tag.

Pass criteria:

- One exact SHA is accepted as the v1.5.0 baseline.
- The SHA and tag are reproducible from the repository.

### G0-BASE-002 - Baseline tree and lockfiles are recorded

- Requirement / risk: M0 baseline; reproducible build
- Severity: High
- Automation: manual
- Status: PASS

Preconditions:

- Baseline SHA checked out or available as a worktree.

Steps:

1. At the baseline SHA, run `git status --short`.
2. Record `server/package-lock.json` and `web/package-lock.json` hashes.
3. Confirm the lockfiles are committed at the baseline.
4. Record any generated/local-only files that are ignored.

Expected result:

- Baseline tree is clean.
- Both lockfiles are present and tracked.
- Ignored local-only files are named, not silently mixed into the baseline.

Evidence:

- `git status --short` at the baseline SHA.
- SHA-256 of both lockfiles.

Pass criteria:

- The baseline can be rebuilt from the recorded SHA and lockfiles.

### G0-BASE-003 - Four-phase verify passes on a clean baseline

- Requirement / risk: M0 baseline; no regression
- Severity: Critical
- Automation: automated
- Status: PASS

Preconditions:

- Clean baseline tree.
- Docker database and Redis available on the documented local ports.
- Root `.env` present; secrets are not printed.

Steps:

1. Run `cd server`.
2. Run `npm run verify`.
3. Capture the complete summary and phase logs.
4. Record PostgreSQL and Redis versions.

Expected result:

- Preflight PostgreSQL PASS.
- Preflight Redis PASS.
- Unit tests PASS.
- Web build PASS.
- Smoke tests PASS with **187/187**.
- No phase is silently skipped.

Evidence:

- `../evidence/baseline.md`.
- Complete `npm run verify` output.

Pass criteria:

- Four phases pass exactly once.
- Smoke assertion count is 187/187 or higher, never lower without approval.

### G0-RESTORE-001 - Production-like backup restores into a scratch database

- Requirement / risk: M0; restore confidence
- Severity: Critical
- Automation: semi-automated
- Status: BLOCKED

Preconditions:

- A production-like backup is supplied by the owner.
- Scratch database name ends in `_test` or `_smoke`.
- No production database is reachable from the restore command.

Steps:

1. Record the backup file hash, size, source and creation time.
2. Create a scratch PostgreSQL 16 database.
3. Restore the backup with the documented tool and options.
4. Run the application preflight against the scratch database.
5. Record restore duration and errors.

Expected result:

- Restore completes without manual table fixes.
- Preflight connects and reports the expected schema version.
- No production connection string is used.

Evidence:

- Restore command and complete output.
- Backup hash and scratch database name.
- Preflight result.

Pass criteria:

- Restore succeeds from the supplied backup.
- Evidence proves the target was a scratch database.

Blocked reason:

- No production-like backup is available in the repository or supplied by the
  owner.

### G0-RESTORE-002 - Restore counts and checksums match

- Requirement / risk: M0; data integrity
- Severity: Critical
- Automation: semi-automated
- Status: BLOCKED

Preconditions:

- G0-RESTORE-001 passed.
- Owner provides expected row counts or checksums.

Steps:

1. Compare row counts for every critical table.
2. Compare schema migration state and constraints.
3. Compare checksums for deterministic exported columns.
4. Record every mismatch and its owner.

Expected result:

- Counts and checksums match the approved source report.
- Any mismatch has a written explanation and owner.

Evidence:

- Count/checksum comparison report.
- Mismatch list with dispositions.

Pass criteria:

- No unexplained mismatch.

Blocked reason:

- Depends on G0-RESTORE-001 and the owner's expected counts/checksums.

### G0-INV-001 - Route/table/query/job/cache/storage inventory is complete

- Requirement / risk: M0; source-of-truth ownership
- Severity: High
- Automation: semi-automated
- Status: NOT STARTED

Preconditions:

- Baseline source checked out.
- Inventory template or script is available.

Steps:

1. Enumerate all API routes and note tenant-scoped vs global.
2. Enumerate all tables, views, functions and sequences.
3. Enumerate all direct SQL queries and their access path.
4. Enumerate jobs, timers, outbox work and retry paths.
5. Enumerate Redis keys, locks, caches and rate-limit buckets.
6. Enumerate files, recordings, exports, signed URLs and storage paths.
7. Assign an owner to every item.

Expected result:

- Every route/table/query/job/cache/storage path has an owner.
- Every tenant-bearing item is marked for G2 classification.
- No "unknown source of truth" remains.

Evidence:

- Inventory file linked from the G0 evidence folder.
- Owner column complete.

Pass criteria:

- A reviewer can trace any tenant row to one source-of-truth owner.

### G0-ID-001 - Login identity collision report is produced

- Requirement / risk: R-020; identity policy
- Severity: Critical
- Automation: semi-automated
- Status: BLOCKED

Preconditions:

- Read-only access to the production-like restore or approved export.
- Identity normalization rules are fixed.

Steps:

1. Normalize staff, student and parent identifiers using the approved rule.
2. Find identifiers that resolve to more than one principal.
3. Find students sharing contact identifiers across institutions.
4. Classify each collision as merge, split, reject or manual review.
5. Get product-owner approval for the remediation path.

Expected result:

- Every collision is listed.
- No legacy row is assigned by arbitrary first match.
- A remediation path exists before backfill.

Evidence:

- Collision report with counts and dispositions.
- Product-owner decision.

Pass criteria:

- Zero unresolved Critical identity collisions.
- No silent merge or deletion.

Blocked reason:

- The production-like restore and collision scan are unavailable.

### G0-ID-002 - Identity policy decisions are recorded

- Requirement / risk: R-020; DQ-01/DQ-02
- Severity: High
- Automation: manual
- Status: PASS

Preconditions:

- Decision register is available.

Steps:

1. Confirm the staff role model.
2. Confirm the student shared-contact rule.
3. Confirm one institution per staff principal.
4. Confirm Owner/Admin billing rights.
5. Link each decision to its dependent task.

Expected result:

- Decisions are written, dated and owned.
- Open items are explicitly marked open, not implied as closed.

Evidence:

- `Brain/ProjectReview.md` and `../evidence/baseline.md`.

Pass criteria:

- No approved implementation depends on an unrecorded identity decision.

### G0-OWN-001 - Gate owners and independent reviewers are named

- Requirement / risk: minimum approvals; no self-approval
- Severity: Critical
- Automation: manual
- Status: NOT STARTED

Preconditions:

- Gate list G0-G5 is agreed.

Steps:

1. Name an owner for every gate.
2. Name an independent reviewer for G1-G5.
3. Record who can approve security, database, privacy/legal, finance and
   production release decisions.
4. Record the backup approver for each role.

Expected result:

- Every gate has a named owner and approver.
- G1 has a reviewer who did not implement the harness.

Evidence:

- Gate ownership table in the execution tracker.

Pass criteria:

- No gate is approved by the implementer alone.
- No approver is listed as `TBD` at gate approval time.

### G0-DOC-001 - No unresolved architecture contradiction remains

- Requirement / risk: design readiness
- Severity: High
- Automation: manual
- Status: NOT STARTED

Preconditions:

- 38-file design pack is available.

Steps:

1. Cross-check PRD, TRD, database model, auth, billing, privacy and gates.
2. List contradictions with file and line references.
3. Assign an owner and decision date to each.
4. Close or explicitly waive each item.

Expected result:

- No contradictory tenant, identity, billing or retention rule remains.
- Every waiver is bounded and recorded.

Evidence:

- Contradiction register with dispositions.

Pass criteria:

- Reviewer finds no unresolved blocker.

### G0-EXT-001 - External dependencies and legal questions are assigned

- Requirement / risk: launch readiness
- Severity: High
- Automation: manual
- Status: PARTIAL

Preconditions:

- External dependency register is available.

Steps:

1. List hosting/region, provider, SMTP, legal, CA/GST, refund, Elite licensing
   and domain/TLS inputs.
2. Assign an owner and due date.
3. Mark which gate each input blocks.
4. Record the current status.

Expected result:

- No external input is unowned.
- The blocked gate is explicit.

Evidence:

- `Brain/NextSteps.md` external-inputs section and updated statuses.

Pass criteria:

- Every external blocker has an owner, gate and next action.

### G0-EVID-001 - Baseline evidence artifact is linked from the tracker

- Requirement / risk: evidence standard
- Severity: Medium
- Automation: manual
- Status: PASS

Preconditions:

- Baseline run completed.

Steps:

1. Store the baseline result in `../evidence/baseline.md`.
2. Link it from `Brain/NextSteps.md` and `Brain/ProjectReview.md`.
3. Confirm it contains command, environment, result and timestamp.

Expected result:

- The baseline claim is backed by a run artifact, not a checklist.

Evidence:

- `../evidence/baseline.md`.

Pass criteria:

- A reviewer can reproduce the baseline from the artifact.

## 3. G0 exit criteria

G0 is `APPROVED` only when:

- G0-BASE-001..003 pass;
- G0-RESTORE-001..002 pass;
- G0-INV-001 is complete;
- G0-ID-001 is complete and dispositions are approved;
- G0-OWN-001 is complete;
- G0-DOC-001 has no unresolved blocker;
- G0-EXT-001 has no unowned blocker;
- the tech lead and project owner sign the disposition.

Until then, G0 remains **PARTIAL** and G2 production tenant work remains blocked.
