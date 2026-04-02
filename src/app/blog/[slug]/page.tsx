import { getAllSlugs } from "@/lib/mdx"
import { getPostBySlug } from "@/lib/content"
import { notFound } from "next/navigation"
import { PostDetail } from "@/components/blog/PostDetail"

export function generateStaticParams() {
  return getAllSlugs("blog").map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return { title: post.title, description: post.description }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()
  return <PostDetail post={post} />
}
