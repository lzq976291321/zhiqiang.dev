import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentDir = path.join(process.cwd(), "src/content")

// Markdown 和 MDX 使用同一套 slug；同名文件必须由维护者明确合并。
function getContentFiles(dir: string) {
  const fullPath = path.join(contentDir, dir)
  if (!fs.existsSync(fullPath)) return []

  const filenames = fs
    .readdirSync(fullPath)
    .filter((filename) => /\.(md|mdx)$/.test(filename))
    .sort()
  const slugs = new Set<string>()

  return filenames.map((filename) => {
    const slug = filename.replace(/\.(md|mdx)$/, "")
    if (slugs.has(slug)) {
      throw new Error(`内容目录 ${dir} 中存在重复 slug「${slug}」，请只保留一个 .md 或 .mdx 文件。`)
    }
    slugs.add(slug)
    return { slug, filePath: path.join(fullPath, filename) }
  })
}

function readContentFile({ slug, filePath }: { slug: string; filePath: string }) {
  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)
  return { slug, frontmatter: data, content }
}

// 保留现有函数名，所有调用方统一支持 .md 和 .mdx。
export function getMdxFiles(dir: string) {
  return getContentFiles(dir).map(readContentFile)
}

export function getMdxBySlug(dir: string, slug: string) {
  const file = getContentFiles(dir).find((file) => file.slug === slug)
  return file ? readContentFile(file) : null
}

// 获取指定目录下所有 slug
export function getAllSlugs(dir: string) {
  return getContentFiles(dir).map((file) => file.slug)
}
