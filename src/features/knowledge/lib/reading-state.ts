export type ReadingProgress = {
  href: string
  title: string
  percent: number
  anchor: string
  offset: number
  scrollY: number
  updatedAt: number
}

export type ReaderPreferences = {
  theme: "light" | "warm" | "dark"
  fontSize: 16 | 18 | 20 | 22
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  theme: "light",
  fontSize: 18,
}

export const READING_PROGRESS_EVENT = "reading-progress"
const PROGRESS_KEY = "knowledge-reading-progress-v1"
const PREFERENCES_KEY = "knowledge-reader-preferences-v1"
const MAX_ENTRIES = 80

function readStorage(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key)
  } catch {
    // 隐私模式或浏览器禁用存储时，阅读仍可正常使用。
    return null
  }
}

function writeStorage(key: string, value: unknown): boolean {
  try {
    if (typeof window === "undefined") return false
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isKnowledgeHref(value: unknown): value is string {
  return typeof value === "string" && value.length <= 300 && /^\/knowledge\/[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)
}

function isFiniteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
}

function parseProgress(value: unknown): ReadingProgress | null {
  if (!isRecord(value) || !isKnowledgeHref(value.href)) return null
  if (typeof value.title !== "string" || !value.title.trim() || value.title.length > 500) return null
  if (typeof value.anchor !== "string" || value.anchor.length > 500 || /[\u0000-\u001f\u007f]/.test(value.anchor)) return null
  if (!isFiniteInRange(value.percent, 0, 100)) return null
  if (!isFiniteInRange(value.offset, -10_000_000, 10_000_000)) return null
  if (!isFiniteInRange(value.scrollY, 0, 10_000_000)) return null
  if (!isFiniteInRange(value.updatedAt, 0, Number.MAX_SAFE_INTEGER) || !Number.isInteger(value.updatedAt)) return null

  return {
    href: value.href,
    title: value.title,
    percent: value.percent,
    anchor: value.anchor,
    offset: value.offset,
    scrollY: value.scrollY,
    updatedAt: value.updatedAt,
  }
}

function readHistory(): ReadingProgress[] {
  const raw = readStorage(PROGRESS_KEY)
  if (!raw || raw.length > 512_000) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.entries)) return []
    const entries = value.entries
      .map(parseProgress)
      .filter((entry): entry is ReadingProgress => entry !== null)
      .sort((a, b) => b.updatedAt - a.updatedAt)
    const seen = new Set<string>()
    return entries.filter((entry) => {
      if (seen.has(entry.href)) return false
      seen.add(entry.href)
      return true
    }).slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

export function readReadingProgress(href: string): ReadingProgress | null {
  if (!isKnowledgeHref(href)) return null
  return readHistory().find((entry) => entry.href === href) ?? null
}

export function readLastReading(): ReadingProgress | null {
  return readHistory()[0] ?? null
}

export function saveReadingProgress(progress: ReadingProgress): void {
  const valid = parseProgress(progress)
  if (!valid) return
  const entries = [valid, ...readHistory().filter((entry) => entry.href !== valid.href)]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_ENTRIES)
  if (writeStorage(PROGRESS_KEY, { version: 1, entries })) {
    window.dispatchEvent(new Event(READING_PROGRESS_EVENT))
  }
}

function parsePreferences(value: unknown): ReaderPreferences {
  if (!isRecord(value)) return { ...DEFAULT_READER_PREFERENCES }
  return {
    theme: value.theme === "light" || value.theme === "warm" || value.theme === "dark"
      ? value.theme : DEFAULT_READER_PREFERENCES.theme,
    fontSize: value.fontSize === 16 || value.fontSize === 18 || value.fontSize === 20 || value.fontSize === 22
      ? value.fontSize : DEFAULT_READER_PREFERENCES.fontSize,
  }
}

export function readReaderPreferences(): ReaderPreferences {
  const raw = readStorage(PREFERENCES_KEY)
  if (!raw || raw.length > 1000) return { ...DEFAULT_READER_PREFERENCES }
  try {
    return parsePreferences(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_READER_PREFERENCES }
  }
}

export function saveReaderPreferences(preferences: ReaderPreferences): void {
  writeStorage(PREFERENCES_KEY, parsePreferences(preferences))
}
