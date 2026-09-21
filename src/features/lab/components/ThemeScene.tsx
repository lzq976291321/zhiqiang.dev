"use client"

import { useEffect, useId, useState } from "react"
import { ArrowDownToLine, ArrowRight, BookOpen, Bookmark, Check, CheckCheck, ChevronLeft, ChevronRight, Circle, FileText, Layers2, LoaderCircle, Plus, Square, Terminal, X } from "lucide-react"
import { themeStyle, type LabTheme } from "../lib/themes"
import styles from "./Scenes.module.css"

const chapters = [
  { title: "让注意力停留在文字上", subtitle: "把阅读，还给阅读。", quote: "好的界面懂得什么时候出现，也懂得什么时候退后。", body: "阅读是一种缓慢建立的关系。标题邀请人走进来，段落让人继续往前，而留白给思考留出一点空间。", second: "当导航、标签与工具各归其位，文字便成为页面的中心。不必让每一处都有声音，重要的内容自然会被看见。", label: "注意力" },
  { title: "好的留白，是阅读的节奏", subtitle: "空白并不是空着。", quote: "行与行之间，是一句话抵达下一句话的时间。", body: "紧密的文字适合快速浏览，舒展的行距适合停下来思考。同一段内容，换一种密度，也就换了一种阅读的速度。", second: "我们用小间距连接相邻的意思，用大间距结束一个话题。空间的变化比额外的分隔线更加轻巧。", label: "留白" },
  { title: "用层级代替装饰", subtitle: "让重要的，先被看见。", quote: "清楚的顺序，本身就是一种美感。", body: "从书名到章节，从章节到段落，信息需要一条清晰的路径。字号、字重与颜色共同帮助读者判断下一步。", second: "强调色不必铺满整个页面。它只出现在当前位置和必要的动作上，像书页里一条细细的铅笔线。", label: "层级" },
]

function PaperScene() {
  const [chapter, setChapter] = useState(0)
  const [view, setView] = useState<"reading" | "notes">("reading")
  const [saved, setSaved] = useState<number[]>([])
  const current = chapters[chapter]
  const isSaved = saved.includes(chapter)
  function changeChapter(index: number) { setChapter(index); setView("reading") }
  return (
    <>
      <header className={styles.sceneBar}>
        <span className={styles.sceneBrand}><BookOpen size={17} /> 边页 <small>PAPER NOTES</small></span>
        <div className={styles.sceneTabs} aria-label="阅读视图">
          <button type="button" aria-pressed={view === "reading"} onClick={() => setView("reading")}>阅读</button>
          <button type="button" aria-pressed={view === "notes"} onClick={() => setView("notes")}>摘录 <span>{saved.length}</span></button>
        </div>
      </header>
      <div className={styles.readingLayout}>
        <aside className={styles.readingNav}>
          <div className={styles.bookCover}><span>关于界面，<br />与阅读。</span><small>NOTES ON<br />READING & DESIGN</small><i>↗</i></div>
          <span className={styles.smallLabel}>随笔目录</span>
          <nav aria-label="阅读示例章节">
            {chapters.map((item, index) => <button type="button" key={item.title} onClick={() => changeChapter(index)} aria-current={chapter === index && view === "reading" ? "page" : undefined}><span>0{index + 1}</span>{item.label}</button>)}
          </nav>
          <p className={styles.readingNote}>三篇用于体验排版的<br />界面示例随笔。</p>
        </aside>
        <div className={styles.readingContent}>
          {view === "reading" ? <>
            <div className={styles.articleMeta}><span>CHAPTER 0{chapter + 1} / 03</span><button type="button" className={styles.iconButton} aria-label={isSaved ? "取消收藏这段摘录" : "收藏这段摘录"} aria-pressed={isSaved} onClick={() => setSaved((previous) => isSaved ? previous.filter((item) => item !== chapter) : [...previous, chapter])}><Bookmark size={15} fill={isSaved ? "currentColor" : "none"} /></button></div>
            <h3 className={styles.articleTitle}>{current.title}</h3>
            <p className={styles.articleSubtitle}>{current.subtitle}</p>
            <p className={styles.articleParagraph}>{current.body}</p>
            <blockquote>{current.quote}</blockquote>
            <p className={`${styles.articleParagraph} ${styles.secondParagraph}`}>{current.second}</p>
            <footer className={styles.articleFooter}>
              <span aria-live="polite">{isSaved ? "已存入我的摘录" : "阅读示例 · 可切换章节"}</span>
              <div><button type="button" className={styles.iconButton} disabled={chapter === 0} aria-label="上一章" onClick={() => changeChapter(chapter - 1)}><ChevronLeft size={14} /></button><span>0{chapter + 1}</span><button type="button" className={styles.iconButton} disabled={chapter === 2} aria-label="下一章" onClick={() => changeChapter(chapter + 1)}><ChevronRight size={14} /></button></div>
            </footer>
          </> : <>
            <div className={styles.articleMeta}><span>YOUR MARGINALIA</span><Bookmark size={15} /></div>
            <h3 className={styles.articleTitle}>留下来的句子。</h3>
            <p className={styles.articleSubtitle}>此处收藏只保留在当前预览中。</p>
            {saved.length ? saved.map((index) => <button type="button" key={index} className={styles.savedQuote} onClick={() => changeChapter(index)}><span>0{index + 1} · {chapters[index].title}</span><q>{chapters[index].quote}</q><ArrowRight size={15} /></button>) : <div className={styles.emptyNotes}><Bookmark size={23} /><p>读到喜欢的句子时，<br />点一下右上角的书签。</p><button type="button" className={styles.textButton} onClick={() => setView("reading")}>回到阅读 <ArrowRight size={13} /></button></div>}
          </>}
        </div>
      </div>
    </>
  )
}

