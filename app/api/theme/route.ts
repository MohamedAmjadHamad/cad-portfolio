import { NextRequest, NextResponse } from "next/server"
import { type ThemeConfig } from "@/lib/use-theme-store"

const DEFAULT_THEME: ThemeConfig = {
  accent:        "#6366f1",
  bgColor:       "#050508",
  cardOpacity:   4,
  borderRadius:  "rounded",
  fontFamily:    "space-grotesk",
  bgStyle:       "mesh",
  siteName:      "Moody",
  tagline:       "Precision-engineered 3D models ready to print",
  logoEmoji:     "⬡",
  glowIntensity: 70,
  showParticles: true,
  cardStyle:     "glass",
  hiddenModels:  [],
}

const BLOB_FILENAME = "portfolio-theme.json"

// ── Read theme from Vercel Blob ───────────────────────────────────────────────
async function readFromBlob(): Promise<ThemeConfig | null> {
  try {
    const { list } = await import("@vercel/blob")
    const { blobs } = await list({ prefix: BLOB_FILENAME, limit: 1 })
    if (!blobs[0]) return null
    const res = await fetch(blobs[0].url, { cache: "no-store" })
    return (await res.json()) as ThemeConfig
  } catch {
    return null
  }
}

// ── Write theme to Vercel Blob (delete old first, then put new) ───────────────
async function writeToBlob(theme: ThemeConfig): Promise<void> {
  const { list, del, put } = await import("@vercel/blob")

  // Remove any previous theme blobs
  const { blobs } = await list({ prefix: BLOB_FILENAME })
  if (blobs.length > 0) {
    await del(blobs.map((b) => b.url))
  }

  // Store the new theme
  await put(BLOB_FILENAME, JSON.stringify(theme), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  })
}

// ── GET — returns saved theme (public, no auth) ───────────────────────────────
export async function GET() {
  const saved = await readFromBlob()
  return NextResponse.json(saved ?? DEFAULT_THEME, {
    headers: { "Cache-Control": "no-store" },
  })
}

// ── POST — saves theme (requires ADMIN_SECRET password) ──────────────────────
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { adminKey: string } & ThemeConfig
  const { adminKey, ...theme } = body

  if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await writeToBlob(theme)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    // Blob not connected yet — give a clear message
    if (message.includes("BLOB_READ_WRITE_TOKEN") || message.includes("token")) {
      return NextResponse.json(
        { success: false, error: "Blob not connected yet — connect it in Vercel dashboard → Storage → Blob → Connect to Project" },
        { status: 503 }
      )
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
