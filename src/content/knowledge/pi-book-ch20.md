---
title: pi 设计艺术｜第 20 章：edit 的设计 — 为什么不能直接写文件
description: 局部替换的唯一性、原文基准、模糊匹配及写入队列边界。
tags:
  - pi-book
  - pi
  - edit
  - 文件编辑
  - 并发控制
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch20-edit-tool.html'
status: published
id: knowledge.pi-book-ch20
sourceId: knowledge.pi-book-ch20
updatedAt: '2026-09-17'
---
# 对原文做可验证的局部修改

来源：[第 20 章原文](https://zhanghandong.github.io/pi-book/ch20-edit-tool.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

edits 数组都匹配原始文件，要求唯一、不重叠，再从后向前替换。处理 BOM 与行尾，先精确匹配，再做有限归一化匹配；新版保留未修改行块。结果提供展示 diff 和标准 patch。真实路径对应的 Promise 队列串行同文件操作。prepareArguments 兼容旧字段，并将以 JSON 字符串传入的 edits 解析回数组。示例拒绝额外字段与末尾新版容错说明存在差异。大改动仍可能适合整体写入。

## 工程应用检查（整理者推导）

- 保留本地知识库的 expectedVersion 校验：进程内队列不能阻止编辑器或另一个进程同时改文件，唯一片段匹配也不是完整版本检查。
- 用重复片段、相交区间、相邻区间、符号链接、失败后续写测试替换器，并核对未改区域的字节是否保持一致。
- 对模糊匹配返回明确标记和差异，防止“容忍格式差异”演变为无声地扩大编辑范围。
- 区分编辑算法的全部验证通过与磁盘落盘成功；持久化应考虑临时文件、原子替换及失败恢复。
- 不把命中一段原文视作选对文件的证明；保存回执仍应给出目标路径与版本，便于用户核查。