const sourceNotes = [
  { topic: "阅读", content: "用明确的标题层级帮助读者定位。" },
  { topic: "交互", content: "每个操作都需要可见的反馈。" },
  { topic: "交付", content: "设计变量应与实际界面保持一致。" },
]
const runSteps = [
  { name: "读取摘录", tool: "read_notes", detail: "加载 3 条本地示例摘录" },
  { name: "整理结构", tool: "group_notes", detail: "按阅读、交互、交付分类" },
  { name: "生成文档", tool: "write_markdown", detail: "输出 notes-index.md" },
]

function GraphiteScene() {
  const [run, setRun] = useState<"idle" | "running" | "done">("idle")
  const [step, setStep] = useState(0)
  const [tab, setTab] = useState<"process" | "artifact">("process")
  const [feedback, setFeedback] = useState("")
  useEffect(() => {
    if (run !== "running") return
    const timer = window.setInterval(() => setStep((previous) => Math.min(previous + 1, 3)), 650)
    return () => window.clearInterval(timer)
  }, [run])
  useEffect(() => {
    if (step === 3 && run === "running") {
      // 完成后的状态由计时任务触发；切换主题或重置会清理定时器。
      const timer = window.setTimeout(() => setRun("done"), 0)
      return () => window.clearTimeout(timer)
    }
  }, [step, run])
  const markdown = `# 阅读摘录索引\n\n${sourceNotes.map((note) => `## ${note.topic}\n\n- ${note.content}`).join("\n\n")}\n`
  async function copyArtifact() {
    try { await navigator.clipboard.writeText(markdown); setFeedback("文档已复制") } catch { setFeedback("未能访问剪贴板，请选择文本复制") }
  }
  function start() { setStep(0); setRun("running"); setTab("process"); setFeedback("") }
  return (
    <>
      <header className={styles.sceneBar}><span className={styles.sceneBrand}><Layers2 size={17} /> Forge <small>WORKSPACE</small></span><span className={styles.localBadge}><i /> 本地演示</span></header>
      <div className={styles.agentLayout}>
        <aside className={styles.agentSidebar}>
          <span className={styles.smallLabel}>当前任务</span>
          <div className={styles.currentTask}><FileText size={14} /><span>阅读摘录索引<small>3 条摘录 · Markdown</small></span></div>
          <span className={styles.smallLabel}>输入材料</span>
          {sourceNotes.map((note, index) => <div className={styles.sourceNote} key={note.topic}><span>0{index + 1} / {note.topic}</span><p>{note.content}</p></div>)}
          <p className={styles.agentDisclaimer}>预设任务在浏览器内执行，<br />不调用 AI 服务。</p>
        </aside>
        <div className={styles.agentMain}>
          <div className={styles.agentHeading}><span className={styles.smallLabel}>TASK / 001</span><h3>把摘录整理成一份索引</h3><p>将左侧三条摘录按主题整理，生成可复制的 Markdown。</p></div>
          <div className={styles.runSummary}><span className={styles.runIcon}>{run === "done" ? <CheckCheck size={19} /> : <Terminal size={19} />}</span><div><strong>{run === "done" ? "索引已生成" : run === "running" ? "正在整理摘录" : "已准备好输入材料"}</strong><span>{run === "done" ? "3 个步骤完成 · 1 份产物" : run === "running" ? `${step} / 3 个步骤完成` : "运行一次，观察从输入到产物的过程"}</span></div><span className={styles.stateBadge} data-status={run === "done" ? "done" : run === "running" ? "active" : "idle"}>{run === "done" ? "完成" : run === "running" ? "执行中" : "就绪"}</span></div>
          <div className={styles.agentViewTabs}><button type="button" aria-pressed={tab === "process"} onClick={() => setTab("process")}>执行过程</button><button type="button" aria-pressed={tab === "artifact"} onClick={() => setTab("artifact")}>产物 <span>{run === "done" ? "1" : "0"}</span></button></div>
          {tab === "process" ? <div className={styles.steps}>{runSteps.map((item, index) => {
            const complete = step > index
            const active = run === "running" && step === index
            return <div className={styles.step} key={item.tool} data-complete={complete} data-active={active}><span className={styles.stepMark}>{complete ? <Check size={13} /> : active ? <LoaderCircle className={styles.spin} size={13} /> : <Circle size={11} />}</span><div><strong>{item.name}</strong><p>{item.detail}</p></div><code>{item.tool}</code></div>
          })}</div> : <div className={styles.artifact}>{run === "done" ? <><div><span><FileText size={12} /> notes-index.md</span><button type="button" onClick={copyArtifact}><ArrowDownToLine size={12} /> 复制</button></div><pre tabIndex={0}>{markdown}</pre></> : <div className={styles.pendingArtifact}><FileText size={22} /><p>运行任务后，产物会出现在这里。</p></div>}</div>}
          <footer className={styles.agentFooter}><span role="status">{feedback || (run === "done" ? "文档已就绪，切换「产物」即可查看。" : run === "running" ? "正在执行本地示例任务…" : "无需 API Key · 仅在此预览内运行")}</span><button type="button" className={styles.primaryButton} onClick={() => { if (run === "running") { setRun("idle"); setStep(0); setFeedback("已停止，可重新运行") } else start() }}>{run === "running" ? <><Square size={12} />停止</> : <>{run === "done" ? "重新运行" : "运行任务"}<ArrowRight size={13} /></>}</button></footer>
        </div>
      </div>
    </>
  )
}

