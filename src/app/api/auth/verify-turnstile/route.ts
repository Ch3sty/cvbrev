// src/app/api/auth/verify-turnstile/route.ts
// Serververifiering av Cloudflare Turnstile (docs/plan-konvertering.md, B1).
// Saknas TURNSTILE_SECRET_KEY hoppas verifieringen över helt, så lokala
// miljöer och förhandsdeployer kan registrera konton utan nycklar.

import { NextRequest, NextResponse } from 'next/server'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function POST(request: NextRequest) {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    return NextResponse.json({ success: true, skipped: true })
  }

  let token: unknown
  try {
    const body = await request.json()
    token = body?.token
  } catch {
    return NextResponse.json({ success: false, error: 'Ogiltig begäran' }, { status: 400 })
  }

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ success: false, error: 'Token saknas' }, { status: 400 })
  }

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    undefined

  try {
    const params = new URLSearchParams({ secret, response: token })
    if (ip) params.set('remoteip', ip)

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] }

    if (!data.success) {
      console.warn('[verify-turnstile] Avvisad:', data['error-codes'])
      return NextResponse.json(
        { success: false, error: 'Kunde inte bekräfta att du är en människa. Försök igen.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Är Cloudflare nere ska registreringen inte gå i baklås.
    console.error('[verify-turnstile] Fel vid anrop till Cloudflare:', error)
    return NextResponse.json({ success: true, degraded: true })
  }
}
