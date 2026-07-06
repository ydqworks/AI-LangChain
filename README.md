# AI-LangChain

基于 [LangChain 官方文档](https://docs.langchain.com/) 的 **TypeScript** 学习仓库，按 Monitor → LangChain → LangGraph → Deep Agents 路线从 0 到 1 系统学习 Agent 工程。

详细学习清单与勾选进度见 **[LEARNING.md](./LEARNING.md)**。

---

## 学习进度

| 字段 | 值 |
|------|-----|
| **当前部分** | 第 1 部分 · Monitor 可观测性 |
| **当前步骤** | 1.1 |
| **最近更新** | 2026-07-06 |

| 部分 | 名称 | 状态 | 说明 |
|:----:|------|:----:|------|
| 0 | 准备与认知 | ✅ 已完成 | 文档、环境、LangSmith、MCP |
| 1 | Monitor 可观测性 | 🟨 进行中 | 第一个写代码的模块 |
| 2 | LangChain 基础 | ⬜ 未开始 | `createAgent`、Tools、Middleware |
| 3 | LangGraph 编排 | ⬜ 未开始 | StateGraph、Checkpoint、HITL |
| 4 | Deep Agents | ⬜ 未开始 | 规划、子 Agent、Skills |
| 5 | Test 评估 | ⬜ 未开始 | Dataset、Experiment |
| 6 | Deploy 部署 | ⬜ 未开始 | LangGraph CLI、Agent Server |
| 7 | 进阶（可选） | ⬜ 未开始 | Govern、Engine、Fleet |

> 状态图例：⬜ 未开始 · 🟨 进行中 · ✅ 已完成

### 路线图

```
第 0 部分  准备（读文档、搭环境）
    ↓
第 1 部分  Monitor — 追踪与调试
    ↓
第 2 部分  LangChain — createAgent
    ↓
第 3 部分  LangGraph — StateGraph
    ↓
第 4 部分  Deep Agents — 复杂任务
    ↓
第 5 部分  Test — 评估与 Prompt
    ↓
第 6 部分  Deploy — 部署上线
    ↓
第 7 部分  进阶（可选）
```

**Build 开源栈**（自下而上）：

```
@langchain/core  →  @langchain/langgraph  →  langchain  →  deepagents
```

---

## 环境状态

| 项目 | 状态 |
|------|:----:|
| Node.js 22+ | ✅ v22.14.0 |
| 项目依赖 `npm install` | ✅ 已安装 |
| LangSmith 账号 & API Key | ✅ 已配置 |
| `.env` 配置 | ✅ 已创建（勿提交 Git） |
| LangSmith MCP（Cursor） | ✅ 已连接 |
| 示例代码 `src/` | 待创建（第 1 部分起） |

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/ydqworks/AI-LangChain.git
cd AI-LangChain
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量（第 1 部分起需要）

```bash
cp .env.example .env
```

编辑 `.env`，填入 LangSmith 与模型 API Key（**勿提交 Git**）。

### 4. 开始学习

打开 [LEARNING.md](./LEARNING.md)，从 **第 0 部分 · 0.1** 逐步勾选。每完成一部分，同步更新本 README 的进度表。

---

## 项目结构

```
AI-LangChain/
├── notes/                  # 第 0 部分笔记
│   └── 0.3-tech-stack-layers.md
├── src/                    # 学习示例（随进度创建）
│   ├── 01-tracing/         # 第 1 部分
│   ├── 02-langchain/       # 第 2 部分
│   ├── 03-langgraph/       # 第 3 部分
│   └── 04-deepagents/      # 第 4 部分
├── .env.example            # 环境变量模板
├── LEARNING.md             # 详细学习计划与勾选清单
├── package.json
└── .cursor/
    ├── mcp.json            # LangSmith Remote MCP
    └── rules/              # Cursor 学习路线规则
```

---

## 当前依赖

| 包 | 用途 |
|----|------|
| `@langchain/core` | 核心抽象 |
| `@langchain/openai` | OpenAI 模型集成 |
| `@langchain/anthropic` | Anthropic 模型集成 |
| `langchain` | LangChain Agent 框架 |

后续各部分按需安装，见 [LEARNING.md · 依赖安装备忘](./LEARNING.md#依赖安装备忘)。

---

## 参考链接

- [LangChain 文档首页](https://docs.langchain.com/)
- [Build Overview](https://docs.langchain.com/build-overview)
- [LangSmith](https://smith.langchain.com)
- [LangSmith Remote MCP](https://docs.langchain.com/langsmith/langsmith-remote-mcp)
- [TypeScript 文档入口](https://docs.langchain.com/oss/javascript/)

---

## 下一步

**第 1 部分 · 1.1**：安装 `langsmith`、`openai` 及 TypeScript 开发依赖，详见 [LEARNING.md](./LEARNING.md)。
