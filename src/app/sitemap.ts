import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { getKnowledgeLibrary } from "@/features/knowledge/lib/library"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/knowledge",
    "/chat",
    "/lab",
    "/projects",
    "/projects/archive",
    "/about",
  ]

  const knowledgePages = getKnowledgeLibrary().map((entry) => ({
    url: `${siteConfig.url}${entry.href}`,
    ...(entry.updatedAt ? { lastModified: entry.updatedAt } : {}),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [
    ...staticPages.map((path) => ({
      url: `${siteConfig.url}${path}`,
      lastModified: new Date(),
      changeFrequency:
        path === "" ||
        path.startsWith("/chat") ||
        path === "/knowledge" ||
        path === "/lab"
          ? ("weekly" as const)
          : ("monthly" as const),
      priority:
        path === ""
          ? 1
          : path.startsWith("/chat") ||
              path === "/knowledge" ||
              path === "/lab"
            ? 0.9
            : 0.8,
    })),
    ...knowledgePages,
  ]
}
