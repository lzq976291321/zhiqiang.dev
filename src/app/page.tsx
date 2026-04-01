"use client"

import { useRef, useState, useCallback, useMemo } from "react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import Link from "next/link"

/* ==========================================================================
   背景：暖色极光 + 透视网格
   ========================================================================== */
function WarmAurora() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "#0C0A09" }} />

      {/* 主色锥形渐变 — 缓旋 */}
      <motion.div
        className="absolute -top-[40%] -left-[20%] w-[140vw] h-[140vh] opacity-[0.10]"
        style={{
          background:
            "conic-gradient(from 200deg at 50% 50%, #F59E0B 0deg, #F97316 100deg, #EC4899 180deg, #F59E0B 280deg, #FCD34D 360deg)",
          filter: "blur(130px)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {/* 反向层 */}
      <motion.div
        className="absolute -bottom-[30%] -right-[20%] w-[110vw] h-[110vh] opacity-[0.06]"
        style={{
          background:
            "conic-gradient(from 60deg at 40% 60%, #EC4899 0deg, #F97316 120deg, #F59E0B 240deg, #EC4899 360deg)",
          filter: "blur(100px)",
        }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* 中心脉冲 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[50vw] h-[40vh] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,158,11,0.12), rgba(249,115,22,0.04) 60%, transparent 80%)",
          filter: "blur(50px)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 透视网格 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
          maskImage:
            "radial-gradient(ellipse 60% 45% at 50% 52%, black 10%, transparent 65%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 45% at 50% 52%, black 10%, transparent 65%)",
          transform: "perspective(600px) rotateX(40deg) scale(2.5)",
          transformOrigin: "center 65%",
        }}
      />

      {/* 噪点 */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* 暗角 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 50% 46%, transparent 15%, #0C0A09 72%)",
        }}
      />
    </div>
  )
}

/* ==========================================================================
   漂浮微粒
   ========================================================================== */
function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        dur: Math.random() * 8 + 5,
        del: Math.random() * 6,
      })),
    []
  )

  return (
    <div className="absolute inset-0 pointer-events-none">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background:
              d.id % 3 === 0
                ? "rgba(245,158,11,0.5)"
                : d.id % 3 === 1
                  ? "rgba(249,115,22,0.4)"
                  : "rgba(254,243,199,0.2)",
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -(20 + Math.random() * 25)],
          }}
          transition={{
            duration: d.dur,
            delay: d.del,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

/* ==========================================================================
   几何线框装饰
   ========================================================================== */
const WIREFRAMES = [
  { x: "7%", y: "15%", size: 100, dur: 30, del: 0, shape: "hex" },
  { x: "88%", y: "20%", size: 70, dur: 24, del: 1, shape: "diamond" },
  { x: "80%", y: "70%", size: 90, dur: 28, del: 0.5, shape: "tri" },
  { x: "10%", y: "75%", size: 60, dur: 22, del: 2, shape: "ring" },
  { x: "50%", y: "6%", size: 50, dur: 20, del: 1.5, shape: "square" },
  { x: "93%", y: "48%", size: 45, dur: 26, del: 3, shape: "ring" },
]

function Wireframe({ x, y, size: s, dur, del, shape }: (typeof WIREFRAMES)[number]) {
  const c1 = "rgba(245,158,11,0.08)"
  const c2 = "rgba(249,115,22,0.12)"

  const el: Record<string, React.ReactNode> = {
    hex: (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <polygon points="50,5 93,27 93,73 50,95 7,73 7,27" stroke={c1} strokeWidth="0.5" />
        <polygon points="50,25 75,38 75,62 50,75 25,62 25,38" stroke={c2} strokeWidth="0.4" />
      </svg>
    ),
    diamond: (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <polygon points="50,5 95,50 50,95 5,50" stroke={c1} strokeWidth="0.5" />
        <polygon points="50,25 75,50 50,75 25,50" stroke={c2} strokeWidth="0.4" />
      </svg>
    ),
    tri: (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <polygon points="50,8 94,88 6,88" stroke={c1} strokeWidth="0.5" />
        <line x1="50" y1="8" x2="50" y2="88" stroke={c2} strokeWidth="0.3" />
      </svg>
    ),
    ring: (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" stroke={c1} strokeWidth="0.5" />
        <circle cx="50" cy="50" r="22" stroke={c2} strokeWidth="0.4" />
      </svg>
    ),
    square: (
      <svg width={s} height={s} viewBox="0 0 100 100" fill="none">
        <rect x="15" y="15" width="70" height="70" stroke={c1} strokeWidth="0.5" />
        <rect x="30" y="30" width="40" height="40" stroke={c2} strokeWidth="0.4" />
      </svg>
    ),
  }

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      animate={{
        opacity: [0, 0.6, 0.4, 0.7, 0],
        rotate: [0, 180, 360],
        y: [0, -12, 8, -10, 0],
      }}
      transition={{ duration: dur, delay: del, repeat: Infinity, ease: "linear" }}
    >
      {el[shape]}
    </motion.div>
  )
}

/* ==========================================================================
   标题
   ========================================================================== */
function Title() {
  const name = "zhiqiang"
  const ext = ".dev"

  return (
    <div className="relative mb-5">
      {/* 标题光晕 */}
      <motion.div
        className="absolute inset-0 -z-10 blur-[90px] opacity-20"
        style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.6), rgba(249,115,22,0.3))",
        }}
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <h1 className="text-[clamp(3rem,9vw,7.5rem)] leading-[0.9] font-heading font-black tracking-[-0.03em] select-none">
        <span className="block">
          {name.split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #FCD34D, #F59E0B, #F97316, #F59E0B)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
              animate={{
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                backgroundPosition: ["0% center", "100% center", "0% center"],
              }}
              transition={{
                opacity: { delay: 0.3 + i * 0.05, duration: 0.5 },
                y: { delay: 0.3 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                filter: { delay: 0.3 + i * 0.05, duration: 0.5 },
                backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear", delay: 1.5 },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
        <motion.span
          className="block text-[clamp(1.5rem,4.5vw,4rem)] text-foreground/15 tracking-[0.2em] font-light ml-0.5"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {ext}
        </motion.span>
      </h1>
    </div>
  )
}

/* ==========================================================================
   毛玻璃副标题
   ========================================================================== */
function Subtitle() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mb-10"
    >
      <div
        className="px-6 py-3.5 rounded-xl"
        style={{
          background: "rgba(28, 20, 16, 0.5)",
          backdropFilter: "blur(30px) saturate(1.5)",
          WebkitBackdropFilter: "blur(30px) saturate(1.5)",
          border: "1px solid rgba(245, 158, 11, 0.07)",
        }}
      >
        {/* 扫光 */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-[0.05]"
          style={{
            background:
              "linear-gradient(105deg, transparent 35%, rgba(245,158,11,0.6) 50%, transparent 65%)",
            backgroundSize: "250% 100%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
        />

        <p className="relative text-sm sm:text-base tracking-[0.06em] text-foreground/50 font-light">
          技术博客{" "}
          <span className="text-warm mx-1 font-medium">×</span>{" "}
          AI 工具库
        </p>
        <p className="relative text-xs text-foreground/25 tracking-[0.2em] mt-1 font-mono uppercase">
          Skills · Prompts · MCP
        </p>
      </div>
    </motion.div>
  )
}

/* ==========================================================================
   发光主按钮
   ========================================================================== */
function PrimaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      mx.set((e.clientX - r.left) / r.width)
      my.set((e.clientY - r.top) / r.height)
    },
    [mx, my]
  )

  const spotlight = useTransform(
    [mx, my],
    ([x, y]: number[]) =>
      `radial-gradient(circle 50px at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.2), transparent)`
  )

  return (
    <Link
      ref={ref}
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMove}
      className="group relative inline-flex items-center justify-center h-11 px-7 rounded-full text-[13px] font-medium overflow-visible"
    >
      {/* 外发光 */}
      <motion.div
        className="absolute -inset-0.5 rounded-full"
        animate={{
          boxShadow: hovered
            ? "0 0 15px rgba(245,158,11,0.4), 0 0 40px rgba(245,158,11,0.15)"
            : "0 0 0 transparent",
        }}
        transition={{ duration: 0.4 }}
      />

      {/* 按钮底色 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "linear-gradient(135deg, #F59E0B, #E67E22, #F97316)" }}
      />

      {/* 鼠标追踪高光 */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: spotlight }}
      />

      <span className="relative z-10 text-[#1C1410] flex items-center gap-1.5">
        {children}
        <motion.span
          animate={hovered ? { x: 3 } : { x: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          →
        </motion.span>
      </span>
    </Link>
  )
}

