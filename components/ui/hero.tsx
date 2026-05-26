"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowDown, Layers, Sparkles, Zap, Package } from "lucide-react"
import { useThemeStore } from "@/lib/use-theme-store"
import { MODELS } from "@/lib/models"

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let start = 0
    const end = to
    if (end === 0) { setVal(0); return }
    const duration = 1600
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setVal(end); clearInterval(timer) }
      else setVal(start)
    }, 16)
    return () => clearInterval(timer)
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ── Floating geometric shape (pure CSS) ──────────────────────────────────────
function FloatingOrb({
  size, x, y, delay, color, blur = 80,
}: {
  size: number; x: string; y: string; delay: number; color: string; blur?: number
}) {
  return (
    <div
      className="absolute pointer-events-none rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        animationDelay: `${delay}s`,
        opacity: 0.6,
      }}
    />
  )
}

// ── Particle canvas ────────────────────────────────────────────────────────────
function ParticleCanvas({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const particles: {
      x: number; y: number
      vx: number; vy: number
      size: number; alpha: number
      pulse: number
    }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.45 + 0.08,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    const hex = accent.replace("#", "")
    const r = parseInt(hex.slice(0, 2), 16) || 99
    const g = parseInt(hex.slice(2, 4), 16) || 102
    const b = parseInt(hex.slice(4, 6), 16) || 241

    let t = 0
    const draw = () => {
      t += 0.008
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 130) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.14 * (1 - dist / 130)})`
            ctx.lineWidth = 0.6
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.pulse += 0.02
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden
    />
  )
}

// ── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  const siteName  = useThemeStore((s) => s.siteName)
  const tagline   = useThemeStore((s) => s.tagline)
  const accent    = useThemeStore((s) => s.accent)
  const logoEmoji = useThemeStore((s) => s.logoEmoji)

  const totalDownloads = MODELS.reduce((acc, m) => acc + m.downloadCount, 0)

  const stats = [
    { label: "Models",    value: MODELS.length, suffix: "" },
    { label: "Downloads", value: totalDownloads, suffix: "+" },
    { label: "Free",      value: 100, suffix: "%" },
    { label: "Formats",   value: 4, suffix: "" },
  ]

  const chips = [
    { icon: Sparkles, text: "Print-ready files" },
    { icon: Zap,      text: "Zero supports" },
    { icon: Package,  text: "Free forever" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* Aurora orbs */}
      <FloatingOrb size={600} x="-8%"  y="5%"  delay={0}   color={`rgba(${accent.replace("#","").match(/.{2}/g)?.map(h=>parseInt(h,16)).join(",") ?? "99,102,241"},0.18)`} blur={120} />
      <FloatingOrb size={500} x="65%"  y="50%" delay={1.5} color="rgba(139,92,246,0.14)" blur={110} />
      <FloatingOrb size={350} x="40%"  y="-5%" delay={0.8} color="rgba(6,182,212,0.10)"  blur={90} />
      <FloatingOrb size={280} x="80%"  y="10%" delay={2}   color={`rgba(${accent.replace("#","").match(/.{2}/g)?.map(h=>parseInt(h,16)).join(",") ?? "99,102,241"},0.12)`} blur={80} />

      {/* Particle canvas */}
      <ParticleCanvas accent={accent} />

      {/* Radial spotlight */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% 38%, ${accent}22 0%, transparent 70%)`,
        }}
        aria-hidden
      />

      {/* Animated grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Logo badge */}
        <div className="flex justify-center mb-6 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <div
            className="relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-sm"
            style={{
              background: `rgba(${accent.replace("#","").match(/.{2}/g)?.map(h=>parseInt(h,16)).join(",") ?? "99,102,241"},0.12)`,
              borderColor: `rgba(${accent.replace("#","").match(/.{2}/g)?.map(h=>parseInt(h,16)).join(",") ?? "99,102,241"},0.35)`,
            }}
          >
            {/* Animated ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping-once"
              style={{ background: `${accent}20` }}
            />
            <span className="text-xl">{logoEmoji || "⬡"}</span>
            <span className="text-sm font-semibold text-white/80 font-display">{siteName}</span>
            <span
              className="w-2 h-2 rounded-full animate-breathe"
              style={{ background: accent }}
            />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6 font-display animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          Precision{" "}
          <span className="gradient-text">3D</span>
          {" "}Models
          <br />
          <span className="text-white/40 text-4xl sm:text-5xl md:text-6xl font-light">
            Ready to Print
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="text-base md:text-xl text-white/45 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          {tagline}
        </p>

        {/* Feature chips */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          {chips.map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              <Icon className="w-3 h-3" style={{ color: accent }} />
              {text}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "320ms" }}
        >
          <a
            href="#gallery"
            className="relative group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden animate-glow-pulse"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
              boxShadow: `0 0 32px ${accent}50, 0 4px 24px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Shine sweep */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)",
              }}
            />
            <Layers className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Browse Gallery</span>
          </a>

          <a
            href="#about"
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white/70 hover:text-white font-bold text-sm border border-white/[0.12] backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.07] hover:border-white/25 hover:-translate-y-1 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" />
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden animate-fade-up"
          style={{
            animationDelay: "400ms",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-5 px-4"
              style={{
                background: i % 2 === 0 ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.1)",
              }}
            >
              <div
                className="text-3xl font-bold font-display mb-1"
                style={{ color: accent }}
              >
                <Counter to={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-white/35 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#gallery"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25 hover:text-white/60 transition-colors duration-300 cursor-pointer"
        aria-label="Scroll to gallery"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="flex flex-col items-center gap-0.5">
          <div
            className="w-px h-6 rounded-full"
            style={{
              background: `linear-gradient(to bottom, ${accent}80, transparent)`,
              animation: "float 2s ease-in-out infinite",
            }}
          />
          <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
        </div>
      </a>
    </section>
  )
}
