"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Copy, FlaskConical, FolderKanban, MessageSquare, PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react"
import { useConversation, type ConversationMessage } from "../lib/use-conversation"
import { MessageContent } from "./MessageContent"
import { Composer } from "./Composer"
import styles from "./ChatRoom.module.css"

const questions = [
  { category: "AI Agent", question: "Agent 的工具循环应该怎么设计？" },
  { category: "上下文工程", question: "怎样组织上下文才能减少理解偏差？" },
  { category: "工程实践", question: "视频编辑器的撤销重做怎么实现？" },
  { category: "技术判断", question: "什么时候值得接入 MCP？" },
]

function AnswerActions({ message }: { message: ConversationMessage }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setCopyError(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopyError(true)
    }
  }

  // 只展示有实际阅读地址的文章，同一个页面最多出现一次。
  const links = (message.sources ?? []).filter((source, index, sources) =>
    /^\/(?:agent|knowledge)\/[^/#?]+$/.test(source.path) && sources.findIndex((item) => item.path === source.path) === index
  ).slice(0, 2)

  return (
    <div className={styles.answerActions}>
      <button type="button" onClick={() => void copy()} className={styles.iconButton} aria-label={copied ? "已复制回答" : "复制回答"} title={copied ? "已复制" : "复制回答"}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      {copyError ? <span role="status">暂时无法复制，请选择文字复制。</span> : null}
      {links.map((source) => (
        <a href={source.path} key={source.path} target="_blank" rel="noopener noreferrer" className={styles.readingLink}>
          <BookOpen size={12} aria-hidden="true" /><span>{source.title}</span><ArrowUpRight size={12} aria-hidden="true" />
        </a>
      ))}
    </div>
  )
}