type Task = { id: number; title: string; area: string; done: boolean; description: string }
const initialTasks: Task[] = [
  { id: 1, title: "梳理阅读空间的信息层级", area: "设计", done: true, description: "按书籍、章节与段落建立清晰的阅读顺序，减少重复的导航入口。" },
  { id: 2, title: "完善任务执行的状态反馈", area: "交互", done: false, description: "补齐就绪、执行、完成与停止状态，让每一次操作都有明确的回应。" },
  { id: 3, title: "统一界面与导出的设计变量", area: "开发", done: false, description: "预览与 CSS、JSON、Markdown 共用同一组设计变量，避免导出后发生偏差。" },
  { id: 4, title: "检查移动端的阅读与操作", area: "验收", done: false, description: "检查窄屏布局、文字可读性、触摸目标和键盘焦点。" },
]

function CobaltScene() {
  const [tasks, setTasks] = useState(initialTasks)
  const [filter, setFilter] = useState<"all" | "open" | "done">("all")
  const [selected, setSelected] = useState(2)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")
  const [notice, setNotice] = useState("")
  const inputId = useId()
  const done = tasks.filter((task) => task.done).length
  const visible = tasks.filter((task) => filter === "all" || (filter === "done" ? task.done : !task.done))
  const current = tasks.find((task) => task.id === selected)
  function toggle(id: number) { setTasks((previous) => previous.map((task) => task.id === id ? { ...task, done: !task.done } : task)); setNotice("任务状态已更新") }
  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft.trim()) return
    const id = Math.max(...tasks.map((task) => task.id)) + 1
    setTasks((previous) => [...previous, { id, title: draft.trim(), area: "待分类", done: false, description: "在预览中新增的本地任务。" }])
    setSelected(id); setDraft(""); setAdding(false); setFilter("all"); setNotice("任务已添加到当前预览")
  }
  return (
    <>
      <header className={styles.sceneBar}><span className={styles.sceneBrand}><Layers2 size={17} /> Atlas <small>PROJECTS</small></span><span className={styles.projectBreadcrumb}>工作空间 <ChevronRight size={12} /> 网站改版</span></header>
      <div className={styles.projectMain}>
        <div className={styles.projectHeading}><div><span className={styles.smallLabel}>PROJECT / 01</span><h3><span>每一个细节，</span><span>都有着落。</span></h3><p>网站改版 · 本地示例项目</p></div><button type="button" className={styles.primaryButton} onClick={() => setAdding(true)} disabled={adding}><Plus size={13} /> 添加任务</button></div>
        <div className={styles.projectStats}><div><span>全部任务</span><strong>{String(tasks.length).padStart(2, "0")}</strong><small>清晰拆解，逐一完成</small></div><div><span>进行中</span><strong>{String(tasks.length - done).padStart(2, "0")}<i /></strong><small>保持专注的工作节奏</small></div><div><span>完成进度</span><strong>{Math.round(done / tasks.length * 100)}<em>%</em></strong><div className={styles.progressTrack}><span style={{ width: `${done / tasks.length * 100}%` }} /></div></div></div>
        <div className={styles.projectTabs} aria-label="筛选任务">{([["all", "全部", tasks.length], ["open", "进行中", tasks.length - done], ["done", "已完成", done]] as const).map(([value, label, count]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<span>{count}</span></button>)}<span>任务 / 状态</span></div>
        {adding ? <form className={styles.addTask} onSubmit={addTask}><label className={styles.srOnly} htmlFor={inputId}>新任务名称</label><input id={inputId} autoFocus maxLength={48} placeholder="输入一个要完成的任务" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { setAdding(false); setDraft("") } }} /><button type="submit" className={styles.primaryButton} disabled={!draft.trim()}>添加</button><button type="button" className={styles.iconButton} aria-label="取消添加任务" onClick={() => { setAdding(false); setDraft("") }}><X size={14} /></button></form> : null}
        <div className={styles.taskList}>{visible.length ? visible.map((task) => <div className={styles.taskRow} key={task.id} data-selected={selected === task.id}><button type="button" className={styles.taskCheck} aria-label={`${task.done ? "重新打开" : "完成"}任务：${task.title}`} aria-pressed={task.done} onClick={() => toggle(task.id)}>{task.done ? <Check size={12} /> : <Circle size={12} />}</button><button type="button" className={styles.taskName} aria-pressed={selected === task.id} onClick={() => setSelected(task.id)}><code>UI-{String(task.id).padStart(2, "0")}</code><span>{task.title}</span></button><span className={styles.taskArea}>{task.area}</span><span className={styles.stateBadge} data-status={task.done ? "done" : "active"}>{task.done ? "已完成" : "进行中"}</span></div>) : <p className={styles.emptyTasks}>此分类下暂时没有任务。</p>}</div>
        {current ? <div className={styles.taskDetail}><span><FileText size={13} /> UI-{String(current.id).padStart(2, "0")} · {current.area}</span><p>{current.description}</p></div> : null}
        <footer className={styles.projectFooter}><span role="status">{notice || "点击任务查看详情，点击圆圈更新状态。"}</span><span>更改仅保留在当前预览</span></footer>
      </div>
    </>
  )
}

export function ThemeScene({ theme, compact = false }: { theme: LabTheme; compact?: boolean }) {
  return <div className={`${styles.scene} ${compact ? styles.compact : ""}`} style={themeStyle(theme)} data-ui-theme={theme.id}>
    {theme.id === "paper" ? <PaperScene /> : theme.id === "graphite" ? <GraphiteScene /> : <CobaltScene />}
  </div>
}
