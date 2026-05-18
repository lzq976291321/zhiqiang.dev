import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ImageIcon,
  Layers3,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react"
import { CopyButton } from "@/components/shared/CopyButton"
import { getAllPromptCases, getPromptCaseBySlug } from "@/lib/content"
import { siteConfig } from "@/config/site"
import type { PromptCase } from "@/lib/types"

type PageProps = {
  params: Promise<{ slug: string }>
}

const modeLabel: Record<PromptCase["mode"], string> = {
  image: "Image Prompt",
  video: "Video Prompt",
}

const difficultyLabel: Record<PromptCase["difficulty"], string> = {
  starter: "Starter",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

export function generateStaticParams() {
  return getAllPromptCases().map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const item = getPromptCaseBySlug(slug)

  if (!item) {
    return {}
  }

  return {
    title: item.title,
    description: item.description,
    alternates: {
      canonical: `${siteConfig.url}/prompts/${item.slug}`,
    },
    openGraph: {
      title: `${item.title} | Prompt Studio`,
      description: item.description,
      url: `${siteConfig.url}/prompts/${item.slug}`,
      images: [item.asset],
    },
  }
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="glass-card p-5">
      <h2 className="font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-white/54">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-100/64" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PromptBlock({ title, text }: { title: string; text?: string }) {
  if (!text) {
    return null
  }

  return (
    <section className="glass-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
          {title}
        </h2>
        <CopyButton text={text} />
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-words p-5 font-mono text-sm leading-7 text-cyan-50/76">
        {text}
      </pre>
    </section>
  )
}

function ReferenceMedia({ item }: { item: PromptCase }) {
  const media = item.media ?? []

  if (media.length === 0) {
    return null
  }

  return (
    <section className="glass-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
            Visual reference
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
            参考图片 / 视频
          </h2>
        </div>
      </div>

      <div className={`grid gap-4 p-4 ${media.length > 1 ? "md:grid-cols-2" : ""}`}>
        {media.map((entry, index) => (
          <figure
            key={`${entry.type}-${entry.src}`}
            className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f]"
          >
            {entry.type === "video" ? (
              <video
                src={entry.src}
                poster={entry.poster}
                controls
                playsInline
                preload="metadata"
                className="aspect-video w-full bg-black object-contain"
              />
            ) : (
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={entry.src}
                  alt={entry.alt}
                  fill
                  unoptimized
                  loading="eager"
                  sizes={media.length > 1 ? "(min-width: 768px) 35vw, 100vw" : "100vw"}
                  className="object-cover"
                />
              </div>
            )}
            <figcaption className="flex items-center justify-between gap-4 px-4 py-3 text-xs text-white/42">
              <span>
                {entry.type === "video" ? "Video sample" : "Image sample"} {index + 1}
              </span>
              <span>{item.mode === "video" ? "motion" : "image"}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="border-t border-white/10 px-5 py-4 text-xs leading-5 text-white/40">
        这些媒体仅作为视觉参考和 Prompt 结构对照，正文案例已重新组织为可复用的创作模板。
      </p>
    </section>
  )
}

export default async function PromptCasePage({ params }: PageProps) {
  const { slug } = await params
  const item = getPromptCaseBySlug(slug)

  if (!item) {
    notFound()
  }

  const cases = getAllPromptCases()
  const currentIndex = cases.findIndex((entry) => entry.slug === item.slug)
  const previous = cases[currentIndex - 1]
  const next = cases[currentIndex + 1]
  const ModeIcon = item.mode === "image" ? ImageIcon : Clapperboard

  return (
    <main className="relative min-h-screen px-4 pb-24 pt-28 sm:px-6 lg:pt-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-[13px] text-white/48">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Prompt Studio
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <article className="min-w-0 space-y-5">
            <div className="glass-card overflow-hidden">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#07111f]">
                <Image
                  src={item.asset}
                  alt={item.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 70vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07111f]/92 to-transparent" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/22 px-3 py-1.5 text-xs text-white/76 backdrop-blur-xl">
                    <ModeIcon className="size-3.5" />
                    {modeLabel[item.mode]}
                  </span>
                  <span className="rounded-full border border-white/12 bg-black/22 px-3 py-1.5 font-mono text-[11px] text-white/58 backdrop-blur-xl">
                    {item.ratio}
                  </span>
                </div>
              </div>
              <header className="p-6 sm:p-8 lg:p-10">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/48">
                  {item.category}
                </p>
                <h1 className="max-w-4xl text-balance font-heading text-5xl font-semibold leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl">
                  {item.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-white/62">
                  {item.description}
                </p>
              </header>
            </div>

            <ReferenceMedia item={item} />

            <PromptBlock title="完整 Prompt" text={item.prompt} />
            <PromptBlock title="Negative Prompt" text={item.negative} />

            <div className="grid gap-5 lg:grid-cols-2">
              <InfoList title="结构拆解" items={item.structure} />
              <InfoList title="参数建议" items={item.parameters} />
            </div>

            {item.shotList.length > 0 ? (
              <InfoList title="视频分镜" items={item.shotList} />
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
              <InfoList title="常见失败点" items={item.failureModes} />
              <InfoList title="二次迭代 Prompt" items={item.iterationPrompts} />
            </div>

            {item.content.trim() ? (
              <section className="glass-card p-5 text-sm leading-7 text-white/54 sm:p-6">
                {item.content.split("\n").filter(Boolean).map((line) => (
                  <p key={line} className="mb-3 last:mb-0">
                    {line}
                  </p>
                ))}
              </section>
            ) : null}

            {previous || next ? (
              <nav
                aria-label="Prompt case navigation"
                className={`grid gap-4 ${previous && next ? "md:grid-cols-2" : ""}`}
              >
                {previous ? (
                  <Link
                    href={`/prompts/${previous.slug}`}
                    className="glass-card group block p-5 transition hover:-translate-y-1 hover:border-cyan-100/22"
                  >
                    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/48">
                      <ChevronLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
                      Previous
                    </p>
                    <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
                      {previous.title}
                    </h2>
                  </Link>
                ) : null}

                {next ? (
                  <Link
                    href={`/prompts/${next.slug}`}
                    className="glass-card group block p-5 text-right transition hover:-translate-y-1 hover:border-cyan-100/22"
                  >
                    <p className="flex items-center justify-end gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/48">
                      Next
                      <ChevronRight className="size-3.5 transition group-hover:translate-x-0.5" />
                    </p>
                    <h2 className="mt-3 font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
                      {next.title}
                    </h2>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="glass-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
                Case details
              </p>
              <div className="mt-5 space-y-3 text-sm text-white/52">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2">
                    <Layers3 className="size-4 text-cyan-100/56" />
                    Use case
                  </span>
                  <span className="text-right text-white/72">{item.useCase}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-cyan-100/56" />
                    Difficulty
                  </span>
                  <span className="text-white/72">{difficultyLabel[item.difficulty]}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2">
                    <TriangleAlert className="size-4 text-cyan-100/56" />
                    Output
                  </span>
                  <span className="text-right text-white/72">{item.output}</span>
                </div>
              </div>
            </section>

            <section className="glass-card p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/46">
                Model fit
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.modelFit.map((model) => (
                  <span
                    key={model}
                    className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs text-white/48"
                  >
                    {model}
                  </span>
                ))}
              </div>
            </section>

            <Link
              href="/prompts"
              className="glass-card group flex items-center justify-between gap-4 p-5 transition hover:-translate-y-1 hover:border-cyan-100/22"
            >
              <span>
                <span className="block font-heading text-xl font-semibold tracking-[-0.02em] text-white">
                  More cases
                </span>
                <span className="mt-1 block text-sm text-white/46">回到 Prompt Studio</span>
              </span>
              <ArrowUpRight className="size-4 text-cyan-100/68 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </aside>
        </section>
      </div>
    </main>
  )
}
