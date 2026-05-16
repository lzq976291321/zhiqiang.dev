"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PageShell } from "@/components/shared/PageShell"

const TYPES = [
  {
    href: "/prompts/image",
    title: "生图 Prompt",
    desc: "Midjourney · ChatGPT · Stable Diffusion · Flux",
    accent: "#9FE8FF",
    count: "模板",
    icon: <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7m4 0h6m0 0v6m0-6L10.5 13.5" />,
  },
  {
    href: "/prompts/video",
    title: "生视频 Prompt",
    desc: "Sora · Runway · Veo · Kling",
    accent: "#B8F7D4",
    count: "模板",
    icon: <><polygon points="5 3 19 12 5 21 5 3" /></>,
  },
]

export default function PromptsPage() {
  return (
    <PageShell title="Prompts" subtitle="生图与生视频 Prompt 模板库" accent="#9FE8FF">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TYPES.map((t, i) => (
          <motion.div
            key={t.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href={t.href}
              className="glass-card group block h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-100/22 hover:bg-white/[0.095]"
            >
              <div className="mb-5" style={{ color: `${t.accent}40` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                >
                  {t.icon}
                </svg>
              </div>
              <h2 className="mb-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-white/88 transition-colors group-hover:text-white">
                {t.title}
              </h2>
              <p className="text-sm leading-relaxed text-white/46 transition-colors group-hover:text-white/58">
                {t.desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageShell>
  )
}
