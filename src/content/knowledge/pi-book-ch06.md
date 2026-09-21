---
title: pi 设计艺术｜第 06 章：统一事件流设计
description: 用流事件统一过程、终止和最终消息。
tags:
  - pi-book
  - pi
  - 事件流
  - 异步协议
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch06-event-stream.html'
status: published
id: knowledge.pi-book-ch06
sourceId: knowledge.pi-book-ch06
updatedAt: '2026-09-17'
---
# 第 06 章：统一事件流设计

阅读日期：2026-09-14。书中版本基线：核心分析 v0.66.0，作者自述对照 v0.82.1；本笔记未独立验证源码或发行版本。

## 设计问题、机制与取舍

流同时提供异步迭代与 result()：队列缓存事件，等待者接收后续投递，终止事件解析最终 AssistantMessage。协议包含开始、文本/思考/工具块的起止增量，以及 done/error；contentIndex 定位内容块，partial 给出累计状态。

失败也应产出消息，由 stopReason 区分正常、截断、工具请求、失败和中止。usage、实际响应模型和诊断辅助观测；传输、请求钩子在稳定事件面之下变化。统一消费的代价是状态机、异步排查和缓存开销，且“不抛错”契约仍需实现者遵守。

来源：[本章原文](https://zhanghandong.github.io/pi-book/ch06-event-stream.html)。这是压缩后的原创读书笔记，完整论证、示例及版本说明请回到原章。

## 工程应用检查（整理者推导）

为聊天页面定义三个不同概念：内容块结束、模型调用结束、整次任务结束。工具参数生成完并不代表工具已完成；收到模型的 toolUse 终止事件也不代表用户任务结束。UI 可以据此避免过早关闭忙碌状态或把中途文本当作最终答案。

验证断流时要分别检查事件消费者与最终结果等待者，保证两者都能结束。书中 end() 示例只有传入结果才会兑现结果 Promise，因此不能假设调用无参 end() 后 result() 一定返回。对无界队列，模拟慢消费者并观察积压量，再决定是否限制、合并或持久化事件。

如需重放，把必要快照真正写到持久存储；持有 partial 引用不等于进程崩溃后仍能恢复。费用核算要避免再次叠加已经包含在 output 中的推理 token。以上是整理者的验收建议与对代码边界的审读，未实测该实现。
