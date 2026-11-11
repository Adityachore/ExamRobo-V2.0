# ExamRobo — Decision Flow, the SIMPLE version

Plain arrows and symbols. No special viewer needed.
Full technical detail (exact file:line refs): `Brain/DecisionFlow.md`.

```
✓  = decision + docs + code all agree
⚠  = decision is right, but a doc or the UI is behind it
✗  = two sources say opposite things
──► = leads to
```

---

## 1. WHERE YOU ARE NOW (one line)

```
v1.5 SHIPPED ✓ ──► G0 PARTIAL ⚠ ──► G1 VERIFYING ⚠ ──► G2 IN PROGRESS ⚠
                                                          │
                                              G3 → G4 → G5 ... waiting
```

One sentence: your product works and is tested (v1.5.0). Your v2.0 plan is
approved. You are between gate G1 (security proof, waiting for a reviewer)
and gate G2 (tenant schema, in progress on scratch databases only).

---

## 2. THE BIG PICTURE — how your idea travelled

```
YOUR IDEA (Idea.md)
   │
   ▼
PIVOT: website first, any OS, one sitting ........ recorded ✓
   │
   ▼
PHASES 1-7: login, question bank + variants, exam
            runner, proctoring, results, admin,
            deployment ........................... built ✓
   │
   ▼
PHASES 9-10: warning engine + live-exam fixes ..... built ✓
   │
   ▼
PHASES 11-12: skills/difficulty + result analytics . built ✓
   │
   ▼
PHASE 13: exact UI redesign ....................... built ✓
   │
   ▼
PHASE 14: student picks domain in waiting room .... built ✓
   │        (registration dropped — roster = the list)
   ▼
PHASES 15-17: SEB gate, delivery, admin controls,
              result visibility ................... built ✓
   │
   ▼
PHASES 18-19: v1.5.0 released ..................... SHIPPED ✓
   │         (161 unit + 187 smoke tests pass)
   ▼
2026-11-05/06: v2.0 MULTI-TENANT SAAS approved .... decided ✓
   │         (36 locked decisions D-01..D-36,
   │          40-file design pack)
   ▼
GATE LADDER ....................................... YOU ARE HERE
```

**Verdict: your path is coherent.** Every pivot was written down at the
moment it happened. The problems found later are all *documentation lag*,
not wrong decisions.

---

## 3. WHAT HAPPENED TO EACH OF YOUR 12 IDEA ASKS

```
 1. Windows app, internet cut  ──► website instead;
                                  agent designed only ........ ✓
 2. App auto-deletes after     ──► moot (no app) — but this
    the exam                      was never written down ..... ⚠ F-23
 3. Intranet-only network      ──► deferred by you .......... ✓
 4. Sections with 3-4 variants ──► built (variants per
                                  question) .................. ✓
 5. Different order per student ──► built (shuffle + frozen
                                  option mapping) ............ ✓
 6. 1000 students at a time    ──► ceiling = 1000/event;
                                  load test NOT yet run ...... ⚠ F-05
 7. Save at every step         ──► built (autosave + offline
                                  queue) ..................... ✓
 8. Flag HR mistake vs
    misconduct                 ──► built (two disjoint
                                  kinds) ..................... ✓
 9. HR auto-flag if roster
    stale 2h                   ──► designed, NOT built —
                                  needs your rule ............ ⚠
10. Contact-team button        ──► built (auto-ticket after
                                  3 failed logins) ........... ✓
11. LinkedIn share after exam  ──► not built AND not
                                  recorded anywhere .......... ⚠ F-22
12. Feedback form              ──► built (rating + comment,
                                  once per exam) ............. ✓
```

10 of 12 landed or are properly deferred. Only #2 and #11 were silently
dropped (F-22 / F-23), and #9 is waiting on you by design.

---

## 4. HOW THE EXAM WORKS TODAY (as the code really runs)

### 4a. Student journey

```
[Login page]
    │ email on the roster?
    │
    ├─ NO, 3 fails ──► 15-min lockout ──► auto-ticket
    │                                        │
    │                                        ▼
    │                                  [Contact Team]
    │
    └─ YES ──► [Waiting room]
                  countdown + domain picker (for select events)
                  │
                  ▼
          POST /exam/start {chosen domains}
                  │
                  ├─ bad pick ──► 400 back to waiting
                  │              (no paper, no time lost)
                  │
                  └─ ok ──► [Exam runner] fullscreen locked
                               │
                               ├─ every answer  ──► saved at once
                               ├─ every 15 sec  ──► snapshot
                               ├─ section done  ──► next unlocks
                               │
                               ▼
                    submit (you) or timer (server)
                               │
                               ▼
                    graded instantly
                               │
                               ▼
                    [Result page] — shown only when the event's
                    visibility allows:
                    immediate / after all submit / manual / never
                               │
                               ▼
                    [Feedback] once ──► sign out
```

