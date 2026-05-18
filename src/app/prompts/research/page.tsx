import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowUpRight,
  BarChart3,
  Database,
  FileText,
  Film,
  ImageIcon,
  Search,
  ShieldCheck,
} from "lucide-react"
import { PageShell } from "@/components/shared/PageShell"
import { siteConfig } from "@/config/site"

const sampleGroups = [
  { name: "latest", label: "最新列表", total: 8210, note: "按 reviewed_at 倒序抓第 1 页" },
  { name: "latest-page-2", label: "最新列表 P2", total: 8210, note: "按 reviewed_at 倒序抓第 2 页" },
  { name: "video", label: "视频案例", total: 609, note: "media_type=video" },
  { name: "food", label: "食物搜索", total: 120, note: "search=食物" },
  { name: "poster", label: "海报搜索", total: 683, note: "search=海报" },
]

const detailSamples = [
  {
    title: "奶油色调韩系少女深夜书房温馨写真",
    slug: "cozy-korean-study-room-portrait-lifestyle",
    model: "ChatGPT",
    media: "image",
    source: "@john_my07",
    assets: "2 images",
    promptScale: "EN 1309 / ZH 408 chars",
    signal: "生活方式写真靠房间细节、灯光关系和自然姿态成立。",
  },
  {
    title: "能量饮料与游戏跨界联动广告大片",
    slug: "energy-drink-game-crossover-ad-prompt",
    model: "ChatGPT",
    media: "image",
    source: "@LudovicCreator",
    assets: "2 images",
    promptScale: "EN 4410 / ZH 1689 chars",
    signal: "产品广告类 Prompt 会用很长文本保护商品识别、视觉层级和品牌安全区。",
  },
  {
    title: "电影级塔可解构旋转广告",
    slug: "cinematic-taco-deconstruction",
    model: "Nano banana pro",
    media: "image",
    source: "@Strength04_X",
    assets: "1 image",
    promptScale: "EN 537 / ZH 167 chars",
    signal: "食品广告不靠形容词，靠材质、食材轨道、棚拍灯光和留白。",
  },
  {
    title: "兰博基尼公牛觉醒狂飙广告",
    slug: "lamborghini-bull-awakening-commercial",
    model: "Seedance 2.0",
    media: "video",
    source: "@johnAGI168",
    assets: "1 image + 1 video",
    promptScale: "EN 6403 / ZH 1531 chars",
    signal: "视频广告需要按秒拆节奏，每 3 秒一次视觉升级，并写清声音设计。",
  },
  {
    title: "华尔街冰面滑倒子弹时间",
    slug: "wall-street-ice-bullet-time",
    model: "Seedance 2.0",
    media: "video",
    source: "@oggii_0",
    assets: "1 image + 1 video",
    promptScale: "EN 582 / ZH 175 chars",
    signal: "娱乐短片可以只抓一个荒诞瞬间，但要把冻结元素写得很具体。",
  },
  {
    title: "猫咪深夜食堂手作拉面",
    slug: "late-night-cat-ramen",
    model: "Seedance 2.0",
    media: "video",
    source: "@Adam38363368936",
    assets: "1 image + 1 video",
    promptScale: "EN 2147 / ZH 565 chars",
    signal: "治愈美食短片靠蒸汽、手部动作、环境声和收尾静帧，而不是只写可爱。",
  },
  {
    title: "搞笑反转：霸气全款喜提复古单车",
    slug: "funny-twist-buying-retro-bicycle",
    model: "Seedance 2.0",
    media: "video",
    source: "@johnAGI168",
    assets: "1 image + 1 video",
    promptScale: "EN 1124 / ZH 296 chars",
    signal: "反转短片要先建立广告语气，再在道具价值上完成落差。",
  },
]

const insightCards = [
  {
    title: "案例标题必须具体",
    body: "图库里表现好的标题通常不是“高级写真”，而是“奶油色调韩系少女深夜书房温馨写真”这种能直接带出画面的标题。",
  },
  {
    title: "视频 Prompt 更像脚本",
    body: "Seedance 类视频案例会写镜头段落、时间推进、转场方式和声音设计。只写画面风格，基本不够。",
  },
  {
    title: "商业图先保护主体",
    body: "产品、食品、海报类案例会反复锁定主体识别、材质、光线、留白和文字安全区，特效必须为主体让路。",
  },
  {
    title: "不适合原样搬运",
    body: "不少样本 Prompt 很长，且带来源作者、真实品牌或人物倾向。博客更适合提炼结构，再做原创化改写。",
  },
]

const nextTopics = [
  "虚构品牌饮料广告：练商品识别、联名感和活动 KV。",
  "深夜生活方式写真：练真实场景、人物安全和社交封面。",
  "美食解构广告：练微距材质、悬浮轨道和棚拍灯光。",
  "超跑/运动品牌短片：练分镜、速度感、声音设计。",
  "搞笑反转短片：练铺垫、冻结瞬间和结尾表情。",
  "治愈美食短片：练慢节奏、环境声和小动作。",
]

