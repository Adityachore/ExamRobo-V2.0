# Legacy Data Backfill and Ownership Mapping

## 1. Core rule

Never assign a legacy row to an institution based on current request input, display name guess or longest-name matching. Every row must be mapped from verified parent relationships or an explicitly approved source-of-truth rule.

## 2. Mapping workbook

Before migration, build an evidence table for every existing v1.5.0 table:

| Required field | Meaning |
|---|---|
| source_table | Exact existing table |
| source_primary_key | Stable row identifier |
| proposed_institution_id | Target tenant |
| derivation_rule | Parent join, configured legacy owner, or approved manual mapping |
| source_parent | Verified parent row/key |
| confidence | VERIFIED / AMBIGUOUS / ORPHAN |
| exception_owner | Named owner for exception |
| reviewer | Independent confirmation |
| applied_batch | Backfill batch ID |

## 3. Ownership derivation order

1. Root institution-owned records: map to the explicitly approved internal legacy institution or approved institution mapping.
2. Child records: derive tenant from verified parent row, never from supplied child field.
3. Many-to-many/join rows: verify both parents belong to the same institution before assigning.
4. Global reference/catalogue data: keep global only if truly non-tenant mutable; otherwise copy/tenantize through an approved decision.
5. Unassigned/orphan rows: quarantine in a restricted staging table; do not assign to a default tenant.

## 4. Legacy internal institution

If v1.5.0 represents one existing customer/operator environment, create an explicit internal legacy institution with a non-public flag and no public registration path. The business owner must confirm whether all legacy data belongs to that institution. The label "ParaRobo Default" must not be used as a silent sink for unresolved data.

## 5. Duplicate and collision scans

Run scans for:

- duplicate normalized email values within students;
- the same normalized email across students, staff, Admins and platform users;
- the same email across multiple institutions;
- null, blank, malformed and whitespace/case-variant values;
- normalized staff/student/login identifiers;
- per-tenant source keys and question import keys;
- duplicate event/roster natural keys;
- orphan foreign keys;
- child rows with conflicting parent institution;
- duplicate payments/orders/invoices;
- duplicated or inconsistent subscription periods;
- object-store files without a known tenant/owner;
- Redis keys and queued jobs without tenant metadata.

Every collision receives a deterministic resolution record before enforcing unique constraints. No automatic deletion, merge, reassignment or “first row wins.” The email-collision report is read-only, access-controlled and must not contain plaintext credentials.

## 6. Backfill mechanics

- Take a source backup and restore it to a disposable target.
- Use bounded primary-key batches and a recorded high-water mark.
- Make each batch restart-safe and idempotent.
- Do not hold a single transaction across the full database.
- Capture row counts and checksums/aggregates before/after.
- Re-run validation queries after each phase.
- Log skipped/quarantined IDs in restricted evidence, not public logs.
- Stop on unexpected count drift or cross-tenant relation.

## 7. Final invariants before tenant NOT NULL/RLS enforcement

- zero unexplained NULL institution IDs;
- zero cross-tenant parent-child relations;
- zero unreviewed duplicate natural keys;
- zero unowned critical files/jobs;
- all legacy rows mapped or formally quarantined;
- all source/target count and checksum differences explained;
- independent DBA reviewer approval.
