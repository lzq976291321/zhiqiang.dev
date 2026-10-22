// 只覆盖测试里用到的 Next cookies() 形状；不模拟真实会话。
const store = new Map()

export async function cookies() {
  return {
    getAll: () => [...store.entries()].map(([name, value]) => ({ name, value })),
    get: (name) => store.has(name) ? { name, value: store.get(name) } : undefined,
    set: (name, value) => { store.set(name, value) },
    delete: (name) => { store.delete(name) },
  }
}

export function headers() {
  return new Headers()
}
