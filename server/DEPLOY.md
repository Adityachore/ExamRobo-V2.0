# ExamRobo — server deployment guide

Audience: an AI agent or operator putting this project on a Linux server.
Goal: one working, hardened deployment reached over HTTPS, with Safe Exam
Browser (SEB) enabled only when it is really needed. Work top to bottom and
verify after every change. Never guess a credential, hostname or port: where
this guide says **ASK**, stop and ask the operator.

## Ground rules

- **Never run `npm run seed` on production.** It truncates the question bank,
  exams and admins, then inserts dev credentials (`admin@examrobo.dev/admin123`).
- **Never expose PostgreSQL or Redis to the internet.** This compose file binds
  them to `127.0.0.1`; keep it that way.
- **Never commit or paste `.env`, database dumps or the SEB key.** Keep `.env`
  at mode `600`.
- The exam clock is server-authoritative. The host clock must be synced (NTP),
  or every timer and result timestamp is wrong.
- One change at a time, then verify. If a command fails, stop, capture the
  output, and report it. Do not invent workarounds that skip a check.

## 1. What runs

| Service | Image | Host port | Purpose |
|---|---|---|---|
| `db` | postgres:16-alpine | `127.0.0.1:${DB_PORT:-5450}` | system of record |
| `redis` | redis:7-alpine | `127.0.0.1:${REDIS_PORT:-6379}` | lockout, rate limits, WS fan-out |
| `api` | node:20-alpine (built) | `127.0.0.1:${API_PORT:-4000}` | Express API + WebSocket |
| `web` | nginx:alpine (built) | `127.0.0.1:${WEB_PORT:-8083}` | SPA + `/api`, `/health`, `/ws` proxy |

- `web` is the only public HTTP entry. Its nginx serves the built SPA and
  proxies to `api:4000`.
- On boot the API applies `sql/migrations/*.sql`, then the taxonomy, then the
  backfill. A fresh database volume also gets `server/sql/schema.sql` from
  initdb.
- Volumes: `examrobo_pgdata`, `examrobo_redisdata`, `examrobo_recordings`.
  Removing them destroys data.
- The **screen recorder is removed** and there is no upload endpoint. The
  recordings volume is kept only so existing rows and files survive; it is not
  written to by this version. Do not re-add an upload route.
- Minimum: 2 vCPU, 4 GB RAM, 20 GB disk, Docker Engine 24+ with Compose v2.

## 2. Preflight

Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 openssl curl rsync
sudo systemctl enable --now docker
sudo timedatectl set-timezone UTC
timedatectl status          # want: System clock synchronized: yes
```

Ports:

```bash
for p in 5450 6379 4000 8083; do
  if ss -ltn "sport = :$p" | grep -q LISTEN; then echo "$p BUSY"; else echo "$p free"; fi
done
```

Every BUSY port must be changed in section 5 before boot. Allow only 22, 80 and
443 through the firewall.

**ASK:** the public hostname, and whether a TLS proxy (Caddy, nginx, Cloudflare)
already exists on the host. The production profile assumes **Cloudflare in front
of `examrobo.pararobo.in`**; `web/nginx.conf` already reads `CF-Connecting-IP`
and `X-Forwarded-Proto`. If Cloudflare is not in front, the maps fall back to
`$remote_addr` and `https`, which is only correct behind a TLS proxy.

## 3. Upload

Upload the project **without** host `node_modules`, `dist`, `.env`,
`recordings` and the local `server/.env`:

```bash
rsync -av --delete \
  --exclude node_modules --exclude dist --exclude .env \
  --exclude recordings --exclude 'server/assets/exam.seb' \
  ./ user@server:/opt/examrobo/
