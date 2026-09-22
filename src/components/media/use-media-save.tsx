"use client"

import { useCallback, useState } from "react"
import { downloadBlob, mediaSavePlatform } from "@/lib/media-save"
import { MediaSaveDialog } from "./MediaSaveDialog"

/** 业务层负责生成媒体；手机预览和桌面下载在这里使用同一入口。 */
export function useMediaSave() {
  const [media, setMedia] = useState<{ file: File; returnFocus: HTMLElement | null } | null>(null)
  const close = useCallback(() => setMedia(null), [])
  const saveMedia = useCallback((blob: Blob, filename: string, returnFocus?: HTMLElement | null): void => {
    if (!/^(image|video)\//i.test(blob.type) || mediaSavePlatform() === "desktop") {
      downloadBlob(blob, filename)
      return
    }
    setMedia({
      file: new File([blob], filename, { type: blob.type.split(";")[0] }),
      returnFocus: returnFocus === undefined ? (document.activeElement instanceof HTMLElement ? document.activeElement : null) : returnFocus,
    })
  }, [])

  return {
    saveMedia,
    mediaSaveDialog: media ? <MediaSaveDialog file={media.file} returnFocus={media.returnFocus} onClose={close} /> : null,
  }
}
