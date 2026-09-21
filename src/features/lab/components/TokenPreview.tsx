"use client"

import { useState } from "react"
import { labThemes } from "../lib/themes"
import { ThemeScene } from "./ThemeScene"
import styles from "./LabGallery.module.css"

export function TokenPreview({ compact = false }: { compact?: boolean }) {
  const [activeId, setActiveId] = useState(labThemes[0].id)
  const theme = labThemes.find((item) => item.id === activeId) ?? labThemes[0]
  return <div className={styles.miniPreview}>
    <ThemeScene key={theme.id} theme={theme} compact={compact} />
    <div className={styles.miniThemes} aria-label="选择预览主题">{labThemes.map((item) => <button type="button" key={item.id} aria-pressed={item.id === activeId} onClick={() => setActiveId(item.id)}><i style={{ background: item.tokens.accent }} />{item.name}</button>)}<span>可交互</span></div>
  </div>
}
