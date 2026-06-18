# zhiqiang.chat

个人公开知识库与 Chat 入口。当前默认访问 `/` 会重定向到 `/chat`。

## 本地开发

```bash
pnpm install
pnpm run dev
```

默认端口：`http://localhost:54129`

生产预览：

```bash
pnpm run build
pnpm run start
```

部署平台：Vercel。服务端函数区域通过 `vercel.json` 固定为 `sin1`，方便后续 Supabase 选择 `ap-southeast-1`。

## 核心目录

- `src/app/chat`：Chat 页面和 API。
- `src/components/chat`：Chat 前端交互和 SSE 渲染。
- `src/lib/chat`：知识库读取、检索、DeepSeek SSE 代理、问题日志。
- `src/content/profile`：Chat 的个人公开知识库。
- `src/content/agent`、`src/content/mcp`、`src/content/skills`：站内文章和工具资料。
- `docs`：本地工程知识沉淀，不提交远端。

## 文档

工程文档放在本地 `docs/`，用于记录架构、部署、知识库维护和阶段性决策。这个目录默认被 Git 忽略，不作为开源仓库内容。

## 常用命令

```bash
pnpm run lint
pnpm run build
```
