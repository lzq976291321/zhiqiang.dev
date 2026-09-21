---
title: pi 设计艺术｜第 18 章：Model Registry — 模型不只是一个 ID
description: 模型能力数据、静态与动态目录、ModelRuntime 及兼容层。
tags:
  - pi-book
  - pi
  - 模型目录
  - ModelRuntime
  - 模型兼容
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch18-model-registry.html'
status: published
id: knowledge.pi-book-ch18
sourceId: knowledge.pi-book-ch18
updatedAt: '2026-09-17'
---
# 模型选择需要完整运行时信息

来源：[第 18 章原文](https://zhanghandong.github.io/pi-book/ch18-model-registry.html)。阅读日期：2026-09-14。本章作者声明对照 v0.82.1，并讨论 v0.80.x 破坏性调整；未独立核验源码。

## 章节提炼

Model 包含 provider、协议、端点、价格、窗口、输入类型和思考档位。静态目录按 provider 拆分；动态目录由 ModelsStore 缓存并以 ETag 条件刷新。models.json 及扩展提供覆盖。ModelRuntime 成为异步门面，ModelRegistry 保留同步兼容投影，刷新须 await。compat 描述协议细差；thinkingLevelMap 映射合法档位。能列出模型不等于调用可用。

## 工程应用检查（整理者推导）

- 模型配置页分别展示目录来源、更新时间、凭证状态和实际调用验证时间，避免一个“可用”标签混淆不同事实。
- 对私有网关建立最小兼容样例：工具调用、流式结束、usage、角色、上下文上限和思考参数；不要只用普通文本成功响应验收。
- 以 provider 与模型 ID 组成键，避免同名模型跨服务碰撞。费用统计同时记录实际路由，便于解释价格差异。
- 刷新失败时明确标注缓存仍在使用，保留最后成功版本；后台刷新不应让当前已选择模型无说明地变成另一份定义。
