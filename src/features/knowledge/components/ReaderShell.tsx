"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, List, Type, X } from "lucide-react"
import type { AgentHeading } from "@/lib/agent-headings"
import { DEFAULT_READER_PREFERENCES, readReadingProgress, readReaderPreferences, saveReadingProgress, saveReaderPreferences, type ReadingProgress, type ReaderPreferences } from "../lib/reading-state"
import styles from "./Reader.module.css"

export type ReadingLink = { title: string; href: string }
type Props = {
  href: string
  title: string
  headings: AgentHeading[]
  chapters: ReadingLink[]
  previous?: ReadingLink
  next?: ReadingLink
  series?: { title: string; href: string; position?: string }
  children: ReactNode
}

export function ReaderShell({ href, title, headings, chapters, previous, next, series, children }: Props) {
  const articleRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const panelTriggerRef = useRef<HTMLButtonElement | null>(null)
  const progressRef = useRef<ReadingProgress | null>(null)
  const preferenceFrameRef = useRef(0)
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_READER_PREFERENCES)
  const [panel, setPanel] = useState<"contents" | "settings" | null>(null)
  const [tab, setTab] = useState<"article" | "book">("article")
  const [activeHeading, setActiveHeading] = useState("")
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    let ready = false
    let secondFrame = 0
    let saveTimer: ReturnType<typeof setTimeout> | undefined
    const article = articleRef.current
    if (!article) return
    const anchors = [...article.querySelectorAll<HTMLElement>("h2[id]")]
    function measure() {
      // 路由切换时旧正文可能已卸载，不能把新页面的滚动写回旧章节。
      if (!ready || !article?.isConnected || window.location.pathname !== href) return
      const scrollY = window.scrollY
      const start = article.offsetTop
      const end = start + article.offsetHeight - window.innerHeight + 100
      const value = Math.max(0, Math.min(100, Math.round((scrollY - start) / Math.max(1, end - start) * 100)))
      const current = anchors.filter((element) => element.getBoundingClientRect().top <= 110).at(-1)
      setActiveHeading(current?.id ?? "")
      setPercent(value)
      progressRef.current = { href, title, percent: value, anchor: current?.id ?? "", offset: current ? -current.getBoundingClientRect().top : 0, scrollY, updatedAt: Date.now() }
    }
    function save() {
      if (ready && progressRef.current) saveReadingProgress(progressRef.current)
    }
    function onScroll() {
      measure()
      clearTimeout(saveTimer)
      saveTimer = setTimeout(save, 250)
    }
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") save()
    }
    // 先应用已保存的字号，再计算位置；明确的章节锚点始终优先于历史位置。
    const frame = requestAnimationFrame(() => {
      setPreferences(readReaderPreferences())
      secondFrame = requestAnimationFrame(() => {
        const saved = readReadingProgress(href)
        let target: HTMLElement | null = null
        try { target = window.location.hash ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null } catch { /* 无效锚点按文章开头处理。 */ }
        if (window.location.hash) {
          if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 100, behavior: "instant" })
        } else if (saved) {
          const anchor = saved.anchor ? document.getElementById(saved.anchor) : null
          window.scrollTo({ top: anchor ? anchor.getBoundingClientRect().top + window.scrollY + saved.offset : saved.scrollY, behavior: "instant" })
        } else {
          window.scrollTo({ top: 0, behavior: "instant" })
        }
        ready = true
        measure()
        save()
      })
    })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    window.addEventListener("pagehide", save)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(secondFrame)
      cancelAnimationFrame(preferenceFrameRef.current)
      clearTimeout(saveTimer)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("pagehide", save)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      save()
    }
  }, [href, title])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!panel || !dialog) return
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    dialog.showModal()
    return () => {
      dialog.close()
      document.documentElement.style.overflow = previousOverflow
      panelTriggerRef.current?.focus({ preventScroll: true })
    }
  }, [panel])

  function updatePreferences(update: Partial<ReaderPreferences>) {
    // 字号改变会重排上方文字，让眼前这段内容留在原来的位置。
    const blocks = articleRef.current?.querySelectorAll<HTMLElement>("h1, h2, h3, p, pre, table, li")
    const visibleBlock = blocks ? [...blocks].find((element) => element.getBoundingClientRect().bottom > 110) : undefined
    const previousTop = visibleBlock?.getBoundingClientRect().top
    const nextPreferences = { ...preferences, ...update }
    setPreferences(nextPreferences)
    saveReaderPreferences(nextPreferences)
    cancelAnimationFrame(preferenceFrameRef.current)
    preferenceFrameRef.current = requestAnimationFrame(() => {
      if (visibleBlock && previousTop !== undefined) window.scrollBy({ top: visibleBlock.getBoundingClientRect().top - previousTop, behavior: "instant" })
      window.dispatchEvent(new Event("scroll"))
    })
  }

  function contents(label: string) {
    return <>
      {chapters.length > 0 && <div className={styles.segmented} aria-label="目录范围"><button type="button" aria-pressed={tab === "article"} onClick={() => setTab("article")}>本文目录</button><button type="button" aria-pressed={tab === "book"} onClick={() => setTab("book")}>全书章节</button></div>}
      <nav className={styles.toc} aria-label={label}>
        {tab === "article" ? <>
          <a href="#reader-start" aria-current={!activeHeading ? "location" : undefined} onClick={() => setPanel(null)}>篇首</a>
          {headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} aria-current={activeHeading === heading.id ? "location" : undefined} onClick={() => setPanel(null)}>{heading.title}</a>)}
        </> : chapters.map((chapter) => <Link key={chapter.href} href={chapter.href} aria-current={href === chapter.href ? "page" : undefined} onClick={() => setPanel(null)}>{chapter.title}{href === chapter.href && <Check size={15} />}</Link>)}
      </nav>
    </>
  }

  return <main className={styles.page} data-reader-theme={preferences.theme} style={{ "--reader-font-size": `${preferences.fontSize}px` } as CSSProperties}>
    <header className={styles.readerBar}>
      <Link href="/knowledge" className={styles.shelfLink}><ArrowLeft size={19} /><span>书架</span></Link>
      <span className={styles.bookName}>{series?.title ?? "阅读空间"}</span>
      <span className={styles.readingProgress} aria-label={`本篇已读 ${percent}%`}>{percent}%</span>
      <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
    </header>
    <div className={styles.wrap}>
      <div className={styles.layout}>
        <article ref={articleRef} id="reader-start" className={styles.article}>{children}</article>
        <aside className={styles.aside}><div className={styles.sticky}><span className={styles.asideLabel}>{series?.position ?? "阅读导航"}</span>{contents("阅读侧栏目录")}</div></aside>
      </div>
    </div>
    <nav className={styles.toolbar} aria-label="阅读工具">
      {previous ? <Link href={previous.href} aria-label={`上一篇：${previous.title}`} title={previous.title}><ChevronLeft size={20} /><span>上一篇</span></Link> : <button type="button" disabled aria-label="没有上一篇"><ChevronLeft size={20} /><span>上一篇</span></button>}
      <button type="button" aria-haspopup="dialog" onClick={(event) => { panelTriggerRef.current = event.currentTarget; setPanel("contents") }}><List size={20} /><span>目录</span></button>
      <button type="button" aria-haspopup="dialog" onClick={(event) => { panelTriggerRef.current = event.currentTarget; setPanel("settings") }}><Type size={20} /><span>阅读设置</span></button>
      {next ? <Link href={next.href} aria-label={`下一篇：${next.title}`} title={next.title}><span>下一篇</span><ChevronRight size={20} /></Link> : <Link href="/knowledge"><span>回书架</span><ChevronRight size={20} /></Link>}
    </nav>
    <dialog ref={dialogRef} className={styles.sheet} aria-labelledby="reader-panel-title" onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={(event) => { if (event.target === event.currentTarget) setPanel(null) }}>
      <div className={styles.sheetInner}>
        <div className={styles.sheetHandle} aria-hidden="true" />
        <header className={styles.sheetHeader}><h2 id="reader-panel-title">{panel === "settings" ? "阅读设置" : "目录"}</h2><button type="button" aria-label="关闭面板" onClick={() => setPanel(null)}><X size={21} /></button></header>
        {panel === "contents" ? <div className={styles.sheetContents}>{contents("阅读面板目录")}</div> : <div className={styles.settings}>
          <div className={styles.fontControl}><span>字号</span><div><button type="button" aria-label="缩小字号" disabled={preferences.fontSize === 16} onClick={() => updatePreferences({ fontSize: (preferences.fontSize - 2) as ReaderPreferences["fontSize"] })}>A−</button><output aria-live="polite">{preferences.fontSize}</output><button type="button" aria-label="放大字号" disabled={preferences.fontSize === 22} onClick={() => updatePreferences({ fontSize: (preferences.fontSize + 2) as ReaderPreferences["fontSize"] })}>A+</button></div></div>
          <fieldset className={styles.themeOptions}><legend>纸张</legend>{([["light", "白纸"], ["warm", "暖纸"], ["dark", "夜读"]] as const).map(([theme, label]) => <button type="button" key={theme} data-theme={theme} aria-pressed={preferences.theme === theme} onClick={() => updatePreferences({ theme })}><span>Aa</span><span>{label}{preferences.theme === theme && <Check size={14} />}</span></button>)}</fieldset>
          <p className={styles.settingsNote}>阅读位置和偏好保存在当前浏览器。</p>
        </div>}
      </div>
    </dialog>
  </main>
}
