---
name: graphify
description: Knowledge graph generator for codebases — turns any project directory into an interactive, queryable knowledge graph. Produces graph.html (visualization), GRAPH_REPORT.md (highlights), and graph.json (data). Supports 36+ languages via tree-sitter, MCP server for querying, PR impact analysis, and cross-project global graphs.
---

# Graphify — Codebase Knowledge Graph

## When to Use
- Starting work on an unfamiliar codebase
- Before making architecture changes
- When you need to understand relationships between components
- For PR impact analysis
- When standard grep/search is too slow

## Installation
```bash
uv tool install graphifyy
```

## CLI Commands
- `graphify .` — Build graph for current directory
- `graphify <path> --watch` — Auto-rebuild on file changes
- `graphify query "<question>"` — Search graph with BFS traversal
- `graphify path "A" "B"` — Shortest path between two concepts
- `graphify explain "NodeName"` — Plain-language explanation of a node
- `graphify update <path>` — Incremental update
- `graphify mcp serve graph.json` — Expose graph as MCP server

## Integration
After running `graphify .`, read `graphify-out/GRAPH_REPORT.md` for:
- Key concepts and architecture overview
- Surprising connections between components
- God nodes (most-connected elements)
- Suggested questions to explore

Use `graphify query` instead of grepping when exploring unfamiliar code.
