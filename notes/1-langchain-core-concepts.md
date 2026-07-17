# 第 1 部分 · LangChain 核心知识与概念

> 依据：[LangChain Overview (Python)](https://docs.langchain.com/oss/python/langchain/overview)  
> 概念跨语言通用；本仓库实践语言为 **TypeScript**（`createAgent` 对应 Python 的 `create_agent`）  
> JS 文档入口：[LangChain Overview (JS)](https://docs.langchain.com/oss/javascript/langchain/overview)

---

## 一句话定位

```
Agent = Model + Harness
```

| 部分 | 职责 |
|------|------|
| **Model** | 推理、决定是否调工具、生成最终回答 |
| **Harness（`create_agent` / `createAgent`）** | 围绕模型循环的一切：prompt、tools、middleware，以及可选的记忆/持久化 |

**核心循环**：模型 →（可选）调用工具 → 结果喂回模型 → 直到任务完成。

---

## 和其他产品怎么选

| 方案 | 功能 | 使用场景 |
|------|------|----------|
| **LangChain** | 可高度定制的 agent harness | 按业务拼装模型 / 工具 / 中间件；多数应用从这里起步 |
| **LangGraph** | 底层编排（图、状态、边） | 确定性流程 + 智能体混合、复杂分支、自定义控制流 |
| **Deep Agents** | 开箱即用的「全装」agent | 要自动压缩上下文、虚拟文件系统、子 agent 等，少自己拼 |
| **LangSmith** | 追踪、调试、评估 | 任何框架的可观测与质量评估 |

Build 栈自下而上：`@langchain/core` → `@langchain/langgraph` → `langchain` → `deepagents`  
（详见 [notes/0.3-tech-stack-layers.md](./0.3-tech-stack-layers.md)）

---

## 核心知识模块

### 1. Agent（`create_agent` / `createAgent`）

| | |
|--|--|
| **功能** | 把模型循环、工具执行、状态管理封装成可 `invoke` 的 agent |
| **场景** | 客服助手、研究 agent、内部工具编排——「让模型自己决定何时调什么工具」 |
| **文档** | [Agents](https://docs.langchain.com/oss/python/langchain/agents) |
| **本仓库** | `src/01-langchain/01-weather-agent.ts`、`02-research-agent.ts` |

最小形态：`model` + `tools`（+ 可选 `system_prompt` / `systemPrompt`）。

---

### 2. Models（聊天模型 / 嵌入）

| | |
|--|--|
| **功能** | 统一接口对接 OpenAI / Anthropic / Google 等；支持 tool calling、结构化输出；Embeddings 将文本向量化 |
| **场景** | 换模型几乎不改业务代码；RAG 索引与检索；按任务选便宜模型或强推理模型 |
| **文档** | [Models](https://docs.langchain.com/oss/python/langchain/models) · [Embeddings 集成](https://docs.langchain.com/oss/javascript/integrations/embeddings) |
| **本仓库** | 聊天：`google-genai:gemini-3.1-flash-lite`；嵌入：`GoogleGenerativeAIEmbeddings`（`04-rag.ts`） |

常用传参：`"provider:model"` 字符串，或已初始化的模型实例（如 `initChatModel`）。

---

### 3. Tools

| | |
|--|--|
| **功能** | 把可执行能力暴露给模型（查天气、读 URL、查库、调 API）；可访问 runtime（state / context / store） |
| **场景** | 一切「模型自己做不到、必须调用外部系统」的能力 |
| **文档** | [Tools](https://docs.langchain.com/oss/python/langchain/tools) |
| **本仓库** | `get_weather`、`fetch_text_from_url` 等 |

Python 常用 `@tool`；TypeScript 常用 `tool()` + Zod schema。

---

### 4. Middleware

| | |
|--|--|
| **功能** | 挂在 agent 循环各阶段的钩子：改 prompt、重试、限流、PII 脱敏、人工审批、摘要压缩等 |
| **场景** | 生产约束（安全、成本、合规）、HITL、长对话压缩、动态换模型 |
| **文档** | [Middleware Overview](https://docs.langchain.com/oss/python/langchain/middleware/overview) |
| **本仓库** | `src/01-langchain/03-middleware.ts`（步骤 1.7） |

设计原则：每个 middleware 管一件事，按需组合，不必一次全开。

---

### 5. Memory / Persistence

| 类型 | 功能 | 使用场景 |
|------|------|----------|
| **短时记忆**（checkpointer + `thread_id`） | 同一会话内记住多轮消息 | 多轮对话、中断后恢复 |
| **长时记忆**（Store） | 跨会话持久偏好 / 知识 | 「记住用户偏好」、跨天个性化 |
| **Summarization 等** | 历史过长时压缩 | 长任务 agent，避免撑爆上下文窗口 |

| | |
|--|--|
| **文档** | [Agents · Memory](https://docs.langchain.com/oss/python/langchain/agents) · [Context engineering](https://docs.langchain.com/oss/python/langchain/context-engineering) |
| **本仓库** | 1.5：`MemorySaver` + `thread_id` |

---

### 6. Retrieval / RAG

流水线：

```
Load → Split → Embed → Store → Retrieve → Generate
文档    切块    向量化   入库     检索       基于上下文生成
```

| | |
|--|--|
| **功能** | 用外部知识增强回答，减少幻觉、支持私有文档 |
| **场景** | 员工手册、产品文档、法规库——训练数据没有或必须可溯源的内容 |
| **文档** | [Retrieval](https://docs.langchain.com/oss/javascript/langchain/retrieval) · [Knowledge base](https://docs.langchain.com/oss/javascript/langchain/knowledge-base) · [MemoryVectorStore](https://docs.langchain.com/oss/javascript/integrations/vectorstores/memory) |
| **本仓库** | `src/01-langchain/04-rag.ts`（步骤 1.8）· 运行：`npm run rag` |

要点：索引与查询必须用**同一** embedding 模型；演示可用内存向量库，生产常用 Chroma / FAISS / Pinecone。

---

### 7. Context Engineering

| | |
|--|--|
| **功能** | 控制「进模型的内容」「工具能读什么」「循环里何时改状态」 |
| **场景** | 按用户/角色动态 system prompt、按权限过滤工具、注入业务上下文 |
| **文档** | [Context engineering](https://docs.langchain.com/oss/python/langchain/context-engineering) |

三类上下文（概念）：

| 类型 | 控制什么 |
|------|----------|
| Model Context | 指令、历史消息、工具列表、响应格式 |
| Tool Context | 工具可读的 state / store / runtime context |
| Life-cycle Context | 模型与工具调用之间的钩子行为（常靠 middleware） |

---

### 8. Structured Output

| | |
|--|--|
| **功能** | 强制模型输出符合 schema 的对象（Python：Pydantic；TS：Zod） |
| **场景** | 表单填充、分类打标、下游系统要强类型字段 |

---

### 9. Streaming / Human-in-the-loop

| 模块 | 功能 | 使用场景 |
|------|------|----------|
| **Streaming** | 流式输出 token / 事件 | 前端打字效果、展示工具执行进度 |
| **HITL** | 危险操作前暂停等人确认 | 发邮件、删数据、转账类工具 |

HITL 常通过 middleware（如 `HumanInTheLoopMiddleware`）接入；更复杂编排见第 2 部分 LangGraph。

---

## Overview 强调的四大收益

1. **标准模型接口** — 换厂商成本低  
2. **可配置 Harness** — 从最小 agent 用 middleware 增量加能力  
3. **建在 LangGraph 上** — 自带持久执行、HITL、checkpoint 等能力  
4. **对接 LangSmith** — 看 trace、工具调用、状态与延迟，便于排错与评估  

Build 阶段可用 `.env` 中 `LANGSMITH_TRACING=true` 产生自动 trace；**Monitor 专题**（`traceable`、`wrapOpenAI` 等）放在第 6 部分系统学习。

---

## 与本仓库学习进度对照

| 模块 | 状态 |
|------|------|
| Agent / Tools / Model | ✅ 1.4–1.5 |
| 其他模型集成（选学） | ⬜ 1.6 |
| Middleware | ✅ 1.7 |
| RAG / Retrieval | 🟨 1.8 |
| LangGraph 编排 | 第 2 部分 |
| Deep Agents | 第 3 部分 |
| 系统学 Trace | 第 6 部分 |

---

## 10 行速记

1. Agent = Model + Harness；Harness 的核心入口是 `create_agent` / `createAgent`。  
2. 模型负责想；工具负责做；middleware 负责约束与增强循环。  
3. 短时记忆靠 checkpointer + `thread_id`；长时记忆靠 Store。  
4. RAG = 检索外部知识再生成，不是「再训一遍模型」。  
5. 同一向量库的索引与查询必须用同一 embedding 模型。  
6. 简单定制用 LangChain；复杂图编排用 LangGraph；要全装用 Deep Agents。  
7. Context engineering = 在对的时间把对的上下文交给模型和工具。  
8. Structured output 让下游拿到可靠的结构化数据。  
9. HITL 把危险工具调用交给人审批。  
10. LangSmith 看运行轨迹；与业务逻辑解耦，尽早开 tracing 有助于调试。