### 4b. Warnings — the client only DETECTS, the server DECIDES

```
   student does something
        │  client detects + reports the KIND
        ▼
   server policy (services/integrity.js)
        │
        ├─ WARNING tier (9 kinds *)
        │     └─ 1 strike into ONE shared budget of 3
        │        3rd strike ──► exam auto-submits
        │
        ├─ LOG-ONLY tier (devtools, os_chord, network_gap)
        │     └─ recorded, no penalty
        │
        └─ proctor manual lock
              └─ exam ends NOW + MISCONDUCT flag
                 + every later call refused (409)

 * warning kinds: screenshot_key, tab_blur, fullscreen_exit,
   clipboard, context_menu, print, display_change,
   second_window, second_session (last two are
   server-detected, never trusted from the client)

 ⚠ NOTE: the DOCS still say "screenshot key = instant lock".
   The CODE says "screenshot key = 1 warning". Code is right.
   → finding F-01
```

### 4c. Admin journey

```
[/admin/login]
     ▼
create event (sections, question counts, domain rules)
     ▼
upload roster emails
     ▼
[LIVE dashboard] during the exam
     message / force-submit / lock / resume / restart
     ▼
[Results] + CSV + cohort analytics (weakest skill first)
     publish / extend / unpublish (for manual events)
     ▼
[Flags: HR_MISTAKE vs MISCONDUCT] + [Tickets]
```

### 4d. Safety nets (already built)

```
crash / power loss   ──► answers already saved; reopen = resume;
                         too late = auto-submitted
internet drop        ──► local queue flushes when back online
roster removal       ──► session kicked, result kept
second tab / device  ──► server detects, 1 strike (never double)
integrity lock       ──► terminal: 409 on everything after
```

---

## 5. THE V2 PLAN — two ladders

### 5a. Gate ladder (each gate = prove it before moving on)

```
G0  baseline freeze ............ PARTIAL ⚠   local tests all green;
    │                           production backup + collision
    │                           report still missing
G1  security proof (RLS) ....... VERIFYING ⚠  24/24 attacks pass
    │                           locally; no independent
    │                           reviewer signed yet
G2  tenant isolation ........... IN PROGRESS ⚠  migration 014 done
    │                           (NOT committed); you allowed this
    │                           on scratch DBs only
G3  identity + /api/v2 + money .  waiting
G4  privacy + recovery .........  waiting
G5  cutover + rollback .........  waiting
                    ▲
        YOU ARE HERE (between G1 and G2)
```

### 5b. Migration ladder (expand → backfill → validate → enforce)

```
014  institutions + tenant columns ..... DONE (uncommitted ⚠)
        │   blocked on: your login-policy sign-off
        │   + the collision report
        ▼
015  identity control plane ............ NEXT
        ▼
016+  tenant foreign keys, NOT NULL .... later
        ▼
backfill: roster / papers / admins ──► new principal tables
        ▼
validate: row counts + no orphans
        ▼
enforce: RLS ON; app role has NO bypass
        ▼
cutover: backup ──► switch ──► v1.5 kept as the rollback
```

---

## 6. DECISION SCOREBOARD (your 36 locked decisions)

```
CONSISTENT .... 31 of 36
  D-01 D-02 D-03 D-05 D-06 D-08 D-09 D-11 D-12 D-13 D-14 D-15
  D-16 D-17 D-18 D-19 D-20 D-21 D-22 D-23 D-25 D-26 D-27 D-28
  D-29 D-31 D-32 D-33 D-34 D-35 D-36

DRIFT ......... 3 (decision right, artifact behind it)
  D-04  one institution per staff ──► pack + web still offer
        "select a membership" ............................. F-08
  D-24  legacy tenant = ParaRobo ──► pack says
        "ParaRobo Default" ................................ F-13
  D-10  unique student email ✓ decided ──► the Brain verdict
        paragraph about it is stale ....................... F-02

CONTRADICTION . 2
  D-07 + D-30  YOUR call: "temp password, NO invite link"
        vs pack 01/06/13/37 + the built web /invite page
        say "invite link" ................................. F-09
```

**Bottom line: 0 decisions were wrong. 2 need you to re-confirm ONE choice
(temp password vs invite link), and 3 need a doc refreshed.**

---

## 7. ALL 23 FINDINGS — simple boxes

### A. Inside the Brain docs

