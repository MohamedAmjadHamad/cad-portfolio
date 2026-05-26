"use client"

import dynamic from "next/dynamic"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  ArrowLeft,
  Download,
  Clock,
  Layers,
  Ruler,
  Package,
  Tag,
  CheckCircle,
  Share2,
  Printer,
} from "lucide-react"
import { MODELS } from "@/lib/models"
import { Navbar } from "@/components/ui/navbar"
import { ThemeCustomizer } from "@/components/ui/theme-customizer"
import { Footer } from "@/components/ui/footer"

// SSR-safe dynamic import for the 3D viewer
const ModelViewer3D = dynamic(
  () => import("@/components/ui/model-viewer-3d").then((m) => m.ModelViewer3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#080810] rounded-2xl min-h-[400px]">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent) transparent var(--accent) var(--accent)" }}
        />
      </div>
    ),
  }
)

export default function ModelDetailPage() {
  const params = useParams()
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)

  const model = MODELS.find((m) => m.id === params.id)
  if (!model) notFound()

  const handleDownload = () => {
    if (model.fileUrl) {
      const a = document.createElement("a")
      a.href = model.fileUrl
      a.download = `${model.id}.${model.fileFormat}`
      a.click()
    }
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 3000)
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: model.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const stats = [
    { icon: Layers, label: "Polygons", value: model.polygons.toLocaleString() },
    { icon: Package, label: "File Size", value: model.fileSize },
    { icon: Clock, label: "Print Time", value: model.printTime },
    { icon: Ruler, label: "Dimensions", value: model.dimensions },
    { icon: Printer, label: "Material", value: model.material },
    { icon: Tag, label: "Format", value: `.${model.fileFormat.toUpperCase()}` },
  ]

  return (
    <>
      <Navbar onCustomizerOpen={() => setCustomizerOpen(true)} />
      <ThemeCustomizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-24">
        {/* Back button */}
        <Link
          href="/#gallery"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors mb-8 text-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* ── Left: 3D Viewer ───────────────────────────── */}
          <div className="lg:col-span-3">
            <ModelViewer3D
              fileUrl={model.fileUrl}
              fileFormat={model.fileFormat}
              placeholderShape={model.placeholderShape}
              accentColor={model.accentColor}
              className="w-full aspect-square lg:aspect-auto lg:h-[560px]"
            />

            {/* Print tips */}
            <div
              className="mt-4 p-4 rounded-xl border border-white/[0.06] text-sm text-white/40 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span className="text-white/60 font-medium">Print tips: </span>
              Layer height 0.2 mm · {model.material} recommended · No supports unless noted
            </div>
          </div>

          {/* ── Right: Info panel ─────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: `${model.accentColor}20`,
                    color: model.accentColor,
                    border: `1px solid ${model.accentColor}40`,
                  }}
                >
                  {model.category}
                </span>
                <span className="text-white/25 text-xs">
                  {new Date(model.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white font-display leading-tight mb-3">
                {model.title}
              </h1>
              <p className="text-white/50 leading-relaxed text-sm">{model.longDescription}</p>
            </div>

            {/* Download CTA */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                background: downloaded
                  ? "#10b981"
                  : `linear-gradient(135deg, ${model.accentColor}, ${model.accentColor}cc)`,
                boxShadow: downloaded
                  ? "0 0 20px rgba(16,185,129,0.4)"
                  : `0 0 28px ${model.accentColor}50`,
              }}
            >
              {downloaded ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download {model.fileFormat.toUpperCase()} File
                </>
              )}
            </button>

            {/* Download count + share */}
            <div className="flex items-center justify-between text-xs text-white/30">
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                {model.downloadCount.toLocaleString()} downloads
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-white/60 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? "Link copied!" : "Share"}
              </button>
            </div>

            {/* Stats grid */}
            <div
              className="rounded-xl border border-white/[0.06] overflow-hidden"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              {stats.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={label}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i !== stats.length - 1 ? "border-b border-white/[0.05]" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-white/40 text-sm">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                  <span className="text-white/80 text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2.5">Tags</p>
              <div className="flex flex-wrap gap-2">
                {model.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg text-xs text-white/40 border border-white/[0.06]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── More models ─────────────────────────────── */}
        <section className="mt-20">
          <h2 className="text-xl font-bold text-white font-display mb-6">More Models</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MODELS.filter((m) => m.id !== model.id)
              .slice(0, 4)
              .map((m) => (
                <Link
                  key={m.id}
                  href={`/models/${m.id}`}
                  className="group rounded-xl border border-white/[0.06] overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className={`h-28 bg-gradient-to-br ${m.gradient} relative overflow-hidden`}>
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.3)" }}
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-white/80 text-xs font-medium font-display line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
                      {m.title}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">{m.category}</p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
