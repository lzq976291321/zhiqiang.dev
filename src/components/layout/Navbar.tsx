"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { navItems } from "@/config/navigation"
import { siteConfig } from "@/config/site"
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

  // 路由变化时关闭移动菜单
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass border-b border-border"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="font-heading text-lg font-bold gradient-text"
            >
              {siteConfig.name}
            </Link>

            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-3 py-2 text-sm transition-colors hover:text-foreground"
                  style={{
                    color: isActive(item.href)
                      ? "var(--foreground)"
                      : "var(--text-secondary)",
                  }}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, #7C3AED, #06B6D4)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* 右侧工具 */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* 移动端汉堡按钮 */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="切换菜单"
              >
                <div className="w-5 flex flex-col gap-1.5">
                  <motion.span
                    className="block h-0.5 bg-foreground rounded-full"
                    animate={
                      mobileOpen
                        ? { rotate: 45, y: 4 }
                        : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block h-0.5 bg-foreground rounded-full"
                    animate={
                      mobileOpen ? { opacity: 0 } : { opacity: 1 }
                    }
                    transition={{ duration: 0.2 }}
                  />
                  <motion.span
                    className="block h-0.5 bg-foreground rounded-full"
                    animate={
                      mobileOpen
                        ? { rotate: -45, y: -4 }
                        : { rotate: 0, y: 0 }
                    }
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* 移动端全屏菜单 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`text-2xl font-heading font-bold transition-colors ${
                      isActive(item.href)
                        ? "gradient-text"
                        : "text-muted-foreground hover:text-foreground"
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

      {/* 占位高度 */}
      <div className="h-16" />
    </>
  )
}
