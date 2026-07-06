/**
 * 第 1 部分 · 1.4 — LangChain Quickstart：天气 Agent（Gemini）
 * 文档：https://docs.langchain.com/oss/javascript/langchain/quickstart
 *
 * 运行：npm run weather-agent
 */
import { createAgent, tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
  (input) => `It's always sunny in ${input.city}!`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  },
);

const agent = createAgent({
  model: "google-genai:gemini-2.5-flash-lite",
  tools: [getWeather],
});

async function main() {
  const result = await agent.invoke({
    messages: [
      { role: "user", content: "What's the weather in San Francisco?" },
    ],
  });

  const lastMessage = result.messages.at(-1);
  console.log(lastMessage?.content);
}

main().catch(console.error);
