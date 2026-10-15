import type { Metadata } from "next"
import Link from "next/link"
import styles from "@/features/site/components/Studio.module.css"
import profile from "@/features/site/components/Profile.module.css"

export const metadata: Metadata = { title: "关于", description: "志强的开发方向、技术栈与作品入口。", alternates: { canonical: "/about" } }

const TIMELINE = [
  { year: "现在", title: "全栈开发者", desc: "工作主责以前端、后端和部署运维为主，专注把 AI 工具链和业务需求落到可运行系统里。" },
  { year: "补位", title: "产品判断", desc: "如果项目缺少产品角色，我可以基于经验梳理需求和交互，并直接在项目中呈现可用形态；不以传统产品经理方式单独交付原型或设计稿。" },
  { year: "持续", title: "技术栈", desc: "Next.js + React + Tailwind CSS（前端）/ NestJS + Prisma + Supabase（后端）/ Vercel + Railway（部署）" },
  { year: "关注", title: "方向", desc: "SEO/AEO 优化、AIGC 工具链（Claude Skills / MCP / Prompt 工程）、独立产品。" },
]

const skills = ["React / Next.js", "TypeScript", "Tailwind CSS", "NestJS / Node.js", "Prisma / PostgreSQL", "AI 工具链"]

export default function AboutPage() {
  return <main className={styles.page}><div className={styles.wrap}>
    <header className={styles.hero}><span className={styles.eyebrow}>ABOUT / 关于</span><h1>把想法，做成能用的东西。</h1><p>前后端、部署运维与 Agent 工程实践。</p></header>
    <div className={profile.aboutGrid}>
      <section aria-labelledby="direction-heading"><h2 id="direction-heading">我在做什么</h2>{TIMELINE.map(item => <article className={profile.aboutEntry} key={item.year}><span>{item.year}</span><div><h3>{item.title}</h3><p>{item.desc}</p></div></article>)}</section>
      <aside className={profile.aboutAside}><h2>常用技术</h2><div className={profile.aboutSkills}>{skills.map(name => <span key={name}>{name}</span>)}</div><Link href="/projects">看实际作品 ↗</Link><Link href="/resume">查看简历 ↗</Link></aside>
    </div>
    <footer className={styles.footer}><span>阅读、设计与作品。</span><Link href="/chat">聊一聊 ↗</Link></footer>
  </div></main>
}
