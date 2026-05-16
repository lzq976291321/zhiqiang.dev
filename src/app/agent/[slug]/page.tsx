import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Layers3 } from "lucide-react"
import { AgentMdx } from "@/components/agent/AgentMdx"
import { getAgentArticleBySlug, getAllAgentArticles } from "@/lib/content"
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
  const nextArticle = articles[currentIndex + 1]

  return (
    <main className="relative min-h-screen px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/agent"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white/56 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Agent Engineering
        </Link>

        <article className="mt-8 overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.075] shadow-[0_30px_110px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
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

        {nextArticle ? (
          <Link
            href={`/agent/${nextArticle.slug}`}
            className="glass-card group mt-6 block p-6 transition hover:-translate-y-1 hover:border-cyan-100/22"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/48">
              Next article
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
              {nextArticle.title}
            </h2>
            <p className="mt-2 text-sm text-white/48">{nextArticle.description}</p>
          </Link>
        ) : null}
      </div>
    </main>
  )
}
