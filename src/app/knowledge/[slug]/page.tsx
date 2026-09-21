import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ArticleReader } from "@/features/knowledge/components/ArticleReader"
import { getPublicKnowledgeEntries } from "@/features/knowledge/lib/library"
import { piChapterNumber, piReadingOrder, shortBookTitle } from "@/features/knowledge/lib/catalog"

type Props = { params: Promise<{ slug: string }> }
export function generateStaticParams() {
  return getPublicKnowledgeEntries().map(({ slug }) => ({ slug }))
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getPublicKnowledgeEntries().find((item) => item.slug === slug)
  return entry ? {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: `/knowledge/${entry.slug}` },
    openGraph: { title: entry.title, description: entry.description, type: "article", url: `/knowledge/${entry.slug}` },
  } : {}
}
export default async function KnowledgeArticle({ params }: Props) {
  const { slug } = await params
  const entries = getPublicKnowledgeEntries()
  const entry = entries.find((item) => item.slug === slug)
  if (!entry) notFound()
  const isBook = entry.slug.startsWith("pi-book-")
  const bookEntries = entries.filter((item) => item.slug.startsWith("pi-book-")).sort((a, b) => piReadingOrder(a.slug) - piReadingOrder(b.slug))
  const index = bookEntries.findIndex((item) => item.slug === slug)
  const previous = isBook ? bookEntries[index - 1] : undefined
  const next = isBook ? bookEntries[index + 1] : undefined
  const chapter = piChapterNumber(slug)
  const source = entry.content.replace(/^>\s*source id:.*$/gm, "").replace(/^\s*# .+\n/, "")
  return <ArticleReader title={isBook ? entry.title.replace(/^pi 设计艺术｜/, "") : entry.title} description={entry.description} category={isBook ? "读书笔记" : "实践记录"} tags={entry.tags} updatedAt={entry.updatedAt} source={source} format="md" previous={previous ? { title: shortBookTitle(previous.title), href: `/knowledge/${previous.slug}` } : undefined} next={next ? { title: shortBookTitle(next.title), href: `/knowledge/${next.slug}` } : undefined} series={isBook ? { title: "pi 的设计艺术", href: "/knowledge/pi-book-index", position: chapter ? `第 ${String(chapter).padStart(2, "0")} 章 · 共 ${bookEntries.filter((item) => piChapterNumber(item.slug) !== undefined).length} 章` : "前言、正文与附录" } : undefined} />
}
