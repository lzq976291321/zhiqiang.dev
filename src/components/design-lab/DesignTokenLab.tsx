"use client"

import type { CSSProperties } from "react"
import { useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  BadgeCheck,
  Braces,
  Check,
  Copy,
  Frame,
  Layers3,
  Palette,
  Sparkles,
} from "lucide-react"
import { CopyButton } from "@/components/shared/CopyButton"

type TokenSet = {
  background: string
  backgroundSoft: string
  foreground: string
  muted: string
  surfaceCard: string
  surfaceElevated: string
  primary: string
  primaryForeground: string
  accent: string
  accentForeground: string
  borderSubtle: string
  borderStrong: string
  ring: string
  radiusCard: string
  radiusButton: string
  shadowCard: string
  shadowFloating: string
  blurGlass: string
}

type LabTheme = {
  id: string
  name: string
  title: string
  family: "polished" | "hard-edge"
  summary: string
  intent: string
  fit: string
  avoid: string[]
  swatches: string[]
  tokens: TokenSet
}

const themes: LabTheme[] = [
  {
    id: "glass-luxury",
    name: "Glass Luxury",
    title: "深色玻璃奢华",
    family: "polished",
    summary: "冷青玻璃、暗场层次、少量暖金，适合 Agent、工具台和高质感个人站。",
    intent: "让界面像一块有深度的冷色玻璃，靠边框高光、暗部层次和克制暖色建立高级感。",
    fit: "Agent 平台、设计工具、AI 控制台、个人知识库",
    avoid: ["不要大面积纯蓝渐变", "不要让所有卡片都发光", "不要把正文压到 55% 以下透明度"],
    swatches: ["#07111f", "#9fe8ff", "#b8f7d4", "#ffd18a"],
    tokens: {
      background: "#050913",
      backgroundSoft: "#0b1526",
      foreground: "#f7fbff",
      muted: "rgba(247, 251, 255, 0.62)",
      surfaceCard: "rgba(255, 255, 255, 0.09)",
      surfaceElevated: "rgba(255, 255, 255, 0.14)",
      primary: "#9fe8ff",
      primaryForeground: "#06111f",
      accent: "#ffd18a",
      accentForeground: "#241506",
      borderSubtle: "rgba(255, 255, 255, 0.13)",
      borderStrong: "rgba(159, 232, 255, 0.32)",
      ring: "rgba(159, 232, 255, 0.42)",
      radiusCard: "28px",
      radiusButton: "999px",
      shadowCard: "inset 0 1px 0 rgba(255,255,255,.2), 0 24px 90px rgba(0,0,0,.32)",
      shadowFloating: "0 34px 110px rgba(0,0,0,.48)",
      blurGlass: "blur(28px) saturate(1.25)",
    },
  },
  {
    id: "editorial-dark",
    name: "Editorial Dark",
    title: "黑金编辑部",
    family: "polished",
    summary: "近黑底、象牙白文字、细金线和杂志式排版，适合文章、作品集和思想型产品。",
    intent: "用强排版和低饱和金色控制气质，减少装饰，把重点留给标题和内容节奏。",
    fit: "技术博客、作品集、研究报告、长文知识库",
    avoid: ["不要使用霓虹蓝", "不要过多半透明玻璃", "不要把圆角做得太软"],
    swatches: ["#0b0a08", "#f7f0df", "#c8a97e", "#7a6a58"],
    tokens: {
      background: "#0b0a08",
      backgroundSoft: "#18140f",
      foreground: "#f7f0df",
      muted: "rgba(247, 240, 223, 0.62)",
      surfaceCard: "rgba(255, 248, 229, 0.07)",
      surfaceElevated: "rgba(255, 248, 229, 0.11)",
      primary: "#c8a97e",
      primaryForeground: "#171008",
      accent: "#f2dfb4",
      accentForeground: "#1e160d",
      borderSubtle: "rgba(242, 223, 180, 0.13)",
      borderStrong: "rgba(200, 169, 126, 0.38)",
      ring: "rgba(200, 169, 126, 0.44)",
      radiusCard: "12px",
      radiusButton: "10px",
      shadowCard: "0 18px 70px rgba(0,0,0,.34)",
      shadowFloating: "0 28px 110px rgba(0,0,0,.55)",
      blurGlass: "blur(18px) saturate(1.1)",
    },
  },
  {
    id: "clean-saas",
    name: "Clean SaaS",
    title: "冷静白色工作台",
    family: "polished",
    summary: "浅色背景、清晰边框、低圆角和理性蓝绿，适合后台、SaaS 和高频操作界面。",
    intent: "优先可读性和密度，质感来自精确边框、阴影层级和状态色，而不是装饰。",
    fit: "SaaS 后台、CRM、数据平台、项目管理工具",
    avoid: ["不要大阴影", "不要复杂渐变背景", "不要让按钮过圆"],
    swatches: ["#f7f9fb", "#0f172a", "#176b87", "#2fbf8f"],
    tokens: {
      background: "#f7f9fb",
      backgroundSoft: "#eef3f7",
      foreground: "#0f172a",
      muted: "rgba(15, 23, 42, 0.62)",
      surfaceCard: "#ffffff",
      surfaceElevated: "#fbfdff",
      primary: "#176b87",
      primaryForeground: "#ffffff",
      accent: "#2fbf8f",
      accentForeground: "#062016",
      borderSubtle: "rgba(15, 23, 42, 0.11)",
      borderStrong: "rgba(23, 107, 135, 0.32)",
      ring: "rgba(23, 107, 135, 0.28)",
      radiusCard: "14px",
      radiusButton: "10px",
      shadowCard: "0 10px 34px rgba(15,23,42,.08)",
      shadowFloating: "0 22px 70px rgba(15,23,42,.16)",
      blurGlass: "blur(12px)",
    },
  },
  {
    id: "warm-portfolio",
    name: "Warm Portfolio",
    title: "奶油作品集",
    family: "polished",
    summary: "奶油底、陶土红、橄榄绿和柔和纸感，适合个人品牌、摄影和生活方式页面。",
    intent: "用低对比暖色建立亲近感，保留足够留白，让内容像被放在纸张和日光里。",
    fit: "个人主页、摄影集、手作品牌、轻量内容产品",
    avoid: ["不要把背景做成纯黄", "不要使用高饱和橙色", "不要让阴影变脏"],
    swatches: ["#fbf2e5", "#2b241b", "#b76043", "#6f7f54"],
    tokens: {
      background: "#fbf2e5",
      backgroundSoft: "#f1dfc8",
      foreground: "#2b241b",
      muted: "rgba(43, 36, 27, 0.62)",
      surfaceCard: "rgba(255, 250, 242, 0.86)",
      surfaceElevated: "#fff9ef",
      primary: "#b76043",
      primaryForeground: "#fff8ee",
      accent: "#6f7f54",
      accentForeground: "#fbf8ef",
      borderSubtle: "rgba(83, 61, 39, 0.14)",
      borderStrong: "rgba(183, 96, 67, 0.34)",
      ring: "rgba(183, 96, 67, 0.3)",
      radiusCard: "24px",
      radiusButton: "999px",
      shadowCard: "0 18px 54px rgba(77,52,29,.12)",
      shadowFloating: "0 26px 90px rgba(77,52,29,.22)",
      blurGlass: "blur(16px) saturate(1.05)",
    },
  },
  {
    id: "neo-brutal-studio",
    name: "Neo Brutal Studio",
    title: "硬边实验室",
    family: "hard-edge",
    summary: "高对比、硬边框、荧光点缀和强图形节奏，适合需要记忆点的实验项目。",
    intent: "让界面像一张可交互海报，靠硬边框、色块和强按钮建立冲击力。",
    fit: "实验工具、创意工作室、活动页、设计案例展示",
    avoid: ["不要使用柔和毛玻璃", "不要过多阴影层级", "不要把正文缩得太小"],
    swatches: ["#f7ff3c", "#111111", "#ff4d8d", "#39ffb6"],
    tokens: {
      background: "#f7ff3c",
      backgroundSoft: "#fff7a8",
      foreground: "#111111",
      muted: "rgba(17, 17, 17, 0.66)",
      surfaceCard: "#ffffff",
      surfaceElevated: "#111111",
      primary: "#111111",
      primaryForeground: "#f7ff3c",
      accent: "#ff4d8d",
      accentForeground: "#111111",
      borderSubtle: "rgba(17, 17, 17, 0.24)",
      borderStrong: "#111111",
      ring: "#ff4d8d",
      radiusCard: "4px",
      radiusButton: "4px",
      shadowCard: "8px 8px 0 #111111",
      shadowFloating: "12px 12px 0 #111111",
      blurGlass: "blur(0px)",
    },
  },
  {
    id: "raster-control",
    name: "Raster Control",
    title: "网格控制台",
    family: "hard-edge",
    summary: "米白底、黑色硬线、酸性绿和警示红，像一张可操作的设计校准板。",
    intent: "用栅格、粗线和偏移阴影建立明确秩序，强调每个组件都像被标尺校准过。",
    fit: "设计系统实验、工具型作品集、组件规范页、内部原型台",
    avoid: ["不要使用柔光阴影", "不要把边框降到 1px 以下", "不要加入纸张暖滤镜"],
    swatches: ["#f3f0e8", "#050505", "#d8ff5f", "#ff3b30"],
    tokens: {
      background: "#f3f0e8",
      backgroundSoft: "#d8ff5f",
      foreground: "#050505",
      muted: "rgba(5, 5, 5, 0.64)",
      surfaceCard: "#fffdfa",
      surfaceElevated: "#d8ff5f",
      primary: "#050505",
      primaryForeground: "#f3f0e8",
      accent: "#ff3b30",
      accentForeground: "#050505",
      borderSubtle: "rgba(5, 5, 5, 0.32)",
      borderStrong: "#050505",
      ring: "#00d46a",
      radiusCard: "6px",
      radiusButton: "3px",
      shadowCard: "6px 6px 0 #050505",
      shadowFloating: "12px 12px 0 #050505",
      blurGlass: "blur(0px)",
    },
  },
  {
    id: "signal-foundry",
    name: "Signal Foundry",
    title: "信号铸造厂",
    family: "hard-edge",
    summary: "黑底、荧光黄、冷青信号和橙红警示，适合强识别的实验工具界面。",
    intent: "把界面处理成机器铭牌和信号面板的组合，利用高亮色块表达状态和优先级。",
    fit: "AI 控制台、硬件实验、现场工具、实时监测页面",
    avoid: ["不要使用圆润胶囊按钮", "不要把荧光色铺满整页", "不要增加玻璃拟态层"],
    swatches: ["#101010", "#f5ff00", "#00f0ff", "#ff3d00"],
    tokens: {
      background: "#101010",
      backgroundSoft: "#1d1d1d",
      foreground: "#f7f7ed",
      muted: "rgba(247, 247, 237, 0.64)",
      surfaceCard: "#181818",
      surfaceElevated: "#f5ff00",
      primary: "#f5ff00",
      primaryForeground: "#101010",
      accent: "#00f0ff",
      accentForeground: "#101010",
      borderSubtle: "rgba(247, 247, 237, 0.24)",
      borderStrong: "#f5ff00",
      ring: "#ff3d00",
      radiusCard: "4px",
      radiusButton: "2px",
      shadowCard: "7px 7px 0 #f5ff00",
      shadowFloating: "12px 12px 0 #00f0ff",
      blurGlass: "blur(0px)",
    },
  },
  {
    id: "blueprint-cutout",
    name: "Blueprint Cutout",
    title: "蓝图切割板",
    family: "hard-edge",
    summary: "钴蓝底、白色切片、黑色结构线和荧光绿，像被剪裁出来的交互蓝图。",
    intent: "保留蓝图的理性秩序，但用硬切块和高对比按钮让页面更像实验室样机。",
    fit: "技术专题页、开发者工具、系统架构展示、实验型落地页",
    avoid: ["不要使用大面积蓝紫渐变", "不要把白色卡片做透明", "不要降低文字对比度"],
    swatches: ["#1026ff", "#fbfbf0", "#101010", "#c6ff00"],
    tokens: {
      background: "#1026ff",
      backgroundSoft: "#061060",
      foreground: "#fbfbf0",
      muted: "rgba(251, 251, 240, 0.68)",
      surfaceCard: "#101010",
      surfaceElevated: "#fbfbf0",
      primary: "#fbfbf0",
      primaryForeground: "#1026ff",
      accent: "#c6ff00",
      accentForeground: "#101010",
      borderSubtle: "rgba(251, 251, 240, 0.28)",
      borderStrong: "#fbfbf0",
      ring: "#c6ff00",
      radiusCard: "5px",
      radiusButton: "3px",
      shadowCard: "8px 8px 0 #101010",
      shadowFloating: "14px 14px 0 #c6ff00",
      blurGlass: "blur(0px)",
    },
  },
]

