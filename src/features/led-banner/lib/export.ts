export async function canvasToPng(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("图片生成失败，请重试。")
  return blob
}

export function supportedVideoType() {
  if (typeof MediaRecorder === "undefined") return ""
  // 优先使用手机相册普遍支持的 H.264 / MP4，旧浏览器仍可导出 WebM。
  return ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type)) || ""
}
