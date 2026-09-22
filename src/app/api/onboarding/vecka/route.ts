/**
 * POST /api/onboarding/vecka
 *
 * Veckoprogrammets framsteg (docs/plan-paket-och-onboarding.md, flöde 3).
 *
 * Tre handlingar:
 *   start     markerar att veckan börjat och schemalägger dagsmejlen, en gång
 *   complete  kvitterar dagen och flyttar fram week_progress_day
 *   goto      hoppar till en annan dag, utan att kvittera något
 *
 * 'start' anropas av köpreturen (/dashboard/vecka/start). Den hör egentligen
 * hemma i Stripe-webhooken, men webhooken ägs av en annan agent och en
 * veckoserie som aldrig schemaläggs är sämre än en som schemaläggs en gång
 * för sent. Anropet är idempotent: week_started_at sätts bara om den är tom,
 * och scheduleEmail har unique-index på (user_id, email_type).
 *
 * Dagnumret följer framsteg, aldrig kalendern: gör användaren dag 1 till 3 på
 * måndagskvällen står hon på dag 4 på tisdagen, och vi skjuter henne aldrig
 * tillbaka. Fältet är week_progress_day, inte en uträkning ur köpdatumet.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { onWeekStarted } from '@/lib/email/lifecycle/hooks'

const MAX_DAG = 7

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Ej autentiserad' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      action?: unknown
      day?: unknown
    }
    const action = body.action
    const day = Number(body.day)

    if (action !== 'complete' && action !== 'goto' && action !== 'start') {
      return NextResponse.json({ success: false, error: 'Ogiltig handling' }, { status: 400 })
    }
    // Bara dagshandlingarna bär ett dagnummer.
    if (action !== 'start' && (!Number.isInteger(day) || day < 1 || day > MAX_DAG)) {
      return NextResponse.json({ success: false, error: 'Ogiltig dag' }, { status: 400 })
    }

    const admin = getSupabaseAdmin() as any

    const { data: profile } = await admin
      .from('profiles')
      .select('week_progress_day, week_started_at, onboarding_track, premium_scope')
      .eq('id', user.id)
      .maybeSingle()

    const nuvarande = Number(profile?.week_progress_day ?? 0) || 0
    const patch: Record<string, unknown> = {}

    if (!profile?.week_started_at) patch.week_started_at = new Date().toISOString()

    if (action === 'start') {
      // Veckan börjar en gång. Är den redan startad gör anropet ingenting,
      // så en omladdning av köpreturen inte schemalägger fjorton mejl igen.
      if (profile?.week_started_at) {
        return NextResponse.json({ success: true, alreadyStarted: true })
      }
      const spar = (profile?.onboarding_track ?? profile?.premium_scope) as
        | 'cv'
        | 'tester'
        | 'allt'
        | null
      patch.week_progress_day = Math.max(nuvarande, 1)

      const { error: startError } = await admin.from('profiles').update(patch).eq('id', user.id)
      if (startError) {
        console.error('[onboarding/vecka] Kunde inte starta veckan:', startError.message)
        return NextResponse.json({ success: false, error: 'Kunde inte spara' }, { status: 500 })
      }

      // Mejlen får aldrig fälla svaret: veckan är startad oavsett.
      try {
        await onWeekStarted(admin, user.id, spar ?? 'cv')
      } catch (mailError) {
        console.error('[onboarding/vecka] Veckoserien kunde inte schemaläggas:', mailError)
      }

      return NextResponse.json({ success: true, progressDay: patch.week_progress_day })
    }

    if (action === 'complete') {
      // Kvitteringen flyttar fram till nästa dag, men backar aldrig. Hoppar
      // användaren till dag 6 på tisdagen och gör den, står hon på dag 7.
      patch.week_progress_day = Math.min(MAX_DAG, Math.max(nuvarande, day + 1))
    } else {
      // Hoppa till en dag: vi flyttar framåt, men aldrig bakåt. Ingen dag är
      // låst, och den som går tillbaka tappar inte sina framsteg.
      patch.week_progress_day = Math.max(nuvarande, day)
    }

    const { error } = await admin.from('profiles').update(patch).eq('id', user.id)
    if (error) {
      console.error('[onboarding/vecka] Kunde inte spara framsteget:', error.message)
      return NextResponse.json({ success: false, error: 'Kunde inte spara' }, { status: 500 })
    }

    return NextResponse.json({ success: true, progressDay: patch.week_progress_day })
  } catch (error) {
    console.error('[onboarding/vecka] Fel:', error)
    return NextResponse.json({ success: false, error: 'Serverfel' }, { status: 500 })
  }
}
