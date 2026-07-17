# 第 2 部分 · LangGraph 核心知识与概念

> 依据：[LangGraph Overview (JS)](https://docs.langchain.com/oss/javascript/langgraph/overview)  
> 延伸：[Graph API](https://docs.langchain.com/oss/javascript/langgraph/graph-api) · [Thinking in LangGraph](https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph) · [Persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence) · [Interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts)  
> 实践语言：**TypeScript** · 包：`@langchain/langgraph`

---

## 一句话定位

```
LangGraph = 面向长时、有状态 Agent 的底层编排运行时
```

用**有向图**描述工作流，不替你抽象 prompt / 架构，专注：

- 持久执行（Persistence）
- 流式输出（Streaming）
- 人工介入（Human-in-the-loop）
- 短时 / 长时记忆

```
StateGraph = State（共享状态）+ Nodes（做事）+ Edges（怎么走）
                 ↓ compile()
            invoke / stream
```

和 LangChain 的关系：`createAgent` 底层建在 LangGraph 上；需要精细控流程时，直接用手写 Graph。

---

## 和其他产品怎么选

| 方案 | 角色 | 使用场景 |
|------|------|----------|
| **LangChain** | Agent 框架（模型、工具、预置循环） | 快速原型、标准 tool-calling 循环 |
| **LangGraph** | 编排运行时 | 分支 / 循环、HITL、持久化、长任务可控编排 |
| **Deep Agents** | 建在 LangGraph 上的「全装」harness | 规划、子 agent、文件系统、上下文管理开箱即用 |
| **LangSmith** | 追踪 / 评估 / 部署 | 调试路径、指标、上线 |

Build 栈自下而上：`@langchain/core` → **`@langchain/langgraph`** → `langchain` → `deepagents`  
（详见 [0.3-tech-stack-layers.md](./0.3-tech-stack-layers.md) · [1-langchain-core-concepts.md](./1-langchain-core-concepts.md)）

---

## Overview 强调的核心收益

| 能力 | 功能 | 使用场景 |
|------|------|----------|
| **Persistence** | 失败可续跑、长时间运行可恢复 | 多步任务、服务重启后接着做 |
| **Human-in-the-loop** | 任意点检查 / 改状态再继续 | 审批发邮件、确认删数据 |
| **Comprehensive memory** | 短时（线程内）+ 长时（跨会话） | 多轮对话 + 记住用户偏好 |
| **LangSmith 调试** | 路径、状态变迁、运行指标可视化 | 复杂图排错 |
| **Production deployment** | 面向有状态长任务的部署基础设施 | Agent Server / 生产扩缩 |

---

## 核心知识模块

### 1. StateGraph / Graph API

| | |
|--|--|
| **功能** | 用图定义 Agent 工作流：入口 `START`、出口 `END`、节点与边；必须 `compile()` 后才能执行 |
| **场景** | 任何「多步骤、要控顺序 / 分支」的流程 |
| **文档** | [Graph API](https://docs.langchain.com/oss/javascript/langgraph/graph-api) · [Thinking in LangGraph](https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph) |

**设计五步**（官网思维）：

1. 画出离散步骤（每步 → 一个 node）  
2. 标清每步类型：LLM / 数据 / 动作 / 用户输入  
3. 设计 State（共享内存）  
4. 实现 Node（读 state → 返回部分更新）  
5. 连 Edge，需要时加 checkpointer，再 `compile()`

Hello World 形态：

```typescript
import { StateSchema, MessagesValue, StateGraph, START, END } from "@langchain/langgraph";

const State = new StateSchema({ messages: MessagesValue });

const graph = new StateGraph(State)
  .addNode("mock_llm", (state) => ({
    messages: [{ role: "ai", content: "hello world" }],
  }))
  .addEdge(START, "mock_llm")
  .addEdge("mock_llm", END)
  .compile();
```

---

### 2. State（状态 + Reducer）

| | |
|--|--|
| **功能** | 所有节点共享的工作内存；节点返回**部分更新**，由 reducer 合并 |
| **场景** | 消息历史要追加；计数器 / 标志位可覆盖 |
| **文档** | [Graph API · State](https://docs.langchain.com/oss/javascript/langgraph/graph-api) |

| 需求 | 做法 |
|------|------|
| 覆盖字段 | 默认（无 reducer） |
| 追加消息列表 | `MessagesValue` |
| 追加普通数组 | `ReducedValue` + concat |
| 自定义合并 | 自定义 reducer |

**注意**：列表字段若无 reducer，后写会**覆盖**前文，消息会丢。

---

### 3. Nodes（节点）

| | |
|--|--|
| **功能** | 步骤函数：读 state → 做事 → 返回 state 更新 |
| **常见类型** | LLM 调用、数据 / 检索、执行动作（工具）、等人输入 |
| **场景** | 「调模型」「跑工具」「写库」「等审批」各做成独立节点 |

建议节点偏小：checkpoint 在节点边界，节点越小，失败重跑成本越低。

---

### 4. Edges（边）

| 类型 | 功能 | 使用场景 |
|------|------|----------|
| **静态边** | 固定 A → B | 线性流水线 |
| **条件边** | 按 state 决定下一节点 | 工具循环：有 `tool_calls` → tools，否则 → END |
| **START / END** | 图入口与出口 | 每个可执行图必备 |

---

### 5. Command / Send（高级控制流）

| 原语 | 功能 | 使用场景 |
|------|------|----------|
| **Command** | 节点内同时「更新状态 + 指定下一跳」；也用于 `resume` 恢复 interrupt | 动态路由、HITL 恢复 |
| **Send** | 动态扇出到多个节点（map-reduce 风格） | 并行子任务 |

---

### 6. Persistence：Checkpointer + Store

| 模块 | 功能 | 作用域 | 使用场景 |
|------|------|--------|----------|
| **Checkpointer** | 每步保存图状态快照；配合 `thread_id` | 单线程 / 短时记忆 | 多轮对话、中断恢复、容错、时间旅行 |
| **Store** | 应用级 KV，跨线程 | 长时记忆 | 用户偏好、跨会话事实 |

| | |
|--|--|
| **文档** | [Persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence) · [Checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers) |
| **本仓库** | 第 1 部分 1.5：`MemorySaver` + `thread_id`（经 LangChain Agent 间接使用）；第 2 部分 2.4 系统练习 |

开发常用 `MemorySaver`（进程重启丢失）；生产用 Postgres 等持久 checkpointer。

---

### 7. Streaming

| | |
|--|--|
| **功能** | 流式吐出 token、状态快照、事件 |
| **场景** | 前端打字效果、展示当前节点进度、边跑边处理 interrupt |
| **常用模式** | `values`（完整状态）、`updates`（每步增量）、messages 相关流 |
| **LEARNING** | 步骤 2.5 |

---

### 8. Human-in-the-loop / Interrupts

| | |
|--|--|
| **功能** | 节点内 `interrupt()` 暂停并持久化；之后用 `Command({ resume })` 继续 |
| **前提** | 必须 `compile({ checkpointer })` + 同一 `thread_id` |
| **场景** | 工具审批、人工改草稿、缺信息时等人补全 |
| **文档** | [Interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts) · [HITL](https://docs.langchain.com/langsmith/add-human-in-the-loop) |
| **LEARNING** | 步骤 2.6 |

---

### 9. 与 Models / Tools 的关系

LangGraph **不管**模型厂商封装；实践中常配合 LangChain 的 chat model 与 tools。

Overview 建议：

- 先熟悉 models + tools，再学图编排  
- 只要标准 tool-calling 循环，优先用 LangChain Agent  
- 需要分支、循环插入点、HITL、精细状态控制时，再手写 StateGraph  

---

## 「模型 → 工具 → 模型」循环（第 2.3 目标）

典型结构（对应产出 `src/02-langgraph/01-tool-loop.ts`）：

```
START → agent(LLM) ──有 tool_calls?──► tools ──► agent
                 └──无──► END
```

用手写 StateGraph 复现 `createAgent` 里那套循环，并便于插入 checkpoint / streaming / HITL。

---

## 与本仓库学习进度对照

| 模块 | LEARNING 步骤 | 状态 |
|------|----------------|------|
| 安装 / Overview / Hello World | **2.1–2.2** | 🟨 当前 |
| 工具调用循环图 | 2.3 | ⬜ |
| Checkpoint | 2.4 | ⬜ |
| Streaming | 2.5 | ⬜ |
| HITL | 2.6 | ⬜ |
| Deep Agents | 第 3 部分 | ⬜ |

---

## 10 行速记

1. LangGraph 是底层编排运行时，不是又一套「聊天 SDK」。  
2. 一切皆图：State + Node + Edge，必须 `compile()`。  
3. State 是共享内存；列表要追加必须配 reducer。  
4. Node 宜小，便于 checkpoint 与失败恢复。  
5. 条件边实现「模型 ↔ 工具」循环。  
6. Checkpointer + `thread_id` = 短时记忆与可恢复执行。  
7. Store = 跨会话长时记忆。  
8. `interrupt` + `Command(resume)` = HITL。  
9. Streaming 让长任务可观测、可交互。  
10. 简单循环用 LangChain；要精细控流再用手写 LangGraph。
