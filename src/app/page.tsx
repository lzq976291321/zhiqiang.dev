"use client"

import { useRef, useMemo, useState, useCallback } from "react"
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion"
import Link from "next/link"

/* ==========================================================================
   背景：暖色极光（仅 Hero 用）
   ========================================================================== */
function Aurora() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#0C0A09]" />
      <motion.div
        className="absolute -top-[40%] -left-[20%] w-[140vw] h-[140vh] opacity-[0.10]"
        style={{
          background: "conic-gradient(from 200deg at 50% 50%, #F59E0B 0deg, #F97316 100deg, #EC4899 180deg, #F59E0B 280deg, #FCD34D 360deg)",
          filter: "blur(130px)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -bottom-[30%] -right-[20%] w-[110vw] h-[110vh] opacity-[0.06]"
        style={{
          background: "conic-gradient(from 60deg at 40% 60%, #EC4899 0deg, #F97316 120deg, #F59E0B 240deg, #EC4899 360deg)",
          filter: "blur(100px)",
        }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[50vw] h-[40vh] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(245,158,11,0.12), transparent 80%)",
          filter: "blur(50px)",
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          maskImage: "radial-gradient(ellipse 60% 45% at 50% 52%, black 10%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 45% at 50% 52%, black 10%, transparent 65%)",
          transform: "perspective(600px) rotateX(40deg) scale(2.5)",
          transformOrigin: "center 65%",
        }}
      />
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 55% 50% at 50% 46%, transparent 15%, #0C0A09 72%)",
      }} />
    </div>
  )
}

/* ==========================================================================
   粒子（Hero 用）
   ========================================================================== */
