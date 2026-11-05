# Not.md
Reason: Record of rejected ideas to prevent regression.

## Rejected Logic

- **NO restoring the active screen recorder**: recording upload was removed by a
  locked product decision; the table and volume stay only for legacy data.
  Re-adding the recorder would re-open the storage, privacy and bandwidth costs.
- **NO merging the `examrobo-6` migrations**: its 007–009 files are a different
  lineage with the same numbers. Merging them corrupts the migration ledger; the
  only supported path is the bridge in `server/scripts/migrate.js`.
- **NO keeping duplicate working trees**: `examrobo-3` and `examrobo-6` are
  archived read-only; development happens in one tree only.
- **NO promoting the DEV mock API to production**: `Downloads\examrobo-frontend\server`
  is an in-memory mock that defines the contract; it is not the system of record.
- **NO merging the Cloudflare nginx without the proxy header**: the API must see
  the real client IP and the public scheme, or lockouts and the SEB hash break.

## v2.0 (Phase 20) — rejected / locked out

- **NO DOB or ID scan as the student credential.** The institution attests minors;
  the platform does not collect DOB by default.
- **NO shared family email accounts.** One email = one student principal; support
  is explicit, not implicit. A transfer creates a new principal.
- **NO student self-registration.** The roster/institution still controls access.
- **NO cross-tenant bank or taxonomy editing.** Both are per institution; papers
  keep frozen copies, so a re-tag never rewrites a finished exam.
- **NO runtime `BYPASSRLS`.** The app role never gets it; forced RLS is the model.
- **NO automatic deletion on plan expiry or closure.** Deactivate and retain;
  purge is manual, Super Admin-only, after a full archive export.
- **NO purging staff, institution or audit rows.** Only students, bank and results
  are purged.
- **NO billing, custom domains or exam history/top-N in v2.0.** Deferred to
  v2.1 (see `Brain/Later.md`), not silently added.
- **NO active student email at two institutions.** One institution at a time;
  the email becomes reusable only after the old principal is deactivated.
