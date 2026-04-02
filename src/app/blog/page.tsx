import type { Metadata } from "next"
import { getAllPosts } from "@/lib/content"
import { BlogList } from "@/components/blog/BlogList"

export const metadata: Metadata = {
  title: "博客",
  description: "前端开发、后端架构、AI 工具链与独立开发随笔",
  openGraph: { title: "博客 | zhiqiang.dev", description: "前端开发、后端架构、AI 工具链与独立开发随笔" },
}

export default function BlogPage() {
  const posts = getAllPosts()
  return <BlogList posts={posts} />
}
