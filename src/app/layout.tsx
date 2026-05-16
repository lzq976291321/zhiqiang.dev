import type { Metadata } from "next"
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  Instrument_Sans,
} from "next/font/google"
import { GlassNav } from "@/components/layout/GlassNav"
import { siteConfig } from "@/config/site"
import "./globals.css"

const instrument = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
})

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${instrument.variable} ${bricolage.variable} ${mono.variable} dark`}
    >
      <body className="min-h-screen overflow-x-hidden antialiased bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Lin Zhiqiang",
              alternateName: "林志强",
              url: siteConfig.url,
              jobTitle: "全栈 Agent 开发工程师",
              sameAs: [
                "https://github.com/lzq976291321",
              ],
            }),
          }}
        />
        <GlassNav />
        {children}
      </body>
    </html>
  )
}
