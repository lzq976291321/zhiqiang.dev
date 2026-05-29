# zhiqiang.chat

个人公开知识库与 Chat 入口。当前默认访问 `/` 会重定向到 `/chat`。

## 本地开发

```bash
npm install
npm run dev
```

默认端口：`http://localhost:54129`

生产预览：

```bash
npm run build
npm run start
```

## 核心目录

- `src/app/chat`：Chat 页面和 API。
- `src/components/chat`：Chat 前端交互和 SSE 渲染。
- `src/lib/chat`：知识库读取、检索、DeepSeek SSE 代理、问题日志。
- `src/content/profile`：Chat 的个人公开知识库。
- `src/content/agent`、`src/content/mcp`、`src/content/skills`：站内文章和工具资料。
- `docs`：工程知识沉淀。

## 文档

- [项目总览](./docs/README.md)
- [Chat 模块](./docs/chat.md)
- [知识库维护](./docs/knowledge-base.md)
- [部署与环境](./docs/deployment.md)

## 常用命令

```bash
npm run lint
npm run build
```
