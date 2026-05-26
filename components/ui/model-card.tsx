"use client"

import Link from "next/link"
import { Download, Clock, Layers, ChevronRight } from "lucide-react"
import { type Model3D } from "@/lib/models"

interface ModelCardProps {
  model: Model3D
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Link
      href={`/models/${model.id}`}
      className="group block rounded-2xl border border-white/[0.08] overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      style={{
        background: `rgba(255,255,255,calc(var(--card-opacity)/1000))`,
        backdropFilter: "blur(12px)",
        boxShadow: "0 1px 1px rgba(0,0,0,0.3)",
        borderRadius: "var(--card-radius)",
      }}
    >
      {/* Thumbnail */}
      <div
        className={`relative h-48 bg-gradient-to-br ${model.gradient} overflow-hidden`}
      >
        {/* Accent top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${model.accentColor}, transparent)` }}
        />

        {/* Category chip */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 text-white/80 border border-white/10 backdrop-blur-sm">
            {model.category}
          </span>
        </div>

        {/* Download count */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-sm">
          <Download className="w-3 h-3 text-white/60" />
          <span className="text-xs text-white/60">{model.downloadCount.toLocaleString()}</span>
        </div>

        {/* Format badge */}
        <div className="absolute bottom-3 right-3">
          <span
            className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase"
            style={{
              background: `${model.accentColor}30`,
              color: model.accentColor,
              border: `1px solid ${model.accentColor}40`,
            }}
          >
            .{model.fileFormat}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold"
            style={{ background: model.accentColor }}
          >
            View Model
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Grid overlay decoration */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(${model.accentColor}20 1px, transparent 1px), linear-gradient(90deg, ${model.accentColor}20 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-white font-semibold text-base font-display leading-tight mb-1.5 group-hover:text-[var(--accent)] transition-colors">
          {model.title}
        </h3>
        <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
          {model.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{model.printTime}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>{(model.polygons / 1000).toFixed(0)}K poly</span>
          </div>
          <div className="ml-auto text-white/30">{model.fileSize}</div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {model.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded text-xs text-white/40 border border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.03)" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
