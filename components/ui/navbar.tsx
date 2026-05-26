"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X, Box, Settings, Code2, Mail } from "lucide-react"
import { useThemeStore } from "@/lib/use-theme-store"
import { siteConfig } from "@/lib/site-config"

export function Navbar({ onCustomizerOpen }: { onCustomizerOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const siteName  = useThemeStore((s) => s.siteName)
  const logoEmoji = useThemeStore((s) => s.logoEmoji)
  const isAdmin   = useThemeStore((s) => s.isAdmin)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <nav
      className={`fixed top-3 left-3 right-3 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50"
          : "bg-transparent"
      }`}
      style={{ borderRadius: "var(--card-radius)" }}
    >
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110"
            style={{
              background: "var(--accent)",
              boxShadow: scrolled ? "0 0 12px var(--accent-glow)" : undefined,
            }}
          >
            <span className="text-base leading-none">{logoEmoji || "⬡"}</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight font-display">
            {siteName}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {[
            { label: "Gallery", href: "/#gallery" },
            { label: "About", href: "/#about" },
            { label: "Contact", href: "/#contact" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white/60 hover:text-white transition-colors duration-150 text-sm font-medium cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {siteConfig.social.github && (
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex w-9 h-9 rounded-lg bg-white/5 border border-white/10 items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="GitHub"
            >
              <Code2 className="w-4 h-4 text-white/70" />
            </a>
          )}
          {/* Settings gear — only visible to the owner (admin mode) */}
          {isAdmin && (
            <button
              onClick={onCustomizerOpen}
              title="Owner: edit theme"
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer border"
              style={{
                background: "var(--accent-muted)",
                borderColor: "var(--accent)",
              }}
              aria-label="Open theme customizer"
            >
              <Settings className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </button>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-4 h-4 text-white" />
            ) : (
              <Menu className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-5 pb-4 flex flex-col gap-1 border-t border-white/10"
        >
          {[
            { label: "Gallery", href: "/#gallery" },
            { label: "About", href: "/#about" },
            { label: "Contact", href: "/#contact" },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium py-2.5 cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
