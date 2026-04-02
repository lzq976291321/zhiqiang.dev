"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { PageShell } from "@/components/shared/PageShell"

const TYPES = [
  {
    href: "/prompts/image",
    title: "生图 Prompt",
    desc: "Midjourney · ChatGPT · Stable Diffusion · Flux",
    accent: "#EC4899",
    count: "模板",
    icon: <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7m4 0h6m0 0v6m0-6L10.5 13.5" />,
  },
  {
    href: "/prompts/video",
    title: "生视频 Prompt",
    desc: "Sora · Runway · Veo · Kling",
    accent: "#FB923C",
    count: "模板",
    icon: <><polygon points="5 3 19 12 5 21 5 3" /></>,
  },
]

export default function PromptsPage() {
  return (
    <PageShell title="Prompts" subtitle="生图与生视频 Prompt 模板库" accent="#EC4899">
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
              className="group block p-8 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.08] bg-surface/30 hover:bg-surface/50 transition-all duration-300 h-full"
            >
              <div className="mb-5" style={{ color: `${t.accent}40` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform duration-300"
                >
                  {t.icon}
                </svg>
              </div>
              <h2 className="text-xl font-heading font-bold text-foreground/80 group-hover:text-foreground transition-colors mb-2">
                {t.title}
              </h2>
              <p className="text-sm text-foreground/25 group-hover:text-foreground/35 transition-colors leading-relaxed">
                {t.desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageShell>
  )
}
