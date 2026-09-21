---
title: pi 设计艺术｜第 10 章：Agent — 循环之上的有状态壳
description: 用受控状态和运行生命周期包装循环，区分厚薄壳。
tags:
  - pi-book
  - pi
  - 状态管理
  - AgentHarness
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch10-agent-class.html'
status: published
id: knowledge.pi-book-ch10
sourceId: knowledge.pi-book-ch10
updatedAt: '2026-09-17'
---
# 第 10 章：Agent — 循环之上的有状态壳

阅读日期：2026-09-14。书中版本基线：核心分析 v0.66.0，作者自述对照 v0.82.1；本笔记未独立验证源码或发行版本。

## 设计问题、机制与取舍

Agent 管消息、订阅者、双队列、取消和重入限制；先归约事件，再串行通知监听者，waitForIdle 等待运行收尾。数组赋值复制与运行状态只读接口减少外部耦合，业务消息通过声明合并扩展。

书中 v0.82.1 的 coding-agent 仍用薄壳 Agent；AgentHarness 是并行演进路径，集成会话/压缩/工具环境，认证经 Models。厚壳区分 SessionStorage 与 SessionRepo，工具增加上下文注入，压缩和分支摘要可重试。它未成为生产默认；便利增加了策略、类型分叉与迁移成本。

来源：[本章原文](https://zhanghandong.github.io/pi-book/ch10-agent-class.html)。这是压缩后的原创读书笔记，完整论证、示例及版本说明请回到原章。

## 工程应用检查（整理者推导）

为本地知识助手设计状态时，把“模型仍在运行”“工具还未结束”“回执还未保存”分开，最终完成条件取三者都已结算。监听器顺序要有明确理由；慢速持久化可能延迟界面，但不能为了界面响应就漏掉正式回执。可用一个故意延迟的监听器验证 waitForIdle 的含义。

取消采用协作语义：给工具信号只是通知，实际文件写入可能已经发生，下一步应先查回执而不是直接重试。数组浅复制也不等于深度冻结；测试外部修改消息对象时的影响，避免把 TypeScript readonly 当作运行时隔离。

选型可先用薄壳满足已确认的交互需求，只有需要统一会话生命周期、可替换执行环境和压缩管理时再评估厚壳。把工具接口与上下文供应方式写清，防止两条 API 路径混装。上述为整理者应用推导，未独立核实书中采用状态或运行 pi 测试。
