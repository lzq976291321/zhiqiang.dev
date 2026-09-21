// 单元测试手动触发响应结束后的任务；真实 Next.js 生命周期另做 HTTP 验证。
const callbacks = []
export function after(callback) { callbacks.push(callback) }
export function takeAfterCallbacks() { return callbacks.splice(0) }
