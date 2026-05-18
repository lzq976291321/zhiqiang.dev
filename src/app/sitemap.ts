import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { getAllAgentArticles, getAllPromptCases } from "@/lib/content"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "", "/agent", "/prompts", "/prompts/research", "/skills", "/mcp", "/projects", "/about", "/resume",
  ]

  const agentPages = getAllAgentArticles().map((article) => `/agent/${article.slug}`)
  const promptPages = getAllPromptCases().map((item) => `/prompts/${item.slug}`)

  return [...staticPages, ...agentPages, ...promptPages].map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path.startsWith("/agent") || path.startsWith("/prompts") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/agent") || path.startsWith("/prompts") ? 0.9 : 0.8,
  }))
}
