"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const sessionStorageKey = "zhiqiang-chat-session-id"

let lastTrackedPath = ""

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function getSessionId() {
  const existing = window.localStorage.getItem(sessionStorageKey)
  if (existing) return existing

  const sessionId = createSessionId()
  window.localStorage.setItem(sessionStorageKey, sessionId)
  return sessionId
}

export function SiteVisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}`
    if (!pathname || lastTrackedPath === path) return

    lastTrackedPath = path

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path,
        sessionId: getSessionId(),
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch((error) => {
      console.error("Failed to track site visit", error)
    })
  }, [pathname])

  return null
}
