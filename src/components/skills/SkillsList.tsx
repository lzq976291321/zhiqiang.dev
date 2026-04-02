"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Skill } from "@/lib/types"
import { PageShell } from "@/components/shared/PageShell"

const ROLES = ["全部", "前端开发者", "后端开发者", "独立开发者", "产品经理", "安全合规"]

const sourceColor: Record<string, string> = {
  official: "text-warm/60 bg-warm/8",
  community: "text-foreground/30 bg-foreground/[0.04]",
  vendor: "text-orange/60 bg-orange/8",
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border border-foreground/[0.04] rounded-xl overflow-hidden bg-surface/30 hover:bg-surface/50 transition-colors duration-300"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-heading font-bold text-foreground/80 font-mono">
              {skill.title}
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${sourceColor[skill.source] ?? sourceColor.community}`}>
              {skill.source}
            </span>
          </div>
          <p className="text-sm text-foreground/30 leading-relaxed">{skill.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skill.roles.map((r) => (
              <span key={r} className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md bg-foreground/[0.03] text-foreground/20">
                {r}
              </span>
            ))}
          </div>
        </div>

        <motion.svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="mt-1 text-foreground/15 shrink-0"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-foreground/[0.04]">
              {skill.trigger && (
                <p className="text-[12px] text-foreground/20 mb-2">
                  <span className="text-foreground/35">触发方式：</span>{skill.trigger}
                </p>
              )}
              {skill.installs && (
                <p className="text-[12px] text-foreground/20">
                  <span className="text-foreground/35">安装量：</span>{skill.installs.toLocaleString()}+
                </p>
              )}
              <div className="mt-3 text-sm text-foreground/25 leading-relaxed prose-sm">
                {skill.content.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} className="mb-1">{line}</p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function SkillsList({ skills }: { skills: Skill[] }) {
  const [role, setRole] = useState("全部")
  const filtered = role === "全部" ? skills : skills.filter((s) => s.roles.includes(role))

  return (
    <PageShell title="Skills" subtitle="Claude Code Skills 按角色分类收集，找到适合你的工具" accent="#F97316">
      {/* 角色筛选 */}
      <div className="flex flex-wrap gap-2 mb-10">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`px-3 py-1 rounded-lg text-[12px] font-mono tracking-wider transition-all duration-200 ${
              role === r
                ? "bg-orange/10 text-orange"
                : "text-foreground/25 hover:text-foreground/40 hover:bg-foreground/[0.03]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((s, i) => (
            <SkillCard key={s.slug} skill={s} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-foreground/20 py-20 text-sm">暂无匹配的 Skill</p>
      )}
    </PageShell>
  )
}
