import { getAllPosts } from "@/lib/content"
import { BlogList } from "@/components/blog/BlogList"

export const metadata = { title: "博客" }

export default function BlogPage() {
  const posts = getAllPosts()
  return <BlogList posts={posts} />
}
