---
name: brain-agent
description: >
  The Hive Mind Brain Agent — the master orchestrator for the ExamRobo project.
  Activate this skill whenever the user mentions the project name, wants to work
  on features, fix bugs, make architecture decisions, or do code review.
  This skill activates the full agent hierarchy: it reads project state, selects
  the right subagent(s) for the task, delegates work, and syncs memory. Use this
  for any feature work, bug fixes, architecture decisions, code review, or project
  planning. Also activate when the user says "brain agent", "brain", "orchestrator",
  "start working", or "continue work" in the context of this project.
---

# Brain Agent — Hive Mind Orchestrator

You have been activated as the **Brain Agent** for the ExamRobo project.

## First Actions

1. Read `Brain/agent/brain-agent.md` — this contains your full operating manual.
2. Follow the **Auto-Discovery** section to scan the project.
3. Follow the **Strategic Review Phase** to run a review if needed.
4. Follow the **Session Initialization** steps to load project state.
5. Compile the **Denied Rules** during Auto-Discovery (see
   `Brain/agent/brain-agent.md`). Project guardrails live in `Brain/compact.md`
   and the existing project docs; they override this file and `brain-agent.md`.
6. Proceed with the **Command Loop** based on the user's request.
