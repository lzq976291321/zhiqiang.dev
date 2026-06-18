"use client"

import { useState } from "react"
import type { McpServer } from "@/lib/types"
import { CopyButton } from "@/components/shared/CopyButton"

const ROLES = ["全部", "Agent 工程师", "前端开发者", "后端开发者", "独立开发者", "产品经理", "安全合规"]

const roleNotes: Record<string, string> = {
  全部: "MCP 不是越多越好。先装高频只读上下文，再接入会改变外部系统的写入型工具。",
  "Agent 工程师": "优先选择文档、代码仓库、沙箱、评测和自建 MCP 相关工具。",
  前端开发者: "优先选择 GitHub、Context7、Figma、Playwright、Vercel，覆盖代码、文档、设计和真实浏览器验证。",
  后端开发者: "优先选择 GitHub、Context7、数据库、监控和支付/基础设施，生产库默认只读。",
  独立开发者: "优先选择 GitHub、Vercel、Supabase、Stripe、Sentry，减少从开发到上线的上下文切换。",
  产品经理: "优先选择 Notion、Linear、Firecrawl 和数据读取型 MCP，用来沉淀需求、竞品和用户反馈。",
  安全合规: "优先选择官方、可审计、可只读的 MCP。凡是带写权限、令牌或生产数据的都要谨慎。",
}

const fitLabel: Record<McpServer["fit"], string> = {
  core: "值得长期启用",
  situational: "按项目启用",
  watch: "谨慎观察",
}

const riskLabel: Record<McpServer["risk"], string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
}

const fitColor: Record<McpServer["fit"], string> = {
  core: "border-cyan-100/18 bg-cyan-100/10 text-cyan-50/78",
  situational: "border-emerald-100/16 bg-emerald-100/8 text-emerald-50/70",
  watch: "border-amber-100/18 bg-amber-100/10 text-amber-50/72",
}

const riskColor: Record<McpServer["risk"], string> = {
  low: "border-white/10 bg-white/[0.05] text-white/46",
  medium: "border-amber-100/18 bg-amber-100/10 text-amber-50/68",
  high: "border-rose-100/18 bg-rose-100/10 text-rose-50/70",
}

function McpCard({ server }: { server: McpServer }) {
  const isEssential = server.tier === "essential"

  return (
    <article
      className={`glass-card p-6 transition-all duration-300 hover:-translate-y-0.5 ${
        isEssential
          ? "border-cyan-100/20 bg-cyan-100/[0.08]"
          : "bg-white/[0.065]"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading text-2xl font-semibold tracking-[-0.025em] text-white/90">
              {server.title}
            </h3>
            {isEssential && (
              <span className="rounded-full border border-cyan-100/18 bg-cyan-100/10 px-2 py-0.5 font-mono text-[10px] tracking-wider text-cyan-50/78">
                必装
              </span>
            )}
          </div>
          <p className="font-mono text-[12px] text-white/34">{server.maintainer}</p>
        </div>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-white/52">
        {server.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider ${fitColor[server.fit]}`}>
          {fitLabel[server.fit]}
        </span>
        <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wider ${riskColor[server.risk]}`}>
          {riskLabel[server.risk]}
        </span>
        {server.roles.map((role) => (
          <span key={role} className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/36">
            {role}
          </span>
        ))}
      </div>

      <p className="mb-3 text-[11px] text-white/42">
        <span className="text-white/60">谁需要装：</span>{server.whoNeeds}
      </p>

      <p className="mb-3 text-[11px] leading-relaxed text-white/42">
        <span className="text-white/60">是否值得：</span>{server.worth}
      </p>

      {/* 安装命令 */}
      <div className="relative">
        <pre className="overflow-x-auto rounded-3xl border border-white/10 bg-[#050913]/70 px-4 py-3 pr-24 font-mono text-[13px] text-cyan-50/72">
          {server.installCommand}
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={server.installCommand} />
        </div>
      </div>

      {server.content.trim() && (
        <p className="mt-4 text-xs leading-relaxed text-white/38">
          {server.content.split("\n").filter(Boolean).join(" ")}
        </p>
      )}
    </article>
  )
}

export function McpList({ servers }: { servers: McpServer[] }) {
  const [role, setRole] = useState("全部")
  const filtered = role === "全部" ? servers : servers.filter((s) => s.roles.includes(role))
  const essential = filtered.filter((s) => s.tier === "essential")
  const recommended = filtered.filter((s) => s.tier === "recommended")

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

      <div className="mb-10 flex flex-wrap gap-2">
        {ROLES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRole(item)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[12px] tracking-wider transition-all duration-200 ${
              role === item
                ? "border-cyan-100/20 bg-cyan-100/12 text-cyan-50"
                : "border-white/10 bg-white/[0.04] text-white/40 hover:bg-white/[0.075] hover:text-white/72"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 安全提醒 */}
      <div className="glass-card mb-10 p-4">
        <p className="text-[12px] leading-relaxed text-white/58">
          <span className="font-bold text-white/78">安全提醒：</span>66% 公开 MCP Server 有安全问题。永远不要复用生产凭据，优先选择官方维护的 Server，生产环境先只读。
        </p>
      </div>

      {/* 必装 */}
      {essential.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-5 font-mono text-sm uppercase tracking-[0.15em] text-cyan-100/54">
            必装第一梯队
          </h2>
          <div className="flex flex-col gap-3">
            {essential.map((s) => (
              <McpCard key={s.slug} server={s} />
            ))}
          </div>
        </div>
      )}

      {/* 按需 */}
      {recommended.length > 0 && (
        <div>
          <h2 className="mb-5 font-mono text-sm uppercase tracking-[0.15em] text-white/36">
            按需安装
          </h2>
          <div className="flex flex-col gap-3">
            {recommended.map((s) => (
              <McpCard key={s.slug} server={s} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-20 text-center text-sm text-white/36">暂无匹配的 MCP</p>
      )}
    </>
  )
}
