"use client"

import { motion } from "framer-motion"
import { PageShell } from "@/components/shared/PageShell"

const TIMELINE = [
  { year: "现在", title: "独立开发者", desc: "一个人全干：产品设计、前后端开发、部署运维。专注 AI 工具链与个人品牌建设。" },
  { year: "持续", title: "技术栈", desc: "Next.js + React + Tailwind CSS（前端）/ NestJS + Prisma + Supabase（后端）/ Vercel + Railway（部署）" },
  { year: "关注", title: "方向", desc: "SEO/AEO 优化、AIGC 工具链（Claude Skills / MCP / Prompt 工程）、独立产品。" },
]

const SKILLS = [
  { name: "React / Next.js", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Tailwind CSS", level: 90 },
  { name: "NestJS / Node.js", level: 85 },
  { name: "Prisma / PostgreSQL", level: 80 },
  { name: "AI 工具链", level: 85 },
]

const SOCIALS = [
  {
    label: "GitHub",
    href: "https://github.com/linzhiqiang",
    icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
  },
  {
    label: "Twitter / X",
    href: "https://x.com/linzhiqiang",
    icon: <path d="M4 4l11.733 16h4.267l-11.733 -16h-4.267zm6.617 6.911l-6.617 9.089h4.267l4.617 -6.34" />,
  },
  {
    label: "Email",
    href: "mailto:hi@zhiqiang.dev",
    icon: <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>,
  },
]

function SkillBar({ name, level, index }: { name: string; level: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-foreground/50">{name}</span>
        <span className="text-[11px] font-mono text-foreground/20">{level}%</span>
      </div>
      <div className="h-1 rounded-full bg-foreground/[0.04] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #C8A97E, #C8A97E)" }}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + index * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  )
}

export default function AboutPage() {
  return (
    <PageShell title="关于" subtitle="一个人全干的独立开发者" accent="#A78BFA">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        {/* 左侧：时间线 */}
        <div className="lg:col-span-3">
          <h2 className="text-sm font-mono tracking-[0.15em] uppercase text-foreground/20 mb-6">
            经历
          </h2>
          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative pl-6 border-l border-foreground/[0.06]"
              >
                {/* 圆点 */}
                <div
                  className="absolute left-0 top-1 w-2 h-2 rounded-full -translate-x-[4.5px]"
                  style={{ background: i === 0 ? "#C8A97E" : "rgba(200,169,126,0.2)" }}
                />
                <span className="text-[11px] font-mono tracking-wider text-gold/50 block mb-1">
                  {item.year}
                </span>
                <h3 className="text-base font-heading font-bold text-foreground/75 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground/30 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* 社交链接 */}
          <h2 className="text-sm font-mono tracking-[0.15em] uppercase text-foreground/20 mt-14 mb-6">
            联系
          </h2>
          <div className="flex flex-wrap gap-3">
            {SOCIALS.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -2 }}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/[0.05] hover:border-gold/15 bg-surface/30 hover:bg-surface/50 transition-all duration-300"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="text-foreground/25 group-hover:text-gold/60 transition-colors"
                >
                  {s.icon}
                </svg>
                <span className="text-sm text-foreground/35 group-hover:text-foreground/60 transition-colors">
                  {s.label}
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* 右侧：技能 */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-mono tracking-[0.15em] uppercase text-foreground/20 mb-6">
            技能
          </h2>
          <div className="space-y-5">
            {SKILLS.map((s, i) => (
              <SkillBar key={s.name} {...s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
