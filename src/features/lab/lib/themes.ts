import type { CSSProperties } from "react"

export type ThemeId = "paper" | "graphite" | "cobalt"
export type TokenGroup = "colors" | "type" | "layout"

export const tokenDefinitions = {
  background: ["背景", "colors"],
  surface: ["内容面", "colors"],
  elevated: ["浮起层", "colors"],
  foreground: ["正文", "colors"],
  muted: ["次级文字", "colors"],
  border: ["分隔线", "colors"],
  accent: ["强调色", "colors"],
  "accent-soft": ["选中背景", "colors"],
  "accent-foreground": ["强调色上文字", "colors"],
  success: ["完成状态", "colors"],
  "success-soft": ["完成背景", "colors"],
  warning: ["进行状态", "colors"],
  "warning-soft": ["进行背景", "colors"],
  "font-body": ["界面字体", "type"],
  "font-heading": ["标题字体", "type"],
  "font-mono": ["数据字体", "type"],
  "text-xs": ["标签字号", "type"],
  "text-sm": ["辅助字号", "type"],
  "text-body": ["正文字号", "type"],
  "text-title": ["标题字号", "type"],
  "line-height": ["正文行高", "type"],
  "space-1": ["紧凑间距", "layout"],
  "space-2": ["元素间距", "layout"],
  "space-3": ["列表内距", "layout"],
  "space-4": ["区块间距", "layout"],
  "space-6": ["面板内距", "layout"],
  "space-8": ["内容留白", "layout"],
  "radius-sm": ["控件圆角", "layout"],
  "radius-lg": ["面板圆角", "layout"],
  "shadow-card": ["面板阴影", "layout"],
} as const

export type TokenName = keyof typeof tokenDefinitions
export type Tokens = Record<TokenName, string>
export type LabTheme = {
  id: ThemeId
  name: string
  chineseName: string
  scene: string
  description: string
  principles: [string, string, string]
  tokens: Tokens
}

const sans = 'Inter, "PingFang SC", "Microsoft YaHei", sans-serif'
const mono = '"SFMono-Regular", Consolas, monospace'
const shared = { "font-body": sans, "font-mono": mono, "space-1": "4px", "space-2": "8px" }

export const labThemes: LabTheme[] = [
  {
    id: "paper", name: "Paper", chineseName: "纸页", scene: "阅读空间",
    description: "温暖的纸色、舒展的文字与安静的边注。让长内容值得停留。",
    principles: ["衬线标题与宽松行距", "纸色区分阅读与导航", "陶土色只标记阅读位置"],
    tokens: {
      ...shared, background: "#f0eee8", surface: "#fffdf7", elevated: "#ffffff",
      foreground: "#302d28", muted: "#817b70", border: "#e4dfd4", accent: "#93664b",
      "accent-soft": "#eee3d5", "accent-foreground": "#fffdf7", success: "#527254", "success-soft": "#e7eddf",
      warning: "#926b31", "warning-soft": "#f5ebd6",
      "font-heading": '"Iowan Old Style", "Songti SC", "Noto Serif SC", Georgia, serif',
      "text-xs": "10px", "text-sm": "12px", "text-body": "14px", "text-title": "30px", "line-height": "1.95",
      "space-3": "12px", "space-4": "18px", "space-6": "26px", "space-8": "36px",
      "radius-sm": "4px", "radius-lg": "8px", "shadow-card": "0 2px 8px #302d2805, 0 12px 30px #302d2805",
    },
  },
  {
    id: "graphite", name: "Graphite", chineseName: "石墨", scene: "AI 任务工作台",
    description: "近黑的底色托起任务、过程与产物。用亮度建立层级，让状态一目了然。",
    principles: ["三层灰度组织工作区", "等宽文字承载执行细节", "柔和薄荷绿标记完成"],
    tokens: {
      ...shared, background: "#17191c", surface: "#202327", elevated: "#292d32",
      foreground: "#eaede9", muted: "#9bA39f", border: "#373c40", accent: "#c1dcc7",
      "accent-soft": "#303e35", "accent-foreground": "#203328", success: "#b0d8be", "success-soft": "#293e32",
      warning: "#e1c28e", "warning-soft": "#40382b", "font-heading": sans,
      "text-xs": "10px", "text-sm": "12px", "text-body": "13px", "text-title": "22px", "line-height": "1.7",
      "space-3": "10px", "space-4": "16px", "space-6": "22px", "space-8": "30px",
      "radius-sm": "6px", "radius-lg": "10px", "shadow-card": "0 8px 28px #00000020",
    },
  },
  {
    id: "cobalt", name: "Cobalt", chineseName: "蓝图", scene: "项目工作台",
    description: "干净的白底、紧凑的列表与准确的蓝色。让密集信息保持秩序。",
    principles: ["紧凑列表呈现项目进度", "钴蓝只用于操作与选择", "细边框取代大面积阴影"],
    tokens: {
      ...shared, background: "#f3f5f9", surface: "#ffffff", elevated: "#f9faff",
      foreground: "#243047", muted: "#748094", border: "#e1e6ef", accent: "#335bc9",
      "accent-soft": "#eaf0ff", "accent-foreground": "#ffffff", success: "#367659", "success-soft": "#eaf4ed",
      warning: "#996d2a", "warning-soft": "#fff5e3", "font-heading": sans,
      "text-xs": "10px", "text-sm": "11px", "text-body": "13px", "text-title": "23px", "line-height": "1.65",
      "space-3": "10px", "space-4": "14px", "space-6": "20px", "space-8": "28px",
      "radius-sm": "5px", "radius-lg": "8px", "shadow-card": "0 2px 5px #24304706",
    },
  },
]

export function themeStyle(theme: LabTheme): CSSProperties {
  return Object.fromEntries(Object.entries(theme.tokens).map(([key, value]) => [`--lab-${key}`, value])) as CSSProperties
}

export function themeCSS(theme: LabTheme) {
  return `/* ${theme.name} · ${theme.chineseName} — zhiqiang.chat UI Lab */\n[data-ui-theme="${theme.id}"] {\n${Object.entries(theme.tokens).map(([key, value]) => `  --lab-${key}: ${value};`).join("\n")}\n`
}

export function themeJSON(theme: LabTheme) {
  return JSON.stringify({ name: theme.name, id: theme.id, scene: theme.scene, tokens: theme.tokens }, null, 2)
}

export function themeMarkdown(theme: LabTheme) {
  return `# ${theme.name} · ${theme.chineseName}\n\n${theme.description}\n\n## 适用场景\n\n${theme.scene}。\n\n## 设计原则\n\n${theme.principles.map((item) => `- ${item}`).join("\n")}\n\n## 设计变量\n\n| 变量 | 用途 | 值 |\n| --- | --- | --- |\n${Object.entries(theme.tokens).map(([key, value]) => `| \`--lab-${key}\` | ${tokenDefinitions[key as TokenName][0]} | \`${value}\` |`).join("\n")}\n\n## CSS\n\n\`\`\`css\n${themeCSS(theme)}\`\`\`\n\n## 使用\n\n在容器上设置 \`data-ui-theme="${theme.id}"\`，然后使用 \`var(--lab-background)\` 等变量。变量名、值与 UI Lab 预览一致；布局与组件交互需要单独实现。此文件不包含完整页面代码。\n\n来源：zhiqiang.chat/lab\n`
}
