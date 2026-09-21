---
title: pi 设计艺术｜第 23 章：find 和 grep — 结构化搜索替代万能 bash
description: 用专用工具区分文件名与内容检索，明确搜索范围、忽略规则和截断边界。
tags:
  - pi-book
  - pi
  - 检索
  - 结构化工具
  - 输出截断
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch23-search-tools.html'
status: published
id: knowledge.pi-book-ch23
sourceId: knowledge.pi-book-ch23
updatedAt: '2026-09-17'
---
# 第 23 章：find 和 grep — 结构化搜索替代万能 bash

来源：[《pi 的设计艺术》第 23 章：find 和 grep — 结构化搜索替代万能 bash](https://zhanghandong.github.io/pi-book/ch23-search-tools.html)

阅读日期：2026-09-14。书中版本基线：基于 v0.66.0，书中称已对照 v0.82.1。 本条为原创阅读笔记，未独立核验 pi 源码。

## 设计问题与机制

将文件名检索与内容检索拆成独立工具，可把平台参数、忽略规则和输出规模变成稳定契约。find 返回路径，grep 返回位置及文本，因此采用不同默认数量限制。grep 还有单行长度和总字节上限，并提示命中数耗尽或文本被裁剪。

默认检索使用 fd、ripgrep；后者解析 JSON 事件流以支持取消。路径型 glob、嵌套仓库边界及短横线开头的模式，都需正确处理。搜索受忽略规则影响，结果为空不证明所有磁盘内容都没有匹配。

## 取舍与版本边界

专用工具减少拼命令出错，却增加选择和查找被忽略内容的成本。本章仍有“由 system prompt 指引选择工具”的旧描述，与第 22 章关于 v0.77.0 移除此类硬指引的说明不完全一致。默认后端和替换后端也不能假定实现相同。

## 工程应用检查（独立推导）

知识库搜索应返回文档标识、片段及命中位置，再读取验证上下文。检查字面量与正则、中文、空结果、数量上限、长行、忽略文件和取消。响应适合包含实际搜索范围与截断标记，避免把“没有搜索到”误写成“资料不存在”。