const hardEdgeThemes = themes.filter((theme) => theme.family === "hard-edge")

function themeStyle(theme: LabTheme): CSSProperties & Record<string, string> {
  const { tokens } = theme

  return {
    "--lab-bg": tokens.background,
    "--lab-bg-soft": tokens.backgroundSoft,
    "--lab-fg": tokens.foreground,
    "--lab-muted": tokens.muted,
    "--lab-card": tokens.surfaceCard,
    "--lab-elevated": tokens.surfaceElevated,
    "--lab-primary": tokens.primary,
    "--lab-primary-fg": tokens.primaryForeground,
    "--lab-accent": tokens.accent,
    "--lab-accent-fg": tokens.accentForeground,
    "--lab-border": tokens.borderSubtle,
    "--lab-border-strong": tokens.borderStrong,
    "--lab-ring": tokens.ring,
    "--lab-radius-card": tokens.radiusCard,
    "--lab-radius-button": tokens.radiusButton,
    "--lab-shadow-card": tokens.shadowCard,
    "--lab-shadow-floating": tokens.shadowFloating,
    "--lab-blur": tokens.blurGlass,
  }
}

function tokenJson(theme: LabTheme) {
  const { tokens } = theme

  return {
    color: {
      background: { $type: "color", $value: tokens.background },
      foreground: { $type: "color", $value: tokens.foreground },
      muted: { $type: "color", $value: tokens.muted },
      surface: {
        card: { $type: "color", $value: tokens.surfaceCard },
        elevated: { $type: "color", $value: tokens.surfaceElevated },
      },
      primary: {
        default: { $type: "color", $value: tokens.primary },
        foreground: { $type: "color", $value: tokens.primaryForeground },
      },
      accent: {
        default: { $type: "color", $value: tokens.accent },
        foreground: { $type: "color", $value: tokens.accentForeground },
      },
      border: {
        subtle: { $type: "color", $value: tokens.borderSubtle },
        strong: { $type: "color", $value: tokens.borderStrong },
      },
      ring: { $type: "color", $value: tokens.ring },
    },
    radius: {
      card: { $type: "dimension", $value: tokens.radiusCard },
      button: { $type: "dimension", $value: tokens.radiusButton },
    },
    shadow: {
      card: { $type: "shadow", $value: tokens.shadowCard },
      floating: { $type: "shadow", $value: tokens.shadowFloating },
    },
    effect: {
      glassBlur: { $type: "custom", $value: tokens.blurGlass },
    },
  }
}

