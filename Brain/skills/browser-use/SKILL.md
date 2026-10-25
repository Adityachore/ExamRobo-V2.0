---
name: browser-use
description: AI-powered browser automation library — enables LLM agents to autonomously control a web browser via CDP for web research, data extraction, form filling, and multi-step web tasks. Supports 18+ LLM providers, 20+ browser actions, vision-based interaction, Docker, and MCP server mode.
---

# Browser Use — Give Your Agent a Browser

## When to Use
- Web research requiring JavaScript-rendered pages
- Data extraction from complex web apps
- Automated form filling and web interaction
- Fact-checking across multiple sources
- Authenticated session browsing

## Installation
```bash
pip install browser-use
```

## Quick Start (Python)
```python
from browser_use import Agent

agent = Agent(
    task="Find the pricing page and extract all plan tiers",
    llm=...,  # ChatOpenAI, ChatAnthropic, etc.
)
history = await agent.run()
print(history.final_result())
```

## Key Features
- 20+ actions: navigate, click, input, scroll, extract, screenshot, PDF, evaluate JS
- Vision-based: sends screenshots to LLM for visual understanding
- Multi-tab management
- Structured data extraction via Pydantic models
- MCP server mode for integration with Claude Desktop
- Docker-optimized with sandbox support
- CAPTCHA detection, popup handling, download management
- Video recording of browser sessions

## Integration with research-agent
Use browser-use when the research-agent needs to:
- Access JavaScript-rendered pages
- Fill forms and navigate authenticated sessions
- Extract structured data from web apps
- Cross-reference information across multiple pages
