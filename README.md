# zhiqiang.chat

围绕阅读、陪伴与设计的个人空间。`/knowledge` 按原书脉络整理读书笔记；`/chat` 是 Mori 的陪伴空间，可以聊日常、说说烦心事，也可以只是待一会儿；`/lab` 放屏幕补光灯和 LED 灯牌两个随手用的小工具；`/projects` 以 RC Boat Arena 为首展示可体验的实际作品，完整项目档案位于 `/projects/archive`。

工程文章、MCP 与 Skills 精选已退出公开目录，旧入口跳转到阅读书架；原 `/design-lab` 入口统一跳转到 `/lab`。保留本地知识管理 MCP 与对话技能，它们不属于退役的精选目录。知识库只服务阅读空间，不再进入聊天运行时。

知识阅读页有自己的发布边界：草稿、待发布和低置信度内容不会进入公开目录和阅读页。书架只展示读书系列；已有公开实践笔记保留阅读地址，不再在书架或 sitemap 中推荐。知识条目有独立的 `/knowledge/[slug]` 阅读地址。Mori 的对话不检索站内资料，也不把对话写回知识库。

网站地址：[zhiqiang.chat](https://zhiqiang.chat)。仓库改动和本地验证不代表线上版本已同步。

## 本地开发

```bash
pnpm install
pnpm run dev
```

默认端口：`http://localhost:54129`。

生产预览：

```bash
pnpm run build
pnpm run start
```

部署平台：Vercel。服务端函数区域通过 `vercel.json` 固定为 `sin1`。

## 核心目录

- `src/app/`：首页、兼容路由和 API 入口。
- `src/features/chat/`：Mori 的人格、聊天界面与交互。
- `src/lib/chat/`：伴侣运行时、流式响应、请求校验和问题日志。
- `src/content/profile/`：已确认的个人公开经历和项目事实。
- `src/content/knowledge/`：可持续补充的判断、决策和知识条目。
- `src/features/knowledge/`：阅读书架、全书搜索与章节阅读。
- `src/features/lab/`：屏幕补光灯、LED 灯牌等随手用的小工具。
- `src/features/site/data/projects.ts`：首页和作品页共用的项目资料。
- `src/content/agent/`、`src/content/mcp/`、`src/content/skills/`：保留的历史资料，不再进入公开目录或 Agent 检索。

公开 `/chat` 使用伴侣运行时：只带人格、记忆和当前对话，不检索站内资料。旧的资料问答 Agent 和只读知识工具保留在代码里，供阅读空间或后续功能使用，不进入 Mori 的上下文。

Mori 的人格与表达在 `src/features/chat/server/companion-persona.ts` 中维护：温柔、具体、有分寸，可以不同意，但不为了亲近而附和。她不是真人，也不冒充作者，不编造现实经历；默认不保存对话正文。登录与长期记忆已接入（魔法链接；记忆只保存事实片段，可查看、删除、导出）；未登录时只保留本次标签页的对话。旧的 `sun-ge` 原始材料和版本出处保留供追溯，已退出运行时提示与工具，不作为当前人格或知识来源。修改后需重新构建和部署才在线上生效。

### 持续改进对话

`tools/chat-eval/` 保存固定多轮场景和本地评估工具，直接复用真实 Agent，不写访客日志或数据库。运行时使用本地模型配置，报告只保存在被 Git 忽略的 `.local/chat-eval/`。

```bash
# 在修改前后分别运行同一组场景；默认每个场景重复一次。
pnpm chat:eval run --label baseline --out .local/chat-eval/baseline
pnpm chat:eval run --label candidate --out .local/chat-eval/candidate
pnpm chat:eval compare .local/chat-eval/baseline.json .local/chat-eval/candidate.json --out .local/chat-eval/comparison
```

HTML 报告可以阅读完整对话；对比页隐藏版本名，以随机 A/B 顺序呈现，版本映射单独保存。人工比较自然程度、上下文承接、分寸与事实；耗时和完成状态只用于排障。用 `--cases` 缩小问题范围，用 `--repeat 3` 检查稳定性；未见明确改善时不替换已有版本。命令和场景见 [对话评估工具](tools/chat-eval/README.md)。

## 更新知识

在对应 `src/content/` 目录新增或修改 `.md` / `.mdx` 文件。普通内容优先写 Markdown；同目录下不能同时出现相同文件名的 `.md` 和 `.mdx`，因为它们使用同一个 slug。

独立知识条目放在 `src/content/knowledge/`，可以参考以下格式：

```md
---
id: "your-topic"
title: "知识标题"
description: "这条知识可以回答什么问题。"
tags: ["Agent", "工程实践"]
status: "draft"
confidence: "high"
updatedAt: "2026-09-14"
sourceId: "knowledge.your_topic"
publicPath: "/"
---

# 知识标题

> source id: `knowledge.your_topic`

写下已确认的事实、判断和适用边界。
```

`status` 使用 `draft`、`reviewed`、`published`：前两种不进入公开回答，确认可公开后改为 `published`。`confidence: low` 的内容也不进入公开回答。Profile 没有 `status` 时兼容视为已公开；新知识条目没有状态时按草稿处理。历史 Agent、MCP、Skills 目录不再作为回答来源。

每次实质修改更新 `updatedAt`，保留稳定的 `sourceId`。将大主题拆成清楚的小节，并为重要小节设置独立 `source id`，方便回答引用。内容仍需由人核对；不要把模型补充的个人经历直接写成事实。

修改后运行下方检查，再在本地 `/chat` 用实际问题验证：能否找到新知识、来源是否正确、未覆盖的问题是否明确说明。发布内容需要重新构建和部署，线上会话不会自动更新仓库文件。

### 用 MCP 收藏和管理

本地 `zhiqiang-knowledge` MCP 可以让 Codex、Claude Code 直接管理同一套 Markdown。支持浏览、搜索、读取、新增、修改和更改公开状态。例如：“把这段内容存进我的知识库，标记 MCP 和工程实践”“找一下关于版本检查的知识”。

新增内容默认是草稿；修改使用文件版本检查，保留出处和稳定标识。MCP 不会执行 Git 提交或网站部署。`draft` 控制网站公开检索，不改变文件是否被 Git 跟踪。接入与使用说明见 [本地知识库 MCP](tools/knowledge-mcp/README.md)。

## 常用检查

### 查看用户提问

`/admin/chat-logs` 使用 `ADMIN_ACCESS_TOKEN` 口令访问，支持问题全文、关键词搜索、状态筛选和历史翻页。公开聊天只收集本轮提交且通过校验和限流的问题，不重复保存历史消息，也不收集未发送的输入。

问题和回答结果通过 Next.js `after` 在响应结束或中断后异步写入 Supabase 的 `chat_question_logs`，不会等待日志写入再开始回答。沿用 `question_preview` 文本列保存完整问题（最多 1600 字），保留换行；旧记录被截断的部分无法恢复。写入有超时和一次幂等重试，最终失败只记录错误，不影响聊天；这不是持久化任务队列，平台强制终止或数据库持续不可用时仍可能丢失。

### 运行检查

```bash
pnpm run lint
pnpm test
pnpm exec tsc --noEmit
pnpm run build
```

## 本地工程文档

`docs/` 保存本地架构、部署和知识库维护说明，默认被 Git 忽略，不作为开源仓库内容。知识维护细节可在本地 `docs/knowledge-base.md` 查看。
