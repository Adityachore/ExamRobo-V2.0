---
name: headroom
description: Token compression layer for AI agents — compresses tool outputs, logs, files, and conversation history by 60-95% before they reach the LLM, preserving accuracy. Includes CacheAligner for KV cache stability, content-aware compressors (code, JSON, text, logs), CCR reversible compression, cross-agent memory, and `headroom learn` for automatic failure mining.
---

# Headroom — Context Compression for AI Agents

## When to Use
- When LLM context windows are filling up with large tool outputs
- Before sending large file contents, logs, or search results to the LLM
- When running token-cost-sensitive operations
- After failed sessions to mine failure patterns
- When passing context between multiple agents in a workflow

## Installation
```bash
pip install headroom-ai
```

## CLI Commands
- `headroom proxy --port 8787` — Start HTTP compression proxy
- `headroom wrap <agent>` — Wrap an AI agent (supports claude, codex, opencode, cursor, aider, copilot, cline, continue, goose, openhands, openclaw, vibe)
- `headroom unwrap <agent>` — Remove wrapping
- `headroom learn [--agent] [--apply]` — Mine failed sessions, write corrections to AGENTS.md
- `headroom doctor` — Health check
- `headroom perf` — Performance benchmark
- `headroom dashboard` — Live savings dashboard
- `headroom mcp install | serve` — Expose compression as MCP tools

## Library Usage (Python)
```python
from headroom import compress

result = compress(messages, model="claude-sonnet-4-5-20250929")
# result.messages — compressed message list
# result.compression_ratio — 0.0 to 1.0
```

## Key Concepts
- **SmartCrusher** — Statistical JSON/array compression for tool outputs (70-90%)
- **CodeCompressor** — AST-aware compression for Python, JS/TS, Go, Rust, Java, C/C++
- **CacheAligner** — Stabilizes message prefixes for provider-side KV cache hits
- **CCR (Compress-Cache-Retrieve)** — Reversible compression: originals stored in SQLite, LLM can retrieve on demand
- **Cross-agent memory** — Shared SQLite + vector store across sessions and agents
