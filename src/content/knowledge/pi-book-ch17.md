---
title: pi 设计艺术｜第 17 章：Resource Loader — 一切外部资源的统一入口
description: 统一资源发现入口，同时保留类型差异、来源诊断和显式工作目录。
tags:
  - pi-book
  - pi
  - Resource Loader
  - 资源发现
  - 依赖注入
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch17-resource-loader.html'
status: published
id: knowledge.pi-book-ch17
sourceId: knowledge.pi-book-ch17
updatedAt: '2026-09-17'
---
# 资源统一发现与差异化加载

来源：[第 17 章原文](https://zhanghandong.github.io/pi-book/ch17-resource-loader.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

ResourceLoader 统一 extensions、skills、prompts、themes 入口：reload 异步装载，getter 读最近结果。流程解析配置和路径、启用过滤、加载扩展，再处理文档、主题和上下文；错误集中为 diagnostics。extendResources 与 override 允许扩展和宿主定制。cwd 必填，项目资源受信任门控，上下文候选须是文件。章内通用覆盖规则与第 16 章技能规则冲突，不能视作统一合同。

## 工程应用检查（整理者推导）

- 返回的每个资源都携带来源和实际路径；发生同名冲突时显示胜出者、落败者及选择原因。
- 为不同资源分别建验收条件：代码是否注册完成、文档是否可读、模板变量是否有效、主题是否可回退。统一入口不意味着统一错误处理。
- 新旧资源集合切换时保持一致快照；不要让模型看到新技能描述却仍调用旧工具集合。
- 设计多个会话同时运行的测试，每个绑定不同工作目录。传递显式上下文，才能发现原本被单进程当前目录掩盖的串用问题。
