# Later.md
Reason: Low-priority ideas and side-quests.

- **2026-11-01 — SEB real config (T-1205/T-1207):** needs the stable hostname and
  the SEB Config Tool output; Windows manual acceptance still pending.
- **2026-11-01 — 1000-VU k6 run (T-814):** script ready, not executed.
- **2026-11-01 — HR auto-flag rule (R-043):** needs a product decision on whether
  it fires once per event and whether it is per-email or per-event.
- **2026-11-01 — Recording retention policy (T-802):** legacy data only; needs a
  retention/expiry decision.
- **2026-11-01 — Exam history + automatic top-N selection:** now deferred to
  **v2.1**; not part of v2.0.
- **2026-11-01 — Gated coding round (T-901, Phase 1.5):** Judge0 not built.
- **2026-11-01 — Windows lockdown agent (T-960, Phase 2):** design only.
- **2026-11-06 — Billing / GST / Razorpay:** now **in v2.0** with plans, invoices,
  payments, refunds and reconciliation; no longer deferred to v2.1.
- **2026-11-06 — Student SMS OTP:** deferred; v2.0 SMS verifies institution/staff
  contacts only because roster records do not capture phone.
- **2026-11-05 — Custom domains / full white-label:** deferred. Only Elite gets a
  `slug.examrobo.com` platform subdomain in v2.0; Trial/Standard/Premium use the
  shared platform path and custom domains remain out of scope.
- **2026-11-05 — Shared family email support:** rejected for v2.0; revisit only
  if a pilot institution proves the need.
- **2026-11-05 — Staff MFA:** Super Admin has WebAuthn in v2.0; staff MFA is a
  later hardening step.
- **2026-11-05 — Student transfer history continuity:** old data stays with the
  old institution in v2.0; a merged history view is later.
- **2026-11-06 — Higher per-institution concurrency:** v2.0 uses the plan table
  and a 50-concurrent/100-event/1000-per-event ceiling; revisit after pilot load.
