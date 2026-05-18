import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Layers3, ListTree } from "lucide-react"
import { AgentMdx } from "@/components/agent/AgentMdx"
import { getAgentArticleBySlug, getAllAgentArticles } from "@/lib/content"
import { extractAgentHeadings } from "@/lib/agent-headings"
import { siteConfig } from "@/config/site"

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllAgentArticles().map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getAgentArticleBySlug(slug)

  if (!article) {
    return {}
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${siteConfig.url}/agent/${article.slug}`,
    },
    openGraph: {
      title: `${article.title} | Agent Engineering`,
      description: article.description,
      url: `${siteConfig.url}/agent/${article.slug}`,
      type: "article",
    },
  }
}

export default async function AgentArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getAgentArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const articles = getAllAgentArticles()
  const currentIndex = articles.findIndex((item) => item.slug === article.slug)
  const previousArticle = articles[currentIndex - 1]
  const nextArticle = articles[currentIndex + 1]
  const headings = extractAgentHeadings(article.content)
  const progress = Math.round(((currentIndex + 1) / articles.length) * 100)
  const stepLabel = String(currentIndex + 1).padStart(2, "0")
  const totalLabel = String(articles.length).padStart(2, "0")

  return (
    <main className="relative min-h-screen px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/agent"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white/56 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Agent Engineering
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_304px]">
          <div className="min-w-0 space-y-6">
            <section className="glass-card overflow-hidden p-4 lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/46">
                    Series progress
                  </p>
                  <p className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
                    {stepLabel}
                    <span className="text-white/24"> / {totalLabel}</span>
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/46">
                  {progress}%
                </span>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-100 via-white to-emerald-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {headings.length > 0 ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
                    <ListTree className="size-4 text-cyan-100/60" />
                    目录
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {headings.map((heading, index) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="group flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/50 transition hover:border-cyan-100/20 hover:bg-white/[0.075] hover:text-white/82"
                      >
                        <span className="font-mono text-[10px] text-cyan-100/38">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 truncate">{heading.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            <article className="overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.075] shadow-[0_30px_110px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
              <header className="relative overflow-hidden border-b border-white/10 p-6 sm:p-9 lg:p-12">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(159,232,255,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(184,247,212,0.16),transparent_32%)]" />
                <div className="mb-12 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-cyan-100/18 bg-cyan-100/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-50/78">
                    {article.series}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/48">
                    <Layers3 className="size-3.5" />
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/48">
                    <Clock className="size-3.5" />
                    {article.readTime}
                  </span>
                </div>
                <h1 className="max-w-4xl text-balance font-heading text-5xl font-semibold leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                  {article.title}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/62">
                  {article.description}
                </p>
              </header>

              <div className="px-6 py-4 sm:px-9 lg:px-12">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/38"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-12 sm:px-9 lg:px-12">
                <AgentMdx source={article.content} />
              </div>
            </article>

            {previousArticle || nextArticle ? (
              <nav
                aria-label="Article navigation"
                className={`grid gap-4 ${previousArticle && nextArticle ? "md:grid-cols-2" : ""}`}
              >
                {previousArticle ? (
                  <Link
                    href={`/agent/${previousArticle.slug}`}
                    className="glass-card group block p-5 transition hover:-translate-y-1 hover:border-cyan-100/22"
                  >
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/48">
                      <ChevronLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
                      Previous
                    </p>
                    <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
                      {previousArticle.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/48">
                      {previousArticle.description}
                    </p>
                  </Link>
                ) : null}

                {nextArticle ? (
                  <Link
                    href={`/agent/${nextArticle.slug}`}
                    className="glass-card group block p-5 text-right transition hover:-translate-y-1 hover:border-cyan-100/22"
                  >
                    <p className="flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/48">
                      Next
                      <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
                    </p>
                    <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
                      {nextArticle.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/48">{nextArticle.description}</p>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              <section className="glass-card overflow-hidden p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
                  Series progress
                </p>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <p className="font-heading text-5xl font-semibold tracking-[-0.055em] text-white">
                    {stepLabel}
                    <span className="text-2xl text-white/24"> / {totalLabel}</span>
                  </p>
                  <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-xs text-white/46">
                    {progress}%
                  </span>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-100 via-white to-emerald-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-5 text-sm leading-6 text-white/44">{article.category}</p>
              </section>

              {headings.length > 0 ? (
                <nav aria-label="On this page" className="glass-card overflow-hidden p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white/74">
                    <ListTree className="size-4 text-cyan-100/62" />
                    On this page
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {headings.map((heading, index) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="group flex min-w-0 items-start gap-2 rounded-2xl px-3 py-2 text-sm text-white/46 transition hover:bg-white/[0.065] hover:text-white/82"
                      >
                        <span className="mt-0.5 font-mono text-[10px] text-cyan-100/34">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 leading-5">{heading.title}</span>
                      </a>
                    ))}
                  </div>
                </nav>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
