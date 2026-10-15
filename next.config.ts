import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // 真机局域网调试按启动参数放行指定主机，不写死个人网络地址。
  allowedDevOrigins: process.env.LOCAL_PREVIEW_HOST ? [process.env.LOCAL_PREVIEW_HOST] : [],
  async headers() {
    return [
      {
        source: "/resume.docx",
        // 下载文件与简历页面一样，只供访客按需查看，不进入搜索结果。
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ]
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
