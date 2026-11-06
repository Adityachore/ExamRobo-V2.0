# Operations, Deployment and Production Readiness

## 1. Environments

| Environment | Data | Provider behavior | Purpose |
|---|---|---|---|
| Local | Synthetic seed only | Mock/console | Developer workflow |
| CI scratch | Disposable `_test`/`_smoke` DB | Mocks only | Automated tests |
| Staging | Sanitized/restored copy | Razorpay test mode; test inboxes | Integration and rehearsal |
| Pilot | Approved institution data | Real approved providers | Controlled real exam/payment validation |
| Production | Real tenant data | Live providers | Customer service |

Never copy production personal data to developer machines. Staging data must be anonymized or explicitly approved and access-controlled.

## 2. Infrastructure requirements

Selected direction: Hostinger VPS for API/web/workers, with separate managed PostgreSQL, Redis and object storage. Hostinger SMTP handles transactional email. Exact managed-service providers, VPS region/data residency and capacity remain open. Hostinger shared hosting is not a supported deployment target.

Domain model: only Elite receives a platform subdomain. Trial/Standard/Premium use the shared platform path. Custom domains are out of scope. Configure wildcard DNS/TLS and cookie scope for the Elite subdomain; never use the Host header as the sole tenant authorization source.

Before production, document actual:

- API instance count and autoscaling rules;
- PostgreSQL managed/self-hosted topology, HA/failover and storage;
- Redis topology and persistence policy;
- object-storage bucket, versioning, encryption and retention;
- network segmentation, TLS and firewall rules;
- connection pool sizes for app, worker, auth and migration;
- secret manager and KMS;
- centralized logs, metrics, traces and alert routing;
- backup/PITR and restore automation;
- staging/prod isolation and deployment pipeline.

Do not state capacity or availability until verified on the selected infrastructure.

## 3. Security operations

- TLS at edge and service/database connections where supported.
- Secrets from secret manager; no secrets in source, Markdown, logs, CI artifacts or images.
- Separate keys for JWT signing, tenant-context HMAC, password reset, OTP/fraud fingerprinting, provider webhook verification, encryption and storage signing.
- Key IDs, rotation schedule, emergency rotation procedure and access audit.
- MFA for platform operators and infrastructure administrators.
- Least-privilege service identities; production shell/DB access break-glass only.
- Log redaction for password, OTP, refresh token, webhook secret, personal answer payload and full payment payload.
- Dependency scanning, container scanning, SAST/secret scanning and patch cadence.
- Restricted support access with purpose, scope and audit.

## 4. Observability

Metrics:
- request volume, error rate, p50/p95/p99 latency by route and tenant aggregate;
- DB pool usage, connection waits, query latency, lock waits, deadlocks and replication lag;
- RLS/context verification failures and tenant authorization denials;
- login attempts, lockouts, refresh reuse and session revocations;
- WebSocket connection count, tenant message lag and disconnects;
- queue depth/oldest age, lease expirations, retries and dead letters;
- webhook inbox age, processing errors and payment mismatches;
- entitlement reconciliation lag and due-boundary backlog;
- backup age, restore test status and privacy-ledger replication lag;
- storage error rate and orphaned object count.

Alerts must include service, environment, owner, severity, first-seen time, correlation ID and runbook link. Metrics/logs must not leak raw email or student data.

## 5. SLO / RPO / RTO decisions

The owner must approve SLO, RPO and RTO after choosing actual hosting and cost. Proposals for discussion only:

- API availability target: 99.5% monthly for the initial pilot, then revise from observed need.
- Database RPO target: ≤5 minutes if PITR/replication architecture supports it.
- Recovery time target: ≤60 minutes for the first production tier.
- Revocation propagation target: immediate for HTTP checks; WebSocket close within 30 seconds with heartbeat fallback.

These are candidate targets, not achieved commitments. If infrastructure cannot meet them, revise scope and contract wording before onboarding.

## 6. Backup and disaster recovery

- Continuous WAL/PITR or equivalent with periodic full backups.
- Encrypted backups and separate backup credentials/account.
- Backup access logged and MFA protected.
- Monthly restore rehearsal to isolated environment; full production cutover rehearsal before launch.
- Restore includes database, required object storage, external ledger, provider inbox/outbox and encryption keys.
- Privacy tombstones replay before ingress; see `08-DATA-PRIVACY-RECOVERY.md`.
- Verify logical consistency, tenant isolation, payment reconciliation and exam data after restore.
- Record actual RPO/RTO results and restore approver.

## 7. Deployment safety

- Immutable build artifacts pinned by commit and digest.
- Automated migration preflight and postflight.
- Deploy backward-compatible application before enabling new features.
- Feature flags for public registration, billing, school onboarding and noncritical analytics.
- Canary/internal tenant first; pilot institutions next; general registration last.
- No production migration during an active exam window.
- Do not disable RLS or relax database grants to recover an incident.
- Use the rollback distinctions in `09-MIGRATION-CUTOVER-ROLLBACK.md`.

## 8. Runbooks required

1. Database failover and connection-pool recovery.
2. Tenant access incident / suspected cross-tenant exposure.
3. Authentication/JWT signing key rotation.
4. Tenant-context HMAC key rotation.
5. Payment/webhook mismatch and duplicate payment.
6. Subscription reconciliation backlog.
7. Queue/outbox dead-letter recovery.
8. Provider outage (email/SMS/Razorpay).
9. Exam-day incident and safe continuation.
10. Privacy request, legal hold and anonymisation.
11. Data breach and tenant notification.
12. Backup restore and privacy tombstone replay.
13. Application rollback / feature disablement.
14. Super Admin account recovery.

Each runbook has owner, trigger, preconditions, commands/steps, verification and escalation. Secrets/passwords are not embedded in the Brain.

## 9. Support model

Define business-hour coverage, exam-day on-call, support priority by plan, response targets, emergency tenant suspension, payment exception ownership, and who can authorize data exports or support access. Do not grant support staff broad database credentials.
