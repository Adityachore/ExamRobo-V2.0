# Phase 2 gate test plans

- Status: active
- Protocol: `../GATE-REVIEW-PROTOCOL.md`
- Evidence root: `../evidence/`

This folder holds the executable test plan for every release gate. A test plan
is written against a frozen implementation. It is not a place to record a
result; results belong in `../evidence/gX/`.

## 1. Order of work

1. Complete the gate's implementation.
2. Freeze the commit/SHA and record `git status --short`.
3. Fill or update `GX-TEST-CASES.md` from the approved requirements.
4. Execute every case exactly as written.
5. Save complete output and machine-readable results in `../evidence/gX/`.
6. Fix failures and rerun the full gate suite.
7. Hand the complete package to an independent reviewer.
8. Reviewer writes `../evidence/gX/REVIEWER-REPORT.md` and signs the decision.

Do not execute a gate test plan against a moving tree. Do not mark a gate
approved because a subset of tests passes.

## 2. Files

| File | Purpose | Current state |
|---|---|---|
| `_TEMPLATE.md` | Copy this block for every new test case. | Ready |
| `G0-TEST-CASES.md` | Baseline, restore, inventory, identity collision and ownership. | Local cases pass; production-data cases blocked |
| `G1-TEST-CASES.md` | 24 database security cases plus manual review checks. | Implemented; local 24/24; independent review pending |
| `G2-TEST-CASES.md` | Tenant isolation across SQL, API, WebSocket, Redis, storage and jobs. | Waiting for implementation freeze |
| `G3-TEST-CASES.md` | Identity, sessions, seats, subscriptions, billing and jobs. | Waiting for implementation freeze |
| `G4-TEST-CASES.md` | Privacy, erasure, external ledger, restore and tombstone replay. | Waiting for implementation freeze |
| `G5-TEST-CASES.md` | Compatibility, performance, security, recovery, operations and pilot. | Waiting for implementation freeze |

## 3. Case ID convention

```text
GX-<AREA>-NNN
```

Examples:

- `G1-SEC-004` - forged `app.iid` must not grant access;
- `G2-FK-001` - composite tenant foreign key;
- `G3-BILL-006` - amount/currency/tenant mismatch cannot activate;
- `G4-REST-001` - restore from a pre-erasure backup and replay tombstones;
- `G5-COMPAT-004` - exam start, timer, autosave and submit golden journey.

IDs are permanent. Do not renumber a case after it has been used in evidence.
If a case is retired, mark it `RETIRED` and keep the history.

## 4. Required test dimensions

Every area must cover the dimensions that apply to its risk:

- happy path;
- negative and malformed input;
- authorization and role matrix;
- tenant A -> B and B -> A, using valid IDs from the other tenant;
- unauthenticated, disabled and stale-session paths;
- boundary values and exact time boundaries;
- concurrency with separate database connections;
- retry, duplicate, replay and out-of-order events;
- failure injection and fail-closed behavior;
- audit/log evidence and absence of secret/PII leakage;
- cleanup and final database state;
- v1.5 regression where the gate can affect legacy behavior.

## 5. Evidence

Each executed case must point to:

- the exact command or request;
- the complete output or immutable artifact;
- the commit SHA and environment;
- the tester and timestamp;
- the gate `results.json` and `test-output.txt` when produced.

Redact passwords, tokens, keys, student names, emails, phone numbers and
answers. Do not paste a full `.env` file into any artifact.

## 6. Gate state

A test plan can be `READY` before implementation, but its cases cannot be
executed for a gate result until the implementation is frozen. The gate itself
uses the status model in `../GATE-REVIEW-PROTOCOL.md`.

`VERIFIED` means the evidence is complete. `APPROVED` means an independent
reviewer accepted it. The two are not interchangeable.
