"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function HomePage() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      {/* 背景渐变 */}
      <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.15), transparent), radial-gradient(ellipse 60% 50% at 60% 60%, rgba(6,182,212,0.1), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl sm:text-7xl font-heading font-bold tracking-tight mb-6">
          <span className="gradient-text">zhiqiang</span>
          <span className="text-muted-foreground">.dev</span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed"
        >
          技术博客 × AI 工具库
          <br />
          Skills · Prompts · MCP Servers
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm
              bg-violet text-white hover:opacity-90 transition-all
              hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
          >
            阅读博客
          </Link>
          <Link
            href="/skills"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm
              glass hover:bg-surface transition-all"
          >
            探索工具库
          </Link>
        </motion.div>
      </motion.div>

      {/* 向下滚动指示器 */}
      <motion.div
        className="absolute bottom-8"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground/50"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </motion.div>
    </section>
  )
}
