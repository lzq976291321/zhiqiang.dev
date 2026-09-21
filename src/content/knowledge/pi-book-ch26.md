---
title: pi 设计艺术｜第 26 章：RPC 模式 — pi 作为后端服务
description: 跨进程 RPC 的请求确认、事件流、消息分帧、生命周期与客户端清理。
tags:
  - pi-book
  - pi
  - RPC
  - 事件流
  - 进程通信
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch26-rpc.html'
status: published
id: knowledge.pi-book-ch26
sourceId: knowledge.pi-book-ch26
updatedAt: '2026-09-17'
---
# 第 26 章：RPC 模式 — pi 作为后端服务

来源：[《pi 的设计艺术》第 26 章：RPC 模式 — pi 作为后端服务](https://zhanghandong.github.io/pi-book/ch26-rpc.html)

阅读日期：2026-09-14。书中版本基线：基于 v0.66.0，书中称已对照 v0.82.1。 本条为原创阅读笔记，未独立核验 pi 源码。

## 设计问题与机制

RPC 让外部宿主通过标准输入输出驱动相同会话能力。响应与异步事件分开：prompt 的唯一响应表示预检后的接收情况，执行结果随后由事件传递。关联 ID 用于配对，steer 与 follow-up 保持不同队列语义。

协议层负责 JSON Lines 边界、输出通道纯净和背压。扩展 UI 请求由客户端展示，再凭 ID 返回结果。客户端退出时需结束等待请求。后续增加会话树增量查询、bash 增量输出与摘要重试事件。

## 取舍与版本边界

跨进程增加宿主独立性，也增加序列化、生命周期和兼容成本。这里是 pi 自身 RPC，不等于 MCP。书中对 Node readline 处理 Unicode 分隔符的具体断言，本次未做运行时验证；可采用的契约是明确按 LF 分帧，并测试合法 JSON 字符。

## 工程应用检查（独立推导）

本地 MCP 同样应隔离诊断输出与协议输出，验证碎片输入、合并输入、大消息、客户端关闭、取消和超时。界面区分“已接收”“执行中”“已结束”，不能把成功 ack 显示成任务完成。取消后需清理等待表，避免迟到响应恢复已结束操作。