export function ChatRoom({ topic, question }: { topic?: string; question?: string }) {
  const { messages, pending, error, send, retry, reset, stop } = useConversation()
  const viewportRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const followRef = useRef(true)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [prefillDismissed, setPrefillDismissed] = useState(false)
  const initialTopic = prefillDismissed ? undefined : topic
  const initialQuestion = prefillDismissed ? undefined : question
  const started = messages.length > 0
  const userMessages = messages.filter((message) => message.role === "user")

  useEffect(() => {
    if (followRef.current) viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight })
  }, [messages, pending])

  useEffect(() => {
    if (!menuOpen) return
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onEscape)
    return () => window.removeEventListener("keydown", onEscape)
  }, [menuOpen])

  function onScroll() {
    const viewport = viewportRef.current
    if (!viewport) return
    const atBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 96
    followRef.current = atBottom
    setShowScrollDown(!atBottom)
  }

  function ask(question: string) {
    followRef.current = true
    setShowScrollDown(false)
    setMenuOpen(false)
    void send(question)
  }

  function startNew() {
    reset()
    setPrefillDismissed(true)
    followRef.current = true
    setShowScrollDown(false)
    setMenuOpen(false)
  }

  function jumpToMessage(id: string) {
    followRef.current = false
    document.getElementById(`message-${id}`)?.scrollIntoView({ block: "start" })
    setMenuOpen(false)
  }

  return (
    <main className={styles.room}>
      {menuOpen ? <button type="button" className={styles.backdrop} onClick={() => setMenuOpen(false)} aria-label="关闭导航" /> : null}
      <aside id="chat-sidebar" className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`} aria-label="对话导航">
        <div className={styles.sidebarTop}>
          <Link href="/" className={styles.brand} aria-label="zhiqiang 首页"><span className={styles.brandMark}>z.</span><span>zhiqiang<span className={styles.brandDot}>.</span></span></Link>
          <button type="button" className={styles.closeMenu} onClick={() => { setMenuOpen(false); menuButtonRef.current?.focus() }} aria-label="收起导航"><PanelLeftClose size={18} /></button>
        </div>
        <button type="button" onClick={startNew} disabled={!started || pending} className={styles.newChat}><Plus size={16} aria-hidden="true" />新对话</button>
        <nav className={styles.projectNav} aria-label="作品导航">
          <Link href="/chat" className={styles.activeNav} aria-current="page" onClick={(event) => { event.preventDefault(); setMenuOpen(false) }}><MessageSquare size={16} aria-hidden="true" />知识对话</Link>
          <Link href="/knowledge"><BookOpen size={16} aria-hidden="true" />知识库<ArrowUpRight size={12} className={styles.navArrow} aria-hidden="true" /></Link>
          <Link href="/lab"><FlaskConical size={16} aria-hidden="true" />UI Lab<ArrowUpRight size={12} className={styles.navArrow} aria-hidden="true" /></Link>
          <Link href="/projects"><FolderKanban size={16} aria-hidden="true" />作品<ArrowUpRight size={12} className={styles.navArrow} aria-hidden="true" /></Link>
        </nav>
        <div className={styles.conversationIndex}>
          <p className={styles.sidebarLabel}>本次对话{started ? <span>{userMessages.length}</span> : null}</p>
          {started ? (
            <nav aria-label="本次对话的问题" className={styles.history}>
              {userMessages.map((message, index) => <button key={message.id} type="button" onClick={() => jumpToMessage(message.id)} title={message.content}><span>{String(index + 1).padStart(2, "0")}</span><span>{message.content}</span></button>)}
            </nav>
          ) : <p className={styles.historyEmpty}>从右侧开始提问，<br />在这里回看讨论过的问题。</p>}
        </div>
        <div className={styles.sidebarFooter}><span className={styles.profileAvatar}>Z</span><div><strong>志强</strong><span>独立开发者</span></div><Link href="/projects" aria-label="查看志强的作品"><ArrowUpRight size={16} /></Link></div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <button ref={menuButtonRef} type="button" className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)} aria-label="展开导航" aria-expanded={menuOpen} aria-controls="chat-sidebar"><PanelLeftOpen size={18} /></button>
            <h1>知识对话</h1><span className={styles.headerDivider}>/</span><span className={styles.headerSubtitle}>{started ? "继续讨论" : "新对话"}</span>
          </div>
          <Link href="/knowledge" className={styles.headerLink}><BookOpen size={14} aria-hidden="true" /><span>阅读知识库</span><ArrowUpRight size={12} aria-hidden="true" /></Link>
        </header>

        {!started ? (
          <div className={styles.empty}>
            <div className={styles.welcome}>
              <div className={styles.intro}>
                <div className={styles.welcomeMark} aria-hidden="true"><span /><span /><span /><span /></div>
                <p className={styles.eyebrow}>一起拆解一个具体问题</p>
                <h2>你想从哪里开始？</h2>
                <p className={styles.invitation}>{initialTopic ? `正在讨论：${initialTopic}` : "关于 Agent、产品设计和工程实现，把思路和细节聊清楚。"}</p>
              </div>
              <Composer key={initialQuestion ?? initialTopic ?? "empty"} initialValue={initialQuestion ?? (initialTopic ? `关于「${initialTopic}」，` : "")} pending={pending} started={false} onSend={ask} onStop={stop} />
              <div className={styles.starterHeader}><span>也可以聊聊这些</span><span>01 — 04</span></div>
              <div className={styles.starters} aria-label="从一个问题开始">
                {questions.map(({ category, question }) => (
                  <button key={question} type="button" onClick={() => ask(question)} className={styles.starter}><span className={styles.starterCategory}>{category}</span><span className={styles.starterQuestion}>{question}</span><ArrowRight size={14} aria-hidden="true" /></button>
                ))}
              </div>
              <p className={styles.welcomeFootnote}><BookOpen size={12} aria-hidden="true" />从公开知识出发，也欢迎继续追问实现细节。</p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.viewport} ref={viewportRef} onScroll={onScroll}>
              <div className={styles.transcript} role="log" aria-label="访谈记录" aria-live="polite" aria-relevant="additions text">
                {messages.map((message) => (
                  message.role === "user" ? (
                    <div id={`message-${message.id}`} key={message.id} className={styles.userMessage}><span className="sr-only">你：</span><p>{message.content}</p></div>
                  ) : (
                    <article key={message.id} className={styles.answer} aria-label="志强的回答" aria-busy={message.status === "streaming"}>
                      <span className={styles.answerMark} aria-hidden="true">z.</span>
                      <div className={styles.answerBody}>
                        <div className={styles.answerByline}>志强<span>{message.status === "streaming" ? "正在回答" : "知识对话"}</span></div>
                        {message.content ? <MessageContent content={message.content} /> : null}
                        {message.status === "streaming" && !message.content ? <div className={styles.thinking} role="status"><span className={styles.pixelLoader} aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</span><span>正在整理回答</span></div> : null}
                        {message.status === "stopped" ? <p className={styles.messageNote}>已停止回答</p> : null}
                        {message.status === "error" ? <p className={styles.messageNote}>{message.content ? "回答中断，以上内容可能不完整。" : "这次没能完成回答。"}</p> : null}
                        {message.content && message.status !== "streaming" ? <AnswerActions message={message} /> : null}
                      </div>
                    </article>
                  )
                ))}
              </div>
            </div>
            <div className={styles.composerDock}>
              {showScrollDown ? <button type="button" className={styles.scrollDown} aria-label="查看最新回答" onClick={() => { followRef.current = true; viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight }); setShowScrollDown(false) }}><ArrowDown size={16} /></button> : null}
              {error ? <div className={styles.error} role="alert"><span>{error}</span><button type="button" onClick={retry} disabled={pending}>重试</button></div> : null}
              <Composer pending={pending} started onSend={ask} onStop={stop} />
              <p className={styles.dockHint}>回答中的知识来源可以打开，接着读。</p>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
