"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Search, SlidersHorizontal, X, LayoutGrid, List,
  TrendingUp, Clock, ArrowDownUp,
} from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Hero } from "@/components/ui/hero"
import { ModelCard } from "@/components/ui/model-card"
import { ThemeCustomizer } from "@/components/ui/theme-customizer"
import { Footer } from "@/components/ui/footer"
import { MODELS, CATEGORIES } from "@/lib/models"
import Link from "next/link"

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
function useScrollReveal(ref: React.RefObject<Element | null>) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return visible
}

// ── Section reveal wrapper ────────────────────────────────────────────────────
function RevealSection({
  children, className = "", delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useScrollReveal(ref as React.RefObject<Element | null>)
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ── Sort options ──────────────────────────────────────────────────────────────
type SortKey = "default" | "newest" | "oldest" | "name"

const SORT_OPTIONS: { key: SortKey; label: string; icon: React.ReactNode }[] = [
  { key: "default", label: "Default",  icon: <ArrowDownUp className="w-3.5 h-3.5" /> },
  { key: "newest",  label: "Newest",   icon: <Clock       className="w-3.5 h-3.5" /> },
  { key: "name",    label: "A → Z",    icon: <TrendingUp  className="w-3.5 h-3.5" /> },
]

// ── Home page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [search,         setSearch]         = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [sortKey,        setSortKey]        = useState<SortKey>("default")
  const [viewMode,       setViewMode]       = useState<"grid" | "list">("grid")
  const [showSortMenu,   setShowSortMenu]   = useState(false)

  // Close sort menu on outside click
  useEffect(() => {
    const h = () => setShowSortMenu(false)
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])

  const filtered = useMemo(() => {
    let result = MODELS.filter((m) => {
      const matchesCategory = activeCategory === "All" || m.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })

    if (sortKey === "newest")  result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sortKey === "oldest")  result = [...result].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    if (sortKey === "name")    result = [...result].sort((a, b) => a.title.localeCompare(b.title))

    return result
  }, [search, activeCategory, sortKey])

  return (
    <>
      <Navbar onCustomizerOpen={() => setCustomizerOpen(true)} />
      <ThemeCustomizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} />

      <main className="flex-1">
        <Hero />

        {/* ── Gallery ── */}
        <section id="gallery" className="max-w-7xl mx-auto px-6 py-20">

          {/* Section header */}
          <RevealSection className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 uppercase tracking-widest"
                  style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                >
                  Gallery
                </div>
                <h2 className="text-4xl font-bold text-white font-display">
                  All Models
                </h2>
                <p className="text-white/35 mt-1.5 text-sm">
                  {filtered.length} of {MODELS.length} models
                </p>
              </div>

              {/* Search + controls */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="Search models…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-9 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-[var(--accent)] transition-colors w-52 placeholder:text-white/30"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSortMenu((v) => !v) }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm border transition-colors cursor-pointer"
                    style={{
                      background: showSortMenu ? "var(--accent-muted)" : "rgba(255,255,255,0.05)",
                      borderColor: showSortMenu ? "var(--accent)" : "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <ArrowDownUp className="w-4 h-4" />
                    {SORT_OPTIONS.find((s) => s.key === sortKey)?.label}
                  </button>
                  {showSortMenu && (
                    <div
                      className="absolute right-0 top-full mt-2 z-20 rounded-xl p-1.5 min-w-[140px]"
                      style={{
                        background: "rgba(10,10,20,0.96)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        backdropFilter: "blur(20px)",
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => { setSortKey(opt.key); setShowSortMenu(false) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left"
                          style={{
                            background: sortKey === opt.key ? "var(--accent)" : "transparent",
                            color: sortKey === opt.key ? "white" : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {opt.icon}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* View toggle */}
                <div
                  className="flex items-center rounded-xl border overflow-hidden"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  {(["grid", "list"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className="p-2.5 transition-colors cursor-pointer"
                      style={{
                        background: viewMode === mode ? "var(--accent)" : "rgba(255,255,255,0.04)",
                        color: viewMode === mode ? "white" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {mode === "grid"
                        ? <LayoutGrid className="w-4 h-4" />
                        : <List        className="w-4 h-4" />
                      }
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>

          {/* Category filters */}
          <RevealSection delay={80} className="mb-8">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border"
                  style={{
                    background: activeCategory === cat ? "var(--accent)" : "rgba(255,255,255,0.04)",
                    borderColor: activeCategory === cat ? "var(--accent)" : "rgba(255,255,255,0.08)",
                    color: activeCategory === cat ? "white" : "rgba(255,255,255,0.5)",
                    boxShadow: activeCategory === cat ? "0 0 14px var(--accent-glow)" : "none",
                  }}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 text-xs opacity-60">
                      {MODELS.filter((m) => m.category === cat).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </RevealSection>

          {/* Grid / List */}
          {filtered.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
                {filtered.map((model) => (
                  <div key={model.id} className="animate-fade-up">
                    <ModelCard model={model} />
                  </div>
                ))}
              </div>
            ) : (
              /* List view */
              <div className="flex flex-col gap-3 stagger-children">
                {filtered.map((model) => (
                  <div key={model.id} className="animate-fade-up">
                    <Link
                      href={`/models/${model.id}`}
                      className="flex items-center gap-5 p-4 rounded-2xl border border-white/[0.07] hover:border-white/20 transition-all duration-250 cursor-pointer group"
                      style={{
                        background: "rgba(255,255,255,calc(var(--card-opacity)/1000))",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div
                        className={`w-16 h-16 rounded-xl flex-shrink-0 bg-gradient-to-br ${model.gradient} flex items-center justify-center`}
                      >
                        <span
                          className="text-xs font-mono font-bold uppercase"
                          style={{ color: model.accentColor }}
                        >
                          .{model.fileFormat}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold font-display text-sm mb-1 group-hover:text-[var(--accent)] transition-colors truncate">
                          {model.title}
                        </h3>
                        <p className="text-white/40 text-xs line-clamp-1">{model.description}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-xs text-white/30 shrink-0">
                        <span>{model.category}</span>
                        <span>{model.fileSize}</span>
                        <span>{model.printTime}</span>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                        style={{
                          background: `${model.accentColor}20`,
                          color: model.accentColor,
                          border: `1px solid ${model.accentColor}40`,
                        }}
                      >
                        {model.fileFormat.toUpperCase()}
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            )
          ) : (
            <RevealSection>
              <div className="text-center py-28 text-white/25">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <SlidersHorizontal className="w-7 h-7 opacity-50" />
                </div>
                <p className="text-lg font-semibold font-display mb-2">No models match</p>
                <p className="text-sm text-white/20 mb-6">Try a different search term or category</p>
                <button
                  onClick={() => { setSearch(""); setActiveCategory("All") }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                  style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                >
                  Clear filters
                </button>
              </div>
            </RevealSection>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
