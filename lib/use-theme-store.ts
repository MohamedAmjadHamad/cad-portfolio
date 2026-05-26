"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ThemeConfig {
  accent: string
  bgColor: string
  cardOpacity: number
  borderRadius: "sharp" | "rounded" | "pill"
  fontFamily: "space-grotesk" | "inter" | "mono" | "slab"
  bgStyle: "solid" | "mesh" | "dots" | "grid"
  siteName: string
  tagline: string
}

interface ThemeStore extends ThemeConfig {
  // Admin state (not persisted — clears on page close)
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void

  // Individual setters (used by the customizer sliders/pickers)
  setAccent: (v: string) => void
  setBgColor: (v: string) => void
  setCardOpacity: (v: number) => void
  setBorderRadius: (v: ThemeConfig["borderRadius"]) => void
  setFontFamily: (v: ThemeConfig["fontFamily"]) => void
  setBgStyle: (v: ThemeConfig["bgStyle"]) => void
  setSiteName: (v: string) => void
  setTagline: (v: string) => void

  // Batch setter — used when loading saved theme from server
  setAll: (config: ThemeConfig) => void

  reset: () => void
}

const DEFAULTS: ThemeConfig = {
  accent: "#6366f1",
  bgColor: "#050508",
  cardOpacity: 4,
  borderRadius: "rounded",
  fontFamily: "space-grotesk",
  bgStyle: "mesh",
  siteName: "Moody",
  tagline: "Precision-engineered 3D models ready to print",
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      isAdmin: false,
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setAccent: (accent) => set({ accent }),
      setBgColor: (bgColor) => set({ bgColor }),
      setCardOpacity: (cardOpacity) => set({ cardOpacity }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setBgStyle: (bgStyle) => set({ bgStyle }),
      setSiteName: (siteName) => set({ siteName }),
      setTagline: (tagline) => set({ tagline }),
      setAll: (config) => set(config),
      reset: () => set(DEFAULTS),
    }),
    {
      name: "cad-portfolio-theme",
      // Don't persist isAdmin — admin session resets when browser closes
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isAdmin, setIsAdmin, setAccent, setBgColor, setCardOpacity,
          setBorderRadius, setFontFamily, setBgStyle, setSiteName, setTagline,
          setAll, reset, ...config } = state
        return config
      },
    }
  )
)

/** Applies the current theme config as CSS custom properties on <html> */
export function applyThemeVars(theme: ThemeConfig) {
  const root = document.documentElement

  const hex = theme.accent.replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  root.style.setProperty("--accent", theme.accent)
  root.style.setProperty("--accent-rgb", `${r},${g},${b}`)
  root.style.setProperty("--accent-muted", `rgba(${r},${g},${b},0.15)`)
  root.style.setProperty("--accent-glow", `rgba(${r},${g},${b},0.35)`)
  root.style.setProperty("--bg-primary", theme.bgColor)
  root.style.setProperty("--card-opacity", `${theme.cardOpacity}`)

  const radii = { sharp: "4px", rounded: "12px", pill: "9999px" }
  root.style.setProperty("--card-radius", radii[theme.borderRadius])

  const fonts: Record<string, string> = {
    "space-grotesk": '"Space Grotesk", sans-serif',
    inter: '"Inter", sans-serif',
    mono: '"JetBrains Mono", monospace',
    slab: '"Roboto Slab", serif',
  }
  root.style.setProperty("--font-display", fonts[theme.fontFamily])
}
