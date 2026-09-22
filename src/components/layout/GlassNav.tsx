"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navItems } from "@/config/navigation"
import styles from "./SiteNav.module.css"

export function GlassNav() {
  const pathname = usePathname()
  if (pathname === "/chat" || pathname === "/lab/fill-light" || pathname === "/lab/led-banner" || pathname.startsWith("/admin")) return null
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="zhiqiang 首页">
          <span className={styles.mark} aria-hidden="true">z.</span>
          <span>zhiqiang<b>.</b></span>
        </Link>
        <nav aria-label="主导航">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link href="/chat" className={styles.chat}>
          开始对话 <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  )
}
