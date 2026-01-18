# Agent 核心概念

## 什么是 Agent？

**Agent = 决策与控制面（Control Plane）**

在本项目中，Agent 由 **OpenAI Agents SDK** 提供，是整个工作流的"大脑"。

## Agent 的职责

Agent 负责以下核心功能：

| 职责 | 说明 |
|------|------|
| 理解目标 | 解析 Goal / Task |
| 维护状态 | 管理 State / Memory |
| 判断进度 | 评估当前步骤是否完成 |
| 加载能力 | 决定是否/何时加载 Agent Skill |
| 调用工具 | 决定是否调用 Tool |
| 控制流程 | 判断任务是否终止或继续 |

## 关键原则

> **Agent 不直接执行任何业务动作**，只通过 Tool Interface 触发执行。

这一设计确保了：

- **关注点分离**：决策逻辑与执行逻辑解耦
- **可测试性**：Agent 决策可以独立测试
- **可扩展性**：新增执行能力不影响 Agent 核心逻辑

## 与其他概念的关系

```text
Agent（决策）
    │
    ├── 加载 → Agent Skills（能力模块）
    │
    └── 调用 → Tools（执行接口）
```
