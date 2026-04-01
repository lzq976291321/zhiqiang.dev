import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentDir = path.join(process.cwd(), "src/content")

// 读取指定目录下所有 .mdx 文件
export function getMdxFiles(dir: string) {
  const fullPath = path.join(contentDir, dir)
  if (!fs.existsSync(fullPath)) return []

  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const filePath = path.join(fullPath, filename)
      const raw = fs.readFileSync(filePath, "utf-8")
      const { data, content } = matter(raw)
      const slug = filename.replace(/\.mdx$/, "")

      return { slug, frontmatter: data, content }
    })
}

// 读取单个 .mdx 文件
export function getMdxBySlug(dir: string, slug: string) {
  const filePath = path.join(contentDir, dir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return { slug, frontmatter: data, content }
}

// 获取指定目录下所有 slug
export function getAllSlugs(dir: string) {
  const fullPath = path.join(contentDir, dir)
  if (!fs.existsSync(fullPath)) return []

  return fs
    .readdirSync(fullPath)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
}
