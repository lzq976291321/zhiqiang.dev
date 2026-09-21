import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpen, Code2, Sailboat, Sparkles } from "lucide-react"
import { TokenPreview } from "@/features/lab/components/TokenPreview"
import { HomePrompt } from "@/features/site/components/HomePrompt"
import { getKnowledgeLibrary } from "@/features/knowledge/lib/library"
import { shortBookTitle } from "@/features/knowledge/lib/catalog"
import { selectedProjects } from "@/features/site/data/projects"
import styles from "@/features/site/components/Studio.module.css"
import home from "@/features/site/components/Home.module.css"

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
        <header className={home.heading}>
          <div><span className={styles.eyebrow}><span className={styles.dot} /> 志强 / 独立开发者</span><h1>阅读、设计与作品。</h1></div>
          <p>从书籍中理解，在作品中实践。</p>
        </header>
        <section className={home.workbench} aria-label="对话与界面实验">
          <HomePrompt />
          <div className={home.labArea}>
            <div className={home.panelLabel}><span><Sparkles size={13} /> UI Lab · 场景与主题</span><Link href="/lab" aria-label="进入 UI Lab"><ArrowUpRight size={15} /></Link></div>
            <TokenPreview compact />
          </div>
        </section>
        <div className={home.panels}>
          <section className={home.notes}>
            <div className={styles.sectionHead}><h2>从一本书开始</h2><Link href="/knowledge">阅读书架 <ArrowRight size={13} /></Link></div>
            <Link className={home.bookFeature} href="/knowledge/pi-book-index">
              <div className={home.bookCover} aria-hidden="true"><span>READING NOTES</span><b>pi</b><span>THE ART OF<br />AGENT DESIGN</span></div>
              <div><span className={home.bookLabel}><BookOpen size={12} /> 读书系列 · 33 章</span><h3>pi 的设计艺术</h3><p>从 Agent 架构到运行机制，<br />沿着原书的脉络深入阅读。</p><span className={home.bookLink}>阅读导览 <ArrowRight size={13} /></span></div>
            </Link>
            <div className={home.chapterLabel}>可以从这些章节读起</div>
            {featured.map((entry) => <Link className={home.note} key={entry.href} href={entry.href}>
              <span>{entry.slug.slice(-2)}</span><div><h3>{shortBookTitle(entry.title)}</h3><p>{entry.description}</p></div><ArrowUpRight size={14} />
            </Link>)}
          </section>
          <section>
            <div className={styles.sectionHead}><h2>亲手做出的东西</h2><Link href="/projects">全部作品 <ArrowRight size={13} /></Link></div>
            <div className={home.works}>
              <a className={home.arenaSpotlight} href={arena.href} target="_blank" rel="noopener noreferrer">
                <Image src={arena.image} alt={arena.alt} width={1440} height={960} sizes="(max-width: 680px) 90vw, 480px" />
                <div><div><h3>{arena.name}</h3><p>3D 遥控船 · 驾驶、调校与回放</p></div><span className={home.playLink}>开始体验 <ArrowUpRight size={14} /></span></div>
              </a>
              <Link className={home.work} href="/projects#knowledge"><div className={home.workIcon}><Code2 size={21} strokeWidth={1.5} /></div><div><h3>zhiqiang.chat</h3><p>书籍阅读、主题实验与知识对话</p></div><ArrowUpRight size={14} /></Link>
              <Link className={home.work} href="/projects#community"><div className={home.workIcon}><Sailboat size={21} strokeWidth={1.5} /></div><div><h3>RC 模友圈</h3><p>属于模型爱好者的交流社区</p></div><ArrowUpRight size={14} /></Link>
            </div>
          </section>
        </div>
        <footer className={styles.footer}><span>zhiqiang.chat · 保持好奇，持续构建。</span><div><Link href="/chat">聊一聊 ↗</Link></div></footer>
      </div>
    </main>
  )
}
