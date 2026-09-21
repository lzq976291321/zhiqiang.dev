import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { execFile } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { promisify } from "node:util"
import { test } from "node:test"
import { createKnowledgeRepository, KNOWLEDGE_COLLECTIONS, MAX_CONTENT_LENGTH } from "../tools/knowledge-mcp/repository.mjs"

const run = promisify(execFile)
const repositoryModule = new URL("../tools/knowledge-mcp/repository.mjs", import.meta.url).href

async function fixture(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "knowledge-repository-test-"))
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  const repository = createKnowledgeRepository({ root })
  async function write(collection, slug, raw, extension = "md") {
    const directory = path.join(root, "src", "content", collection)
    await fs.mkdir(directory, { recursive: true })
    const filename = path.join(directory, `${slug}.${extension}`)
    await fs.writeFile(filename, raw)
    return filename
  }
  return { root, repository, write }
}

const sample = { title: "上下文工程的学习笔记", description: "记录一次开发实践", tags: ["Agent", "实践"], sourceUrl: "https://example.com/context" }

test("新增知识默认草稿，正文和原始出处落盘，列表不包含全文", async (t) => {
  const { root, repository } = await fixture(t)
  const entry = await repository.create({ frontmatter: sample, content: "# 上下文工程\n\n先定义目标，再找资料。" })
  assert.equal(entry.collection, "knowledge")
  assert.equal(entry.slug, sample.title)
  assert.equal(entry.status, "draft")
  assert.equal(entry.confidence, "medium")
  assert.equal(entry.isPublic, false)
  assert.equal(entry.frontmatter.sourceUrl, sample.sourceUrl)
  assert.match(entry.version, /^[a-f0-9]{64}$/)
  assert.match(entry.updatedAt, /^\d{4}-\d{2}-\d{2}$/)
  assert.equal(entry.relativePath, `src/content/knowledge/${sample.title}.md`)
  const stored = await fs.readFile(path.join(root, entry.relativePath))
  assert.equal(createHash("sha256").update(stored).digest("hex"), entry.version)
  const listed = await repository.list()
  assert.equal(listed.total, 1)
  assert.equal("content" in listed.items[0], false)
  assert.equal("frontmatter" in listed.items[0], false)
  assert.equal((await repository.search({ query: "定义目标" })).items[0].slug, entry.slug)
  assert.equal((await repository.list({ status: "published" })).total, 0)
})

test("五分类兼容旧 Markdown/MDX 和日期，只把发布且非低置信内容标为公开", async (t) => {
  const { repository, write } = await fixture(t)
  for (const collection of KNOWLEDGE_COLLECTIONS) {
    await write(collection, "legacy", `---\ntitle: ${collection}\nupdatedAt: 2026-09-14\n---\n旧文章的 MDX import 只是文本。`, "mdx")
  }
  await write("knowledge", "draft", "---\ntitle: 草稿\nstatus: draft\n---\n待处理")
  await write("knowledge", "reviewed", "---\ntitle: 已审核\nstatus: reviewed\n---\n待发布")
  await write("knowledge", "low", "---\ntitle: 低置信度\nstatus: published\nconfidence: low\n---\n尚待查证")
  const all = await repository.list()
  assert.equal(all.total, 8)
  assert.equal(all.items.filter((entry) => entry.isPublic).length, 4)
  assert.equal(all.items.find((entry) => entry.collection === "skills").sourceId, "skill.legacy")
  assert.equal((await repository.read({ collection: "profile", slug: "legacy" })).updatedAt, "2026-09-14")
  assert.equal((await repository.read({ collection: "knowledge", slug: "legacy" })).isPublic, false)
  assert.equal((await repository.list({ collection: "knowledge", status: "draft" })).total, 2)
  assert.equal((await repository.list({ limit: 2, offset: 2 })).items.length, 2)
})

test("更新保留未知元数据、原文件扩展名、权限和稳定来源标识", async (t) => {
  const { root, repository, write } = await fixture(t)
  const filename = await write("skills", "custom", "---\ntitle: 原标题\nsourceId: skill.custom\nid: custom-id\nstatus: published\nupdatedAt: 2020-01-01\nroles: [前端]\ncustom:\n  color: red\n  enabled: true\n---\n原正文\n", "mdx")
  await fs.chmod(filename, 0o640)
  const before = await repository.read({ collection: "skills", slug: "custom" })
  const after = await repository.update({ collection: "skills", slug: "custom", expectedVersion: before.version, content: "更新后的正文", frontmatter: { title: "新标题", tags: ["验证"] } })
  assert.deepEqual(after.frontmatter.custom, { color: "red", enabled: true })
  assert.deepEqual(after.frontmatter.roles, ["前端"])
  assert.equal(after.sourceId, before.sourceId)
  assert.equal(after.id, before.id)
  assert.equal(after.status, "published")
  assert.equal(after.isPublic, true)
  assert.notEqual(after.version, before.version)
  assert.notEqual(after.updatedAt, "2020-01-01")
  assert.equal(after.relativePath, "src/content/skills/custom.mdx")
  assert.equal((await fs.stat(filename)).mode & 0o777, 0o640)
  assert.deepEqual(await fs.readdir(path.join(root, "src/content/skills")), ["custom.mdx"])
  await assert.rejects(repository.update({ collection: "skills", slug: "custom", expectedVersion: after.version, frontmatter: { sourceId: "other.source" } }), { code: "VALIDATION_ERROR" })
})

