/**
 * POST /api/contact: kontaktformulären, inloggat (/dashboard/kontakt) och
 * publikt (/kontakt).
 *
 * Det fanns ingen backend för kontaktformulären före våg 5; båda visade
 * "Tack" utan att skicka något. Routen följer mönstret i /api/bugg-feedback:
 * mejl via Resend till support@jobbcoach.ai med svar till adressen i
 * formuläret. Ingen tabell skrivs för själva meddelandet.
 *
 * Två vägar (spec-rummen 23.1):
 * - Session finns: kontots id och e-post följer med, Premium märks i ämnet.
 * - Session saknas: den publika vägen. Honungsfältet ifyllt ger 200 utan att
 *   skicka. Annars tre meddelanden per IP och dygn (hashad IP i
 *   public_rate_limits) och 50 per dygn totalt (public_generation_budget),
 *   samma mönster som api/public/intervjuprov. Ämnet får [Publik].
 *
 * Svar: 200 { ok: true } när Resend tagit emot mejlet. 400 vid fel i
 * fälten, 429 över gränsen på den publika vägen, 500 när mejlet inte gick
 * iväg (saknad eller ogiltig RESEND_API_KEY, Resend nere). Formulären visar
 * Tack bara på 2xx.
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { checkDailyBudget, checkIpRateLimit, getClientIp } from '@/lib/rate-limit/ip'
import { FEL_GRANS, arHonung, byggMejl, validera, type Avsandare } from './kontakt'

const FEL_SKICKA = 'Meddelandet gick inte iväg. Försök igen om en stund, eller maila support@jobbcoach.ai.'

/** Publika vägen: meddelanden per IP och dygn. */
const IP_LIMIT = 3
/** Publika vägen: meddelanden per dygn totalt. */
const DAILY_BUDGET = 50
const SCOPE = 'kontakt'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    let user: { id: string; email?: string | null } | null = null
    try {
      const { data, error } = await supabase.auth.getUser()
      user = error ? null : data.user
    } catch {
      user = null
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, message: 'Fyll i alla fält.' }, { status: 400 })
    }

    // Honungsfältet: en robot har fyllt i det dolda fältet. Vi svarar som om
    // allt gick bra, så att den inte lär sig något, och skickar ingenting.
    if (!user && arHonung(body)) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const v = validera(body)
    if (!v.ok) return NextResponse.json({ ok: false, message: v.fel }, { status: 400 })

    let fran: Avsandare
    if (user) {
      // Premium avgör bara ordningen i supportens inkorg, aldrig om mejlet går.
      let premium = false
      try {
        premium = await userHasAccess(supabase, user.id, 'any')
      } catch {
        premium = false
      }
      fran = { userId: user.id, kontoEpost: user.email ?? null, harPremium: premium }
    } else {
      const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
      const rate = await checkIpRateLimit(admin, getClientIp(req), SCOPE, IP_LIMIT)
      if (!rate.allowed) {
        return NextResponse.json({ ok: false, message: FEL_GRANS }, { status: 429 })
      }
      const budget = await checkDailyBudget(admin, SCOPE, DAILY_BUDGET)
      if (!budget.allowed) {
        return NextResponse.json({ ok: false, message: FEL_GRANS }, { status: 429 })
      }
      fran = { userId: null, kontoEpost: null, harPremium: false, publik: true }
    }

    const nyckel = process.env.RESEND_API_KEY
    if (!nyckel) {
      console.error('[kontakt] RESEND_API_KEY saknas')
      return NextResponse.json({ ok: false, message: FEL_SKICKA }, { status: 500 })
    }
    const resend = new Resend(nyckel)
    const { error } = await resend.emails.send(byggMejl(v.data, fran))
    if (error) {
      console.error('[kontakt] Resend:', error)
      return NextResponse.json({ ok: false, message: FEL_SKICKA }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error: unknown) {
    console.error('[kontakt] oväntat fel:', error)
    return NextResponse.json({ ok: false, message: FEL_SKICKA }, { status: 500 })
  }
}
