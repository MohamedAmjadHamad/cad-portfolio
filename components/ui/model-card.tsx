"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useState } from "react"
import { Download, Clock, Layers, ChevronRight, Zap } from "lucide-react"
import { type Model3D } from "@/lib/models"

// SSR-safe — Three.js only in browser
const ModelThumb3D = dynamic(
  () => import("@/components/ui/model-card-3d-thumb").then((m) => m.ModelThumb3D),
  { ssr: false, loading: () => null }
)

export function ModelCard({ model }: { model: Model3D }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/models/${model.id}`}
      className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      style={{ borderRadius: "var(--card-radius)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "var(--card-radius)",
          background: `rgba(255,255,255,calc(var(--card-opacity)/1000))`,
          backdropFilter: "blur(14px)",
          border: `1px solid ${hovered ? model.accentColor + "60" : "rgba(255,255,255,0.08)"}`,
          boxShadow: hovered
            ? `0 0 0 1px ${model.accentColor}28, 0 28px 72px rgba(0,0,0,0.6), 0 0 64px ${model.accentColor}1a`
            : "0 2px 10px rgba(0,0,0,0.35)",
          transform: hovered ? "translateY(-7px) scale(1.013)" : "translateY(0) scale(1)",
          transition: "all 0.38s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* ── 3D Thumbnail ── */}
        <div className="relative h-52 overflow-hidden" style={{ background: "#06060f" }}>

          {/* Real 3D canvas */}
          <ModelThumb3D
            shape={model.placeholderShape}
            color={model.accentColor}
            hovered={hovered}
            gradient={model.gradient}
          />

          {/* Overlay gradient (bottom fade into card body) */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(6,6,15,0.8))",
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] z-10 transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent, ${model.accentColor}, transparent)`,
              opacity: hovered ? 1 : 0.5,
            }}
          />

          {/* Category chip */}
          <div className="absolute top-3 left-3 z-20">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md"
              style={{
                background: `${model.accentColor}22`,
                border: `1px solid ${model.accentColor}55`,
                color: model.accentColor,
              }}
            >
              {model.category}
            </span>
          </div>

          {/* Download count */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-black/55 border border-white/10 backdrop-blur-md">
            <Download className="w-3 h-3 text-white/50" />
            <span className="text-xs text-white/50">{model.downloadCount.toLocaleString()}</span>
          </div>

          {/* Format badge */}
          <div className="absolute bottom-3 left-3 z-20">
            <span
              className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase"
              style={{
                background: `${model.accentColor}22`,
                color: model.accentColor,
                border: `1px solid ${model.accentColor}50`,
              }}
            >
              .{model.fileFormat}
            </span>
          </div>

          {/* File size */}
          <div className="absolute bottom-3 right-3 z-20">
            <span className="text-xs text-white/30 font-mono">{model.fileSize}</span>
          </div>

          {/* Hover overlay — "View 3D Model" pill */}
          <div
            className="absolute inset-0 flex items-center justify-center z-30 transition-all duration-250"
            style={{
              opacity: hovered ? 1 : 0,
              background: hovered ? "rgba(0,0,0,0.18)" : "transparent",
            }}
          >
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-2xl"
              style={{
                background: model.accentColor,
                boxShadow: `0 4px 28px ${model.accentColor}90`,
                transform: hovered ? "scale(1) translateY(0)" : "scale(0.85) translateY(6px)",
                transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              View 3D Model
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ── Card body ── */}
        <div className="p-5">
          {/* Title */}
          <h3
            className="font-bold text-base font-display leading-snug mb-1.5 transition-colors duration-200"
            style={{ color: hovered ? model.accentColor : "white" }}
          >
            {model.title}
          </h3>

          {/* Description */}
          <p className="text-white/45 text-sm leading-relaxed mb-4 line-clamp-2">
            {model.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-white/35 mb-3.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: hovered ? model.accentColor : undefined }} />
              <span>{model.printTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" style={{ color: hovered ? model.accentColor : undefined }} />
              <span>{(model.polygons / 1000).toFixed(0)}K poly</span>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Zap className="w-3 h-3 text-white/20" />
              <span className="text-white/22">{model.material}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {model.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs transition-all duration-200"
                style={{
                  background: hovered ? `${model.accentColor}15` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${hovered ? model.accentColor + "40" : "rgba(255,255,255,0.06)"}`,
                  color: hovered ? model.accentColor : "rgba(255,255,255,0.35)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom glow line */}
        <div
          className="h-[2px] transition-all duration-350"
          style={{
            background: `linear-gradient(90deg, transparent, ${model.accentColor}, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />
      </div>
    </Link>
  )
}
