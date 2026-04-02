"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import type { Post } from "@/lib/types"
import { PageShell } from "@/components/shared/PageShell"

function PostCard({ post, index }: { post: Post; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block p-6 rounded-xl border border-foreground/[0.04] hover:border-gold/10 bg-surface/30 hover:bg-surface/50 transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[11px] font-mono tracking-wider text-gold/50">
            {post.date}
          </span>
          <span className="text-foreground/10">·</span>
          <span className="text-[11px] font-mono tracking-wider text-foreground/25">
            {post.category}
          </span>
        </div>

        <h2 className="text-lg font-heading font-bold text-foreground/80 group-hover:text-foreground transition-colors duration-300 mb-2">
          {post.title}
        </h2>

        <p className="text-sm text-foreground/25 group-hover:text-foreground/35 transition-colors duration-300 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md bg-foreground/[0.03] text-foreground/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  )
}

export function BlogList({ posts }: { posts: Post[] }) {
  const categories = ["全部", ...new Set(posts.map((p) => p.category))]
  const [active, setActive] = useState("全部")

  const filtered = active === "全部" ? posts : posts.filter((p) => p.category === active)

  return (
    <PageShell title="博客" subtitle="前端、后端、AI 与独立开发随笔" accent="#C8A97E">
      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-3 py-1 rounded-lg text-[12px] font-mono tracking-wider transition-all duration-200 ${
              active === cat
                ? "bg-gold/10 text-gold"
                : "text-foreground/25 hover:text-foreground/40 hover:bg-foreground/[0.03]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 文章列表 */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((post, i) => (
            <PostCard key={post.slug} post={post} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-foreground/20 py-20 text-sm">
          暂无文章
        </p>
      )}
    </PageShell>
  )
}