function Particles() {
  const dots = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 0.5, dur: Math.random() * 8 + 5, del: Math.random() * 6,
    })), [])
  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d) => (
        <motion.div key={d.id} className="absolute rounded-full"
          style={{
            left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size,
            background: d.id % 3 === 0 ? "rgba(245,158,11,0.5)" : d.id % 3 === 1 ? "rgba(249,115,22,0.4)" : "rgba(254,243,199,0.2)",
          }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -(20 + Math.random() * 25)] }}
          transition={{ duration: d.dur, delay: d.del, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

/* ==========================================================================
   Hero 标题
   ========================================================================== */
function HeroTitle() {
  const name = "zhiqiang"
  return (
    <div className="relative mb-5">
      <motion.div className="absolute inset-0 -z-10 blur-[90px] opacity-20"
        style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.6), rgba(249,115,22,0.3))" }}
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <h1 className="text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] font-heading font-black tracking-[-0.03em] select-none">
        <span className="block">
          {name.split("").map((char, i) => (
            <motion.span key={i} className="inline-block"
              style={{
                backgroundImage: "linear-gradient(135deg, #FCD34D, #F59E0B, #F97316, #F59E0B)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
              initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", backgroundPosition: ["0% center", "100% center", "0% center"] }}
              transition={{
                opacity: { delay: 0.3 + i * 0.05, duration: 0.5 },
                y: { delay: 0.3 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                filter: { delay: 0.3 + i * 0.05, duration: 0.5 },
                backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear", delay: 1.5 },
              }}
            >{char}</motion.span>
          ))}
        </span>
        <motion.span className="block text-[clamp(1.5rem,4.5vw,4rem)] text-foreground/15 tracking-[0.2em] font-light ml-0.5"
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >.dev</motion.span>
      </h1>
    </div>
  )
}

/* ==========================================================================
   全屏路由 Section 数据
   ========================================================================== */
const ROUTES = [
  {
    href: "/blog",
    title: "博客",
    en: "Blog",
    desc: "前端、后端、AI 与独立开发随笔。用文字记录每一次技术探索和踩坑经验。",
    accent: "#F59E0B",
    accentRgb: "245,158,11",
    icon: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />,
    num: "01",
  },
  {
    href: "/skills",
    title: "Skills",
    en: "工具库",
    desc: "Claude Code Skills 按角色分类收集。前端、后端、独立开发者、产品经理各取所需。",
    accent: "#F97316",
    accentRgb: "249,115,22",
    icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
    num: "02",
  },
  {
    href: "/prompts",
    title: "Prompts",
    en: "提示词库",
    desc: "生图与生视频 Prompt 模板。Midjourney、Sora、Runway、Kling 各平台通用技巧。",
    accent: "#EC4899",
    accentRgb: "236,72,153",
    icon: <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />,
    num: "03",
  },
  {
    href: "/mcp",
    title: "MCP",
    en: "服务推荐",
    desc: "从 20000+ MCP Server 中精选真正好用的。GitHub、Context7、Supabase、Figma。",
    accent: "#FCD34D",
    accentRgb: "252,211,77",
    icon: <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></>,
    num: "04",
  },
  {
    href: "/projects",
    title: "项目",
    en: "Projects",
    desc: "个人作品与开源项目展示。从想法到上线的完整记录。",
    accent: "#FB923C",
    accentRgb: "251,146,60",
    icon: <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />,
    num: "05",
  },
  {
    href: "/about",
    title: "关于",
    en: "About",
    desc: "一个人全干的独立开发者。产品、设计、前后端、部署，从头到尾。",
    accent: "#A78BFA",
    accentRgb: "167,139,250",
    icon: <><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></>,
    num: "06",
  },
]

/* ==========================================================================
   全屏路由 Section
   ========================================================================== */
function RouteSection({
  href, title, en, desc, accent, accentRgb, icon, num, isLast,
}: (typeof ROUTES)[number] & { isLast: boolean }) {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  const linkRef = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const springMx = useSpring(mx, { stiffness: 200, damping: 25 })
  const springMy = useSpring(my, { stiffness: 200, damping: 25 })

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!linkRef.current) return
    const r = linkRef.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width)
    my.set((e.clientY - r.top) / r.height)
  }, [mx, my])

  const handleLeave = useCallback(() => { mx.set(0.5); my.set(0.5) }, [mx, my])

  const spotlight = useTransform(
    [springMx, springMy],
    ([x, y]: number[]) =>
      `radial-gradient(circle 300px at ${x * 100}% ${y * 100}%, rgba(${accentRgb},0.06), transparent)`
  )

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center overflow-hidden snap-start"
    >
      {/* 背景光晕（视差） */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y: bgY }}
      >
        <div className="absolute inset-0 bg-[#0C0A09]" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] rounded-full opacity-[0.04]"
          style={{
            background: `radial-gradient(ellipse, rgba(${accentRgb},0.4), transparent 70%)`,
            filter: "blur(80px)",
          }}
        />
      </motion.div>

      {/* 噪点 */}
      <div className="absolute inset-0 opacity-[0.02] -z-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "128px 128px",
      }} />

      {/* 主内容 */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <Link
          ref={linkRef}
          href={href}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          className="group block"
        >
          {/* 鼠标追踪光斑 */}
          <motion.div
            className="fixed inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
            style={{ background: spotlight }}
          />

          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
            {/* 左侧：序号 + 标题 */}
            <div className="flex-1">
              {/* 序号 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mb-4 flex items-center gap-3"
              >
                <span className="text-[11px] font-mono tracking-[0.2em]" style={{ color: `rgba(${accentRgb},0.35)` }}>
                  {num}
                </span>
                <div className="h-[1px] w-8" style={{ background: `rgba(${accentRgb},0.15)` }} />
                <span className="text-[11px] font-mono tracking-[0.15em] uppercase" style={{ color: `rgba(${accentRgb},0.25)` }}>
                  {en}
                </span>
              </motion.div>

              {/* 大标题 */}
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="text-[clamp(3rem,8vw,7rem)] font-heading font-black leading-[0.85] tracking-[-0.03em] text-foreground/90 group-hover:text-foreground transition-colors duration-500"
              >
                {title}
              </motion.h2>

              {/* 描述 */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                className="mt-5 text-base sm:text-lg text-foreground/25 group-hover:text-foreground/40 transition-colors duration-500 max-w-lg leading-relaxed"
              >
                {desc}
              </motion.p>
            </div>

            {/* 右侧：图标 + 箭头 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="flex items-end gap-6 lg:pb-3"
            >
              {/* 图标 */}
              <div className="transition-transform duration-500 group-hover:scale-110" style={{ color: `rgba(${accentRgb},0.2)` }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                  className="group-hover:drop-shadow-[0_0_12px_rgba(var(--glow),0.3)] transition-all duration-500"
                  style={{ "--glow": accentRgb } as React.CSSProperties}
                >
                  {icon}
                </svg>
              </div>

              {/* 进入箭头 */}
              <motion.div
                className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{ color: `rgba(${accentRgb},0.5)` }}
              >
                <span className="text-[11px] font-mono tracking-[0.1em] uppercase">Enter</span>
                <motion.svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </motion.svg>
              </motion.div>
            </motion.div>
          </div>

          {/* 底部分割线 */}
          {!isLast && (
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="mt-10 h-[1px] origin-left"
              style={{ background: `linear-gradient(90deg, rgba(${accentRgb},0.12), transparent 80%)` }}
            />
          )}
        </Link>
      </div>

      {/* 右侧页码（桌面端） */}
      <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-1">
        <span className="text-[10px] font-mono text-foreground/8 tracking-widest writing-vertical" style={{ writingMode: "vertical-lr" }}>
          {num} / 06
        </span>
      </div>
    </section>
  )
}

