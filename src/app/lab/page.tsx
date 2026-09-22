import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, Cat, PanelsTopLeft } from "lucide-react"
import { LabGallery } from "@/features/lab/components/LabGallery"
import styles from "@/features/site/components/Studio.module.css"
import labStyles from "@/features/lab/components/LabGallery.module.css"

export const metadata: Metadata = {
  title: "UI Lab",
  description: "体验 LED 灯牌、屏幕补光灯与三种设计语言，在完整场景中探索设计与交互。",
  alternates: { canonical: "/lab" },
}

export default function LabPage() {
  return <main className={styles.page}>
    <div className={styles.wrap}>
      <header className={labStyles.pageHeader}>
        <span className={labStyles.eyebrow}>DESIGN, IN CONTEXT</span>
        <h1>UI Lab</h1>
        <div className={labStyles.headerBottom}><p>把设计放进完整场景。亲手体验，也把它带走。</p><span>03 THEMES / 03 SCENES</span></div>
      </header>
      <Link href="/lab/fill-light" className={labStyles.lightEntry}>
        <span className={labStyles.lightEntryIcon}><Cat size={25} strokeWidth={1.5} /></span>
        <span><strong>补光灯</strong><small>选一束光，照亮此刻。</small></span>
        <span className={labStyles.lightEntrySwatches} aria-hidden="true"><i /><i /><i /></span>
        <span className={labStyles.lightEntryAction}>打开体验 <ArrowUpRight size={16} /></span>
      </Link>
      <Link href="/lab/led-banner" className={labStyles.ledEntry}>
        <span className={labStyles.ledEntryIcon}><PanelsTopLeft size={25} strokeWidth={1.5} /></span>
        <span><strong>LED 灯牌</strong><small>写下文字，让屏幕发光。</small></span>
        <span className={labStyles.ledEntryPreview} aria-hidden="true">HELLO!</span>
        <span className={labStyles.ledEntryAction}>打开体验 <ArrowUpRight size={16} /></span>
      </Link>
      <LabGallery />
      <footer className={styles.footer}><span>设计语言，在真实的阅读与操作中成立。</span><a href="/ui-gallery/index.html">界面灵感收藏 ↗</a></footer>
    </div>
  </main>
}
