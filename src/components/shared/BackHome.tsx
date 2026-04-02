"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export function BackHome() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
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
        zhiqiang.dev
      </Link>
    </motion.div>
  )
}
