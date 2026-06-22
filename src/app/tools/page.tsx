import type { Metadata } from "next"
import { ToolsWorkbench } from "@/features/tools/components/ToolsWorkbench"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "工具",
  description:
    "面向个人工作流的在线工具站：翻译改写、Prompt 模板、剪贴板片段、技术术语表、中国大陆日历、本地提醒和 Lighthouse 快捷入口。",
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
  openGraph: {
    title: "工具 | zhiqiang.chat",
    description:
      "翻译改写、Prompt 模板、剪贴板片段、中国大陆日历、本地提醒和 Lighthouse 快捷入口。",
    url: `${siteConfig.url}/tools`,
  },
}

export default function ToolsPage() {
  return (
    <main className="relative min-h-screen px-4 pb-24 pt-24 sm:px-6 lg:pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[52vh] overflow-hidden">
        <div className="absolute left-[18%] top-4 h-72 w-72 rounded-full bg-cyan-300/16 blur-3xl" />
        <div className="absolute right-[12%] top-8 h-80 w-80 rounded-full bg-emerald-300/12 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <header className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase text-cyan-100/48">
              zhiqiang.chat / tools
            </p>
            <h1 className="mt-3 max-w-4xl font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl">
              个人工具站
            </h1>
          </div>
          <p className="rounded-[24px] border border-white/12 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/58 backdrop-blur-xl">
            放能直接用的工具：翻译、片段、Prompt、日历、提醒和 Lighthouse 标准入口。
          </p>
        </header>

        <ToolsWorkbench />
      </div>
    </main>
  )
}
