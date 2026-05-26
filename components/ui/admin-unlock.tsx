"use client"

import { useEffect, useState } from "react"
import { Lock, X, Eye, EyeOff } from "lucide-react"
import { useThemeStore } from "@/lib/use-theme-store"

export function AdminUnlock() {
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const setIsAdmin = useThemeStore((s) => s.setIsAdmin)
  const isAdmin = useThemeStore((s) => s.isAdmin)

  // Restore session if still active (tab reload)
  useEffect(() => {
    if (sessionStorage.getItem("admin_mode") === "true") {
      setIsAdmin(true)
    }
  }, [setIsAdmin])

  // Ctrl + Shift + A = open unlock modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault()
        if (isAdmin) {
          // Already admin — log out instead
          sessionStorage.removeItem("admin_mode")
          sessionStorage.removeItem("admin_key")
          setIsAdmin(false)
        } else {
          setShowModal(true)
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isAdmin, setIsAdmin])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        sessionStorage.setItem("admin_mode", "true")
        sessionStorage.setItem("admin_key", password)
        setIsAdmin(true)
        setShowModal(false)
        setPassword("")
      } else {
        setError("Wrong password")
      }
    } catch {
      setError("Network error — try again")
    } finally {
      setLoading(false)
    }
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="w-80 rounded-2xl p-6 shadow-2xl border border-white/10"
        style={{ background: "#0d0d14" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span className="font-semibold text-white text-sm font-display">
              Owner Login
            </span>
          </div>
          <button
            onClick={() => { setShowModal(false); setPassword(""); setError("") }}
            className="text-white/40 hover:text-white cursor-pointer transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-white/40 text-xs mb-4">
          Enter your admin password to edit and publish theme changes for all visitors.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full px-4 py-3 pr-10 rounded-xl text-white text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 cursor-pointer"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-150 disabled:opacity-40 cursor-pointer hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Checking…" : "Unlock Admin Mode"}
          </button>
        </form>

        <p className="text-xs text-white/20 text-center mt-4">
          Shortcut: <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/40">Ctrl+Shift+A</kbd>
        </p>
      </div>
    </div>
  )
}
