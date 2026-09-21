import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import styles from "@/features/site/components/Profile.module.css"
import { selectedProjects } from "@/features/site/data/projects"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "项目档案", alternates: { canonical: "/projects/archive" } }

const PROJECTS = [
  ...selectedProjects.map((project) => ({
    title: project.name,
    desc: project.description,
    tags: project.stack,
    href: project.href,
  })),
  {
    title: "UI Lab",
    desc: "在阅读空间、AI 任务台和项目工作台中体验主题，查看并导出同一套 Design Tokens。",
    tags: ["Design Tokens", "React", "CSS Variables"],
    href: "/lab",
  },
]

const SJ_PROJECT_GROUPS = [
  {
    title: "视频创作工作台与微前端应用群",
    desc: "围绕工作台基座、业务后台、口播/图文视频、链接成片、模板市场、定制数字人、商城和公共登录导航，覆盖内容生产主流程。",
    tags: ["React", "TypeScript", "MobX", "Vite", "Micro App"],
    modules: ["工作台基座", "业务后台", "图文/口播", "链接成片", "模板市场", "定制数字人"],
  },
  {
    title: "视频编辑器与内容生产核心",
    desc: "沉淀编辑器架构、几何算法、素材状态、实时预览、多轨道协同、Undo/Redo、任务状态推送和上传链路优化。",
    tags: ["Editor", "WebSocket", "Upload", "State Design"],
    modules: ["编辑器架构", "字幕轨道", "特效叠加", "实时预览", "分片上传", "任务反馈"],
  },
  {
    title: "数字人、直播与桌面端",
    desc: "覆盖 AI 直播/智播、定制数字人、官网和 Electron 桌面端，处理音视频、快捷键、Socket、国际化和桌面打包等场景。",
    tags: ["Electron", "Audio", "Socket", "i18n"],
    modules: ["AI 直播", "数字人", "BocaLive", "桌面端", "官网落地页", "错误监控"],
  },
  {
    title: "前端基建与内部工具链",
    desc: "从业务中抽象组件库、动画库、工具库、公共类型、登录导航和团队规范，支撑多个业务应用复用。",
    tags: ["UI Library", "GSAP", "Utils", "Types"],
    modules: ["Lithe UI", "动画库", "工具库", "公共类型", "导航登录", "私有 npm"],
  },
]

function getProjectActionLabel(href: string) {
  if (href.includes("github.com")) return "GitHub"
  if (href.startsWith("http")) return "访问"
  return "查看"
}

export default function ProjectsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.archiveWrap}>
        <Link href="/projects" className={styles.backLink}><ArrowLeft size={14} aria-hidden="true" />作品展示</Link>
        <header className={styles.archiveHeader}>
          <p className={styles.eyebrow}>PROJECT ARCHIVE</p>
          <h1>项目档案</h1>
          <p>个人作品、工具与工程实践的完整清单。</p>
          <nav className={styles.sectionNav} aria-label="项目档案分区"><a href="#personal">个人作品与工具<span>{String(PROJECTS.length).padStart(2, "0")}</span></a><a href="#sj">视频产品与工程<span>04</span></a></nav>
        </header>

        <section id="personal" className={styles.archiveSection}>
          <div className={styles.archiveSectionHead}><h2>个人作品与工具</h2><span>可访问的产品与项目</span></div>
          <div className={styles.projectList}>
            {PROJECTS.map((project, index) => (
              <a key={project.title} href={project.href} target={project.href.startsWith("http") ? "_blank" : undefined} rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined} className={styles.projectRow}>
                <span className={styles.rowNumber}>{String(index + 1).padStart(2, "0")}</span>
                <div className={styles.projectInfo}><h3>{project.title}</h3><p>{project.desc}</p><div className={styles.projectTags}>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
                <span className={styles.projectAction}>{getProjectActionLabel(project.href)}<ArrowUpRight size={14} aria-hidden="true" /></span>
              </a>
            ))}
          </div>
        </section>

        <section id="sj" className={styles.archiveSection}>
          <div className={styles.archiveSectionHead}><h2>视频产品与工程</h2><span>SJ Project Archive</span></div>
          <div className={styles.engineeringIntro}>
            <p>这批项目不适合按内部仓库逐个公开展开，更适合展示为 4 个能力域：视频创作产品线、编辑器核心、直播/数字人/桌面端、前端基建。</p>
            <dl className={styles.metrics}>{[["20+", "前端项目"], ["4", "能力域"], ["6+", "技术栈"]].map(([value, label]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          </div>
          <div className={styles.engineeringList}>
            {SJ_PROJECT_GROUPS.map((group, index) => (
              <article key={group.title} className={styles.engineeringRow}>
                <div className={styles.domainLabel}><span>{String(index + 1).padStart(2, "0")}</span><span>工程领域</span></div>
                <div><h3>{group.title}</h3><p>{group.desc}</p><ul className={styles.moduleList}>{group.modules.map((module) => <li key={module}>{module}</li>)}</ul><div className={styles.projectTags}>{group.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div>
              </article>
            ))}
          </div>
        </section>
        <footer className={styles.pageFooter}><span>zhiqiang.chat</span><Link href="/resume">查看完整简历<ArrowUpRight size={13} aria-hidden="true" /></Link></footer>
      </div>
    </main>
  )
}
