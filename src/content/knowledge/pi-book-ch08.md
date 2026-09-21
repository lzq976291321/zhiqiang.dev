---
title: pi 设计艺术｜第 08 章：agentLoop — 发动机只管转
description: 分离循环调度、转向消息和产品策略。
tags:
  - pi-book
  - pi
  - AgentLoop
  - Steering
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch08-agent-loop.html'
status: published
id: knowledge.pi-book-ch08
sourceId: knowledge.pi-book-ch08
updatedAt: '2026-09-17'
---
# 第 08 章：agentLoop — 发动机只管转

阅读日期：2026-09-14。书中版本基线：核心分析 v0.66.0，作者自述对照 v0.82.1；本笔记未独立验证源码或发行版本。

## 设计问题、机制与取舍

内层处理模型、工具和 steering，外层仅在原本结束时接 follow-up。消息先由 transformContext 调整，再经 convertToLlm 收敛。失败响应退出；整批工具都要求 terminate 才抑制工具续轮；prepareNextTurn 可换配置，shouldStopAfterTurn 再决定优雅停止。

底层 streamFunction 必填；公共入口可使用宿主注入默认值。循环不持有跨运行状态，也不负责持久化、重试或压缩策略。它会修改传入消息数组并调用外部函数，故“无状态”不等于严格纯函数。多数内部回调须不抛错，工具钩子另有防御处理。

来源：[本章原文](https://zhanghandong.github.io/pi-book/ch08-agent-loop.html)。这是压缩后的原创读书笔记，完整论证、示例及版本说明请回到原章。

## 工程应用检查（整理者推导）

为知识整理任务明确三个控制点：立即中止是取消正在运行的调用；修改要求是在下一轮接收 steering；新增任务是在当前任务完成时消费 follow-up。保存状态与用户消息之间的顺序应写成验收用例，避免一句“先别公开”排到全部发布操作之后才被读取。

可以用假的流函数返回两轮响应：第一轮提出搜索，第二轮提出保存。搜索结束时注入用户新要求，再观察第二轮的请求上下文，验证补充确实影响后续动作。另测工具批次中只有一个 terminate 的情况，不能把任意一个工具的结束提示当成整个任务结束。

运行预算和恢复规则由外层明确提供，并记录停止原因。对时长较大的回调传入取消信号，测试取消期间没有再启动昂贵的新请求。不要从“可插拔”推断已经具有持久执行或崩溃恢复能力；这些是整理者迁移到产品的检查。
