import { Fragment, memo, type ReactNode } from "react"
import styles from "./MessageContent.module.css"

const internalReference =
  /\[(?:profile|agent|skill|mcp|knowledge)(?:\.[a-z0-9_-]+)+\](?!\()/gi
const unfinishedInternalReference =
  /\[(?:profile|agent|skill|mcp|knowledge)(?:\.[a-z0-9_-]*)*$/i
const listItem = /^(\s*)([-+*]|\d+[.)])\s+(.+)$/
const heading = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*$/
const codeFence = /^\s{0,3}(`{3,}|~{3,})([^`]*)$/

function cleanContent(content: string) {
  return content
    .replace(/\r\n?/g, "\n")
    .replace(internalReference, "")
    .replace(unfinishedInternalReference, "")
}

function safeLink(destination: string) {
  const href = destination.replace(/^<(.+)>$/, "$1")

  // 仅允许常用网页、邮件和站内路径，拒绝可执行协议及隐藏控制字符。
  if (
    href.includes("\\") ||
    [...href].some((character) => character.charCodeAt(0) <= 32 || character.charCodeAt(0) === 127)
  ) return null
  if (/^(?:\/(?!\/)|\.\.?\/|#)/.test(href)) return href

  try {
    const url = new URL(href)
    return ["https:", "http:", "mailto:"].includes(url.protocol) ? href : null
  } catch {
    return null
  }
}

function inlineContent(text: string, depth = 0, allowLinks = true): ReactNode {
  if (depth > 3) return text

  const pattern =
    /`([^`\n]+)`|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\[([^\]\n]+)\]\((<?[^\s)\n]+>?)(?:\s+"[^"\n]*")?\)/g
  const nodes: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index))
    const key = `inline-${match.index}`

    if (match[1] !== undefined) {
      nodes.push(<code key={key}>{match[1]}</code>)
    } else if (match[2] !== undefined || match[3] !== undefined) {
      nodes.push(
        <strong key={key}>
          {inlineContent(match[2] ?? match[3], depth + 1, allowLinks)}
        </strong>,
      )
    } else {
      const href = allowLinks ? safeLink(match[5]) : null
      const label = inlineContent(match[4], depth + 1, false)

      nodes.push(
        href ? (
          <a
            key={key}
            href={href}
            target={/^https?:/i.test(href) ? "_blank" : undefined}
            rel={/^https?:/i.test(href) ? "noopener noreferrer" : undefined}
          >
            {label}
          </a>
        ) : (
          <Fragment key={key}>{label}</Fragment>
        ),
      )
    }

    cursor = pattern.lastIndex
  }

  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

function startsBlock(line: string) {
  return heading.test(line) || codeFence.test(line) || listItem.test(line)
}

export const MessageContent = memo(function MessageContent({
  content,
}: {
  content: string
}) {
  const lines = cleanContent(content).split("\n")
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const key = `block-${index}`
    const fenceMatch = line.match(codeFence)
    if (fenceMatch) {
      const marker = fenceMatch[1][0]
      const length = fenceMatch[1].length
      const language = fenceMatch[2].trim().split(/\s+/)[0]
      const code: string[] = []
      index += 1

      while (index < lines.length) {
        const candidate = lines[index].trim()
        const isClosing =
          candidate.length >= length &&
          [...candidate].every((character) => character === marker)

        if (isClosing) {
          index += 1
          break
        }
        code.push(lines[index])
        index += 1
      }

      blocks.push(
        <div className={styles.codeBlock} key={key}>
          {language && <div className={styles.codeLanguage}>{language}</div>}
          <pre tabIndex={0} aria-label={language ? `${language} 代码` : "代码"}>
            <code>{code.join("\n")}</code>
          </pre>
        </div>,
      )
      continue
    }

    const headingMatch = line.match(heading)
    if (headingMatch) {
      const Heading = headingMatch[1].length <= 2 ? "h2" : "h3"
      blocks.push(<Heading key={key}>{inlineContent(headingMatch[2])}</Heading>)
      index += 1
      continue
    }

    const firstItem = line.match(listItem)
    if (firstItem) {
      const ordered = /^\d/.test(firstItem[2])
      const items: string[] = []
      const start = ordered ? Number.parseInt(firstItem[2], 10) : undefined

      while (index < lines.length) {
        const itemMatch = lines[index].match(listItem)
        if (!itemMatch || /^\d/.test(itemMatch[2]) !== ordered) break

        const itemLines = [itemMatch[3]]
        const indentation = itemMatch[1].length
        index += 1

        // 列表的缩进续行属于当前条目，不吞掉后续标题或另一种列表。
        while (
          index < lines.length &&
          lines[index].trim() &&
          !startsBlock(lines[index]) &&
          lines[index].length - lines[index].trimStart().length > indentation
        ) {
          itemLines.push(lines[index].trim())
          index += 1
        }

        items.push(itemLines.join("\n"))
        if (!lines[index]?.trim() && lines[index + 1]?.match(listItem)) index += 1
      }

      const children = items.map((item, itemIndex) => (
        <li key={`${key}-${itemIndex}`}>{inlineContent(item)}</li>
      ))
      blocks.push(
        ordered ? (
          <ol key={key} start={start}>{children}</ol>
        ) : (
          <ul key={key}>{children}</ul>
        ),
      )
      continue
    }

    const paragraph = [line.trim()]
    index += 1
    while (index < lines.length && lines[index].trim() && !startsBlock(lines[index])) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    blocks.push(<p key={key}>{inlineContent(paragraph.join("\n"))}</p>)
  }

  return <div className={styles.content}>{blocks}</div>
})
