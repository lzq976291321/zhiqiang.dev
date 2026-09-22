"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, Download, Grid2X2, Link2, Maximize2, Minus, Pause, Play, Plus, Redo2, RotateCcw, Save, Trash2, Undo2, Video, X } from "lucide-react"
import { MODES, TEMPLATES, settingsForMode } from "../data/presets"
import { DEFAULT_SETTINGS, formatTime, sanitizeSettings, shareUrl, type BannerEffect, type BannerMotion, type BannerSettings } from "../lib/settings"
import { useBannerSettings } from "../lib/use-banner-settings"
import { usePresentation } from "../lib/use-presentation"
import { canvasToPng, supportedVideoType } from "../lib/export"
import { downloadBlob } from "@/lib/media-save"
import { useMediaSave } from "@/components/media/use-media-save"
import { BannerCanvas } from "./BannerCanvas"
import styles from "./LedBanner.module.css"

const EFFECTS: { id: BannerEffect; label: string }[] = [
  { id: "clean", label: "简约" }, { id: "led", label: "LED 点阵" }, { id: "neon", label: "霓虹" },
  { id: "rainbow", label: "彩虹" }, { id: "digital", label: "数码" }, { id: "glow", label: "柔光" }, { id: "glowstick", label: "荧光棒" },
]
const MOTIONS: { id: BannerMotion; label: string }[] = [
  { id: "left", label: "← 向左" }, { id: "right", label: "向右 →" }, { id: "up", label: "↑ 向上" },
  { id: "down", label: "↓ 向下" }, { id: "bounce", label: "往返" }, { id: "pulse", label: "呼吸" }, { id: "still", label: "静止" },
]
const COLORS = ["#c6ff36", "#ffffff", "#ff68bf", "#5de7e0", "#ffbd4a", "#a78bfa"]

function Range({ label, value, min, max, onChange, suffix = "" }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void; suffix?: string }) {
  return <label className={styles.range}><span>{label}<output>{value}{suffix}</output></span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <label className={styles.toggle}><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>
}

function Detail({ title, children }: { title: string; children: ReactNode }) {
  return <details className={styles.detail}><summary>{title}<ChevronDown size={14} /></summary><div className={`${styles.detailContent} animate-in fade-in slide-in-from-top-1 duration-300 ease-[cubic-bezier(.22,1,.36,1)] fill-mode-none`}>{children}</div></details>
}

function SlidingPanel({ open, children }: { open: boolean; children: ReactNode }) {
  return <div className={styles.panelDisclosure} data-open={open} inert={!open} aria-hidden={!open}><div className={styles.panelClip}><section className={`${styles.savePanel} ${open ? "animate-in fade-in slide-in-from-top-2 duration-300 ease-[cubic-bezier(.22,1,.36,1)] fill-mode-none" : ""}`}>{children}</section></div></div>
}

