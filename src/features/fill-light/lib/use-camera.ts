"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type CameraStatus = "off" | "loading" | "ready" | "error"
type CameraFacing = "user" | "environment"

class CameraPreviewError extends Error {}

function stopTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}

function cameraError(cause: unknown, switching: boolean) {
  if (cause instanceof DOMException) {
    switch (cause.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "相机权限未开启，请在浏览器设置中允许使用相机后重试。"
      case "NotFoundError":
      case "OverconstrainedError":
        return switching
          ? "没有找到可切换的摄像头，请重新打开相机。"
          : "没有找到可用的摄像头。"
      case "NotReadableError":
      case "AbortError":
        return "相机暂时无法使用，请关闭其他正在使用相机的应用后重试。"
    }
  }
  return cause instanceof CameraPreviewError ? cause.message : "相机未能开启，请重试。"
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const releasePreviewRef = useRef<(() => void) | null>(null)
  const mountedRef = useRef(false)
  const requestRef = useRef(0)
  const captureRef = useRef(0)
  const facingRef = useRef<CameraFacing>("user")
  const statusRef = useRef<CameraStatus>("off")
  const [status, setStatus] = useState<CameraStatus>("off")
  const [error, setError] = useState("")
  const [facing, setFacing] = useState<CameraFacing>("user")
  const [photo, setPhoto] = useState<Blob | null>(null)

  const updateStatus = useCallback((next: CameraStatus) => {
    statusRef.current = next
    if (mountedRef.current) setStatus(next)
  }, [])

  const releaseStream = useCallback(() => {
    releasePreviewRef.current?.()
    releasePreviewRef.current = null
    if (streamRef.current) stopTracks(streamRef.current)
    streamRef.current = null
  }, [])

  const clearPhoto = useCallback(() => {
    captureRef.current += 1
    if (mountedRef.current) setPhoto(null)
  }, [])

  const close = useCallback(() => {
    requestRef.current += 1
    releaseStream()
    clearPhoto()
    updateStatus("off")
    if (mountedRef.current) setError("")
  }, [clearPhoto, releaseStream, updateStatus])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requestRef.current += 1
      captureRef.current += 1
      releaseStream()
    }
  }, [releaseStream])

  const startCamera = useCallback(async (nextFacing: CameraFacing, switching = false) => {
    if (!mountedRef.current) return
    const request = ++requestRef.current
    const isCurrent = () => mountedRef.current && request === requestRef.current
    releaseStream()
    clearPhoto()
    setError("")
    updateStatus("loading")

    if (!window.isSecureContext) {
      setError("相机需要安全连接，请通过 HTTPS 打开此页面。")
      updateStatus("error")
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("当前浏览器不支持相机，请使用 Safari 或 Chrome 打开。")
      updateStatus("error")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: switching ? { exact: nextFacing } : { ideal: nextFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      // 权限窗口无法主动取消，过期请求返回后立即释放摄像头。
      if (!isCurrent()) {
        stopTracks(stream)
        return
      }
      streamRef.current = stream
      const video = videoRef.current
      if (!video) throw new CameraPreviewError("相机预览尚未准备好，请重试。")
      video.muted = true
      video.playsInline = true

      const onTrackEnded = () => {
        if (!isCurrent()) return
        requestRef.current += 1
        releaseStream()
        setError("相机连接已断开，请重新打开。")
        updateStatus("error")
      }
      stream.getVideoTracks().forEach((track) => track.addEventListener("ended", onTrackEnded))

      await new Promise<void>((resolve, reject) => {
        let settled = false
        let playing = false
        const finish = (cause?: Error) => {
          if (settled) return
          settled = true
          window.clearTimeout(timeout)
          video.removeEventListener("loadedmetadata", onMediaReady)
          video.removeEventListener("canplay", onMediaReady)
          video.removeEventListener("error", onVideoError)
          if (cause) reject(cause)
          else resolve()
        }
        const onMediaReady = () => {
          if (playing && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) finish()
        }
        const onVideoError = () => finish(new CameraPreviewError("相机预览未能启动，请重试。"))
        const timeout = window.setTimeout(onVideoError, 15000)

        video.addEventListener("loadedmetadata", onMediaReady)
        video.addEventListener("canplay", onMediaReady)
        video.addEventListener("error", onVideoError)
        releasePreviewRef.current = () => {
          finish()
          stream.getVideoTracks().forEach((track) => track.removeEventListener("ended", onTrackEnded))
          if (video.srcObject === stream) {
            video.pause()
            video.srcObject = null
          }
        }
        video.srcObject = stream
        void video.play().then(() => {
          playing = true
          onMediaReady()
        }).catch(() => finish(new CameraPreviewError("浏览器未能播放相机预览，请重新打开相机。")))
      })

      if (!isCurrent()) return
      const actualFacing = stream.getVideoTracks()[0]?.getSettings().facingMode
      const activeFacing = actualFacing === "user" || actualFacing === "environment" ? actualFacing : nextFacing
      facingRef.current = activeFacing
      setFacing(activeFacing)
      updateStatus("ready")
    } catch (cause) {
      if (!isCurrent()) return
      releaseStream()
      setError(cameraError(cause, switching))
      updateStatus("error")
    }
  }, [clearPhoto, releaseStream, updateStatus])

  const open = useCallback(() => startCamera(facingRef.current), [startCamera])

  const flip = useCallback(async () => {
    // 未开启相机时，切换按钮不会发起权限申请。
    if (statusRef.current !== "ready") return
    await startCamera(facingRef.current === "user" ? "environment" : "user", true)
  }, [startCamera])

  const capture = useCallback(() => {
    const video = videoRef.current
    if (!mountedRef.current || statusRef.current !== "ready" || !video) return
    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setError("相机画面尚未准备好，请稍后再拍。")
      return
    }
    const request = requestRef.current
    const captureId = ++captureRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext("2d")
    if (!context) {
      setError("当前浏览器无法拍照，请换一个浏览器重试。")
      return
    }

    try {
      // 前置相机照片与镜像预览保持一致，后置相机保留原始方向。
      if (facingRef.current === "user") {
        context.translate(canvas.width, 0)
        context.scale(-1, 1)
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (!mountedRef.current || request !== requestRef.current || captureId !== captureRef.current) return
        if (!blob) {
          setError("照片未能保存，请重拍。")
          return
        }
        // 保留原始图片，交给共享保存组件管理预览 URL 和系统保存。
        setPhoto(blob)
        setError("")
      }, "image/jpeg", 0.94)
    } catch {
      setError("照片未能保存，请重拍。")
    }
  }, [])

  return { videoRef, status, error, facing, photo, open, close, flip, capture, clearPhoto }
}
