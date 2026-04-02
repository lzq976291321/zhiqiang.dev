"use client"

import { motion } from "framer-motion"
import { PageShell } from "@/components/shared/PageShell"

const PROJECTS = [
  {
    title: "zhiqiang.dev",
    desc: "你正在看的这个网站。个人博客 × AI 工具库，Next.js + Tailwind + Framer Motion + MDX。",
    tags: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://github.com/linzhiqiang/zhiqiang.dev",
    accent: "#C8A97E",
    span: "col-span-1 sm:col-span-2",
  },
  {
    title: "Skills 收集库",
    desc: "Claude Code Skills 按角色分类收集，覆盖前端/后端/独立开发者/产品经理/安全。",
    tags: ["Claude Code", "AI"],
    href: "/skills",
    accent: "#C8A97E",
    span: "col-span-1",
  },
  {
    title: "Prompt 模板库",
    desc: "生图生视频 Prompt 模板，覆盖 Midjourney / ChatGPT / Sora / Runway / Kling。",
    tags: ["AIGC", "Prompt"],
    href: "/prompts",
    accent: "#C8A97E",
    span: "col-span-1",
  },
  {
    title: "MCP 精选",
    desc: "从 20000+ MCP Server 中精选真正好用的，带安装命令和安全提醒。",
    tags: ["MCP", "AI Tools"],
    href: "/mcp",
    accent: "#00F5D4",
    span: "col-span-1 sm:col-span-2",
  },
]

export default function ProjectsPage() {
  return (
    <PageShell title="项目" subtitle="个人作品与开源项目" accent="#FB923C">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROJECTS.map((p, i) => (
          <motion.a
            key={p.title}
            href={p.href}
            target={p.href.startsWith("http") ? "_blank" : undefined}
            rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            className={`group block p-6 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.08] bg-surface/30 hover:bg-surface/50 transition-all duration-300 ${p.span}`}
          >
            {/* 顶部色条 */}
            <div
              className="h-[2px] w-12 rounded-full mb-5 group-hover:w-20 transition-all duration-500"
              style={{ background: p.accent }}
            />

            <h3 className="text-lg font-heading font-bold text-foreground/85 group-hover:text-foreground transition-colors mb-2">
              {p.title}
            </h3>

            <p className="text-sm text-foreground/30 group-hover:text-foreground/40 transition-colors leading-relaxed mb-4">
              {p.desc}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md bg-foreground/[0.03] text-foreground/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 箭头 */}
            <div className="mt-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: `${p.accent}70` }}>
              <span className="text-[11px] font-mono">{p.href.startsWith("http") ? "GitHub" : "查看"}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
          </motion.a>
        ))}
      </div>
    </PageShell>
  )
}
