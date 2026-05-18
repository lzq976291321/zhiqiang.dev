export interface AgentHeading {
  id: string
  title: string
}

function cleanHeadingTitle(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/\s+#+$/, "")
    .trim()
}

export function createHeadingId(title: string, seen?: Map<string, number>) {
  const base =
    cleanHeadingTitle(title)
      .toLowerCase()
      .replace(/[：:]/g, "-")
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section"

  if (!seen) {
    return base
  }

  const count = (seen.get(base) ?? 0) + 1
  seen.set(base, count)

  return count === 1 ? base : `${base}-${count}`
}

export function extractAgentHeadings(source: string): AgentHeading[] {
  const seen = new Map<string, number>()

  return Array.from(source.matchAll(/^##\s+(.+)$/gm), ([, rawTitle]) => {
    const title = cleanHeadingTitle(rawTitle)

    return {
      id: createHeadingId(title, seen),
      title,
    }
  }).filter((heading) => heading.title.length > 0)
}