```

Then:

```bash
cd /opt/examrobo
ls server/assets docker-compose.yml .env.example
docker compose version
```

`server/assets` must exist (it holds `exam.seb` later). Do not delete it.

## 4. Environment file

```bash
cp .env.example .env
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -hex 24)|" .env
chmod 600 .env
```

Now edit `.env` (ports from section 5, `CORS_ORIGINS`, SEB later).

| Variable | Default | What it really does |
|---|---|---|
| `JWT_SECRET` | dev value | Signs student/admin tokens. **Production refuses to start with the default.** Rotating it signs everyone out. |
| `NODE_ENV` | `production` | Production disables the admin bootstrap and requires a real JWT secret. |
| `DB_PASSWORD` | `examrobo` | Password of the `examrobo` database user. Read by Postgres **only when `pgdata` is empty**. Changing it later does not change the user's password. |
| `DB_PORT` / `REDIS_PORT` / `API_PORT` | 5450 / 6379 / 4000 | Host side only; all three bind to `127.0.0.1`. |
| `WEB_PORT` | 8083 | Public SPA port. |
| `CORS_ORIGINS` | empty | Extra browser origins, comma-separated. The SPA is same-origin through nginx, so this is only for other clients. |
| `ADMIN_EMAILS` / `ADMIN_PASSWORD` | empty | Temporary bootstrap, non-production only (section 7). |
| `SEB_REQUIRED` | `false` | Turns on the `/api/exam` gate. |
| `SEB_CONFIG_KEY` | empty | 64-hex Config Key produced by the SEB Config Tool. |
| `SEB_START_URL` | empty | Public origin the `.seb` was built for. |
| `JWT_TTL` | `4h` | Token lifetime. |
| `BCRYPT_ROUNDS` | `12` | Password hashing cost. Keep 12 in production; 10 is used by the dev seed. |
| `TRUST_PROXY` | `1` | Number of proxies in front. Cloudflare + nginx = 1 Express hop. |
| `NETWORK_GAP_SEC` | `45` | Heartbeat gap that records a `network_gap` warning. |
| `AUTH_RATE_LIMIT` / `TICKET_RATE_LIMIT` / `WS_TICKET_RATE_LIMIT` | 30 / 10 / 30 | Requests per minute per IP/identity. |

`server/.env` is only for running the API outside Docker (tests, dev). Compose
does not read it. Keep the real secrets in the root `.env`.

## 5. Ports

Docker maps `HOST:CONTAINER`. Only the host side is configurable:

| Variable | Host | Container |
|---|---|---|
| `DB_PORT` | any free | `5432` |
| `REDIS_PORT` | any free | `6379` |
| `API_PORT` | any free | `4000` |
| `WEB_PORT` | any free | `80` |

- `DATABASE_URL` and `REDIS_URL` stay `db:5432` / `redis:6379`; they are inside
  the compose network and must not follow the host ports.
- Pick new values from section 2, edit `.env`, then `docker compose up -d`
  (Compose recreates the affected containers).
- Remote API access without opening the port:
  `ssh -L 4000:127.0.0.1:4000 user@server`.
- If a **host** reverse proxy fronts the app, change the web mapping to
  `"127.0.0.1:${WEB_PORT:-8083}:80"` (this is already the production compose
  default) and proxy to that localhost port, so 8083 is not public either.
- With Cloudflare, keep the origin firewall closed to everything except
  Cloudflare's IP ranges, and keep `TRUST_PROXY=1`. The inner nginx forwards the
  real client IP from `CF-Connecting-IP`; that is what makes per-student
  lockouts and rate limits work instead of one shared tunnel bucket.
- If you run `npm run verify` on the server, point it at the mapped ports:
  `VERIFY_PG_URL=postgres://examrobo:<DB_PASSWORD>@localhost:<DB_PORT>/postgres`
  and `VERIFY_REDIS_URL=redis://localhost:<REDIS_PORT>/9`.

## 6. First boot

```bash
docker compose config > /tmp/compose.resolved.yml   # contains secrets; do not share
docker compose build
docker compose up -d
docker compose ps
docker compose logs --tail=100 api
```

Expected in the API log: applied migrations (if any), an SEB line only when
configured, and `[api] ExamRobo API on :4000 (production)`.

**Important:** a migration failure is logged but does not stop the API. Always
read that log after boot and after an upgrade.

