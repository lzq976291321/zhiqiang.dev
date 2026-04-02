"use client"

import { motion } from "framer-motion"
import { MDXRemote } from "next-mdx-remote/rsc"
import type { Post } from "@/lib/types"
import { BackHome } from "@/components/shared/BackHome"

export function PostDetail({ post }: { post: Post }) {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部光晕 */}
      <div className="absolute top-0 left-0 right-0 h-[30vh] -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(ellipse, #F59E0B, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <article className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-20">
        <BackHome />

        {/* 文章头 */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] font-mono tracking-wider text-warm/50">
              {post.date}
            </span>
            <span className="text-foreground/10">·</span>
            <span className="text-[11px] font-mono tracking-wider text-foreground/25">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-foreground/90 leading-tight">
            {post.title}
          </h1>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md bg-foreground/[0.04] text-foreground/25"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.header>

        {/* MDX 正文 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="prose prose-invert prose-sm max-w-none
            prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground/80
            prose-p:text-foreground/45 prose-p:leading-relaxed
            prose-a:text-warm prose-a:no-underline hover:prose-a:text-warm-light
            prose-strong:text-foreground/60
            prose-code:text-warm/70 prose-code:bg-foreground/[0.04] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[13px]
            prose-pre:bg-[#0F0D0B] prose-pre:border prose-pre:border-foreground/[0.04] prose-pre:rounded-xl
            prose-th:text-foreground/50 prose-td:text-foreground/35
            prose-li:text-foreground/40
            prose-hr:border-foreground/[0.06]
          "
        >
          <MDXRemote source={post.content} />
        </motion.div>
      </article>
    </div>
  )
}
