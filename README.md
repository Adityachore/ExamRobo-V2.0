# ExamRobo

A proctored online exam platform: React/Vite frontend, Express API, PostgreSQL,
Redis, and a single-origin deployment behind nginx.

> **v2.0 (Phase 20):** multi-tenant SaaS work is planned on branch
> `feat/saas-v2`; see `Brain/ProjectReview.md` and
> `docs/Brain-Phase2-Production-Ready/`. v1.5.0 remains the shipped release.

## Local development

Requirements: Node.js 20+, PostgreSQL, and (optionally) Redis.

```bash
cp server/.env.example server/.env   # fill in DATABASE_URL and JWT_SECRET
cd server && npm install && npm run migrate && npm run seed
npm run dev
```

In another terminal:

```bash
cd web && npm install && npm run dev
```

The Vite dev server runs on `http://localhost:5173`; the API runs on
`http://localhost:4000`. In development the default CORS allowlist contains the
local Vite and web ports.

## Production deployment

```bash
cp .env.example .env             # fill in JWT_SECRET and DB_PASSWORD
chmod 600 .env
docker compose up -d --build
```

Only `web` is published, on `127.0.0.1:${WEB_PORT:-8083}`. `api`, `db`, and
`redis` stay on the `examrobo_internal` Docker network and are not publicly
reachable. The production profile assumes Cloudflare in front of
`examrobo.pararobo.in`: `web/nginx.conf` maps `CF-Connecting-IP` and
`X-Forwarded-Proto`, so lockouts, rate limits and the SEB hash use the real
student address and public scheme. Terminate TLS at Cloudflare (Full strict) or
at a host reverse proxy in front of the web container; do not expose the API
port directly.

`CORS_ORIGINS` is empty by default in production, which means no cross-origin
browser requests are accepted. The web app is served same-origin by nginx. Set
it only if a separate browser origin must call the API.

The full operator runbook is `server/DEPLOY.md` (first boot, ports, first admin,
TLS, SEB, backups, upgrade and rollback). Read it before the first real exam.

### Question bank

The production content pack is `docs/question-bank/Internship_Exam_Question_Bank_1100.md`
(1,100 questions, 11 domains × 100). Import it with:

```bash
cd server && npm run import-bank -- --dry-run
cd server && npm run import-bank
```

The importer is idempotent on each question's stable source key and never
truncates the bank. Repeated stems are imported as distinct rows.
Do not use `npm run seed` for production content — it truncates and reseeds.


### First admin

Production does not seed admin credentials from environment variables. Create
the first admin explicitly:

```bash
cd server
ADMIN_PASSWORD='a-long-password' npm run create-admin -- admin@example.com
```

The password must be at least 12 characters. Then sign in at `/admin/login`.
The `ADMIN_EMAILS`/`ADMIN_PASSWORD` bootstrap is development-only.

## Exam behavior

- Sections unlock in order. The first section starts when the paper is created.
  A section is closed by an explicit finish or by its own timer; finishing the
  last section submits the paper.
- Three warning-tier integrity events submit the paper automatically with
  reason `max_warnings`. Log-tier events are recorded only.
- Results follow the event `results_visibility` (`immediate`, `after_all_submitted`, `manual`, `never`). In manual mode, admins publish results with an expiry (and can extend/unpublish); removed roster students never see results.
- Screen recording upload has been removed. The database table and Docker
  volume are retained for existing data. Deleting an event archives it and
  keeps its papers, results and stored files.

## Verification

One command runs all phases exactly once:

```bash
cd server && npm run verify
```

It runs unit tests, the web production build, and the API smoke test against a
throwaway database that must end in `_smoke` or `_test`. It never points at the
live database or launches the application.
