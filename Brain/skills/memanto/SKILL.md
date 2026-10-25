---
name: memanto
description: Active memory agent for AI — persistent cross-session memory with typed recall (13 types: fact, preference, goal, decision, artifact, learning, etc.), TTL, provenance tracking, temporal queries, and RAG-based answer retrieval. Achieves 89.8% on LongMemEval via information-theoretic semantic engine.
---

# Memanto — Memory That AI Agents Love

## When to Use
- Persisting discoveries across agent sessions
- Storing user preferences, decisions, and project facts
- Retrieving context from past conversations
- Detecting contradictions in stored knowledge
- Cross-session project memory

## Installation
```bash
pip install memanto
memanto                  # choose "On-Prem" (Docker + Ollama) or "Cloud" (free API key)
```

## CLI Commands
- `memanto agent create <name>` — Create a memory agent
- `memanto remember "text" --type fact|preference|goal|decision` — Store a memory
- `memanto recall "query" --type preference` — Semantic memory search
- `memanto answer "question"` — RAG-grounded answer from memories
- `memanto connect claude-code` — Connect to Claude Code
- `memanto conflicts` — Detect contradictions
- `memanto upload <file>` — Index a document

## Integration Pattern
```bash
# At session start, recall relevant context
memanto recall "project architecture decisions"

# After completing a task, store what was learned
memanto remember "Database schema uses UUID primary keys" --type decision

# Before making decisions, check for past conflicts
memanto conflicts
```
