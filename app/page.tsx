"use client"

import { useState, useMemo } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Navbar } from "@/components/ui/navbar"
import { Hero } from "@/components/ui/hero"
import { ModelCard } from "@/components/ui/model-card"
import { ThemeCustomizer } from "@/components/ui/theme-customizer"
import { Footer } from "@/components/ui/footer"
import { MODELS, CATEGORIES } from "@/lib/models"

export default function HomePage() {
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("All")

  const filtered = useMemo(() => {
    return MODELS.filter((m) => {
      const matchesCategory = activeCategory === "All" || m.category === activeCategory
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <>
      <Navbar onCustomizerOpen={() => setCustomizerOpen(true)} />
      <ThemeCustomizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} />

      <main className="flex-1">
        {/* Hero */}
        <Hero />

        {/* Gallery */}
        <section id="gallery" className="max-w-7xl mx-auto px-6 py-20">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white font-display">
                Model Gallery
              </h2>
              <p className="text-white/40 mt-1 text-sm">
                {filtered.length} of {MODELS.length} models
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                type="search"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-10 py-2.5 rounded-xl text-sm text-white bg-white/[0.05] border border-white/[0.08] focus:outline-none focus:border-[var(--accent)] transition-colors w-64 placeholder:text-white/30"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer border"
                style={{
                  background: activeCategory === cat ? "var(--accent)" : "rgba(255,255,255,0.04)",
                  borderColor: activeCategory === cat ? "var(--accent)" : "rgba(255,255,255,0.08)",
                  color: activeCategory === cat ? "white" : "rgba(255,255,255,0.5)",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
              {filtered.map((model) => (
                <div key={model.id} className="animate-fade-up">
                  <ModelCard model={model} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 text-white/30">
              <SlidersHorizontal className="w-10 h-10 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No models match your search</p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("All") }}
                className="mt-4 text-sm underline cursor-pointer hover:text-white/60 transition-colors"
                style={{ color: "var(--accent)" }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
