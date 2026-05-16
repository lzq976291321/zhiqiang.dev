"use client"

import { motion } from "framer-motion"

export function ThemeToggle() {
  return (
    <button
      className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/5 transition-colors"
      aria-label="暗色模式"
      type="button"
    >
      <motion.svg
        key="sun"
        initial={{ scale: 0.5, opacity: 0, rotate: -60 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground/50"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </motion.svg>
    </button>
  )
}