function generateMarkdown(theme: LabTheme) {
  const { tokens } = theme
  const hardEdgeGuidance =
    theme.family === "hard-edge"
      ? `
## Hard Edge Rules

- 边框是主视觉，不是辅助线：核心容器使用 \`--border-strong\`，轻量分隔才用 \`--border-subtle\`。
- 阴影只使用硬偏移，不使用柔光、毛玻璃和大面积 blur。
- 强调色只做标签、状态、按钮和少量色块，避免整页变成荧光海报。
- 圆角保持克制，组件半径不超过 \`--radius-card\`。
`
      : ""
  const cssVariables = `:root {
  --background: ${tokens.background};
  --foreground: ${tokens.foreground};
  --muted-foreground: ${tokens.muted};
  --surface-card: ${tokens.surfaceCard};
  --surface-elevated: ${tokens.surfaceElevated};
  --primary: ${tokens.primary};
  --primary-foreground: ${tokens.primaryForeground};
  --accent: ${tokens.accent};
  --accent-foreground: ${tokens.accentForeground};
  --border-subtle: ${tokens.borderSubtle};
  --border-strong: ${tokens.borderStrong};
  --ring: ${tokens.ring};
  --radius-card: ${tokens.radiusCard};
  --radius-button: ${tokens.radiusButton};
  --shadow-card: ${tokens.shadowCard};
  --shadow-floating: ${tokens.shadowFloating};
  --blur-glass: ${tokens.blurGlass};
}`

  const tailwindTheme = `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-card: var(--surface-card);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border-subtle);
  --color-ring: var(--ring);
  --radius-lg: var(--radius-card);
  --radius-md: var(--radius-button);
}`

  return `# Design Tokens: ${theme.name}

## Intent

${theme.intent}

## Best Fit

${theme.fit}

## Preview Contract

这套 tokens 已在同一个 HTML 样张中验证过：导航、Hero、按钮、输入框、Badge、内容卡片、代码块、列表和浮层。
${hardEdgeGuidance}

## Token Source

\`\`\`json
${JSON.stringify(tokenJson(theme), null, 2)}
\`\`\`

## CSS Variables

\`\`\`css
${cssVariables}
\`\`\`

## Tailwind v4 Mapping

\`\`\`css
${tailwindTheme}
\`\`\`

## Component Mapping

| Component | Tokens |
| --- | --- |
| Page | \`--background\`, \`--foreground\` |
| Card | \`--surface-card\`, \`--border-subtle\`, \`--radius-card\`, \`--shadow-card\` |
| Floating Panel | \`--surface-elevated\`, \`--border-strong\`, \`--shadow-floating\` |
| Button | \`--primary\`, \`--primary-foreground\`, \`--radius-button\` |
| Badge | \`--accent\`, \`--accent-foreground\` |
| Focus Ring | \`--ring\` |

## Usage Rules

- 先应用到真实组件样张，再全局替换项目主题。
- 大面积背景只用 \`--background\` 和 \`--surface-card\`，强调色只用于按钮、Badge、链接和状态。
- 阴影最多保留 \`card\` 与 \`floating\` 两层，避免廉价发光。
- 圆角只使用 \`card\` 与 \`button\` 两组，不要每个组件单独造半径。

## Avoid

${theme.avoid.map((item) => `- ${item}`).join("\n")}
`
}

