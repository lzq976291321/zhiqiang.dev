"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, ChevronRight, Library, Search, X } from "lucide-react"
import type { LibraryItem } from "../lib/library"
import { piBookSections, piChapterNumber, piReadingOrder, shortBookTitle } from "../lib/catalog"
import styles from "./KnowledgeLibrary.module.css"

function ReadingRow({ entry }: { entry: LibraryItem }) {
  const chapter = piChapterNumber(entry.slug)
  const section = piBookSections.find((item) => chapter !== undefined && chapter >= item.from && chapter <= item.to)
  return (
    <Link href={entry.href} className={styles.articleRow}>
      <span className={styles.articleIcon}>{chapter ? String(chapter).padStart(2, "0") : <BookOpen size={17} strokeWidth={1.6} />}</span>
      <div className={styles.articleBody}>
        <span className={styles.articleMeta}>{section?.title ?? "阅读导览"}</span>
        <h3>{shortBookTitle(entry.title)}</h3>
        <p>{entry.description}</p>
        <span className={styles.articleFoot}>pi 的设计艺术{chapter ? ` · 第 ${chapter} 章` : ""}</span>
      </div>
      <ArrowRight size={16} className={styles.rowArrow} />
    </Link>
  )
}

function BookSeries({ entries }: { entries: LibraryItem[] }) {
  const [expanded, setExpanded] = useState(false)
  const ordered = [...entries].sort((a, b) => piReadingOrder(a.slug) - piReadingOrder(b.slug))
  const chapters = ordered.filter((entry) => piChapterNumber(entry.slug) !== undefined)
  const index = ordered.find((entry) => entry.slug === "pi-book-index") ?? ordered[0]
  if (!index) return null

  return (
    <section className={styles.series} aria-label="pi 的设计艺术读书系列">
      <div className={styles.seriesMain}>
        <div className={styles.bookVisual} aria-hidden="true">
          <div className={styles.bookCover}><span>READING NOTES</span><strong>pi</strong><span>THE ART OF<br />AGENT DESIGN</span></div>
        </div>
        <div className={styles.seriesBody}>
          <span className={styles.seriesLabel}><BookOpen size={13} /> 读书系列 · {chapters.length} 章</span>
          <h2>pi 的设计艺术</h2>
          <p>从核心循环到工具执行，拆解一个 Coding Agent 的架构与取舍。</p>
          <span className={styles.sourceNote}>原著：张汉东 · 本站整理阅读笔记，保留原文与版本说明。</span>
          <div className={styles.seriesActions}>
            <Link href={index.href}>阅读导览 <ArrowRight size={14} /></Link>
            <button type="button" aria-expanded={expanded} aria-controls="pi-series-directory" onClick={() => setExpanded(!expanded)}>{expanded ? "收起目录" : "展开目录"}<ArrowDown size={14} className={expanded ? styles.rotated : undefined} /></button>
          </div>
        </div>
      </div>
      {expanded && (
        <div id="pi-series-directory" className={styles.directory}>
          <div className={styles.bookExtras}>
            {ordered.filter((entry) => piChapterNumber(entry.slug) === undefined).map((entry) => <Link key={entry.href} href={entry.href}>{entry.slug.endsWith("index") ? "全书索引" : entry.slug.endsWith("preface") ? "前言与版本基线" : "附录与类型索引"}<ChevronRight size={12} /></Link>)}
          </div>
          <div className={styles.chapterGroups}>
            {piBookSections.map((section) => (
              <section key={section.title}>
                <h3>{section.title}<span>{String(section.from).padStart(2, "0")}—{String(section.to).padStart(2, "0")}</span></h3>
                {chapters.filter((entry) => { const number = piChapterNumber(entry.slug)!; return number >= section.from && number <= section.to }).map((entry) => (
                  <Link href={entry.href} key={entry.href}><span>{String(piChapterNumber(entry.slug)).padStart(2, "0")}</span>{shortBookTitle(entry.title)}</Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      )}
      <div className={styles.bookSource}>
        <span>原书的完整论证与代码，可随笔记对照阅读。</span>
        <a href="https://zhanghandong.github.io/pi-book/preface.html" target="_blank" rel="noopener noreferrer">阅读原书 <ArrowUpRight size={12} /></a>
      </div>
    </section>
  )
}

export function KnowledgeLibrary({ entries }: { entries: LibraryItem[] }) {
  const [query, setQuery] = useState("")
  const [topic, setTopic] = useState<string | null>(null)
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  const searching = terms.length > 0
  const ordered = [...entries].sort((a, b) => piReadingOrder(a.slug) - piReadingOrder(b.slug))
  const selectedSection = piBookSections.find((section) => section.title === topic)
  const visible = ordered.filter((entry) => {
    // 搜索始终覆盖全书，阅读主题仅用于无关键词时的章节导航。
    if (searching) return terms.every((term) => [entry.title, entry.description, ...entry.tags].join(" ").toLocaleLowerCase().includes(term))
    if (!selectedSection) return true
    const number = piChapterNumber(entry.slug)
    return number !== undefined && number >= selectedSection.from && number <= selectedSection.to
  })
  const showBook = !searching && !selectedSection && entries.length > 0
  const selectTopic = (value: string | null) => { setTopic(value); setQuery("") }
  const reset = () => selectTopic(null)

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <span className={styles.navLabel}>阅读空间</span>
        <nav className={styles.kindNav} aria-label="书架导航">
          <button type="button" aria-pressed={!topic && !searching} onClick={reset}><Library size={16} /><span>我的书架</span><span className={styles.count}>{entries.length ? 1 : 0}</span></button>
        </nav>
        <label className={styles.mobileTopics}>章节主题<select aria-label="章节主题" value={topic ?? ""} onChange={(event) => selectTopic(event.target.value || null)}><option value="">整本阅读</option>{piBookSections.map((section) => <option value={section.title} key={section.title}>{section.title}</option>)}</select></label>
        <nav className={styles.topicNav} aria-label="阅读主题">
          <span className={styles.navLabel}>按主题阅读</span>
          {piBookSections.map((section) => <button type="button" key={section.title} aria-pressed={topic === section.title && !searching} onClick={() => selectTopic(section.title)}><span className={styles.topicDot} /><span>{section.title}</span><span className={styles.count}>{String(section.from).padStart(2, "0")}–{String(section.to).padStart(2, "0")}</span></button>)}
        </nav>
        <div className={styles.sidebarNote}><BookOpen size={15} /><p>用章节串起知识，<br />把来源留在每一篇笔记里。</p></div>
      </aside>
      <div className={styles.content}>
        <div className={styles.searchBox}>
          <Search size={17} aria-hidden="true" />
          <label className="sr-only" htmlFor="knowledge-search">搜索全书笔记的标题、摘要和标签</label>
          <input id="knowledge-search" type="search" placeholder="搜索书中的问题、章节或关键词…" value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" aria-label="清除搜索" onClick={() => setQuery("")}><X size={15} /></button>}
        </div>
        <div className={styles.resultsHeader}>
          <h2>{searching ? "全书搜索" : selectedSection?.title ?? "我的知识书架"}</h2>
          <span role="status">{searching ? `${visible.length} 篇匹配` : selectedSection ? `${visible.length} 章` : `${entries.length ? 1 : 0} 本书 · ${entries.length} 篇笔记`}</span>
        </div>
        {showBook && <BookSeries entries={entries} />}
        {!showBook && visible.length > 0 && (
          <section className={styles.articleList} aria-label={searching ? "搜索结果列表" : "章节列表"}>
            {selectedSection && !searching && <div className={styles.listLabel}>pi 的设计艺术<span>第 {selectedSection.from}–{selectedSection.to} 章</span></div>}
            {visible.map((entry) => <ReadingRow key={entry.href} entry={entry} />)}
          </section>
        )}
        {!visible.length && <div className={styles.empty}><Search size={28} strokeWidth={1.3} /><h3>没有找到相关笔记</h3><p>试试更短的关键词，或回到书架继续阅读。</p><button type="button" onClick={reset}>清除筛选 <ArrowRight size={14} /></button></div>}
      </div>
    </div>
  )
}