Checks (use your ports):

```bash
curl -fsS http://127.0.0.1:4000/api/health
curl -fsS http://127.0.0.1:8083/api/health
curl -fsS http://127.0.0.1:8083/api/seb/status
curl -fsSI http://127.0.0.1:8083/ | head -1
```

The first returns `{"ok":true}`. The SPA must answer `200`.

## 7. First admin (production disables bootstrap)

`NODE_ENV=production` refuses to create an admin on first login. Choose one:

### A. Short temporary bootstrap (recommended)

1. In `.env`: set `NODE_ENV=development`, `ADMIN_EMAILS=you@example.com`,
   `ADMIN_PASSWORD=<strong unique password>`.
2. `docker compose up -d api`
3. Create the row over the localhost-bound API:
   ```bash
   curl -sS -X POST http://127.0.0.1:4000/api/auth/admin \
     -H 'content-type: application/json' \
     -d '{"email":"you@example.com","password":"<the same password>"}'
   ```
   A JSON token means the admin row now exists.
4. Confirm:
   `docker compose exec -T db psql -U examrobo -d examrobo -c "SELECT email FROM admins;"`
5. In `.env`: set `NODE_ENV=production`, clear `ADMIN_EMAILS` and
   `ADMIN_PASSWORD`, then `docker compose up -d api`.
6. Sign in at the public URL.

Do this promptly: while `NODE_ENV=development`, the bootstrap credentials are
accepted.

### B. Insert the hash directly (no dev window)

```bash
HASH=$(docker compose exec -T -e PW='<password>' api \
  node --input-type=module -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash(process.env.PW, 12))")
docker compose exec -T db psql -U examrobo -d examrobo -v ON_ERROR_STOP=1 \
  -c "INSERT INTO admins (email, password_hash, name)
      VALUES ('you@example.com', '$HASH', 'Owner')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;"
```

Clear the shell history afterwards.

Never use the seed admin (`admin@examrobo.dev/admin123`) in production.

### 7b. Import the question bank

The full content lives in `docs/question-bank/Internship_Exam_Question_Bank_1100.md`
(1,100 questions, 11 domains × 100). Import it once, after the admin exists:

```bash
docker compose exec -T api node scripts/import-bank.mjs --source /app/docs/question-bank/Internship_Exam_Question_Bank_1100.md
```

If `docs/` is not mounted into the API image, copy the markdown into the
container first or run the importer from the host against the mapped API port
with `DATABASE_URL` set. Always run `--dry-run` first and confirm the report:

- 1,100 questions total.
- 100 per domain.
- 330 Basic / 715 Medium / 55 High.
- 4 options per question.

Re-running is safe: the importer is idempotent on each question's stable source
key; use `--replace` only when intentionally rebuilding a domain. **Never run
`npm run seed` to import content** — it truncates the bank.

## 8. TLS reverse proxy

**ASK:** DNS is pointed at the server and which certificate method to use.

Caddy (automatic HTTPS and WebSocket):

```caddyfile
exam.example.com {
    encode gzip
    reverse_proxy 127.0.0.1:8083
}
```

nginx (certbot certificate):

```nginx
map $http_upgrade $connection_upgrade { default upgrade; '' close; }

server {
  listen 443 ssl http2;
  server_name exam.example.com;
  client_max_body_size 3m;

  location / {
    proxy_pass http://127.0.0.1:8083;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 3600s;
  }
}
```

Why these lines matter:

- The inner nginx maps `CF-Connecting-IP` (`web/nginx.conf`) and forwards the
  public scheme to the API. The SEB hash is built from the exact public scheme +
  host + path, so Cloudflare must be the TLS terminator and the origin must not
  rewrite the scheme.
- `client_max_body_size 3m`: JSON API payloads only; there are no recording
  chunks in this version.
- `proxy_read_timeout 3600s`: the proctor WebSocket stays open during the exam.
- Keep `Host $host`, or the SEB hash changes and every request fails.
- On Cloudflare, set SSL/TLS mode to **Full (strict)** and do not enable
  "Under Attack" during an exam (it adds a challenge page).
