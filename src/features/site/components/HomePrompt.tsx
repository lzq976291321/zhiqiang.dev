"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, CornerDownLeft, Sparkles } from "lucide-react"
import styles from "./Home.module.css"

const questions = ["怎样设计一个对话 Agent？", "一个人做产品，如何确定第一版？", "怎样让 AI 的结果可以验证？"]

export function HomePrompt() {
  const [question, setQuestion] = useState("")
  const composingRef = useRef(false)
  const router = useRouter()
  function start(value: string) {
    const topic = value.trim()
    if (topic) router.push(`/chat?question=${encodeURIComponent(topic)}`)
  }
  return (
    <div className={styles.promptArea}>
      <div className={styles.promptIcon}><Sparkles size={21} strokeWidth={1.5} /></div>
      <h2>从一个具体的问题开始。</h2>
      <p>聊聊 Agent、软件工程，或一个还没落地的想法。</p>
      <form className={styles.prompt} onSubmit={(event) => { event.preventDefault(); if (!composingRef.current) start(question) }}>
        <label className={styles.srOnly} htmlFor="home-question">你想聊什么</label>
        <input
          id="home-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onCompositionStart={() => { composingRef.current = true }}
          onCompositionEnd={() => { composingRef.current = false }}
          onKeyDown={(event) => {
            // 确认中文候选词时阻止表单提交，兼容 Safari 的输入法事件。
            if (event.key === "Enter" && (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
          }}
          placeholder="如果让你设计一个 AI 工作台……"
          maxLength={1000}
          autoComplete="off"
        />
        <div className={styles.promptBottom}>
          <span><span className={styles.statusDot} /> 知识与工程实践</span>
          <button type="submit" aria-label="开始对话" disabled={!question.trim()}><ArrowUp size={17} /></button>
        </div>
      </form>
      <div className={styles.suggestions} aria-label="试试这些问题">
        {questions.map((item) => <button key={item} onClick={() => start(item)}>{item}<CornerDownLeft size={12} /></button>)}
      </div>
    </div>
  )
}
