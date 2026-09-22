/**
 * POST /api/onboarding/track
 *
 * Sparar spåret användaren valde i onboardingen
 * (docs/plan-paket-och-onboarding.md, Fas 2A flöde 1).
 *
 * Spåret sparas oberoende av betalning: hemskärmens ordning, betalväggarnas
 * förslag och gratisnivåns första handling följer det. Därför skrivs det även
 * när användaren trycker Börja gratis, och även när svaret är "vet inte än",
 * som sparas som null med en tidsstämpel så att vi vet att frågan är ställd.
 *
 * Skriver bara på den inloggade användarens egen rad. userId tas aldrig från
 * body: service role-klienten används för att kringgå RLS på profiles, inte
 * för att låta anroparen peka ut någon annan.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { isTrack } from '@/lib/onboarding/program'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Ej autentiserad' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const raw = (body as { track?: unknown }).track

    // null är ett giltigt svar: "jag vet inte än" ska kunna sparas som sant.
    const track = raw === null || raw === undefined ? null : raw
    if (track !== null && !isTrack(track)) {
      return NextResponse.json({ success: false, error: 'Ogiltigt spår' }, { status: 400 })
    }

    const admin = getSupabaseAdmin() as any

    // Tidigare spår behövs för track_changed, som klienten skjuter.
    const { data: before } = await admin
      .from('profiles')
      .select('onboarding_track')
      .eq('id', user.id)
      .maybeSingle()

    const { error } = await admin
      .from('profiles')
      .update({
        onboarding_track: track,
        onboarding_track_asked_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('[onboarding/track] Kunde inte spara spåret:', error.message)
      return NextResponse.json({ success: false, error: 'Kunde inte spara valet' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      track,
      previousTrack: (before?.onboarding_track as string | null) ?? null,
    })
  } catch (error) {
    console.error('[onboarding/track] Fel:', error)
    return NextResponse.json({ success: false, error: 'Serverfel' }, { status: 500 })
  }
}
