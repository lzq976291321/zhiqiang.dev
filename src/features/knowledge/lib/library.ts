import { getAllKnowledgeEntries } from "@/lib/content"

export function getPublicKnowledgeEntries() {
  return getAllKnowledgeEntries().filter(
    (entry) => entry.status === "published" && entry.confidence !== "low"
  )
}

export function getKnowledgeLibrary() {
  return getPublicKnowledgeEntries()
    .filter((entry) => entry.slug.startsWith("pi-book-"))
    .map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      tags: entry.tags,
      href: `/knowledge/${entry.slug}`,
      kind: "读书笔记",
      category: "pi 的设计艺术",
      updatedAt: entry.updatedAt,
    }))
}

export type LibraryItem = ReturnType<typeof getKnowledgeLibrary>[number]
