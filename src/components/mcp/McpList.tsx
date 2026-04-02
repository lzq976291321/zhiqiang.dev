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
      className={`p-6 rounded-xl border transition-all duration-300 ${
        isEssential
          ? "border-ice/10 bg-ice/[0.02]"
          : "border-foreground/[0.04] bg-surface/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-heading font-bold text-foreground/85">
              {server.title}
            </h3>
            {isEssential && (
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-ice/10 text-ice/70">
                必装
              </span>
            )}
          </div>
          <p className="text-[12px] font-mono text-foreground/20">{server.maintainer}</p>
        </div>
      </div>

      <p className="text-sm text-foreground/35 leading-relaxed mb-4">
        {server.description}
      </p>

      <p className="text-[11px] text-foreground/20 mb-3">
        <span className="text-foreground/30">谁需要装：</span>{server.whoNeeds}
      </p>

      {/* 安装命令 */}
      <div className="relative">
        <pre className="text-[13px] text-ice/60 bg-[#0A0A18] rounded-lg px-4 py-3 font-mono overflow-x-auto">
          {server.installCommand}
        </pre>
        <div className="absolute top-2 right-2">
          <CopyButton text={server.installCommand} />
        </div>
      </div>

      {server.content.trim() && (
        <p className="mt-4 text-xs text-foreground/20 leading-relaxed">
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
      accent="#FCD34D"
    >
      {/* 安全提醒 */}
      <div className="mb-10 p-4 rounded-xl border border-magenta/10 bg-magenta/[0.02]">
        <p className="text-[12px] text-magenta/50 leading-relaxed">
          <span className="font-bold">⚠ 安全提醒：</span>66% 公开 MCP Server 有安全问题。永远不要复用生产凭据，优先选择官方维护的 Server，生产环境先只读。
        </p>
      </div>

      {/* 必装 */}
      {essential.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-mono tracking-[0.15em] uppercase text-ice/40 mb-5">
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
          <h2 className="text-sm font-mono tracking-[0.15em] uppercase text-foreground/20 mb-5">
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
