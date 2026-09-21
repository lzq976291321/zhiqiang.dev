import type { Metadata } from "next"
import { LabGallery } from "@/features/lab/components/LabGallery"
import styles from "@/features/site/components/Studio.module.css"
import labStyles from "@/features/lab/components/LabGallery.module.css"

export const metadata: Metadata = {
  title: "UI Lab",
  description: "三种设计语言，三个完整界面。体验阅读空间、AI 任务工作台与项目工作台，带走与预览一致的设计变量。",
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
      <LabGallery />
      <footer className={styles.footer}><span>设计语言，在真实的阅读与操作中成立。</span><a href="/ui-gallery/index.html">界面灵感收藏 ↗</a></footer>
    </div>
  </main>
}
