import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import styles from "@/features/site/components/Profile.module.css"

export default function ResumePage() {
  return (
    <main className={styles.page}>
      <div className={styles.resumeWrap}>
        <div className={styles.resumeToolbar}>
          <Link href="/" className={styles.backLink}><ArrowLeft size={14} aria-hidden="true" />zhiqiang.chat</Link>
          <a href="/resume.docx" download className={styles.download}><Download size={14} aria-hidden="true" />下载 DOCX</a>
        </div>

        {/* 头部 */}
        <header className={styles.resumeHeader}>
          <h1 className={styles.name}>林志强</h1>
          <p className={styles.role}>全栈 Agent 开发工程师</p>
          <p className={styles.contact}>男 · 28岁 · 深圳  |  13544042869  |  sz976291321@gmail.com</p>
          <p className={styles.summary}>6年经验 · 擅长 AI Agent 驱动的全栈产品研发 · OpenClaw 多智能体平台作者</p>
        </header>

        {/* 核心优势 */}
        <Section title="核心优势">
          <div className={styles.strengths}>
            <Item title="OpenClaw 多智能体平台作者">
              自研本地多 Agent 调度平台 OpenClaw，实现主 Agent 调度 + 子 Agent 并发执行架构，集成飞书 30+ 工具、SearXNG 搜索引擎、Chrome DevTools 浏览器控制，通过 Skill 编排和 Hooks 自动化将 AI Agent 深度嵌入研发全流程
            </Item>
            <Item title="Claude Code 深度用户">
              连续 4 个月订阅 Claude Max plan（20x），深度掌握 SubAgent 任务分发、自定义 Skill 开发、Hooks 链路自动化、CLAUDE.md + Spec 驱动开发等高级能力，单人产出效率提升 3 倍以上
            </Item>
            <Item title="全栈独立交付">
              一人完成产品定义 → 前后端开发 → 部署上线全链路，独立负责 2 条产品线、10+ 个多语言落地页
            </Item>
            <Item title="前端架构 & 性能优化">
              5 年 React/TypeScript 深耕，主导视频编辑器架构设计（发布订阅/策略/工厂/装饰器模式），WebSocket 替代轮询减少 50% 请求，自研组件库/工具库/动画库
            </Item>
          </div>
        </Section>

        {/* OpenClaw */}
        <Section title="OpenClaw · 自研多智能体 AI 平台">
          <p className={styles.sectionIntro}>
            本地部署的多 Agent 调度平台，主 Agent 按决策树自动分发任务给专业子 Agent 并发执行，集成飞书生态和本地开发工具链。
          </p>
          <SubSection title="架构设计">
            <Li>调度决策树：主 Agent 接收请求后按类型自动分发——简单问答自处理、深度调研派产品经理 Agent、生图派设计 Agent、编码调用本地 Claude Code CLI</Li>
            <Li>多 Agent 并发编排：独立子任务同时派发，结果回流整合提炼。Agent 体系：主 Agent（Sonnet）调度 + 产品经理（Haiku）调研/飞书输出 + 设计师（Haiku）文生图</Li>
          </SubSection>
          <SubSection title="工具链 & Claude Code 高级能力">
            <Li>飞书 30+ 工具 WebSocket 接入（消息/文档/表格/日历/任务/知识库），SearXNG 自部署搜索（70+ 引擎），Chrome DevTools 远程控制</Li>
            <Li>Skill 分层加载（全局 + Agent 专属），可扩展插件机制；Hooks 自动化（pre-commit lint/格式化）；Spec 驱动开发（CLAUDE.md 规范 + Spec 验收标准）</Li>
            <Li>Prompt 工程优化：重构 JSON key 格式精简上下文使 Token 消耗降低 89%，多轮对话策略保持长会话连贯</Li>
          </SubSection>
        </Section>

        {/* 技术栈 */}
        <Section title="技术栈">
          <Tags items={["TypeScript", "JavaScript", "Python", "Java", "Golang", "HTML/CSS"]} />
          <Tags items={["React", "Next.js", "Vue2/Vue3", "Vite", "Webpack", "Taro", "Tailwind CSS", "Ant Design"]} />
          <Tags items={["NestJS", "Node.js", "Prisma", "PostgreSQL", "Supabase"]} />
          <Tags items={["Claude Code (Max 20x)", "OpenClaw", "Gemini", "ChatGPT", "Manus"]} />
          <Tags items={["Vercel", "Railway", "Google Cloud Run", "AWS SES", "Docker", "Cloudflare"]} />
          <Tags items={["WebSocket", "WebAssembly", "Electron", "Web Worker", "Puppeteer", "GSAP"]} />
        </Section>

        {/* 工作经历 */}
        <Section title="工作经历">
          <Job company="OneVertical.ai" role="全栈 Agent 开发工程师" time="2025.12 — 至今" current>
            独立负责两条产品线全栈研发，通过 OpenClaw 和 Claude Code 驱动开发流程，一人完成产品定义到部署上线全链路。
          </Job>
          <Job company="深圳市闪剪智能科技有限公司" role="前端开发工程师（技术委员会成员）" time="2022.03 — 2025.12">
            核心前端开发，负责视频编辑器架构设计、几何算法核心模块，主导自研基建项目，制定前端规范并参与 Code Review。
          </Job>
          <Job company="中科软科技股份有限公司" role="前端开发工程师" time="2021.05 — 2022.01" />
          <Job company="深圳数联天下智能科技有限公司" role="前端开发工程师" time="2019.12 — 2021.05" />
        </Section>

        {/* 项目经历 */}
        <Section title="项目经历">
          {/* 闪剪 */}
          <Project name="闪剪 Web 端 · 视频创作平台" tech="React + TypeScript + MobX" time="2022.03 — 2025.12">
            <p className={styles.projectIntro}>
              面向内容创作者的视频创作平台，支持视频编辑、直播管理、数字人生成、AI 配音、多平台发布，服务数十万创作者。
            </p>
            <SubSection title="视频编辑器架构设计（核心职责）">
              <Li>主导视频编辑器主体架构设计，负责编辑逻辑和几何算法核心模块，支撑裁剪、拼接、特效叠加、字幕轨道等核心编辑能力</Li>
              <Li>运用发布订阅实现模块解耦通信，策略模式处理不同媒体渲染，工厂模式统一素材创建，装饰器模式无侵入扩展</Li>
              <Li>设计事件驱动的状态管理架构，支持 Undo/Redo、多轨道协同编辑、实时预览同步</Li>
              <Li>WebSocket 替代轮询，减少 50% 服务器请求，批量视频处理效率提升 50%</Li>
            </SubSection>
            <SubSection title="自研基建：组件库 / 工具库 / 动画库">
              <Li>组件库从 0 自研（Modal/Loading/骨架屏/Input/走马灯），规避开源库数据绑架问题，轻量自由高效</Li>
              <Li>工具库统一数据流转规范减少重复开发；动画库基于 GSAP + GPU 渲染加速实现流畅动画</Li>
              <Li>技术委员会成员，独立制定前端编码规范，主导 Code Review 和 Git Flow</Li>
            </SubSection>
            <SubSection title="口播视频 & 定制数字人">
              <Li>WebSocket 实时推送视频状态，延迟从 3s 降至 500ms，问题定位缩短 60%</Li>
              <Li>优化大文件分片上传，上传成功率提升 30%，视频处理速度提升 50%</Li>
            </SubSection>
            <SubSection title="FacePlay 抖音小程序">
              <Li>Taro + TypeScript + Redux，日均制作量 5 万+，月活增长 200% 达 50 万+，广告收益增长 150%</Li>
            </SubSection>
          </Project>

          {/* Falcocut */}
          <Project name="Falcocut · AI 视频营销工具套件" tech="Next.js + NestJS + Supabase · 全栈独立开发" time="2025.12 — 至今">
            <SubSection title="AI Agent 自动化 Pipeline">
              <Li>全流程自动化：爬取 187 个热门视频 → Gemini 反推提示词 → 批量提交 AI 视频生成任务</Li>
              <Li>Claude Code 竞品分析 Skill（Puppeteer 抓取），一条指令完成 SEO 内容/资源/结构化数据提取</Li>
              <Li>SEO Content Generator（NestJS + Cloud Run），异步队列 + 批量拆分，Prompt 优化使 Token 降低 89%</Li>
            </SubSection>
          </Project>

          {/* ov-admin */}
          <Project name="ov-admin · Landing Page 运营管理系统" tech="NestJS + Prisma + React/Vite + Ant Design" time="2025.12 — 至今">
            <SubSection title="Landing Page 可视化编辑 & 多语言 SEO">
              <Li>全链路管理：26 个 Section 模板 → 可视化编辑器 → Google Sheets 同步 → 动态发布，运营无需改代码更新页面</Li>
              <Li>10+ 产品落地页覆盖 7 种语言，SEOHead 组件统一 meta/OG/Hreflang/结构化数据，Lighthouse 100/100</Li>
              <Li>Claude Code 辅助模板开发从 2 天→半天；博主采集系统导入 29.3 万条数据 + 种子扩散自动发现</Li>
              <Li>Vercel + Railway + Supabase 同区域部署，API 延迟 2.3s→0.36s；RBAC 权限管理</Li>
            </SubSection>
          </Project>
        </Section>

        {/* 教育 */}
        <Section title="教育经历">
          <p className={styles.education}>广州华南商贸职业学院 · 大专 · 计算机及应用 · 2016 — 2019</p>
        </Section>
      </div>
    </main>
  )
}

/* ===== 子组件 ===== */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className={styles.resumeSection}><h2>{title}</h2><div className={styles.sectionContent}>{children}</div></section>
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4><ul>{children}</ul></div>
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.strength}><h3>{title}</h3><p>{children}</p></div>
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className={styles.bullet}>{children}</li>
}

function Tags({ items }: { items: string[] }) {
  return <div className={styles.skillRow}>{items.map((item) => <span key={item}>{item}</span>)}</div>
}

function Job({ company, role, time, current, children }: {
  company: string; role: string; time: string; current?: boolean; children?: React.ReactNode
}) {
  return (
    <div className={`${styles.job} ${current ? styles.currentJob : ""}`}>
      <div className={styles.entryHeading}><h3>{company}</h3><span>{time}</span></div>
      <p className={styles.jobRole}>{role}</p>
      {children ? <p className={styles.jobDescription}>{children}</p> : null}
    </div>
  )
}

function Project({ name, tech, time, children }: {
  name: string; tech: string; time: string; children: React.ReactNode
}) {
  return <article className={styles.resumeProject}><div className={styles.entryHeading}><h3>{name}</h3><span>{time}</span></div><p className={styles.tech}>{tech}</p>{children}</article>
}
