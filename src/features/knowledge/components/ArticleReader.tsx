import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, List, MessageSquare } from "lucide-react"
import { AgentMdx } from "@/components/agent/AgentMdx"
import { extractAgentHeadings } from "@/lib/agent-headings"
import styles from "./Reader.module.css"

type ReadingLink = { title: string; href: string }
type Props = {
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
  related?: ReadingLink[]
}

export function ArticleReader({ title, description, category, tags, updatedAt, readTime, source, format = "mdx", previous, next, series, related = [] }: Props) {
  const headings = extractAgentHeadings(source)
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.breadcrumb}><Link href="/knowledge"><ArrowLeft size={13} />阅读书架</Link><ChevronRight size={12} /><span>{category}</span></div>
        <div className={styles.layout}>
          <article className={styles.article}>
            <header className={styles.header}>
              <div className={styles.meta}><span>{category}</span>{readTime && <span>{readTime} 阅读</span>}{updatedAt && <span>更新于 {updatedAt}</span>}</div>
              <h1>{title}</h1>
              <p>{description}</p>
              <div className={styles.tags}>{tags.filter((tag) => tag !== "pi-book").map((tag) => <span key={tag}>{tag}</span>)}</div>
            </header>
            {headings.length > 0 && <details className={styles.mobileToc}><summary><List size={14} /> 本文目录 <span>{headings.length}</span></summary><nav aria-label="本文目录（移动端）">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`}>{heading.title}</a>)}</nav></details>}
            <div className={styles.body}><AgentMdx source={source} format={format} /></div>
            <div className={styles.discuss}><div><MessageSquare size={17} /><span>读到这里，有新的想法？</span></div><Link href={`/chat?topic=${encodeURIComponent(title)}`}>围绕本文聊聊 <ArrowRight size={14} /></Link></div>
            {(previous || next) && <nav className={styles.articleNav} aria-label="前后文章">{previous ? <Link href={previous.href}><span><ArrowLeft size={13} />上一篇</span><strong>{previous.title}</strong></Link> : <div />}{next ? <Link className={styles.next} href={next.href}><span>下一篇<ArrowRight size={13} /></span><strong>{next.title}</strong></Link> : <div />}</nav>}
            {related.length > 0 && <section className={styles.related}><h2>相关阅读</h2>{related.map((item) => <Link key={item.href} href={item.href}>{item.title}<ArrowRight size={14} /></Link>)}</section>}
          </article>
          <aside className={styles.aside}>
            <div className={styles.sticky}>
              {series && <div className={styles.series}><BookOpen size={16} /><span>所属系列</span><Link href={series.href}>{series.title}<ArrowRight size={13} /></Link>{series.position && <p>{series.position}</p>}</div>}
              {headings.length > 0 && <nav className={styles.toc} aria-label="本文目录"><span className={styles.asideLabel}>本文目录</span>{headings.map((heading, index) => <a key={heading.id} href={`#${heading.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{heading.title}</a>)}</nav>}
              <Link className={styles.backLink} href="/knowledge"><ArrowLeft size={12} />回到阅读书架</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
