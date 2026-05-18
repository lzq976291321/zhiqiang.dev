import Link from "next/link"
import {
  ArrowUpRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  Code2,
  Command,
  FileText,
  Layers3,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import {
  getAllAgentArticles,
  getAllMcpServers,
  getAllSkills,
} from "@/lib/content"

const principles = [
  "Instruction",
  "Context",
  "Planning",
  "Tool Use",
  "Execution",
  "Verification",
  "Memory",
  "Permission",
]

export default function HomePage() {
  const agentArticles = getAllAgentArticles()
  const skills = getAllSkills()
  const mcpServers = getAllMcpServers()
  const mdxCount = agentArticles.length + skills.length + mcpServers.length

  const routes = [
    {
      href: "/agent",
      title: "Agent Engineering",
      desc: "从 Claude Code 学智能体设计、工具调用、上下文工程与工程化落地。",
      meta: `${agentArticles.length} essays`,
      icon: BrainCircuit,
      className: "lg:col-span-2",
    },
    {
      href: "/skills",
      title: "Skills",
      desc: "Claude Code Skills 按角色分类收集。",
      meta: `${skills.length} entries`,
      icon: Boxes,
      className: "",
    },
    {
      href: "/mcp",
      title: "MCP",
      desc: "真正好用的 MCP Server 精选。",
      meta: `${mcpServers.length} servers`,
      icon: Network,
      className: "",
    },
    {
      href: "/projects",
      title: "Projects",
      desc: "个人作品与开源项目展示。",
      meta: "case studies",
      icon: FileText,
      className: "",
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="glass-card min-h-[580px] overflow-hidden p-6 sm:p-9 lg:p-12">
          <div className="mb-20 flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-100/10 px-3 py-1.5 text-sm text-cyan-50/78">
              <Sparkles className="size-4" />
              Public knowledge base for Agent builders
            </div>
            <a
              href="https://github.com/lzq976291321?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white/54 transition hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
            >
              <Code2 className="size-4" />
              GitHub
            </a>
          </div>

          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-100/48">
            zhiqiang.dev / agent operating notebook
          </p>
          <h1 className="max-w-4xl text-balance font-heading text-[clamp(4rem,7vw,6.2rem)] font-semibold leading-[0.86] tracking-[-0.065em] text-white">
            Agent
            <span className="aurora-text block">Engineering</span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/62">
            我把 Claude Code、OpenClaw、MCP、Skills 和独立产品交付过程沉淀成一套可复用的 Agent 设计知识库。
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/agent"
              className="group inline-flex items-center gap-2 rounded-full border border-cyan-100/22 bg-cyan-100/14 px-5 py-3 text-sm font-semibold text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition hover:bg-cyan-100/20"
            >
              Start reading
              <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white"
            >
              View projects
            </Link>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="glass-card p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-100/54">
                System model
              </p>
              <Command className="size-5 text-white/48" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {principles.map((item, index) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3"
                >
                  <span className="font-mono text-[10px] text-cyan-100/38">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-white/82">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              [String(mdxCount), "MDX notes"],
              [String(agentArticles.length), "Agent essays"],
              [String(mcpServers.length), "MCP picks"],
            ].map(([value, label]) => (
              <div key={label} className="glass-card p-4">
                <p className="font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
                  {value}
                </p>
                <p className="mt-1 text-xs text-white/42">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {routes.map((route) => {
          const Icon = route.icon

          return (
            <div
              key={route.href}
              className={route.className}
            >
              <Link
                href={route.href}
                className="glass-card group flex h-full min-h-64 flex-col justify-between overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-100/22 hover:bg-white/[0.095]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-cyan-50/78">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/34">
                    {route.meta}
                  </span>
                </div>
                <div>
                  <h2 className="font-heading text-3xl font-semibold tracking-[-0.035em] text-white">
                    {route.title}
                  </h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/48">{route.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-50/72">
                    Enter
                    <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="glass-card p-6">
          <div className="mb-8 flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-100/48">
              What this site is
            </p>
            <BookOpen className="size-5 text-white/46" />
          </div>
          <p className="text-2xl font-semibold leading-snug tracking-[-0.03em] text-white">
            不是泛技术博客，而是一个围绕 Agent 设计、工具调用和工程交付的公开知识系统。
          </p>
        </div>
        <div className="glass-card p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Claude Code", "研究真实工程 Agent 的产品形态。", BrainCircuit],
              ["OpenClaw", "把工作流迁移到自己的多 Agent 平台。", Layers3],
              ["Safety", "权限、审计、验证和可回滚边界。", ShieldCheck],
            ].map(([title, desc, Icon]) => (
              <div key={title as string} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <Icon className="size-5 text-cyan-100/62" />
                <h3 className="mt-5 text-lg font-semibold text-white">{title as string}</h3>
                <p className="mt-2 text-sm leading-6 text-white/46">{desc as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