/* ==========================================================================
   PAGE
   ========================================================================== */
export default function HomePage() {
  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-auto">
      {/* ====== Hero ====== */}
      <section className="relative flex flex-col items-center justify-center h-screen overflow-hidden snap-start">
        <Aurora />
        <Particles />

        <div className="relative z-10 flex flex-col items-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] tracking-[0.15em] uppercase font-mono"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.1)", color: "rgba(252,211,77,0.5)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
              building in public
            </span>
          </motion.div>

          <HeroTitle />

          {/* 毛玻璃副标题 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-12"
          >
            <div className="px-6 py-3.5 rounded-xl"
              style={{
                background: "rgba(28, 20, 16, 0.5)",
                backdropFilter: "blur(30px) saturate(1.5)",
                WebkitBackdropFilter: "blur(30px) saturate(1.5)",
                border: "1px solid rgba(245, 158, 11, 0.07)",
              }}
            >
              <motion.div className="absolute inset-0 rounded-xl opacity-[0.05]"
                style={{
                  background: "linear-gradient(105deg, transparent 35%, rgba(245,158,11,0.6) 50%, transparent 65%)",
                  backgroundSize: "250% 100%",
                }}
                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
              />
              <p className="relative text-sm sm:text-base tracking-[0.06em] text-foreground/50 font-light">
                技术博客 <span className="text-warm mx-1 font-medium">×</span> AI 工具库
              </p>
              <p className="relative text-xs text-foreground/25 tracking-[0.2em] mt-1 font-mono uppercase">
                Skills · Prompts · MCP
              </p>
            </div>
          </motion.div>
        </div>

        {/* 底部渐隐 + 滚动提示 */}
        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-10"
          style={{ background: "linear-gradient(to top, #0C0A09, transparent)" }}
        />
        <motion.div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        >
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[9px] tracking-[0.25em] uppercase text-foreground/10 font-mono">scroll</span>
            <div className="w-[1px] h-7 rounded-full overflow-hidden bg-foreground/5">
              <motion.div className="w-full h-1/2 rounded-full"
                style={{ background: "linear-gradient(to bottom, #F59E0B, transparent)" }}
                animate={{ y: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ====== 6 个全屏路由入口 ====== */}
      {ROUTES.map((r, i) => (
        <RouteSection key={r.href} {...r} isLast={i === ROUTES.length - 1} />
      ))}

      {/* ====== 最后一屏：版权 ====== */}
      <section className="h-screen flex items-center justify-center snap-start relative">
        <div className="absolute inset-0 bg-[#0C0A09]" />
        <div className="relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] text-foreground/12 font-mono tracking-[0.2em]"
          >
            &copy; {new Date().getFullYear()} zhiqiang.dev
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-4"
          >
            <a href="https://github.com/linzhiqiang" target="_blank" rel="noopener noreferrer"
              className="text-foreground/10 hover:text-foreground/25 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
            <a href="https://x.com/linzhiqiang" target="_blank" rel="noopener noreferrer"
              className="text-foreground/10 hover:text-foreground/25 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16h-4.267zm6.617 6.911l-6.617 9.089h4.267l4.617 -6.34" />
              </svg>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
