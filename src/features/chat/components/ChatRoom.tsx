"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, Copy, FlaskConical, FolderKanban, Heart, MessageSquare, Menu, Plus, SquarePen, X } from "lucide-react"
import { useConversation, type ConversationMessage } from "../lib/use-conversation"
import { useChatScroll } from "../lib/use-chat-scroll"
import { useChatViewport } from "../lib/use-chat-viewport"
import { MessageContent } from "./MessageContent"
import { Composer } from "./Composer"
import { MemoryPanel } from "./MemoryPanel"
import styles from "./ChatRoom.module.css"

const questions = [
  { category: "先说说", question: "今天有点累，先别给建议，陪我待一会儿。" },
  { category: "小事也行", question: "有件小事想说说，但你不用替我解决。" },
  { category: "随便聊聊", question: "如果星期一是一种动物，它会是什么？" },
  { category: "认真一点", question: "我最近总在想一个问题，想听听你的看法。" },
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

export function ChatRoom({ question, signedIn, authEnabled }: { question?: string; signedIn: boolean; authEnabled: boolean }) {
  const { messages, pending, error, send, retry, reset, stop, draft, setDraft, ready } = useConversation({
    initialDraft: question,
  })
  const roomRef = useChatViewport()
  const { viewportRef, contentRef, away, toLatest, jumpToMessage: scrollToMessage, onScroll, markUserScroll } = useChatScroll(ready, messages[0]?.id)
  const menuRef = useRef<HTMLDialogElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const retryError = error || (messages.at(-1)?.status === "error" ? "上次回答未完成，可以重试。" : "")
  const started = messages.length > 0
  const userMessages = messages.filter((message) => message.role === "user")

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)")
    const closeOnDesktop = () => { if (desktop.matches) menuRef.current?.close() }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!ready || !question) return
    // 预填用过即从地址移除；刷新时恢复用户实际留下的草稿。
    window.history.replaceState(null, "", "/chat")
  }, [ready, question])

  function openMenu() {
    // 先收起输入键盘，避免导航出现时只剩很小的可用区域。
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    returnFocusRef.current = true
    menuRef.current?.showModal()
    setMenuOpen(true)
  }

  function closeMenu(returnFocus = true) {
    returnFocusRef.current = returnFocus
    menuRef.current?.close()
  }

  function ask(text: string): boolean {
    if (!ready || pending || !text.trim()) return false
    // 前 2 轮匿名用来体验人格；第 3 轮前登录，草稿由会话存储保留。
    if (authEnabled && !signedIn && userMessages.length >= 2) {
      setLoginOpen(true)
      return false
    }
    toLatest()
    setDraft("")
    void send(text)
    return true
  }

  function startNew() {
    if (pending || !ready) return
    reset()
    toLatest()
    closeMenu()
  }

  function jumpToMessage(id: string) {
    closeMenu(false)
    // 等原生弹层归还焦点后，再定位到所选消息。
    requestAnimationFrame(() => scrollToMessage(id))
  }

  const conversationIndex = (
    <div className={styles.conversationIndex}>
      <p className={styles.sidebarLabel}>本次对话{started ? <span>{userMessages.length}</span> : null}</p>
      {started ? (
        <nav aria-label="本次对话的话题" className={styles.history}>
          {userMessages.map((message, index) => <button key={message.id} type="button" onClick={() => jumpToMessage(message.id)} title={message.content}><span>{String(index + 1).padStart(2, "0")}</span><span>{message.content}</span></button>)}
        </nav>
      ) : <p className={styles.historyEmpty}>聊过的话题会出现在这里，<br />点一下就能回到那条消息。</p>}
    </div>
  )

  const projectNav = (
    <nav className={styles.projectNav} aria-label="网站导航">
      <Link href="/knowledge" onClick={() => closeMenu(false)}><BookOpen size={18} aria-hidden="true" /><span>阅读空间</span><ArrowUpRight size={14} aria-hidden="true" /></Link>
      <Link href="/lab" onClick={() => closeMenu(false)}><FlaskConical size={18} aria-hidden="true" /><span>工具</span><ArrowUpRight size={14} aria-hidden="true" /></Link>
      <Link href="/projects" onClick={() => closeMenu(false)}><FolderKanban size={18} aria-hidden="true" /><span>作品</span><ArrowUpRight size={14} aria-hidden="true" /></Link>
    </nav>
  )

  return (
    <main className={styles.room} ref={roomRef}>
      <aside className={styles.sidebar} aria-label="对话导航">
        <Link href="/" className={styles.brand} aria-label="zhiqiang 首页"><span className={styles.brandMark}>z.</span><span>zhiqiang<span className={styles.brandDot}>.</span></span></Link>
        <button type="button" onClick={startNew} disabled={!started || pending || !ready} className={styles.newChat}><Plus size={18} aria-hidden="true" />新对话</button>
        {conversationIndex}
        {signedIn ? <button type="button" className={styles.memoryLink} onClick={() => setMemoryOpen(true)}><Heart size={16} aria-hidden="true" /><span>TA 记得的</span></button> : null}
        {projectNav}
        <p className={styles.sessionHint}>本次对话只保存在这个标签页</p>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.header}>
          <button ref={menuButtonRef} type="button" className={styles.menuToggle} onClick={openMenu} aria-label="打开对话导航" aria-expanded={menuOpen} aria-controls="chat-navigation"><Menu size={21} /></button>
          <div className={styles.headerTitle}><h1>Mori</h1><span>陪伴</span></div>
          <Link href="/knowledge" className={styles.headerLink}><BookOpen size={16} aria-hidden="true" />阅读空间<ArrowUpRight size={13} aria-hidden="true" /></Link>
          <button type="button" className={styles.mobileNewChat} onClick={startNew} disabled={!started || pending || !ready} aria-label="新对话" title="新对话"><SquarePen size={21} /></button>
        </header>

        <div className={styles.viewport} ref={viewportRef} onScroll={onScroll} onWheel={markUserScroll} onTouchMove={markUserScroll} onPointerDown={markUserScroll} onKeyDown={markUserScroll} tabIndex={0} role="region" aria-label="消息列表">
          <div ref={contentRef} className={!started ? styles.empty : undefined}>
            {!started ? (
              <div className={styles.welcome}>
                <div className={styles.welcomeMark} aria-hidden="true"><span /><span /><span /><span /></div>
                <h2>今天过得怎么样？</h2>
                <p className={styles.invitation}>想说说，还是先安静待一会儿。</p>
                <div className={styles.starters} aria-label="从一个话题开始">
                  {questions.map(({ category, question: starter }) => (
                    <button key={starter} type="button" disabled={!ready} onClick={() => ask(starter)} className={styles.starter}><span className={styles.starterCategory}>{category}</span><span className={styles.starterQuestion}>{starter}</span><ArrowRight size={16} aria-hidden="true" /></button>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.transcript} role="log" aria-label="聊天记录" aria-live="polite" aria-relevant="additions text">
                {messages.map((message) => (
                  message.role === "user" ? (
                    <div id={`message-${message.id}`} tabIndex={-1} key={message.id} className={styles.userMessage}><span className="sr-only">你：</span><p>{message.content}</p></div>
                  ) : (
                    <article key={message.id} className={styles.answer} aria-label="Mori 的回复" aria-busy={message.status === "streaming"}>
                      <div className={styles.answerByline}><MessageSquare size={15} aria-hidden="true" />Mori{message.status === "streaming" ? <span>正在回复</span> : null}</div>
                      {message.content ? <MessageContent content={message.content} /> : null}
                      {message.status === "streaming" && !message.content ? <div className={styles.thinking} role="status"><span className={styles.pixelLoader} aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</span><span>稍等一下</span></div> : null}
                      {message.status === "stopped" ? <p className={styles.messageNote}>已停止回答</p> : null}
                      {message.status === "error" ? <p className={styles.messageNote}>{message.content ? "回答中断，以上内容可能不完整。" : "这次没能完成回答。"}</p> : null}
                      {message.content && message.status !== "streaming" ? <AnswerActions message={message} /> : null}
                    </article>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.composerDock}>
          {away ? <button type="button" className={styles.scrollDown} onPointerDown={(event) => event.preventDefault()} onClick={toLatest}><ArrowDown size={16} aria-hidden="true" /><span>{pending ? "查看新回复" : "回到最新"}</span></button> : null}
          {retryError ? <div className={styles.error} role="alert"><span>{retryError}</span><button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => { toLatest(); retry() }} disabled={pending}>重试</button></div> : null}
          <Composer value={draft} onChange={setDraft} pending={pending} started={started} onSend={ask} onStop={stop} disabled={!ready} />
        </div>
      </div>

      <dialog id="chat-navigation" ref={menuRef} className={styles.sheet} aria-labelledby="chat-navigation-title" onClick={(event) => { if (event.target === event.currentTarget) closeMenu() }} onClose={() => {
        setMenuOpen(false)
        if (returnFocusRef.current && window.matchMedia("(max-width: 760px)").matches) menuButtonRef.current?.focus({ preventScroll: true })
      }}>
        <div className={styles.sheetContent}>
          <div className={styles.sheetHandle} aria-hidden="true" />
          <div className={styles.sheetHeader}><h2 id="chat-navigation-title">对话导航</h2><button type="button" onClick={() => closeMenu()} aria-label="收起导航"><X size={20} /></button></div>
          {conversationIndex}
          <div className={styles.sheetFooter}>
            <button type="button" onClick={startNew} disabled={!started || pending || !ready} className={styles.newChat}><Plus size={18} aria-hidden="true" />新对话</button>
            {signedIn ? <button type="button" className={styles.memoryLink} onClick={() => { closeMenu(false); setMemoryOpen(true) }}><Heart size={16} aria-hidden="true" /><span>TA 记得的</span></button> : null}
            {projectNav}
            <p className={styles.sessionHint}>本次对话只保存在这个标签页</p>
          </div>
        </div>
      </dialog>

      {loginOpen ? (
        <div className={styles.loginGate} role="dialog" aria-modal="true" aria-labelledby="login-gate-title">
          <div className={styles.loginCard}>
            <p className={styles.loginEyebrow}>MORI / 继续聊</p>
            <h2 id="login-gate-title">先登录，再继续</h2>
            <p>登录后可以继续聊。刚才的草稿还在，Mori 也会记住你说过的事。</p>
            <div className={styles.loginActions}>
              <Link href="/login?next=/chat">用邮箱登录</Link>
              <button type="button" onClick={() => setLoginOpen(false)}>再想想</button>
            </div>
          </div>
        </div>
      ) : null}

      <MemoryPanel open={memoryOpen} onClose={() => setMemoryOpen(false)} />
    </main>
  )
}
