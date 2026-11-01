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
