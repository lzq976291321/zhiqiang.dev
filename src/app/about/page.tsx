import { PageShell } from "@/components/shared/PageShell"

const TIMELINE = [
  { year: "现在", title: "独立开发者", desc: "一个人全干：产品设计、前后端开发、部署运维。专注 AI 工具链与个人品牌建设。" },
  { year: "持续", title: "技术栈", desc: "Next.js + React + Tailwind CSS（前端）/ NestJS + Prisma + Supabase（后端）/ Vercel + Railway（部署）" },
  { year: "关注", title: "方向", desc: "SEO/AEO 优化、AIGC 工具链（Claude Skills / MCP / Prompt 工程）、独立产品。" },
]

const SKILLS = [
  { name: "React / Next.js", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Tailwind CSS", level: 90 },
  { name: "NestJS / Node.js", level: 85 },
  { name: "Prisma / PostgreSQL", level: 80 },
  { name: "AI 工具链", level: 85 },
]


function SkillBar({ name, level, index }: { name: string; level: number; index: number }) {
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm text-white/56">{name}</span>
        <span className="font-mono text-[11px] text-white/34">{level}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${level}%`,
            background: "linear-gradient(90deg, #9FE8FF, #B8F7D4)",
          }}
        />
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <PageShell title="关于" subtitle="一个人全干的独立开发者" accent="#9FE8FF">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        {/* 左侧：时间线 */}
        <div className="lg:col-span-3">
          <h2 className="mb-6 font-mono text-sm uppercase tracking-[0.15em] text-cyan-100/46">
            经历
          </h2>
          <div className="glass-card space-y-8 p-6">
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className="animate-fade-in-up relative border-l border-white/10 pl-6"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* 圆点 */}
                <div
                  className="absolute left-0 top-1 size-2 -translate-x-[4.5px] rounded-full"
                  style={{ background: i === 0 ? "#9FE8FF" : "rgba(159,232,255,0.24)" }}
                />
                <span className="mb-1 block font-mono text-[11px] tracking-wider text-cyan-100/56">
                  {item.year}
                </span>
                <h3 className="mb-1.5 font-heading text-xl font-semibold tracking-[-0.02em] text-white/86">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/48">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

        {/* 右侧：技能 */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 font-mono text-sm uppercase tracking-[0.15em] text-cyan-100/46">
            技能
          </h2>
          <div className="glass-card space-y-5 p-6">
            {SKILLS.map((s, i) => (
              <SkillBar key={s.name} {...s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