- Cloudflare WebSockets are on by default; keep them on, or the proctor channel
  and the live dashboard fall back to polling.

### Origin behind an existing host proxy

When the host already has nginx/Caddy terminating TLS in front of
`127.0.0.1:8083`, that proxy is the one Cloudflare talks to. Keep the container
`web/nginx.conf` as it is and make the host proxy pass the two headers it reads:

```nginx
location / {
  proxy_pass http://127.0.0.1:8083;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 300s;
}

location /ws {
  proxy_pass http://127.0.0.1:8083;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
  proxy_read_timeout 3600s;
}
```

`TRUST_PROXY=1` is still correct: Express only sees the container nginx, and
that nginx already rewrites `X-Forwarded-For` from `CF-Connecting-IP`. Do not
raise it to 2, or Express starts trusting the client's own header.

Test: `curl -I https://exam.example.com/`,
`curl https://exam.example.com/api/health`, then sign in through the browser.
Check `https://exam.example.com/api/health` from **outside** Cloudflare as well:
the origin ports must be closed to everything except Cloudflare's ranges.

## 9. Safe Exam Browser (only when required)

The `.seb` and its Config Key are bound to one origin. Changing the domain
means rebuilding both.

1. On Windows open **SEB Config Tool → Exam Configuration**.
2. Start URL: `https://exam.example.com/` exactly (scheme, host, no trailing
   slash beyond the root).
3. Set the quit/uninstall passwords and allow only the exam host.
4. Apply the **Config Key** (64 hex characters) and note it.
5. Save as `exam.seb`.

Upload it:

```bash
scp exam.seb user@server:/opt/examrobo/server/assets/exam.seb
docker compose exec api ls -l /app/assets/exam.seb
sha256sum exam.seb
```

Set in `.env` first without enforcement:

```bash
SEB_REQUIRED=false
SEB_CONFIG_KEY=<64 hex>
SEB_START_URL=https://exam.example.com
```

```bash
docker compose up -d api
curl -fsS https://exam.example.com/api/seb/status
```

Expect `configured: true` and `download_available: true`. Download the file and
compare its checksum with the local copy.

Then flip `SEB_REQUIRED=true`, `docker compose up -d api`, and test:

- Outside SEB, starting the exam (`/api/exam/start`) is refused.
- Inside SEB it works and the runner does not demand fullscreen.
- A 403/503 means the hash does not match: check scheme, host, port, the
  proxy's `X-Forwarded-Proto`, and that the page URL is exactly the one the
  Config Tool used.

## 10. Backups

Database:

```bash
mkdir -p backups
docker compose exec -T db pg_dump -U examrobo examrobo | gzip > "backups/db-$(date +%F-%H%M).sql.gz"
```

Restore (overwrites current data — **ASK** first):

```bash
gunzip -c backups/db-YYYY-MM-DD-HHMM.sql.gz | docker compose exec -T db psql -U examrobo -d examrobo
```

Legacy recordings (only if the volume still holds pre-removal files):

```bash
docker compose run --rm -T --entrypoint sh api -c 'tar czf - -C /data/recordings .' > backups/recordings-$(date +%F).tgz
cat backups/recordings-YYYY-MM-DD.tgz | docker compose run --rm -T --entrypoint sh api -c 'tar xzf - -C /data/recordings'
```

This version never writes to `/data/recordings`; the archive exists only so old
evidence is not lost. Retention is still an open decision (T-802).

Also back up `.env` and `server/assets/exam.seb` to an encrypted store. Without
`.env` the JWT secret and Config Key are lost; without the `.seb` file SEB users
cannot start.

Example cron (daily 02:00, keep 14 days):

```cron
0 2 * * * cd /opt/examrobo && docker compose exec -T db pg_dump -U examrobo examrobo | gzip > backups/db-$(date +\%F).sql.gz && find backups -name 'db-*.sql.gz' -mtime +14 -delete
```

## 11. Upgrade and rollback