test("发布、审核和停用均要求最新版本，停用保留正文", async (t) => {
  const { repository } = await fixture(t)
  const draft = await repository.create({ slug: "lifecycle", frontmatter: sample, content: "确认后的资料" })
  const reviewed = await repository.setStatus({ collection: "knowledge", slug: draft.slug, expectedVersion: draft.version, status: "reviewed" })
  assert.equal(reviewed.isPublic, false)
  const published = await repository.setStatus({ collection: "knowledge", slug: draft.slug, expectedVersion: reviewed.version, status: "published" })
  assert.equal(published.isPublic, true)
  await assert.rejects(repository.setStatus({ collection: "knowledge", slug: draft.slug, expectedVersion: draft.version, status: "draft" }), { code: "VERSION_CONFLICT" })
  const disabled = await repository.setStatus({ collection: "knowledge", slug: draft.slug, expectedVersion: published.version, status: "draft" })
  assert.equal(disabled.isPublic, false)
  assert.equal(disabled.content, published.content)
  assert.equal(disabled.sourceId, draft.sourceId)
})

test("重复收藏、同名 MDX 和全库重复标识不能覆盖现有内容", async (t) => {
  const { repository, write } = await fixture(t)
  const original = await repository.create({ frontmatter: sample, content: "第一次收藏" })
  await assert.rejects(repository.create({ frontmatter: sample, content: "重复收藏" }), { code: "ALREADY_EXISTS" })
  assert.equal((await repository.read({ collection: "knowledge", slug: original.slug })).content, original.content)
  await write("knowledge", "existing", "---\ntitle: 已有 MDX\n---\n不能覆盖", "mdx")
  await assert.rejects(repository.create({ slug: "existing", frontmatter: sample, content: "会覆盖吗" }), { code: "ALREADY_EXISTS" })
  await assert.rejects(repository.create({ collection: "agent", slug: "different", frontmatter: { ...sample, sourceId: original.sourceId }, content: "重复来源" }), { code: "ALREADY_EXISTS" })
  await assert.rejects(repository.create({ slug: "different", frontmatter: { ...sample, id: original.id }, content: "重复标识" }), { code: "ALREADY_EXISTS" })
})

test("错误路径、目录和条目符号链接均不能读取或写出知识目录", async (t) => {
  const { root, repository, write } = await fixture(t)
  const outside = path.join(root, "outside")
  await fs.mkdir(outside)
  await fs.writeFile(path.join(outside, "secret.md"), "私有正文")
  await write("knowledge", "normal", "---\ntitle: 正常\n---\n资料")
  for (const slug of ["../outside/secret", "/etc/passwd", "x/y", "x\\y", "..", "x.md"]) {
    await assert.rejects(repository.read({ collection: "knowledge", slug }), { code: "VALIDATION_ERROR" })
    await assert.rejects(repository.create({ slug, frontmatter: sample, content: "不允许写入" }), { code: "VALIDATION_ERROR" })
  }
  await assert.rejects(repository.list({ collection: "../outside" }), { code: "VALIDATION_ERROR" })
  await fs.symlink(path.join(outside, "secret.md"), path.join(root, "src/content/knowledge/linked.md"))
  await assert.rejects(repository.read({ collection: "knowledge", slug: "linked" }), { code: "UNSAFE_PATH" })
  await fs.symlink(outside, path.join(root, "src/content/profile"))
  await assert.rejects(repository.read({ collection: "profile", slug: "secret" }), { code: "UNSAFE_PATH" })
  await assert.rejects(repository.create({ collection: "profile", slug: "injected", frontmatter: sample, content: "不能写出" }), { code: "UNSAFE_PATH" })
  assert.deepEqual(await fs.readdir(outside), ["secret.md"])
})

