"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowUpRight, Clapperboard, ImageIcon, Sparkles } from "lucide-react"
import { PageShell } from "@/components/shared/PageShell"
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
          <h2 className="text-balance font-heading text-2xl font-semibold leading-tight tracking-[-0.025em] text-white/92">
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
            Open case
            <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

export function PromptStudioIndex({ cases }: { cases: PromptCase[] }) {
  const [mode, setMode] = useState<(typeof filters)[number]["value"]>("all")
  const filtered = useMemo(
    () => (mode === "all" ? cases : cases.filter((item) => item.mode === mode)),
    [cases, mode]
  )
  const featured = cases[0]
  const imageCount = cases.filter((item) => item.mode === "image").length
  const videoCount = cases.filter((item) => item.mode === "video").length

  return (
    <PageShell
      title="Prompt Studio"
      subtitle="娱乐性和美学向精品案例：电影海报、胶片写真、美食大片、音乐视觉和品牌短片。"
      accent="#9FE8FF"
    >
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card overflow-hidden p-5 sm:p-6">
          {featured ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f]">
              <Image
                src={featured.asset}
                alt={featured.title}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-100/10 px-3 py-1.5 text-sm text-cyan-50/78 backdrop-blur-xl">
                  <Sparkles className="size-4" />
                  Real scenes + aesthetic prompts
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          {[
            ["好玩优先", "案例先服务真实创作欲望：海报、写真、美食、音乐、香水广告、梦核空间。"],
            ["美学明确", "每个 prompt 都锁定镜头、光线、色彩和失败边界，避免只写风格词。"],
            ["能直接改", "详情页保留完整 prompt、负向约束和二次迭代句，方便换题材复用。"],
          ].map(([title, desc]) => (
            <div key={title} className="glass-card p-5">
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/50">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          [String(cases.length), "Studio cases"],
          [String(imageCount), "Image prompts"],
          [String(videoCount), "Video prompts"],
        ].map(([value, label]) => (
          <div key={label} className="glass-card p-4">
            <p className="font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
              {value}
            </p>
            <p className="mt-1 text-xs text-white/42">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <div className="mb-6 flex flex-wrap gap-2">
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item, index) => (
            <PromptCard key={item.slug} item={item} index={index} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
