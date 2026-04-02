"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BackHome } from "./BackHome"

interface PageShellProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  accent?: string
  parentLink?: { href: string; label: string }
}

export function PageShell({ children, title, subtitle, accent = "#C8A97E", parentLink }: PageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 left-0 right-0 h-[40vh] -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] rounded-full opacity-[0.04]"
          style={{
            background: `radial-gradient(ellipse, ${accent}, transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-8 pb-20">
        {/* 导航：返回首页 + 可选的上级链接 */}
        <div className="flex items-center gap-2 text-[13px] text-foreground/30">
          <BackHome />
          {parentLink && (
            <>
              <span className="text-foreground/10">/</span>
              <Link
                href={parentLink.href}
                className="hover:text-foreground/60 transition-colors"
              >
                {parentLink.label}
              </Link>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-heading font-black tracking-tight text-foreground/90">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-base text-foreground/30 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          )}
        </motion.div>

        {children}
      </div>
    </div>
  )
}
