---
title: pi 设计艺术｜第 13 章：三级配置覆盖
description: 区分配置覆盖、规则拼接、提示词替换和项目信任。
tags:
  - pi-book
  - pi
  - 配置管理
  - Project Trust
  - 作用域
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch13-config-layers.html'
status: published
id: knowledge.pi-book-ch13
sourceId: knowledge.pi-book-ch13
updatedAt: '2026-09-17'
---
# 配置来源、合并语义与信任

来源：[第 13 章原文](https://zhanghandong.github.io/pi-book/ch13-config-layers.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

settings 以项目覆盖全局，数组替换，CLI 临时覆盖不落盘；默认值留在 getter。AGENTS 按目录拼接，SYSTEM 替换基础提示词，APPEND_SYSTEM 追加。保存加锁并追踪修改字段，重载等待写队列。Project Trust 决定项目资源是否加载，信任记录存全局。注意章内“递归合并”的文字与单层展开的简化代码不完全对应，深层行为待源码核验。

## 工程应用检查（整理者推导）

- 管理后台应显示一个值的生效来源和编辑目标，例如“个人默认”“当前项目覆盖”“本次临时设置”，减少误改全局的机会。
- 为每类数据单独定义合并合同：数组是替换还是追加，空值是清除还是继承，嵌套对象合并到哪层。用两级以上嵌套和空数组验证。
- 项目能提供配置，不应同时有权声明自身可信；授权记录放在项目无法自我修改的位置。
- 把加载失败和配置未启用显示为不同状态。继续运行的降级策略若没有可见诊断，会让用户误以为规则已经生效。
