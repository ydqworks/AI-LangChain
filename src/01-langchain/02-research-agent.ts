/**
 * 第 1 部分 · 1.5 — Build a real-world agent（文学研究 Agent）
 * 文档：https://docs.langchain.com/oss/javascript/langchain/quickstart#build-a-real-world-agent
 *
 * 学习要点（对应官网该节）：
 * 1. systemPrompt — 明确 Agent 角色与能力边界
 * 2. fetch_text_from_url — async 工具 + zod URL 校验，对接外部数据
 * 3. initChatModel — 模型参数配置（temperature / timeout / maxTokens）
 * 4. MemorySaver + thread_id — 对话记忆（checkpointer）
 *
 * 运行：npm run research-agent
 * 注意：会抓取 Gutenberg 全文，耗时较长、消耗较多 token。
 */
import { MemorySaver } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { createAgent, initChatModel } from "langchain";
import { z } from "zod";

const SYSTEM_PROMPT = `You are a literary data assistant.

## Capabilities

- \`fetch_text_from_url\`: loads document text from a URL into the conversation.
Do not guess line counts or positions—ground them in tool results from the saved file.`;

const fetchTextFromUrl = tool(
  async ({ url }: { url: string }): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120_000);
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; quickstart-research/1.0)",
        },
        signal: controller.signal,
      });
      if (!resp.ok) {
        return `Fetch failed: HTTP ${resp.status} ${resp.statusText}`;
      }
      return await resp.text();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return `Fetch failed: ${msg}`;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  {
    name: "fetch_text_from_url",
    description: "Fetch the document from a URL.",
    schema: z.object({ url: z.string().url() }),
  },
);

const checkpointer = new MemorySaver();

const USER_PROMPT = `Project Gutenberg hosts a full plain-text copy of F. Scott Fitzgerald's The Great Gatsby.
URL: https://www.gutenberg.org/files/64317/64317-0.txt

Answer as much as you can:

1) How many lines in the complete Gutenberg file contain the substring \`Gatsby\` (count lines, not occurrences within a line, each line ends with a line break).
2) The 1-based line number of the first line in the file that contains \`Daisy\`.
3) A two-sentence neutral synopsis.

Do your best on (1) and (2). If at any point you realize you cannot **verify** an exact answer with
your available tools and reasoning, do not fabricate numbers: use \`null\` for that field and spell out
the limitation in \`how_you_computed_counts\`. If you encounter any errors please report what the error was and what the error message was.`;

async function main() {
  const model = await initChatModel("gemini-3.1-flash-lite", {
    modelProvider: "google-genai",
    temperature: 0.5,
    timeout: 600_000,
    maxTokens: 25000,
  });

  const agent = createAgent({
    model,
    tools: [fetchTextFromUrl],
    systemPrompt: SYSTEM_PROMPT,
    checkpointer,
  });

  const result = await agent.invoke(
    { messages: [{ role: "user", content: USER_PROMPT }] },
    { configurable: { thread_id: "great-gatsby-lc" } },
  );

  const lastMessage = result.messages.at(-1);
  const blocks = lastMessage?.contentBlocks ?? lastMessage?.content;
  console.log(
    typeof blocks === "string" ? blocks : JSON.stringify(blocks, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
