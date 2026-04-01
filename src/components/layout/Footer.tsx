"use client"

import { siteConfig } from "@/config/site"

const socialLinks = [
  {
    label: "GitHub",
    href: siteConfig.author.github,
    icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
  },
  {
    label: "Twitter",
    href: siteConfig.author.twitter,
    icon: <path d="M4 4l11.733 16h4.267l-11.733 -16h-4.267zm6.617 6.911l-6.617 9.089h4.267l4.617 -6.34" />,
  },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>

          <div className="flex items-center gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground/40 hover:text-foreground/60 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {link.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
