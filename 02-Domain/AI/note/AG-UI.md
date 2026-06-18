---
title: AG-UI
create_date: 2026-06-16 09:07:40
language: LLM
tags:
  - AI
  - AG-UI
---

## AG-UI
>[!tip] 简短描述

The Agent–User Interaction (AG-UI) Protocol

AG-UI 全称 **Agent User Interaction Protocol**，是一套开源的** Agent 与 UI 界面**之间的交互协议。
## What 它是什么
>[!tip] 它能做什么

AG-UI 是由 CopilotKit 发布的开放、轻量、基于事件的协议，通过标准 HTTP 或可选的二进制通道，以流式方式传输 JSON 事件。它主要用于标准化 AI 智能体与前端应用程序的交互，确保实时同步和高效通信。
## Why 为什么是它
>[!tip] 为什么选择它，它有什么优势，同类软件技术有哪些

当前 AI 应用开发主要面临的一些挑战
- **协议不统一**：每个 AI 服务商（OpenAI、Anthropic、Google 等）都有自己的 API 格式和交互方式
- **实时性要求**：用户期待实时的字符级流式响应，而非等待完整生成
- **状态同步困难**：前后端之间的状态管理缺乏标准化方案
- **工具调用复杂**：智能体需要与外部系统交互，但缺乏统一的接口规范
- **人机协作不畅**：实现 Human-in-the-Loop 工作流需要大量自定义开发

这种碎片化会导致开发者在和多个 AI 服务对接或构建复杂 AI 应用时重写大量代码。

AG-UI 的出现，统一前端应用和后端 Agent 之间的交互格式，做到前后端解耦，让大家各司其职。

与 mcp 和 A 2 A 一起构成了 Agent 交互协议栈

![The Agent Protocol Stack](the-agent-protocol-stack.jpg)

- MCP：定义了 Agent/LLM 去调用外部 Tools 时的协议规范
- A 2 A：定义了 Agent 与 Agent 之间的通信协议规范
- AG-UI：补充了 Agent 与 Users（即前端应用）之间的通信规范

## How 基本使用
>[!tip] quick start 步骤，常用的命令方法等

## Deep 深入更解
>[!tip] 深入项目架构、源码等

## Reference 引用参考
>[!tip] 参考链接、资料等

- [AG-UI Protocol](https://docs.ag-ui.com/)