```
┌─ F-01  ✗  DOCS vs CODE: the warning tiers ──────────────
│ Docs   : PRD, TRD, Flow, Design say "Tier A: screenshot
│          key = instant lock"
│ Code   : only 2 tiers — WARN + LOG. Screenshot key = 1
│          warning (server/services/integrity.js:21)
│ Truth  : code is right (policy changed in Phase 15)
│ Fix    : update those 4 docs to match the code
└──────────────────────────────────────────────────────────

┌─ F-02  ⚠  BRAIN says the PACK is stale — it is not ─────
│ Brain  : "the pack still contains the old identity
│          proposals" (ProjectReview.md:27-31)
│ Pack   : already corrected 2026-11-06 (01:38-40, 14:45)
│ Truth  : Brain's own later table (119-125) agrees
│ Fix    : rewrite that one Brain paragraph
└──────────────────────────────────────────────────────────

┌─ F-03  ⚠  "G1 approved" vs "G1 not approved" ───────────
│ Where  : same file, ProjectReview.md
│ Header : "G1 ... approved as of 2026-11-06" (line 6-8)
│ Body   : "G1 remains VERIFYING ... waiver only" (246-248)
│ Truth  : you approved RUNNING the POC, not the gate
│ Fix    : change the header word to "authorized"
└──────────────────────────────────────────────────────────

┌─ F-04  ⚠  Table count is behind the code ───────────────
│ Brain  : "18 domain tables" (Schema.md:7, Start.md:14)
│ Code   : 22 tables now — 014 added 3 tenant tables
│ Fix    : say "18 v1.5 tables + 3 from migration 014"
└──────────────────────────────────────────────────────────

┌─ F-05  ⚠  "1000" means two different things ────────────
│ Use 1  : 1000 students PER EVENT (plan ceiling, D-16)
│ Use 2  : 1000 concurrent AT ONCE (load-test candidate,
│          compact.md:45, pack 10:61-65)
│ Fix    : always write "per event" or "concurrent VUs"
└──────────────────────────────────────────────────────────

┌─ F-06  ⚠  One task status became a paragraph ───────────
│ Where  : NextSteps.md:312 (P20-04 row)
│ Fix    : shorten to "[>] VERIFYING — review pending"
└──────────────────────────────────────────────────────────

┌─ F-07  ⚠  Wording that can be misread ──────────────────
│ Where  : NextSteps.md:209 "warnings never submit"
│ Truth  : no SINGLE warning submits; the 3rd strike does
│ Fix    : add that one clarifying clause
└──────────────────────────────────────────────────────────
```

### B. Brain vs the 40-file design pack