function TokenPreview({ theme }: { theme: LabTheme }) {
  const isHardEdge = theme.family === "hard-edge"
  const previewStyle = themeStyle(theme)
  previewStyle.boxShadow = isHardEdge
    ? "var(--lab-shadow-floating)"
    : "0 30px 120px rgba(0,0,0,0.34)"
  const frameStyle: CSSProperties | undefined = isHardEdge
    ? {
        backgroundImage:
          "linear-gradient(90deg, var(--lab-border) 1px, transparent 1px), linear-gradient(var(--lab-border) 1px, transparent 1px), linear-gradient(135deg, var(--lab-bg), var(--lab-bg-soft))",
        backgroundSize: "34px 34px, 34px 34px, 100% 100%",
      }
    : undefined
  const surfaceEffect: CSSProperties = isHardEdge
    ? { boxShadow: "var(--lab-shadow-card)" }
    : { backdropFilter: "var(--lab-blur)", WebkitBackdropFilter: "var(--lab-blur)" }

  return (
    <div
      style={previewStyle}
      className={`overflow-hidden bg-[var(--lab-bg)] text-[var(--lab-fg)] ${
        isHardEdge
          ? "rounded-[8px] border-2 border-[var(--lab-border-strong)] p-3"
          : "rounded-[34px] border border-white/12 p-4"
      }`}
    >
      <div
        style={frameStyle}
        className={`relative overflow-hidden bg-[linear-gradient(135deg,var(--lab-bg),var(--lab-bg-soft))] p-4 sm:p-5 ${
          isHardEdge
            ? "rounded-[6px] border-2 border-[var(--lab-border-strong)]"
            : "rounded-[28px] border border-[var(--lab-border)]"
        }`}
      >
        {isHardEdge ? (
          <>
            <div
              className="pointer-events-none absolute right-3 top-3 h-12 w-40 border-2 border-[var(--lab-border-strong)]"
              style={{
                background:
                  "repeating-linear-gradient(135deg, var(--lab-accent) 0 10px, transparent 10px 20px)",
              }}
            />
            <div className="pointer-events-none absolute bottom-4 left-4 h-14 w-14 border-2 border-[var(--lab-border-strong)] bg-[var(--lab-primary)]" />
            <div className="pointer-events-none absolute bottom-8 left-10 h-14 w-14 border-2 border-[var(--lab-border-strong)] bg-[var(--lab-accent)]" />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute right-[-16%] top-[-26%] size-80 rounded-full bg-[var(--lab-primary)] opacity-20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-20%] left-[-12%] size-72 rounded-full bg-[var(--lab-accent)] opacity-16 blur-3xl" />
          </>
        )}

        <div
          className={`relative flex items-center justify-between border bg-[var(--lab-card)] px-3 py-2 ${
            isHardEdge
              ? "rounded-[var(--lab-radius-card)] border-2 border-[var(--lab-border-strong)]"
              : "rounded-[calc(var(--lab-radius-card)*0.75)] border-[var(--lab-border)]"
          }`}
          style={surfaceEffect}
        >
          <div className="flex items-center gap-2">
            <span
              className={`grid size-8 place-items-center border border-[var(--lab-border-strong)] bg-[var(--lab-primary)] text-[var(--lab-primary-fg)] ${
                isHardEdge ? "rounded-[3px] border-2" : "rounded-full"
              }`}
            >
              <Sparkles className="size-4" />
            </span>
            <span className="text-sm font-semibold">Token Studio</span>
          </div>
          <div className={`hidden items-center gap-4 text-xs text-[var(--lab-muted)] sm:flex ${isHardEdge ? "font-mono uppercase" : ""}`}>
            <span>Preview</span>
            <span>Tokens</span>
            <span>Apply</span>
          </div>
          <span
            className={`bg-[var(--lab-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--lab-primary-fg)] ${
              isHardEdge
                ? "rounded-[var(--lab-radius-button)] border-2 border-[var(--lab-border-strong)] font-mono uppercase"
                : "rounded-[var(--lab-radius-button)]"
            }`}
          >
            Export
          </span>
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <section
            className={`rounded-[var(--lab-radius-card)] border bg-[var(--lab-card)] p-5 ${
              isHardEdge ? "border-2 border-[var(--lab-border-strong)]" : "border-[var(--lab-border)]"
            }`}
            style={surfaceEffect}
          >
            <span
              className={`inline-flex items-center gap-2 rounded-[var(--lab-radius-button)] border px-3 py-1.5 text-xs ${
                isHardEdge
                  ? "border-2 border-[var(--lab-border-strong)] bg-[var(--lab-primary)] font-mono uppercase text-[var(--lab-primary-fg)]"
                  : "border-[var(--lab-border-strong)] bg-[var(--lab-elevated)] text-[var(--lab-muted)]"
              }`}
            >
              <Palette className="size-3.5" />
              HTML first, tokens after
            </span>
            <h2 className="mt-5 max-w-xl text-balance font-heading text-3xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl sm:leading-[0.95]">
              先看到风格，再沉淀变量
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--lab-muted)]">
              同一组 token 必须同时撑住导航、Hero、按钮、输入框、卡片、代码块和浮层，才值得进入项目。
            </p>
            {isHardEdge && (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  ["BORDER", "2PX"],
                  ["RADIUS", theme.tokens.radiusCard],
                  ["BLUR", "0"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="border-2 border-[var(--lab-border-strong)] bg-[var(--lab-accent)] p-2 font-mono text-[10px] uppercase text-[var(--lab-accent-fg)]"
                  >
                    <p>{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className={`rounded-[var(--lab-radius-button)] bg-[var(--lab-primary)] px-4 py-2 text-sm font-semibold text-[var(--lab-primary-fg)] ${
                  isHardEdge ? "border-2 border-[var(--lab-border-strong)] font-mono uppercase" : ""
                }`}
                style={isHardEdge ? { boxShadow: "var(--lab-shadow-card)" } : undefined}
              >
                提取 MD
              </button>
              <button
                className={`rounded-[var(--lab-radius-button)] border bg-[var(--lab-card)] px-4 py-2 text-sm font-semibold text-[var(--lab-fg)] ${
                  isHardEdge ? "border-2 border-[var(--lab-border-strong)] font-mono uppercase" : "border-[var(--lab-border)]"
                }`}
              >
                查看组件
              </button>
            </div>
          </section>

          <aside className="grid gap-3">
            <div
              className={`rounded-[var(--lab-radius-card)] border bg-[var(--lab-card)] p-4 ${
                isHardEdge ? "border-2 border-[var(--lab-border-strong)]" : "border-[var(--lab-border)]"
              }`}
              style={surfaceEffect}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Quality gates</span>
                <BadgeCheck className="size-4 text-[var(--lab-accent)]" />
              </div>
              {["contrast ok", "semantic tokens", "no random radius"].map((item) => (
                <div key={item} className="mb-2 flex items-center gap-2 text-xs text-[var(--lab-muted)] last:mb-0">
                  <Check className="size-3.5 text-[var(--lab-primary)]" />
                  {item}
                </div>
              ))}
            </div>

            <label
              className={`block rounded-[var(--lab-radius-card)] border bg-[var(--lab-card)] p-4 ${
                isHardEdge ? "border-2 border-[var(--lab-border-strong)]" : "border-[var(--lab-border)]"
              }`}
              style={surfaceEffect}
            >
              <span className="text-xs font-medium text-[var(--lab-muted)]">Style note</span>
              <input
                readOnly
                value={isHardEdge ? "hard border / offset shadow / no blur" : theme.name}
                className={`mt-2 w-full rounded-[var(--lab-radius-button)] border px-3 py-2 text-sm outline-none ring-[var(--lab-ring)] ${
                  isHardEdge
                    ? "border-2 border-[var(--lab-border-strong)] bg-[var(--lab-bg)] font-mono text-[var(--lab-fg)]"
                    : "border-[var(--lab-border)] bg-[var(--lab-elevated)] text-[var(--lab-fg)]"
                }`}
              />
            </label>

            <div
              className={`rounded-[var(--lab-radius-card)] border p-4 ${
                isHardEdge
                  ? "border-2 border-[var(--lab-border-strong)] bg-[var(--lab-primary)] text-[var(--lab-primary-fg)]"
                  : "border-[var(--lab-border-strong)] bg-[var(--lab-elevated)]"
              }`}
              style={{ boxShadow: "var(--lab-shadow-floating)" }}
            >
              <div className={`flex items-center justify-between text-xs ${isHardEdge ? "font-mono uppercase opacity-80" : "text-[var(--lab-muted)]"}`}>
                <span>theme.css</span>
                <Copy className="size-3.5" />
              </div>
              <pre className={`mt-3 overflow-hidden text-[11px] leading-5 ${isHardEdge ? "text-[var(--lab-primary-fg)]" : "text-[var(--lab-fg)]"}`}>
                --primary: {theme.tokens.primary};{"\n"}
                --radius-card: {theme.tokens.radiusCard};{"\n"}
                --shadow-card: layered;
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export function DesignTokenLab() {
  const [activeId, setActiveId] = useState("neo-brutal-studio")
  const activeTheme = themes.find((theme) => theme.id === activeId) ?? themes[0]
  const markdown = useMemo(() => generateMarkdown(activeTheme), [activeTheme])

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[70vh] w-[94vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_18%_16%,rgba(255,209,138,0.18),transparent_34rem),radial-gradient(ellipse_at_78%_12%,rgba(159,232,255,0.24),transparent_34rem),radial-gradient(ellipse_at_58%_76%,rgba(184,247,212,0.14),transparent_32rem)]" />

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[13px] text-white/48">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]"
        >
          <div className="glass-card flex min-h-[560px] flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-10">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-100/48">
                design token lab / hard edge set
              </p>
              <h1 className="mt-5 max-w-3xl text-balance font-heading text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl sm:leading-[0.92]">
                硬边实验室
                <span className="block">继续扩容</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                用真实 UI 样张判断审美，再输出可给 Agent 应用到项目里的 design-tokens.md。硬边方向现在有更多栅格、粗线、色块和偏移阴影。
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                [String(themes.length), "风格样张"],
                ["12", "UI 部件"],
                [String(hardEdgeThemes.length), "硬边方向"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[24px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-white/42">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <TokenPreview theme={activeTheme} />
        </motion.section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-3">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
                  choose a direction
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold text-white">风格样张</h2>
              </div>
              <Frame className="size-5 text-white/42" />
            </div>

            <div className="mb-5 grid gap-2 sm:grid-cols-2">
              {hardEdgeThemes.map((theme, index) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveId(theme.id)}
                  className={`group border-2 p-3 text-left transition ${
                    activeTheme.id === theme.id
                      ? "border-yellow-200 bg-yellow-200/[0.12]"
                      : "border-white/14 bg-white/[0.04] hover:border-yellow-200/60 hover:bg-yellow-200/[0.08]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase text-white/42">
                    <span>lab-{String(index + 1).padStart(2, "0")}</span>
                    <span>{theme.name}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-white">{theme.title}</h3>
                  <div className="mt-3 flex gap-1">
                    {theme.swatches.map((color) => (
                      <span
                        key={color}
                        className="h-5 flex-1 border border-white/16"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {themes.map((theme) => {
              const isThemeHardEdge = theme.family === "hard-edge"

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setActiveId(theme.id)}
                  className={`group w-full border p-4 text-left transition ${
                    isThemeHardEdge ? "rounded-[10px] border-2" : "rounded-[28px]"
                  } ${
                    activeTheme.id === theme.id
                      ? isThemeHardEdge
                        ? "border-yellow-200/80 bg-yellow-200/[0.09]"
                        : "border-cyan-100/28 bg-cyan-100/10"
                      : "border-white/10 bg-white/[0.045] hover:border-white/18 hover:bg-white/[0.075]"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/44">
                          {theme.name}
                        </p>
                        {isThemeHardEdge && (
                          <span className="border border-yellow-200/40 px-2 py-0.5 font-mono text-[10px] uppercase text-yellow-100/72">
                            hard-edge
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-heading text-2xl font-semibold text-white">
                        {theme.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                        {theme.summary}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      {theme.swatches.map((color) => (
                        <span
                          key={color}
                          className={`size-8 border border-white/14 ${
                            isThemeHardEdge ? "rounded-[2px]" : "rounded-full"
                          }`}
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="glass-card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
                  extracted artifact
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold text-white">
                  design-tokens.md
                </h2>
              </div>
              <CopyButton text={markdown} className="self-start sm:self-auto" />
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/78">
                  <Layers3 className="size-4 text-cyan-100/62" />
                  Token 摘要
                </h3>
                <div className="space-y-2 text-sm leading-6 text-white/52">
                  <p>{activeTheme.intent}</p>
                  <p>适用：{activeTheme.fit}</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {[
                    ["Primary", activeTheme.tokens.primary],
                    ["Accent", activeTheme.tokens.accent],
                    ["Radius", activeTheme.tokens.radiusCard],
                    ["Shadow", "2 levels"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                      <p className="text-xs text-white/36">{label}</p>
                      <p className="mt-1 truncate font-mono text-xs text-white/66">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#06101e]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <span className="flex items-center gap-2 text-xs text-white/42">
                    <Braces className="size-4" />
                    markdown preview
                  </span>
                  <span className="text-xs text-white/32">{activeTheme.name}</span>
                </div>
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 font-mono text-[11px] leading-5 text-cyan-50/66">
                  {markdown}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
