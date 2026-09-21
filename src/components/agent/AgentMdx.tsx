import { isValidElement, type ComponentPropsWithoutRef, type ReactNode } from "react"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { createHeadingId } from "@/lib/agent-headings"
import styles from "@/features/knowledge/components/Reader.module.css"

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(getNodeText).join("")
  if (isValidElement<{ children?: ReactNode }>(node)) return getNodeText(node.props.children)
  return ""
}

function createComponents() {
  const headingIds = new Map<string, number>()
  return {
    h2: ({ children, id, ...props }: ComponentPropsWithoutRef<"h2">) => {
      const title = getNodeText(children)
      return <h2 {...props} id={id ?? (title ? createHeadingId(title, headingIds) : undefined)}>{children}</h2>
    },
    a: ({ href, ...props }: ComponentPropsWithoutRef<"a">) => {
      // 笔记保留源码里的相对 Markdown 链接，阅读时映射为公开路由。
      const chapter = href?.match(/^\.\/(pi-book-[\w-]+)\.md(#[^\s]*)?$/)
      return <a {...props} href={chapter ? `/knowledge/${chapter[1]}${chapter[2] ?? ""}` : href} />
    },
    table: (props: ComponentPropsWithoutRef<"table">) => <div className={styles.tableWrap}><table {...props} /></div>,
  }
}

export function AgentMdx({ source, format = "mdx" }: { source: string; format?: "md" | "mdx" }) {
  return <div className={styles.prose}><MDXRemote source={source} components={createComponents()} options={{ mdxOptions: { format, remarkPlugins: [remarkGfm] } }} /></div>
}
