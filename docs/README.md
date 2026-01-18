# Agent Workflow Server 设计文档

本目录包含 Agent Workflow Server 的设计文档。

## 项目简介

基于 **Agent Skills（Open Standard）+ OpenAI Agents SDK** 的工作流引擎，支持 **外部触发器 → Agent → Agent Skills → Tools → 返回结果** 的完整链路。

## 核心特性

- Agent-driven workflow（动态决策，而非静态 DAG）
- Agent Skills（Open Agent Skills / Anthropic-style 标准）
- Skills ≠ Tools（技能 ≠ API）
- OpenAI Agents SDK（原生 Agent / Tool / Memory 支持）
- Job + Step 幂等
- 易部署（Railway / Fly.io）

## 文档索引

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | 系统架构总览 |
| [concepts-agent.md](./concepts-agent.md) | Agent 核心概念 |
| [concepts-skills.md](./concepts-skills.md) | Agent Skills 核心概念 |

## 核心区分

本项目刻意区分：

- **Agent（决策 / 控制面）**
- **Agent Skills（可加载能力模块）**
- **Tools / Services（具体执行接口）**

## License

MIT
