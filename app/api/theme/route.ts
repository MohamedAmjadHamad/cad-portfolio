import { NextRequest, NextResponse } from "next/server"
import { type ThemeConfig } from "@/lib/use-theme-store"

// Default theme — shown to everyone until owner publishes a custom one
const DEFAULT_THEME: ThemeConfig = {
  accent: "#6366f1",
  bgColor: "#050508",
  cardOpacity: 4,
  borderRadius: "rounded",
  fontFamily: "space-grotesk",
  bgStyle: "mesh",
  siteName: "Moody",
  tagline: "Precision-engineered 3D models ready to print",
}

// Try to get Vercel KV — works once the KV store is connected in Vercel dashboard
async function getKV() {
  try {
    const { kv } = await import("@vercel/kv")
    return kv
  } catch {
    return null
  }
}

// GET — returns the saved theme (public, no auth needed)
export async function GET() {
  const kv = await getKV()
  if (kv) {
    try {
      const saved = await kv.get<ThemeConfig>("portfolio-theme")
      return NextResponse.json(saved ?? DEFAULT_THEME, {
        headers: { "Cache-Control": "no-store" },
      })
    } catch {
      // KV error — fall through to default
    }
  }
  return NextResponse.json(DEFAULT_THEME, {
    headers: { "Cache-Control": "no-store" },
  })
}

// POST — saves new theme (requires ADMIN_SECRET password)
export async function POST(req: NextRequest) {
  const body = await req.json() as { adminKey: string } & ThemeConfig
  const { adminKey, ...theme } = body

  if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const kv = await getKV()
  if (!kv) {
    return NextResponse.json(
      { success: false, error: "KV not connected yet — see setup instructions" },
      { status: 503 }
    )
  }

  await kv.set("portfolio-theme", theme)
  return NextResponse.json({ success: true })
}
