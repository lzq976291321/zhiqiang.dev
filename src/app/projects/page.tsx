import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import styles from "@/features/site/components/Studio.module.css"
import work from "@/features/site/components/Projects.module.css"
import { selectedProjects } from "@/features/site/data/projects"

export const metadata: Metadata = {
  title: "作品",
  description: "可以打开的实际作品：3D 遥控船、阅读与创作空间、垂直社区与信息筛选工具。",
  alternates: { canonical: "/projects" },
}


export default function ProjectsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <header className={work.intro}>
          <div><span className={styles.eyebrow}>SELECTED WORK / 作品与实践</span><h1>想法的另一面，是作品。</h1><p>从设计到实现，亲手做出来的几个产品。点开，就能体验。</p></div>
          <span className={work.count}><b>{String(selectedProjects.length).padStart(2, "0")}</b> 个可体验的作品</span>
        </header>
        <div className={work.grid}>
          {selectedProjects.map((project, index) => (
            <article key={project.id} id={project.id} className={`${work.project} ${index === 0 ? work.featured : ""}`}>
              <a className={work.visual} href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined} aria-label={`打开${project.name}`}>
                <div className={work.window}>
                  <div className={work.chrome} aria-hidden="true"><i /><i /><i /><span>{project.domain}</span></div>
                  <Image src={project.image} alt={project.alt} width={1440} height={960} sizes={index === 0 ? "(max-width: 680px) 88vw, 620px" : "(max-width: 680px) 88vw, (max-width: 900px) 44vw, 340px"} preload={index === 0} />
                </div>
              </a>
              <div className={work.body}>
                <div className={work.meta}><span><i />{project.category}</span><span>0{index + 1}</span></div>
                <h2>{project.name}</h2><p>{project.description}</p>
                <div className={work.stack}>{project.stack.map((item) => <span key={item}>{item}</span>)}</div>
                <div className={work.links}>
                  <a href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}>{project.action}<ArrowUpRight size={13} /></a>
                  {project.secondary ? <Link href={project.secondary}>{project.secondaryLabel}<ArrowRight size={12} /></Link> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
        <section id="sj" className={work.archive}>
          <div><h2>项目档案</h2><p>视频创作、编辑器、数字人与前端基础设施的工程记录。</p></div>
          <Link href="/projects/archive#sj">查看更多工程经历<ArrowUpRight size={14} /></Link>
        </section>
        <footer className={styles.footer}><span>每一个作品，都从一个具体的问题开始。</span><Link href="/chat">聊聊你的想法 ↗</Link></footer>
      </div>
    </main>
  )
}
