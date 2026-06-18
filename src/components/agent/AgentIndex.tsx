"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  GitBranch,
  Layers3,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
} from "lucide-react"
import type { AgentArticle } from "@/lib/types"

const modules = [
  { label: "Instruction", desc: "角色、规则、边界", icon: BrainCircuit },
  { label: "Context", desc: "项目、任务、环境", icon: Layers3 },
  { label: "Planning", desc: "目标拆解与路径", icon: GitBranch },
  { label: "Tool Use", desc: "工具协议与能力", icon: TerminalSquare },
  { label: "Verification", desc: "测试、检查、回放", icon: CheckCircle2 },
  { label: "Permission", desc: "权限、审计、回滚", icon: ShieldCheck },
]

const levelLabel: Record<AgentArticle["level"], string> = {
  foundation: "Foundation",
  practice: "Practice",
  advanced: "Advanced",
}

export function AgentIndex({ articles }: { articles: AgentArticle[] }) {
  const [category, setCategory] = useState("全部")
  const featured = articles[0]
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const article of articles) {
      counts.set(article.category, (counts.get(article.category) ?? 0) + 1)
    }

    return [
      { name: "全部", count: articles.length },
      ...Array.from(counts, ([name, count]) => ({ name, count })),
    ]
  }, [articles])
  const filteredArticles = category === "全部"
    ? articles
    : articles.filter((article) => article.category === category)

  return (
    <div className="space-y-8">
      <section className="grid items-start gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        {featured ? (
          <div className="glass-card animate-fade-in-up overflow-hidden p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <span className="rounded-full border border-cyan-100/18 bg-cyan-100/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-50/80">
                Start here
              </span>
              <Sparkles className="size-5 text-cyan-100/70" />
            </div>
            <p className="mb-4 text-sm text-white/46">{featured.category}</p>
            <h2 className="max-w-3xl text-balance font-heading text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-white sm:text-5xl">
              {featured.title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">
              {featured.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={`/agent/${featured.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/12 px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-white/18"
              >
                Read article
                <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <span className="font-mono text-xs text-white/38">{featured.readTime}</span>
            </div>
          </div>
        ) : null}

        <div className="glass-card animate-fade-in-up p-5 sm:p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-100/55">
            Agent system map
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {modules.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3 transition hover:border-cyan-100/20 hover:bg-white/[0.075]"
                >
                  <span className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-50/78">
                    <Icon className="size-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white/86">{item.label}</span>
                    <span className="text-xs text-white/42">{item.desc}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="glass-card p-3 sm:p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => {
            const active = item.name === category

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setCategory(item.name)}
                className={`rounded-full border px-3.5 py-2 text-sm transition ${
                  active
                    ? "border-cyan-100/22 bg-cyan-100/14 text-cyan-50"
                    : "border-white/10 bg-white/[0.045] text-white/48 hover:bg-white/[0.075] hover:text-white/76"
                }`}
              >
                {item.name}
                <span className="ml-2 font-mono text-[11px] opacity-55">{item.count}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <article
            key={article.slug}
          >
            <Link
              href={`/agent/${article.slug}`}
              className="glass-card group block h-full overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-100/24 hover:bg-white/[0.095]"
            >
              <div className="mb-7 flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-cyan-100/54">
                  {String(article.order).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/48">
                  {levelLabel[article.level]}
                </span>
              </div>
              <p className="mb-2 text-sm text-white/40">{article.category}</p>
              <h3 className="text-balance font-heading text-2xl font-semibold leading-tight tracking-[-0.025em] text-white/92">
                {article.title}
              </h3>
              <p className="mt-4 min-h-14 text-sm leading-6 text-white/48">{article.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/38"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-cyan-50/72">
                Open note
                <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
            </Link>
          </article>
        ))}
      </section>
    </div>
  )
}
