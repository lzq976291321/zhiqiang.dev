"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

interface PageShellProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  accent?: string
  parentLink?: { href: string; label: string }
}

export function PageShell({ children, title, subtitle, accent = "#C8A97E", parentLink }: PageShellProps) {
  return (
    <main className="relative min-h-screen px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
      <div className="pointer-events-none absolute left-0 right-0 top-0 -z-10 h-[58vh] overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[46vh] w-[76vw] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background: `radial-gradient(ellipse, ${accent}, transparent 70%)`,
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[13px] text-white/48">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
          {parentLink ? (
            <Link
              href={parentLink.href}
              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
            >
              {parentLink.label}
            </Link>
          ) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 grid gap-5 lg:grid-cols-[1fr_360px]"
        >
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-100/46">
              zhiqiang.dev / knowledge system
            </p>
            <h1 className="max-w-4xl text-balance font-heading text-5xl font-semibold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              {title}
            </h1>
          </div>
          {subtitle ? (
            <div className="glass-card flex items-end p-5">
              <p className="text-base leading-7 text-white/60">{subtitle}</p>
            </div>
          ) : null}
        </motion.div>

        {children}
      </div>
    </main>
  )
}
