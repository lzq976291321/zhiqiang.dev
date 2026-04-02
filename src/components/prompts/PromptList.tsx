"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Prompt } from "@/lib/types"
import { CopyButton } from "@/components/shared/CopyButton"

function PromptCard({ prompt, index }: { prompt: Prompt; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border border-foreground/[0.04] rounded-xl overflow-hidden bg-surface/30"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-heading font-bold text-foreground/80">{prompt.title}</h3>
            <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-foreground/[0.04] text-foreground/20">
              {prompt.scene}
            </span>
          </div>
        </div>

        {/* 平台标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.platforms.map((p) => (
            <span key={p} className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md bg-magenta/5 text-magenta/40">
              {p}
            </span>
          ))}
        </div>

        {/* Prompt 正文 */}
        <div className="relative group">
          <pre className="text-sm text-foreground/35 leading-relaxed bg-[#0A0A18] rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
            {prompt.prompt}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={prompt.prompt} />
          </div>
        </div>

        {/* 负面提示词 */}
        {prompt.negative && (
          <div className="mt-3">
            <span className="text-[10px] font-mono text-foreground/20 tracking-wider">Negative:</span>
            <p className="text-xs text-foreground/20 mt-1 font-mono">{prompt.negative}</p>
          </div>
        )}

        {/* 技巧 */}
        {prompt.tips && (
          <p className="mt-3 text-xs text-ice/40 flex items-start gap-1.5">
            <span>💡</span>
            {prompt.tips}
          </p>
        )}

        {/* 展开详情 */}
        {prompt.content.trim() && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 text-[11px] font-mono text-foreground/20 hover:text-foreground/35 transition-colors"
            >
              {expanded ? "收起" : "展开详情"} ↓
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-foreground/[0.04] text-sm text-foreground/25 leading-relaxed">
                    {prompt.content.split("\n").filter(Boolean).map((line, i) => (
                      <p key={i} className="mb-1">{line}</p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  )
}

export function PromptList({
  prompts,
  type,
}: {
  prompts: Prompt[]
  type: "prompt-image" | "prompt-video"
}) {
  const scenes = ["全部", ...new Set(prompts.map((p) => p.scene))]
  const [scene, setScene] = useState("全部")
  const filtered = scene === "全部" ? prompts : prompts.filter((p) => p.scene === scene)

  const accentColor = type === "prompt-image" ? "#EC4899" : "#FB923C"

  return (
    <>
      {/* 场景筛选 */}
      <div className="flex flex-wrap gap-2 mb-8">
        {scenes.map((s) => (
          <button
            key={s}
            onClick={() => setScene(s)}
            className={`px-3 py-1 rounded-lg text-[12px] font-mono tracking-wider transition-all duration-200 ${
              scene === s
                ? "text-white"
                : "text-foreground/25 hover:text-foreground/40 hover:bg-foreground/[0.03]"
            }`}
            style={scene === s ? { background: `${accentColor}20`, color: accentColor } : {}}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <PromptCard key={p.slug} prompt={p} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-foreground/20 py-20 text-sm">暂无模板</p>
      )}
    </>
  )
}
