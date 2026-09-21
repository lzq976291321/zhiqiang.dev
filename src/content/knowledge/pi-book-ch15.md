---
title: pi 设计艺术｜第 15 章：Extension 系统 — 让产品长出新器官
description: 扩展的注册阶段、运行阶段、状态恢复及同进程边界。
tags:
  - pi-book
  - pi
  - Extension
  - 生命周期
  - 可扩展架构
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch15-extensions.html'
status: published
id: knowledge.pi-book-ch15
sourceId: knowledge.pi-book-ch15
updatedAt: '2026-09-17'
---
# 扩展能力与内核边界

来源：[第 15 章原文](https://zhanghandong.github.io/pi-book/ch15-extensions.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

扩展工厂注册事件、工具、命令、UI 和 provider。Loader 串行装载；注册期 action 是抛错 stub，bindCore 后才可操作会话。观察事件与可返回干预结果的事件分开。重载会丢闭包状态，持久数据需从 entries 恢复。会话替换后使用 withSession 的新 ctx。公开接口不开放循环实现和历史改写，但扩展同进程运行，没有沙箱。新版支持完整 provider 和动态工具。

## 工程应用检查（整理者推导）

- 在插件开发模板中分离声明注册与实际副作用，启动时验证“尚未就绪”的调用是否显式失败，避免静默丢消息。
- 为计数器、缓存、订阅等状态标记生命周期：一次调用、一个会话、进程或持久化。只在闭包里保存的状态不能承诺跨重载恢复。
- 对会话切换使用新的上下文句柄；增加旧句柄误用测试，避免异步回调把结果写回已离开的会话。
- 把“公开 API 不提供某操作”与“运行时无法做某操作”分开评估。同进程代码仍需受信任，接口类型不是隔离机制。
