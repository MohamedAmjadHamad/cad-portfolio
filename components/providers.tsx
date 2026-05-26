"use client"

import { useEffect } from "react"
import { useThemeStore, applyThemeVars } from "@/lib/use-theme-store"

export function ThemeApplier() {
  const theme = useThemeStore()

  useEffect(() => {
    applyThemeVars(theme)
    // Apply background style as a data attribute
    document.body.setAttribute("data-bg-style", theme.bgStyle)
    // Apply font-display CSS var
    document.documentElement.style.setProperty("--font-display", (() => {
      const fonts: Record<string, string> = {
        "space-grotesk": "'Space Grotesk', sans-serif",
        inter: "'Inter', sans-serif",
        mono: "'JetBrains Mono', monospace",
        slab: "'Roboto Slab', serif",
      }
      return fonts[theme.fontFamily] ?? fonts["space-grotesk"]
    })())
  }, [
    theme.accent,
    theme.bgColor,
    theme.cardOpacity,
    theme.borderRadius,
    theme.fontFamily,
    theme.bgStyle,
    theme,
  ])

  return null
}
