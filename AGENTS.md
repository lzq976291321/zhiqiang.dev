<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 项目记忆

## 项目定位

- 这是个人项目和个人全栈项目，默认由一个人同时负责产品、前端、后端、内容、SEO、部署和运维。
- 当前站点是 `zhiqiang.chat`：公开知识库、开发侧 Profile Agent、Agent Engineering / MCP / Skills / Design Token Lab 内容入口。
- 优先做可运行、可维护、认知负担低的方案；不为假想团队流程或未来需求提前堆抽象。
- C 端公开页面默认重视 SEO；后台、调试页、管理页不额外背 SEO 包袱。

## 协作规则

- 始终用中文沟通，先结论后理由，少写废话。
- 小改动直接做；会影响架构、数据契约、公开内容边界、部署策略的改动，先给清晰选项。
- 能不引入新依赖就不引入，优先复用现有栈和本项目已有工具。
- 遇到 bug、构建失败或测试失败，先查根因再改，不做连续拍脑袋式尝试。
- 用户可见文案、文档、Prompt 和配置说明优先用中文；代码里必须使用英文字符串时，用中文注释说明用途和原因。

## 技术栈

- 包管理：`pnpm`。
- 主栈：Next.js 16、React 19、TypeScript、Tailwind CSS v4、MDX。
- 部署：Vercel。
- 写 Next.js 相关代码前，先查 `node_modules/next/dist/docs/` 中对应版本的文档，不按旧版 Next 经验硬写。

## 目录结构

- 路由入口放在 `src/app/`，按 App Router 路由组织。
- 新增或重构较大的业务功能时，优先按功能拆分目录，例如：
  - `src/features/chat/`
  - `src/features/design-lab/`
  - `src/features/profile/`
- 功能目录内部按职责分层：`components/`、`lib/`、`types/`、`server/`、`data/`，缺什么建什么，不预埋空目录。
- 当前已有的共享结构继续保留：`src/components/` 放跨页面 UI，`src/lib/` 放跨功能工具，`src/config/` 放配置，`src/content/` 放 MD/MDX 内容。
- API Route 保持薄层：请求解析、鉴权/限流、响应封装放 route；检索、模型调用、数据访问等业务逻辑放功能模块或 `src/lib/`。
- 不为了“统一目录”大搬迁已有代码；后续新功能和明显变大的模块再逐步迁移到功能目录。

## 本地记忆和文档

- `AGENTS.md` 是 Codex 和 Claude 的项目级唯一权威记忆；`CLAUDE.md` 只引用它，避免两套规则分叉。
- `docs/` 是本地工程文档和决策记录，不提交远端。
- `task_plan.md`、`findings.md`、`progress.md` 是本地任务记忆，不提交远端。
- 如果公开 README 需要说明文档，只描述本地位置，不链接不会提交的 docs 文件。

## Git 与开源边界

- 仓库按开源仓库维护，但不要提交本地工作记忆、私有文档、环境变量、日志、测试截图和一次性产物。
- 提交前检查 `git status --short`，确认没有 `docs/`、`task_plan.md`、`findings.md`、`progress.md`、`test-results/`。
- Commit message 使用中文，格式为 `type: 简短描述`。
- 不添加 `Co-Authored-By`。
- 默认走分支和 PR 流程；除非用户明确要求，不直接改主分支策略。

## 瘦身原则

- 无引用的模板文件、默认脚手架资源、运行产物和截图产物应删除，避免干扰后续判断。
- 不删除业务内容、公开内容、迁移文件、部署配置和用户已有改动，除非能确认它们无用。
- 删除前优先用 `rg` 查引用，用 `git status` 区分已跟踪和未跟踪文件。
