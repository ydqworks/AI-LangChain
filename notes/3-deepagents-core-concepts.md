# 第 3 部分 · Deep Agents 核心知识与概念

> 依据：[Deep Agents Overview (JS)](https://docs.langchain.com/oss/javascript/deepagents/overview)  
> 延伸：[Quickstart](https://docs.langchain.com/oss/javascript/deepagents/quickstart) · [Customization](https://docs.langchain.com/oss/javascript/deepagents/customization) · [Frontend](https://docs.langchain.com/oss/javascript/deepagents/frontend/overview)  
> 实践语言：**TypeScript** · 包：`deepagents` · 入口：`createDeepAgent`

---

## 一句话定位

```
Deep Agents = 建在 LangChain / LangGraph 上的「开箱即用」Agent Harness
```

核心仍是 **模型 + 工具循环**，但默认带上复杂任务常用能力：

- 任务规划（`write_todos`）
- 虚拟文件系统（上下文落盘）
- 子 Agent 委派（`task`）
- 长时记忆 / Skills
- Human-in-the-loop

你主要是**配置**，而不是自己拼这些 middleware。

```typescript
import { createDeepAgent } from "deepagents";

const agent = await createDeepAgent({
  tools: [/* 业务工具 */],
  systemPrompt: "You are a helpful assistant",
});

await agent.invoke({
  messages: [{ role: "user", content: "..." }],
});
```

---

## 和其他产品怎么选

| 方案 | 角色 | 使用场景 |
|------|------|----------|
| **LangChain `createAgent`** | 可定制的最小 harness | 简单、单目的、上下文装得进一轮 prompt |
| **LangGraph** | 底层编排运行时 | 要精细控图、自定义分支，自己搭能力 |
| **Deep Agents** | 预装能力的 agent harness | 多步规划、大上下文落盘、子 Agent 委派、跨会话记忆 |
| **LangSmith** | 追踪 / 评估 / 部署 | 调试与上线（与三者通用） |

官网表述：`deepagents` 是独立库，基于 LangChain 积木 + LangGraph 生产运行能力。

Build 栈自下而上：`@langchain/core` → `@langchain/langgraph` → `langchain` → **`deepagents`**  
（详见 [0.3-tech-stack-layers.md](./0.3-tech-stack-layers.md) · [1-langchain-core-concepts.md](./1-langchain-core-concepts.md) · [2-langgraph-core-concepts.md](./2-langgraph-core-concepts.md)）

---

## 内置工具（默认就有）

| 工具族 | 代表工具 | 功能 | 使用场景 |
|--------|----------|------|----------|
| **规划** | `write_todos` | 拆解并跟踪多步任务 | 调研报告、多阶段流水线 |
| **文件系统** | `ls` / `read_file` / `write_file` / `edit_file` / `glob` / `grep` | 把大上下文写到「文件」再读回 | 长文档、中间草稿、避免撑爆上下文 |
| **委派** | `task` | 拉起专用子 Agent，拿回摘要 | 隔离复杂子任务、保持主 Agent 上下文干净 |

**边界**：TodoList / Filesystem / SubAgent 属于默认栈，**不能卸掉**；工具名（`write_todos`、`task`、文件系统工具）固定。只能在其上追加 tools / middleware / subagents。

---

## 核心知识模块

### 1. Harness / `createDeepAgent`

| | |
|--|--|
| **功能** | 组装默认 middleware + 内置工具，返回可 `invoke` / 部署的 agent |
| **场景** | 「复杂任务 Agent」的起点，少从零拼图 |
| **文档** | [Overview](https://docs.langchain.com/oss/javascript/deepagents/overview) · [Customization](https://docs.langchain.com/oss/javascript/deepagents/customization) |

常用配置参数：

| 参数 | 作用 |
|------|------|
| `model` | 模型（`provider:model` 或实例） |
| `systemPrompt` | 业务角色说明（追加在内置 harness 说明之前） |
| `tools` | 业务工具 / MCP 工具 |
| `backend` | 文件系统后端（默认 StateBackend） |
| `permissions` | 路径级读写控制 |
| `subagents` | 自定义子 Agent |
| `skills` | Skills 目录，按需加载 |
| `memory` | 启动时常驻说明（如 AGENTS.md） |
| `interruptOn` | 敏感工具调用前暂停审批 |
| `checkpointer` / `store` | 短时线程状态 / 长时跨线程记忆 |
| `middleware` | 追加到默认栈之后 |
| `responseFormat` | 结构化输出 |
| `contextSchema` | 每轮运行时上下文（userId、API Key 等） |

---

### 2. Task Planning（`write_todos` / TodoListMiddleware）

| | |
|--|--|
| **功能** | 让模型写下待办、更新进度，而不是一口气硬做完 |
| **场景** | 多步研究、写报告、需要可见进度的长任务 |
| **LEARNING** | 步骤 3.5 |

前端可读取 `stream.values.todos` 展示进度（见 [Frontend Overview](https://docs.langchain.com/oss/javascript/deepagents/frontend/overview)）。

---

### 3. Virtual Filesystem + Backend

| | |
|--|--|
| **功能** | 用文件工具管理上下文；后端可插拔 |
| **场景** | 大文件分析、草稿落盘、跨工具共享中间结果 |
| **LEARNING** | 步骤 3.4 |

| Backend | 功能 | 使用场景 |
|---------|------|----------|
| **StateBackend**（默认） | 线程内临时文件 | 单次会话草稿；线程结束即丢 |
| **FilesystemBackend** | 真实 / 虚拟磁盘 | 本地开发、读写项目文件 |
| **StoreBackend** | 经 Store 持久化 | 无本地盘、跨会话文件 |
| **CompositeBackend** | 按路径路由到不同 backend | 例如 `/draft` 临时 + `/memories` 持久 |

还可配 **permissions**：对路径做声明式访问控制。

---

### 4. Subagents（`task` / SubAgentMiddleware）

| | |
|--|--|
| **功能** | 主 Agent 委派：新建子 Agent → 独立执行 → 回传报告 |
| **场景** | 需要专用工具集，或要把脏活隔离出主上下文 |
| **默认** | 自带 `general-purpose` 子 Agent |
| **LEARNING** | 步骤 3.5 |

自定义子 Agent 常见字段：`name`、`description`、`systemPrompt`、`tools`。

```
主 Agent --task--> 子 Agent（独立上下文）--摘要--> 主 Agent
```

何时用子 Agent：任务需要专门工具、要隔离复杂工作、主 Agent 上下文不宜膨胀。  
何时留在主 Agent：通用工具够用、单步操作即可。

---

### 5. Skills（SkillsMiddleware）

| | |
|--|--|
| **功能** | 按需加载 `SKILL.md`（渐进披露），相关时才进上下文 |
| **场景** | 领域手册、测试规范等「大但不是每次都要」的知识 |
| **LEARNING** | 步骤 3.4 |

目录约定：

```
skills/
└── my-skill/
    ├── SKILL.md        # 必填
    ├── examples.ts     # 可选
    └── templates/      # 可选
```

`SKILL.md` 需含 frontmatter：`name`、`description`。

| Skills | Memory（如 AGENTS.md） |
|--------|------------------------|
| 按需加载 | 启动时常驻 |
| 任务专用、可较大 | 通用偏好、宜短 |

---

### 6. Long-term Memory / Store

| | |
|--|--|
| **功能** | 跨 `thread_id` 持久偏好与知识（常配合 StoreBackend / MemoryMiddleware） |
| **场景** | 「记住用户习惯」、跨天续聊 |

| 机制 | 作用域 | 典型用途 |
|------|--------|----------|
| **Checkpointer** | 单线程短时 | 多轮对话、HITL 恢复 |
| **Store** | 跨线程长时 | 用户偏好、共享知识 |

---

### 7. Tools / MCP

| | |
|--|--|
| **功能** | 接入自定义 tool、LangChain tool、任意 MCP server |
| **场景** | 查库、调业务 API、连外部系统 |
| **LEARNING** | 步骤 3.6 |

Deep Agents 完整支持 Model Context Protocol（MCP），作为标准外部能力入口。

---

### 8. Human-in-the-loop（`interruptOn`）

| | |
|--|--|
| **功能** | 敏感工具调用前暂停，等人批准（底层为 LangGraph interrupt） |
| **前提** | 必须配置 **checkpointer**，否则无法暂停 / 恢复 |
| **场景** | `write_file`、发邮件、删数据等 |
| **LEARNING** | 步骤 3.7 |

```typescript
const agent = await createDeepAgent({
  interruptOn: { write_file: true },
  checkpointer: new MemorySaver(),
});
```

---

### 9. System Prompt / Middleware 扩展

| | |
|--|--|
| **systemPrompt** | 追加在内置「如何使用 harness」说明之前，定义业务角色 |
| **middleware** | 追加到默认栈之后（不可拆掉 Todo / FS / SubAgent 核心） |
| **responseFormat** | 强制结构化输出 |
| **contextSchema** | 传入 userId、feature flag 等每轮上下文 |

---

### 10. 可选：沙箱 / 代码执行

Overview / 定制文档提到：沙箱 shell、进程内 JS 解释器等，用于「写代码并执行」类任务。  
入门可后置，先掌握：**规划 + 文件系统 + 子 Agent**。

---

## 典型工作流（心智模型）

```
用户任务
  → write_todos 拆计划
  → 大材料 → write_file / read_file 落盘管理
  → 复杂子任务 → task(子 Agent)
  → 敏感操作 → interruptOn 等人批
  → 合成最终答案
```

与 Quickstart「研究 Agent」一致：计划 → 检索 → 文件管理 →（可选）委派 → 写报告。

---

## 与本仓库学习进度对照

| 模块 | LEARNING 步骤 | 状态 |
|------|----------------|------|
| 安装 | 3.1 | ⬜（当前在第 2 部分） |
| Overview | 3.2 | ⬜ |
| 第一个 Deep Agent | 3.3 · `src/03-deepagents/01-basic.ts` | ⬜ |
| Skills + 文件系统 | 3.4 | ⬜ |
| 子 Agent + `write_todos` | 3.5 | ⬜ |
| MCP | 3.6 | ⬜ |
| `interruptOn` | 3.7 | ⬜ |

完成标准：Deep Agent 能完成多步任务。

---

## 10 行速记

1. Deep Agents = 预装复杂任务能力的 harness，不是第三套模型 SDK。  
2. 入口是 `createDeepAgent`，底层仍是 LangGraph。  
3. 默认带：规划、文件系统、子 Agent——核心栈卸不掉。  
4. `write_todos` 管多步；文件工具管大上下文。  
5. `task` 委派子 Agent，主上下文保持干净。  
6. Skills 按需加载；Memory 常驻偏好。  
7. Backend 决定文件落在哪（临时 / 磁盘 / Store / 混合）。  
8. MCP / 自定义 tools 扩展业务能力。  
9. `interruptOn` + checkpointer = HITL。  
10. 简单任务用 `createAgent`；复杂长任务再上 Deep Agents。
