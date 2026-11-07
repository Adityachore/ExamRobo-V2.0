# G0 baseline evidence

- Date: 2026-11-08
- Branch: `feat/saas-v2`
- HEAD at verification: `a52acd9`
- Frozen code: `b5ddb76` (`v1.5.0`)
- Docs baseline: `3c6518b` (`v1.5.0-baseline`)
- Host: Windows, Node `v24.21.0`, npm `11.5.2`, Docker `29.5.2`
- Database: PostgreSQL `16.15` in `examrobo-db`, healthy, `127.0.0.1:5450`
- Cache: Redis 7 in `examrobo-redis`, healthy, `127.0.0.1:6379`
- Scratch database: `examrobo_smoke` (created and dropped by the verify run)

## Command

```powershell
cd server
# VERIFY_PG_URL password is read from the root `.env` DB_PASSWORD and is not printed.
# Docker publishes IPv4 only, so the URL uses 127.0.0.1 instead of localhost.
$env:VERIFY_PG_URL = "postgres://examrobo:***@127.0.0.1:5450/examrobo"
$env:VERIFY_REDIS_URL = "redis://127.0.0.1:6379/9"
npm run verify
```

## Result

| Phase | Result | Detail |
| --- | --- | --- |
| preflight:postgres | PASS | connected to PostgreSQL 16.15 |
| preflight:redis | PASS | connected to Redis 7 |
| unit tests | PASS | `node --test`, 1292.2313 ms |
| web build | PASS | Vite build ok |
| smoke test | PASS | 187 passed, 0 failed |

Overall: **PASS**. The smoke test ran against a scratch database, not the live
`examrobo` database.

## G0 status

**PARTIAL — local verification green, production-data closure missing.**

The following G0 items are still open:

- restore of a production-like backup with checksum and timing evidence;
- legacy identity collision report (duplicate emails, identity conflicts);
- named gate owner and independent reviewer;
- final clean-tree confirmation after this documentation commit.

The owner authorized the isolated G1 synthetic POC despite these blockers. That
waiver does not pass G0 and does not authorize G2.
