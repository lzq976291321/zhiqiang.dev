---
title: pi 设计艺术｜第 12 章：Compaction — 把无限对话装进有限窗口
description: 上下文压缩的预算、合法切点、结构化记忆与失败恢复。
tags:
  - pi-book
  - pi
  - 上下文压缩
  - Compaction
  - 上下文工程
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch12-compaction.html'
status: published
id: knowledge.pi-book-ch12
sourceId: knowledge.pi-book-ch12
updatedAt: '2026-09-17'
---
# 有损压缩如何保持任务连续

来源：[第 12 章原文](https://zhanghandong.github.io/pi-book/ch12-compaction.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

预算采用最近 usage 加尾部估算，接近窗口时保留近期消息、摘要较早消息。切点不能孤立 toolResult；跨轮切分另做前缀摘要。prepare 负责整理，compact 调模型。文件操作单独累积，旧摘要参与更新；重复压缩从上次保留边界起算。摘要作为事件持久化，支持扩展接管、重试和费用统计。新版摘要隔离路由、关闭缓存写入。压缩有成本且会丢细节。

## 工程应用检查（整理者推导）

- 用包含中文、代码、长工具结果和图片的真实样本校准预算；固定字符比例不应直接当成保证不会低估的上界。
- 建立“压缩后继续任务”的验收集，检查用户约束、未完成事项、决策理由及文件位置是否仍能正确恢复。更新旧摘要也需要质量回归，不能假定长期无损。
- 失败时保留上一份可用上下文和本次候选结果，明确区分模型生成成功与压缩结果正式生效，避免重试重复提交。
- 根据领域选择必须结构化保存的事实，例如文稿版本、证据来源和待确认项；不要只依赖一段自然语言概括。
