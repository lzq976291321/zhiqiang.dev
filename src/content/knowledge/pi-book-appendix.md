---
title: pi 设计艺术｜附录：类型索引、请求链路与版本纠错
description: 覆盖附录 A–F，保留类型、模式、请求和压缩链路的导航，并注明与第4/8/9章不一致的旧接口和循环描述。
tags:
  - pi-book
  - pi
  - AgentEvent
  - Compaction
  - 类型索引
  - 版本差异
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/appendix.html'
status: published
id: knowledge.pi-book-appendix
sourceId: knowledge.pi-book-appendix
updatedAt: '2026-09-17'
---
# 附录：把类型、事件和功能入口连起来

来源：[原书附录 A–F](https://zhanghandong.github.io/pi-book/appendix.html)。阅读日期：2026-09-14。本文为阅读笔记，原文观点与整理者推导分开记录；未独立核验 pi-mono 源码或发行记录。
附录末尾仍标 v0.66.0，正文部分条目已混入后续版本，不能视为统一的新版本 API 清单。

## A–F 来源要点

- A 类型：调用层描述模型、上下文、事件和用量；循环层描述消息、工具、配置及状态；产品层组合会话、设置、Skill 和 Extension。
- B 模式：显式集合装配、调用边界变换、事件流、会话追加树、可替换 I/O、轻量 UI 接口。
- C 请求：先变换内部上下文，再转换 LLM 消息，随后调用模型、执行工具；事件连接 UI 与持久化。
- D 压缩：本地识别 `/compact`，调用产品层生成摘要，追加压缩记录，重建上下文后通知 UI；历史记录仍保留。
- E 入口：以要改变的能力定位模块，例如工具与命令扩展、消息转换、压缩策略和宿主适配。
- F 术语：区分循环、会话、工具、扩展、Skill、Provider、流与上下文变换，避免混用职责。

## 与正文对照后必须保留的差异

[第 4 章](https://zhanghandong.github.io/pi-book/ch04-provider-registry.html)说明 v0.80.0 后采用显式 `Models` / `Provider` 装配，旧全局注册 API 进入兼容入口。附录 E 的 `registerApiProvider()` 与 `registerOAuthProvider()` 不能直接当作新接口指南。

[第 8 章](https://zhanghandong.github.io/pi-book/ch08-agent-loop.html)说明内层处理工具续轮与 steering，外层在准备结束时处理 follow-up。附录 B 对两层循环的简写与此不一致，理解时以完整流程为依据。

[第 9 章](https://zhanghandong.github.io/pi-book/ch09-tool-execution.html)把 prepare 展开为查找、参数预处理、校验和前置钩子；finalize 包括后置钩子及结果事件。不能只凭附录简写，就认为引擎自带资源回收、授权或所有输出截断策略。

附录的 mom/pods 章节号仍是 28/29；当前[在线目录](https://zhanghandong.github.io/pi-book/toc.html)为 29/30。

## 工程应用检查（整理者推导）

追踪一次真实请求时分别核对运行事件、持久化记录和下一次模型实际收到的消息。观察到事件不等于数据已经保存；摘要写入成功也不等于上下文已完成重建。为失败、取消、分支切换准备可复现样例，再决定采用哪些附录模式。
