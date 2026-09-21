---
title: pi 设计艺术｜全书知识索引与阅读核对
description: 覆盖在线 33 章、前言和附录的知识库总索引，串联设计原则、章节入口、版本差异与工程应用。
tags:
  - pi-book
  - pi
  - Agent架构
  - 知识索引
  - 全书
  - 版本差异
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/preface.html'
status: published
id: knowledge.pi-book-index
sourceId: knowledge.pi-book-index
updatedAt: '2026-09-17'
---
# pi 的设计艺术：全书知识索引

原书：[张汉东《pi 的设计艺术：构建生产级 Coding Agent 的架构决策》](https://zhanghandong.github.io/pi-book/preface.html)；[作者仓库](https://github.com/ZhangHanDong/pi-book)。

阅读日期：2026-09-14。已按[在线目录](https://zhanghandong.github.io/pi-book/toc.html)阅读 **33 个编号章节、前言、附录，共 35 个内容页面**，整理为 35 条分篇笔记，加本索引共 36 条。附录 A–F 均包含在附录笔记中。

每篇提炼设计问题、关键机制、取舍与版本边界，另列明确标注的工程应用检查。笔记保留原章链接，原文代码、图示和完整论证仍以原章为准。本次整理没有把书中案例写成站点主人的项目经历，也不表示博客已经采用 pi。

## 主线与阅读方向

以下是跨章整理，帮助选择后续阅读；不是作者提出的强制实施流程。

| 需要解决的问题 | 先读哪些笔记 |
| --- | --- |
| 怎样判断包与模块的边界 | 01–03 |
| 怎样描述模型、协议、认证和消息 | 04–07、18 |
| 工具执行后怎样继续、转向或停止 | 08–10 |
| 怎样保留历史、恢复分支、压缩上下文 | 11–12 |
| 配置和提示词怎样组装、生效、定位来源 | 13–14、17 |
| Skill、Extension、MCP 各自承担什么 | 15–16、32 |
| 文件和命令工具怎样控制输入、输出及修改范围 | 19–23 |
| 相同能力怎样接入终端、编辑器、RPC、SDK | 24–27 |
| 历史 Web、Slack 和模型供给案例能借鉴什么 | 28–30 |
| 哪些机制值得引入，哪些成本应保留在宿主 | 31–33 |

## 章节入口

编号按在线目录。SDK 是第 27 章，原页面叫 26b；其后部分 H1 和文件名保留旧编号，笔记已注明映射。

| 编号 | 本地知识笔记 | 原始来源 |
| --- | --- | --- |
| 前言 | [阅读准备与版本基线](./pi-book-preface.md) | [原文](https://zhanghandong.github.io/pi-book/preface.html) |
| 01 | [不是又一个 LLM 包装器](./pi-book-ch01.md) | [原文](https://zhanghandong.github.io/pi-book/ch01-prologue.html) |
| 02 | [包不是项目](./pi-book-ch02.md) | [原文](https://zhanghandong.github.io/pi-book/ch02-packages.html) |
| 03 | [怎样高效阅读这个仓库](./pi-book-ch03.md) | [原文](https://zhanghandong.github.io/pi-book/ch03-reading-map.html) |
| 04 | [Provider 不是 Adapter](./pi-book-ch04.md) | [原文](https://zhanghandong.github.io/pi-book/ch04-provider-registry.html) |
| 05 | [消息变换 — 跨模型交接的隐藏复杂度](./pi-book-ch05.md) | [原文](https://zhanghandong.github.io/pi-book/ch05-message-transform.html) |
| 06 | [统一事件流设计](./pi-book-ch06.md) | [原文](https://zhanghandong.github.io/pi-book/ch06-event-stream.html) |
| 07 | [认证是一等子系统](./pi-book-ch07.md) | [原文](https://zhanghandong.github.io/pi-book/ch07-oauth.html) |
| 08 | [agentLoop — 发动机只管转](./pi-book-ch08.md) | [原文](https://zhanghandong.github.io/pi-book/ch08-agent-loop.html) |
| 09 | [工具执行不是插件调用](./pi-book-ch09.md) | [原文](https://zhanghandong.github.io/pi-book/ch09-tool-execution.html) |
| 10 | [Agent — 循环之上的有状态壳](./pi-book-ch10.md) | [原文](https://zhanghandong.github.io/pi-book/ch10-agent-class.html) |
| 11 | [会话树 — 比“聊天记录”更好的数据模型](./pi-book-ch11.md) | [原文](https://zhanghandong.github.io/pi-book/ch11-session-tree.html) |
| 12 | [Compaction — 把无限对话装进有限窗口](./pi-book-ch12.md) | [原文](https://zhanghandong.github.io/pi-book/ch12-compaction.html) |
| 13 | [三级配置覆盖](./pi-book-ch13.md) | [原文](https://zhanghandong.github.io/pi-book/ch13-config-layers.html) |
| 14 | [System Prompt 是一套装配流程](./pi-book-ch14.md) | [原文](https://zhanghandong.github.io/pi-book/ch14-system-prompt.html) |
| 15 | [Extension 系统 — 让产品长出新器官](./pi-book-ch15.md) | [原文](https://zhanghandong.github.io/pi-book/ch15-extensions.html) |
| 16 | [Skill 机制 — 用文档替代代码](./pi-book-ch16.md) | [原文](https://zhanghandong.github.io/pi-book/ch16-skills.html) |
| 17 | [Resource Loader — 一切外部资源的统一入口](./pi-book-ch17.md) | [原文](https://zhanghandong.github.io/pi-book/ch17-resource-loader.html) |
| 18 | [Model Registry — 模型不只是一个 ID](./pi-book-ch18.md) | [原文](https://zhanghandong.github.io/pi-book/ch18-model-registry.html) |
| 19 | [工具设计原则 — 约束即保护](./pi-book-ch19.md) | [原文](https://zhanghandong.github.io/pi-book/ch19-tool-principles.html) |
| 20 | [edit 的设计 — 为什么不能直接写文件](./pi-book-ch20.md) | [原文](https://zhanghandong.github.io/pi-book/ch20-edit-tool.html) |
| 21 | [read 的设计 — 为什么不是简单的 cat](./pi-book-ch21.md) | [原文](https://zhanghandong.github.io/pi-book/ch21-read-tool.html) |
| 22 | [bash 与外部世界的边界](./pi-book-ch22.md) | [原文](https://zhanghandong.github.io/pi-book/ch22-bash-tool.html) |
| 23 | [find 和 grep — 结构化搜索替代万能 bash](./pi-book-ch23.md) | [原文](https://zhanghandong.github.io/pi-book/ch23-search-tools.html) |
| 24 | [pi-tui — 在终端里做应用](./pi-book-ch24.md) | [原文](https://zhanghandong.github.io/pi-book/ch24-tui.html) |
| 25 | [编辑器组件 — 交互复杂度的集中地](./pi-book-ch25.md) | [原文](https://zhanghandong.github.io/pi-book/ch25-editor.html) |
| 26 | [RPC 模式 — pi 作为后端服务](./pi-book-ch26.md) | [原文](https://zhanghandong.github.io/pi-book/ch26-rpc.html) |
| 27 | [SDK — 把 pi 当库用](./pi-book-ch27.md) | [原文](https://zhanghandong.github.io/pi-book/ch26b-sdk.html) |
| 28 | [pi-web-ui — 浏览器里的复用](./pi-book-ch28.md) | [原文](https://zhanghandong.github.io/pi-book/ch27-web-ui.html) |
| 29 | [mom — Slack 里的 Coding Agent](./pi-book-ch29.md) | [原文](https://zhanghandong.github.io/pi-book/ch28-mom-slack.html) |
| 30 | [pods — 为什么这个仓库还要管 GPU](./pi-book-ch30.md) | [原文](https://zhanghandong.github.io/pi-book/ch29-pods-gpu.html) |
| 31 | [极简核心，能力外置](./pi-book-ch31.md) | [原文](https://zhanghandong.github.io/pi-book/ch30-minimal-core.html) |
| 32 | [反主流选择背后的判断](./pi-book-ch32.md) | [原文](https://zhanghandong.github.io/pi-book/ch31-contrarian-choices.html) |
| 33 | [这套架构的适用边界](./pi-book-ch33.md) | [原文](https://zhanghandong.github.io/pi-book/ch32-boundaries.html) |
| 附录 | [类型、模式、请求链路、压缩追踪、扩展入口与术语](./pi-book-appendix.md) | [原文](https://zhanghandong.github.io/pi-book/appendix.html) |

## 使用这些知识时保留的版本边界

[前言](https://zhanghandong.github.io/pi-book/preface.html)自述核心分析基于 v0.66.0，并对照 v0.82.1；各章并非统一快照。本次没有固定原仓库 commit，也没有逐行验证 pi-mono 源码或重新测试作者的发行版本声明。

- 第 4、7、18 章讨论 v0.80.x 后的显式 Models、Provider 和认证装配；附录及第 33 章仍有旧全局注册 API。
- 第 28–30 章的 Web UI、mom、pods 以章首限定的 v0.66.1 历史快照解释。它们已移出主仓库的说法来自各章，不能当作当前包目录。
- 第 31–33 章及附录仍含 v0.66.0 标记；框架功能、费用、性能和工时比较都是材料中的条件判断，不是本次独立评测。
- README 的旧章节范围和正文旧 H1 均保留了演化痕迹；本知识库按在线目录编号，避免漏掉独立 SDK 章。

## 阅读时识别的差异

这里记录需要复核的文本或简化代码差异，**不把它们直接判定为 pi 实现缺陷**。详情及原文入口位于各章笔记。

| 位置 | 保留的疑点 |
| --- | --- |
| 05 | “完全确定”的描述与示例中动态时间字段需要区分 |
| 06 | 无参结束、最终结果 Promise、内存 partial 与持久恢复不能混为一谈 |
| 08、附录 | 无跨运行状态并不等于严格纯函数；两层循环职责按正文完整流程理解 |
| 12 | 固定字符比例不是所有文本的保守上界；连续摘要仍可能丢失信息 |
| 13 | 递归合并描述与展示的单层对象展开不能直接等同 |
| 16、17 | Skill 同名优先级与通用资源覆盖规则口径冲突；文档形式不自动保证动作安全 |
| 19 | 强制解码约束与不支持时降级的描述需按目标 provider 核对 |
| 20 | 示例 schema 与版本尾注存在差异；进程内队列不代表跨进程互斥 |
| 22、25、26 | `!!` 的“重复命令”与“排除模型上下文”描述冲突 |
| 24 | 小节把组件接口概括为一个方法，但契约还要求失效处理 |
| 33 | 旧注册接口、fork 建议需先与新版装配、并行配置及停止钩子对照 |

## 转成项目行动的检查（整理者推导）

1. 先写一个真实需求和验收场景，再选择相关章节，避免因架构完整就整体迁移。
2. 分开记录运行状态、工具回执、正式存储和 UI 展示；其中一处成功不能代替其余环节。
3. 区分“模型能看见什么”和“工具获准做什么”，让产品约束进入真实执行路径。
4. 把模型输入视为可重建视图，保留必要事实、来源与版本；对摘要和跨模型转换验证信息损失。
5. 新增消费者时验证共同契约是否足够，再决定拆包、换宿主或增加数据库。
6. 任何借鉴都以当前项目和依赖版本验证收尾，阅读结论不直接成为部署或改代码的指令。

可通过知识库 MCP 提问：“pi 怎样处理 steering 和 follow-up？”“Skill 与 MCP 有何分工？”“压缩为什么要保留原始会话？”“SDK 与 RPC 怎么选？”需要读原始细节时沿各条 sourceUrl 返回原章。

## 来源声明记录

[原仓库 README](https://github.com/ZhangHanDong/pi-book/blob/main/README.md)写 CC BY-NC-SA 4.0，而[LICENSE 文件](https://github.com/ZhangHanDong/pi-book/blob/main/LICENSE)是 MIT，含 Copyright (c) 2026 Alex。两份声明不一致，本条保留该事实，不替原作者作统一授权解释。当前入库内容是带出处的本地草稿笔记。

所有条目当前为 draft；本次整理完成知识收集，没有变更网站的公开发布状态。
