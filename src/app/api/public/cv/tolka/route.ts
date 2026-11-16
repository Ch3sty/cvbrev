/**
 * POST /api/public/cv/tolka
 *
 * Eget CV utan konto (plan-mallar 3.2, beslut 2). Tar en PDF- eller Word-fil
 * (multipart, fältet "file", högst 5 MB) och svarar med CVMetadata. Inget
 * sparas på servern: tolkningen sker i minnet och utkastet bor i besökarens
 * webbläsare (jc_cv_prova).
 *
 * Spärrar: 5 tolkningar per adress och dygn (UX höjde från 3 för delade
 * mobilnät), 200 per dygn totalt, Turnstile när nyckeln finns (samma som
 * registreringen). Gemini får bara maskad text (tolka.server.ts).
 *
 * Svar: 200 { cv, hittade, saknas, metod }; 400 { kod: for_stor | fel_typ };
 * 403 { kod: robot }; 422 { kod: bild_pdf | tom }; 429 { kod: kvot };
 * 503 { kod: tak }; 500 { kod: fel }.
 */
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkDailyBudget, checkIpRateLimit, getClientIp } from '@/lib/rate-limit/ip'
import { MAX_FILSTORLEK, TolkaFel, filtyp, textUrFil, tolkaText } from '@/lib/cv/mallval/tolka.server'

export const runtime = 'nodejs'
export const maxDuration = 60

const IP_LIMIT = 5
const DAILY_BUDGET = 200
const SCOPE = 'cv_tolka'

async function robotkontroll(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const params = new URLSearchParams({ secret, response: token })
    if (ip && ip !== 'unknown') params.set('remoteip', ip)
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch (err) {
    // Är Cloudflare nere ska tolkningen inte gå i baklås; kvoten står kvar.
    console.error('[cv/tolka] Turnstile svarade inte:', err)
    return true
  }
}

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ kod: 'fel_typ' }, { status: 400 })
  }
  const fil = form.get('file')
  if (!(fil instanceof File)) return NextResponse.json({ kod: 'fel_typ' }, { status: 400 })
  if (fil.size > MAX_FILSTORLEK) return NextResponse.json({ kod: 'for_stor' }, { status: 400 })
  if (!filtyp(fil.name)) return NextResponse.json({ kod: 'fel_typ' }, { status: 400 })

  const ip = getClientIp(request)
  const token = typeof form.get('turnstile') === 'string' ? (form.get('turnstile') as string) : null
  if (!(await robotkontroll(token, ip))) {
    return NextResponse.json({ kod: 'robot' }, { status: 403 })
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rate = await checkIpRateLimit(admin, ip, SCOPE, IP_LIMIT)
  if (!rate.allowed) return NextResponse.json({ kod: 'kvot', resetAt: rate.resetAt }, { status: 429 })

  let text: string
  let metod: 'pdf' | 'docx'
  try {
    ;({ text, metod } = await textUrFil(fil))
  } catch (err) {
    if (err instanceof TolkaFel) {
      const status = err.kod === 'for_stor' || err.kod === 'fel_typ' ? 400 : 422
      return NextResponse.json({ kod: err.kod }, { status })
    }
    console.error('[cv/tolka] filen gick inte att läsa:', err)
    return NextResponse.json({ kod: 'tom' }, { status: 422 })
  }

  // Taket räknas först när texten finns: det är Gemini-anropet som kostar.
  const budget = await checkDailyBudget(admin, SCOPE, DAILY_BUDGET)
  if (!budget.allowed) return NextResponse.json({ kod: 'tak' }, { status: 503 })

  try {
    const tolkning = await tolkaText(text, metod)
    return NextResponse.json(tolkning, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[cv/tolka] tolkningen misslyckades:', err)
    return NextResponse.json({ kod: 'fel' }, { status: 500 })
  }
}
