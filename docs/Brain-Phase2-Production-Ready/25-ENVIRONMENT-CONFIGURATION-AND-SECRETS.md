# Environment, Configuration and Secrets Standard

## 1. Environments

Maintain separate local, CI/test, staging/pre-production and production environments. Production data must not be copied to developer laptops. Staging uses synthetic or formally approved masked data. Credentials, object buckets, databases, Redis namespaces, webhook secrets and JWT keys are distinct per environment.

## 2. Configuration registry

Names are proposed. Map them to the existing configuration system after source inspection. Do not commit populated secrets.

| Variable | Required | Purpose | Secret? |
|---|---|---|---|
| `APP_ENV` | Yes | local/test/staging/production | No |
| `APP_BASE_URL` | Yes | Canonical public origin | No |
| `API_BASE_URL` | Yes | API origin | No |
| `DATABASE_URL_APP` | Yes | Ordinary tenant app pool | Yes |
| `DATABASE_URL_AUTH` | Yes | Restricted auth function pool | Yes |
| `DATABASE_URL_WORKER` | If workers enabled | Worker claim pool | Yes |
| `DATABASE_URL_MIGRATOR` | Deploy only | Ephemeral migration connection | Yes |
| `DATABASE_POOL_MAX` | Yes | Pool size budget | No |
| `DATABASE_STATEMENT_TIMEOUT_MS` | Yes | Query execution ceiling | No |
| `DATABASE_LOCK_TIMEOUT_MS` | Yes | Lock wait ceiling | No |
| `REDIS_URL` | If Redis used | Cache/pub-sub/coordination | Yes |
| `JWT_ISSUER` | Yes | JWT issuer | No |
| `JWT_AUDIENCE` | Yes | JWT audience | No |
| `JWT_SIGNING_KEY_ID` | Yes | Current key identifier | No |
| `JWT_SIGNING_PRIVATE_KEY` or KMS reference | Yes | Token signing | Yes |
| `TENANT_CONTEXT_KEY_ID` | Yes | Context key identifier | No |
| `TENANT_CONTEXT_KEY` or KMS reference | Yes | Context signing/verification | Yes |
| `PASSWORD_PEPPER` or KMS reference | If approved | Additional credential secret | Yes |
| `OTP_PROVIDER` | Before OTP live | Provider adapter selection | No |
| `OTP_PROVIDER_KEY` | Before OTP live | SMS provider credential | Yes |
| `EMAIL_PROVIDER` | Before email live | Provider adapter selection | No |
| `EMAIL_PROVIDER_KEY` | Before email live | Email provider credential | Yes |
| `RAZORPAY_KEY_ID` | Billing | Public provider identifier | Sensitive config |
| `RAZORPAY_KEY_SECRET` | Billing | Payment API secret | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Billing | Signature verification | Yes |
| `OBJECT_STORAGE_ENDPOINT` | If used | Private object store | No |
| `OBJECT_STORAGE_BUCKET` | If used | Environment-specific bucket | No |
| `OBJECT_STORAGE_ACCESS_KEY` | If used | Storage credential | Yes |
| `OBJECT_STORAGE_SECRET_KEY` | If used | Storage credential | Yes |
| `RECOVERY_LEDGER_ENDPOINT` | Privacy gate | Separate durable ledger | No |
| `RECOVERY_LEDGER_CREDENTIAL` | Privacy gate | Ledger auth | Yes |
| `CORS_ALLOWED_ORIGINS` | Yes | Exact allowed origins | No |
| `TRUSTED_PROXY_COUNT` or CIDR config | Deployment-specific | Proxy/IP trust | No |
| `LOG_LEVEL` | Yes | Logging threshold | No |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | If telemetry used | Trace/metric collector | No |

## 3. Secret handling

- Use a managed secret store/KMS in staging and production where available.
- Local `.env` files are ignored by Git and have restrictive filesystem permissions.
- Provide `.env.example` containing names, safe nonfunctional placeholders and descriptions only.
- Never print all environment variables in debug logs.
- Rotate keys with key IDs and documented overlap/retirement procedure.
- Separate JWT signing, tenant-context signing, OTP, password reset, webhook and storage keys.
- Never reuse production secrets in CI, test or staging.
- Do not place credentials in URLs, source maps, frontend build variables, support tickets or screenshots.

## 4. Runtime configuration validation

Application startup must fail with a clear safe error when mandatory config is missing or malformed. Validate URLs, positive integer pool/timeout values, allowed environment enum, key lengths/formats, issuer/audience, CORS allow-list and provider selection. Do not silently disable security if a key is missing.

## 5. Database pool separation

The application must not use one super-credential for all operations. Create distinct pools for ordinary app access, auth function execution and worker job claiming if the selected architecture requires those boundaries. The migrator connection is ephemeral and unavailable to normal application processes. If a separate auth service is impractical, its distinct DB role and pool remain mandatory.

## 6. CI safety

CI tests may connect only to ephemeral test databases whose names/labels are allow-listed. Tests must refuse to run if `APP_ENV=production`, if a production host pattern is detected or if the target database is not disposable. Production credentials are not available to pull-request CI.

## 7. Frontend exposure

Only explicitly public configuration can be embedded in the frontend bundle. Never expose database URLs, JWT private keys, context HMAC keys, provider secrets or server-only flags. Keep plan prices/features loaded from the server API.
