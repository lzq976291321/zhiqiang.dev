"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUp, CornerDownLeft, Sparkles } from "lucide-react"
import styles from "./Home.module.css"

const questions = ["今天有点烦，先别给建议。", "如果星期一是一种动物？", "人一定要一直追求进步吗？"]

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
      <h2>来，聊两句。</h2>
      <p>今天的小事，突然的脑洞，或者一个想不通的问题。</p>
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
          placeholder="我刚才突然想到……"
          maxLength={1000}
          autoComplete="off"
        />
        <div className={styles.promptBottom}>
          <span><span className={styles.statusDot} /> AI 对话</span>
          <button type="submit" aria-label="开始对话" disabled={!question.trim()}><ArrowUp size={17} /></button>
        </div>
      </form>
      <div className={styles.suggestions} aria-label="试试这些话题">
        {questions.map((item) => <button key={item} onClick={() => start(item)}>{item}<CornerDownLeft size={12} /></button>)}
      </div>
    </div>
  )
}
