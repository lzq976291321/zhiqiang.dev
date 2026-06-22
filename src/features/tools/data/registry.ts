import {
  CalendarDays,
  ClipboardList,
  Gauge,
  Languages,
  Library,
  ListTodo,
  SpellCheck,
} from "lucide-react"

export type ToolId =
  | "translate"
  | "prompt-library"
  | "snippets"
  | "glossary"
  | "china-calendar"
  | "reminders"
  | "lighthouse"

export type ToolDefinition = {
  id: ToolId
  title: string
  shortTitle: string
  eyebrow: string
  description: string
  local: boolean
  Icon: typeof Languages
}

export const toolDefinitions: ToolDefinition[] = [
  {
    id: "translate",
    title: "翻译 / 改写",
    shortTitle: "翻译",
    eyebrow: "AI",
    description: "结合术语表做中英翻译、中文润色和技术表达改写。",
    local: false,
    Icon: Languages,
  },
  {
    id: "prompt-library",
    title: "Prompt 模板库",
    shortTitle: "Prompt",
    eyebrow: "Prompt",
    description: "保存常用 Prompt，填写变量后生成最终可复制版本。",
    local: true,
    Icon: Library,
  },
  {
    id: "snippets",
    title: "剪贴板片段",
    shortTitle: "片段",
    eyebrow: "Clipboard",
    description: "保存常用命令、回复、链接、Prompt 片段，一键复制。",
    local: true,
    Icon: ClipboardList,
  },
  {
    id: "glossary",
    title: "技术术语表",
    shortTitle: "术语",
    eyebrow: "Glossary",
    description: "维护 Agent / MCP / Skills 等固定翻译口径，供翻译工具复用。",
    local: true,
    Icon: SpellCheck,
  },
  {
    id: "china-calendar",
    title: "中国大陆日历",
    shortTitle: "日历",
    eyebrow: "Calendar",
    description: "判断 2026 年节假日、调休工作日，并计算工作日数量。",
    local: true,
    Icon: CalendarDays,
  },
  {
    id: "reminders",
    title: "本地提醒事项",
    shortTitle: "提醒",
    eyebrow: "Reminder",
    description: "用浏览器本地保存提醒，支持通知权限和 iCalendar 导出。",
    local: true,
    Icon: ListTodo,
  },
  {
    id: "lighthouse",
    title: "Lighthouse 快捷入口",
    shortTitle: "Lighthouse",
    eyebrow: "SEO",
    description: "不自造 SEO 打分，直接生成 Lighthouse / PageSpeed 使用入口。",
    local: true,
    Icon: Gauge,
  },
]
