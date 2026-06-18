"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// 路由 → 首页 section id 的映射
const routeToSection: Record<string, string> = {
  "/agent": "agent",
  "/skills": "skills",
  "/design-lab": "design-lab",
  "/mcp": "mcp",
  "/projects": "projects",
  "/about": "about",
  "/resume": "about",
}

export function BackHome() {
  const pathname = usePathname()
  // 取一级路径匹配，如 /blog/xxx → /blog
  const base = "/" + (pathname.split("/")[1] ?? "")
  const hash = routeToSection[base] ?? ""

  return (
    <div className="animate-fade-in-up">
      <Link
        href={hash ? `/#${hash}` : "/"}
        className="inline-flex items-center gap-2 text-[13px] text-foreground/30 hover:text-foreground/60 transition-colors group"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="group-hover:-translate-x-0.5 transition-transform"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        zhiqiang.chat
      </Link>
    </div>
  )
}
