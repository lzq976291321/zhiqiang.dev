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
      className="glass-card overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-xl font-semibold tracking-[-0.02em] text-white/90">{prompt.title}</h3>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] tracking-wider text-white/42">
              {prompt.scene}
            </span>
          </div>
        </div>

        {/* 平台标签 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.platforms.map((p) => (
            <span key={p} className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/42">
              {p}
            </span>
          ))}
        </div>

        {/* Prompt 正文 */}
        <div className="relative group">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-3xl border border-white/10 bg-[#050913]/70 p-4 pr-24 font-mono text-sm leading-relaxed text-cyan-50/70">
            {prompt.prompt}
          </pre>
          <div className="absolute top-2 right-2">
            <CopyButton text={prompt.prompt} />
          </div>
        </div>

        {/* 负面提示词 */}
        {prompt.negative && (
          <div className="mt-3">
            <span className="font-mono text-[10px] tracking-wider text-white/36">Negative:</span>
            <p className="mt-1 font-mono text-xs text-white/38">{prompt.negative}</p>
          </div>
        )}

        {/* 技巧 */}
        {prompt.tips && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-emerald-50/62">
            <span className="mt-1 size-1.5 rounded-full bg-emerald-200/70" />
            {prompt.tips}
          </p>
        )}

        {/* 展开详情 */}
        {prompt.content.trim() && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-4 font-mono text-[11px] text-white/38 transition-colors hover:text-white/68"
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
                  <div className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-white/46">
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
            className={`rounded-full border px-3 py-1.5 font-mono text-[12px] tracking-wider transition-all duration-200 ${
              scene === s
                ? "border-cyan-100/20 text-white"
                : "border-white/10 bg-white/[0.04] text-white/40 hover:bg-white/[0.075] hover:text-white/72"
            }`}
            style={scene === s ? { background: `${accentColor}24`, color: "white" } : {}}
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
        <p className="py-20 text-center text-sm text-white/36">暂无模板</p>
      )}
    </>
  )
}
