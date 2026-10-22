// 认证检查不应拖慢页面；Supabase 不可达时尽快按未登录处理。
export function createTimeoutFetch(timeoutMs = 5_000): typeof fetch {
  return (input, init) => {
    const timeout = AbortSignal.timeout(timeoutMs)
    const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout
    return fetch(input, { ...init, signal })
  }
}
