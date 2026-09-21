---
title: pi 设计艺术｜第 27 章：SDK — 把 pi 当库用
description: 同进程 SDK 与 RPC 的边界，显式依赖、ModelRuntime 迁移及嵌入式会话验证。
tags:
  - pi-book
  - pi
  - SDK
  - 嵌入式Agent
  - 依赖注入
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch26b-sdk.html'
status: published
id: knowledge.pi-book-ch27
sourceId: knowledge.pi-book-ch27
updatedAt: '2026-09-17'
---
# 第 27 章：SDK — 把 pi 当库用

来源：[《pi 的设计艺术》第 26b 章：SDK — 把 pi 当库用](https://zhanghandong.github.io/pi-book/ch26b-sdk.html)

阅读日期：2026-09-14。书中版本基线：SDK 路径从 v0.66.1 时期逐步成型，书中称已对照 v0.82.1。 本条为原创阅读笔记，未独立核验 pi 源码。

编号说明：本条按在线目录第 27 章编号；原文标题仍为第 26b 章，文件名沿用旧编号。

## 设计问题与机制

SDK 允许 Node 宿主同进程创建 AgentSession，直接订阅事件和调用方法；RPC 则跨进程传输交互。显式目录、会话依赖和工具名单，让多个会话能够分别配置。

工厂提供默认资源发现和持久化，也可指定内存会话、工具及底层依赖装配。v0.80.8 将模型与认证入口统一为异步 ModelRuntime，旧 authStorage/modelRegistry 工厂选项已移除。评测 harness 是另一消费者，用真实嵌入路径检查接口并清理运行资源。

## 取舍与版本边界

SDK 减少通信样板，却共享宿主进程；RPC 的进程边界也不自动等于安全沙箱。本条按在线目录编号 27，原文和文件名仍为 26b。旧 SDK 示例不能与新 ModelRuntime 入口混用；本次没有验证包的当前导出。

## 工程应用检查（独立推导）

评估引入 Agent 时，可在临时工作目录制作最小消费者，验证事件、取消、资源释放及会话恢复。两个会话应测试目录、模型和工具是否串用。共享服务需明确可变状态归属；内存会话适合短任务，但需要恢复的业务结果仍应有正式存储。
