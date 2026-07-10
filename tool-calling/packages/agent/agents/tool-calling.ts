import { createAgent } from "langchain";

import { assertAgentEnv } from "../env-check";
import { weatherTool } from "../tools/weather.js";
import { calculatorTool } from "../tools/calculator.js";
import { searchWebTool } from "../tools/search-web.js";

assertAgentEnv();

export const agent = createAgent({
  model: "google-genai:gemini-3.1-flash-lite",
  tools: [weatherTool, calculatorTool, searchWebTool],
});
