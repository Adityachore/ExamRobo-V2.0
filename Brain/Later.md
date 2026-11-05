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
- **2026-11-05 — Billing / GST / Razorpay:** v2.0 is institutions + exams only;
  billing is a v2.1 candidate.
- **2026-11-05 — Custom domains / full white-label:** institution slug stays on
  `examrobo.com` in v2.0.
- **2026-11-05 — Shared family email support:** rejected for v2.0; revisit only
  if a pilot institution proves the need.
- **2026-11-05 — Staff MFA:** Super Admin has WebAuthn in v2.0; staff MFA is a
  later hardening step.
- **2026-11-05 — Student transfer history continuity:** old data stays with the
  old institution in v2.0; a merged history view is later.
- **2026-11-05 — Higher per-institution concurrency:** v2.0 caps at 50 concurrent
  and 1000 total; revisit after the pilot's real load data.