```bash
cd /opt/examrobo
docker compose exec -T db pg_dump -U examrobo examrobo | gzip > "backups/pre-upgrade-$(date +%F-%H%M).sql.gz"
git pull                     # or rsync the new version
docker compose build --pull
docker compose up -d
docker compose logs --tail=120 api
curl -fsS http://127.0.0.1:8083/api/health
```

Migrations are additive and run on boot. The only supported path from the
target snapshot is the bridge in `server/scripts/migrate.js`: it validates the
target data, renames `paper_sections`, adopts the baseline checksums and copies
the section rows. It refuses to guess when the ledger and the data disagree.
The target's original migration files are kept in
`server/sql/migrations/_target_archive/` for reference; do not apply them.
Rollback: check out the previous version, `docker compose build && docker compose up -d`;
restore the dump only if a migration touched data.

Never use `docker compose down -v` unless you intend to erase the database,
Redis state and recordings.

## 12. Operations

```bash
docker compose ps
docker compose logs -f --tail=200 api
docker compose restart api
docker compose exec db psql -U examrobo -d examrobo
```

- Legacy recordings never grow in this version; keep the volume only until the
  retention decision (T-802). Monitor `df -h` for the database and images.
- Redis is part of the stack. If it is down the API still runs (in-process
  lockout/limits, local WebSocket), but multi-instance behaviour degrades.
- Rotating `JWT_SECRET` signs out every student and admin.

## 13. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Bind for 0.0.0.0:X failed: port is already allocated` | another process owns the host port | `ss -ltnp \| grep :X`, change the matching port variable, `docker compose up -d` |
| Host proxy returns 502 | wrong `WEB_PORT`, web not running, or web is bound to localhost while the proxy runs elsewhere | `docker compose ps`, `curl 127.0.0.1:8083` |
| WebSocket keeps reconnecting | proxy missing Upgrade headers or short read timeout | section 8 snippet (map + `proxy_read_timeout 3600s`) |
| Login always "incorrect" in production | no row in `admins` | section 7 |
| `JWT_SECRET must be set to a unique value` in the log | default secret with `NODE_ENV=production` | set a generated secret |
| DB authentication fails after restoring an old volume | `POSTGRES_PASSWORD` is applied only on first init | use the old password, or `ALTER USER` deliberately |
| SEB start refused with a key error | scheme/host/port/hash mismatch | check `X-Forwarded-Proto`, `Host`, and the Config Tool URL |
| `/api/seb/status` says `configured:false` | `SEB_CONFIG_KEY` empty or not 64 hex | fix `.env`, restart `api` |
| Everyone is locked out | 3 failed logins per email+IP for 15 min (Redis) | wait 15 min; do not flush Redis blindly |
| Timers are minutes off | host clock drift | enable NTP, set timezone UTC |
| Migrations failed at boot but the API runs | migration error was logged and swallowed | read the log, fix the SQL, restart |

## 14. Acceptance checklist

- [ ] `docker compose ps` shows all four services `Up` (db/redis healthy).
- [ ] `curl https://exam.example.com/api/health` → `{"ok":true}`.
- [ ] Admin signs in, creates an event with per-category minutes and a roster.
- [ ] A roster student signs in, sees the waiting room, starts, answers,
      submits, sees a result.
- [ ] Proctor dashboard shows the live paper.
- [ ] `/api/seb/status` is correct; SEB on/off behaves as expected.
- [ ] A database dump exists in `backups/` (and a legacy recordings archive if
      the old volume held evidence).
- [ ] Uptime after `docker compose restart` with no manual steps.

## 15. Stop-and-ask

Ask the operator before:

1. pointing DNS or issuing a certificate,
2. opening a firewall port,
3. deleting a volume, a dump or recordings,
4. enabling `SEB_REQUIRED=true` in production,
5. changing `DB_PASSWORD` on an existing database,
6. running `npm run seed` anywhere that matters.

If a step needs a value that is not in this file and not on the server, ask.
Do not invent a hostname, a password or a port.
