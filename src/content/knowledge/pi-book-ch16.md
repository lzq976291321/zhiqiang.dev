---
title: pi 设计艺术｜第 16 章：Skill 机制 — 用文档替代代码
description: 技能的发现、延迟读取、显式触发以及与 MCP 的职责划分。
tags:
  - pi-book
  - pi
  - Skills
  - MCP
  - 渐进加载
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch16-skills.html'
status: published
id: knowledge.pi-book-ch16
sourceId: knowledge.pi-book-ch16
updatedAt: '2026-09-17'
---
# 用文档表达方法，用工具提供能力

来源：[第 16 章原文](https://zhanghandong.github.io/pi-book/ch16-skills.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

Skill 是带 frontmatter 的文档，没有执行接口。发现时识别 SKILL.md 根、根级 Markdown 和子目录，处理忽略规则、名称冲突及真实路径去重。提示词只放名称、描述、位置，正文按需读；disable-model-invocation 隐藏自动发现，保留显式命令。文中技能重名采用先加载者胜出。Skill 描述方法，MCP 提供调用接口，Extension 改变宿主行为；指令遵循没有机械保证。

## 工程应用检查（整理者推导）

- 知识笔记与 Skill 分开：前者回答“依据是什么”，后者指导“这一类任务怎么做”。只有稳定、反复使用的方法才适合提升为 Skill。
- description 写清触发条件和产物，配一组应该触发及不应该触发的任务，观察误命中与漏命中。
- 纯文本仍能诱导已有工具执行；不接受原章“零风险”的概括。文档被读取与动作得到授权是两件事。
- 第 17 章的通用覆盖说法与本章技能规则有冲突，落地前用同名全局、项目、包内技能验证目标版本，记录实际胜出路径。