```
┌─ F-08  ✗  Dead endpoint still alive in pack + web ──────
│ Pack   : 21-API-CATALOG:21 offers /auth/membership/select
│ Locked : D-04 — second membership is REJECTED (14:45,
│          03:66, 29/AUTH-003 all agree)
│ Web    : built against the stale catalog
│          (web/src/lib/endpoints.js:24)
│ Fix    : delete the endpoint from pack 21 + endpoints.js
└──────────────────────────────────────────────────────────

┌─ F-09  ✗  Invite link vs temp password ─────────────────
│ Locked : D-07/D-30 — "Admin sets a 24h TEMP PASSWORD,
│          no invite link"
│ Pack   : 01 R-111 + 06 + 13 + 37 all say "invite link"
│ Web    : /invite/:token page built (InviteSetup.jsx)
│ Fix    : YOU pick once — then fix pack + page to match
└──────────────────────────────────────────────────────────

┌─ F-10  ⚠  Two API catalogs inside the pack ─────────────
│ Doc 06 : /api/auth/identify + /api/sa/*
│ Doc 21 : /auth/login + /platform/*  (web follows 21)
│ Fix    : declare 21 the single catalog; stamp 06
│          "superseded by 21"
└──────────────────────────────────────────────────────────

┌─ F-11  ⚠  Three different DB-role lists ────────────────
│ Doc 03 : 9 roles (incl. examrobo_billing_fn)
│ Doc 24 : 8 roles (no billing_fn)
│ G1 test: 9 roles, no billing_fn (g1.mjs:36-44)
│ Fix    : one canonical list in doc 03; add the billing
│          role or record it as a G3 item
└──────────────────────────────────────────────────────────

┌─ F-12  ⚠  A table exists in one doc only ───────────────
│ Doc 22 : introduces student_auth_links
│ Doc 04 : uses nullable students.principal_id instead
│ Fix    : pick one mechanism, mirror it in both
└──────────────────────────────────────────────────────────

┌─ F-13  ⚠  Legacy tenant named 2 ways ───────────────────
│ Brain  : ParaRobo (D-24; migration 014 seeds it)
│ Pack   : "ParaRobo Default" (09:32, 30:33)
│ Fix    : use ParaRobo everywhere
└──────────────────────────────────────────────────────────

┌─ F-14  ⚠  Pack size misquoted ──────────────────────────
│ Quoted : "38-file pack" (ProjectReview, userRequirement)
│ Real   : 40 markdown files
│ Fix    : correct the count
└──────────────────────────────────────────────────────────

┌─ F-15  ⚠  Module list: 9 vs 17 ─────────────────────────
│ Doc 02 : 9 modules
│ Doc 20 : 17 modules
│ Fix    : doc 20 is the authority; 02 gets a pointer
└──────────────────────────────────────────────────────────

┌─ F-16  ⚠  HR auto-flag lost between v1 and v2 ──────────
│ v1     : still open (Issue.md:399-406)
│ v2     : pack 07's 11 required jobs contain neither it
│          nor the recording-retention job
│ Fix    : carry both into the v2 job list, or reject
│          them in Not.md — decide once
└──────────────────────────────────────────────────────────

┌─ F-17  ⚠  Two task-ID schemes, no map ──────────────────
│ Doc 27 : S0-01..S2-10
│ Doc 16 : P2-xxxx
│ Fix    : add an S↔P2 column to doc 27
└──────────────────────────────────────────────────────────

┌─ F-18  ⚠  Sample tracker is stale ──────────────────────
│ Doc 35 : DQ-01/DQ-02 shown "OPEN" (35:39-40)
│ Truth  : partially closed 2026-11-06 (docs 15/33/36)
│ Fix    : refresh the sample rows
└──────────────────────────────────────────────────────────

┌─ F-19  ⚠  Doc 36 contradicts its own history ───────────
│ Its v1.0 row: decisions left open
│ Its v1.1 row: decisions approved/corrected
│ Fix    : label the v1.0 row "superseded"
└──────────────────────────────────────────────────────────
```

### C. Brain vs the actual code

```
┌─ F-20  ⚠  Web still mentions removed recordings ────────
│ Where  : Events.jsx:312,401 ("recordings are kept");
│          Live.jsx:19,36 (recording_revoked label)
│ Impact : cosmetic — no logic
│ Fix    : drop the word "recordings" from the copy
└──────────────────────────────────────────────────────────

┌─ F-21  ⚠  Stale comment in the migration runner ────────
│ Where  : server/scripts/migrate.js:28-33 lists only
│          migrations 001-006
│ Truth  : the runner applies everything dynamically
│ Fix    : delete or refresh the comment
└──────────────────────────────────────────────────────────
```

### D. Your idea asks that were silently dropped

```
┌─ F-22  ⚠  LinkedIn share after the exam ────────────────
│ You asked (Idea.md:19) → never built → never written
│ down as skipped
│ Fix    : one line in Later.md so it is not "lost"
└──────────────────────────────────────────────────────────

┌─ F-23  ⚠  "App auto-deletes after the exam" ────────────
│ Moot (you pivoted to a website) but never recorded
│ Fix    : one line in Not.md: "superseded by the pivot"
└──────────────────────────────────────────────────────────
```

---

## 8. YOUR 9 OPEN DECISIONS (most blocking first)

```
[1] LOGIN POLICY sign-off
    └─ unblocks migration 015; also settle F-09 here
[2] COLLISION REPORT (needs the live DB)
    └─ unblocks G0 closure + the 015 backfill
[3] G1 INDEPENDENT REVIEWER
    └─ proof passes 24/24; needs a signature
[4] HR AUTO-FLAG RULE (R-043)
    └─ fire once? re-fire? per event or per email?
[5] SEB REAL CONFIG (T-1205/T-1207)
    └─ stable hostname + Config Tool output + Windows test
[6] LOAD RUNS — 50 VU and 1000 VU (scripts ready)
[7] BROWSER CLICK-THROUGHS (needs a human)
    └─ T-1521, T-1039/T-1109, P20-UI-09
[8] EXTERNAL INPUTS (hosting, SMTP, SMS, Razorpay, GST,
    DPA, RPO/RTO, Elite DNS) — tracked in Issue.md
[9] COMMIT THE CHECKPOINT — 014 + gate artifacts are
    verified but uncommitted; say when
```

---

## 9. THE ONE-SENTENCE VERDICT

Your decisions are correct and your path was followed — the only real
contradictions are old text that never caught up with the code (F-01) and
one login-credential choice you must settle once (F-09); everything else is
a small doc refresh.
