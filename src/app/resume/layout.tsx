import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "简历",
  description: "林志强 — 全栈 Agent 开发工程师简历，6 年经验，OpenClaw 多智能体平台作者",
  robots: {
    index: false,
    follow: false,
  },
}

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
