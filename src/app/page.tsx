"use client"

import { useRef, useMemo, useState, useCallback, useEffect } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion"
import Link from "next/link"

/* ==========================================================================
   SVG 装饰：editorial 风格的几何线条
   ========================================================================== */
function EditorialSvg() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" fill="none">
        <motion.line x1="0" y1="0" x2="400" y2="900"
          stroke="rgba(255,255,255,0.03)" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
        />
        <motion.line x1="1440" y1="0" x2="1040" y2="900"
          stroke="rgba(255,255,255,0.03)" strokeWidth="1"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.8, ease: "easeOut" }}
        />
        <motion.line x1="100" y1="450" x2="500" y2="450"
          stroke="rgba(200,169,126,0.08)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
        />
        <motion.line x1="940" y1="450" x2="1340" y2="450"
          stroke="rgba(200,169,126,0.08)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.4, ease: "easeOut" }}
        />
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
          <line x1="60" y1="55" x2="60" y2="75" stroke="rgba(200,169,126,0.12)" strokeWidth="0.5" />
          <line x1="50" y1="65" x2="70" y2="65" stroke="rgba(200,169,126,0.12)" strokeWidth="0.5" />
        </motion.g>
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}>
          <line x1="1380" y1="825" x2="1380" y2="845" stroke="rgba(200,169,126,0.12)" strokeWidth="0.5" />
          <line x1="1370" y1="835" x2="1390" y2="835" stroke="rgba(200,169,126,0.12)" strokeWidth="0.5" />
        </motion.g>
        <motion.path
          d="M720,200 A250,250 0 0,1 970,450"
          stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 4, delay: 1, ease: "easeOut" }}
        />
      </svg>
    </div>
  )
}

/* ==========================================================================
   Hero
   ========================================================================== */
function HeroTitle() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 1 }}
        className="text-[11px] font-mono tracking-[0.3em] uppercase text-muted-foreground/50 mb-8"
      >
        AI Toolkit & Projects
      </motion.div>

      <h1 className="font-heading select-none">
        <motion.span
          className="block text-[clamp(4rem,12vw,10rem)] leading-[1] tracking-[-0.04em] text-foreground pb-[0.1em]"
          initial={{ opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" }}
          animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          zhiqiang
        </motion.span>
        <motion.span
          className="block text-[clamp(1.8rem,5vw,3.5rem)] leading-none tracking-[0.15em] text-gold/40 font-light italic mt-2"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          .dev
        </motion.span>
      </h1>

      <motion.div
        className="mt-10 mb-8 h-[1px] w-24"
        style={{ background: "linear-gradient(90deg, #C8A97E, transparent)" }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.p
        className="text-sm text-muted-foreground/60 tracking-[0.08em] font-light max-w-xs leading-relaxed"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        Skills 工具库 · Prompt 模板<br />
        MCP 精选 · 开源项目
      </motion.p>
    </div>
  )
}

/* ==========================================================================
   路由数据
   ========================================================================== */
const ROUTES = [
  { href: "/skills", title: "Skills", cn: "工具库", desc: "Claude Code Skills 按角色分类收集", num: "01" },
  { href: "/prompts", title: "Prompts", cn: "提示词", desc: "生图与生视频 Prompt 模板库", num: "02" },
  { href: "/mcp", title: "MCP", cn: "服务", desc: "真正好用的 MCP Server 精选", num: "03" },
  { href: "/projects", title: "Projects", cn: "项目", desc: "个人作品与开源项目展示", num: "04" },
  { href: "/about", title: "About", cn: "关于", desc: "经历、技能、联系方式", num: "05" },
]

/* ==========================================================================
   全屏路由 Section — editorial 风格
   ========================================================================== */
function RouteSection({
  href, title, cn, desc, num, isLast,
}: (typeof ROUTES)[number] & { isLast: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const sectionId = href.replace("/", "")
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const titleY = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"])

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className="relative h-screen flex items-center snap-start cursor-pointer group"
    >
      <Link href={href} className="absolute inset-0 z-10" aria-label={`进入${cn}`} />

      <motion.div
        className="absolute right-[5%] lg:right-[8%] top-1/2 -translate-y-1/2 pointer-events-none select-none"
        style={{ y: titleY }}
      >
        <span className="text-[clamp(6rem,18vw,16rem)] font-heading leading-none tracking-[-0.05em] text-white/[0.02] group-hover:text-white/[0.04] transition-colors duration-700">
          {title}
        </span>
      </motion.div>

      <div className="relative z-20 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 w-full pointer-events-none">
        <div className="max-w-xl">
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[11px] font-mono tracking-[0.2em] text-gold/40">{num}</span>
            <div className="h-[1px] w-10 bg-white/8 group-hover:w-16 group-hover:bg-gold/20 transition-all duration-500" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-[clamp(2.5rem,6vw,5rem)] font-heading leading-[0.9] tracking-[-0.02em] text-foreground/90 group-hover:text-foreground transition-colors duration-500"
          >
            {cn}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-2 text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground/30"
          >
            {title}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-5 text-sm text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors duration-500 leading-relaxed max-w-sm"
          >
            {desc}
          </motion.p>

          <motion.div className="mt-8 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="h-[1px] w-6 bg-gold/30" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-gold/40">Enter</span>
            <motion.svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-gold/40"
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </motion.svg>
          </motion.div>
        </div>
      </div>

      {!isLast && (
        <div className="absolute bottom-0 left-6 right-6 sm:left-10 sm:right-10 lg:left-16 lg:right-16 max-w-6xl mx-auto">
          <motion.div
            className="h-[1px] origin-left"
            style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent 60%)" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}

      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2">
        <span className="text-[10px] font-mono text-white/5 tracking-widest" style={{ writingMode: "vertical-lr" }}>
          {num} — 05
        </span>
      </div>
    </section>
  )
}

/* ==========================================================================
   PAGE
   ========================================================================== */
export default function HomePage() {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "instant" })
      }, 100)
    }
  }, [])

  return (
    <>
      <div className="snap-y snap-mandatory h-screen overflow-y-auto">
        <section className="relative flex items-center h-screen snap-start overflow-hidden">
          <div className="absolute inset-0 bg-[#0A0A0A]" />
          <EditorialSvg />

          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
              <HeroTitle />
              <motion.div
                className="hidden lg:flex flex-col items-end gap-4 pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/10" style={{ writingMode: "vertical-lr" }}>
                  EST. 2026
                </span>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{ background: "linear-gradient(to top, #0A0A0A, transparent)" }} />

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
          >
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="flex flex-col items-center gap-3">
              <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/10">Scroll</span>
              <div className="w-[1px] h-8 bg-white/5 overflow-hidden">
                <motion.div className="w-full h-1/3 bg-gold/30"
                  animate={{ y: ["-100%", "400%"] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }} />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {ROUTES.map((r, i) => (
          <RouteSection key={r.href} {...r} isLast={i === ROUTES.length - 1} />
        ))}
      </div>

      <div className="fixed top-5 right-5 z-50 flex items-center gap-3">
        <a href="https://github.com/lzq976291321?tab=repositories" target="_blank" rel="noopener noreferrer"
          className="w-8 h-8 flex items-center justify-center text-white/15 hover:text-white/40 transition-colors cursor-pointer"
          aria-label="GitHub">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
        <Link href="/resume"
          className="flex items-center gap-1.5 h-7 px-3 text-[10px] font-mono tracking-[0.1em] uppercase text-white/20 hover:text-white/40 border border-white/6 hover:border-white/10 transition-all cursor-pointer">
          Resume
        </Link>
      </div>
    </>
  )
}
