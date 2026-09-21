---
title: pi 设计艺术｜第 29 章：mom — Slack 里的 Coding Agent
description: 历史 Slack Agent 的频道会话、消息发送队列、日志同步和执行环境适配。
tags:
  - pi-book
  - pi
  - 消息平台
  - 会话隔离
  - 历史架构
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch28-mom-slack.html'
status: published
id: knowledge.pi-book-ch29
sourceId: knowledge.pi-book-ch29
updatedAt: '2026-09-17'
---
# 第 29 章：mom — Slack 里的 Coding Agent

来源：[《pi 的设计艺术》第 28 章：mom — Slack 里的 Coding Agent](https://zhanghandong.github.io/pi-book/ch28-mom-slack.html)

阅读日期：2026-09-14。书中版本基线：章首限定 v0.66.1 历史快照 c779c14e；称包于 2026-04-30 移出，方向性继任为 pi-chat。 本条为原创阅读笔记，未独立核验 pi 源码。

编号说明：本条按在线目录第 29 章编号；原文标题仍为第 28 章，文件名沿用旧编号。

## 设计问题与机制

历史 mom 按 Slack channel 建立 runner 与目录，复用 AgentSession 的历史及压缩能力。全局与频道记忆组合，频道同名 Skill 覆盖全局。产品侧通过资源接口、专属工具和事件订阅适配 Slack。

主消息展示概要，线程记录工具过程；队列维持发送顺序，单频道串行降低上下文冲突。完整日志与模型会话分离，再同步遗漏消息。Host/Docker Executor 适配执行环境，事件文件支持即时、单次与周期触发。

## 取舍与版本边界

消息平台限制与异步交互塑造了产品行为。章首是移出后的历史说明，章尾保留旧版现状。目录分区及 Docker 示例不等于完整多租户安全；全局记忆本来就跨频道共享。

## 工程应用检查（独立推导）

以后接入消息平台，应分别定义用户、频道、任务及知识条目的归属。去重宜使用平台稳定 ID，正文相同可能是两次合法请求。测试重放、离线补消息、取消、附件路径转换和发送失败。定时任务还须与用户授权绑定，不从读到的资料中自动创建安排。
