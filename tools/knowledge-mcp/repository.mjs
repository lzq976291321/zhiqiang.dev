import { constants } from "node:fs"
import fs from "node:fs/promises"
import { createHash, randomUUID } from "node:crypto"
import os from "node:os"
import path from "node:path"
import { setTimeout as delay } from "node:timers/promises"
import matter from "gray-matter"

export const KNOWLEDGE_COLLECTIONS = ["profile", "knowledge", "agent", "mcp", "skills"]
export const KNOWLEDGE_STATUSES = ["draft", "reviewed", "published"]
export const MAX_CONTENT_LENGTH = 100_000
const MAX_FILE_BYTES = 450_000
const MAX_FILE_LENGTH = 110_000
const MAX_FRONTMATTER_LENGTH = 10_000
const SLUG_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}_-]{0,119}$/u
const ID_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}._:-]{0,199}$/u
const PARSE_OPTIONS = { language: "yaml", engines: { yml: matter.engines.yaml } }

function failure(code, message) {
  return Object.assign(new Error(message), { code })
}

function requireValue(condition, message) {
  if (!condition) throw failure("VALIDATION_ERROR", message)
}

function validateCollection(collection) {
  requireValue(KNOWLEDGE_COLLECTIONS.includes(collection), "collection 必须是 profile、knowledge、agent、mcp 或 skills。")
  return collection
}

function validateSlug(slug) {
  requireValue(typeof slug === "string" && SLUG_PATTERN.test(slug), "slug 只能包含文字、数字、下划线和连字符，长度为 1–120，且必须以文字或数字开头。")
  return slug
}

function validateStatus(status) {
  requireValue(KNOWLEDGE_STATUSES.includes(status), "status 必须是 draft、reviewed 或 published。")
  return status
}

function validateContent(content) {
  requireValue(typeof content === "string" && content.trim().length > 0, "content 必须是非空 Markdown 正文。")
  requireValue(content.length <= MAX_CONTENT_LENGTH, `content 不能超过 ${MAX_CONTENT_LENGTH} 个字符。`)
}

// frontmatter 只能是数据；限制深度、循环引用和不安全键，同时保留未知字段。
function normalizeData(value, depth = 0, seen = new Set(), budget = { count: 0 }) {
  requireValue(depth <= 12 && ++budget.count <= 2_000, "frontmatter 结构过深或过大。")
  if (value instanceof Date) {
    requireValue(Number.isFinite(value.getTime()), "frontmatter 包含无效日期。")
    return value.toISOString()
  }
  if (value === null || typeof value === "boolean") return value
  if (typeof value === "string") {
    requireValue(value.length <= MAX_FRONTMATTER_LENGTH, "frontmatter 字段过长。")
    return value
  }
  if (typeof value === "number") {
    requireValue(Number.isFinite(value), "frontmatter 数字必须为有限值。")
    return value
  }
  requireValue(value && typeof value === "object" && !seen.has(value), "frontmatter 只能包含普通数据，不能含循环引用或函数。")
  requireValue(Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, "frontmatter 必须是普通对象。")
  seen.add(value)
  let result
  if (Array.isArray(value)) result = value.map((entry) => normalizeData(entry, depth + 1, seen, budget))
  else result = Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    requireValue(!["__proto__", "prototype", "constructor"].includes(key), "frontmatter 包含不安全字段。")
    return [key, normalizeData(entry, depth + 1, seen, budget)]
  }))
  seen.delete(value)
  return result
}

