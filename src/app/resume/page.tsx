"use client"

import { motion } from "framer-motion"
import { BackHome } from "@/components/shared/BackHome"

const INFO = {
  name: "林志强",
  title: "全栈 Agent 开发工程师",
  meta: "男 · 28岁 · 深圳 | 13544042869 | sz976291321@gmail.com",
  summary: "6年经验 · 擅长 AI Agent 驱动的全栈产品研发 · OpenClaw 多智能体平台作者",
}

const STRENGTHS = [
  {
    title: "OpenClaw 多智能体平台作者",
    desc: "自研本地多 Agent 调度平台，主 Agent 调度 + 子 Agent 并发执行架构，集成飞书 30+ 工具、SearXNG 搜索引擎、Chrome DevTools 浏览器控制",
  },
  {
    title: "Claude Code 深度用户",
    desc: "连续 4 个月订阅 Claude Max plan（20x），深度掌握 SubAgent 任务分发、自定义 Skill 开发、Hooks 链路自动化，单人产出效率提升 3 倍以上",
  },
  {
    title: "全栈独立交付",
    desc: "一人完成产品定义 → 前后端开发 → 部署上线全链路，独立负责 2 条产品线、10+ 个多语言落地页",
  },
  {
    title: "前端架构 & 性能优化",
    desc: "5 年 React/TypeScript 深耕，主导视频编辑器架构设计，WebSocket 替代轮询减少 50% 请求，自研组件库/工具库/动画库",
  },
]

const EXPERIENCE = [
  {
    company: "OneVertical.ai",
    role: "全栈 Agent 开发工程师",
    time: "2025.12 — 至今",
    desc: "独立负责两条产品线全栈研发，通过 OpenClaw 和 Claude Code 驱动开发流程",
  },
  {
    company: "深圳市闪剪智能科技有限公司",
    role: "前端开发工程师（技术委员会成员）",
    time: "2022.03 — 2025.12",
    desc: "核心前端开发，负责视频编辑器架构设计、几何算法核心模块，主导自研基建项目",
  },
  {
    company: "中科软科技股份有限公司",
    role: "前端开发工程师",
    time: "2021.05 — 2022.01",
    desc: "",
  },
  {
    company: "深圳数联天下智能科技有限公司",
    role: "前端开发工程师",
    time: "2019.12 — 2021.05",
    desc: "",
  },
]

const PROJECTS = [
  {
    name: "OpenClaw · 自研多智能体 AI 平台",
    highlights: [
      "主 Agent 按决策树自动分发任务给专业子 Agent 并发执行",
      "飞书 30+ 工具 WebSocket 接入，SearXNG 自部署搜索（70+ 引擎）",
      "Skill 分层加载 + Hooks 自动化 + Spec 驱动开发",
      "Prompt 工程优化使 Token 消耗降低 89%",
    ],
  },
  {
    name: "闪剪 Web 端 · 视频创作平台",
    highlights: [
      "主导视频编辑器主体架构设计，支撑裁剪、拼接、特效叠加、字幕轨道等核心能力",
      "运用发布订阅/策略/工厂/装饰器四大设计模式",
      "WebSocket 替代轮询减少 50% 请求，批量视频处理效率提升 50%",
      "自研组件库 + 工具库 + 动画库，抖音小程序月活 50 万+",
    ],
  },
  {
    name: "Falcocut · AI 视频营销工具套件",
    highlights: [
      "全流程自动化：爬取 187 个热门视频 → Gemini 反推提示词 → 批量 AI 视频生成",
      "Claude Code 竞品分析 Skill，一条指令完成 SEO 内容提取",
      "Prompt 优化使 Token 降低 89%",
    ],
  },
  {
    name: "ov-admin · Landing Page 运营管理系统",
    highlights: [
      "26 个 Section 模板 → 可视化编辑器 → Google Sheets 同步 → 动态发布",
      "10+ 产品落地页覆盖 7 种语言，Lighthouse 100/100",
      "Claude Code 辅助模板开发从 2 天→半天",
      "API 延迟 2.3s→0.36s",
    ],
  },
]

