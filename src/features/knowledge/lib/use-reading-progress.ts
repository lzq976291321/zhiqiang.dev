"use client"

import { useMemo, useSyncExternalStore } from "react"
import { READING_PROGRESS_EVENT, readLastReading, type ReadingProgress } from "./reading-state"

function subscribe(onChange: () => void) {
  window.addEventListener(READING_PROGRESS_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(READING_PROGRESS_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

function getSnapshot(): string | null {
  const progress = readLastReading()
  // 原始对象每次读取都会重建，用稳定字符串避免外部 store 无限触发渲染。
  return progress ? JSON.stringify(progress) : null
}

function getServerSnapshot() {
  return null
}

export function useLastReading(): ReadingProgress | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return useMemo(() => snapshot ? JSON.parse(snapshot) as ReadingProgress : null, [snapshot])
}
