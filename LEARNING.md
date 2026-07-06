# LangChain 技术栈学习计划（TypeScript · 从 0 到 1）

> 官方文档：[docs.langchain.com](https://docs.langchain.com/)  
> 语言：**TypeScript** · 项目：**AI-LangChain**

---

## 如何使用本文档

1. **严格按部分顺序学习**，完成一步勾一步（`- [ ]` → `- [x]`）。
2. **每部分末尾有「完成标准」**，全部满足后再进入下一部分。
3. **学完某部分后**，更新下方「进度总览」中的 `当前部分` 与勾选状态。
4. 项目里可能已有 `node_modules` 或 MCP 配置，**不代表已学完**——以你是否理解并完成该步为准。

---

## 进度总览

| 字段 | 值 |
|------|-----|
| **当前部分** | 第 1 部分 |
| **当前步骤** | 1.2 |
| **开始日期** | 2026-07-06 |
| **最近更新** | 2026-07-06 |

| 部分 | 名称 | 对应官网模块 | 状态 |
|------|------|-------------|------|
| 0 | 准备与认知 | 全平台认知 | ✅ 已完成 |
| 1 | Build — LangChain | Build | 🟨 进行中 |
| 2 | Build — LangGraph | Build | ⬜ 未开始 |
| 3 | Build — Deep Agents | Build | ⬜ 未开始 |
| 4 | Test 评估 | Test | ⬜ 未开始 |
| 5 | Deploy 部署 | Deploy | ⬜ 未开始 |
| 6 | Monitor 可观测性 | Monitor | ⬜ 未开始 |
| 7 | 进阶（可选） | Govern / Engine / Fleet | ⬜ 未开始 |

> 状态图例：⬜ 未开始 · 🟨 进行中 · ✅ 已完成

---

## 路线图一览

[官网首页](https://docs.langchain.com/) 按 **Agent 开发生命周期** 横向排列五大模块：

```
Build  →  Test  →  Deploy  →  Monitor  →  Govern
构建      评估      部署        观测        治理
```

本仓库在第 0 部分（准备）之后，**严格遵循该顺序**；Build 内部再按开源栈自下而上学习：

```
第 0 部分  准备（读文档、搭环境、LangSmith 账号）
    ↓
第 1 部分  Build — LangChain（createAgent）        ← 第一个写代码
    ↓
第 2 部分  Build — LangGraph（StateGraph）
    ↓
第 3 部分  Build — Deep Agents（复杂任务）
    ↓
第 4 部分  Test — 评估与 Prompt
    ↓
第 5 部分  Deploy — 部署上线
    ↓
第 6 部分  Monitor — 追踪与调试（系统学习 trace）
    ↓
第 7 部分  Govern / Engine / Fleet（可选）
```

**Build 开源栈**（[Build Overview](https://docs.langchain.com/build-overview)）自下而上：

```
@langchain/core  →  @langchain/langgraph  →  langchain  →  deepagents
```

> **说明**：第 0 部分已配置 `LANGSMITH_TRACING` 与 API Key，Build 阶段可顺带产生 trace；**Monitor 专题**（`traceable`、`wrapOpenAI`、Prompt Hub 等）放在 Deploy 之后系统学习，与官网一致。

---

## 第 0 部分：准备与认知

> **性质**：只读文档 + 环境检查，不写业务代码。  
> **入口**：[docs.langchain.com](https://docs.langchain.com/)

### 学习步骤

- [x] **0.1** 阅读官网首页，理解五大模块  
  - 文档：[docs.langchain.com](https://docs.langchain.com/)  
  - 自检：能按横向顺序说出 **Build → Test → Deploy → Monitor → Govern**

- [x] **0.2** 阅读 Build Overview，理解三层框架如何选型  
  - 文档：[Build Overview](https://docs.langchain.com/build-overview)  
  - 自检：能解释 LangChain / LangGraph / Deep Agents 的区别与适用场景

- [x] **0.3** 理解技术栈分层（画图或笔记）  
  - 内容：应用 → Build 栈 → LangSmith 平台  
  - 产出：[notes/0.3-tech-stack-layers.md](./notes/0.3-tech-stack-layers.md)

- [x] **0.4** 检查本地开发环境  
  - 要求：Node.js **22+**（`node -v`）  
  - 在本项目执行：`npm install`  
  - 自检：无报错，能识别 `package.json` 里已有哪些包

- [x] **0.5** 注册 LangSmith，完成 Onboarding（选 **Technical**）  
  - 链接：[smith.langchain.com](https://smith.langchain.com)  
  - 产出：可登录的账号 + Workspace

- [x] **0.6** 创建 LangSmith API Key（Personal Access Token）  
  - 路径：Settings → API Keys  
  - 产出：保存好 `lsv2_pt_...`（勿提交 Git）

- [x] **0.7**（推荐）配置 LangSmith Remote MCP（Cursor OAuth）  
  - 文档：[LangSmith Remote MCP](https://docs.langchain.com/langsmith/langsmith-remote-mcp)  
  - 配置：`.cursor/mcp.json`  
  - 自检：Cursor MCP 设置中 LangSmith 显示已连接

### 第 0 部分完成标准

- [x] 能不看文档说出：平台五模块横向顺序 + Build 三层框架
- [x] Node.js 22+、本项目依赖已安装
- [x] LangSmith 账号与 API Key 就绪
- [x] （推荐）LangSmith MCP 在 Cursor 中可用

**完成后**：将进度总览中第 0 部分改为 ✅，当前部分改为「第 1 部分 · 1.1」。

---

## 第 1 部分：Build — LangChain 基础

> **性质**：第一个动手写代码的模块。  
> **入口**：[LangChain Overview (JS)](https://docs.langchain.com/oss/javascript/langchain/overview)

### 学习步骤

- [x] **1.1** 安装开发与工具依赖  
  ```bash
  npm i zod
  npm i -D typescript tsx @types/node
  ```
  - 自检：能识别 `package.json` 新增项

- [ ] **1.2** 确认 `.env` 含模型 Key（参考 `.env.example`，勿提交 Git）  
  ```
  LANGSMITH_TRACING=true
  LANGSMITH_API_KEY=lsv2_pt_...
  OPENAI_API_KEY=sk-...
  ```

- [ ] **1.3** 阅读 Overview，理解 `createAgent` = Model + Tools + Middleware

- [ ] **1.4** 完成 Quickstart：天气 Agent  
  - 文档：[Quickstart](https://docs.langchain.com/oss/javascript/langchain/quickstart)  
  - 产出：`src/01-langchain/01-weather-agent.ts`

- [ ] **1.5** 编写自定义 Tool（`zod`）  
  - 产出：`src/01-langchain/02-custom-tools.ts`

- [ ] **1.6** 接入 `@langchain/openai` 或 `@langchain/anthropic`

- [ ] **1.7** 学习 Middleware（重试、guardrails）  
  - 产出：`src/01-langchain/03-middleware.ts`

- [ ] **1.8**（选学）RAG 入门

### 第 1 部分完成标准

- [ ] `createAgent` 能调用自定义 tool
- [ ] 本地示例可运行（`.env` 中 `LANGSMITH_TRACING=true` 时 LangSmith 可有自动 trace，第 6 部分再系统学习）

---

## 第 2 部分：Build — LangGraph 编排

> **入口**：[LangGraph Overview (JS)](https://docs.langchain.com/oss/javascript/langgraph/overview)

### 学习步骤

- [ ] **2.1** 安装：`npm i @langchain/langgraph`
- [ ] **2.2** 阅读 Overview，跑通 Hello World StateGraph
- [ ] **2.3** 实现工具调用循环图  
  - 参考：[setup-javascript](https://docs.langchain.com/langsmith/setup-javascript)  
  - 产出：`src/02-langgraph/01-tool-loop.ts`
- [ ] **2.4** Checkpoint 持久化（中断可恢复）
- [ ] **2.5** Streaming 流式输出
- [ ] **2.6** Human-in-the-loop  
  - 文档：[HITL](https://docs.langchain.com/langsmith/add-human-in-the-loop)

### 第 2 部分完成标准

- [ ] 手写 StateGraph 实现「模型 → 工具 → 模型」循环
- [ ] 支持 checkpoint

---

## 第 3 部分：Build — Deep Agents

> **入口**：[Deep Agents Overview (JS)](https://docs.langchain.com/oss/javascript/deepagents/overview)

### 学习步骤

- [ ] **3.1** 安装：`npm i deepagents`
- [ ] **3.2** 阅读 Overview（规划、子 Agent、文件系统、记忆）
- [ ] **3.3** 第一个 Deep Agent  
  - 产出：`src/03-deepagents/01-basic.ts`
- [ ] **3.4** Skills 与虚拟文件系统
- [ ] **3.5** 子 Agent 与 `write_todos`
- [ ] **3.6** 接入 MCP 工具
- [ ] **3.7** `interrupt_on` 人工审批

### 第 3 部分完成标准

- [ ] Deep Agent 能完成多步任务

---

## 第 4 部分：Test — 评估与质量

> **入口**：[Evaluation quickstart](https://docs.langchain.com/langsmith/evaluation-quickstart)

### 学习步骤

- [ ] **4.1** 创建 Dataset，跑第一次 Experiment
- [ ] **4.2** [Evaluate a chatbot](https://docs.langchain.com/langsmith/evaluate-chatbot-tutorial)
- [ ] **4.3** [Evaluate a RAG application](https://docs.langchain.com/langsmith/evaluate-rag-tutorial)
- [ ] **4.4** [Develop agents overview](https://docs.langchain.com/langsmith/develop-agents-overview)

### 第 4 部分完成标准

- [ ] 对已有 Agent 跑通 experiment，UI 可对比指标

---

## 第 5 部分：Deploy — 部署上线

### 学习步骤

- [ ] **5.1** 按 [setup-javascript](https://docs.langchain.com/langsmith/setup-javascript) 组织项目，编写 `langgraph.json`
- [ ] **5.2** 本地 LangGraph CLI：[CLI 文档](https://docs.langchain.com/langsmith/cli)
- [ ] **5.3** [Deployment quickstart](https://docs.langchain.com/langsmith/deployment-quickstart)
- [ ] **5.4** [Agent Server](https://docs.langchain.com/langsmith/agent-server) — threads / runs API

### 第 5 部分完成标准

- [ ] LangGraph Agent 可通过 HTTP API 调用

---

## 第 6 部分：Monitor — 可观测性

> **性质**：在 Build / Test / Deploy 之后，系统学习追踪与调试。  
> **入口**：[Tracing quickstart](https://docs.langchain.com/langsmith/observability-quickstart)

### 学习步骤

- [ ] **6.1** 安装 Monitor 依赖  
  ```bash
  npm i langsmith openai
  ```

- [ ] **6.2** 按官方文档编写并运行 Tracing 示例  
  - 文档：[Tracing quickstart](https://docs.langchain.com/langsmith/observability-quickstart)（选 **TypeScript**）  
  - 产出：`src/06-monitor/01-tracing-quickstart.ts`

- [ ] **6.3** 在 LangSmith UI 查看 trace  
  - 文档：[Trace an LLM application](https://docs.langchain.com/langsmith/observability-llm-tutorial)  
  - 自检：Tracing 页能看到 tool span + LLM span

- [ ] **6.4** Prompt 版本管理入门  
  - 文档：[Prompt engineering quickstart](https://docs.langchain.com/langsmith/prompt-engineering-quickstart)  
  - 产出：在 Hub 创建或拉取一个 prompt

- [ ] **6.5** LangChain 自动 tracing  
  - 文档：[Trace with LangChain](https://docs.langchain.com/langsmith/trace-with-langchain)  
  - 产出：`src/06-monitor/02-trace-with-langchain.ts`

- [ ] **6.6** LangGraph tracing  
  - 文档：[Trace with LangGraph](https://docs.langchain.com/langsmith/trace-with-langgraph)  
  - 产出：`src/06-monitor/03-trace-with-langgraph.ts`

### 第 6 部分完成标准

- [ ] 本地 tracing 示例可运行，LangSmith 有完整 trace
- [ ] 理解 `traceable` 与 `wrapOpenAI` 的作用
- [ ] 已对 LangChain / LangGraph Agent 开启自动 tracing

---

## 第 7 部分：进阶（可选）

- [ ] [Govern overview](https://docs.langchain.com/langsmith/govern-overview)
- [ ] [LangSmith Engine](https://docs.langchain.com/langsmith/engine-overview)
- [ ] [Fleet quickstart](https://docs.langchain.com/langsmith/fleet/quickstart)
- [ ] [LangChain Academy](https://academy.langchain.com/) 免费课程

---

## 项目目录（随学习创建）

```
AI-LangChain/
├── notes/
│   └── 0.3-tech-stack-layers.md  # 第 0 部分
├── src/
│   ├── 01-langchain/     # 第 1 部分
│   ├── 02-langgraph/     # 第 2 部分
│   ├── 03-deepagents/    # 第 3 部分
│   └── 06-monitor/       # 第 6 部分
├── .env                  # 第 0 部分起（不提交 Git）
├── .env.example
├── langgraph.json        # 第 5 部分
├── LEARNING.md           # 本文件
└── .cursor/
    ├── mcp.json
    └── rules/
```

---

## 依赖安装备忘

| 部分 | 命令 |
|------|------|
| 0 | `npm install`（已有 langchain 相关包即可） |
| 1 | `npm i zod` + `npm i -D typescript tsx @types/node` |
| 2 | `npm i @langchain/langgraph` |
| 3 | `npm i deepagents` |
| 5 | `npm i -D @langchain/langgraph-cli`（按需） |
| 6 | `npm i langsmith openai` |

---

## 你现在应该做什么

**第 1 部分 · 步骤 1.2**：确认 `.env` 含 `OPENAI_API_KEY`，阅读 Overview 理解 `createAgent`。
