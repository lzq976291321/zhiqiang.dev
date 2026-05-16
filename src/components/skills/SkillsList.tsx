"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Skill } from "@/lib/types"
import { PageShell } from "@/components/shared/PageShell"

const ROLES = ["全部", "前端开发者", "后端开发者", "独立开发者", "产品经理", "安全合规"]

const sourceColor: Record<string, string> = {
  official: "text-cyan-50/80 bg-cyan-100/10 border-cyan-100/18",
  community: "text-white/46 bg-white/[0.05] border-white/10",
  vendor: "text-emerald-50/80 bg-emerald-100/10 border-emerald-100/18",
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/22 hover:bg-white/[0.09]"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-heading text-xl font-semibold tracking-[-0.02em] text-white/90">
              {skill.title}
            </h3>
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] ${sourceColor[skill.source] ?? sourceColor.community}`}>
              {skill.source}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/48">{skill.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skill.roles.map((r) => (
              <span key={r} className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/36">
                {r}
              </span>
            ))}
          </div>
        </div>

        <motion.svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="mt-1 shrink-0 text-white/32"
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
            <div className="border-t border-white/10 px-5 pb-5 pt-4 sm:px-6">
              {skill.trigger && (
                <p className="mb-2 text-[12px] text-white/42">
                  <span className="text-white/62">触发方式：</span>{skill.trigger}
                </p>
              )}
              {skill.installs && (
                <p className="text-[12px] text-white/42">
                  <span className="text-white/62">安装量：</span>{skill.installs.toLocaleString()}+
                </p>
              )}
              <div className="mt-3 text-sm leading-relaxed text-white/46">
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
    <PageShell title="Skills" subtitle="Claude Code Skills 按角色分类收集，找到适合你的工具" accent="#B8F7D4">
      {/* 角色筛选 */}
      <div className="flex flex-wrap gap-2 mb-10">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[12px] tracking-wider transition-all duration-200 ${
              role === r
                ? "border-cyan-100/20 bg-cyan-100/12 text-cyan-50"
                : "border-white/10 bg-white/[0.04] text-white/40 hover:bg-white/[0.075] hover:text-white/72"
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
        <p className="py-20 text-center text-sm text-white/36">暂无匹配的 Skill</p>
      )}
    </PageShell>
  )
}
