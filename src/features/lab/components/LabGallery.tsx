"use client"

import { useState } from "react"
import { ArrowDownToLine, ArrowUpRight, Check, Copy, Palette, RotateCcw } from "lucide-react"
import { labThemes, themeCSS, themeJSON, themeMarkdown, tokenDefinitions, type LabTheme, type TokenGroup, type TokenName } from "../lib/themes"
import { ThemeScene } from "./ThemeScene"
import styles from "./LabGallery.module.css"

type Format = "inspect" | "css" | "json" | "markdown"
const formats: [Format, string][] = [["inspect", "设计变量"], ["css", "CSS"], ["json", "JSON"], ["markdown", "Markdown"]]
const groups: [TokenGroup, string][] = [["colors", "颜色"], ["type", "排版"], ["layout", "间距与形状"]]

function TokenInspector({ theme, group }: { theme: LabTheme; group: TokenGroup }) {
  const entries = (Object.entries(theme.tokens) as [TokenName, string][]).filter(([key]) => tokenDefinitions[key][1] === group)
  return <dl className={`${styles.tokens} ${group === "colors" ? styles.colorTokens : styles.detailTokens}`}>
    {entries.map(([key, value]) => <div key={key}>
      {group === "colors" ? <span className={styles.colorChip} style={{ background: value }} aria-hidden="true" /> : <span className={styles.tokenMark} aria-hidden="true">{group === "type" ? "Aa" : key.startsWith("radius") ? "╭" : key.startsWith("shadow") ? "▧" : "↔"}</span>}
      <dt>{tokenDefinitions[key][0]}<small>--lab-{key}</small></dt><dd title={value}>{value}</dd>
    </div>)}
  </dl>
}

export function LabGallery() {
  const [activeId, setActiveId] = useState(labThemes[0].id)
  const [revision, setRevision] = useState(0)
  const [format, setFormat] = useState<Format>("inspect")
  const [group, setGroup] = useState<TokenGroup>("colors")
  const [feedback, setFeedback] = useState("")
  const theme = labThemes.find((item) => item.id === activeId) ?? labThemes[0]
  const exportFormat = format === "inspect" ? "css" : format
  const code = exportFormat === "css" ? themeCSS(theme) : exportFormat === "json" ? themeJSON(theme) : themeMarkdown(theme)
  const fileName = exportFormat === "css" ? `${theme.id}.css` : exportFormat === "json" ? `${theme.id}.tokens.json` : "design-tokens.md"
  async function copy() {
    try { await navigator.clipboard.writeText(code); setFeedback(`${fileName} 已复制`) }
    catch { setFormat(exportFormat); setFeedback("未能访问剪贴板，请在下方选择代码手动复制。") }
  }
  function download() {
    const mime = exportFormat === "json" ? "application/json" : exportFormat === "css" ? "text/css" : "text/markdown"
    const url = URL.createObjectURL(new Blob([code], { type: `${mime};charset=utf-8` }))
    const anchor = document.createElement("a")
    anchor.href = url; anchor.download = fileName; anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setFeedback(`已导出 ${fileName}`)
  }
  return (
    <div className={styles.gallery}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <span className={styles.sideLabel}><Palette size={13} /> 三种设计语言</span>
          <div className={styles.themeList} aria-label="选择界面主题">
            {labThemes.map((item, index) => <button type="button" key={item.id} className={styles.themeChoice} aria-pressed={theme.id === item.id} onClick={() => { setActiveId(item.id); setFeedback("") }}>
              <span className={styles.themeSwatches} aria-hidden="true">{[item.tokens.background, item.tokens.surface, item.tokens.foreground, item.tokens.accent].map((color, colorIndex) => <i key={colorIndex} style={{ background: color }} />)}</span>
              <span className={styles.themeName}><span>{item.name}<small>{item.chineseName}</small></span>{theme.id === item.id ? <Check size={13} /> : <em>0{index + 1}</em>}</span>
              <span className={styles.themeScene}>{item.scene}</span>
            </button>)}
          </div>
          <div className={styles.sidebarNote}><span>从体验，到变量。</span><p>在场景里体验设计，再把同一套颜色、排版与空间带进自己的项目。</p></div>
          <a className={styles.collectionLink} href="/ui-gallery/index.html">界面灵感收藏 <ArrowUpRight size={12} /></a>
        </div>
      </aside>
      <div className={styles.workArea}>
        <header className={styles.themeHeader}><div><span className={styles.themeIndex}>0{labThemes.findIndex((item) => item.id === theme.id) + 1} / 03</span><h2>{theme.name}<span>{theme.chineseName} · {theme.scene}</span></h2><p>{theme.description}</p></div></header>
        <div className={styles.previewToolbar}><span><i /> 可交互预览 <small>示例内容</small></span><button type="button" onClick={() => { setRevision((value) => value + 1); setFeedback("预览已重置") }}><RotateCcw size={12} /> 重置</button></div>
        <ThemeScene key={`${theme.id}-${revision}`} theme={theme} />
        <div className={styles.principles}>{theme.principles.map((item, index) => <span key={item}><i>0{index + 1}</i>{item}</span>)}</div>
        <section className={styles.tokenSection} aria-label={`${theme.name} 设计变量`}>
          <div className={styles.tokenHeading}><div><h3>Design tokens <span>{Object.keys(theme.tokens).length}</span></h3><p>预览与导出共用同一份变量。切换主题，这里也会同步。</p></div><span className={styles.themeTag}>{theme.name}</span></div>
          <div className={styles.tokenToolbar}>
            <div className={styles.formatTabs} aria-label="设计变量格式">{formats.map(([value, label]) => <button type="button" key={value} aria-pressed={format === value} onClick={() => { setFormat(value); setFeedback("") }}>{label}</button>)}</div>
            <div className={styles.exportActions}><button type="button" onClick={copy}>{feedback.endsWith("已复制") ? <Check size={12} /> : <Copy size={12} />} 复制{format === "inspect" ? " CSS" : ""}</button><button type="button" onClick={download}><ArrowDownToLine size={12} /> 导出{format === "inspect" ? " CSS" : ""}</button></div>
          </div>
          {format === "inspect" ? <div className={styles.inspector}>
            <div className={styles.groupTabs} aria-label="设计变量分类">{groups.map(([value, label]) => <button type="button" key={value} aria-pressed={group === value} onClick={() => setGroup(value)}>{label}</button>)}</div>
            <TokenInspector theme={theme} group={group} />
          </div> : <div className={styles.codeView}><div><span>{fileName}</span><span>与当前预览同步</span></div><pre tabIndex={0} aria-label={`${theme.name} ${exportFormat} 设计变量`}><code>{code}</code></pre></div>}
          <div className={styles.exportFooter}><span>CSS 用于样式 · JSON 用于集成 · Markdown 用于设计说明</span><span role="status" aria-live="polite">{feedback}</span></div>
        </section>
      </div>
    </div>
  )
}
