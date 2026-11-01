# ExamRobo

A proctored online exam platform: React/Vite frontend, Express API, PostgreSQL,
Redis, and a single-origin deployment behind nginx.

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
export POSTGRES_PASSWORD='...'
export JWT_SECRET='...'          # long random value, never the dev default
docker compose up -d --build
```

Only `web` is published, on `127.0.0.1:${WEB_PORT:-8080}`. `api`, `db`, and
`redis` stay on an internal Docker network. Terminate TLS at a reverse proxy in
front of the web container; do not expose the API port directly.

`CORS_ORIGINS` is empty by default in production, which means no cross-origin
browser requests are accepted. The web app is served same-origin by nginx. Set
it only if a separate browser origin must call the API.

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
  volume are retained for existing data; deleting an event still removes its
  stored files.

## Verification

One command runs all phases exactly once:

```bash
cd server && npm run verify
```

It runs unit tests, the web production build, and the API smoke test against a
throwaway database that must end in `_smoke` or `_test`. It never points at the
live database or launches the application.
