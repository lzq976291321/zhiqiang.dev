import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "项目",
  description: "个人作品与开源项目展示",
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
