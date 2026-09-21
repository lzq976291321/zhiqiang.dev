---
title: pi 设计艺术｜第 19 章：工具设计原则 — 约束即保护
description: 结构化参数、解码约束、输出预算与可替换 I/O。
tags:
  - pi-book
  - pi
  - 工具设计
  - Schema
  - 受约束采样
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch19-tool-principles.html'
status: published
id: knowledge.pi-book-ch19
sourceId: knowledge.pi-book-ch19
updatedAt: '2026-09-17'
---
# 将高频动作做成有界工具

来源：[第 19 章原文](https://zhanghandong.github.io/pi-book/ch19-tool-principles.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

六个结构化工具加 bash 覆盖常用操作。参数先兼容转换、再 schema 校验，wrapper 注入产品上下文。工具按名称启用、按 cwd 构造，Operations 隔离 I/O。输出同时限行数和字节，并附截断信息；读取保留头部，命令倾向尾部。constrainedSampling 可请求严格 schema 或文法。章内 require 失败与通用降级描述不一致，须核验模型能力及拒绝语义。

## 工程应用检查（整理者推导）

- 知识库 MCP 的参数围绕业务动作设计，如保存笔记、更新版本，而不是直接暴露任意路径写文件。
- 错误应返回可恢复的信息：哪个字段无效、是否已有同名项、当前版本是什么；避免模型只能从一串进程日志里猜原因。
- 输出被截断时给下一步读取位置和完整对象标识。限制大小的同时保留继续工作的路径。
- 严格输出只能减少格式错误，不能证明动作正确或得到授权。业务校验和版本冲突检查仍需留在服务端。
- 分别测 provider 支持、不支持及错误声明能力的情况，确认强制约束不会悄悄降级。
