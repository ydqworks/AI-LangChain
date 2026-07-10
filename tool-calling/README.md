# tool-calling — LangChain Pattern

This is a standalone **Vue** + **TypeScript** project for the **tool-calling** LangChain UI pattern.

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A [Google Gemini API key](https://aistudio.google.com/apikey)

## Setup

1. Copy the environment file into the agent package and add your keys:
   ```bash
   cp .env.example packages/agent/.env
   # Edit packages/agent/.env:
   #   GOOGLE_API_KEY（必需）
   #   LANGSMITH_TRACING + LANGSMITH_API_KEY（可选，启用后 Agent 调用自动上报 trace）
   ```

   启动时 `env-check.ts` 会校验：`GOOGLE_API_KEY` 必需；若 `LANGSMITH_TRACING=true` 则 `LANGSMITH_API_KEY` 也必需。

2. Install dependencies:
   ```bash
   pnpm install
   ```

## Running

```bash
pnpm run dev
```

This starts both the LangGraph agent server (port 2024) and the Vite frontend (port 4100).

The Vite dev server proxies `/api/langgraph` to `http://127.0.0.1:2024`, and the app uses that same-origin URL for the LangGraph SDK (no browser CORS issues in local dev).

Open [http://localhost:4100](http://localhost:4100) in your browser.