export function LedBanner() {
  const { settings, update, ready, designs, saveDesign, deleteDesign, storageError, travel, canUndo, canRedo } = useBannerSettings()
  const [playing, setPlaying] = useState(true)
  const [motionOverride, setMotionOverride] = useState(false)
  const [message, setMessage] = useState("")
  const [saveOpen, setSaveOpen] = useState(false)
  const [designName, setDesignName] = useState("")
  const [shareFallback, setShareFallback] = useState("")
  const [videoSupported, setVideoSupported] = useState(false)
  const [recording, setRecording] = useState(false)
  const [exportingImage, setExportingImage] = useState(false)
  const { saveMedia, mediaSaveDialog } = useMediaSave()
  const [scores, setScores] = useState({ a: 0, b: 0, period: 1 })
  const scoreHistory = useRef<typeof scores[]>([])
  const [timer, setTimer] = useState<{ remaining: number | null; deadline: number | null }>({ remaining: null, deadline: null })
  const [now, setNow] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)
  const modeBarRef = useRef<HTMLElement>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  const report = useCallback((text: string) => {
    setMessage(text)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setMessage(""), 4500)
  }, [])
  const { presenting, open, close } = usePresentation(displayRef, report)
  const remaining = timer.deadline === null ? timer.remaining ?? settings.duration : Math.max(0, Math.ceil((timer.deadline - now) / 1000))
  const live = useMemo(() => ({ countdown: remaining, scoreA: scores.a, scoreB: scores.b, period: scores.period }), [remaining, scores])
  const isTimed = settings.mode === "countdown" || settings.mode === "scoreboard"
  const active = isTimed ? timer.deadline !== null : playing

  useEffect(() => {
    const bar = modeBarRef.current
    const selected = bar?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')
    if (!bar || !selected) return
    // 底板跟随真实按钮宽度，横向滚动和旋转屏幕后仍与文字对齐。
    const positionIndicator = () => {
      bar.style.setProperty("--mode-left", `${selected.offsetLeft}px`)
      bar.style.setProperty("--mode-top", `${selected.offsetTop}px`)
      bar.style.setProperty("--mode-width", `${selected.offsetWidth}px`)
      bar.style.setProperty("--mode-height", `${selected.offsetHeight}px`)
      bar.dataset.indicatorReady = "true"
    }
    positionIndicator()
    const observer = new ResizeObserver(positionIndicator)
    observer.observe(bar)
    observer.observe(selected)
    if (selected.offsetLeft < bar.scrollLeft || selected.offsetLeft + selected.offsetWidth > bar.scrollLeft + bar.clientWidth) {
      bar.scrollTo({ left: selected.offsetLeft - (bar.clientWidth - selected.offsetWidth) / 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
    }
    return () => observer.disconnect()
  }, [settings.mode])

  useEffect(() => {
    mounted.current = true
    const frame = requestAnimationFrame(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false)
      setVideoSupported(Boolean(supportedVideoType()) && typeof HTMLCanvasElement.prototype.captureStream === "function")
    })
    return () => {
      mounted.current = false
      cancelAnimationFrame(frame)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (recordingTimer.current) clearTimeout(recordingTimer.current)
      const recorder = recorderRef.current
      if (recorder && recorder.state !== "inactive") recorder.stop()
      recorder?.stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    if (timer.deadline === null) return
    const tick = () => {
      const timestamp = Date.now()
      setNow(timestamp)
      if (timestamp >= timer.deadline!) setTimer({ remaining: 0, deadline: null })
    }
    const interval = setInterval(tick, 100)
    document.addEventListener("visibilitychange", tick)
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", tick) }
  }, [timer.deadline])

  function apply(next: BannerSettings) {
    update(next)
    setTimer({ remaining: null, deadline: null })
    setPlaying(true)
    setMotionOverride(true)
  }

  function togglePlayback() {
    if (isTimed) {
      if (timer.deadline) setTimer({ remaining: Math.max(0, (timer.deadline - Date.now()) / 1000), deadline: null })
      else {
        const timestamp = Date.now()
        setNow(timestamp)
        setTimer({ remaining: null, deadline: timestamp + (remaining || settings.duration) * 1000 })
      }
    } else { setPlaying((value) => !value); setMotionOverride(true) }
  }

  function changeScore(team: "a" | "b", amount: number) {
    scoreHistory.current = [...scoreHistory.current.slice(-39), scores]
    setScores((value) => ({ ...value, [team]: Math.max(0, Math.min(999, value[team] + amount)) }))
  }

  async function copyLink() {
    const url = shareUrl(settings)
    try { await navigator.clipboard.writeText(url); report("分享链接已复制，打开即可恢复这块灯牌。") }
    catch { setShareFallback(url) }
  }

  async function exportImage(returnFocus: HTMLButtonElement) {
    if (!canvasRef.current || exportingImage) return
    setExportingImage(true)
    try {
      const blob = await canvasToPng(canvasRef.current)
      if (mounted.current) saveMedia(blob, "led-banner.png", returnFocus)
    } catch { if (mounted.current) report("图片生成失败，请重试。") }
    finally { if (mounted.current) setExportingImage(false) }
  }

  function exportVideo(returnFocus: HTMLButtonElement) {
    const canvas = canvasRef.current
    const mimeType = supportedVideoType()
    if (!canvas || !mimeType || recording) return
    let stream: MediaStream | undefined
    try {
      stream = canvas.captureStream(30)
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6_000_000 })
      const chunks: Blob[] = []
      let failed = false
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
      recorder.onstop = () => {
        if (recordingTimer.current) clearTimeout(recordingTimer.current)
        recordingTimer.current = null
        stream?.getTracks().forEach((track) => track.stop())
        recorderRef.current = null
        if (!mounted.current) return
        setRecording(false)
        if (failed) return
        if (chunks.length) {
          const type = (recorder.mimeType || chunks[0].type || mimeType).split(";")[0]
          saveMedia(new Blob(chunks, { type }), `led-banner.${type === "video/mp4" ? "mp4" : "webm"}`, returnFocus)
        }
        else report("视频导出失败，请重试。")
      }
      recorder.onerror = () => { failed = true; stream?.getTracks().forEach((track) => track.stop()); if (mounted.current) { setRecording(false); report("当前浏览器无法录制，请使用 PNG 导出。") } }
      setPlaying(true)
      setMotionOverride(true)
      setRecording(true)
      recorder.start()
      recordingTimer.current = setTimeout(() => { if (recorder.state !== "inactive") recorder.stop() }, 6000)
    } catch { stream?.getTracks().forEach((track) => track.stop()); setRecording(false); report("录制启动失败，请使用 PNG 导出。") }
  }

  async function importConfig(file?: File) {
    if (!file) return
    if (file.size > 100_000) { report("配置文件过大，请选择灯牌导出的 JSON。 "); return }
    try {
      const value: unknown = JSON.parse(await file.text())
      if (!value || typeof value !== "object" || !("text" in value)) throw new Error("无效配置")
      apply(sanitizeSettings(value))
      report("配置已导入。")
    } catch { report("无法读取配置，请选择有效的灯牌 JSON 文件。") }
  }

  return <main className={styles.app}>
    <header className={styles.header} inert={presenting}>
      <Link href="/lab" className={styles.back} aria-label="返回 UI Lab"><ArrowLeft size={17} /></Link>
      <Link href="/lab/led-banner" className={styles.brand}><span><Grid2X2 size={19} /></span>LED <b>Banner</b></Link>
      <span className={styles.headerDivider} />
      <span className={styles.labLabel}>UI LAB / 02</span>
      <a href="#templates" className={styles.templateLink}>灵感模板 <ArrowUpRight size={14} /></a>
    </header>

    <div className={styles.workspace}>
      <section className={styles.intro} inert={presenting}>
        <div><span className={styles.eyebrow}><i /> YOUR SCREEN. YOUR MESSAGE.</span><h1>让你的每一句，<span>闪闪发光。</span></h1><p>写下想说的话，把屏幕变成你的灯牌。</p></div>
        <span className={styles.localBadge}><span /> 无需登录 · 本地制作</span>
      </section>

      <nav ref={modeBarRef} className={styles.modes} aria-label="灯牌场景" inert={presenting}>
        <span className={styles.modeIndicator} aria-hidden="true" />
        {MODES.map((mode) => <button type="button" key={mode.id} aria-pressed={settings.mode === mode.id} onClick={() => apply(settingsForMode(mode.id))}><span aria-hidden="true">{mode.symbol}</span>{mode.label}</button>)}
      </nav>

      <div className={styles.studio}>
        <aside className={styles.controls} aria-label="灯牌设置" inert={presenting}>
          <div className={styles.panelTitle}><span><i /> 灯牌工作台</span><div><button type="button" title="撤销" aria-label="撤销" disabled={!canUndo} onClick={() => travel("undo")}><Undo2 size={15} /></button><button type="button" title="重做" aria-label="重做" disabled={!canRedo} onClick={() => travel("redo")}><Redo2 size={15} /></button><button type="button" title="重置灯牌" aria-label="重置灯牌" onClick={() => apply(DEFAULT_SETTINGS)}><RotateCcw size={14} /></button></div></div>
          <div className={styles.controlBody}>
            <div key={settings.mode} className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-[cubic-bezier(.22,1,.36,1)] fill-mode-none">
            <label className={styles.field}><span>{settings.mode === "teleprompter" ? "提词内容" : settings.mode === "countdown" ? "倒计时标题" : settings.mode === "scoreboard" ? "赛事名称" : "显示内容"}<small>{settings.text.length} / 4000</small></span><textarea rows={settings.mode === "teleprompter" ? 7 : 3} maxLength={4000} value={settings.text} onChange={(event) => update({ text: event.target.value })} placeholder="写下想说的话…" /></label>
            {(settings.mode === "airport" || settings.mode === "wedding") && <label className={styles.field}><span>欢迎语 / 补充信息</span><input maxLength={160} value={settings.subtext} onChange={(event) => update({ subtext: event.target.value })} /></label>}
            {isTimed && <div className={styles.timerControl}><label className={styles.field}><span>{settings.mode === "scoreboard" ? "比赛时长（秒）" : "倒计时时长（秒）"}</span><input type="number" min={1} max={359999} value={settings.duration} onChange={(event) => { update({ duration: Number(event.target.value) }); setTimer({ remaining: null, deadline: null }) }} /></label><div><strong>{formatTime(remaining)}</strong><button type="button" aria-label="重置计时" onClick={() => setTimer({ remaining: null, deadline: null })}><RotateCcw size={15} /></button></div></div>}
            {settings.mode === "scoreboard" && <div className={styles.scoreControls}>
              {(["a", "b"] as const).map((team) => <div key={team}><input aria-label={team === "a" ? "主队名称" : "客队名称"} maxLength={32} value={team === "a" ? settings.teamA : settings.teamB} onChange={(event) => update(team === "a" ? { teamA: event.target.value } : { teamB: event.target.value })} /><div><button aria-label={`${team === "a" ? "主队" : "客队"}减分`} onClick={() => changeScore(team, -1)}><Minus size={15} /></button><output key={scores[team]} className="animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out fill-mode-none">{scores[team]}</output><button aria-label={`${team === "a" ? "主队" : "客队"}加分`} onClick={() => changeScore(team, 1)}><Plus size={15} /></button></div></div>)}
              <label>节次<input aria-label="节次" type="number" min={1} max={99} value={scores.period} onChange={(event) => setScores((value) => ({ ...value, period: Math.max(1, Math.min(99, Number(event.target.value))) }))} /></label>
              <button onClick={() => { const previous = scoreHistory.current.pop(); if (previous) setScores(previous) }}>撤销计分</button><button onClick={() => { scoreHistory.current.push(scores); setScores({ a: 0, b: 0, period: 1 }) }}>比分归零</button>
            </div>}
            </div>

            <fieldset className={styles.fieldset}><legend>显示风格</legend><div className={styles.effects}>{EFFECTS.map((effect) => <button key={effect.id} aria-pressed={settings.effect === effect.id} onClick={() => update({ effect: effect.id })}>{effect.label}</button>)}</div></fieldset>
            <fieldset className={styles.fieldset}><legend>文字颜色</legend><div className={styles.swatches}>{COLORS.map((color) => <button key={color} style={{ background: color }} aria-label={`文字颜色 ${color}`} aria-pressed={settings.color === color} onClick={() => update({ color })}>{settings.color === color && <Check size={15} className="animate-in zoom-in-75 fade-in duration-200 ease-out fill-mode-none" />}</button>)}<label className={styles.customColor} title="自定义文字颜色"><span>＋</span><input type="color" aria-label="自定义文字颜色" value={settings.color} onChange={(event) => update({ color: event.target.value })} /></label></div></fieldset>
            <div className={styles.colorRow}><span>背景颜色</span><label><input type="color" aria-label="背景颜色" value={settings.background} onChange={(event) => update({ background: event.target.value })} /><code>{settings.background.toUpperCase()}</code></label></div>
            <fieldset className={styles.fieldset}><legend>移动方式</legend><div className={styles.motions}>{MOTIONS.map((motion) => <button key={motion.id} aria-pressed={settings.motion === motion.id} onClick={() => update({ motion: motion.id })}>{motion.label}</button>)}</div></fieldset>
            <div className={styles.sliders}><Range label="移动速度" value={settings.speed} min={1} max={10} onChange={(speed) => update({ speed })} /><Range label="文字大小" value={settings.fontSize} min={32} max={240} onChange={(fontSize) => update({ fontSize })} /></div>
            <Detail title="字体与灯光">
              <label className={styles.field}><span>字体</span><select value={settings.font} onChange={(event) => update({ font: event.target.value as BannerSettings["font"] })}><option value="sans">现代黑体</option><option value="serif">经典衬线</option><option value="mono">等宽数码</option></select></label>
              <Range label="发光强度" value={settings.glow} min={0} max={100} onChange={(glow) => update({ glow })} /><Range label="文字间距" value={settings.letterSpacing} min={0} max={20} onChange={(letterSpacing) => update({ letterSpacing })} /><Range label="灯珠间距" value={settings.dotSize} min={4} max={16} onChange={(dotSize) => update({ dotSize })} />
              <label className={styles.field}><span>灯珠形状</span><select value={settings.dotShape} onChange={(event) => update({ dotShape: event.target.value as BannerSettings["dotShape"] })}><option value="round">圆形</option><option value="square">方形</option><option value="diamond">菱形</option></select></label>
              <div className={styles.toggles}><Toggle label="自动适配" value={settings.autoFit} onChange={(autoFit) => update({ autoFit })} /><Toggle label="镜像显示" value={settings.mirror} onChange={(mirror) => update({ mirror })} /><Toggle label="英文大写" value={settings.uppercase} onChange={(uppercase) => update({ uppercase })} /><Toggle label="缓慢闪烁" value={settings.blink} onChange={(blink) => update({ blink })} /><Toggle label="渐变背景" value={settings.gradient} onChange={(gradient) => update({ gradient })} /></div>
              {settings.gradient && <label className={styles.colorRow}>渐变颜色<input type="color" aria-label="渐变颜色" value={settings.secondaryColor} onChange={(secondaryColor) => update({ secondaryColor: secondaryColor.target.value })} /></label>}
            </Detail>
            <Detail title="导入与导出配置"><div className={styles.configActions}><button onClick={() => downloadBlob(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }), "led-banner.json")}><Download size={13} /> 导出 JSON</button><label>导入 JSON<input type="file" accept=".json,application/json" onChange={(event) => { void importConfig(event.target.files?.[0]); event.target.value = "" }} /></label></div></Detail>
          </div>
          <p className={styles.storageNote} role="status">{storageError ? "浏览器无法保存数据，当前灯牌仍可使用。" : ready ? "设置自动保存在此浏览器" : "正在加载设置…"}</p>
        </aside>

        <section className={styles.output} aria-label="灯牌预览与模板">
          <div className={styles.previewCard}>
            <div className={styles.previewHeading} inert={presenting}><span><i className={active ? styles.live : ""} /> 实时预览</span><span>{EFFECTS.find((effect) => effect.id === settings.effect)?.label}<span className={styles.headingSeparator}>/</span>{MODES.find((mode) => mode.id === settings.mode)?.label}</span></div>
            <div ref={displayRef} tabIndex={-1} className={`${styles.display} ${presenting ? styles.presenting : ""}`} data-presenting={presenting}>
              <div className={styles.displaySurface}>
                <BannerCanvas settings={settings} playing={playing} recording={recording} live={live} canvasRef={canvasRef} className={styles.canvas} onTogglePlay={togglePlayback} reducedMotionOverride={motionOverride} />
                {!settings.text.trim() && settings.mode !== "scoreboard" && settings.mode !== "countdown" && <span className={styles.empty}>写下你的第一句话</span>}
                {presenting && <div className={`${styles.presentationControls} animate-in fade-in slide-in-from-bottom-3 duration-500 ease-[cubic-bezier(.22,1,.36,1)] fill-mode-none`}><button onClick={togglePlayback} aria-label={active ? "暂停展示" : "开始展示"}><span key={String(active)} className={`${styles.actionIcon} animate-in fade-in zoom-in-75 duration-200 ease-out fill-mode-none`}>{active ? <Pause size={19} /> : <Play size={19} />}</span></button><button onClick={close}><X size={18} /> 退出展示</button></div>}
                {recording && <span className={`${styles.recording} animate-in fade-in zoom-in-95 duration-300 ease-out fill-mode-none`}><i /> 正在录制 6 秒视频</span>}
              </div>
            </div>
            <div className={styles.previewFooter} inert={presenting}><span><span className={styles.key}>SPACE</span> 播放 / 暂停</span><span>全屏默认横向 <span aria-hidden="true">↔</span></span></div>
            <div className={styles.actions} inert={presenting}>
              <button className={styles.playButton} onClick={togglePlayback} aria-label={active ? "暂停" : "播放"}><span key={String(active)} className={`${styles.actionIcon} animate-in fade-in zoom-in-75 duration-200 ease-out fill-mode-none`}>{active ? <Pause size={17} /> : <Play size={17} />}</span><span>{active ? "暂停" : isTimed ? "开始计时" : "播放"}</span></button>
              <button className={styles.fullscreenButton} onClick={() => void open()}><Maximize2 size={17} /> 全屏展示</button>
              <span className={styles.actionSpacer} />
              <button onClick={(event) => void exportImage(event.currentTarget)} disabled={exportingImage || recording} title="保存当前画面为图片"><Download size={16} /><span>{exportingImage ? "生成中" : "保存图片"}</span></button>
              {videoSupported && <button onClick={(event) => exportVideo(event.currentTarget)} disabled={recording || exportingImage} title="录制并保存 6 秒视频"><Video size={16} /><span>{recording ? "录制中…" : "保存视频"}</span></button>}
              <button onClick={() => void copyLink()} title="复制分享链接"><Link2 size={16} /><span>分享</span></button>
              <button onClick={() => { setSaveOpen((value) => !value); setDesignName(settings.text.split("\n")[0].slice(0, 24)) }} aria-expanded={saveOpen} title="收藏当前灯牌设置"><Save size={16} /><span>收藏</span></button>
            </div>
          </div>

          <div inert={presenting}>
            <SlidingPanel open={Boolean(shareFallback)}><div><h2>复制分享链接</h2><button aria-label="关闭分享链接" onClick={() => setShareFallback("")}><X size={16} /></button></div><input aria-label="分享链接" readOnly value={shareFallback} onFocus={(event) => event.target.select()} /><p>链接包含当前文字与样式。</p></SlidingPanel>
            <SlidingPanel open={saveOpen}><div><h2>保存这块灯牌</h2><button aria-label="关闭保存" onClick={() => setSaveOpen(false)}><X size={16} /></button></div><form onSubmit={(event) => { event.preventDefault(); if (saveDesign(designName)) { report("灯牌已保存到此浏览器。 "); setSaveOpen(false) } else report("保存失败，可导出 JSON 留存。") }}><input aria-label="灯牌名称" maxLength={40} value={designName} onChange={(event) => setDesignName(event.target.value)} placeholder="给灯牌起个名字" required /><button type="submit">保存</button></form><p>最多保留 20 块灯牌，保存在当前浏览器。</p></SlidingPanel>
            <section id="templates" className={styles.templates}><div className={styles.sectionHeading}><div><span className={styles.eyebrow}>A LITTLE INSPIRATION</span><h2>从一个灵感开始</h2></div><span>选一个，换成你的话 <ArrowUpRight size={14} /></span></div><div className={styles.templateGrid}>{TEMPLATES.map((template) => <button key={template.id} className={styles.template} onClick={() => apply(template.settings)}><span className={styles.templateArt} data-effect={template.settings.effect} style={{ color: template.settings.color, backgroundColor: template.settings.background }}><b>{template.caption}</b></span><span className={styles.templateCaption}>{template.name}<ArrowUpRight size={14} /></span></button>)}</div></section>
            {designs.length > 0 && <section className={styles.saved}><div className={styles.sectionHeading}><h2>我的灯牌 <small>{designs.length}</small></h2></div><div className={styles.savedList}>{designs.map((design) => <div key={design.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-[cubic-bezier(.22,1,.36,1)] fill-mode-none"><button onClick={() => apply(design.settings)}><i style={{ background: design.settings.color }} /><span>{design.name}</span><ArrowUpRight size={13} /></button><button aria-label={`删除 ${design.name}`} onClick={() => { if (!deleteDesign(design.id)) report("未能删除，请检查浏览器存储权限。") }}><Trash2 size={13} /></button></div>)}</div></section>}
            <footer className={styles.footer}><span>一块屏幕，无限表达。</span><a href="https://led-bursa.com/" target="_blank" rel="noreferrer">灵感来自 LED Banner <ArrowUpRight size={12} /></a></footer>
          </div>
        </section>
      </div>
    </div>
    {mediaSaveDialog}
    <div className={styles.toast} role="status" aria-live="polite" data-visible={Boolean(message)}>{message && <><Check size={15} />{message}</>}</div>
  </main>
}
