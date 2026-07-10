import { createAgent } from "langchain";
import { assertAgentEnv } from "../env-check";

assertAgentEnv();

export const agent = createAgent({
  model: "google-genai:gemini-3.1-flash-lite",
});
