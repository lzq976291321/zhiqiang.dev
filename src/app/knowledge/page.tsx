import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { KnowledgeLibrary } from "@/features/knowledge/components/KnowledgeLibrary"
import { getKnowledgeLibrary } from "@/features/knowledge/lib/library"
import styles from "@/features/knowledge/components/KnowledgeLibrary.module.css"

export const metadata: Metadata = {
  title: "阅读书架",
  description: "围绕软件与 Agent 设计的读书笔记。按书籍和章节整理，保留作者、原文来源与版本说明。",
  alternates: { canonical: "/knowledge" },
}

export default function KnowledgePage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div><span className={styles.eyebrow}>The reading shelf</span><h1>阅读书架</h1><p>认真读一本书，沿着章节理解设计，再回到原文核对。</p></div>
          <Link className={styles.headerLink} href="/chat" aria-label="带着问题聊聊">带着问题聊聊 <ArrowUpRight size={14} /></Link>
        </header>
        <KnowledgeLibrary entries={getKnowledgeLibrary()} />
      </div>
    </main>
  )
}
