import Link from "next/link"

export function BackHome() {
  return (
    <div className="animate-fade-in-up">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[13px] text-foreground/30 hover:text-foreground/60 transition-colors group"
      >
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          className="group-hover:-translate-x-0.5 transition-transform"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        zhiqiang.chat
      </Link>
    </div>
  )
}
