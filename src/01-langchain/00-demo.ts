import { AgentState, createAgent, humanInTheLoopMiddleware } from "langchain";
import { StateGraph, START } from "@langchain/langgraph";

// Assumes readEmail, sendEmail, classifyNode, and route are defined elsewhere.
// readEmail / sendEmail are registered with name: "read_email" / "send_email".
const emailAgent = createAgent({
  model: "claude-sonnet-4-6",
  tools: [readEmail, sendEmail],
  middleware: [humanInTheLoopMiddleware({ interruptOn: { send_email: true } })],
});

const graph = new StateGraph(AgentState)
  .addNode("classify", classifyNode)
  .addNode("emailAgent", emailAgent)
  .addEdge(START, "classify")
  .addConditionalEdges("classify", route)
  .compile();