"use client"

import { useEffect, useRef, useState } from "react"
import { X, RotateCcw, Palette, Type, Layers, Sun, Globe, LogOut, CheckCircle, AlertCircle } from "lucide-react"
import { useThemeStore, type ThemeConfig } from "@/lib/use-theme-store"

const ACCENT_PRESETS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Orange", value: "#f97316" },
]

const BG_PRESETS = [
  { label: "Void", value: "#050508" },
  { label: "Navy", value: "#02040f" },
  { label: "Forest", value: "#020c06" },
  { label: "Plum", value: "#08020c" },
  { label: "Charcoal", value: "#0f0f0f" },
  { label: "Slate", value: "#020b12" },
]

const FONT_OPTIONS: { label: string; value: "space-grotesk" | "inter" | "mono" | "slab" }[] = [
  { label: "Space Grotesk", value: "space-grotesk" },
  { label: "Inter", value: "inter" },
  { label: "Mono", value: "mono" },
  { label: "Slab", value: "slab" },
]

const RADIUS_OPTIONS: { label: string; value: "sharp" | "rounded" | "pill" }[] = [
  { label: "Sharp", value: "sharp" },
  { label: "Rounded", value: "rounded" },
  { label: "Pill", value: "pill" },
]

const BG_STYLE_OPTIONS: { label: string; value: "solid" | "mesh" | "dots" | "grid" }[] = [
  { label: "Solid", value: "solid" },
  { label: "Mesh", value: "mesh" },
  { label: "Dots", value: "dots" },
  { label: "Grid", value: "grid" },
]

