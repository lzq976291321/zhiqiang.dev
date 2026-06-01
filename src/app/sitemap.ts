import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { getAllAgentArticles } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "", "/chat", "/agent", "/design-lab", "/skills", "/mcp", "/projects", "/about",
  ]

  const agentPages = getAllAgentArticles().map((article) => `/agent/${article.slug}`)

  return [...staticPages, ...agentPages].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path.startsWith("/chat") || path.startsWith("/agent") || path.startsWith("/design-lab") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/chat") || path.startsWith("/agent") || path.startsWith("/design-lab") ? 0.9 : 0.8,
  }))
}
