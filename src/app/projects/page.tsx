"use client"

import { motion } from "framer-motion"
import { PageShell } from "@/components/shared/PageShell"

const PROJECTS = [
  {
    title: "zhiqiang.chat",
    desc: "你正在看的这个网站。Agent 知识库 + Design Token Lab + 个人展示，玻璃质感杂志风设计。",
    tags: ["Next.js", "Tailwind", "Framer Motion"],
    href: "https://github.com/lzq976291321/zhiqiang.chat",
    accent: "#C8A97E",
    span: "col-span-1",
  },
  {
    title: "流量卡办理",
    desc: "面向流量卡选择的筛选与办理页面，聚合 337 个商品，并按地区、月租、通用流量、周期、人群和运营商组织筛选。",
    tags: ["Netlify", "筛选工具", "信息架构"],
    href: "https://liuliangka.netlify.app/",
    accent: "#B8F7D4",
    span: "col-span-1 sm:col-span-2",
  },
  {
    title: "Skills 工具库",
    desc: "30 个 Claude Code Skills 按角色分类，带是否值得长期启用的判断。",
    tags: ["Claude Code", "AI"],
    href: "/skills",
    accent: "#C8A97E",
    span: "col-span-1",
  },
  {
    title: "Design Token Lab",
    desc: "先看多套真实 HTML 风格样张，满意后提取 design-tokens.md，给项目直接复用。",
    tags: ["Design Tokens", "HTML", "UI"],
    href: "/design-lab",
    accent: "#9FE8FF",
    span: "col-span-1",
  },
  {
    title: "MCP 精选",
    desc: "16 个值得接入的 MCP，按角色、风险和权限边界重新筛选。",
    tags: ["MCP", "AI Tools"],
    href: "/mcp",
    accent: "#C8A97E",
    span: "col-span-1",
  },
  {
    title: "RC模友圈",
    desc: "遥控模型垂直社区，专注遥控船、遥控车、维修技术交流。当前作为内容社区与 SEO 方向的补充项目展示。",
    tags: ["Next.js", "Supabase", "社区"],
    href: "https://rcmyq.cn",
    accent: "#d35400",
    span: "col-span-1",
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
    <PageShell title="项目" subtitle="个人作品与开源项目" accent="#B8F7D4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROJECTS.map((p, i) => (
          <motion.a
            key={p.title}
            href={p.href}
            target={p.href.startsWith("http") ? "_blank" : undefined}
            rel={p.href.startsWith("http") ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`glass-card group block p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-100/22 hover:bg-white/[0.095] ${p.span}`}
          >
            {/* 顶部色条 */}
            <div
              className="mb-5 h-[2px] w-12 rounded-full transition-all duration-500 group-hover:w-20"
              style={{ backgroundColor: p.accent }}
            />

            <h3 className="mb-2 font-heading text-2xl font-semibold tracking-[-0.025em] text-white/88 transition-colors group-hover:text-white">
              {p.title}
            </h3>

            <p className="mb-4 text-sm leading-relaxed text-white/48 transition-colors group-hover:text-white/58">
              {p.desc}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] tracking-wider text-white/38"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 箭头 */}
            <div className="mt-4 flex items-center gap-1.5 text-cyan-50/68 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-[11px] font-mono">{getProjectActionLabel(p.href)}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
          </motion.a>
        ))}
      </div>

      <section id="sj" className="mt-16 scroll-mt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="glass-card p-6 sm:p-7">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-100/48">
              SJ Project Archive
            </p>
            <h2 className="max-w-2xl font-heading text-4xl font-semibold leading-[0.96] tracking-[-0.04em] text-white sm:text-5xl">
              复杂视频产品线项目集
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/56">
              这批项目不适合按内部仓库逐个公开展开，更适合展示为 4 个能力域：视频创作产品线、编辑器核心、直播/数字人/桌面端、前端基建。
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["20+", "前端项目"],
              ["4", "能力域"],
              ["6+", "技术栈"],
            ].map(([value, label]) => (
              <div key={label} className="glass-card flex min-h-32 flex-col justify-end p-4">
                <span className="font-heading text-4xl font-semibold tracking-[-0.04em] text-cyan-50">
                  {value}
                </span>
                <span className="mt-2 text-xs text-white/46">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-2">
          {SJ_PROJECT_GROUPS.map((group, index) => (
            <motion.article
              key={group.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card overflow-hidden p-5 sm:p-6"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/36">
                    Area {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-balance text-xl font-semibold tracking-[-0.025em] text-white/86">
                    {group.title}
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 font-mono text-[10px] text-white/36">
                  SJ
                </span>
              </div>

              <p className="mb-5 text-sm leading-7 text-white/54">{group.desc}</p>

              <div className="mb-5 grid grid-cols-2 gap-2">
                {group.modules.map((module) => (
                  <span
                    key={module}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/52"
                  >
                    {module}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-100/12 bg-cyan-100/[0.06] px-2.5 py-1 font-mono text-[10px] tracking-wider text-cyan-50/48"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
