"use client"

import { motion } from "framer-motion"
import { PageShell } from "@/components/shared/PageShell"

const PROJECTS = [
  {
    title: "RC模友圈",
    desc: "国内免费的遥控模型垂直社区，专注遥控船、遥控车、维修技术交流。从入门到精通的 RC 爱好者之家。",
    tags: ["Next.js", "Supabase", "社区"],
    href: "https://rcmyq.cn",
    accent: "#d35400",
    span: "col-span-1 sm:col-span-2",
  },
  {
    title: "zhiqiang.dev",
    desc: "你正在看的这个网站。AI 工具库 + 个人展示，editorial 杂志风设计。",
    tags: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://github.com/lzq976291321/zhiqiang.dev",
    accent: "#C8A97E",
    span: "col-span-1",
  },
  {
    title: "Skills 工具库",
    desc: "30 个 Claude Code Skills 按角色分类，带是否值得长期启用的判断。",
    tags: ["Claude Code", "AI"],
    href: "/skills",
    accent: "#C8A97E",
    span: "col-span-1",
  },
  {
    title: "Prompt Studio",
    desc: "参考 OpenNana 提示词图库抽样重写的生图、生视频案例：写真、广告、美食和娱乐短片。",
    tags: ["Prompt", "OpenNana", "Video"],
    href: "/prompts",
    accent: "#9FE8FF",
    span: "col-span-1",
  },
  {
    title: "MCP 精选",
    desc: "16 个值得接入的 MCP，按角色、风险和权限边界重新筛选。",
    tags: ["MCP", "AI Tools"],
    href: "/mcp",
    accent: "#C8A97E",
    span: "col-span-1",
  },
]

export default function ProjectsPage() {
  return (
    <PageShell title="项目" subtitle="个人作品与开源项目" accent="#B8F7D4">
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
            className={`glass-card group block p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-100/22 hover:bg-white/[0.095] ${p.span}`}
          >
            {/* 顶部色条 */}
            <div
              className="mb-5 h-[2px] w-12 rounded-full bg-cyan-100/60 transition-all duration-500 group-hover:w-20"
            />

            <h3 className="mb-2 font-heading text-2xl font-semibold tracking-[-0.025em] text-white/88 transition-colors group-hover:text-white">
              {p.title}
            </h3>

            <p className="mb-4 text-sm leading-relaxed text-white/48 transition-colors group-hover:text-white/58">
              {p.desc}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/38"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 箭头 */}
            <div className="mt-4 flex items-center gap-1.5 text-cyan-50/68 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
