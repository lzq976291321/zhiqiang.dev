import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "关于",
  description: "林志强，全栈 Agent 开发工程师，6 年经验，擅长 AI Agent 驱动的全栈产品研发",
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
