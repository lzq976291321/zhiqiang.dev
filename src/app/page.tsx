import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { HomePrompt } from "@/features/site/components/HomePrompt"
import { getKnowledgeLibrary } from "@/features/knowledge/lib/library"
import { shortBookTitle } from "@/features/knowledge/lib/catalog"
import { selectedProjects } from "@/features/site/data/projects"
import styles from "@/features/site/components/Fieldnotes.module.css"

export const metadata: Metadata = { alternates: { canonical: "/" } }

export default function HomePage() {
  const entries = getKnowledgeLibrary()
  const featured = ["pi-book-ch08", "pi-book-ch11", "pi-book-ch16"]
    .map((slug) => entries.find((entry) => entry.slug === slug))
    .filter((entry) => entry !== undefined)
  const arena = selectedProjects[0]
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <div className={styles.eyebrow}><span className={styles.dot} />志强 / 独立开发者</div>
          <h1>从阅读中理解，<br />在<span className={styles.accent}>创造中</span>发现。</h1>
          <div className={styles["hero-bottom"]}><p>这里收集读过的书、做过的东西，<br />和那些值得继续追问的念头。</p><a className={styles["round-link"]} href="#reading">往下探索 <span aria-hidden="true">↓</span></a></div>
          <div className={styles.orbit} aria-hidden="true"><i /><i /><i /><b>想法<br />正在发生</b><small>READ · THINK · MAKE</small></div>
        </section>
        <section id="reading" className={styles.reading}>
          <div className={styles["section-head"]}><h2><small>01 / READING</small>把一本书读深。</h2><Link href="/knowledge">全部阅读笔记 ↗</Link></div>
          <div className={styles["reading-grid"]}>
            <Link className={styles["book-panel"]} href="/knowledge/pi-book-index">
              <div className={styles.book} aria-hidden="true"><span>READING NOTES<br />AGENT ARCHITECTURE</span><strong>pi<span>的设计艺术</span></strong><em>理解机制，也理解取舍。</em><div className={styles["book-lines"]} /><small>志强 / 阅读笔记</small></div>
              <div className={styles["book-caption"]}><span>正在书架上</span><h3>一个 Agent，如何运转？</h3><p>沿着原书的脉络，从架构走到运行机制。</p><b>翻开这本书 ↗</b></div>
            </Link>
            <div className={styles.chapters}><p className={styles.label}>从这三个章节开始 / SELECTED CHAPTERS</p>{featured.map((entry) => <Link href={entry.href} key={entry.href}><span>{entry.slug.slice(-2)}</span><div><h3>{shortBookTitle(entry.title)}</h3><p>{entry.description}</p></div><b aria-hidden="true">↗</b></Link>)}</div>
          </div>
        </section>
        <section id="works">
          <div className={styles["section-head"]}><h2><small>02 / SELECTED WORK</small>让想法可以体验。</h2><Link href="/projects">全部作品 ↗</Link></div>
          <a className={styles.project} href={arena.href} target="_blank" rel="noopener noreferrer"><div className={styles["project-img"]}><Image src={arena.image} alt={arena.alt} width={1440} height={960} sizes="(max-width:680px) 100vw, 720px" /><span className={styles["project-chip"]}>THREE.JS / WEBGL</span></div><div className={styles["project-info"]}><span className={styles.label}>01 — 3D 交互作品</span><h3>把热爱，<br />开进一片湖。</h3><p>{arena.name}<br />驾驶遥控船，调校参数，在松岚湖完成一场计时赛。</p><b>进入松岚湖 <span aria-hidden="true">↗</span></b></div></a>
          <div className={styles["mini-projects"]}>
            <Link href="/lab/fill-light"><span aria-hidden="true">◑</span><div><small>光与色彩</small><h3>屏幕补光灯</h3><p>让手边的屏幕，成为一束光。</p></div><b aria-hidden="true">↗</b></Link>
            <Link href="/lab/led-banner"><span aria-hidden="true">▤</span><div><small>小工具</small><h3>LED 手持弹幕</h3><p>把想说的话，亮在屏幕上。</p></div><b aria-hidden="true">↗</b></Link>
            <Link href="/lab"><span aria-hidden="true">◇</span><div><small>界面与交互</small><h3>工具</h3><p>补光、写字，让屏幕派上用场。</p></div><b aria-hidden="true">↗</b></Link>
          </div>
        </section>
        <section id="conversation" className={styles.conversation}><HomePrompt /></section>
        <footer className={styles.footer}><span>zhiqiang.chat · 阅读、设计与作品。</span><Link href="/chat">聊一聊 ↗</Link></footer>
      </div>
    </main>
  )
}