/* ==========================================================================
   磁吸次按钮
   ========================================================================== */
function SecondaryButton({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18 })
  const sy = useSpring(y, { stiffness: 180, damping: 18 })
  const [hovered, setHovered] = useState(false)

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      x.set((e.clientX - r.left - r.width / 2) * 0.25)
      y.set((e.clientY - r.top - r.height / 2) * 0.25)
    },
    [x, y]
  )

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { x.set(0); y.set(0); setHovered(false) }}
      className="relative inline-flex items-center justify-center h-11 px-7 rounded-full text-[13px] font-medium transition-colors duration-300"
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="absolute inset-0 rounded-full transition-all duration-300"
        style={{
          border: `1px solid ${hovered ? "rgba(245,158,11,0.25)" : "rgba(254,243,199,0.08)"}`,
          background: hovered ? "rgba(245,158,11,0.05)" : "transparent",
        }}
      />
      <span className={`relative z-10 transition-colors duration-300 ${hovered ? "text-foreground/80" : "text-foreground/40"}`}>
        {children}
      </span>
    </motion.a>
  )
}

/* ==========================================================================
   滚动指示
   ========================================================================== */
function ScrollHint() {
  return (
    <motion.div
      className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2 }}
    >
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-[9px] tracking-[0.25em] uppercase text-foreground/12 font-mono">
          scroll
        </span>
        <div className="w-[1px] h-7 rounded-full overflow-hidden bg-foreground/5">
          <motion.div
            className="w-full h-1/2 rounded-full"
            style={{ background: "linear-gradient(to bottom, #F59E0B, transparent)" }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ==========================================================================
   PAGE
   ========================================================================== */
export default function HomePage() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] overflow-hidden">
      <WarmAurora />
      <Particles />
      {WIREFRAMES.map((w, i) => (
        <Wireframe key={i} {...w} />
      ))}

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* 状态标签 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] tracking-[0.15em] uppercase font-mono"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.1)",
              color: "rgba(252,211,77,0.5)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse" />
            building in public
          </span>
        </motion.div>

        <Title />
        <Subtitle />

        {/* 按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <PrimaryButton href="/blog">阅读博客</PrimaryButton>
          <SecondaryButton href="/skills">探索工具库</SecondaryButton>
        </motion.div>
      </div>

      {/* 底部渐隐 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, #0C0A09, transparent)" }}
      />

      <ScrollHint />
    </section>
  )
}
