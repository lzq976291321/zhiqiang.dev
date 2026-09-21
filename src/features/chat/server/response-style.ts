import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const skillRoot = path.join(process.cwd(), "src/features/chat/skills/vendor/sun-ge")
const referenceNames = readdirSync(path.join(skillRoot, "references"), { recursive: true })
  .filter((name): name is string => typeof name === "string" && name.endsWith(".md"))
  .map((name) => `references/${name.replaceAll(path.sep, "/")}`)
  .sort()
const referenceAllowlist = new Set(referenceNames)
const REFERENCE_PAGE_LENGTH = 8000

// 原版正文和语气材料常驻，其余参考资料通过受限只读工具按需加载。
export const responseStyle = [
  matter(readFileSync(path.join(skillRoot, "SKILL.md"), "utf8")).content.trim(),
  readFileSync(path.join(skillRoot, "references/behavior/voice.md"), "utf8"),
  `可按需读取的原版参考文档：\n${referenceNames.join("\n")}`,
].join("\n\n")

export function readStyleReference(reference: unknown, offset: unknown = 0) {
  if (typeof reference !== "string" || !referenceAllowlist.has(reference)) {
    return { error: "只能读取已安装技能目录中列出的参考文档。" }
  }
  if (typeof offset !== "number" || !Number.isInteger(offset) || offset < 0) {
    return { error: "参考文档的起始位置必须是非负整数。" }
  }
  const content = readFileSync(path.join(skillRoot, reference), "utf8")
  if (offset >= content.length) return { error: "已到达这份参考文档的结尾。" }
  const end = Math.min(offset + REFERENCE_PAGE_LENGTH, content.length)
  return {
    reference,
    text: content.slice(offset, end),
    ...(end < content.length ? { nextOffset: end } : {}),
  }
}
