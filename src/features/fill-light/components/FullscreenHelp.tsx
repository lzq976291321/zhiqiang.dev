import { Cat, MoreHorizontal, PlusSquare, Share, X } from "lucide-react"
import type { RefObject } from "react"
import styles from "./FillLight.module.css"

export function FullscreenHelp({ dialogRef, appleMobile, rejected }: {
  dialogRef: RefObject<HTMLDialogElement | null>
  appleMobile: boolean
  rejected: boolean
}) {
  const close = () => dialogRef.current?.close()
  return (
    <dialog ref={dialogRef} className={`${styles.dialog} ${styles.fullscreenHelp} open:animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`} aria-labelledby="fill-light-fullscreen-title" onClick={(event) => {
      if (event.target === event.currentTarget) close()
    }}>
      <div className={styles.dialogHeader}><h2 id="fill-light-fullscreen-title">添加到主屏幕使用</h2><button type="button" className={styles.smallButton} aria-label="关闭全屏指引" onClick={close}><X size={20} /></button></div>
      <p>{appleMobile ? "从桌面打开补光灯，就没有 Safari 地址栏和底部工具栏。" : rejected ? "这次全屏请求未成功。也可以添加到主屏幕，作为独立应用打开。" : "当前浏览器无法直接全屏。可以添加到主屏幕，作为独立应用打开。"}</p>
      <ol className={styles.installSteps}>
        <li><span>{appleMobile ? <Share size={21} /> : <MoreHorizontal size={21} />}</span><div><strong>{appleMobile ? "点 Safari 的“分享”按钮" : "打开浏览器菜单"}</strong><small>{appleMobile ? "没看到分享按钮？先打开地址栏旁的页面菜单。" : "在浏览器的更多选项中查找安装入口。"}</small></div></li>
        <li><span><PlusSquare size={21} /></span><div><strong>{appleMobile ? "选“添加到主屏幕”" : "选“安装应用”或“添加到主屏幕”"}</strong><small>{appleMobile ? "如有“作为网页 App 打开”，保持开启，再点“添加”。" : "按浏览器提示确认添加。"}</small></div></li>
        <li><span><Cat size={22} /></span><div><strong>回到桌面，打开“补光灯”</strong><small>点空白处收起面板，即可开始补光。</small></div></li>
      </ol>
      {appleMobile && <p className={styles.systemNote}>系统状态栏和底部横条由 iOS 控制。</p>}
      <button type="button" className={styles.guideDone} onClick={close}>我知道了</button>
    </dialog>
  )
}
