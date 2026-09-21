# 本地知识库 MCP

让 Codex / Claude Code 通过对话收藏和管理 `src/content/` 下的 Markdown。只在本机通过 stdio 运行，不需要数据库、API Key 或常驻 HTTP 服务。网站和 MCP 使用同一份文件。

## 接入

先在仓库运行 `pnpm install`，使用项目 `.nvmrc` 指定的 Node 22 或更新的兼容版本。从仓库根目录执行以下命令，CLI 会把当前 Node 和脚本的绝对路径写入本机客户端配置：

```bash
codex mcp add zhiqiang-knowledge -- "$(command -v node)" "$PWD/tools/knowledge-mcp/server.mjs"
claude mcp add --scope user --transport stdio zhiqiang-knowledge -- "$(command -v node)" "$PWD/tools/knowledge-mcp/server.mjs"
```

配置后在客户端重新加载 MCP 或开始新会话。检查配置：

```bash
codex mcp get zhiqiang-knowledge
claude mcp get zhiqiang-knowledge
```

这是个人级配置，在其他项目中也能向这个知识库保存内容。配置中不含密钥。仓库搬家或 Node 路径变化后需更新启动路径；客户端启动的是 Node 脚本，不依赖网站开发服务。手工调试可用 `pnpm --silent run mcp:knowledge`，启动后等待 stdin 上的 MCP 协议消息属于正常行为。

## 日常用法

- “把下面这段内容存进我的知识库，标题是……，标签是……。”
- “把这篇文章的关键结论收进知识库，并保留原链接。”客户端先读取文章，再把正文和出处交给 MCP。
- “看看知识库里有哪些草稿。”
- “找一下关于 Agent 记忆的知识。”
- “给这条知识补充以下适用边界。”先读取最新版本，再更新。
- “这条知识已核对，可以设为公开。”明确指令后将状态设为 `published`。

| 工具 | 用途 |
| --- | --- |
| `list_knowledge` | 按分类、状态分页浏览 |
| `search_knowledge` | 按关键词搜索标题、标签、正文，包括草稿 |
| `read_knowledge` | 读取正文、元数据、文件路径与版本 |
| `create_knowledge` | 默认在 `knowledge` 新增 `.md` 草稿 |
| `update_knowledge` | 凭最新 `expectedVersion` 修改，保留未指定字段和发布状态 |
| `set_knowledge_status` | 在 `draft`、`reviewed`、`published` 之间切换 |

可管理 `profile`、`knowledge`、`agent`、`mcp`、`skills` 五个目录。普通收藏优先进入 `knowledge`，已有 `.mdx` 也能作为文本读取和更新。`sourceUrl` 保存原始出处；MCP 自身不抓取网页、不执行 MDX。

## 保存与公开

新增一律为 `draft`，默认 `confidence: medium`。草稿可被你的本地 MCP 搜索，但不会进入网站访客 Agent 的公开回答。`reviewed` 同样不会公开；只有 `published` 且可信度不是 `low` 的内容可进入公开检索。旧内容缺省状态与网站兼容：`knowledge` 是草稿，其余四类视为已公开。

写入返回文件路径、版本和状态。`updatedAt` 自动更新为本机日期，`sourceId` 保持稳定。标题自动生成确定的 slug；同名收藏拒绝覆盖，可先搜索后更新，或为不同内容指定新 slug。工具按关键词检索，不提供语义向量检索。

两次客户端写入会串行处理；已有文件必须提供读取时得到的 SHA-256 版本，版本冲突时重新读取并合并。文件采用临时文件与原子替换保存。MCP 不自动提交、推送或部署；线上更新仍走项目发布步骤。`draft` 是网站检索状态，内容仍是普通仓库文件。

若进程异常退出留下写入锁，错误会给出系统临时目录中的具体锁路径。先确认对应知识库没有正在写入的 MCP 进程，再清理遗留锁并重试。

## 验证

```bash
pnpm test
```

测试在临时知识库验证真实 MCP 握手、收藏到公开检索的完整流程、版本冲突、并发写入、路径限制和文本解析；不往正式知识库添加测试内容。
