"use client"

import type { CSSProperties } from "react"
import { useMemo, useRef, useState } from "react"
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
    id: "liquid-glass",
    name: "Liquid Glass",
    title: "液态玻璃",
    family: "polished",
    summary: "接近系统级液态玻璃：中性透明、环境取色、厚边缘折射和柔和高光。",
    intent: "把组件处理成一层带厚度的透明材料：颜色来自背后的环境，边缘有压缩折射，中心保持清透，阴影像玻璃浮在界面上。",
    fit: "系统壳、导航、工具浮层、AI 助手、个人主页、轻量仪表盘",
    avoid: ["不要做成蓝色霓虹玻璃", "不要让玻璃面板密集堆叠", "不要用厚重黑影制造悬浮感"],
    swatches: ["#f8fbff", "#cfd8e3", "#8ab4ff", "#f6c8ff"],
    tokens: {
      background: "#11151c",
      backgroundSoft: "#edf3fb",
      foreground: "#fbfdff",
      muted: "rgba(251, 253, 255, 0.70)",
      surfaceCard: "rgba(255, 255, 255, 0.19)",
      surfaceElevated: "rgba(255, 255, 255, 0.31)",
      primary: "#f8fbff",
      primaryForeground: "#11151c",
      accent: "#8ab4ff",
      accentForeground: "#061121",
      borderSubtle: "rgba(255, 255, 255, 0.24)",
      borderStrong: "rgba(255, 255, 255, 0.58)",
      ring: "rgba(138, 180, 255, 0.46)",
      radiusCard: "34px",
      radiusButton: "999px",
      shadowCard:
        "inset 0 1px 0 rgba(255,255,255,.64), inset 0 -1px 0 rgba(255,255,255,.16), 0 18px 54px rgba(10,14,20,.22)",
      shadowFloating:
        "inset 0 1px 0 rgba(255,255,255,.78), inset 0 0 0 1px rgba(255,255,255,.16), 0 26px 88px rgba(10,14,20,.30), 0 2px 18px rgba(255,255,255,.12)",
      blurGlass: "blur(38px) saturate(1.8) brightness(1.12)",
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

const componentRecipes = [
  {
    name: "Shell",
    tokens: ["background", "foreground", "muted"],
    note: "控制页面底色、主体文字和弱信息，不在业务组件里重新定义。",
  },
  {
    name: "Card",
    tokens: ["surfaceCard", "borderSubtle", "radiusCard", "shadowCard"],
    note: "作为默认容器层，适合列表项、面板和信息块。",
  },
  {
    name: "Action",
    tokens: ["primary", "primaryForeground", "radiusButton", "ring"],
    note: "只给主按钮、关键链接和可交互焦点使用。",
  },
  {
    name: "Signal",
    tokens: ["accent", "accentForeground", "borderStrong"],
    note: "用于状态、Badge、强调信息和少量视觉锚点。",
  },
]

const implementationChecklist = [
  "先把 CSS Variables 放到主题入口，再接 Tailwind v4 mapping。",
  "先替换 Page、Card、Button、Badge、Input 五类基础组件。",
  "保留两级阴影、两级圆角和两级边框，避免每个组件造局部特例。",
  "用真实页面做一次桌面和移动端检查，再把 tokens 写入项目文档。",
]

const liquidGlassDetailedTokens = `## Liquid Glass Extended Tokens

这套扩展 token 偏“系统级液态玻璃”，不是蓝色霓虹玻璃。核心是透明材料会吸收背后环境色，边缘比中心更亮、更厚，悬浮感来自柔和投影和内高光，而不是强发光。

## Video Distillation

从「Apple 新一代最強 UI 設計！Liquid Glass 全面解析」这类系统级 Liquid Glass 拆解里，真正要落地的是四件事：

- 材质不是装饰：玻璃层要承担导航、控制、浮层这类系统外壳角色，不能铺满所有内容卡片。
- 环境决定颜色：玻璃本身保持中性，颜色来自背后的内容、壁纸、插画或状态背景。
- 边缘表达厚度：用亮边、内阴影和轻微折射表现材料厚度，中心区域要保持可读。
- 动效表达液态：交互时用小幅形变、亮边流动和柔和位移，不用夸张弹跳或大面积发光。

\`\`\`ts
export const liquidGlassTokens = {
  color: {
    base: {
      ink: "#11151c",
      graphite: "#1a2029",
      mist: "#edf3fb",
      frost: "#f8fbff",
      pearl: "#ffffff",
      shadow: "#0a0e14",
    },
    glass: {
      clear: "rgba(255, 255, 255, 0.19)",
      raised: "rgba(255, 255, 255, 0.31)",
      pressed: "rgba(255, 255, 255, 0.14)",
      veil: "rgba(255, 255, 255, 0.10)",
      milk: "rgba(255, 255, 255, 0.42)",
      chrome: "rgba(255, 255, 255, 0.72)",
    },
    refraction: {
      sky: "#8ab4ff",
      lilac: "#d9c7ff",
      rose: "#f6c8ff",
      mint: "#c8f5e6",
      amber: "#ffe3a3",
    },
    text: {
      primary: "#fbfdff",
      secondary: "rgba(251, 253, 255, 0.70)",
      tertiary: "rgba(251, 253, 255, 0.48)",
      inverse: "#11151c",
    },
    border: {
      hairline: "rgba(255, 255, 255, 0.24)",
      edge: "rgba(255, 255, 255, 0.58)",
      bright: "rgba(255, 255, 255, 0.78)",
      inner: "rgba(255, 255, 255, 0.18)",
      shadowEdge: "rgba(10, 14, 20, 0.18)",
    },
    state: {
      success: "#86efac",
      warning: "#fde68a",
      danger: "#fda4af",
      info: "#93c5fd",
      selected: "rgba(255, 255, 255, 0.42)",
      disabled: "rgba(251, 253, 255, 0.32)",
    },
  },

  semantic: {
    background: {
      app: "#11151c",
      environment: "linear-gradient(145deg, #11151c 0%, #1a2029 48%, #0f131a 100%)",
      wallpaperGlow: "radial-gradient(circle at 18% 14%, rgba(138,180,255,.30), transparent 26rem), radial-gradient(circle at 82% 20%, rgba(246,200,255,.22), transparent 24rem)",
      scrim: "rgba(17, 21, 28, 0.42)",
    },
    surface: {
      base: "rgba(255, 255, 255, 0.14)",
      raised: "rgba(255, 255, 255, 0.22)",
      floating: "rgba(255, 255, 255, 0.31)",
      selected: "rgba(255, 255, 255, 0.42)",
      solidFallback: "rgba(28, 33, 42, 0.92)",
    },
    content: {
      primary: "#fbfdff",
      secondary: "rgba(251, 253, 255, 0.70)",
      tertiary: "rgba(251, 253, 255, 0.48)",
      disabled: "rgba(251, 253, 255, 0.32)",
      onLightGlass: "#11151c",
    },
    outline: {
      separator: "rgba(255, 255, 255, 0.16)",
      control: "rgba(255, 255, 255, 0.42)",
      focus: "rgba(138, 180, 255, 0.46)",
      rim: "rgba(255, 255, 255, 0.78)",
    },
  },

  gradient: {
    page: "radial-gradient(circle at 18% 14%, rgba(138,180,255,.30), transparent 26rem), radial-gradient(circle at 82% 20%, rgba(246,200,255,.22), transparent 24rem), radial-gradient(circle at 52% 84%, rgba(200,245,230,.16), transparent 30rem), linear-gradient(145deg, #11151c 0%, #1a2029 48%, #0f131a 100%)",
    environmentBand: "linear-gradient(115deg, rgba(138,180,255,.65), rgba(246,200,255,.48) 42%, rgba(255,227,163,.34) 70%, rgba(200,245,230,.46))",
    glassSurface: "linear-gradient(145deg, rgba(255,255,255,.40), rgba(255,255,255,.18) 44%, rgba(255,255,255,.10) 100%)",
    glassEdge: "linear-gradient(135deg, rgba(255,255,255,.82), rgba(255,255,255,.26) 40%, rgba(255,255,255,.12) 100%)",
    refractionRim: "conic-gradient(from 210deg, rgba(255,255,255,.70), rgba(138,180,255,.36), rgba(246,200,255,.30), rgba(255,255,255,.62), rgba(200,245,230,.28), rgba(255,255,255,.70))",
    specularSweep: "linear-gradient(100deg, transparent 0%, rgba(255,255,255,.72) 43%, transparent 66%)",
    innerCaustic: "radial-gradient(circle at 22% 16%, rgba(255,255,255,.56), transparent 17%), radial-gradient(circle at 82% 76%, rgba(255,255,255,.18), transparent 28%)",
  },

  material: {
    thinGlass: {
      background: "rgba(255, 255, 255, 0.14)",
      border: "1px solid rgba(255, 255, 255, 0.24)",
      backdropFilter: "blur(24px) saturate(1.45) brightness(1.06)",
    },
    liquidGlass: {
      background: "linear-gradient(145deg, rgba(255,255,255,.40), rgba(255,255,255,.18) 44%, rgba(255,255,255,.10) 100%)",
      border: "1px solid rgba(255, 255, 255, 0.58)",
      backdropFilter: "blur(38px) saturate(1.8) brightness(1.12)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.64), inset 0 -1px 0 rgba(255,255,255,.16), 0 18px 54px rgba(10,14,20,.22)",
    },
    floatingGlass: {
      background: "rgba(255, 255, 255, 0.31)",
      border: "1px solid rgba(255, 255, 255, 0.78)",
      backdropFilter: "blur(46px) saturate(1.95) brightness(1.14)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.78), inset 0 0 0 1px rgba(255,255,255,.16), 0 26px 88px rgba(10,14,20,.30), 0 2px 18px rgba(255,255,255,.12)",
    },
    controlGlass: {
      background: "rgba(255, 255, 255, 0.22)",
      border: "1px solid rgba(255, 255, 255, 0.42)",
      backdropFilter: "blur(30px) saturate(1.7) brightness(1.1)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.56), 0 10px 28px rgba(10,14,20,.18)",
    },
  },

  radius: {
    icon: "14px",
    chip: "999px",
    control: "22px",
    card: "28px",
    panel: "34px",
    sheet: "46px",
  },

  space: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  },

  size: {
    iconButton: {
      sm: "32px",
      md: "40px",
      lg: "48px",
    },
    controlHeight: {
      sm: "34px",
      md: "42px",
      lg: "52px",
    },
    navHeight: {
      compact: "56px",
      regular: "72px",
    },
    glassMinTarget: "44px",
  },

  typography: {
    family: {
      ui: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'PingFang SC', sans-serif",
      display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', sans-serif",
      mono: "'SF Mono', ui-monospace, Menlo, monospace",
    },
    size: {
      caption: "12px",
      body: "15px",
      callout: "16px",
      title: "22px",
      largeTitle: "34px",
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.12,
      body: 1.48,
      relaxed: 1.68,
    },
    tracking: {
      normal: "0",
      label: "0.01em",
    },
  },

  shadow: {
    hairline: "inset 0 1px 0 rgba(255,255,255,.64)",
    card: "inset 0 1px 0 rgba(255,255,255,.64), inset 0 -1px 0 rgba(255,255,255,.16), 0 18px 54px rgba(10,14,20,.22)",
    floating: "inset 0 1px 0 rgba(255,255,255,.78), inset 0 0 0 1px rgba(255,255,255,.16), 0 26px 88px rgba(10,14,20,.30), 0 2px 18px rgba(255,255,255,.12)",
    focus: "0 0 0 4px rgba(138,180,255,.18), 0 0 0 1px rgba(255,255,255,.54)",
  },

  motion: {
    duration: {
      tap: "120ms",
      control: "220ms",
      surface: "520ms",
      ambient: "5600ms",
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      liquid: "cubic-bezier(0.65, 0, 0.35, 1)",
      float: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
  },

  interaction: {
    hover: {
      transform: "translateY(-1px)",
      background: "rgba(255, 255, 255, 0.34)",
      borderColor: "rgba(255, 255, 255, 0.78)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.82), 0 18px 48px rgba(10,14,20,.24)",
    },
    active: {
      transform: "translateY(0) scale(0.985)",
      background: "rgba(255, 255, 255, 0.18)",
      boxShadow: "inset 0 1px 8px rgba(10,14,20,.16)",
    },
    selected: {
      background: "rgba(255, 255, 255, 0.42)",
      borderColor: "rgba(255, 255, 255, 0.82)",
    },
  },

  component: {
    navBar: {
      height: "72px",
      material: "floatingGlass",
      radius: "999px",
      padding: "8px",
      itemGap: "6px",
      activeItem: "rgba(255, 255, 255, 0.42)",
    },
    tabBar: {
      height: "56px",
      material: "floatingGlass",
      radius: "999px",
      indicator: "rgba(255, 255, 255, 0.46)",
      iconColor: "rgba(251, 253, 255, 0.70)",
      activeIconColor: "#fbfdff",
    },
    sheet: {
      material: "floatingGlass",
      radius: "46px",
      maxWidth: "720px",
      padding: "24px",
      backdrop: "rgba(17, 21, 28, 0.34)",
    },
    button: {
      primary: {
        height: "44px",
        radius: "999px",
        background: "rgba(255, 255, 255, 0.72)",
        color: "#11151c",
        border: "1px solid rgba(255, 255, 255, 0.78)",
      },
      secondary: {
        height: "44px",
        radius: "999px",
        background: "rgba(255, 255, 255, 0.18)",
        color: "#fbfdff",
        border: "1px solid rgba(255, 255, 255, 0.42)",
      },
    },
    input: {
      height: "44px",
      material: "controlGlass",
      radius: "22px",
      placeholder: "rgba(251, 253, 255, 0.42)",
      focusRing: "0 0 0 4px rgba(138,180,255,.18), 0 0 0 1px rgba(255,255,255,.54)",
    },
    chip: {
      height: "32px",
      radius: "999px",
      background: "rgba(255, 255, 255, 0.16)",
      selectedBackground: "rgba(255, 255, 255, 0.42)",
    },
  },

  layer: {
    base: 0,
    glass: 10,
    nav: 100,
    sheetBackdrop: 900,
    sheet: 1000,
    toast: 1100,
  },

  accessibility: {
    minimumTextOnGlass: "rgba(251, 253, 255, 0.70)",
    stableTextScrim: "linear-gradient(180deg, rgba(17,21,28,.24), rgba(17,21,28,.42))",
    reduceTransparencyFallback: "rgba(28, 33, 42, 0.92)",
    reduceMotionDuration: "120ms",
  },
} as const
\`\`\`

## Liquid Glass CSS Variables

\`\`\`css
:root {
  --lg-ink: #11151c;
  --lg-graphite: #1a2029;
  --lg-mist: #edf3fb;
  --lg-frost: #f8fbff;
  --lg-pearl: #ffffff;

  --lg-glass-clear: rgba(255, 255, 255, 0.19);
  --lg-glass-raised: rgba(255, 255, 255, 0.31);
  --lg-glass-pressed: rgba(255, 255, 255, 0.14);
  --lg-glass-veil: rgba(255, 255, 255, 0.10);

  --lg-surface-base: rgba(255, 255, 255, 0.14);
  --lg-surface-raised: rgba(255, 255, 255, 0.22);
  --lg-surface-floating: rgba(255, 255, 255, 0.31);
  --lg-surface-selected: rgba(255, 255, 255, 0.42);
  --lg-surface-solid-fallback: rgba(28, 33, 42, 0.92);

  --lg-content-primary: #fbfdff;
  --lg-content-secondary: rgba(251, 253, 255, 0.70);
  --lg-content-tertiary: rgba(251, 253, 255, 0.48);
  --lg-content-disabled: rgba(251, 253, 255, 0.32);
  --lg-content-on-light-glass: #11151c;

  --lg-sky: #8ab4ff;
  --lg-lilac: #d9c7ff;
  --lg-rose: #f6c8ff;
  --lg-mint: #c8f5e6;
  --lg-amber: #ffe3a3;

  --lg-success: #86efac;
  --lg-warning: #fde68a;
  --lg-danger: #fda4af;
  --lg-info: #93c5fd;

  --lg-border-hairline: rgba(255, 255, 255, 0.24);
  --lg-border-edge: rgba(255, 255, 255, 0.58);
  --lg-border-bright: rgba(255, 255, 255, 0.78);
  --lg-border-separator: rgba(255, 255, 255, 0.16);
  --lg-border-control: rgba(255, 255, 255, 0.42);
  --lg-border-focus: rgba(138, 180, 255, 0.46);

  --lg-radius-icon: 14px;
  --lg-radius-chip: 999px;
  --lg-radius-control: 22px;
  --lg-radius-card: 28px;
  --lg-radius-panel: 34px;
  --lg-radius-sheet: 46px;

  --lg-space-1: 4px;
  --lg-space-2: 8px;
  --lg-space-3: 12px;
  --lg-space-4: 16px;
  --lg-space-5: 20px;
  --lg-space-6: 24px;
  --lg-space-8: 32px;
  --lg-space-10: 40px;
  --lg-space-12: 48px;

  --lg-size-icon-button-sm: 32px;
  --lg-size-icon-button-md: 40px;
  --lg-size-icon-button-lg: 48px;
  --lg-size-control-sm: 34px;
  --lg-size-control-md: 42px;
  --lg-size-control-lg: 52px;
  --lg-size-nav-compact: 56px;
  --lg-size-nav-regular: 72px;
  --lg-size-min-target: 44px;

  --lg-blur-thin: blur(24px) saturate(1.45) brightness(1.06);
  --lg-blur-panel: blur(38px) saturate(1.8) brightness(1.12);
  --lg-blur-floating: blur(46px) saturate(1.95) brightness(1.14);

  --lg-shadow-card: inset 0 1px 0 rgba(255,255,255,.64), inset 0 -1px 0 rgba(255,255,255,.16), 0 18px 54px rgba(10,14,20,.22);
  --lg-shadow-floating: inset 0 1px 0 rgba(255,255,255,.78), inset 0 0 0 1px rgba(255,255,255,.16), 0 26px 88px rgba(10,14,20,.30), 0 2px 18px rgba(255,255,255,.12);
  --lg-shadow-focus: 0 0 0 4px rgba(138,180,255,.18), 0 0 0 1px rgba(255,255,255,.54);

  --lg-hover-transform: translateY(-1px);
  --lg-active-transform: translateY(0) scale(0.985);
  --lg-text-scrim: linear-gradient(180deg, rgba(17,21,28,.24), rgba(17,21,28,.42));
  --lg-reduce-transparency: rgba(28, 33, 42, 0.92);

  --lg-font-ui: ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", sans-serif;
  --lg-font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", sans-serif;
  --lg-text-caption: 12px;
  --lg-text-body: 15px;
  --lg-text-callout: 16px;
  --lg-text-title: 22px;
  --lg-text-large-title: 34px;
  --lg-leading-body: 1.48;
  --lg-leading-relaxed: 1.68;

  --lg-z-glass: 10;
  --lg-z-nav: 100;
  --lg-z-sheet-backdrop: 900;
  --lg-z-sheet: 1000;
  --lg-z-toast: 1100;
}
\`\`\`

## CSS Utility Blueprint

\`\`\`css
.lg-material {
  border: 1px solid var(--lg-border-edge);
  background: linear-gradient(145deg, rgba(255,255,255,.40), rgba(255,255,255,.18) 44%, rgba(255,255,255,.10));
  box-shadow: var(--lg-shadow-card);
  backdrop-filter: var(--lg-blur-panel);
  -webkit-backdrop-filter: var(--lg-blur-panel);
}

.lg-material::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: "";
  border-radius: inherit;
  background:
    linear-gradient(135deg, rgba(255,255,255,.52), transparent 34%),
    radial-gradient(circle at 22% 0%, rgba(255,255,255,.36), transparent 32%);
  mask-image: linear-gradient(black, transparent 72%);
}

.lg-control {
  min-height: var(--lg-size-min-target);
  border-radius: var(--lg-radius-control);
  transition:
    transform 220ms cubic-bezier(0.2, 0, 0, 1),
    background 220ms cubic-bezier(0.2, 0, 0, 1),
    box-shadow 220ms cubic-bezier(0.2, 0, 0, 1);
}

.lg-control:hover {
  transform: var(--lg-hover-transform);
}

.lg-control:active {
  transform: var(--lg-active-transform);
}

@media (prefers-reduced-transparency: reduce) {
  .lg-material {
    background: var(--lg-reduce-transparency);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lg-control {
    transition-duration: 120ms;
  }
}
\`\`\`

## Liquid Glass Component Rules

- Page：背景必须有可被玻璃“吸收”的环境色块，玻璃本身不要承担主色。
- Card：默认用 \`thinGlass\`；核心容器用 \`liquidGlass\`；弹层和导航才用 \`floatingGlass\`。
- Button：主按钮可以是白色液态胶囊，辅按钮用透明玻璃；悬浮时只增加内高光和轻微上浮。
- Input：使用 \`controlGlass\`，焦点只加浅蓝系统 ring，不做整块发光。
- Nav / Tab：可以使用最高级别 \`floatingGlass\`，但需要固定高度、明确 hit area 和当前态。
- Sheet / Modal：背景遮罩要轻，不要把页面压黑；浮层边缘比主体更亮。
- State：成功、警告、危险色只做小面积状态，不改变玻璃主材质。
- Edge：边缘高光要比中心更明显，模拟厚玻璃压缩后的亮边。
- Text：正文放在暗面或稳定玻璃面上，不直接压在环境色带和高光扫线上。
- Accessibility：正文所在玻璃层必须有暗色 scrim 或稳定底色；用户开启降低透明度时切到 \`--lg-reduce-transparency\`。

## Liquid Glass Component Mapping

| Component | Material | Key Tokens |
| --- | --- | --- |
| App Background | environment | \`semantic.background.environment\`, \`gradient.page\` |
| Nav Bar | floatingGlass | \`component.navBar\`, \`layer.nav\` |
| Tab Bar | floatingGlass | \`component.tabBar\`, \`component.tabBar.indicator\` |
| Card | thinGlass | \`material.thinGlass\`, \`radius.card\`, \`shadow.card\` |
| Primary Panel | liquidGlass | \`material.liquidGlass\`, \`gradient.glassEdge\` |
| Sheet | floatingGlass | \`component.sheet\`, \`layer.sheet\` |
| Button | controlGlass | \`component.button\`, \`interaction.hover\`, \`interaction.active\` |
| Input | controlGlass | \`component.input\`, \`shadow.focus\` |
| Chip | thinGlass | \`component.chip\`, \`semantic.surface.selected\` |
`

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
  const detailedTokens = theme.id === "liquid-glass" ? `\n${liquidGlassDetailedTokens}\n` : ""
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
${detailedTokens}

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

## Implementation Checklist

${implementationChecklist.map((item) => `- ${item}`).join("\n")}

## Agent Handoff Prompt

\`\`\`text
请把这套 Design Tokens 应用到当前项目。先映射 CSS variables 与 Tailwind v4 theme，再按 Page、Card、Button、Badge、Input 的顺序替换基础组件。不要新增无关视觉特效；如果现有组件缺少对应 token，优先复用语义最接近的 token。
\`\`\`

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
  const isLiquidGlass = theme.id === "liquid-glass"
  const previewStyle = themeStyle(theme)
  previewStyle.boxShadow = isHardEdge
    ? "var(--lab-shadow-floating)"
    : isLiquidGlass
      ? "0 30px 110px rgba(10,14,20,0.32)"
      : "0 30px 120px rgba(0,0,0,0.34)"
  const frameStyle: CSSProperties | undefined = isHardEdge
    ? {
        backgroundImage:
          "linear-gradient(90deg, var(--lab-border) 1px, transparent 1px), linear-gradient(var(--lab-border) 1px, transparent 1px), linear-gradient(135deg, var(--lab-bg), var(--lab-bg-soft))",
        backgroundSize: "34px 34px, 34px 34px, 100% 100%",
      }
    : isLiquidGlass
      ? {
          backgroundImage:
            "radial-gradient(circle at 18% 18%, rgba(138,180,255,.34), transparent 18rem), radial-gradient(circle at 82% 22%, rgba(246,200,255,.26), transparent 16rem), radial-gradient(circle at 56% 82%, rgba(255,227,163,.18), transparent 19rem), linear-gradient(145deg, #11151c, #1a2029 48%, #0f131a)",
        }
    : undefined
  const surfaceEffect: CSSProperties = isHardEdge
    ? { boxShadow: "var(--lab-shadow-card)" }
    : isLiquidGlass
      ? {
          backdropFilter: "var(--lab-blur)",
          WebkitBackdropFilter: "var(--lab-blur)",
          backgroundImage:
            "linear-gradient(145deg, rgba(255,255,255,.34), rgba(255,255,255,.16) 48%, rgba(255,255,255,.08)), radial-gradient(circle at 18% 0%, rgba(255,255,255,.36), transparent 30%)",
          boxShadow: "var(--lab-shadow-card)",
        }
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
        ) : isLiquidGlass ? (
          <>
            <div className="pointer-events-none absolute left-[8%] top-[10%] h-32 w-[72%] rotate-[-10deg] rounded-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,.44),transparent)] blur-md" />
            <div className="pointer-events-none absolute right-[8%] top-[14%] h-28 w-28 rounded-full bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,.74),rgba(255,255,255,.18)_44%,transparent_72%)]" />
            <div className="pointer-events-none absolute bottom-[14%] left-[8%] h-40 w-40 rounded-[44px] border border-white/22 bg-white/[0.08] backdrop-blur-3xl" />
            <div className="pointer-events-none absolute bottom-[12%] right-[10%] h-36 w-56 rounded-full bg-[conic-gradient(from_210deg,rgba(255,255,255,.54),rgba(138,180,255,.20),rgba(246,200,255,.18),rgba(255,255,255,.44),rgba(200,245,230,.16),rgba(255,255,255,.54))] opacity-55 blur-[1px]" />
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
            <span className="text-sm font-semibold">Token 工坊</span>
          </div>
          <div className={`hidden items-center gap-4 text-xs text-[var(--lab-muted)] sm:flex ${isHardEdge ? "font-mono uppercase" : ""}`}>
            <span>样张</span>
            <span>Tokens</span>
            <span>应用</span>
          </div>
          <span
            className={`bg-[var(--lab-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--lab-primary-fg)] ${
              isHardEdge
                ? "rounded-[var(--lab-radius-button)] border-2 border-[var(--lab-border-strong)] font-mono uppercase"
                : "rounded-[var(--lab-radius-button)]"
            }`}
          >
            导出
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
              先验收样张，再导出 Tokens
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
                导出 MD
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
                <span className="text-sm font-semibold">验收标准</span>
                <BadgeCheck className="size-4 text-[var(--lab-accent)]" />
              </div>
              {["对比度可读", "语义变量完整", "圆角层级统一"].map((item) => (
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
              <span className="text-xs font-medium text-[var(--lab-muted)]">风格备注</span>
              <input
                readOnly
                value={isHardEdge ? "硬边框 / 偏移阴影 / 无模糊" : theme.name}
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

function ThemeSelector({
  activeTheme,
  onSelect,
}: {
  activeTheme: LabTheme
  onSelect: (themeId: string) => void
}) {
  return (
    <aside className="glass-card overflow-hidden lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
      <div className="border-b border-white/10 p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
          视觉方向
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h2 className="font-heading text-2xl font-semibold text-white sm:text-3xl">风格样张</h2>
          <Frame className="size-5 text-white/42" />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:px-4 lg:mx-0 lg:mb-4 lg:grid lg:grid-cols-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {hardEdgeThemes.map((theme, index) => (
            <button
              key={theme.id}
              type="button"
              aria-pressed={activeTheme.id === theme.id}
              onClick={() => onSelect(theme.id)}
              className={`group min-w-[240px] border-2 p-3 text-left transition lg:min-w-0 ${
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

        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:-mx-4 sm:px-4 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0">
          {themes.map((theme) => {
            const isThemeHardEdge = theme.family === "hard-edge"

            return (
              <button
                key={theme.id}
                type="button"
                aria-pressed={activeTheme.id === theme.id}
                onClick={() => onSelect(theme.id)}
                className={`group min-w-[230px] border p-3 text-left transition lg:w-full lg:min-w-0 ${
                  isThemeHardEdge ? "rounded-[10px] border-2" : "rounded-[22px]"
                } ${
                  activeTheme.id === theme.id
                    ? isThemeHardEdge
                      ? "border-yellow-200/80 bg-yellow-200/[0.09]"
                      : "border-cyan-100/28 bg-cyan-100/10"
                    : "border-white/10 bg-white/[0.045] hover:border-white/18 hover:bg-white/[0.075]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
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
                    <h3 className="mt-2 font-heading text-xl font-semibold text-white">
                      {theme.title}
                    </h3>
                  </div>
                  <div className="mt-1 hidden shrink-0 gap-1 sm:flex">
                    {theme.swatches.slice(0, 4).map((color) => (
                      <span
                        key={color}
                        className={`size-5 border border-white/14 ${
                          isThemeHardEdge ? "rounded-[2px]" : "rounded-full"
                        }`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 hidden text-sm leading-6 text-white/48 lg:line-clamp-2 lg:block">
                  {theme.summary}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

function TokenArtifact({
  activeTheme,
  markdown,
}: {
  activeTheme: LabTheme
  markdown: string
}) {
  return (
    <aside className="glass-card overflow-hidden xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-end sm:justify-between xl:flex-col xl:items-start">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
            Token 文档
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-white">
            design-tokens.md
          </h2>
        </div>
        <CopyButton text={markdown} className="self-start" />
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[0.9fr_1.1fr] xl:block xl:space-y-4">
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
              文档预览
            </span>
            <span className="text-xs text-white/32">{activeTheme.name}</span>
          </div>
          <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap p-4 font-mono text-[11px] leading-5 text-cyan-50/66 xl:max-h-[42vh]">
            {markdown}
          </pre>
        </div>
      </div>
    </aside>
  )
}

function TokenPlaybook({ activeTheme }: { activeTheme: LabTheme }) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/40">
              apply map
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white/86">
              组件落点
            </h3>
          </div>
          <Layers3 className="size-5 text-cyan-100/52" />
        </div>

        <div className="grid gap-2">
          {componentRecipes.map((recipe) => (
            <div
              key={recipe.name}
              className="grid gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] p-3 sm:grid-cols-[96px_minmax(0,1fr)]"
            >
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">
                  {recipe.name}
                </p>
                <div className="mt-2 flex gap-1">
                  {recipe.tokens.slice(0, 3).map((token) => (
                    <span
                      key={token}
                      className="size-3 rounded-full border border-white/14"
                      style={{
                        background: (() => {
                          const value = activeTheme.tokens[token as keyof TokenSet]
                          return value.startsWith("#") || value.startsWith("rgb")
                            ? value
                            : activeTheme.tokens.primary
                        })(),
                      }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.tokens.map((token) => (
                    <code
                      key={token}
                      className="rounded-md border border-white/10 bg-white/[0.055] px-1.5 py-0.5 font-mono text-[10px] text-cyan-50/62"
                    >
                      {token}
                    </code>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-white/45">{recipe.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-100/40">
              delivery
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-white/86">
              落地清单
            </h3>
          </div>
          <BadgeCheck className="size-5 text-emerald-100/56" />
        </div>

        <div className="space-y-3">
          {implementationChecklist.map((item, index) => (
            <div key={item} className="flex gap-3 rounded-[18px] border border-white/10 bg-white/[0.04] p-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full border border-cyan-100/16 bg-cyan-100/[0.08] font-mono text-[10px] text-cyan-50/64">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-xs leading-5 text-white/52">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export function DesignTokenLab() {
  const [activeId, setActiveId] = useState("liquid-glass")
  const previewRef = useRef<HTMLElement>(null)
  const activeTheme = themes.find((theme) => theme.id === activeId) ?? themes[0]
  const markdown = useMemo(() => generateMarkdown(activeTheme), [activeTheme])
  const handleThemeSelect = (themeId: string) => {
    setActiveId(themeId)

    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => {
        previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:pt-28">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[70vh] w-[94vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_18%_16%,rgba(255,209,138,0.18),transparent_34rem),radial-gradient(ellipse_at_78%_12%,rgba(159,232,255,0.24),transparent_34rem),radial-gradient(ellipse_at_58%_76%,rgba(184,247,212,0.14),transparent_32rem)]" />

      <div className="mx-auto max-w-[92rem]">
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
          className="glass-card mb-4 overflow-hidden p-4 sm:mb-5 sm:p-6"
        >
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-100/48">
                design token lab / token workshop
              </p>
              <h1 className="mt-3 max-w-4xl text-balance font-heading text-3xl font-semibold leading-[1.04] tracking-[-0.03em] text-white sm:mt-4 sm:text-5xl sm:tracking-[-0.035em]">
                把视觉方向沉淀成 Design Tokens
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62 sm:mt-4 sm:text-base sm:leading-7">
                选择一套风格，先检查真实组件样张，再复制可落地的 design-tokens.md。适合给 Agent 或项目主题直接使用。
              </p>
            </div>

            <div className="hidden gap-3 sm:grid sm:grid-cols-3 lg:w-[420px]">
              {[
                [String(themes.length), "风格样张"],
                ["12", "UI 部件"],
                [String(hardEdgeThemes.length), "硬边方向"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
                  <p className="font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-white/42">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <section className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <ThemeSelector activeTheme={activeTheme} onSelect={handleThemeSelect} />

          <section ref={previewRef} className="min-w-0 scroll-mt-20 lg:sticky lg:top-24 lg:self-start">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
                  组件样张
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold text-white">
                  {activeTheme.title}
                </h2>
              </div>
              <div className="flex gap-1.5">
                {activeTheme.swatches.map((color) => (
                  <span
                    key={color}
                    className={`size-8 border border-white/14 ${
                      activeTheme.family === "hard-edge" ? "rounded-[2px]" : "rounded-full"
                    }`}
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
            <TokenPreview theme={activeTheme} />
            <TokenPlaybook activeTheme={activeTheme} />
          </section>

          <TokenArtifact activeTheme={activeTheme} markdown={markdown} />
        </section>
      </div>
    </main>
  )
}
