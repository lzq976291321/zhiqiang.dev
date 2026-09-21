import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/chat": ["./src/features/chat/skills/vendor/sun-ge/**/*.md"],
  },
  // 本地凭据、日志和工作文档不应进入任何服务端函数包。
  outputFileTracingExcludes: {
    "/*": [
      "./.local/**",
      "./.env*",
      "./docs/**",
      "./test-results/**",
      "./coverage/**",
      "./supabase/.temp/**",
      "./task_plan.md",
      "./findings.md",
      "./progress.md",
      "./*.tsbuildinfo",
    ],
  },
}

export default nextConfig
