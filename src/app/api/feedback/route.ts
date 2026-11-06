import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : []

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Dev fallback for localhost
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return true
  }
  return false
}

export async function POST(req: Request) {
  // 1. Origin / referer validation
  const origin = req.headers.get('origin') || req.headers.get('referer')
  if (!origin || !isAllowedOrigin(origin)) {
    return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 })
  }

  // 2. CSRF double-submit cookie validation
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get('csrf_token')?.value
  const headerToken = req.headers.get('x-csrf-token')
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 })
  }

  // 3. Proxy to Formspree using server-side secret endpoint
  const body = await req.json()
  const endpoint = process.env.FORMSPREE_ENDPOINT
  if (!endpoint) {
    return NextResponse.json(
      { error: 'Feedback endpoint not configured' },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Network error submitting feedback' },
      { status: 502 },
    )
  }
}