export const metadata: Metadata = {
  title: "OpenNana Prompt Research",
  description:
    "OpenNana 提示词图库抽样分析，记录公开接口、样本字段、题材信号和 Prompt Studio 后续选题方向。",
  alternates: {
    canonical: `${siteConfig.url}/prompts/research`,
  },
}

function StatCard({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="glass-card p-5">
      <p className="font-heading text-4xl font-semibold tracking-[-0.045em] text-white">
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold text-white/72">{label}</p>
      <p className="mt-2 text-xs leading-5 text-white/42">{note}</p>
    </div>
  )
}

export default function PromptResearchPage() {
  return (
    <PageShell
      title="OpenNana Prompt Research"
      subtitle="这页只放可追溯的抽样证据和选题判断：抓了什么、看到了什么、下一批案例该怎么做。"
      accent="#9FE8FF"
      parentLink={{ href: "/prompts", label: "Prompt Studio" }}
    >
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-white/10 p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-100/10 px-3 py-1.5 text-sm text-cyan-50/78">
              <Database className="size-4" />
              Metadata-only sample
            </div>
            <h2 className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-none tracking-[-0.04em] text-white sm:text-5xl">
              不保存完整 Prompt，只保存可验证的样本信号。
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/54">
              抽样时间：2026-05-18 16:56 CST。抓取产物在本机临时文件：
              <span className="font-mono text-cyan-50/72">
                {" "}
                /tmp/opennana-prompt-sample-2026-05-18.json
              </span>
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            <StatCard value="100" label="列表样本" note="5 组查询，每组最多 20 条，过滤广告位。" />
            <StatCard value="7" label="详情样本" note="抓模型、标签、来源、媒体数量和 Prompt 字符数。" />
            <StatCard value="0" label="完整原文" note="不把第三方完整 Prompt 存进仓库或页面。" />
          </div>
        </div>

        <div className="grid gap-4">
          <a
            href="https://opennana.com/awesome-prompt-gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card group flex items-center justify-between gap-4 p-5 transition hover:-translate-y-1 hover:border-cyan-100/22"
          >
            <span>
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/46">
                <Search className="size-4" />
                Source
              </span>
              <span className="mt-3 block font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
                opennana.com/awesome-prompt-gallery
              </span>
            </span>
            <ArrowUpRight className="size-4 text-cyan-100/68 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          <div className="glass-card p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/46">
              <ShieldCheck className="size-4" />
              Boundary
            </p>
            <p className="mt-3 text-sm leading-7 text-white/54">
              这里把 OpenNana 当作公开样本来源，用来观察题材趋势和 Prompt 结构，不复制长段提示词，不把来源作者的原文当成自己的内容。
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-5">
        {sampleGroups.map((group) => (
          <div key={group.name} className="glass-card p-4">
            <p className="font-heading text-3xl font-semibold tracking-[-0.04em] text-white">
              {group.total.toLocaleString("en-US")}
            </p>
            <p className="mt-1 text-sm font-semibold text-white/70">{group.label}</p>
            <p className="mt-2 text-xs leading-5 text-white/38">{group.note}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-4">
        {insightCards.map((item) => (
          <article key={item.title} className="glass-card p-5">
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.025em] text-white">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/52">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 glass-card overflow-hidden">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/46">
            <BarChart3 className="size-4" />
            Detail sample
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.035em] text-white">
            7 条详情样本给出的信号
          </h2>
        </div>
        <div className="divide-y divide-white/10">
          {detailSamples.map((item) => {
            const MediaIcon = item.media === "video" ? Film : ImageIcon
            return (
              <article
                key={item.slug}
                className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.2fr)_220px_minmax(0,1fr)]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs text-white/54">
                      <MediaIcon className="size-3.5" />
                      {item.media}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs text-white/54">
                      {item.model}
                    </span>
                  </div>
                  <h3 className="mt-3 text-balance font-heading text-2xl font-semibold leading-tight tracking-[-0.025em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-mono text-xs text-white/34">{item.slug}</p>
                </div>

                <div className="space-y-2 text-sm text-white/48">
                  <p>{item.source}</p>
                  <p>{item.assets}</p>
                  <p>{item.promptScale}</p>
                </div>

                <p className="text-sm leading-7 text-white/54">{item.signal}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card p-5 sm:p-6">
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/46">
            <FileText className="size-4" />
            Next content
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.035em] text-white">
            后续案例先按这 6 类补
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/52">
            这些方向都来自样本信号，且适合你的博客：既能展示完整 Prompt，又能讲清楚为什么这么写。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {nextTopics.map((topic) => (
            <div key={topic} className="glass-card p-4 text-sm leading-6 text-white/58">
              {topic}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/prompts"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-100/10 px-4 py-2 text-sm font-semibold text-cyan-50/78 transition hover:border-cyan-100/28 hover:bg-cyan-100/14"
        >
          回到 Prompt Studio
          <ArrowUpRight className="size-4" />
        </Link>
      </section>
    </PageShell>
  )
}
