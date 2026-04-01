"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { navItems } from "@/config/navigation"
import { ThemeToggle } from "./ThemeToggle"

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? "rgba(12, 10, 9, 0.7)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px) saturate(1.3)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.3)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(245, 158, 11, 0.06)"
            : "1px solid transparent",
        }}
      >
        <nav className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo — 简洁文字标 */}
            <Link href="/" className="font-heading text-sm font-semibold tracking-wide text-foreground/80 hover:text-foreground transition-colors">
              zhiqiang.dev
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-1.5 text-[13px] rounded-md transition-colors duration-200 ${
                    isActive(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground/80"
                  }`}
                >
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-md"
                      style={{ background: "rgba(245, 158, 11, 0.08)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors"
                aria-label="菜单"
              >
                <div className="w-4 flex flex-col gap-[5px]">
                  <motion.span
                    className="block h-[1.5px] bg-foreground/70 rounded-full origin-center"
                    animate={mobileOpen ? { rotate: 45, y: 3.25 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                  <motion.span
                    className="block h-[1.5px] bg-foreground/70 rounded-full"
                    animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block h-[1.5px] bg-foreground/70 rounded-full origin-center"
                    animate={mobileOpen ? { rotate: -45, y: -3.25 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* 移动菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: "rgba(12, 10, 9, 0.96)",
              backdropFilter: "blur(24px)",
            }}
          >
            <nav className="flex flex-col items-center justify-center h-full gap-5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={`text-xl font-heading tracking-wide transition-colors ${
                      isActive(item.href)
                        ? "text-warm"
                        : "text-foreground/40 hover:text-foreground/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-14" />
    </>
  )
}