interface ThemeCustomizerProps {
  open: boolean
  onClose: () => void
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const store = useThemeStore()
  const panelRef = useRef<HTMLDivElement>(null)
  const [publishStatus, setPublishStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [publishError, setPublishError] = useState("")

  const handlePublish = async () => {
    const adminKey = sessionStorage.getItem("admin_key")
    if (!adminKey) return

    setPublishStatus("saving")
    setPublishError("")

    const themePayload: ThemeConfig & { adminKey: string } = {
      accent: store.accent,
      bgColor: store.bgColor,
      cardOpacity: store.cardOpacity,
      borderRadius: store.borderRadius,
      fontFamily: store.fontFamily,
      bgStyle: store.bgStyle,
      siteName: store.siteName,
      tagline: store.tagline,
      adminKey,
    }

    try {
      const res = await fetch("/api/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(themePayload),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (res.ok && data.success) {
        setPublishStatus("saved")
        setTimeout(() => setPublishStatus("idle"), 3000)
      } else {
        setPublishStatus("error")
        setPublishError(data.error ?? "Failed to save")
      }
    } catch {
      setPublishStatus("error")
      setPublishError("Network error")
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem("admin_mode")
    sessionStorage.removeItem("admin_key")
    store.setIsAdmin(false)
    onClose()
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    setTimeout(() => document.addEventListener("mousedown", handler), 0)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-80 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          background: "#0d0d14",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}
        role="dialog"
        aria-label="Theme customizer"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span className="font-semibold text-white text-sm font-display">Customise</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={store.reset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 border border-white/[0.06] hover:border-white/20 transition-colors cursor-pointer"
              title="Reset to defaults"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close customizer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-7">

          {/* Site Identity */}
          <section>
            <SectionLabel icon={<Sun className="w-3.5 h-3.5" />} label="Identity" />
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Site Name</label>
                <input
                  type="text"
                  value={store.siteName}
                  onChange={(e) => store.setSiteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Tagline</label>
                <input
                  type="text"
                  value={store.tagline}
                  onChange={(e) => store.setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  placeholder="Your tagline..."
                />
              </div>
            </div>
          </section>

          {/* Accent colour */}
          <section>
            <SectionLabel icon={<Palette className="w-3.5 h-3.5" />} label="Accent Colour" />
            <div className="grid grid-cols-4 gap-2 mb-3">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => store.setAccent(p.value)}
                  className="h-9 rounded-lg border-2 transition-all duration-150 cursor-pointer hover:scale-110"
                  style={{
                    background: p.value,
                    borderColor: store.accent === p.value ? "white" : "transparent",
                  }}
                  title={p.label}
                  aria-pressed={store.accent === p.value}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-white/40 shrink-0">Custom:</label>
              <input
                type="color"
                value={store.accent}
                onChange={(e) => store.setAccent(e.target.value)}
                className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.08] p-0.5"
              />
              <span className="text-xs font-mono text-white/50">{store.accent}</span>
            </div>
          </section>

          {/* Background */}
          <section>
            <SectionLabel icon={<Sun className="w-3.5 h-3.5" />} label="Background" />
            <div className="grid grid-cols-3 gap-2 mb-3">
              {BG_PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => store.setBgColor(p.value)}
                  className="h-10 rounded-lg border-2 transition-all duration-150 cursor-pointer flex items-end p-1.5 hover:scale-105"
                  style={{
                    background: p.value,
                    borderColor: store.bgColor === p.value ? "var(--accent)" : "rgba(255,255,255,0.08)",
                  }}
                  title={p.label}
                >
                  <span className="text-white/50 text-xs">{p.label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-white/40 shrink-0">Custom:</label>
              <input
                type="color"
                value={store.bgColor}
                onChange={(e) => store.setBgColor(e.target.value)}
                className="w-10 h-8 rounded-lg cursor-pointer bg-transparent border border-white/[0.08] p-0.5"
              />
              <span className="text-xs font-mono text-white/50">{store.bgColor}</span>
            </div>
          </section>

          {/* Card glass opacity */}
          <section>
            <SectionLabel icon={<Layers className="w-3.5 h-3.5" />} label="Card Opacity" />
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={20}
                value={store.cardOpacity}
                onChange={(e) => store.setCardOpacity(Number(e.target.value))}
                className="flex-1 accent-[var(--accent)] cursor-pointer"
                style={{ accentColor: "var(--accent)" }}
              />
              <span className="text-xs font-mono text-white/50 w-6">{store.cardOpacity}</span>
            </div>
          </section>

          {/* Border radius */}
          <section>
            <SectionLabel icon={<Layers className="w-3.5 h-3.5" />} label="Border Radius" />
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => store.setBorderRadius(opt.value)}
                  className="flex-1 py-2 text-xs font-medium border transition-all cursor-pointer"
                  style={{
                    borderRadius: opt.value === "sharp" ? "4px" : opt.value === "rounded" ? "10px" : "999px",
                    background: store.borderRadius === opt.value ? "var(--accent)" : "rgba(255,255,255,0.04)",
                    borderColor: store.borderRadius === opt.value ? "var(--accent)" : "rgba(255,255,255,0.08)",
                    color: store.borderRadius === opt.value ? "white" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Font */}
          <section>
            <SectionLabel icon={<Type className="w-3.5 h-3.5" />} label="Font" />
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => store.setFontFamily(opt.value)}
                  className="py-2.5 px-3 rounded-lg text-xs border transition-all cursor-pointer text-left"
                  style={{
                    fontFamily:
                      opt.value === "space-grotesk"
                        ? "'Space Grotesk', sans-serif"
                        : opt.value === "inter"
                        ? "'Inter', sans-serif"
                        : opt.value === "mono"
                        ? "monospace"
                        : "serif",
                    background: store.fontFamily === opt.value ? "var(--accent-muted)" : "rgba(255,255,255,0.03)",
                    borderColor: store.fontFamily === opt.value ? "var(--accent)" : "rgba(255,255,255,0.08)",
                    color: store.fontFamily === opt.value ? "var(--accent)" : "rgba(255,255,255,0.5)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

        </div>

        {/* Footer — Publish + Logout */}
        <div className="px-5 py-4 border-t border-white/[0.06] space-y-2">
          {/* Publish for Everyone */}
          <button
            onClick={handlePublish}
            disabled={publishStatus === "saving"}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            style={{ background: publishStatus === "saved" ? "#10b981" : "var(--accent)" }}
          >
            {publishStatus === "saving" && <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-white animate-spin" />}
            {publishStatus === "saved" && <CheckCircle className="w-4 h-4" />}
            {publishStatus === "error" && <AlertCircle className="w-4 h-4" />}
            {publishStatus === "idle" && <Globe className="w-4 h-4" />}
            {publishStatus === "saving" ? "Saving…"
              : publishStatus === "saved" ? "Published for everyone!"
              : publishStatus === "error" ? "Error — see below"
              : "Publish for Everyone"}
          </button>

          {publishStatus === "error" && (
            <p className="text-red-400 text-xs text-center">{publishError}</p>
          )}

          {publishStatus !== "error" && (
            <p className="text-xs text-white/20 text-center">
              Previews are instant · click Publish to save for all visitors
            </p>
          )}

          {/* Admin logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-white/40 hover:text-white/70 text-xs transition-colors cursor-pointer border border-white/[0.06] hover:border-white/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit admin mode
          </button>
        </div>
      </div>
    </>
  )
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span style={{ color: "var(--accent)" }}>{icon}</span>
      <span className="text-xs font-semibold text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  )
}
