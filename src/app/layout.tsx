import type { Metadata } from "next"
import { Work_Sans, Outfit, JetBrains_Mono } from "next/font/google"
import { siteConfig } from "@/config/site"
import "./globals.css"

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
      className={`${workSans.variable} ${outfit.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
