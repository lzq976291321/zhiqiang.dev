"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Download, Share2, X } from "lucide-react"
import { downloadBlob, mediaSavePlatform } from "@/lib/media-save"
import styles from "./MediaSaveDialog.module.css"

export interface MediaSaveDialogProps {
  file: File
  onClose: () => void
  title?: string
  returnFocus?: HTMLElement | null
}

function canShareFile(file: File): boolean {
  try {
    return typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })
  } catch { return false }
}

export function MediaSaveDialog({ file, onClose, title, returnFocus }: MediaSaveDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const activeFile = useRef<File | null>(null)
  const inFlight = useRef(false)
  const mounted = useRef(false)
  const closeFrame = useRef<number | null>(null)
  const [sharing, setSharing] = useState(false)
  const [closingFile, setClosingFile] = useState<File | null>(null)
  const [issue, setIssue] = useState<{ file: File; text: string } | null>(null)
  const titleId = useId()
  const hintId = useId()
  const platform = useMemo(() => mediaSavePlatform(), [])
  const mobile = platform !== "desktop"
  const video = /^video\//i.test(file.type)
  const webm = video && (file.type.split(";")[0] === "video/webm" || /\.webm$/i.test(file.name))
  const shareable = useMemo(() => canShareFile(file), [file])
  const kind = video ? "视频" : "图片"
  const error = issue?.file === file ? issue.text : ""
  const closing = closingFile === file

  useEffect(() => {
    mounted.current = true
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => {
      mounted.current = false
      if (closeFrame.current !== null) cancelAnimationFrame(closeFrame.current)
      closeFrame.current = null
      if (dialog?.open) dialog.close()
    }
  }, [])

  useEffect(() => {
    activeFile.current = file
    const media = video ? videoRef.current : imageRef.current
    if (!media) return
    const url = URL.createObjectURL(file)
    media.src = url
    // 关闭事件尚未结算时收到新媒体，继续展示新文件，不清空新的保存请求。
    if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal()
    return () => {
      if (media instanceof HTMLVideoElement) {
        media.pause()
        media.removeAttribute("src")
        media.load()
      } else media.removeAttribute("src")
      URL.revokeObjectURL(url)
      if (activeFile.current === file) activeFile.current = null
    }
  }, [file, video])

  useEffect(() => {
    if (!closing) return
    // 动画事件在页面切到后台时可能不触发，兜底关闭，避免残留遮罩。
    const timer = window.setTimeout(() => {
      if (mounted.current && activeFile.current === file) dialogRef.current?.close()
    }, 240)
    return () => window.clearTimeout(timer)
  }, [closing, file])

  function requestClose(): void {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialogRef.current?.close()
      return
    }
    setClosingFile(file)
  }

  function share(): void {
    if (inFlight.current) return
    if (!canShareFile(file)) {
      setIssue({ file, text: video ? "此浏览器无法分享这个视频，请下载文件。" : "此浏览器无法分享这张图片，请长按图片保存或下载文件。" })
      return
    }
    inFlight.current = true
    setSharing(true)
    setIssue(null)
    let operation: Promise<void>
    try {
      // 必须在当前点击内调用；媒体已生成，不在 share 前等待异步转换。
      operation = navigator.share({ files: [file] })
    } catch (cause) {
      operation = Promise.reject(cause)
    }
    void operation.catch((cause: unknown) => {
      if (!mounted.current || activeFile.current !== file) return
      if (cause && typeof cause === "object" && "name" in cause && cause.name === "AbortError") return
      setIssue({ file, text: video ? "未能打开系统分享，请重试或下载文件。" : "未能打开系统分享，请重试、长按图片保存或下载文件。" })
    }).finally(() => {
      // 系统分享持有 File，本地弹层关闭或替换 URL 不会销毁分享中的媒体。
      inFlight.current = false
      if (mounted.current) setSharing(false)
    })
  }

  function download(): void {
    try { downloadBlob(file, file.name) }
    catch { setIssue({ file, text: "下载未能开始，请重试。" }) }
  }

  let hint = "文件将保存到浏览器的下载位置。"
  if (mobile) {
    if (webm) hint = "当前为 WebM 视频，部分相册无法直接保存。可分享给支持的应用，或下载文件。"
    else if (!shareable) hint = video ? "此浏览器不支持文件分享，可以下载视频文件。" : "长按图片，选择保存图片；也可以下载文件。"
    else if (platform === "ios") hint = `点击“保存${kind}”，在系统菜单中选择“${video ? "存储视频" : "存储图像"}”。`
    else if (platform === "android") hint = `点击“保存${kind}”，在系统菜单中选择相册或${video ? "视频" : "图片"}应用（如有）。`
    else hint = `在系统菜单中选择可接收此${kind}的应用。`
  }

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${closing
        ? "animate-out fade-out zoom-out-95 slide-out-to-bottom-3 duration-180 ease-in fill-mode-forwards"
        : "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 max-sm:slide-in-from-bottom-10 duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"} motion-reduce:animate-none`}
      data-state={closing ? "closing" : "open"}
      aria-labelledby={titleId}
      aria-describedby={hintId}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === "exit" && closing) event.currentTarget.close()
      }}
      onClose={(event) => {
        // Strict Mode 会先关闭再重新打开弹层，忽略上一次关闭的延迟事件。
        const dialog = event.currentTarget
        if (dialog.open || !mounted.current) return
        if (closeFrame.current !== null) cancelAnimationFrame(closeFrame.current)
        closeFrame.current = requestAnimationFrame(() => {
          closeFrame.current = null
          if (!mounted.current || dialog.open || activeFile.current !== file) return
          // 焦点恢复先于父组件清理；导航卸载会取消该帧，避免跳回已经离开的页面。
          if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
          onClose()
        })
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const rect = event.currentTarget.getBoundingClientRect()
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) requestClose()
      }}
    >
      <header className={styles.header}>
        <h2 id={titleId}>{title || `${kind}预览`}</h2>
        <button type="button" className={styles.close} aria-label="关闭保存预览" onClick={requestClose}><X size={20} /></button>
      </header>
      <div className={styles.preview}>
        {video ? <video ref={videoRef} controls playsInline preload="metadata" aria-label="待保存的视频" /> : (
          // 原生图片保留手机长按保存菜单，Blob URL 不经过 Next 图片优化。
          // eslint-disable-next-line @next/next/no-img-element
          <img ref={imageRef} alt="待保存的图片，手机可长按保存" />
        )}
      </div>
      <div className={styles.footer}>
        <p id={hintId} className={styles.hint}>{hint}</p>
        {error && <p className={styles.error} role="status">{error}</p>}
        <div className={styles.actions}>
          {mobile && shareable ? <button type="button" className={styles.primary} disabled={sharing} onClick={share}><Share2 size={17} />{sharing ? "正在打开…" : webm ? "分享视频" : `保存${kind}`}</button> : !mobile ? <button type="button" className={styles.primary} onClick={download}><Download size={17} />下载{kind}</button> : null}
          {mobile && <button type="button" className={styles.secondary} disabled={sharing} onClick={download}><Download size={16} />下载文件</button>}
        </div>
      </div>
    </dialog>
  )
}
