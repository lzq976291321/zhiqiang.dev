"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowLeftRight, Camera, Cat, Check, ChevronDown, Disc3, EyeOff, FlipHorizontal2, Info, Maximize, Minimize, PanelBottom, Pause, Play, RotateCcw, SlidersHorizontal, SplitSquareVertical, Star, Sun, X } from "lucide-react"
import { MediaSaveDialog } from "@/components/media/MediaSaveDialog"
import { presets } from "../data/presets"
import { colorCSS, colorFromHex, colorHex, defaultSettings, sameColor, type LightColor } from "../lib/light-settings"
import { useLightSettings } from "../lib/use-light-settings"
import { useCamera } from "../lib/use-camera"
import { useScreenAwake } from "../lib/use-screen-awake"
import { useDisco } from "../lib/use-disco"
import { exitFullscreen, isAppleMobile, requestFullscreen, useFullscreenMode } from "../lib/use-fullscreen"
import { FullscreenHelp } from "./FullscreenHelp"
import styles from "./FillLight.module.css"

export function FillLight() {
  const { settings, setSettings, favorites, setFavorites } = useLightSettings()
  const [activeSide, setActiveSide] = useState<0 | 1>(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [discoMode, setDiscoMode] = useState(false)
  const disco = useDisco(discoMode)
  const displayMode = useFullscreenMode()
  const fullscreen = displayMode === "fullscreen"
  const [fullscreenGuide, setFullscreenGuide] = useState({ appleMobile: false, rejected: false })
  const [message, setMessage] = useState("")
  const rootRef = useRef<HTMLElement>(null)
  const infoRef = useRef<HTMLDialogElement>(null)
  const fullscreenHelpRef = useRef<HTMLDialogElement>(null)
  const { videoRef, ...camera } = useCamera()
  const photoFile = useMemo(() => camera.photo ? new File([camera.photo], "fill-light-photo.jpg", { type: camera.photo.type }) : null, [camera.photo])
  useScreenAwake()

  const selectedSide = settings.split ? activeSide : 0
  const color = settings.colors[selectedSide]
  const preset = presets.find((item) => sameColor(item.color, color))
  const favoriteIndex = favorites.findIndex((item) => sameColor(item, color))
  const cameraActive = camera.status === "ready" || camera.status === "loading"
  const colorName = preset?.name ?? (favoriteIndex >= 0 ? `收藏 ${favoriteIndex + 1}` : "自定义")
  const css = { "--light-color": colorCSS(color), "--hue-color": `hsl(${color.hue} 100% 65%)` } as CSSProperties
  const fullscreenLabel = fullscreen ? "退出全屏" : displayMode === "installed" ? "沉浸补光" : displayMode === "unsupported" ? "全屏使用指引" : "进入全屏"
  const screenColor = discoMode ? disco.color : settings.colors[0]
  const screenSplit = !discoMode && settings.split
  const surfaceColor = colorHex(screenColor, settings.brightness)
  const surfaceImage = screenSplit
    ? `linear-gradient(to ${settings.axis === "horizontal" ? "bottom" : "right"}, ${surfaceColor} 50%, ${colorHex(settings.colors[1], settings.brightness)} 50%)`
    : "none"

  useEffect(() => {
    // iOS 会从文档背景取状态栏颜色，固定在上面的补光画布不足以覆盖博客的深色底。
    const root = document.documentElement
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousThemeColor = themeColor?.content
    root.style.setProperty("--fill-light-surface", surfaceColor)
    root.style.setProperty("--fill-light-surface-image", surfaceImage)
    if (themeColor) themeColor.content = surfaceColor
    return () => {
      root.style.removeProperty("--fill-light-surface")
      root.style.removeProperty("--fill-light-surface-image")
      if (themeColor?.content === surfaceColor && previousThemeColor !== undefined) {
        themeColor.content = previousThemeColor
      }
    }
  }, [surfaceColor, surfaceImage])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(""), 3500)
    return () => clearTimeout(timer)
  }, [message])

  function updateColor(next: LightColor) {
    setSettings((previous) => ({ ...previous, colors: previous.colors.map((item, index) => index === selectedSide ? next : item) as [LightColor, LightColor] }))
  }

  function saveFavorite() {
    if (favoriteIndex >= 0) {
      setFavorites((previous) => previous.filter((_, index) => index !== favoriteIndex))
      setMessage("已移除收藏")
    } else if (favorites.length >= 8) {
      setMessage("最多收藏 8 款颜色，请先取消一款收藏")
    } else {
      setFavorites((previous) => [...previous, { ...color }])
      setMessage("已收藏这束光")
    }
  }

  async function toggleFullscreen() {
    if (displayMode === "installed") { setControlsVisible(false); return }
    try {
      if (fullscreen) { await exitFullscreen(); return }
      if (rootRef.current && await requestFullscreen(rootRef.current)) return
      setFullscreenGuide({ appleMobile: isAppleMobile(), rejected: false })
    } catch {
      if (fullscreen) { setMessage("未能退出全屏，请使用浏览器的退出按钮"); return }
      setFullscreenGuide({ appleMobile: isAppleMobile(), rejected: true })
    }
    fullscreenHelpRef.current?.showModal()
  }

  function toggleCamera() {
    if (cameraActive) camera.close()
    else { setControlsVisible(false); void camera.open() }
  }

  function startDisco() {
    camera.close()
    setDiscoMode(true)
    setControlsVisible(false)
  }

  function stopDisco() {
    setDiscoMode(false)
    setControlsVisible(true)
  }

  return (
    <main ref={rootRef} className={styles.app} style={css} data-controls={controlsVisible} data-display-mode={displayMode} data-disco={discoMode} data-playing={discoMode && disco.playing}>
      <div className={styles.lightCanvas} data-split={screenSplit} data-axis={settings.axis} data-disco={discoMode} style={{ filter: `brightness(${settings.brightness / 100})` }} aria-hidden="true">
        <div style={{ backgroundColor: colorCSS(screenColor) }} />
        <div style={{ backgroundColor: colorCSS(settings.colors[1]) }} />
      </div>
      <button type="button" className={styles.canvasToggle} aria-label={controlsVisible ? "隐藏控制面板" : "显示控制面板"} onClick={() => setControlsVisible((value) => !value)} tabIndex={-1} />

      <header className={styles.header} data-hidden={!controlsVisible} inert={!controlsVisible} aria-hidden={!controlsVisible}>
        <div className={styles.brandGroup}>
          <Link href="/lab" className={styles.iconButton} aria-label="返回 UI Lab" title="返回 UI Lab"><ArrowLeft size={19} /></Link>
          <div className={styles.brand}><h1><Cat size={21} strokeWidth={1.6} />补光灯</h1><span>让光，刚刚好。</span></div>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.iconButton} onClick={() => infoRef.current?.showModal()} aria-label="使用说明" title="使用说明"><Info size={19} /></button>
          <button type="button" className={styles.iconButton} onClick={toggleFullscreen} aria-label={fullscreenLabel} title={fullscreenLabel}>{fullscreen ? <Minimize size={19} /> : displayMode === "installed" ? <EyeOff size={19} /> : <Maximize size={19} />}</button>
        </div>
      </header>

      <button type="button" className={`${styles.cameraToggle} ${styles.iconButton}`} aria-label={cameraActive ? "关闭相机" : "打开相机"} aria-pressed={cameraActive} title={cameraActive ? "关闭相机" : "打开相机"} onClick={toggleCamera}><Camera size={22} strokeWidth={1.7} /></button>

      <div className={styles.cameraStage} data-active={cameraActive} data-controls={controlsVisible} inert={!cameraActive} aria-hidden={!cameraActive}>
        <div className={styles.viewfinder}>
          <video ref={videoRef} autoPlay muted playsInline aria-label="相机实时预览" style={{ transform: camera.facing === "user" ? "scaleX(-1)" : undefined }} />
          {camera.status === "loading" && <span className={styles.cameraLoading}>正在打开相机…</span>}
          {camera.status === "ready" && <span className={styles.liveLabel}><i /> 实时预览</span>}
        </div>
        <div className={styles.cameraActions}>
          <span>照片仅保存在本机</span>
          <button type="button" className={styles.shutter} aria-label="拍照" disabled={camera.status !== "ready"} onClick={camera.capture}><span /></button>
          <button type="button" className={styles.iconButton} aria-label="切换前后摄像头" disabled={camera.status !== "ready"} onClick={() => void camera.flip()}><FlipHorizontal2 size={21} /></button>
        </div>
      </div>

      {camera.error && <div className={`${styles.error} animate-in fade-in slide-in-from-top-2 duration-300 ease-out`} role="alert"><span>{camera.error}</span><button type="button" onClick={() => { camera.close(); setControlsVisible(true) }} aria-label="关闭相机提示"><X size={18} /></button></div>}
      <div className={styles.toast} role="status" aria-live="polite" data-visible={Boolean(message)}>{message}</div>

      <section className={`${styles.panel} ${controlsVisible ? "animate-in fade-in slide-in-from-bottom-8 zoom-in-95 duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]" : "animate-out fade-out slide-out-to-bottom-6 zoom-out-95 duration-200 ease-in"}`} aria-label="补光控制" data-visible={controlsVisible} inert={!controlsVisible} aria-hidden={!controlsVisible}>
        <div className={styles.panelHeading}>
          <div><span className={styles.statusDot} /><h2>{discoMode ? "蹦迪模式" : colorName}</h2>{!discoMode && <span className={styles.colorCode}>{colorHex(color).toUpperCase()}</span>}</div>
          <div>
            {!discoMode && <button type="button" className={styles.smallButton} aria-label={favoriteIndex >= 0 ? "取消收藏当前颜色" : "收藏当前颜色"} aria-pressed={favoriteIndex >= 0} onClick={saveFavorite}><Star key={favoriteIndex >= 0 ? "saved" : "unsaved"} className="animate-in zoom-in-75 spin-in-12 duration-300 ease-out" size={17} fill={favoriteIndex >= 0 ? "currentColor" : "none"} /></button>}
            <button type="button" className={styles.smallButton} aria-label="收起面板" title="收起面板" onClick={() => setControlsVisible(false)}><ChevronDown size={20} /></button>
          </div>
        </div>

        {discoMode ? <div className={`${styles.discoControls} animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out`}>
          <div className={styles.discoHeading}>
            <div><Disc3 size={36} strokeWidth={1.3} /><strong>{disco.bpm}<small>BPM</small></strong></div>
            <button type="button" className={styles.discoPlayback} onClick={disco.togglePlaying} aria-label={disco.playing ? "暂停蹦迪" : "继续蹦迪"}>{disco.playing ? <Pause size={17} /> : <Play size={17} />}{disco.playing ? "暂停" : "播放"}</button>
          </div>
          <label className={styles.sliderLabel} htmlFor="disco-tempo"><span>节奏</span><span>{disco.bpm < 85 ? "慢摇" : disco.bpm < 125 ? "律动" : "派对"}</span></label>
          <input id="disco-tempo" className={`${styles.range} ${styles.tempo}`} type="range" min="60" max="150" step="5" value={disco.bpm} onChange={(event) => disco.setBpm(Number(event.target.value))} />
          <div className={styles.tempoLabels} aria-hidden="true"><span>慢一点</span><span>嗨起来</span></div>
          <label className={styles.sliderLabel} htmlFor="disco-brightness"><span><Sun size={13} />页面亮度</span><span>{settings.brightness}%</span></label>
          <input id="disco-brightness" className={`${styles.range} ${styles.brightness}`} type="range" min="10" max="100" value={settings.brightness} onChange={(event) => setSettings((value) => ({ ...value, brightness: Number(event.target.value) }))} />
        </div> : <>
        <div className={styles.sideSelectorReveal} data-visible={settings.split} inert={!settings.split} aria-hidden={!settings.split}>
        <div className={styles.sideSelector} aria-label="选择要调整的分屏">
          {([0, 1] as const).map((side) => <button type="button" key={side} aria-pressed={selectedSide === side} onClick={() => setActiveSide(side)}><i style={{ background: colorCSS(settings.colors[side]) }} />{settings.axis === "horizontal" ? side === 0 ? "上半屏" : "下半屏" : side === 0 ? "左半屏" : "右半屏"}</button>)}
          <button type="button" className={styles.axisButton} onClick={() => setSettings((value) => ({ ...value, axis: value.axis === "horizontal" ? "vertical" : "horizontal" }))} aria-label="切换分屏方向" title="切换分屏方向"><ArrowLeftRight size={16} /></button>
        </div>
        </div>

        <div className={styles.swatches} aria-label="补光色卡">
          {presets.map((item) => <button type="button" className={styles.swatch} key={item.id} aria-pressed={sameColor(item.color, color)} onClick={() => updateColor(item.color)}><span style={{ background: colorCSS(item.color) }}>{sameColor(item.color, color) && <Check className="animate-in fade-in zoom-in-50 duration-300 ease-out" size={18} />}</span><small>{item.name}</small></button>)}
          {favorites.length > 0 && <span className={styles.swatchDivider} />}
          {favorites.map((item, index) => <button type="button" className={`${styles.swatch} animate-in fade-in zoom-in-90 duration-300 ease-out`} key={`${colorHex(item)}-${index}`} aria-pressed={sameColor(item, color)} onClick={() => updateColor(item)}><span style={{ background: colorCSS(item) }}>{sameColor(item, color) && <Check className="animate-in fade-in zoom-in-50 duration-300 ease-out" size={18} />}</span><small>收藏 {index + 1}</small></button>)}
        </div>

        <div className={styles.sliders}>
          <label className={styles.sliderLabel} htmlFor="light-hue"><span>色相</span><span>{Math.round(color.hue)}°</span></label>
          <input id="light-hue" className={`${styles.range} ${styles.hue}`} type="range" min="0" max="360" value={color.hue} onChange={(event) => updateColor({ ...color, hue: Number(event.target.value), saturation: color.saturation || 65, lightness: color.lightness >= 98 || color.lightness <= 2 ? 80 : color.lightness })} />
          <div className={styles.sliderGrid}>
            <div><label className={styles.sliderLabel} htmlFor="light-saturation"><span>饱和度</span><span>{Math.round(color.saturation)}%</span></label><input id="light-saturation" className={`${styles.range} ${styles.saturation}`} type="range" min="0" max="100" value={color.saturation} onChange={(event) => updateColor({ ...color, saturation: Number(event.target.value), lightness: color.lightness >= 98 || color.lightness <= 2 ? 80 : color.lightness })} /></div>
            <div><label className={styles.sliderLabel} htmlFor="light-brightness"><span><Sun size={13} />页面亮度</span><span>{settings.brightness}%</span></label><input id="light-brightness" className={`${styles.range} ${styles.brightness}`} type="range" min="10" max="100" value={settings.brightness} onChange={(event) => setSettings((value) => ({ ...value, brightness: Number(event.target.value) }))} /></div>
          </div>
        </div>
        </>}

        <footer className={styles.panelFooter}>
          <div className={styles.modeSwitch} aria-label="补光模式" data-disco={discoMode} style={{ "--mode-index": discoMode ? 2 : settings.split ? 1 : 0 } as CSSProperties}>
            <span className={styles.modeIndicator} aria-hidden="true" />
            <button type="button" aria-pressed={!discoMode && !settings.split} onClick={() => { setDiscoMode(false); setSettings((value) => ({ ...value, split: false })) }}><PanelBottom size={15} />单色</button>
            <button type="button" aria-pressed={!discoMode && settings.split} onClick={() => { setDiscoMode(false); setSettings((value) => ({ ...value, split: true })) }}><SplitSquareVertical size={15} />双色</button>
            <button type="button" aria-pressed={discoMode} onClick={startDisco}><Disc3 size={15} />蹦迪</button>
          </div>
          {discoMode ? <button type="button" className={styles.endDisco} onClick={stopDisco}>结束蹦迪</button> : <div className={styles.footerActions}>
            <label className={styles.customColor} title="选择自定义颜色"><span style={{ background: colorCSS(color) }} />自定义<input type="color" aria-label="自定义颜色" value={colorHex(color)} onChange={(event) => updateColor(colorFromHex(event.target.value))} /></label>
            <button type="button" className={styles.smallButton} aria-label="恢复默认补光" title="恢复默认补光" onClick={() => { setSettings(defaultSettings); setActiveSide(0); setMessage("已恢复默认补光") }}><RotateCcw size={16} /></button>
          </div>}
        </footer>
        <p className={styles.brightnessHint}>补光更亮，请调高设备屏幕亮度</p>
      </section>

      <div className={styles.cleanActions} data-visible={!controlsVisible} inert={controlsVisible} aria-hidden={controlsVisible}>
        {discoMode && <button type="button" className={styles.cleanButton} onClick={disco.togglePlaying} aria-label={disco.playing ? "暂停蹦迪" : "继续蹦迪"}>{disco.playing ? <Pause size={16} /> : <Play size={16} />}{disco.playing ? "暂停" : "播放"}</button>}
        <button type="button" className={styles.cleanButton} onClick={() => setControlsVisible(true)}><SlidersHorizontal size={17} />{discoMode ? `${disco.bpm} BPM` : "调节"}</button>
        {discoMode && <button type="button" className={styles.cleanButton} onClick={stopDisco} aria-label="结束蹦迪"><X size={16} />结束</button>}
        {fullscreen && <button type="button" className={styles.cleanButton} onClick={toggleFullscreen}><Minimize size={16} />退出全屏</button>}
      </div>

      <FullscreenHelp dialogRef={fullscreenHelpRef} appleMobile={fullscreenGuide.appleMobile} rejected={fullscreenGuide.rejected} />

      <dialog ref={infoRef} className={`${styles.dialog} open:animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`} aria-labelledby="fill-light-help-title" onClick={(event) => { if (event.target === event.currentTarget) infoRef.current?.close() }}>
        <div className={styles.dialogHeader}><h2 id="fill-light-help-title"><Cat size={23} />一块屏幕，一点好光</h2><button type="button" className={styles.smallButton} aria-label="关闭使用说明" onClick={() => infoRef.current?.close()}><X size={20} /></button></div>
        <p>选一张色卡，把屏幕朝向自己。点空白处可以收起面板，让整块屏幕发光。</p>
        <p>双色模式下可以分别调整两边的颜色。网页调节的是页面亮度，设备屏幕亮度请在系统控制中心调整。</p>
        <p>iPhone 请通过 Safari 分享菜单添加到主屏幕，再从桌面打开，即可去掉浏览器地址栏和工具栏。</p>
        <p>相机需要你的授权，照片不会上传。支持的浏览器会在页面打开时保持屏幕常亮。</p>
        <div className={styles.credit}>参考 <a href="https://apps.apple.com/us/app/id6737742513" target="_blank" rel="noreferrer">小猫补光灯 ↗</a> 的独立网页练习，由 UI Lab 制作。</div>
      </dialog>

      {photoFile && <MediaSaveDialog file={photoFile} onClose={camera.clearPhoto} title="保存照片" />}
    </main>
  )
}