test("JavaScript frontmatter 和 YAML 函数不能执行，MDX 和正文内容始终作为数据", async (t) => {
  const { root, repository, write } = await fixture(t)
  const marker = path.join(root, "executed")
  await write("knowledge", "javascript", `---javascript\n(() => { process.env.KNOWLEDGE_MCP_EXECUTED = 'yes'; return { title: 'malicious' }; })()\n---\n正文`)
  delete process.env.KNOWLEDGE_MCP_EXECUTED
  await assert.rejects(repository.read({ collection: "knowledge", slug: "javascript" }), { code: "VALIDATION_ERROR" })
  assert.equal(process.env.KNOWLEDGE_MCP_EXECUTED, undefined)
  await fs.unlink(path.join(root, "src/content/knowledge/javascript.md"))
  await write("knowledge", "function", "---\ntitle: !!js/function 'function(){ return 42; }'\n---\n正文")
  await assert.rejects(repository.read({ collection: "knowledge", slug: "function" }), { code: "VALIDATION_ERROR" })
  await fs.unlink(path.join(root, "src/content/knowledge/function.md"))
  const code = `---javascript\n(() => { process.env.KNOWLEDGE_MCP_EXECUTED = 'yes'; return {}; })()\n---\nimport fs from 'node:fs'\n{fs.writeFileSync(${JSON.stringify(marker)}, 'ran')}`
  const entry = await repository.create({ slug: "data", frontmatter: sample, content: code })
  assert.ok(entry.content.startsWith("---javascript"))
  assert.equal(process.env.KNOWLEDGE_MCP_EXECUTED, undefined)
  await assert.rejects(fs.stat(marker), { code: "ENOENT" })
})

test("并发人工修改后旧版本更新被拒绝，原人工内容不丢失", async (t) => {
  const { root, repository } = await fixture(t)
  const before = await repository.create({ slug: "human", frontmatter: sample, content: "原文" })
  const filename = path.join(root, before.relativePath)
  const manual = (await fs.readFile(filename, "utf8")) + "\n人工补充，必须保留。\n"
  await fs.writeFile(filename, manual)
  await assert.rejects(repository.update({ collection: "knowledge", slug: before.slug, expectedVersion: before.version, content: "过时的 AI 内容" }), { code: "VERSION_CONFLICT" })
  assert.equal(await fs.readFile(filename, "utf8"), manual)
})

test("两个独立 MCP 进程同时更新同一版本，仅一次成功，另一次返回冲突", async (t) => {
  const { root, repository } = await fixture(t)
  const before = await repository.create({ slug: "concurrent", frontmatter: sample, content: "共享原文" })
  const script = `import { createKnowledgeRepository } from ${JSON.stringify(repositoryModule)};
    const repository = createKnowledgeRepository({ root: process.argv[1] });
    try { const result = await repository.update({ collection: 'knowledge', slug: 'concurrent', expectedVersion: process.argv[2], content: process.argv[3] }); process.stdout.write(JSON.stringify({ ok: true, content: result.content })); }
    catch (error) { process.stdout.write(JSON.stringify({ ok: false, code: error.code })); }`
  const output = await Promise.all(["客户端 A 的修改", "客户端 B 的修改"].map((content) => run(process.execPath, ["--input-type=module", "-e", script, root, before.version, content])))
  const results = output.map(({ stdout }) => JSON.parse(stdout))
  assert.equal(results.filter((result) => result.ok).length, 1)
  assert.equal(results.find((result) => !result.ok).code, "VERSION_CONFLICT")
  const after = await repository.read({ collection: "knowledge", slug: before.slug })
  assert.equal(after.content, results.find((result) => result.ok).content)
  assert.deepEqual(await fs.readdir(path.join(root, "src/content/knowledge")), ["concurrent.md"])
})

test("并发新增同名知识仅成功一次，metadata和长度校验拒绝错误输入", async (t) => {
  const { repository, write } = await fixture(t)
  const results = await Promise.allSettled(["第一次", "第二次"].map((content) => repository.create({ slug: "duplicate", frontmatter: sample, content })))
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1)
  assert.equal(results.find((result) => result.status === "rejected").reason.code, "ALREADY_EXISTS")
  for (const frontmatter of [{}, { title: "" }, { ...sample, status: "unknown" }, { ...sample, confidence: "certain" }, { ...sample, tags: [null] }, { ...sample, sourceUrl: "javascript:alert(1)" }, { ...sample, sourceUrl: "https://name:password@example.com" }, { ...sample, custom: () => 1 }]) {
    await assert.rejects(repository.create({ slug: "invalid", frontmatter, content: "正文" }), { code: "VALIDATION_ERROR" })
  }
  await assert.rejects(repository.create({ slug: "large", frontmatter: sample, content: "文".repeat(MAX_CONTENT_LENGTH + 1) }), { code: "VALIDATION_ERROR" })
  await assert.rejects(repository.update({ collection: "knowledge", slug: "duplicate", content: "缺少版本" }), { code: "VALIDATION_ERROR" })
  await write("knowledge", "too-large", "a".repeat(450_001))
  await assert.rejects(repository.read({ collection: "knowledge", slug: "too-large" }), { code: "VALIDATION_ERROR" })
})
