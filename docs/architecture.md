# 架构总览

## 系统架构图（OpenAI Agent SDK 版）

```text
External Trigger (GitHub / Cron / Slack)
        │
        ▼
┌────────────────────────────────┐
│        Agent Server            │
│                                │
│  routes/                       │  ← 外部触发器
│        │                       │
│        ▼                       │
│  OpenAI Agent (SDK)            │  ← 决策 / 规划 / 状态管理
│        │                       │
│        ▼                       │
│  Agent Skills Loader           │  ← 加载能力模块（指令 / 示例）
│        │                       │
│        ▼                       │
│  Tools (OpenAI Tool Interface) │  ← GitHub / FS / DB / HTTP
│        │                       │
│        ▼                       │
│  Side Effects                  │  ← PR / Comment / Webhook
└────────────────────────────────┘
```

## 组件说明

### External Trigger

外部触发器，支持多种来源：

- GitHub Webhooks
- Cron 定时任务
- Slack 消息

### Agent Server

核心服务层，包含以下模块：

| 模块 | 职责 |
|------|------|
| `routes/` | 接收外部触发器请求 |
| OpenAI Agent (SDK) | 决策 / 规划 / 状态管理 |
| Agent Skills Loader | 加载能力模块（指令 / 示例） |
| Tools | 具体执行接口（GitHub / FS / DB / HTTP） |
| Side Effects | 执行副作用（PR / Comment / Webhook） |

## 数据流

1. **触发**：外部事件通过 `routes/` 进入系统
2. **决策**：OpenAI Agent 分析任务，决定执行策略
3. **加载能力**：根据需要加载相应的 Agent Skills
4. **执行**：通过 Tools 接口执行具体操作
5. **副作用**：产生外部效果（创建 PR、发送消息等）
