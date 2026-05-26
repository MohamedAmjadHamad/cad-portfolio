"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ThemeConfig {
  accent: string
  bgColor: string
  cardOpacity: number
  borderRadius: "sharp" | "rounded" | "pill"
  fontFamily: "space-grotesk" | "inter" | "mono" | "slab"
  bgStyle: "solid" | "mesh" | "dots" | "grid" | "aurora"
  siteName: string
  tagline: string
  logoEmoji: string
  glowIntensity: number
  showParticles: boolean
  cardStyle: "glass" | "solid" | "neon"
  hiddenModels: string[]      // model IDs hidden by admin
}

interface ThemeStore extends ThemeConfig {
  isAdmin: boolean
  setIsAdmin: (v: boolean) => void

  setAccent:        (v: string)                    => void
  setBgColor:       (v: string)                    => void
  setCardOpacity:   (v: number)                    => void
  setBorderRadius:  (v: ThemeConfig["borderRadius"]) => void
  setFontFamily:    (v: ThemeConfig["fontFamily"])   => void
  setBgStyle:       (v: ThemeConfig["bgStyle"])      => void
  setSiteName:      (v: string)                    => void
  setTagline:       (v: string)                    => void
  setLogoEmoji:     (v: string)                    => void
  setGlowIntensity: (v: number)                    => void
  setShowParticles: (v: boolean)                   => void
  setCardStyle:     (v: ThemeConfig["cardStyle"])   => void
  setHiddenModels:  (v: string[])                  => void
  toggleHideModel:  (id: string)                   => void

  setAll: (config: ThemeConfig) => void
  reset:  () => void
}

export const DEFAULTS: ThemeConfig = {
  accent:        "#6366f1",
  bgColor:       "#050508",
  cardOpacity:   4,
  borderRadius:  "rounded",
  fontFamily:    "space-grotesk",
  bgStyle:       "mesh",
  siteName:      "Moody",
  tagline:       "Precision-engineered 3D models ready to print",
  logoEmoji:     "⬡",
  glowIntensity: 70,
  showParticles: true,
  cardStyle:     "glass",
  hiddenModels:  [],
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      isAdmin: false,
      setIsAdmin:       (isAdmin)       => set({ isAdmin }),
      setAccent:        (accent)        => set({ accent }),
      setBgColor:       (bgColor)       => set({ bgColor }),
      setCardOpacity:   (cardOpacity)   => set({ cardOpacity }),
      setBorderRadius:  (borderRadius)  => set({ borderRadius }),
      setFontFamily:    (fontFamily)    => set({ fontFamily }),
      setBgStyle:       (bgStyle)       => set({ bgStyle }),
      setSiteName:      (siteName)      => set({ siteName }),
      setTagline:       (tagline)       => set({ tagline }),
      setLogoEmoji:     (logoEmoji)     => set({ logoEmoji }),
      setGlowIntensity: (glowIntensity) => set({ glowIntensity }),
      setShowParticles: (showParticles) => set({ showParticles }),
      setCardStyle:     (cardStyle)     => set({ cardStyle }),
      setHiddenModels:  (hiddenModels)  => set({ hiddenModels }),
      toggleHideModel:  (id)            => {
        const cur = get().hiddenModels
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
        set({ hiddenModels: next })
      },
      setAll:  (config) => set(config),
      reset:   ()       => set(DEFAULTS),
    }),
    {
      name: "cad-portfolio-theme",
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          isAdmin, setIsAdmin, setAccent, setBgColor, setCardOpacity,
          setBorderRadius, setFontFamily, setBgStyle, setSiteName, setTagline,
          setLogoEmoji, setGlowIntensity, setShowParticles, setCardStyle,
          setHiddenModels, toggleHideModel, setAll, reset,
          ...config
        } = state
        return config
      },
    }
  )
)

/** Applies the current theme config as CSS custom properties on <html> */
export function applyThemeVars(theme: ThemeConfig) {
  const root = document.documentElement

  const hex = (theme.accent ?? "#6366f1").replace("#", "")
  const r   = parseInt(hex.slice(0, 2), 16) || 99
  const g   = parseInt(hex.slice(2, 4), 16) || 102
  const b   = parseInt(hex.slice(4, 6), 16) || 241

  root.style.setProperty("--accent",          theme.accent)
  root.style.setProperty("--accent-rgb",       `${r},${g},${b}`)
  root.style.setProperty("--accent-muted",     `rgba(${r},${g},${b},0.15)`)
  root.style.setProperty("--accent-glow",      `rgba(${r},${g},${b},0.35)`)
  root.style.setProperty("--bg-primary",       theme.bgColor)
  root.style.setProperty("--card-opacity",     `${theme.cardOpacity}`)
  root.style.setProperty("--glow-intensity",   `${(theme.glowIntensity ?? 70) / 100}`)

  const radii = { sharp: "4px", rounded: "12px", pill: "9999px" }
  root.style.setProperty("--card-radius", radii[theme.borderRadius] ?? "12px")

  const fonts: Record<string, string> = {
    "space-grotesk": '"Space Grotesk", sans-serif',
    inter:           '"Inter", sans-serif',
    mono:            '"JetBrains Mono", "Courier New", monospace',
    slab:            '"Roboto Slab", Georgia, serif',
  }
  root.style.setProperty("--font-display", fonts[theme.fontFamily] ?? fonts["space-grotesk"])
}
