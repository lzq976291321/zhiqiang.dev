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
]

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
  return (
    <div
      style={themeStyle(theme)}
      className="overflow-hidden rounded-[34px] border border-white/12 bg-[var(--lab-bg)] p-4 text-[var(--lab-fg)] shadow-[0_30px_120px_rgba(0,0,0,0.34)]"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--lab-border)] bg-[linear-gradient(135deg,var(--lab-bg),var(--lab-bg-soft))] p-4 sm:p-5">
        <div className="pointer-events-none absolute right-[-16%] top-[-26%] size-80 rounded-full bg-[var(--lab-primary)] opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-20%] left-[-12%] size-72 rounded-full bg-[var(--lab-accent)] opacity-16 blur-3xl" />

        <div
          className="relative flex items-center justify-between rounded-[calc(var(--lab-radius-card)*0.75)] border border-[var(--lab-border)] bg-[var(--lab-card)] px-3 py-2 shadow-[var(--lab-shadow-card)]"
          style={{ backdropFilter: "var(--lab-blur)", WebkitBackdropFilter: "var(--lab-blur)" }}
        >
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full border border-[var(--lab-border-strong)] bg-[var(--lab-elevated)]">
              <Sparkles className="size-4 text-[var(--lab-primary)]" />
            </span>
            <span className="text-sm font-semibold">Token Studio</span>
          </div>
          <div className="hidden items-center gap-4 text-xs text-[var(--lab-muted)] sm:flex">
            <span>Preview</span>
            <span>Tokens</span>
            <span>Apply</span>
          </div>
          <span className="rounded-[var(--lab-radius-button)] bg-[var(--lab-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--lab-primary-fg)]">
            Export
          </span>
        </div>

        <div className="relative mt-5 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
          <section
            className="rounded-[var(--lab-radius-card)] border border-[var(--lab-border)] bg-[var(--lab-card)] p-5 shadow-[var(--lab-shadow-card)]"
            style={{ backdropFilter: "var(--lab-blur)", WebkitBackdropFilter: "var(--lab-blur)" }}
          >
            <span className="inline-flex items-center gap-2 rounded-[var(--lab-radius-button)] border border-[var(--lab-border-strong)] bg-[var(--lab-elevated)] px-3 py-1.5 text-xs text-[var(--lab-muted)]">
              <Palette className="size-3.5 text-[var(--lab-primary)]" />
              HTML first, tokens after
            </span>
            <h2 className="mt-5 max-w-xl text-balance font-heading text-4xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-5xl">
              先看到风格，再沉淀变量
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--lab-muted)]">
              同一组 token 必须同时撑住导航、Hero、按钮、输入框、卡片、代码块和浮层，才值得进入项目。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <button className="rounded-[var(--lab-radius-button)] bg-[var(--lab-primary)] px-4 py-2 text-sm font-semibold text-[var(--lab-primary-fg)] shadow-[var(--lab-shadow-card)]">
                提取 MD
              </button>
              <button className="rounded-[var(--lab-radius-button)] border border-[var(--lab-border)] bg-[var(--lab-card)] px-4 py-2 text-sm font-semibold text-[var(--lab-fg)]">
                查看组件
              </button>
            </div>
          </section>

          <aside className="grid gap-3">
            <div className="rounded-[var(--lab-radius-card)] border border-[var(--lab-border)] bg-[var(--lab-card)] p-4 shadow-[var(--lab-shadow-card)]">
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

            <label className="block rounded-[var(--lab-radius-card)] border border-[var(--lab-border)] bg-[var(--lab-card)] p-4 shadow-[var(--lab-shadow-card)]">
              <span className="text-xs font-medium text-[var(--lab-muted)]">Style note</span>
              <input
                readOnly
                value="luxury glass with calm cyan"
                className="mt-2 w-full rounded-[var(--lab-radius-button)] border border-[var(--lab-border)] bg-[var(--lab-elevated)] px-3 py-2 text-sm text-[var(--lab-fg)] outline-none ring-[var(--lab-ring)]"
              />
            </label>

            <div className="rounded-[var(--lab-radius-card)] border border-[var(--lab-border-strong)] bg-[var(--lab-elevated)] p-4 shadow-[var(--lab-shadow-floating)]">
              <div className="flex items-center justify-between text-xs text-[var(--lab-muted)]">
                <span>theme.css</span>
                <Copy className="size-3.5" />
              </div>
              <pre className="mt-3 overflow-hidden text-[11px] leading-5 text-[var(--lab-fg)]">
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
  const [activeId, setActiveId] = useState(themes[0].id)
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
                design token lab
              </p>
              <h1 className="mt-5 max-w-3xl text-balance font-heading text-5xl font-semibold leading-[0.9] tracking-[-0.055em] text-white sm:text-6xl">
                先看 HTML 风格，再提取 Tokens
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                不再收录提示词。这里用真实 UI 样张判断审美，满意后输出可给 Agent 应用到项目里的 design-tokens.md。
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["5", "风格样张"],
                ["9", "UI 部件"],
                ["1", "MD 输出"],
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

            {themes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveId(theme.id)}
                className={`group w-full rounded-[28px] border p-4 text-left transition ${
                  activeTheme.id === theme.id
                    ? "border-cyan-100/28 bg-cyan-100/10"
                    : "border-white/10 bg-white/[0.045] hover:border-white/18 hover:bg-white/[0.075]"
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/44">
                      {theme.name}
                    </p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold text-white">{theme.title}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{theme.summary}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {theme.swatches.map((color) => (
                      <span
                        key={color}
                        className="size-8 rounded-full border border-white/14"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
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