function metadata(input, { requireTitle = false } = {}) {
  requireValue(input && typeof input === "object" && !Array.isArray(input), "frontmatter 必须是对象。")
  const data = normalizeData(input)
  requireValue(JSON.stringify(data).length <= MAX_FRONTMATTER_LENGTH, "frontmatter 总长度不能超过 10000 个字符。")
  if (requireTitle || data.title !== undefined) requireValue(typeof data.title === "string" && data.title.trim().length > 0 && data.title.length <= 200, "title 必须是 1–200 个字符的非空文本。")
  if (data.description !== undefined) requireValue(typeof data.description === "string" && data.description.length <= 2_000, "description 必须是不超过 2000 个字符的文本。")
  if (data.tags !== undefined) requireValue(Array.isArray(data.tags) && data.tags.length <= 30 && data.tags.every((tag) => typeof tag === "string" && tag.trim().length > 0 && tag.length <= 80), "tags 最多 30 项，每项必须是 1–80 个字符的文本。")
  if (data.status !== undefined) validateStatus(data.status)
  if (data.confidence !== undefined) requireValue(["low", "medium", "high"].includes(data.confidence), "confidence 必须是 low、medium 或 high。")
  for (const key of ["id", "sourceId"]) {
    if (data[key] !== undefined) requireValue(typeof data[key] === "string" && ID_PATTERN.test(data[key]), `${key} 必须是稳定标识，不能含路径或空白。`)
  }
  if (data.sourceUrl !== undefined) {
    let url
    try { url = new URL(data.sourceUrl) } catch { /* 统一使用下面的校验错误。 */ }
    requireValue(typeof data.sourceUrl === "string" && url && ["https:", "http:"].includes(url.protocol) && !url.username && !url.password, "sourceUrl 必须是没有账户信息的 HTTP 或 HTTPS 地址。")
  }
  if (data.publicPath !== undefined) requireValue(typeof data.publicPath === "string" && data.publicPath.startsWith("/") && !data.publicPath.startsWith("//") && !/[\\\r\n]/.test(data.publicPath), "publicPath 必须是站内路径。")
  return data
}

function parseDocument(raw) {
  requireValue(raw.length <= MAX_FILE_LENGTH, "知识文件过大，无法通过 MCP 管理。")
  const normalized = raw.replace(/^\uFEFF/, "")
  if (normalized.startsWith("---") && !normalized.startsWith("----")) {
    const header = normalized.split(/\r?\n/, 1)[0]
    requireValue(/^---(?:[ \t]*(?:yaml|yml|json))?[ \t]*$/.test(header), "只允许 YAML 或 JSON frontmatter；不会执行 JavaScript。")
    requireValue(/\r?\n---(?:\r?\n|$)/.test(normalized), "frontmatter 缺少结束分隔符。")
  }
  let parsed
  try { parsed = matter(normalized, PARSE_OPTIONS) } catch {
    throw failure("VALIDATION_ERROR", "无法解析 frontmatter，请使用有效的 YAML 或 JSON 数据。")
  }
  requireValue(parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data), "frontmatter 必须是对象。")
  requireValue(parsed.content.length <= MAX_CONTENT_LENGTH, "知识正文过大，无法通过 MCP 管理。")
  const data = normalizeData(parsed.data)
  for (const key of ["date", "updatedAt"]) {
    if (parsed.data[key] instanceof Date) data[key] = parsed.data[key].toISOString().slice(0, 10)
  }
  return { content: parsed.content, frontmatter: data }
}

function serializeDocument(content, frontmatter) {
  // 传对象，防止 gray-matter.stringify 再次将正文当作可执行 frontmatter 解析。
  const raw = matter.stringify({ content, data: {} }, frontmatter, PARSE_OPTIONS)
  requireValue(raw.length <= MAX_FILE_LENGTH && Buffer.byteLength(raw, "utf8") <= MAX_FILE_BYTES, "知识文件过大。")
  return raw
}

function localDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function versionOf(raw) {
  return createHash("sha256").update(raw).digest("hex")
}

function sourceIdOf(collection, slug, data) {
  return data.sourceId ?? `${collection === "skills" ? "skill" : collection}.${slug}`
}

function summaryOf(entry) {
  const data = entry.frontmatter
  // knowledge 从建立起就要求明确发布，其他旧分类沿用站点的兼容规则。
  const status = data.status === undefined
    ? entry.collection === "knowledge" ? "draft" : "published"
    : KNOWLEDGE_STATUSES.includes(data.status) ? data.status : "draft"
  return {
    collection: entry.collection,
    slug: entry.slug,
    title: typeof data.title === "string" ? data.title : entry.slug,
    description: typeof data.description === "string" ? data.description : "",
    tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === "string") : [],
    id: data.id ?? `${entry.collection}.${entry.slug}`,
    sourceId: sourceIdOf(entry.collection, entry.slug, data),
    status,
    confidence: data.confidence ?? "medium",
    updatedAt: data.updatedAt ?? data.date ?? null,
    isPublic: status === "published" && data.confidence !== "low",
    relativePath: entry.relativePath,
    version: entry.version,
  }
}

