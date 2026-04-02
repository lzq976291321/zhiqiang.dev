import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { getAllSlugs } from "@/lib/mdx"

export default function sitemap(): MetadataRoute.Sitemap {
  const blogSlugs = getAllSlugs("blog")

  const staticPages = [
    "", "/blog", "/skills", "/prompts", "/prompts/image", "/prompts/video",
    "/mcp", "/projects", "/about", "/resume",
  ]

  const entries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }))

  blogSlugs.forEach((slug) => {
    entries.push({
      url: `${siteConfig.url}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  })

  return entries
}
