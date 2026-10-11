/**
 * POST /api/contact: kontaktformuläret i inloggat läge (/dashboard/kontakt).
 *
 * Det fanns ingen backend för kontaktformulären före våg 5; båda visade
 * "Tack" utan att skicka något. Den här routen följer mönstret i
 * /api/bugg-feedback: inloggad användare, mejl via Resend till
 * support@jobbcoach.ai med svar till adressen i formuläret. Ingen tabell
 * skrivs, så inget behöver städas efter ett test.
 *
 * Svar: 200 { ok: true } när Resend tagit emot mejlet. 400 vid fel i
 * fälten, 401 utan inloggning, 500 när mejlet inte gick iväg (saknad eller
 * ogiltig RESEND_API_KEY, Resend nere). Formuläret visar Tack bara på 2xx.
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { byggMejl, validera } from './kontakt'

const FEL_SKICKA = 'Meddelandet gick inte iväg. Försök igen om en stund, eller maila support@jobbcoach.ai.'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ ok: false, message: 'Logga in igen och skicka på nytt.' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ ok: false, message: 'Fyll i alla fält.' }, { status: 400 })
    }
    const v = validera(body)
    if (!v.ok) return NextResponse.json({ ok: false, message: v.fel }, { status: 400 })

    // Premium avgör bara ordningen i supportens inkorg, aldrig om mejlet går.
    let premium = false
    try {
      premium = await userHasAccess(supabase, user.id, 'any')
    } catch {
      premium = false
    }

    const nyckel = process.env.RESEND_API_KEY
    if (!nyckel) {
      console.error('[kontakt] RESEND_API_KEY saknas')
      return NextResponse.json({ ok: false, message: FEL_SKICKA }, { status: 500 })
    }
    const resend = new Resend(nyckel)
    const { error } = await resend.emails.send(
      byggMejl(v.data, { userId: user.id, kontoEpost: user.email ?? null, premium })
    )
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
