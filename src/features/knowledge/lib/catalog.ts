/** 阅读导航仅描述公开笔记的章节顺序，内容仍由 Markdown 文件提供。 */
export const piBookSections = [
  { title: "架构与阅读", from: 1, to: 3 },
  { title: "模型与通信", from: 4, to: 7 },
  { title: "运行与上下文", from: 8, to: 12 },
  { title: "配置与扩展", from: 13, to: 18 },
  { title: "工具与执行", from: 19, to: 23 },
  { title: "应用与接入", from: 24, to: 30 },
  { title: "设计与边界", from: 31, to: 33 },
]

export function piChapterNumber(slug: string) {
  const match = slug.match(/pi-book-ch(\d+)$/)
  return match ? Number(match[1]) : undefined
}

export function piReadingOrder(slug: string) {
  if (slug === "pi-book-index") return -2
  if (slug === "pi-book-preface") return -1
  return piChapterNumber(slug) ?? 100
}

export function shortBookTitle(title: string) {
  return title.replace(/^pi 设计艺术｜/, "").replace(/^第 \d+ 章：/, "")
}
