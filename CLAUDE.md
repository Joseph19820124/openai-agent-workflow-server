# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Run Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled server (requires build first)
npm run dev          # Run with ts-node for development
```

## Environment Variables

Required in `.env` (see `.env.example`):
- `LLM_API_KEY` - API key for LLM provider
- `LLM_BASE_URL` - API base URL (default: `https://api.openai.com/v1`)
- `LLM_MODEL` - Model to use (default: `gpt-4o-mini`)
- `GITHUB_TOKEN` - GitHub token for API operations
- `GITHUB_WEBHOOK_SECRET` - Secret for webhook signature verification
- `PORT` - Server port (default: 3000)

Supports OpenAI, OpenRouter, or any OpenAI-compatible API.

## Architecture

This is an Agent Workflow Server that processes GitHub webhooks using LLM function calling (OpenAI-compatible API).

**Request Flow:**
```
GitHub Webhook → routes/webhook.ts → AgentRunner → LLM API → GitHubTools → Response
```

**Key Design Principle:** Agent (decision layer) is separated from Tools (execution layer). Skills provide knowledge/instructions that guide the Agent's decisions.

### Core Components

- **AgentRunner** (`src/agent/index.ts`): Orchestrates the agent loop. Loads relevant Skills based on event type, builds system prompt, runs iterative tool-calling loop with OpenAI (max 5 iterations).

- **SkillsLoader** (`src/skills/loader.ts`): Manages capability modules (Skills). Each Skill contains instructions, examples, and constraints. Skills are matched to events via `applicableEvents` field.

- **GitHubTools** (`src/tools/github.ts`): Octokit wrapper exposing tools: `add_comment`, `add_label`, `get_file_content`.

### Adding New Tools

1. Add method to `GitHubTools` class
2. Add tool definition in `AgentRunner.getAvailableTools()`
3. Add tool execution case in `AgentRunner.runAgentLoop()`

### Adding New Skills

Add to the `SKILLS` array in `src/skills/loader.ts` with: `name`, `instruction`, `examples`, `constraints`, `applicableEvents`.

## Deployment

Configured for Railway with `railway.toml` and `nixpacks.toml`. Health check endpoint: `/health`.
