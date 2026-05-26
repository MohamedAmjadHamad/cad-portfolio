"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDown, Layers, Sparkles, Zap, Package } from "lucide-react"
import { useThemeStore } from "@/lib/use-theme-store"
import { MODELS } from "@/lib/models"

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (to === 0) return
    let cur = 0
    const step = Math.max(1, Math.ceil(to / 80))
    const t = setInterval(() => {
      cur += step
      if (cur >= to) { setVal(to); clearInterval(t) }
      else setVal(cur)
    }, 16)
    return () => clearInterval(t)
  }, [to])
  return <>{val.toLocaleString()}{suffix}</>
}

// ── Flowing beam canvas (the cinematic light-ray effect) ──────────────────────
function FlowingBeamCanvas({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Parse accent color
    const hex = accent.replace("#", "")
    const ar = parseInt(hex.slice(0, 2), 16) || 99
    const ag = parseInt(hex.slice(2, 4), 16) || 102
    const ab = parseInt(hex.slice(4, 6), 16) || 241

    const draw = () => {
      t += 0.0022
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      // ── 3 flowing beams ──
      const beams = [
        {
          cy: H * 0.38,
          ampY: H * 0.19,
          phase: 0,
          speed: 1,
          colors: [
            [ar, ag, ab],
            [139, 92, 246],
            [6, 182, 212],
          ],
          width: 90,
          alpha: 0.5,
        },
        {
          cy: H * 0.54,
          ampY: H * 0.14,
          phase: 1.2,
          speed: 0.78,
          colors: [
            [6, 182, 212],
            [ar, ag, ab],
            [244, 63, 94],
          ],
          width: 60,
          alpha: 0.3,
        },
        {
          cy: H * 0.66,
          ampY: H * 0.11,
          phase: 2.4,
          speed: 1.15,
          colors: [
            [139, 92, 246],
            [ar, ag, ab],
            [16, 185, 129],
          ],
          width: 45,
          alpha: 0.25,
        },
      ]

      beams.forEach((b) => {
        const y0  = b.cy + Math.sin(t * b.speed          + b.phase) * b.ampY
        const cp1x = W * 0.22
        const cp1y = b.cy + Math.sin(t * b.speed * 1.4   + b.phase + 0.9) * b.ampY * 1.5
        const cp2x = W * 0.78
        const cp2y = b.cy + Math.cos(t * b.speed * 0.85  + b.phase + 1.7) * b.ampY * 1.3
        const y1   = b.cy + Math.sin(t * b.speed          + b.phase + 3.1) * b.ampY

        const grad = ctx.createLinearGradient(0, 0, W, 0)
        const [c0, c1, c2] = b.colors
        grad.addColorStop(0,    `rgba(${c0[0]},${c0[1]},${c0[2]},0)`)
        grad.addColorStop(0.12, `rgba(${c0[0]},${c0[1]},${c0[2]},${b.alpha * 0.6})`)
        grad.addColorStop(0.35, `rgba(${c1[0]},${c1[1]},${c1[2]},${b.alpha})`)
        grad.addColorStop(0.5,  `rgba(${c2[0]},${c2[1]},${c2[2]},${b.alpha * 1.1})`)
        grad.addColorStop(0.65, `rgba(${c1[0]},${c1[1]},${c1[2]},${b.alpha})`)
        grad.addColorStop(0.88, `rgba(${c0[0]},${c0[1]},${c0[2]},${b.alpha * 0.6})`)
        grad.addColorStop(1,    `rgba(${c0[0]},${c0[1]},${c0[2]},0)`)

        ctx.save()
        ctx.beginPath()
        ctx.moveTo(-60, y0)
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, W + 60, y1)
        ctx.strokeStyle = grad
        ctx.lineWidth   = b.width
        ctx.lineCap     = "round"
        ctx.globalCompositeOperation = "screen"
        ctx.stroke()
        ctx.restore()
      })

      // ── Sparkle dots ──
      const numDots = 18
      for (let i = 0; i < numDots; i++) {
        const phase = (i / numDots) * Math.PI * 2
        const x = ((Math.sin(t * 0.4 + phase) * 0.5 + 0.5) * W * 0.9) + W * 0.05
        const y = ((Math.cos(t * 0.3 + phase * 1.3) * 0.5 + 0.5) * H * 0.7) + H * 0.15
        const alpha = Math.max(0, Math.sin(t * 1.5 + phase * 2)) * 0.7
        const size  = 1 + Math.sin(t * 2 + phase) * 0.8

        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ar},${ag},${ab},${alpha})`
        ctx.shadowBlur = 8
        ctx.shadowColor = `rgba(${ar},${ag},${ab},0.8)`
        ctx.fill()
        ctx.restore()
      }

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

// ── Particle network canvas ───────────────────────────────────────────────────
function ParticleCanvas({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const pts: { x: number; y: number; vx: number; vy: number; sz: number; a: number; pulse: number }[] = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    for (let i = 0; i < 70; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        sz: Math.random() * 1.5 + 0.3,
        a:  Math.random() * 0.4 + 0.06,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    const hex = accent.replace("#", "")
    const r = parseInt(hex.slice(0, 2), 16) || 99
    const g = parseInt(hex.slice(2, 4), 16) || 102
    const b = parseInt(hex.slice(4, 6), 16) || 241

    let tt = 0
    const draw = () => {
      tt += 0.007
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x
          const dy = pts[i].y - pts[j].y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < 115) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.13 * (1 - d / 115)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }

      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        const a = p.a * (0.65 + 0.35 * Math.sin(p.pulse))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId) }
  }, [accent])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden />
}

// ── Floating orb ─────────────────────────────────────────────────────────────
function Orb({ size, x, y, delay, color, blur = 100 }: {
  size: number; x: string; y: string; delay: number; color: string; blur?: number
}) {
  return (
    <div
      className="absolute pointer-events-none rounded-full animate-float-slow"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        animationDelay: `${delay}s`,
        opacity: 0.65,
      }}
    />
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const siteName    = useThemeStore((s) => s.siteName)
  const tagline     = useThemeStore((s) => s.tagline)
  const accent      = useThemeStore((s) => s.accent)
  const logoEmoji   = useThemeStore((s) => s.logoEmoji)
  const showParticles = useThemeStore((s) => s.showParticles)

  const totalDownloads = MODELS.reduce((acc, m) => acc + m.downloadCount, 0)

  // Parse accent to rgb for orb colors
  const hexRgb = (hex: string) => {
    const h = hex.replace("#", "")
    const r = parseInt(h.slice(0, 2), 16) || 99
    const g = parseInt(h.slice(2, 4), 16) || 102
    const b = parseInt(h.slice(4, 6), 16) || 241
    return `${r},${g},${b}`
  }
  const rgb = hexRgb(accent)

  const stats = [
    { label: "Models",    value: MODELS.length, suffix: "" },
    { label: "Downloads", value: totalDownloads, suffix: "+" },
    { label: "Free",      value: 100, suffix: "%" },
    { label: "Formats",   value: 4, suffix: "" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* ── Radial vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 65% at 50% 38%, rgba(${rgb},0.16) 0%, transparent 68%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(139,92,246,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 80% 20%, rgba(6,182,212,0.07) 0%, transparent 55%)
          `,
        }}
        aria-hidden
      />

      {/* ── Aurora orbs ── */}
      <Orb size={700} x="-12%" y="2%"  delay={0}   color={`rgba(${rgb},0.16)`}      blur={130} />
      <Orb size={550} x="62%"  y="48%" delay={1.8} color="rgba(139,92,246,0.13)"   blur={115} />
      <Orb size={400} x="38%"  y="-8%" delay={0.9} color="rgba(6,182,212,0.09)"    blur={95} />
      <Orb size={300} x="82%"  y="8%"  delay={2.3} color={`rgba(${rgb},0.11)`}     blur={85} />
      <Orb size={250} x="5%"   y="65%" delay={3.1} color="rgba(244,63,94,0.07)"    blur={75} />

      {/* ── Flowing beam canvas (the cinematic light effect) ── */}
      <FlowingBeamCanvas accent={accent} />

      {/* ── Particle network (toggleable) ── */}
      {showParticles && <ParticleCanvas accent={accent} />}

      {/* ── Animated perspective grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(${rgb},0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(${rgb},0.035) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 30%, transparent 100%)",
          opacity: 0.7,
        }}
        aria-hidden
      />

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-7 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <div
            className="relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-sm"
            style={{
              background: `rgba(${rgb},0.1)`,
              borderColor: `rgba(${rgb},0.38)`,
              boxShadow: `0 0 24px rgba(${rgb},0.15), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            <span className="absolute inset-0 rounded-full animate-ping-once opacity-40"
              style={{ background: `rgba(${rgb},0.2)` }} />
            <span className="text-xl z-10">{logoEmoji || "⬡"}</span>
            <span className="text-sm font-bold text-white/85 font-display z-10">{siteName}</span>
            <span className="w-2 h-2 rounded-full animate-breathe z-10" style={{ background: accent }} />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="font-bold text-white leading-[1.03] tracking-tight mb-7 font-display animate-fade-up"
          style={{
            fontSize: "clamp(2.8rem, 9vw, 6.5rem)",
            animationDelay: "70ms",
          }}
        >
          Precision{" "}
          <span
            className="relative inline-block"
            style={{
              background: `linear-gradient(135deg, ${accent} 0%, rgba(${rgb},0.75) 40%, ${accent} 70%, rgba(${rgb},0.55) 100%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-x 3s linear infinite",
              filter: `drop-shadow(0 0 30px rgba(${rgb},0.5))`,
            }}
          >
            3D
          </span>
          {" "}Models
          <br />
          <span
            className="text-white/30 font-light"
            style={{ fontSize: "clamp(1.8rem, 5.5vw, 4rem)" }}
          >
            Ready to Print
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="text-white/45 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up"
          style={{ fontSize: "clamp(0.95rem, 2vw, 1.2rem)", animationDelay: "140ms" }}
        >
          {tagline}
        </p>

        {/* Feature chips */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mb-11 animate-fade-up"
          style={{ animationDelay: "210ms" }}
        >
          {[
            { icon: Sparkles, text: "Print-ready files" },
            { icon: Zap,      text: "Zero supports" },
            { icon: Package,  text: "Free forever" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border"
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

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
          style={{ animationDelay: "290ms" }}
        >
          <a
            href="#gallery"
            className="relative group flex items-center gap-2.5 px-9 py-4 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${accent}, rgba(${rgb},0.8))`,
              boxShadow: `0 0 40px rgba(${rgb},0.5), 0 4px 28px rgba(0,0,0,0.45)`,
            }}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.18) 50%, transparent 80%)",
              }}
            />
            <Layers className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Browse Gallery</span>
          </a>

          <a
            href="#about"
            className="flex items-center gap-2.5 px-9 py-4 rounded-2xl text-white/65 hover:text-white font-bold text-sm border backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.07] hover:border-white/25 hover:-translate-y-1 cursor-pointer"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
          >
            <ArrowDown className="w-4 h-4" />
            Learn More
          </a>
        </div>

        {/* Stats */}
        <div
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 animate-fade-up overflow-hidden rounded-2xl"
          style={{
            animationDelay: "380ms",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(12px)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center py-6 px-4 relative"
              style={{
                background: i % 2 === 0 ? "rgba(0,0,0,0.15)" : "transparent",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : undefined,
              }}
            >
              {/* Accent top line */}
              <div
                className="absolute top-0 inset-x-6 h-px"
                style={{ background: `linear-gradient(90deg, transparent, rgba(${rgb},0.5), transparent)` }}
              />
              <div
                className="text-3xl font-bold font-display mb-1"
                style={{ color: accent, textShadow: `0 0 20px rgba(${rgb},0.5)` }}
              >
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[11px] text-white/30 uppercase tracking-[0.18em]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#gallery"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        style={{ color: "rgba(255,255,255,0.22)" }}
        aria-label="Scroll down"
      >
        <span className="text-[10px] uppercase tracking-[0.22em]">Scroll</span>
        <div
          className="w-px h-8 rounded-full"
          style={{
            background: `linear-gradient(to bottom, rgba(${rgb},0.7), transparent)`,
            animation: "float 2.2s ease-in-out infinite",
          }}
        />
        <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
      </a>
    </section>
  )
}
