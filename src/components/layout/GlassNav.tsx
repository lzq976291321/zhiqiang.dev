"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, BookOpen, Code2, Menu, X } from "lucide-react"
import { navItems } from "@/config/navigation"

export function GlassNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full border border-white/12 bg-white/[0.07] px-3 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full px-2 text-sm font-semibold tracking-wide text-white"
          onClick={() => setOpen(false)}
        >
          <span className="grid size-8 place-items-center rounded-full border border-cyan-200/20 bg-cyan-200/10 text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
            <BookOpen className="size-4" />
          </span>
          <span className="hidden sm:inline">zhiqiang.dev</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                isActive(item.href)
                  ? "text-white"
                  : "text-white/54 hover:text-white"
              }`}
            >
              {isActive(item.href) ? (
                <motion.span
                  layoutId="glass-nav-active"
                  className="absolute inset-0 rounded-full border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href="https://github.com/lzq976291321?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden size-9 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/62 transition hover:border-white/20 hover:bg-white/10 hover:text-white sm:grid"
            aria-label="GitHub"
          >
            <Code2 className="size-4" />
          </a>
          <Link
            href="/resume"
            className="hidden items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3.5 py-2 text-[12px] font-semibold text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-cyan-200/16 sm:flex"
          >
            Resume
            <ArrowUpRight className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white md:hidden"
            aria-label="菜单"
            aria-expanded={open}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-[28px] border border-white/12 bg-[#08111f]/88 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-white/10 text-white"
                    : "text-white/58 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
