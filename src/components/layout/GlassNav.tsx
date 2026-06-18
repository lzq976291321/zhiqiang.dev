"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { BookOpen, Menu, X } from "lucide-react"
import { navItems } from "@/config/navigation"

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  )
}

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
          <span className="hidden sm:inline">zhiqiang.chat</span>
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
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-white/12 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
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
            <GitHubMark className="size-4" />
          </a>
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

      {open ? (
        <div className="animate-fade-in-down mx-auto mt-3 max-w-7xl overflow-hidden rounded-[28px] border border-white/12 bg-[#08111f]/88 p-2 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:hidden">
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
        </div>
      ) : null}
    </header>
  )
}
