---
title: pi 设计艺术｜第 04 章：Provider 不是 Adapter
description: 区分供应商身份、API 协议和显式运行时装配。
tags:
  - pi-book
  - pi
  - Provider
  - 依赖注入
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch04-provider-registry.html'
status: published
id: knowledge.pi-book-ch04
sourceId: knowledge.pi-book-ch04
updatedAt: '2026-09-17'
---
# 第 04 章：Provider 不是 Adapter

阅读日期：2026-09-14。书中版本基线：核心分析 v0.66.0，作者自述对照 v0.82.1；本笔记未独立验证源码或发行版本。

## 设计问题、机制与取舍

ProviderId 表示厂商，Api 表示协议，两者独立；Model 还携带能力、窗口和费用等信息。v0.80 起 Provider 成为包含认证、模型目录与流方法的对象，createProvider 组装它，Models 实例持有对象并按 model.provider 路由，认证后再按 model.api 分派。

显式集合取代全局副作用注册；SDK/OAuth 仍可延迟加载，独立入口支持按需打包。旧接口留在废弃的 compat 路径。收益是隔离与可测试性，代价是装配和迁移成本；缺少 provider 仍是运行时错误。

来源：[本章原文](https://zhanghandong.github.io/pi-book/ch04-provider-registry.html)。这是压缩后的原创读书笔记，完整论证、示例及版本说明请回到原章。

## 工程应用检查（整理者推导）

把知识助手的模型配置拆成三个可检查对象：厂商身份、协议适配实现、单次任务使用的模型集合。若两个厂商共享协议，不应复制整套消息序列化；若同一厂商提供不同协议，也不应只用厂商名字决定请求格式。

为隔离性设计一次测试：构造两份集合，各注册同名厂商但不同配置；修改第一份之后，第二份的目录和调用目标应保持不变。再验证只导入一家 provider 时实际产物是否仍包含其余 SDK，避免把源码模块化直接等同于打包收益。

认证相关覆盖值应在请求装配层汇合，并返回可排查的厂商、协议和模型标识；日志不记录凭证。升级时建立旧入口清单，逐处迁到显式集合，而不是长期依赖兼容入口。以上是独立工程推导，未运行 pi 源码或验证其最新发行包。
