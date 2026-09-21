---
title: pi 设计艺术｜第 11 章：会话树 — 比“聊天记录”更好的数据模型
description: 会话树如何保存分支、恢复上下文，以及 JSONL 的使用边界。
tags:
  - pi-book
  - pi
  - 会话树
  - JSONL
  - 状态恢复
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch11-session-tree.html'
status: published
id: knowledge.pi-book-ch11
sourceId: knowledge.pi-book-ch11
updatedAt: '2026-09-17'
---
# 会话树与上下文重建

来源：[第 11 章原文](https://zhanghandong.github.io/pi-book/ch11-session-tree.html)。阅读日期：2026-09-14。书中基线：v0.66.0，作者声明已对照 v0.82.1；未独立核验源码。

## 章节提炼

非线性工作需要保留不同尝试。JSONL 保存 header 和带 parentId 的事件；选定叶节点后沿父链重建消息及模型状态。压缩只改变送给模型的上下文，原始事件保留。CustomEntry 存内部数据，CustomMessageEntry 进入模型上下文。tree 在同文件分支，fork/clone 创建新文件。旧格式逐级迁移。RPC 可读树及增量事件。代价是加载索引、持续增长和单进程写入假设。

## 工程应用检查（整理者推导）

- 给自己的访谈室建模时，把“会话身份”“分支位置”“当前展示位置”拆开；不要用一个数组下标同时承担三种语义。
- 恢复测试应比较重启前后的模型输入，包含分支切换、配置变化、连续压缩和扩展状态；仅验证文件可解析不足以证明恢复正确。
- 对原始记录设置独立保留策略。业务记录保留与模型上下文裁剪是两种不同需求，不能共享一个删除按钮。
- 如果以后接入多客户端，先定义写入者和冲突协议。文件能追加，并不能推出任意多个进程可同时安全更新它。
