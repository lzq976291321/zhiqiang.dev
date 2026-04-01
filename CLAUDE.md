@AGENTS.md

# 项目指令

## 项目信息
- 名称：zhiqiang.dev（个人博客 × AI 工具库）
- 技术栈：Next.js 14 + Tailwind CSS v4 + shadcn/ui + Framer Motion + MDX
- 部署：Vercel

## 目录规范
- 页面放 src/app/，按路由分目录
- 组件放 src/components/，按页面模块分子目录（ui/ layout/ shared/ home/ blog/ skills/ prompts/ mcp/）
- 内容放 src/content/，按类型分子目录（blog/ skills/ prompts/image/ prompts/video/ mcp/）
- 工具函数放 src/lib/
- 配置放 src/config/

## 命名规范
- 组件：PascalCase（PostCard.tsx）
- 工具/hooks：camelCase（useScrollProgress.ts）
- 内容文件：kebab-case（my-first-post.mdx）

## 组件约定
- 统一用 shadcn/ui 基础组件
- 动画统一用 Framer Motion，不混用 CSS animation
- 所有卡片组件必须包含悬浮效果
- 公共动画组件在 src/components/shared/

## 设计规范
- 暗色主题为默认：背景 #0A0A0F，卡片 #111118
- 主色渐变：#7C3AED → #06B6D4
- 强调色：#F59E0B
- 字体：Space Grotesk（英文标题）/ Inter（正文）/ JetBrains Mono（代码）

## 常用命令
- dev: pnpm dev
- build: pnpm build
- lint: pnpm lint
