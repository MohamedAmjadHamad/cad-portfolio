import { NextRequest, NextResponse } from "next/server"

// POST — checks if the given password matches the server-side ADMIN_SECRET
// The password never leaves the server, so it can't be stolen from the browser
export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password: string }

  if (!process.env.ADMIN_SECRET) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_SECRET env var not set on server" },
      { status: 500 }
    )
  }

  if (password === process.env.ADMIN_SECRET) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
