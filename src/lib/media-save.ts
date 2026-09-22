export type MediaSavePlatform = "ios" | "android" | "mobile" | "desktop"

/** 区分手机、平板与桌面；iPad 的桌面版 UA 仍走移动端保存流程。 */
export function mediaSavePlatform(): MediaSavePlatform {
  if (typeof window === "undefined") return "desktop"
  const agent = navigator.userAgent
  if (/iPad|iPhone|iPod/i.test(agent) || (/Macintosh|MacIntel/i.test(`${agent} ${navigator.platform}`) && navigator.maxTouchPoints > 1)) return "ios"
  if (/Android/i.test(agent)) return "android"
  const client = navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  if (client.userAgentData?.mobile || /Mobile|Tablet|Silk/i.test(agent) || (navigator.maxTouchPoints > 0 && window.matchMedia("(pointer: coarse) and (hover: none)").matches)) return "mobile"
  return "desktop"
}

/** 普通文件始终使用下载，不会把 JSON 等配置文件送入媒体分享流程。 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.hidden = true
  document.body.append(anchor)
  try {
    anchor.click()
  } catch (error) {
    URL.revokeObjectURL(url)
    throw error
  } finally {
    anchor.remove()
  }
  // 给移动浏览器留出接管下载的时间，同时避免退出页面后残留 URL。
  const timer = window.setTimeout(release, 60_000)
  function release() {
    clearTimeout(timer)
    URL.revokeObjectURL(url)
    window.removeEventListener("pagehide", release)
  }
  window.addEventListener("pagehide", release, { once: true })
}
