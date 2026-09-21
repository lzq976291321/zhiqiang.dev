import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import path from "node:path"
import ts from "typescript"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const sourceRoot = pathToFileURL(path.join(root, "src") + path.sep).href

// module.register 在项目固定的 Node 22.11 中可用；复用 TypeScript，不生成临时构建目录。
export function resolve(specifier, context, nextResolve) {
  if (specifier === "next/server") return { url: new URL("./next-server.test-stub.mjs", import.meta.url).href, shortCircuit: true }
  let resolved = specifier
  if (specifier.startsWith("@/")) resolved = pathToFileURL(path.join(root, "src", specifier.slice(2))).href
  else if (specifier.startsWith(".") && context.parentURL?.startsWith(sourceRoot)) {
    resolved = new URL(specifier, context.parentURL).href
  }
  if (resolved.startsWith(sourceRoot) && !path.extname(fileURLToPath(resolved)) && existsSync(fileURLToPath(resolved) + ".ts")) {
    resolved += ".ts"
  }
  return nextResolve(resolved, context)
}

export function load(url, context, nextLoad) {
  if (url.startsWith(sourceRoot) && url.endsWith(".ts")) {
    return {
      format: "module",
      shortCircuit: true,
      source: ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText,
    }
  }
  return nextLoad(url, context)
}
