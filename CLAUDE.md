# ExamRobo — Brain Agent Project Instructions

This project uses a hierarchical AI agent system. Follow these instructions to work efficiently.

## Startup Sequence

When starting a session, do the following in order:

1. Read `Brain/agent/brain-agent.md` — this is the orchestrator's operating manual
2. Follow its **Auto-Discovery** section to scan the project and detect stack/architecture
3. Follow its **Strategic Review Phase** to run a project review if needed
4. Follow its **Session Initialization** section to load project state
5. Announce the current state and the next pending task to the user

Files may not exist yet — the agents create them on first use:
- `Brain/Start.md`, `Brain/compact.md`, `Brain/Log.md` — created on first relevant action
- `Brain/NextSteps.md`, `Brain/Issue.md` — created on first task or issue
- `Brain/ProjectReview.md` — created on first strategic review
- All other `Brain/*.md` files — created on demand by their custodian agents

## Agent Hierarchy

The system has 18 agents organized in three tiers:

### Orchestrators (always active)
- `Brain/agent/brain-agent.md` — The Brain Agent. Reads project state, selects the right subagent, delegates work, and syncs memory.
- `Brain/agent/project-review-agent.md` — Strategic Intelligence Advisor. Owns `Brain/ProjectReview.md`. Pressures-test ideas before execution.

### Custodian Agents (auto-invoked by Brain Agent after each task)
- `Brain/agent/memory-agent.md` — Owns `Brain/compact.md`, `Brain/Log.md`, `Brain/AllCritiques.md`, `Brain/Log.YYYY-MM.md`, `Brain/VERSION`<br>  *(context.md and snapshots/ are [DISABLED] — preserved in agent file for future use)*
- `Brain/agent/specs-agent.md` — Owns `PRD.md`, `TRD.md`, `Design.md`, `Plan.md`, `Flow.md`, `FutureUpdates.md`
- `Brain/agent/tracking-agent.md` — Owns `NextSteps.md`, `Issue.md`, `userRequirement.md`, `Not.md`, `Later.md`
- `Brain/agent/reference-agent.md` — Owns `Start.md`, `Project_Guide.md`, `Resources.md`, `Generic_AI_Protocol.md`, `Prompt.md`

### Skill Agents (invoked for specific tasks)
- `Brain/agent/critique-agent.md` — Adversarial critic / QA
- `Brain/agent/research-agent.md` — Web research & fact verification
- `Brain/agent/document-conversion-agent.md` — PDF/DOCX/image → Markdown
- `Brain/agent/senior-audit-engineer-agent.md` — Security auditor
- `Brain/agent/senior-backend-engineer-agent.md` — Backend / APIs
- `Brain/agent/senior-debugging-engineer-agent.md` — Forensics / root cause analysis
- `Brain/agent/senior-devops-engineer-agent.md` — CI/CD / deployment
- `Brain/agent/senior-frontend-engineer-agent.md` — Frontend / UI
- `Brain/agent/performance-optimization-engineer-agent.md` — Performance profiling
- `Brain/agent/startup-engineering-team-agent.md` — Full-stack / scale
- `Brain/agent/technical-lead-agent.md` — Strategy / trade-offs
- `Brain/agent/supreme-ai-agent.md` — Autonomous full-app builder (trigger: `AllHailAI`)

## Key Rules

- No destructive operations without confirmation
- Always read files before editing — never overwrite blindly
- Respect any "denied rules" found in existing project documentation
- Document every decision in the appropriate Brain file

## Verification Discipline

Verification is **one command**: `cd server && npm run verify`. It runs four
phases (preflight → unit → web build → smoke), each exactly once, each with a
hard deadline, and prints a pass/fail summary.

- **Never** run the unit tests, the build and the smoke test as three
  separate ad-hoc command sequences. Use `npm run verify`.
- **Never** point a test at the live database. The smoke test refuses any
  database whose name does not end in `_smoke` or `_test`
  (`server/scripts/scratch-db.mjs`). The verify run creates and drops its own
  scratch database.
- **Never** re-issue the same failing command more than twice. After the second
  failure, change the approach and tell the user what is blocked.
- **Never** launch an application from a verification step (no Docker Desktop,
  no background server, no fixed port). The API boots in-process on an
  ephemeral port for the smoke test — see `server/app.js` vs `server/index.js`.
- If a service is not up, use **one** bounded wait (`server/scripts/waitfor.mjs`)
  and report it as SKIPPED. Do not re-check in a loop.
- A failed phase is recorded and the remaining phases still run. One broken
  phase never blocks the rest of the work, and never stops the session.
- Every command that can block gets an explicit timeout.

