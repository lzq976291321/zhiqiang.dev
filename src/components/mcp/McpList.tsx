"use client"

import { motion } from "framer-motion"
import type { McpServer } from "@/lib/types"
import { CopyButton } from "@/components/shared/CopyButton"
import { PageShell } from "@/components/shared/PageShell"

function McpCard({ server, index }: { server: McpServer; index: number }) {
  const isEssential = server.tier === "essential"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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

      <p className="mb-3 text-[11px] text-white/42">
        <span className="text-white/60">谁需要装：</span>{server.whoNeeds}
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
    </motion.div>
  )
}

export function McpList({ servers }: { servers: McpServer[] }) {
  const essential = servers.filter((s) => s.tier === "essential")
  const recommended = servers.filter((s) => s.tier === "recommended")

  return (
    <PageShell
      title="MCP"
      subtitle="从 20000+ Server 中精选真正好用的。3 个最佳，5 个上限。"
      accent="#B8F7D4"
    >
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
            {essential.map((s, i) => (
              <McpCard key={s.slug} server={s} index={i} />
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
            {recommended.map((s, i) => (
              <McpCard key={s.slug} server={s} index={i + essential.length} />
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}
