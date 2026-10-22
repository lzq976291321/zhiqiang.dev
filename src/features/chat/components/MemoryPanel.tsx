"use client"

import { useEffect, useState } from "react"
import { Download, Trash2, X } from "lucide-react"
import styles from "./MemoryPanel.module.css"

interface Memory {
  id: string
  kind: string
  content: string
  createdAt: string
}

const KIND_LABEL: Record<string, string> = {
  preference: "偏好",
  event: "事情",
  person: "重要的人",
  ongoing: "进行中",
  boundary: "边界",
}

export function MemoryPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [state, setState] = useState<"idle" | "loading" | "error">("idle")
  const [busyId, setBusyId] = useState("")
  const [clearing, setClearing] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    setState("loading")
    fetch("/api/companion/memory", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("read")
        return response.json()
      })
      .then((payload) => {
        setMemories(Array.isArray(payload.memories) ? payload.memories : [])
        setState("idle")
      })
      .catch((error) => {
        if (error?.name !== "AbortError") setState("error")
      })
    return () => controller.abort()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose() }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  async function remove(id: string) {
    if (busyId) return
    setBusyId(id)
    try {
      const response = await fetch(`/api/companion/memory?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      if (!response.ok) throw new Error("delete")
      setMemories((current) => current.filter((memory) => memory.id !== id))
    } catch {
      setState("error")
    } finally {
      setBusyId("")
    }
  }

  async function clearAll() {
    if (clearing || !memories.length) return
    if (!window.confirm("清空所有记忆？之后 Mori 不会再记得这些事。")) return
    setClearing(true)
    try {
      const response = await fetch("/api/companion/memory?all=1", { method: "DELETE" })
      if (!response.ok) throw new Error("clear")
      setMemories([])
    } catch {
      setState("error")
    } finally {
      setClearing(false)
    }
  }

  async function exportJson() {
    if (exporting) return
    setExporting(true)
    try {
      // 面板只展示最近 60 条，导出单独取全量。
      const response = await fetch("/api/companion/memory?all=1", { cache: "no-store" })
      if (!response.ok) throw new Error("export")
      const payload = await response.json()
      const blob = new Blob([JSON.stringify(payload.memories ?? [], null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = "mori-memory.json"
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      setState("error")
    } finally {
      setExporting(false)
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="memory-title">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>MORI / 记忆</p>
            <h2 id="memory-title">TA 记得的</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.close} aria-label="关闭记忆面板"><X size={18} /></button>
        </header>
        <p className={styles.note}>这些是 Mori 从对话里记下的事。列表显示最近 60 条，导出包含全部。记错了，或者不想留，可以删掉。</p>

        {state === "loading" ? <p className={styles.status}>正在读取…</p> : null}
        {state === "error" ? <p className={styles.status} role="alert">暂时读不到记忆，请稍后再试。</p> : null}
        {state === "idle" && memories.length === 0 ? (
          <p className={styles.empty}>还没有记下什么。聊到你在意的事，Mori 会试着记住。</p>
        ) : null}

        <ul className={styles.list}>
          {memories.map((memory) => (
            <li key={memory.id}>
              <div>
                <span className={styles.kind}>{KIND_LABEL[memory.kind] ?? "记忆"}</span>
                <p>{memory.content}</p>
              </div>
              <button
                type="button"
                onClick={() => void remove(memory.id)}
                disabled={busyId === memory.id}
                className={styles.remove}
                aria-label={`删除记忆：${memory.content}`}
                title="删除这条记忆"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>

        <footer className={styles.footer}>
          <button type="button" onClick={() => void exportJson()} disabled={!memories.length || exporting} className={styles.action}>
            <Download size={15} />{exporting ? "导出中…" : "导出全部"}
          </button>
          <button type="button" onClick={() => void clearAll()} disabled={!memories.length || clearing} className={`${styles.action} ${styles.danger}`}>
            <Trash2 size={15} />{clearing ? "清空中…" : "全部清空"}
          </button>
        </footer>
      </section>
    </div>
  )
}
