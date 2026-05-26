"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowDown, Download, Layers } from "lucide-react"
import { useThemeStore } from "@/lib/use-theme-store"
import { MODELS } from "@/lib/models"

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const siteName = useThemeStore((s) => s.siteName)
  const tagline = useThemeStore((s) => s.tagline)
  const bgStyle = useThemeStore((s) => s.bgStyle)
  const accent = useThemeStore((s) => s.accent)

  // Animated particle / mesh background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    const hex = accent.replace("#", "")
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.12 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animId)
    }
  }, [accent])

  const totalDownloads = MODELS.reduce((acc, m) => acc + m.downloadCount, 0).toLocaleString()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, var(--accent-glow) 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 font-medium mb-8 backdrop-blur-sm">
          <Layers className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          <span>{MODELS.length} models · {totalDownloads}+ downloads</span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6 font-display">
          {siteName}&apos;s{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, var(--accent), rgba(var(--accent-rgb),0.6))`,
            }}
          >
            3D Models
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          {tagline}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#gallery"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
            style={{
              background: "var(--accent)",
              boxShadow: "0 0 24px var(--accent-glow)",
            }}
          >
            <Layers className="w-4 h-4" />
            Browse Gallery
          </a>
          <a
            href="#about"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-white/70 hover:text-white font-semibold text-sm border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Free Downloads
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          {[
            { label: "Models", value: MODELS.length.toString() },
            { label: "Downloads", value: totalDownloads + "+" },
            { label: "Free Forever", value: "100%" },
            { label: "Print-Ready", value: "All" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl font-bold font-display"
                style={{ color: "var(--accent)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-white/40 mt-0.5 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#gallery"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
        aria-label="Scroll to gallery"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  )
}
