import assert from "node:assert/strict"
import { test } from "node:test"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { register } from "node:module"
import { fileURLToPath } from "node:url"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"

const serverPath = fileURLToPath(new URL("../tools/knowledge-mcp/server.mjs", import.meta.url))
const originalCwd = process.cwd()
register(new URL("./chat-agent.test-loader.mjs", import.meta.url))

test("真实 stdio MCP 完成收藏、查重、修改与发布，公开 Agent 只读取公开内容", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "blog-mcp-integration-"))
  t.after(async () => { process.chdir(originalCwd); await fs.rm(root, { recursive: true, force: true }) })
  for (const collection of ["knowledge", "profile", "agent", "mcp", "skills"]) {
    await fs.mkdir(path.join(root, "src/content", collection), { recursive: true })
  }
  process.chdir(root)
  const { getChatCorpus } = await import("../src/lib/chat/corpus.ts")
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath, "--root", root], cwd: os.tmpdir(), stderr: "pipe" })
  const client = new Client({ name: "knowledge-mcp-test", version: "1.0.0" })
  let diagnostics = ""
  transport.stderr.on("data", (chunk) => { diagnostics += chunk.toString() })
  t.after(() => client.close())
  await client.connect(transport)
  assert.equal(client.getServerVersion().name, "zhiqiang-knowledge")
  const listed = await client.listTools()
  assert.deepEqual(listed.tools.map((tool) => tool.name).sort(), ["create_knowledge", "list_knowledge", "read_knowledge", "search_knowledge", "set_knowledge_status", "update_knowledge"])
  assert.equal(listed.tools.find((tool) => tool.name === "search_knowledge").annotations.readOnlyHint, true)
  assert.equal(listed.tools.find((tool) => tool.name === "update_knowledge").annotations.readOnlyHint, false)
  assert.equal(listed.tools.find((tool) => tool.name === "create_knowledge").inputSchema.properties.status, undefined)
  const updateSchema = listed.tools.find((tool) => tool.name === "update_knowledge").inputSchema
  assert.ok(updateSchema.properties.content)
  assert.ok(updateSchema.properties.expectedVersion)
  assert.deepEqual([...updateSchema.required].sort(), ["collection", "expectedVersion", "slug"])

  async function call(name, args) {
    const response = await client.callTool({ name, arguments: args })
    assert.ok(!response.isError, JSON.stringify(response))
    assert.deepEqual(response.structuredContent, JSON.parse(response.content[0].text))
    return response.structuredContent
  }

  const body = "# 版本检查\n\n保存知识前先读出当前版本。只有内容版本一致时才允许更新，发生冲突就重新读取再合并，避免覆盖用户刚刚修改的事实。"
  const created = (await call("create_knowledge", {
    title: "保存知识的版本检查", slug: "version-check", content: body,
    description: "保存前核对版本，防止覆盖。", tags: ["MCP", "知识管理"], sourceUrl: "https://example.com/notes",
  })).document
  assert.equal(created.status, "draft")
  assert.equal(created.confidence, "medium")
  assert.equal(created.savedLocally, true)
  assert.equal(created.deployed, false)
  assert.equal(created.isPublic, false)
  assert.match(await fs.readFile(path.join(root, created.relativePath), "utf8"), /status: draft/)
  assert.equal(getChatCorpus().length, 0)

  const search = await call("search_knowledge", { query: "版本", status: "draft" })
  assert.equal(search.total, 1)
  assert.equal(search.items[0].slug, "version-check")
  const read = (await call("read_knowledge", { collection: "knowledge", slug: created.slug })).document
  assert.equal(read.content.trim(), body)
  assert.equal(read.frontmatter.sourceUrl, "https://example.com/notes")
  const duplicate = await client.callTool({ name: "create_knowledge", arguments: { title: "重复知识", slug: created.slug, content: body } })
  assert.equal(duplicate.isError, true)
  assert.equal(duplicate.structuredContent.error.code, "ALREADY_EXISTS")

  const updated = (await call("update_knowledge", { collection: "knowledge", slug: created.slug, expectedVersion: read.version, title: "更新时先检查版本" })).document
  assert.notEqual(updated.version, read.version)
  const stale = await client.callTool({ name: "update_knowledge", arguments: { collection: "knowledge", slug: created.slug, expectedVersion: read.version, content: "过期客户端的修改" } })
  assert.equal(stale.isError, true)
  assert.equal(stale.structuredContent.error.code, "VERSION_CONFLICT")
  const afterConflict = (await call("read_knowledge", { collection: "knowledge", slug: created.slug })).document
  assert.equal(afterConflict.content.trim(), body)
  assert.equal(afterConflict.sourceId, read.sourceId)
  assert.equal(afterConflict.frontmatter.sourceUrl, read.frontmatter.sourceUrl)

  const reviewed = (await call("set_knowledge_status", { collection: "knowledge", slug: created.slug, expectedVersion: updated.version, status: "reviewed" })).document
  assert.equal(getChatCorpus().length, 0)
  const published = (await call("set_knowledge_status", { collection: "knowledge", slug: created.slug, expectedVersion: reviewed.version, status: "published" })).document
  assert.equal(published.isPublic, true)
  assert.ok(getChatCorpus().some((chunk) => chunk.text.includes("避免覆盖用户")))
  const low = (await call("update_knowledge", { collection: "knowledge", slug: created.slug, expectedVersion: published.version, confidence: "low" })).document
  assert.equal(low.status, "published")
  assert.equal(low.isPublic, false)
  assert.equal(getChatCorpus().length, 0)
  await call("set_knowledge_status", { collection: "knowledge", slug: created.slug, expectedVersion: low.version, status: "draft" })

  const rejected = await client.callTool({ name: "create_knowledge", arguments: { title: "不能绕过草稿", content: body, status: "published" } })
  assert.equal(rejected.isError, true)
  const unsafe = await client.callTool({ name: "read_knowledge", arguments: { collection: "knowledge", slug: "../../.env.local" } })
  assert.equal(unsafe.isError, true)
  const emptyUpdate = await client.callTool({ name: "update_knowledge", arguments: { collection: "knowledge", slug: created.slug, expectedVersion: low.version } })
  assert.equal(emptyUpdate.isError, true)
  const all = await call("list_knowledge", {})
  assert.equal(all.total, 1)
  assert.equal(all.items[0].status, "draft")
  assert.equal(diagnostics, "")
})
