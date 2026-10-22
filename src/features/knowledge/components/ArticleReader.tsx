import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { AgentMdx } from "@/components/agent/AgentMdx"
import { extractAgentHeadings } from "@/lib/agent-headings"
import { ReaderShell, type ReadingLink } from "./ReaderShell"
import styles from "./Reader.module.css"

type Props = {
  href: string
  title: string
  description: string
  category: string
  tags: string[]
  updatedAt?: string
  readTime?: string
  source: string
  format?: "md" | "mdx"
  previous?: ReadingLink
  next?: ReadingLink
  series?: { title: string; href: string; position?: string }
  chapters?: ReadingLink[]
  related?: ReadingLink[]
}

export function ArticleReader({ href, title, description, category, tags, updatedAt, readTime, source, format = "mdx", previous, next, series, chapters = [], related = [] }: Props) {
  // 正文继续由服务端渲染，客户端只负责阅读控制与本机阅读位置。
  return <ReaderShell key={href} href={href} title={title} headings={extractAgentHeadings(source)} chapters={chapters} previous={previous} next={next} series={series}>
    <header className={styles.header}>
      <div className={styles.meta}><span>{series?.position ?? category}</span>{readTime && <span>{readTime} 阅读</span>}</div>
      <h1>{title}</h1>
      <p>{description}</p>
      <details className={styles.articleInfo}>
        <summary>笔记信息</summary>
        <div>{updatedAt && <span>更新于 {updatedAt}</span>}<div className={styles.tags}>{tags.filter((tag) => tag !== "pi-book").map((tag) => <span key={tag}>{tag}</span>)}</div></div>
      </details>
    </header>
    <div className={styles.body}><AgentMdx source={source} format={format} /></div>
    {(previous || next) && <nav className={styles.articleNav} aria-label="前后文章">{previous ? <Link href={previous.href}><span><ArrowLeft size={16} />上一篇</span><strong>{previous.title}</strong></Link> : <div />}{next ? <Link className={styles.next} href={next.href}><span>继续阅读<ArrowRight size={16} /></span><strong>{next.title}</strong></Link> : <div />}</nav>}
    {related.length > 0 && <section className={styles.related}><h2>相关阅读</h2>{related.map((item) => <Link key={item.href} href={item.href}>{item.title}<ArrowRight size={14} /></Link>)}</section>}
  </ReaderShell>
}
