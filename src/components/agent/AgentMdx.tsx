import type { ComponentPropsWithoutRef } from "react"
import { MDXRemote } from "next-mdx-remote/rsc"

const components = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className="mt-12 scroll-m-24 font-heading text-3xl font-semibold tracking-[-0.03em] text-white"
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 {...props} className="mt-9 text-xl font-semibold text-white/88" />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p {...props} className="mt-5 text-[17px] leading-8 text-white/66" />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul {...props} className="mt-5 space-y-3 text-white/66" />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li
      {...props}
      className="relative pl-6 leading-7 before:absolute before:left-0 before:top-3 before:size-1.5 before:rounded-full before:bg-cyan-200/70"
    />
  ),
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      {...props}
      className="mt-6 overflow-x-auto rounded-3xl border border-white/10 bg-[#050913]/72 p-5 text-sm leading-7 text-cyan-50/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      {...props}
      className="rounded-lg border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.88em] text-cyan-50"
    />
  ),
}

export function AgentMdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />
}
