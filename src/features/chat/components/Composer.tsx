"use client"

import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent } from "react"
import { ArrowUp, Keyboard as KeyboardIcon, ChevronDown, Square } from "lucide-react"
import styles from "./Composer.module.css"

export function Composer({ value, onChange, pending, started, onSend, onStop, disabled = false }: {
  value: string
  onChange: (value: string) => void
  pending: boolean
  started: boolean
  onSend: (question: string) => void
  onStop: () => void
  disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const composingRef = useRef(false)
  const blockPointerSubmitRef = useRef(false)
  const submittingRef = useRef(false)
  const showCount = value.length >= 1400

  useEffect(() => {
    if (!pending) submittingRef.current = false
  }, [pending, value])

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    function resizeInput() {
      if (!textarea) return
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const maximumHeight = Math.max(44, Math.min(150, viewportHeight * .28))
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, maximumHeight)}px`
    }

    resizeInput()
    window.addEventListener("resize", resizeInput)
    window.visualViewport?.addEventListener("resize", resizeInput)
    return () => {
      window.removeEventListener("resize", resizeInput)
      window.visualViewport?.removeEventListener("resize", resizeInput)
    }
  }, [value])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const blockedByComposition = composingRef.current || blockPointerSubmitRef.current
    blockPointerSubmitRef.current = false
    if (blockedByComposition || !value.trim() || pending || disabled || submittingRef.current) return

    submittingRef.current = true
    onSend(value)
    onChange("")
    textareaRef.current?.focus({ preventScroll: true })
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || composingRef.current || event.keyCode === 229) return
    // 手机键盘保留换行，桌面键盘支持 Enter 直接发送。
    if (window.matchMedia("(pointer: coarse)").matches) return
    event.preventDefault()
    submit()
  }

  function preserveInputFocus(event: PointerEvent<HTMLButtonElement>) {
    // 避免按钮先夺走焦点，导致键盘收起或输入法提前结束组合。
    event.preventDefault()
  }

  return (
    <form className={styles.composer} onSubmit={submit} aria-label="和 AI 聊聊" data-focused={focused || undefined}>
      <div className={styles.inputRow}>
        <label className="sr-only" htmlFor="conversation-input">你想说的话</label>
        <textarea
          id="conversation-input"
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onCompositionStart={() => { composingRef.current = true }}
          onCompositionEnd={() => { composingRef.current = false }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={1}
          maxLength={1600}
          placeholder={started ? "接着说…" : "想到什么，就说什么…"}
          enterKeyHint="enter"
          autoComplete="off"
          disabled={disabled}
          className={styles.input}
        />
        {pending ? (
          <button type="button" onPointerDown={preserveInputFocus} onClick={(event) => { event.preventDefault(); onStop() }} className={styles.send} aria-label="停止回答" title="停止回答">
            <Square size={15} fill="currentColor" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            onPointerDown={(event) => {
              blockPointerSubmitRef.current = composingRef.current
              preserveInputFocus(event)
            }}
            className={styles.send}
            aria-label="发送消息"
            title="发送消息"
          >
            <ArrowUp size={22} strokeWidth={2.2} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className={styles.composerBottom} data-has-count={showCount || undefined}>
        <span className={styles.inputHint}>Enter 发送 · Shift + Enter 换行</span>
        <button
          type="button"
          className={styles.keyboardDismiss}
          onPointerDown={preserveInputFocus}
          onClick={() => textareaRef.current?.blur()}
          aria-label="收起键盘"
        >
          <KeyboardIcon size={17} aria-hidden="true" />
          <span>收起键盘</span>
          <ChevronDown size={13} aria-hidden="true" />
        </button>
        {showCount && <span className={styles.count}>{value.length} / 1600</span>}
      </div>
    </form>
  )
}
