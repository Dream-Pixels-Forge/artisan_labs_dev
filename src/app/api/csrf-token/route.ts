import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Issues a CSRF token as a readable (non-httpOnly) cookie so the client can
 * echo it back as the `X-CSRF-Token` header (double-submit cookie pattern).
 * SameSite=strict prevents cross-site POSTs from carrying the cookie.
 */
export async function GET() {
  const cookieStore = await cookies()
  let token = cookieStore.get('csrf_token')?.value
  if (!token) {
    token = crypto.randomUUID()
  }

  const response = NextResponse.json({ csrfToken: token })
  response.cookies.set('csrf_token', token, {
    httpOnly: false, // client JS must read it for double-submit
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return response
}
