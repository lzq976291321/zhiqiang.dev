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
