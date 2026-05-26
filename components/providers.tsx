"use client"

import { useEffect, useRef } from "react"
import { useThemeStore, applyThemeVars, type ThemeConfig } from "@/lib/use-theme-store"

export function ThemeApplier() {
  const store = useThemeStore()
  const loaded = useRef(false)

  // ── Load published theme from server on first mount ───────────────────────
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true

    fetch("/api/theme")
      .then((r) => r.json())
      .then((saved: ThemeConfig) => {
        if (saved?.accent) {
          store.setAll(saved)
        }
      })
      .catch(() => {
        // Server not available — keep the localStorage values
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Apply CSS vars whenever theme values change ───────────────────────────
  useEffect(() => {
    applyThemeVars(store)
    document.body.setAttribute("data-bg-style", store.bgStyle)
  }, [
    store.accent,
    store.bgColor,
    store.cardOpacity,
    store.borderRadius,
    store.fontFamily,
    store.bgStyle,
    store.glowIntensity,
    store,
  ])

  return null
}
