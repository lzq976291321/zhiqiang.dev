import type { Metadata } from "next"
import { KnowledgeLibrary } from "@/features/knowledge/components/KnowledgeLibrary"
import { getKnowledgeLibrary } from "@/features/knowledge/lib/library"
import styles from "@/features/knowledge/components/KnowledgeLibrary.module.css"

export const metadata: Metadata = {
  title: "阅读空间",
  description: "围绕软件与 Agent 设计的读书笔记。按书籍和章节整理，保留作者、原文来源与版本说明。",
  alternates: { canonical: "/knowledge" },
}

export default function KnowledgePage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={styles.header}><h1>阅读空间</h1></header>
        <KnowledgeLibrary entries={getKnowledgeLibrary()} />
      </div>
    </main>
  )
}