const TECH_STACK = [
  { label: "语言", items: "TypeScript · JavaScript · Python · Java · Golang" },
  { label: "前端", items: "React · Next.js · Vue2/Vue3 · Tailwind CSS · Ant Design · Taro" },
  { label: "后端", items: "NestJS · Node.js · Prisma · PostgreSQL · Supabase" },
  { label: "AI", items: "Claude Code (Max 20x) · OpenClaw · Gemini · ChatGPT · Manus" },
  { label: "部署", items: "Vercel · Railway · Google Cloud Run · Docker · Cloudflare" },
  { label: "其他", items: "WebSocket · WebAssembly · Electron · Puppeteer · GSAP" },
]

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-0 left-0 right-0 h-[30vh] -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(ellipse, #A78BFA, transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 pb-20">
        {/* 返回 + 下载 */}
        <div className="flex items-center justify-between">
          <BackHome />
          <a
            href="/resume.docx"
            download
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-mono tracking-wider text-foreground/25 hover:text-foreground/50 border border-foreground/[0.06] hover:border-foreground/[0.12] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载 DOCX
          </a>
        </div>

        {/* 头部 */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 mb-10"
        >
          <h1 className="text-4xl font-heading font-black text-foreground/90">{INFO.name}</h1>
          <p className="text-lg text-warm/70 font-medium mt-1">{INFO.title}</p>
          <p className="text-sm text-foreground/25 mt-2 font-mono">{INFO.meta}</p>
          <p className="text-sm text-foreground/35 mt-2">{INFO.summary}</p>
        </motion.header>

        {/* 核心优势 */}
        <Section title="核心优势" delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STRENGTHS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="p-4 rounded-xl border border-foreground/[0.04] bg-surface/30"
              >
                <h3 className="text-sm font-bold text-foreground/70 mb-1.5">{s.title}</h3>
                <p className="text-xs text-foreground/25 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* 技术栈 */}
        <Section title="技术栈" delay={0.2}>
          <div className="space-y-2">
            {TECH_STACK.map((t) => (
              <div key={t.label} className="flex gap-3">
                <span className="text-[11px] font-mono text-warm/40 w-12 shrink-0 pt-0.5">{t.label}</span>
                <p className="text-sm text-foreground/30 leading-relaxed">{t.items}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 工作经历 */}
        <Section title="工作经历" delay={0.3}>
          <div className="space-y-5">
            {EXPERIENCE.map((e, i) => (
              <div key={i} className="relative pl-5 border-l border-foreground/[0.06]">
                <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full -translate-x-[3.5px]"
                  style={{ background: i === 0 ? "#F59E0B" : "rgba(245,158,11,0.2)" }}
                />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                  <h3 className="text-sm font-bold text-foreground/70">{e.company}</h3>
                  <span className="text-[11px] font-mono text-foreground/20">{e.time}</span>
                </div>
                <p className="text-xs text-warm/40 mt-0.5">{e.role}</p>
                {e.desc && <p className="text-xs text-foreground/25 mt-1 leading-relaxed">{e.desc}</p>}
              </div>
            ))}
          </div>
        </Section>

        {/* 项目经历 */}
        <Section title="项目经历" delay={0.4}>
          <div className="space-y-6">
            {PROJECTS.map((p, i) => (
              <div key={i}>
                <h3 className="text-sm font-bold text-foreground/70 mb-2">{p.name}</h3>
                <ul className="space-y-1">
                  {p.highlights.map((h, j) => (
                    <li key={j} className="text-xs text-foreground/25 leading-relaxed pl-3 relative before:content-['·'] before:absolute before:left-0 before:text-warm/30">
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* 教育 */}
        <Section title="教育经历" delay={0.5}>
          <p className="text-sm text-foreground/30">广州华南商贸职业学院 · 大专 · 计算机及应用 · 2016 — 2019</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10"
    >
      <h2 className="text-xs font-mono tracking-[0.15em] uppercase text-foreground/20 mb-4">{title}</h2>
      {children}
    </motion.section>
  )
}
