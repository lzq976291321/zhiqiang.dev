"use client"

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { ArrowUp, Square } from "lucide-react"
import styles from "./ChatRoom.module.css"

export function Composer({ pending, started, onSend, onStop, initialValue = "" }: {
  initialValue?: string
  pending: boolean
  started: boolean
  onSend: (question: string) => void
  onStop: () => void
}) {
  const [input, setInput] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const composingRef = useRef(false)

  useEffect(() => {
    if (started) textareaRef.current?.focus({ preventScroll: true })
  }, [started])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 168)}px`
  }, [input])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!input.trim() || pending) return
    onSend(input)
    setInput("")
    textareaRef.current?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && !composingRef.current && event.keyCode !== 229) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.composer} onSubmit={submit} aria-label="和志强聊聊">
      <label className="sr-only" htmlFor="conversation-input">你的问题</label>
      <textarea
        id="conversation-input"
        ref={textareaRef}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={onKeyDown}
        onCompositionStart={() => { composingRef.current = true }}
        onCompositionEnd={() => { composingRef.current = false }}
        rows={2}
        maxLength={1600}
        placeholder={started ? "继续追问这个问题…" : "你想理解哪个问题？"}
        enterKeyHint="send"
        autoComplete="off"
        className={styles.input}
      />
      <div className={styles.composerBottom}>
        <span className={styles.inputHint}>{input.length >= 1400 ? `${input.length} / 1600` : "Enter 发送 · Shift + Enter 换行"}</span>
        {pending ? (
          <button type="button" onClick={onStop} className={styles.send} aria-label="停止回答" title="停止回答">
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button type="submit" disabled={!input.trim()} className={styles.send} aria-label="发送问题" title="发送问题">
            <ArrowUp size={21} strokeWidth={2} />
          </button>
        )}
      </div>
    </form>
  )
}
