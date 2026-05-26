"use client"

import Link from "next/link"
import { useState } from "react"
import { Download, Clock, Layers, ChevronRight, Star, Zap } from "lucide-react"
import { type Model3D } from "@/lib/models"

// ── Category icon mapping ──────────────────────────────────────────────────────
const SHAPE_CSS: Record<string, string> = {
  torusKnot:   "border-[6px] rounded-full w-16 h-16 rotate-12",
  icosahedron: "w-14 h-14 rotate-45",
  torus:       "border-[8px] rounded-full w-20 h-16",
  octahedron:  "w-14 h-14 rotate-45",
  box:         "w-14 h-14 rounded-sm rotate-[20deg]",
  sphere:      "rounded-full w-16 h-16",
  cone:        "w-0 h-0",
}

// ── Holographic thumbnail ─────────────────────────────────────────────────────
function HoloThumb({
  model,
  hovered,
}: {
  model: Model3D
  hovered: boolean
}) {
  return (
    <div
      className={`relative h-52 overflow-hidden transition-all duration-500 bg-gradient-to-br ${model.gradient}`}
    >
      {/* Animated mesh overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] transition-opacity duration-500"
        style={{
          backgroundImage: `
            linear-gradient(${model.accentColor} 1px, transparent 1px),
            linear-gradient(90deg, ${model.accentColor} 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
          opacity: hovered ? 0.14 : 0.06,
        }}
      />

      {/* Radial glow center */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${model.accentColor}30 0%, transparent 65%)`,
          opacity: hovered ? 1 : 0.5,
        }}
      />

      {/* Floating shape */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: hovered ? "scale(1.12) translateY(-6px)" : "scale(1) translateY(0)",
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Outer ring */}
        <div
          className="absolute rounded-full border opacity-20 animate-spin-slow"
          style={{
            width: 100,
            height: 100,
            borderColor: model.accentColor,
            borderWidth: "1px",
            borderStyle: "dashed",
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute rounded-full border opacity-30 animate-spin-reverse"
          style={{
            width: 66,
            height: 66,
            borderColor: model.accentColor,
            borderWidth: "1px",
          }}
        />

        {/* Glow blob */}
        <div
          className="absolute rounded-full transition-all duration-500"
          style={{
            width: hovered ? 80 : 60,
            height: hovered ? 80 : 60,
            background: `radial-gradient(circle, ${model.accentColor}60 0%, transparent 70%)`,
            filter: "blur(12px)",
          }}
        />

        {/* Center icon / shape */}
        <div
          className="relative flex items-center justify-center w-12 h-12 rounded-lg"
          style={{
            background: `${model.accentColor}25`,
            border: `1.5px solid ${model.accentColor}60`,
            boxShadow: `0 0 20px ${model.accentColor}40`,
          }}
        >
          <Layers className="w-5 h-5" style={{ color: model.accentColor }} />
        </div>
      </div>

      {/* Shine sweep on hover */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(100%)" : "translateX(-100%)",
          transition: "transform 0.7s ease, opacity 0.3s ease",
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${model.accentColor}, transparent)`,
          opacity: hovered ? 1 : 0.5,
          transition: "opacity 0.3s",
        }}
      />

      {/* Category chip */}
      <div className="absolute top-3 left-3 z-10">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border"
          style={{
            background: `${model.accentColor}20`,
            borderColor: `${model.accentColor}50`,
            color: model.accentColor,
          }}
        >
          {model.category}
        </span>
      </div>

      {/* Download count */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm">
        <Download className="w-3 h-3 text-white/50" />
        <span className="text-xs text-white/50">{model.downloadCount.toLocaleString()}</span>
      </div>

      {/* Format badge */}
      <div className="absolute bottom-3 left-3 z-10">
        <span
          className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase"
          style={{
            background: `${model.accentColor}20`,
            color: model.accentColor,
            border: `1px solid ${model.accentColor}50`,
          }}
        >
          .{model.fileFormat}
        </span>
      </div>

      {/* File size */}
      <div className="absolute bottom-3 right-3 z-10">
        <span className="text-xs text-white/30 font-mono">{model.fileSize}</span>
      </div>

      {/* Hover overlay — "View Model" pill */}
      <div
        className="absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-250"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <div
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-2xl"
          style={{
            background: model.accentColor,
            boxShadow: `0 4px 24px ${model.accentColor}80`,
          }}
        >
          View 3D Model
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────

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
        className="relative overflow-hidden transition-all duration-350 card-shine"
        style={{
          borderRadius: "var(--card-radius)",
          background: `rgba(255,255,255,calc(var(--card-opacity)/1000))`,
          backdropFilter: "blur(14px)",
          border: `1px solid ${hovered ? model.accentColor + "55" : "rgba(255,255,255,0.08)"}`,
          boxShadow: hovered
            ? `0 0 0 1px ${model.accentColor}25, 0 24px 64px rgba(0,0,0,0.55), 0 0 52px ${model.accentColor}18`
            : "0 2px 8px rgba(0,0,0,0.3)",
          transform: hovered ? "translateY(-6px) scale(1.012)" : "translateY(0) scale(1)",
          transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Holographic thumbnail */}
        <HoloThumb model={model} hovered={hovered} />

        {/* Content */}
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

          {/* Stats row */}
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
              <span className="text-white/25">{model.material}</span>
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
                  borderColor: hovered ? `${model.accentColor}40` : "rgba(255,255,255,0.06)",
                  border: "1px solid",
                  color: hovered ? model.accentColor : "rgba(255,255,255,0.35)",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom accent bar */}
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
