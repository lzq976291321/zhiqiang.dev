"use client"

import { useState } from "react"
import type { Skill } from "@/lib/types"

const ROLES = ["全部", "Agent 工程师", "前端开发者", "后端开发者", "独立开发者", "产品经理", "安全合规"]

const roleNotes: Record<string, string> = {
  全部: "默认不建议把所有 Skill 都长期启用。真正高效的做法是按角色和项目阶段装载。",
  "Agent 工程师": "优先选择能沉淀流程、构建工具、做评测和安全边界的 Skill。",
  前端开发者: "优先选择设计质量、React 性能、可访问性、浏览器验证相关 Skill。",
  后端开发者: "优先选择 API、调试、数据库、测试和上线前审查相关 Skill。",
  独立开发者: "优先选择能覆盖从想法、页面、上线到增长闭环的高杠杆 Skill。",
  产品经理: "优先选择需求结构化、文档共创、数据分析和用户反馈整理相关 Skill。",
  安全合规: "优先选择审计、合规、Agent 权限和高风险操作检查相关 Skill。",
}

const sourceColor: Record<string, string> = {
  official: "text-cyan-50/80 bg-cyan-100/10 border-cyan-100/18",
  community: "text-white/46 bg-white/[0.05] border-white/10",
  vendor: "text-emerald-50/80 bg-emerald-100/10 border-emerald-100/18",
}

const fitLabel: Record<Skill["fit"], string> = {
  core: "值得长期启用",
  situational: "按项目启用",
  watch: "谨慎观察",
}

const fitColor: Record<Skill["fit"], string> = {
  core: "border-cyan-100/18 bg-cyan-100/10 text-cyan-50/78",
  situational: "border-emerald-100/16 bg-emerald-100/8 text-emerald-50/70",
  watch: "border-amber-100/18 bg-amber-100/10 text-amber-50/72",
}

function SkillCard({ skill }: { skill: Skill }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="glass-card overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/22 hover:bg-white/[0.09]">
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
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.08em] ${fitColor[skill.fit]}`}>
              {fitLabel[skill.fit]}
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

        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className={`mt-1 shrink-0 text-white/32 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <div className="border-t border-white/10 px-5 pb-5 pt-4 sm:px-6">
          {skill.trigger && (
            <p className="mb-2 text-[12px] text-white/42">
              <span className="text-white/62">触发方式：</span>{skill.trigger}
            </p>
          )}
          <p className="mb-2 text-[12px] leading-relaxed text-white/42">
            <span className="text-white/62">是否值得：</span>{skill.worth}
          </p>
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
      ) : null}
    </div>
  )
}

export function SkillsList({ skills }: { skills: Skill[] }) {
  const [role, setRole] = useState("全部")
  const filtered = role === "全部" ? skills : skills.filter((s) => s.roles.includes(role))

  return (
    <>
      <div className="glass-card mb-6 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/46">
          Role fit
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/56">
          {roleNotes[role]}
        </p>
      </div>

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
        {filtered.map((s) => (
          <SkillCard key={s.slug} skill={s} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-white/36">暂无匹配的 Skill</p>
      )}
    </>
  )
}
