/**
 * 启动时校验必需/可选环境变量。
 * LangSmith：LANGSMITH_TRACING=true 时自动 trace（无需 traceable 等 Monitor 专题 API）。
 */
export function assertAgentEnv(): void {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set（见 packages/agent/.env）");
  }

  const tracingEnabled = process.env.LANGSMITH_TRACING === "true";

  if (tracingEnabled && !process.env.LANGSMITH_API_KEY) {
    throw new Error(
      "LANGSMITH_TRACING=true 但未设置 LANGSMITH_API_KEY（见 packages/agent/.env）",
    );
  }

  if (tracingEnabled) {
    const project = process.env.LANGSMITH_PROJECT ?? "default";
    console.log(`[env] LangSmith tracing enabled (project: ${project})`);
  } else {
    console.log(
      "[env] LangSmith tracing disabled（可选：LANGSMITH_TRACING=true + LANGSMITH_API_KEY）",
    );
  }
}
