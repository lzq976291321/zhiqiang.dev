import type { ChatClassification } from "./types"

const privacyPatterns = [
  /家庭|父母|母亲|父亲|兄弟|姐妹|亲戚|家人/,
  /住址|地址|住哪|住在哪里|小区|门牌|身份证|户籍/,
  /女友|男友|老婆|老公|婚姻|恋爱|私人关系|亲密关系|伴侣|情感/,
  /财务|资产|存款|收入|工资|薪资|负债|借款|贷款/,
  /日常生活|私生活|隐私|生活习惯|作息|生日|年龄|几岁|身高|体重/,
  /手机号|电话号码|微信|私人联系方式/,
]

const devPatterns = [
  /技术栈|前端|后端|全栈|工程|架构|开发|代码|项目|作品|经验/,
  /agent|智能体|claude|openclaw|mcp|skill|skills|prompt|工具链/i,
  /design token|design lab|设计系统|tailwind|next\.?js|react|typescript/i,
  /seo|aeo|部署|vercel|railway|supabase|prisma|nestjs|node/i,
  /合作|适合|方向|能力|简历|履历|工作经历|项目经历|经历|公开资料|介绍/,
  /你会什么|会什么|能做什么|可以做什么|你能做什么|你擅长什么|擅长什么|有什么能力|能帮我做什么|能提供什么|做过什么|有什么项目/,
]

const neutralPatterns = [
  /^你好[。！!]*$/,
  /^hi[。！!]*$/i,
  /^hello[。！!]*$/i,
  /能问什么|你是谁|介绍一下|帮助|你是做什么的|有什么用/,
]

export function classifyQuestion(question: string): ChatClassification {
  const normalized = question.trim()

  if (!normalized) return "unknown_or_uncovered"

  if (privacyPatterns.some((pattern) => pattern.test(normalized))) {
    return "privacy_blocked"
  }

  if (
    devPatterns.some((pattern) => pattern.test(normalized)) ||
    neutralPatterns.some((pattern) => pattern.test(normalized))
  ) {
    return "allowed_dev"
  }

  return "unknown_or_uncovered"
}

export function getPrivacyBlockedAnswer() {
  return "这个问题超出了 zhiqiang.chat 的公开开发侧边界。我只回答和林志强的技术能力、项目、Agent 设计、MCP、Skills、Design Token Lab、工程偏好和合作方向有关的问题；家庭、住址、关系、财务、日常生活等私人信息不会回答。"
}

export function getUncoveredAnswer() {
  return "公开开发侧资料没有覆盖这个问题，我不能编造。你可以改问：他会什么、能做什么、技术栈、项目经验、工作经历、Agent 设计、MCP / Skills 判断、Design Token Lab，或适合什么类型的合作。"
}
