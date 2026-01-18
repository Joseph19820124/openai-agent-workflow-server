# Agent Skills 核心概念

## 什么是 Agent Skills？

**Agent Skills（Open Agent Skills）是：**

> 一种 **可加载的能力模块（Capability Package）**，用于教会 Agent **"如何完成一类任务"**。

## Skill 的组成

每个 Skill 通常包含：

| 组成部分 | 说明 |
|----------|------|
| Skill 指令 | instruction / policy |
| 示例 | few-shot / pattern |
| 行为约束 | do / don't |
| 工具使用指南 | 可选，指导如何使用相关 Tools |

## 关键区分

> **Agent Skills 不是 API、不是函数、不是 Tool 实现。**

这一点非常重要：

| 概念 | 本质 | 示例 |
|------|------|------|
| Agent Skills | 知识/策略/模式 | "如何做 Code Review" |
| Tools | 执行接口 | `github.createPR()` |

## Skills vs Tools 对比

```text
Skills = "知道怎么做"（Knowledge）
Tools  = "能够做"（Capability）
```

Agent 通过加载 Skills 获得"知识"，通过调用 Tools 执行"动作"。

## 设计理念

Agent Skills 采用 Open Agent Skills / Anthropic-style 标准，强调：

- **可组合性**：多个 Skills 可以组合使用
- **可复用性**：同一 Skill 可被不同 Agent 加载
- **声明式**：描述"做什么"而非"怎么实现"
