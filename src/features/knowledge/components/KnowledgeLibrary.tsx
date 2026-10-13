"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpen, ChevronRight, Library, List, Search, X } from "lucide-react"
import type { LibraryItem } from "../lib/library"
import { piBookSections, piChapterNumber, piReadingOrder, shortBookTitle } from "../lib/catalog"
import { useLastReading } from "../lib/use-reading-progress"
import styles from "./KnowledgeLibrary.module.css"

function ReadingRow({ entry }: { entry: LibraryItem }) {
  const chapter = piChapterNumber(entry.slug)
  const section = piBookSections.find((item) => chapter !== undefined && chapter >= item.from && chapter <= item.to)
  return (
    <Link href={entry.href} className={styles.articleRow}>
      <span className={styles.articleIcon} aria-hidden="true">{chapter ? String(chapter).padStart(2, "0") : <BookOpen size={20} strokeWidth={1.6} />}</span>
      <div className={styles.articleBody}>
        <span className={styles.articleMeta}>{section?.title ?? "阅读导览"}</span>
        <h3>{shortBookTitle(entry.title)}</h3>
        <p>{entry.description}</p>
      </div>
      <ChevronRight size={19} className={styles.rowArrow} aria-hidden="true" />
    </Link>
  )
}

function BookSeries({ entries }: { entries: LibraryItem[] }) {
  const directoryRef = useRef<HTMLDialogElement>(null)
  const directoryTriggerRef = useRef<HTMLButtonElement>(null)
  const previousOverflow = useRef<string | null>(null)
  const lastReading = useLastReading()
  const ordered = [...entries].sort((a, b) => piReadingOrder(a.slug) - piReadingOrder(b.slug))
  const chapters = ordered.filter((entry) => piChapterNumber(entry.slug) !== undefined)
  const first = ordered.find((entry) => entry.slug === "pi-book-preface")
    ?? ordered.find((entry) => piChapterNumber(entry.slug) === 1)
    ?? ordered.find((entry) => entry.slug === "pi-book-index")
    ?? ordered[0]
  const lastEntry = lastReading ? ordered.find((entry) => entry.href === lastReading.href) : undefined
  const reading = lastEntry && lastReading ? lastReading : null
  const percent = reading ? Math.min(100, Math.max(0, Math.round(reading.percent))) : 0

  const restorePageScroll = () => {
    if (previousOverflow.current !== null) {
      document.body.style.overflow = previousOverflow.current
      previousOverflow.current = null
    }
    directoryTriggerRef.current?.focus({ preventScroll: true })
  }
  const openDirectory = () => {
    const directory = directoryRef.current
    if (!directory || directory.open) return
    previousOverflow.current = document.body.style.overflow
    directory.showModal()
    document.body.style.overflow = "hidden"
  }
  const closeDirectory = () => directoryRef.current?.close()

  useEffect(() => () => {
    if (previousOverflow.current !== null) document.body.style.overflow = previousOverflow.current
  }, [])

  if (!first) return null

  return (
    <section className={styles.series} aria-label="pi 的设计艺术读书系列">
      <div className={styles.bookContent}>
        <div className={styles.seriesMain}>
          <div className={styles.bookVisual} aria-hidden="true">
            <div className={styles.bookCover}><span>设计艺术</span><strong>pi</strong><span>张汉东 著<br />阅读笔记</span></div>
          </div>
          <div className={styles.seriesBody}>
            <span className={styles.seriesLabel}>读书笔记 · {chapters.length} 章</span>
            <h2>pi 的设计艺术</h2>
            <p>从核心循环到工具执行，理解一个 Coding Agent 的架构与取舍。</p>
            <span className={styles.sourceNote}>原著：张汉东</span>
          </div>
        </div>
        {reading && lastEntry && (
          <div className={styles.readingState}>
            <div><span>上次读到</span><span>本篇 {percent}%</span></div>
            <p>{shortBookTitle(lastEntry.title)}</p>
            <div className={styles.progressTrack} role="progressbar" aria-label="上次阅读的篇章进度" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /></div>
          </div>
        )}
        <div className={styles.seriesActions}>
          <Link className={styles.readButton} href={reading?.href ?? first.href}><BookOpen size={19} aria-hidden="true" />{reading ? "继续阅读" : "开始阅读"}<ArrowRight size={18} aria-hidden="true" /></Link>
          <button ref={directoryTriggerRef} className={styles.directoryButton} type="button" aria-haspopup="dialog" aria-controls="pi-series-directory" onClick={openDirectory}><List size={19} aria-hidden="true" />目录</button>
        </div>
      </div>
      <div className={styles.bookSource}>
        <span>本站整理的阅读笔记，每篇保留来源与版本说明。</span>
        <a href="https://zhanghandong.github.io/pi-book/preface.html" target="_blank" rel="noopener noreferrer">阅读原书 <ArrowUpRight size={15} aria-hidden="true" /></a>
      </div>
      <dialog
        ref={directoryRef}
        id="pi-series-directory"
        className={styles.directory}
        aria-labelledby="pi-directory-title"
        onClose={restorePageScroll}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDirectory()
        }}
      >
        <div className={styles.directoryHeader}>
          <div><span>pi 的设计艺术</span><h2 id="pi-directory-title">目录</h2></div>
          <button type="button" aria-label="关闭目录" onClick={closeDirectory}><X size={22} /></button>
        </div>
        <div className={styles.directoryContent}>
          <div className={styles.bookExtras}>
            {ordered.filter((entry) => piChapterNumber(entry.slug) === undefined).map((entry) => <Link key={entry.href} href={entry.href} onNavigate={closeDirectory}>{entry.slug.endsWith("index") ? "全书导览" : entry.slug.endsWith("preface") ? "前言与版本基线" : "附录与类型索引"}<ChevronRight size={17} aria-hidden="true" /></Link>)}
          </div>
          <div className={styles.chapterGroups}>
            {piBookSections.map((section) => (
              <section key={section.title}>
                <h3>{section.title}<span>{String(section.from).padStart(2, "0")}—{String(section.to).padStart(2, "0")}</span></h3>
                {chapters.filter((entry) => { const number = piChapterNumber(entry.slug)!; return number >= section.from && number <= section.to }).map((entry) => (
                  <Link href={entry.href} key={entry.href} onNavigate={closeDirectory}><span>{String(piChapterNumber(entry.slug)).padStart(2, "0")}</span><span>{shortBookTitle(entry.title)}</span><ChevronRight size={16} aria-hidden="true" /></Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      </dialog>
    </section>
  )
}

export function KnowledgeLibrary({ entries }: { entries: LibraryItem[] }) {
  const [query, setQuery] = useState("")
  const [topic, setTopic] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean)
  const searching = terms.length > 0
  const ordered = [...entries].sort((a, b) => piReadingOrder(a.slug) - piReadingOrder(b.slug))
  const selectedSection = piBookSections.find((section) => section.title === topic)
  const visible = ordered.filter((entry) => {
    // 搜索覆盖全部公开笔记，主题筛选用于无关键词时的章节导航。
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
        <nav className={styles.kindNav} aria-label="书架导航">
          <button type="button" aria-pressed={!topic && !searching} onClick={reset}><Library size={20} /><span>书架</span><span className={styles.count}>{entries.length ? 1 : 0}</span></button>
        </nav>
        <nav className={styles.topicNav} aria-label="阅读主题">
          <span className={styles.navLabel}>按主题阅读</span>
          {piBookSections.map((section) => <button type="button" key={section.title} aria-pressed={topic === section.title && !searching} onClick={() => selectTopic(section.title)}><span>{section.title}</span><ChevronRight size={15} aria-hidden="true" /></button>)}
        </nav>
      </aside>
      <div className={styles.content}>
        <div className={styles.searchBox}>
          <Search size={20} aria-hidden="true" />
          <label className="sr-only" htmlFor="knowledge-search">搜索笔记的标题、摘要和标签</label>
          <input ref={searchRef} id="knowledge-search" type="search" placeholder="搜索章节或关键词" value={query} onChange={(event) => setQuery(event.target.value)} />
          {query && <button type="button" aria-label="清除搜索" onClick={() => { setQuery(""); searchRef.current?.focus() }}><X size={19} /></button>}
        </div>
        <div className={styles.mobileTopics}>
          <button type="button" aria-pressed={!topic && !searching} onClick={reset}><Library size={18} aria-hidden="true" />书架</button>
          <label><span className="sr-only">按主题阅读</span><select aria-label="按主题阅读" value={searching ? "" : topic ?? ""} onChange={(event) => selectTopic(event.target.value || null)}><option value="">按主题阅读</option>{piBookSections.map((section) => <option value={section.title} key={section.title}>{section.title}</option>)}</select></label>
        </div>
        <div className={styles.resultsHeader}>
          <h2>{searching ? "搜索结果" : selectedSection?.title ?? "书架"}</h2>
          <span role="status">{searching ? `${visible.length} 篇笔记` : selectedSection ? `${visible.length} 章` : `${entries.length ? 1 : 0} 本`}</span>
        </div>
        {showBook && <BookSeries entries={entries} />}
        {!showBook && visible.length > 0 && (
          <section className={styles.articleList} aria-label={searching ? "搜索结果列表" : "章节列表"}>
            {visible.map((entry) => <ReadingRow key={entry.href} entry={entry} />)}
          </section>
        )}
        {!visible.length && <div className={styles.empty}><Search size={30} strokeWidth={1.5} /><h3>{entries.length ? "没有找到相关笔记" : "书架还没有书"}</h3>{entries.length > 0 && <><p>换一个关键词，或回到书架继续阅读。</p><button type="button" onClick={reset}>返回书架 <ArrowRight size={17} /></button></>}</div>}
      </div>
    </div>
  )
}
