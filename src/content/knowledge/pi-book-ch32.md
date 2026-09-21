---
title: pi 设计艺术｜第 32 章：反主流选择背后的判断
description: 通过宿主组合子 Agent、MCP、规划和权限策略，保留明确的执行边界。
tags:
  - pi-book
  - pi
  - Agent组合
  - MCP
  - 权限边界
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch31-contrarian-choices.html'
status: published
id: knowledge.pi-book-ch32
sourceId: knowledge.pi-book-ch32
updatedAt: '2026-09-17'
---
# 第 32 章：反主流选择背后的判断

来源：[《pi 的设计艺术》第 31 章：反主流选择背后的判断](https://zhanghandong.github.io/pi-book/ch31-contrarian-choices.html)

阅读日期：2026-09-14。书中版本基线：本章标记 v0.66.0 设计分析；当前生态支持情况未独立核验。 本条为原创阅读笔记，未独立核验 pi 源码。

编号说明：本条按在线目录第 32 章编号；原文标题仍为第 31 章，文件名沿用旧编号。

## 设计问题与机制

作者把子 Agent、MCP、确认 UI 和规划模式视为上层组合能力：工具执行控制动作，调用前钩子决定许可，上下文变换影响模型所见。子 Agent 可嵌在工具里运行；规划需要阶段状态与执行限制配合。

Skill 提供流程知识，Extension 可进入内部事件和 UI，MCP 侧重跨客户端互操作。外置减少核心概念，却将并发、生命周期、桥接和体验责任留给产品。

## 取舍与版本边界

本章概念草图不能直接作为当前 SDK 示例。执行时长不能自动换算 token 成本，嵌套循环也不自动具备隔离。这里“不内建 MCP”讨论的是特定版本的内核分工；互操作需求仍可通过宿主扩展实现。

## 工程应用检查（独立推导）

跨 Codex 和 Claude Code 共用知识库读写工具，正是互操作需求；保存内容与安装运行扩展属于不同操作。规划阶段应由工具权限实际限制写入，不只靠提示词。命令字符串前缀检查无法可靠处理组合 shell、重定向及子命令，不能当作完整权限机制。子任务预算、取消传递和结果归属需要显式记录。
