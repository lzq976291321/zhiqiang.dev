@AGENTS.md

# 项目指令

## 项目信息
- 名称：zhiqiang.dev（个人博客 × AI 工具库）
- 技术栈：Next.js 14 + Tailwind CSS v4 + shadcn/ui + Framer Motion + MDX
- 部署：Vercel

## 设计风格：Editorial 杂志风

**这是项目的核心设计语言，所有新页面和组件必须遵循。**

### 配色
- 背景：`#0A0A0A`（纯黑）
- 卡片/surface：`#141414`
- 正文：`#FAFAFA`（纯白）
- 次要文字：`#666666`
- 唯一强调色：`#C8A97E`（低饱和金），用于分割线、编号、标签、悬浮高亮
- 不要引入其他彩色，整站黑白金三色

### 字体
- 标题：Playfair Display（衬线体，font-heading）
- 正文：Inter（无衬线，font-sans）
- 代码：JetBrains Mono（等宽，font-mono）
- 标题必须用衬线体，这是 editorial 风格的核心识别

### 圆角
- 全站 radius: 0px，直角边框，杂志印刷感
- 不要加 rounded-lg / rounded-xl 等圆角

### 排版
- 大留白，低密度
- 编号系统：01 / 02 / 03，用 font-mono + tracking-[0.2em] + text-gold/40
- 分割线：1px，渐变从 rgba(255,255,255,0.06) 到 transparent
- 层级：大标题 > 金色短线 > 描述文字 > mono 副标题

### 动画
- 统一用 Framer Motion，ease: [0.16, 1, 0.3, 1]
- 入场：clipPath 遮罩 / y 位移 + opacity
- SVG 装饰线：pathLength 0→1 描绘动画
- 悬浮：文字变亮 + 金色线条伸长 + "Enter →" 箭头淡入
- 不要用 scale 悬浮（不符合 editorial 克制感）
- 不要用发光/阴影/毛玻璃（太科技感）

### 交互模式
- 首页：snap-scroll 全屏切换，无 Navbar
- 子页面：左上角 BackHome 返回（带 hash 定位到首页对应屏）
- 右上角固定：GitHub 图标 + Resume 按钮
- 所有可点击元素加 cursor-pointer

## 目录规范
- 页面放 src/app/，按路由分目录
- 组件放 src/components/，按页面模块分子目录
- 内容放 src/content/，按类型分子目录（blog/ skills/ prompts/image/ prompts/video/ mcp/）
- 工具函数放 src/lib/
- 配置放 src/config/

## 命名规范
- 组件：PascalCase（PostCard.tsx）
- 工具/hooks：camelCase（useScrollProgress.ts）
- 内容文件：kebab-case（my-first-post.mdx）

## 组件约定
- 统一用 shadcn/ui 基础组件
- 动画统一用 Framer Motion，不混用 CSS animation（SVG animation 除外）
- 公共组件在 src/components/shared/（PageShell, BackHome, CopyButton, ScrollReveal, Skeleton）
- 新页面用 PageShell 包裹，自带返回按钮 + 页头 + 顶部光晕

## 常用命令
- dev: pnpm dev
- build: pnpm build
- lint: pnpm lint
