"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowUpRight,
  Clapperboard,
  ImageIcon,
  Layers3,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"
import type { PromptCase } from "@/lib/types"

const filters = [
  { label: "全部", value: "all" },
  { label: "生图", value: "image" },
  { label: "生视频", value: "video" },
] as const

const modeLabel: Record<PromptCase["mode"], string> = {
  image: "Image Prompt",
  video: "Video Prompt",
}

const difficultyLabel: Record<PromptCase["difficulty"], string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

const studioPrinciples = [
  {
    icon: Layers3,
    title: "先定结构",
    desc: "主体、场景、镜头、光线、材质、留白先分层，避免只堆风格词。",
  },
  {
    icon: SlidersHorizontal,
    title: "再控失败点",
    desc: "把品牌、人物、文字、物理运动和镜头稳定性写进约束。",
  },
  {
    icon: Clapperboard,
    title: "最后做迭代",
    desc: "每个案例保留二次 Prompt，把调图和调视频变成可复用流程。",
  },
]

function PromptCard({ item, index }: { item: PromptCase; index: number }) {
  const Icon = item.mode === "image" ? ImageIcon : Clapperboard

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/prompts/${item.slug}`}
        className="glass-card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan-100/24 hover:bg-white/[0.095]"
      >
        <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#07111f]">
          <Image
            src={item.asset}
            alt={item.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.035]"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#07111f]/88 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/22 px-2.5 py-1 text-[11px] text-white/74 backdrop-blur-xl">
              <Icon className="size-3.5" />
              {modeLabel[item.mode]}
            </span>
            <span className="rounded-full border border-white/12 bg-black/22 px-2.5 py-1 font-mono text-[10px] text-white/58 backdrop-blur-xl">
              {item.ratio}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/45">
              {item.category}
            </p>
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] text-white/42">
              {difficultyLabel[item.difficulty]}
            </span>
          </div>
          <h2 className="text-balance font-heading text-2xl font-semibold leading-tight text-white/92">
            {item.title}
          </h2>
          <p className="mt-3 flex-1 text-sm leading-6 text-white/48">{item.description}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/36"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-50/72">
            打开案例
            <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function CoverGallery({ cases }: { cases: PromptCase[] }) {
  const featured = cases[0]
  const sideCases = cases.slice(1, 4)

  if (!featured) {
    return (
      <div className="min-h-[420px] rounded-[30px] border border-white/10 bg-white/[0.045]" />
    )
  }

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[30px] border border-white/10 bg-[#07111f] shadow-2xl shadow-black/30 lg:min-h-[560px]">
      <Image
        src={featured.asset}
        alt={featured.title}
        fill
        priority
        sizes="(min-width: 1024px) 48vw, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.02),rgba(7,17,31,0.72)),linear-gradient(90deg,rgba(7,17,31,0.18),rgba(7,17,31,0))]" />
      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/14 bg-black/24 px-3 py-1.5 text-xs text-white/72 backdrop-blur-xl">
        <Sparkles className="size-3.5 text-[#ffd18a]" />
        Cover Case 01
      </div>

      <div className="absolute inset-x-5 bottom-5">
        <div className="max-w-xl rounded-[24px] border border-white/12 bg-black/24 p-4 backdrop-blur-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/58">
            {featured.category}
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold leading-none text-white sm:text-4xl">
            {featured.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/58">{featured.description}</p>
        </div>
      </div>

      <div className="absolute right-4 top-20 hidden w-36 space-y-3 sm:block">
        {sideCases.map((item) => (
          <Link
            key={item.slug}
            href={`/prompts/${item.slug}`}
            className="group block overflow-hidden rounded-[20px] border border-white/12 bg-black/22 p-1.5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-100/28"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-[15px] bg-[#07111f]">
              <Image
                src={item.asset}
                alt={item.title}
                fill
                sizes="144px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <p className="truncate px-1.5 pb-1 pt-2 text-xs text-white/62">{item.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PromptStudioIndex({ cases }: { cases: PromptCase[] }) {
  const [mode, setMode] = useState<(typeof filters)[number]["value"]>("all")
  const filtered = useMemo(
    () => (mode === "all" ? cases : cases.filter((item) => item.mode === mode)),
    [cases, mode]
  )
  const imageCount = cases.filter((item) => item.mode === "image").length
  const videoCount = cases.filter((item) => item.mode === "video").length
  const mediaCount = cases.reduce((sum, item) => sum + (item.media?.length ?? 0), 0)

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[68vh] w-[92vw] -translate-x-1/2 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_14%,rgba(255,209,138,0.2),transparent_34rem),radial-gradient(ellipse_at_76%_18%,rgba(159,232,255,0.22),transparent_32rem),radial-gradient(ellipse_at_58%_76%,rgba(184,247,212,0.16),transparent_30rem)]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[13px] text-white/48">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </Link>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[36px] border border-white/13 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.045))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-3xl sm:p-5 lg:p-6"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_14%_10%,rgba(159,232,255,0.18),transparent_28rem)]" />
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-stretch">
            <div className="flex flex-col justify-between rounded-[30px] border border-white/10 bg-[#07111f]/58 p-6 sm:p-8 lg:min-h-[520px] lg:p-10">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-100/50">
                  visual prompt lab
                </p>
                <h1 className="mt-5 text-balance font-heading text-5xl font-semibold leading-[0.94] text-white sm:text-6xl lg:text-7xl">
                  把生图生视频 Prompt 写成可复用的镜头系统
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                  这里不是简单收集提示词，而是把画面、镜头、声音、失败点和二次迭代拆开，沉淀成可以直接迁移到项目里的创作模板。
                </p>
              </div>

              <div className="mt-10">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    [String(cases.length), "案例"],
                    [String(imageCount), "生图"],
                    [String(videoCount), "生视频"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-[20px] border border-white/10 bg-white/[0.055] px-3 py-3 sm:px-4"
                    >
                      <p className="font-heading text-3xl font-semibold leading-none text-white">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-white/42">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href="#case-grid"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-100/22 bg-cyan-100/14 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-100/20"
                  >
                    查看案例
                    <ArrowUpRight className="size-4" />
                  </a>
                  <span className="rounded-full border border-[#ffd18a]/24 bg-[#ffd18a]/10 px-4 py-2.5 text-sm text-[#ffe0ad]/72">
                    {mediaCount} 个图片 / 视频参考
                  </span>
                </div>
              </div>
            </div>

            <CoverGallery cases={cases} />
          </div>
        </motion.section>

        <section className="mt-5 grid gap-4 lg:grid-cols-3">
          {studioPrinciples.map((item) => (
            <div key={item.title} className="glass-card p-5">
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-100/72">
                <item.icon className="size-5" />
              </div>
              <h2 className="font-heading text-2xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/50">{item.desc}</p>
            </div>
          ))}
        </section>

        <section id="case-grid" className="mt-10 scroll-mt-28">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-100/46">
                studio cases
              </p>
              <h2 className="mt-2 font-heading text-4xl font-semibold text-white">
                案例库
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={`rounded-full border px-3.5 py-2 font-mono text-[12px] tracking-wider transition ${
                    mode === item.value
                      ? "border-cyan-100/22 bg-cyan-100/14 text-cyan-50"
                      : "border-white/10 bg-white/[0.045] text-white/44 hover:bg-white/[0.075] hover:text-white/76"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, index) => (
              <PromptCard key={item.slug} item={item} index={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
