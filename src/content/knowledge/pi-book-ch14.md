---
title: pi 设计艺术｜第 14 章：System Prompt 是一套装配流程
description: 将提示词发现与装配分开，保留来源、能力边界和缓存稳定性。
tags:
  - pi-book
  - pi
  - System Prompt
  - 提示词装配
  - 缓存
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch14-system-prompt.html'
status: published
id: knowledge.pi-book-ch14
sourceId: knowledge.pi-book-ch14
updatedAt: '2026-09-17'
---
# 把提示词当作可检查的构建结果

来源：[第 14 章原文](https://zhanghandong.github.io/pi-book/ch14-system-prompt.html)。阅读日期：2026-09-14。书中基线：v0.66.0，对照 v0.82.1；未独立核验源码。

## 章节提炼

buildSystemPrompt 消费预加载输入，不自行发现文件。顺序为基础提示词、追加文本、项目上下文、技能目录、cwd。自定义基础会失去默认工具指引；环境信息仍追加。项目文本用带来源路径的 XML 边界；技能只给元数据，依赖 read 按需展开。资源变化需重载。新版要求显式 cwd，并移除日期以稳定缓存前缀。拼接增加长度与排查成本。

## 工程应用检查（整理者推导）

- 给知识库 Agent 留一个本地诊断出口，展示最终提示词各片段的来源、长度和生成时间；避免为了排查问题再反向猜测字符串来源。
- 测试工具被禁用、技能目录为空、自定义基础启用等组合，检查提示词是否仍然推荐一个实际上不可调用的能力。
- 将动态信息放到明确的输入区，并测量不同放置位置的真实缓存命中率；不要把特定 provider 的缓存行为泛化成所有模型的定律。
- 来源标记改善可追溯性，但 XML 和拼接先后都不等同于安全权限校验。文档内容应在装配之前完成信任判断。
