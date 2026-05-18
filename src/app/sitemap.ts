import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { getAllAgentArticles } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "", "/agent", "/skills", "/mcp", "/projects", "/about", "/resume",
  ]

  const agentPages = getAllAgentArticles().map((article) => `/agent/${article.slug}`)

  return [...staticPages, ...agentPages].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path.startsWith("/agent") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/agent") ? 0.9 : 0.8,
  }))
}
