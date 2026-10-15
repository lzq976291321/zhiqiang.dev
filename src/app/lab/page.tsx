import type { Metadata } from "next"
import Link from "next/link"
import styles from "@/features/site/components/Studio.module.css"
import tools from "./Tools.module.css"

export const metadata: Metadata = { title: "工具", description: "打开就能用的屏幕补光灯与 LED 灯牌。", alternates: { canonical: "/lab" } }
export default function ToolsPage() {
  return <main className={styles.page}><div className={styles.wrap}>
    <header className={styles.hero}><span className={styles.eyebrow}>TOOLS / 随手用的小工具</span><h1>让屏幕，多做一点。</h1><p>选一束光，或者写一句想让人看见的话。</p></header>
    <div className={tools.grid}>
      <Link href="/lab/fill-light" className={tools.card}><div className={tools.light} aria-hidden="true"><span>一束好光</span><i /><i /><i /></div><div className={tools.body}><h2>屏幕补光灯 <span>↗</span></h2><p>选颜色、调亮度，收起面板就能补光。</p><span>打开补光灯</span></div></Link>
      <Link href="/lab/led-banner" className={tools.card}><div className={tools.led} aria-hidden="true">HELLO!</div><div className={tools.body}><h2>LED 灯牌 <span>↗</span></h2><p>写下文字，调整样式，全屏展示。</p><span>制作灯牌</span></div></Link>
    </div><footer className={styles.footer}><span>用手边的屏幕，解决眼前的小事。</span><Link href="/">返回首页 ↗</Link></footer>
  </div></main>
}
