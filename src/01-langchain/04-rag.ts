/**
 * 第 1 部分 · 1.8 — RAG 入门（检索增强生成）
 *
 * 文档：
 * - https://docs.langchain.com/oss/javascript/langchain/retrieval
 * - https://docs.langchain.com/oss/javascript/langchain/knowledge-base
 * - https://docs.langchain.com/oss/javascript/integrations/vectorstores/memory
 * - https://docs.langchain.com/oss/javascript/integrations/embeddings/google_generative_ai
 *
 * 流水线：Load → Split → Embed → Store → Retrieve → Generate
 *
 * 运行：npm run rag
 */
import { Document } from "@langchain/core/documents";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { initChatModel } from "langchain";

/** 模拟「公司知识库」——真实项目中通常来自 PDF / 网页 / 数据库 */
const SOURCE_DOCS = [
  new Document({
    pageContent: `
Acme Corp 员工手册（节选）

请假政策：
- 年假：入职满 1 年享有 10 天带薪年假，之后每年增加 1 天，上限 20 天。
- 病假：每年 5 天带薪病假，需提供医院证明（连续请假超过 2 天）。
- 事假：无薪，需提前 3 个工作日申请，经直属经理批准。

远程办公：
- 每周最多 2 天远程办公。
- 需在团队日历标注 Remote，并保持工作时段在线。
`.trim(),
    metadata: { source: "handbook.md", section: "leave-and-remote" },
  }),
  new Document({
    pageContent: `
Acme Corp IT 支持指南（节选）

VPN：
- 客户端：公司统一下发的 WireGuard 配置。
- 忘记密码：登录 portal.acme.example/reset，或联系 it-help@acme.example。

笔记本损坏：
- 先开 IT 工单（类别 Hardware），附序列号。
- 保修期内 3 个工作日内更换备机。
`.trim(),
    metadata: { source: "it-guide.md", section: "vpn-and-hardware" },
  }),
];

async function main() {
  // 1. Split：切成小块，便于精确检索
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
  });
  const splits = await splitter.splitDocuments(SOURCE_DOCS);
  console.log(`文档切分为 ${splits.length} 个 chunk\n`);

  // 2. Embed + Store：向量化后写入内存向量库（演示用；生产可用 Chroma / FAISS / Pinecone）
  const embeddings = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
  });
  const vectorStore = await MemoryVectorStore.fromDocuments(splits, embeddings);

  // 3. Retrieve：按语义相似度取回相关片段
  const query = "我入职刚满一年，能请几天年假？远程办公有什么限制？";
  const retriever = vectorStore.asRetriever({ k: 3 });
  const relevantDocs = await retriever.invoke(query);

  console.log("—— 检索到的上下文 ——");
  for (const [i, doc] of relevantDocs.entries()) {
    console.log(`[${i + 1}] (${doc.metadata.source})\n${doc.pageContent}\n`);
  }

  // 4. Generate：把检索结果塞进 prompt，让模型基于材料回答
  const context = relevantDocs.map((d) => d.pageContent).join("\n\n---\n\n");
  const model = await initChatModel("google-genai:gemini-3.1-flash-lite", {
    temperature: 0,
  });

  const response = await model.invoke([
    {
      role: "system",
      content: `你是 Acme Corp 人事助手。只根据提供的上下文回答；若上下文不足，明确说不知道。不要编造政策。

上下文：
${context}`,
    },
    { role: "user", content: query },
  ]);

  console.log("—— 模型回答 ——");
  console.log(response.content);
}

main().catch(console.error);
