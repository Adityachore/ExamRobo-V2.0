# v1.5.0 Compatibility and Performance Validation

## 1. Source compatibility is a mandatory input

The Phase 2 planning archive does not contain the v1.5.0 source code, database DDL or runtime artifacts. Compatibility cannot be proven from documentation. Before implementation, retrieve and pin the actual repository commit, deployment images, database backup and migration history.

## 2. Inventory required

Create a machine-readable inventory (stored in repository/evidence system, not as a guessed table here) for:

- all API routes, methods, auth middleware and response shapes;
- all SQL tables, columns, constraints, indexes, triggers and views;
- all raw SQL call sites, repositories and transaction assumptions;
- every login, password reset and student eligibility path;
- every exam create/start/autosave/submit/grade/result workflow;
- every WebSocket namespace, room, Redis channel and message schema;
- every CSV/PDF export and background job;
- all object-storage paths, upload/download routes and retention behavior;
- environment variables and provider integrations;
- seed scripts and migration runner behavior.

Each inventory line has source file/function, owner, tenant scope, change impact and regression test.

## 3. API compatibility

- Capture golden request/response snapshots from a seeded v1.5.0 database.
- Replay them against the migrated application.
- Preserve status codes and response shape where possible; additive fields only unless approved.
- Explicitly test role mismatch, expired subscription, foreign IDs and new limit errors.
- Verify CSV column order/encoding and PDF output expectations.
- Verify existing student login and lockout behavior.

## 4. Database compatibility

- Compare schema before/after including constraints, defaults, generated columns, triggers, indexes and views.
- Preserve primary keys and references; do not re-key exam records without migration design.
- Validate `created_by` and actor references after moving platform Super Admin identities out of tenant `admins`.
- Check all unique indexes for tenant scope and every foreign key for tenant parent binding.
- Verify old code cannot accidentally write outside the legacy tenant in any approved fallback path.
- Record behavior of old and new query modules under forced RLS.

## 5. Exam-day regression matrix

| Journey | Required evidence |
|---|---|
| Student login / eligibility | Existing v1.5 behavior and lockout unchanged |
| Exam start | Tenant/event ownership and correct access state |
| Question delivery | Only event's tenant questions and variants |
| Answer autosave | Existing semantics; no duplicate/lost writes |
| Snapshot/heartbeat | Correct ownership and timing |
| Warning/proctor event | Correct tenant and paper relation |
| Student submit | Existing submit guard remains atomic |
| Grading/results | Scores, analytics and visibility match golden baseline |
| Admin live monitoring | Snapshot and socket messages tenant-filtered |
| CSV/PDF export | Tenant-only data; headers and encoding preserved |
| Question bank import | Same source file can be imported in separate institutions without collision |
| Worker/sweeper | Context established per tenant; no zero-row silent behavior |

## 6. Performance baseline and budgets

Do not approve a fixed 1,000-VU claim without a workload, target hardware and measured baseline. The previous proposal's 1,000 concurrent students across five institutions is retained as a candidate workload, not a verified capacity statement.

### Candidate workload

- 1,000 concurrent students across five institutions, including one hot tenant with 800 and four tenants with 50 each.
- Login burst within five minutes.
- Existing v1.5 cadence for exam start, answer autosave and periodic snapshots.
- 50 live-monitor observers.
- One results CSV export during the run.
- Subscription and outbox workers active.
- Separate 50-VU exam profile and 20-VU normal-day profile.

### Candidate budgets (must be ratified after baseline)

| Path | Candidate p95 | Candidate p99 |
|---|---:|---:|
| Answer autosave | ≤300 ms | ≤800 ms |
| Exam snapshot | ≤400 ms | ≤1,000 ms |
| Student login | ≤800 ms | ≤2,000 ms |
| Admin live snapshot | ≤600 ms | ≤1,500 ms |
| Results CSV | ≤30 s complete | Keyset pagination |

Additional candidate controls: application error rate ≤0.5%; DB pool saturation <80%; socket delivery p95 ≤1s; no long-held request transaction; no tenant/system pools exceeding PostgreSQL `max_connections` with operational headroom.

These values are proposals. The owner/architect must ratify them against v1.5.0 baseline, target hardware and product SLO. A baseline +15% relative rule does not replace absolute user experience budgets.

## 7. Required performance report

Record hardware/VM shape, CPU/RAM/storage, PostgreSQL version/config, Node version, commit SHA, data volume/distribution, k6 version/script hash, pool sizes, VUs, ramp profile, warm-up, duration, p50/p95/p99, throughput, errors, DB query time, lock waits, pool saturation, Redis/socket behavior and top slow queries.

Run at least:

1. Existing v1.5.0 baseline.
2. Phase 2 tenantized build under identical hardware/data/workload.
3. Hot-tenant skew scenario.
4. Concurrent exam + export + billing/job scenario.
5. Soak test long enough to detect pool/memory/queue growth.
6. Failure injection for Redis disconnect, worker restart and DB failover where supported.

## 8. Performance gate

If the tenant query context or RLS overhead breaches budget, do not disable RLS. Optimize indexes, query plans, transaction scope, cache, batching and workload architecture. A fallback architecture must preserve the same isolation tests and receive an architecture decision before code is merged.