async function statIfPresent(filename) {
  try { return await fs.lstat(filename) } catch (error) {
    if (error.code === "ENOENT") return null
    throw error
  }
}

/** root 是项目根目录；所有知识访问固定在 src/content 的五个分类中。 */
export function createKnowledgeRepository({ root }) {
  requireValue(typeof root === "string" && path.isAbsolute(root), "root 必须是项目根目录的绝对路径。")
  const resolvedRoot = fs.realpath(root)

  async function directory(collection, { create = false } = {}) {
    validateCollection(collection)
    let current = await resolvedRoot
    for (const part of ["src", "content", collection]) {
      current = path.join(current, part)
      let stat = await statIfPresent(current)
      if (!stat && create) {
        try { await fs.mkdir(current) } catch (error) { if (error.code !== "EEXIST") throw error }
        stat = await statIfPresent(current)
      }
      if (!stat) return null
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw failure("UNSAFE_PATH", "知识目录不能是符号链接或普通文件。")
      if (await fs.realpath(current) !== current) throw failure("UNSAFE_PATH", "知识目录的真实路径发生变化。")
    }
    return current
  }

  async function locate(collection, slug) {
    validateSlug(slug)
    const dir = await directory(collection)
    if (!dir) throw failure("NOT_FOUND", "找不到该知识条目。")
    const candidates = []
    for (const extension of [".md", ".mdx"]) {
      const filename = path.join(dir, `${slug}${extension}`)
      const stat = await statIfPresent(filename)
      if (!stat) continue
      if (stat.isSymbolicLink() || !stat.isFile()) throw failure("UNSAFE_PATH", "知识条目不能是符号链接或特殊文件。")
      candidates.push(filename)
    }
    if (candidates.length === 0) throw failure("NOT_FOUND", "找不到该知识条目。")
    if (candidates.length > 1) throw failure("ALREADY_EXISTS", "同时存在同名 .md 和 .mdx，请先在本地消除歧义。")
    return candidates[0]
  }

  async function load(collection, slug) {
    const filename = await locate(collection, slug)
    let handle
    try {
      handle = await fs.open(filename, constants.O_RDONLY | constants.O_NOFOLLOW)
      const stat = await handle.stat()
      if (!stat.isFile()) throw failure("UNSAFE_PATH", "知识条目必须是普通文件。")
      requireValue(stat.size <= MAX_FILE_BYTES, "知识文件过大，无法通过 MCP 管理。")
      const buffer = Buffer.alloc(MAX_FILE_BYTES + 1)
      let bytesRead = 0
      while (bytesRead < buffer.length) {
        const next = await handle.read(buffer, bytesRead, buffer.length - bytesRead, bytesRead)
        if (next.bytesRead === 0) break
        bytesRead += next.bytesRead
      }
      requireValue(bytesRead <= MAX_FILE_BYTES, "知识文件过大，无法通过 MCP 管理。")
      const raw = buffer.subarray(0, bytesRead)
      await directory(collection)
      const latest = await statIfPresent(filename)
      if (!latest || latest.isSymbolicLink() || latest.ino !== stat.ino || latest.dev !== stat.dev) throw failure("VERSION_CONFLICT", "读取期间文件发生变化，请重新读取。")
      const after = await handle.stat()
      if (after.size !== stat.size || after.mtimeMs !== stat.mtimeMs || after.ctimeMs !== stat.ctimeMs) throw failure("VERSION_CONFLICT", "读取期间文件发生变化，请重新读取。")
      return { collection, slug, filename, mode: stat.mode & 0o777, raw, version: versionOf(raw), relativePath: `src/content/${collection}/${path.basename(filename)}`, ...parseDocument(raw.toString("utf8")) }
    } catch (error) {
      if (error.code === "ELOOP") throw failure("UNSAFE_PATH", "知识条目不能是符号链接。")
      if (error.code === "ENOENT") throw failure("NOT_FOUND", "找不到该知识条目。")
      throw error
    } finally { await handle?.close() }
  }

  async function read({ collection, slug }) {
    const entry = await load(collection, slug)
    return { ...summaryOf(entry), content: entry.content, frontmatter: entry.frontmatter }
  }

  async function allEntries(collection) {
    const entries = []
    for (const group of collection === undefined ? KNOWLEDGE_COLLECTIONS : [validateCollection(collection)]) {
      const dir = await directory(group)
      if (!dir) continue
      const names = await fs.readdir(dir)
      const slugs = new Set(names.filter((name) => /\.mdx?$/.test(name)).map((name) => name.replace(/\.mdx?$/, "")))
      for (const slug of [...slugs].sort()) entries.push(await load(group, slug))
    }
    return entries
  }

  function pagination({ limit = 50, offset = 0, status, collection } = {}) {
    requireValue(Number.isInteger(limit) && limit >= 1 && limit <= 100, "limit 必须是 1–100 的整数。")
    requireValue(Number.isInteger(offset) && offset >= 0, "offset 必须是非负整数。")
    if (status !== undefined) validateStatus(status)
    if (collection !== undefined) validateCollection(collection)
    return { limit, offset, status, collection }
  }

  async function list(options = {}) {
    const { limit, offset, status, collection } = pagination(options)
    const items = (await allEntries(collection)).map(summaryOf).filter((entry) => status === undefined || entry.status === status)
      .sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")) || a.relativePath.localeCompare(b.relativePath))
    return { items: items.slice(offset, offset + limit), total: items.length, limit, offset }
  }

  async function search({ query, ...options }) {
    requireValue(typeof query === "string" && query.trim().length > 0 && query.length <= 500, "query 必须是 1–500 个字符的非空文本。")
    const { limit, offset, status, collection } = pagination({ limit: 20, ...options })
    const terms = [...new Set(query.toLocaleLowerCase().trim().split(/\s+/))]
    const results = []
    for (const entry of await allEntries(collection)) {
      const summary = summaryOf(entry)
      if (status !== undefined && summary.status !== status) continue
      const title = summary.title.toLocaleLowerCase()
      const text = `${summary.description}\n${summary.tags.join(" ")}\n${entry.content}`.toLocaleLowerCase()
      const score = terms.reduce((total, term) => total + (title.includes(term) ? 4 : 0) + (text.includes(term) ? 1 : 0), 0)
      if (score === 0) continue
      const first = terms.map((term) => entry.content.toLocaleLowerCase().indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? 0
      const start = Math.max(0, first - 60)
      results.push({ ...summary, score, excerpt: `${start > 0 ? "…" : ""}${entry.content.slice(start, start + 320).trim()}${entry.content.length > start + 320 ? "…" : ""}` })
    }
    results.sort((a, b) => b.score - a.score || String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")) || a.relativePath.localeCompare(b.relativePath))
    return { items: results.slice(offset, offset + limit), total: results.length, limit, offset }
  }

  async function withWriteLock(action) {
    const key = createHash("sha256").update(await resolvedRoot).digest("hex").slice(0, 24)
    const lock = path.join(os.tmpdir(), `zhiqiang-knowledge-mcp-${key}.lock`)
    const started = Date.now()
    while (true) {
      try {
        await fs.mkdir(lock, { mode: 0o700 })
        break
      } catch (error) {
        if (error.code !== "EEXIST") throw error
        const stat = await statIfPresent(lock)
        if (stat && (stat.isSymbolicLink() || !stat.isDirectory())) throw failure("UNSAFE_PATH", "知识库写入锁路径不安全。")
        if (Date.now() - started >= 5_000) throw failure("LOCK_TIMEOUT", `知识库仍被其他写入占用，请稍后重试。若客户端异常退出，请先确认没有写入进程，再清理遗留锁：${lock}`)
        await delay(20)
      }
    }
    try {
      await fs.writeFile(path.join(lock, "owner.json"), JSON.stringify({ pid: process.pid, root: await resolvedRoot, createdAt: new Date().toISOString() }), { flag: "wx", mode: 0o600 })
      return await action()
    } finally {
      await fs.unlink(path.join(lock, "owner.json")).catch((error) => { if (error.code !== "ENOENT") throw error })
      await fs.rmdir(lock)
    }
  }

  async function ensureNewIdentity(frontmatter) {
    for (const entry of await allEntries()) {
      const summary = summaryOf(entry)
      if (summary.id === frontmatter.id || summary.sourceId === frontmatter.sourceId) throw failure("ALREADY_EXISTS", "id 或 sourceId 已存在，请使用新的稳定标识。")
    }
  }

  async function writeAtomically({ collection, slug, raw, current }) {
    const dir = await directory(collection, { create: true })
    const filename = current?.filename ?? path.join(dir, `${slug}.md`)
    const temporary = path.join(dir, `.knowledge-mcp-${randomUUID()}.tmp`)
    let handle
    try {
      handle = await fs.open(temporary, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, current?.mode ?? 0o644)
      if (current) await handle.chmod(current.mode)
      await handle.writeFile(raw, "utf8")
      await handle.sync()
      await handle.close()
      handle = undefined
      await directory(collection)
      if (current) {
        const latest = await load(collection, slug)
        if (latest.filename !== filename || latest.version !== current.version) throw failure("VERSION_CONFLICT", "知识已被其他客户端或人工编辑，请重新读取并合并后再更新。")
        await fs.rename(temporary, filename)
      } else {
        for (const extension of [".md", ".mdx"]) {
          if (await statIfPresent(path.join(dir, `${slug}${extension}`))) throw failure("ALREADY_EXISTS", "同名知识条目已存在，不会覆盖。")
        }
        // link 的目标创建具有排他性，不能像 rename 一样覆盖并发创建的文件。
        await fs.link(temporary, filename)
      }
    } catch (error) {
      if (error.code === "EEXIST") throw failure("ALREADY_EXISTS", "同名知识条目已存在，不会覆盖。")
      throw error
    } finally {
      await handle?.close()
      await fs.unlink(temporary).catch((error) => { if (error.code !== "ENOENT") throw error })
    }
    return read({ collection, slug })
  }

  async function create({ collection = "knowledge", slug, content, frontmatter }) {
    validateCollection(collection)
    validateContent(content)
    const input = metadata(frontmatter, { requireTitle: true })
    if (slug === undefined) {
      const base = input.title.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^[-_]+|[-_]+$/g, "").slice(0, 100) || "knowledge"
      slug = base
    }
    validateSlug(slug)
    const data = metadata({ ...input, title: input.title.trim(), id: input.id ?? `${collection}.${slug}`, sourceId: sourceIdOf(collection, slug, input), status: input.status ?? "draft", confidence: input.confidence ?? "medium", updatedAt: localDate() }, { requireTitle: true })
    return withWriteLock(async () => {
      await ensureNewIdentity(data)
      return writeAtomically({ collection, slug, raw: serializeDocument(content, data) })
    })
  }

  async function update({ collection, slug, expectedVersion, content, frontmatter }) {
    validateCollection(collection)
    validateSlug(slug)
    requireValue(typeof expectedVersion === "string" && /^[a-f0-9]{64}$/.test(expectedVersion), "更新必须提供最近一次读取返回的 expectedVersion。")
    requireValue(content !== undefined || frontmatter !== undefined, "至少提供 content 或 frontmatter。")
    if (content !== undefined) validateContent(content)
    const patch = frontmatter === undefined ? {} : metadata(frontmatter)
    return withWriteLock(async () => {
      const current = await load(collection, slug)
      if (current.version !== expectedVersion) throw failure("VERSION_CONFLICT", "知识已被其他客户端或人工编辑，请重新读取并合并后再更新。")
      const identity = summaryOf(current)
      for (const key of ["id", "sourceId"]) requireValue(patch[key] === undefined || patch[key] === identity[key], `${key} 是稳定标识，更新时不能修改。`)
      const data = metadata({ ...current.frontmatter, ...patch, id: identity.id, sourceId: identity.sourceId, updatedAt: localDate() })
      return writeAtomically({ collection, slug, raw: serializeDocument(content ?? current.content, data), current })
    })
  }

  async function setStatus({ collection, slug, expectedVersion, status }) {
    validateStatus(status)
    return update({ collection, slug, expectedVersion, frontmatter: { status } })
  }

  return { list, search, read, create, update, setStatus }
}
