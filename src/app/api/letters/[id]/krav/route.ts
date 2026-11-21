/**
 * POST /api/letters/[id]/krav
 *
 * "Lägg till i brevet" för ett saknat krav (BYGGSPEC avsnitt 4): meningen
 * användaren skriver läggs sist i stycket (förval: näst sista) och blir
 * kravets citat. Ingen AI, ingen kvot. Samma lås som övriga ändringar.
 *
 * Kropp: { kravIndex: number, mening: string, stycke?: number }
 * Svar: { success, data: Letter & { isLocked, kravTraffar }, stycke: number }
 * Fel: 400 invalid_field, 403 letter_locked, 409 krav_saknas (brevet har
 * inget kravmått).
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { laggTillMening, lasSparadeKrav } from '@/lib/letters/krav'
import { styckenForBrev } from '@/lib/letters/stycken'
import { kravForBrev } from '@/lib/letters/lage'
import { LAST_SVAR, arBrevLastForAnvandare, hamtaBrevProfil, ritaRad, startmallForCv } from '@/lib/letters/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    let body: { kravIndex?: unknown; mening?: unknown; stycke?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
    }
    if (typeof body?.mening !== 'string' || typeof body?.kravIndex !== 'number') {
      return NextResponse.json({ error: 'Meningen och kravet krävs', code: 'invalid_field' }, { status: 400 })
    }
    if (body.stycke !== undefined && body.stycke !== null && typeof body.stycke !== 'number') {
      return NextResponse.json({ error: 'Ogiltigt stycke', code: 'invalid_field', falt: 'stycke' }, { status: 400 })
    }

    const { data: brev, error: brevFel } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (brevFel || !brev) return NextResponse.json({ error: 'Brevet hittades inte' }, { status: 404 })

    const harBetalt = await userHasAccess(supabase, user.id, 'any')
    if (await arBrevLastForAnvandare(supabase, user.id, id, harBetalt)) {
      return NextResponse.json(LAST_SVAR, { status: 403 })
    }

    const krav = lasSparadeKrav(brev.krav)
    if (!krav || krav.length === 0) {
      return NextResponse.json({ error: 'Brevet har inga krav att svara på', code: 'krav_saknas' }, { status: 409 })
    }

    const ut = laggTillMening(styckenForBrev(brev), krav, body.kravIndex, body.mening, body.stycke as number | undefined)
    if (!ut) return NextResponse.json({ error: 'Meningen kunde inte läggas till', code: 'invalid_field' }, { status: 400 })

    const { profil, cvStrukturerad } = await hamtaBrevProfil(supabase, user.id, brev.cv_id ?? null)
    const rad = {
      ...brev,
      body_stycken: ut.stycken,
      krav: ut.krav,
      // Ett gammalt brev flyttas till nya formatet vid första ändringen.
      mall_id: brev.mall_id ?? startmallForCv(cvStrukturerad, harBetalt),
    }
    const content = ritaRad(rad, profil, user)

    const { data, error } = await supabase
      .from('letters')
      .update({
        body_stycken: rad.body_stycken,
        krav: rad.krav,
        mall_id: rad.mall_id,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) {
      console.error('Meningen kunde inte sparas:', error)
      return NextResponse.json({ error: 'Kunde inte spara brevet' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { ...data, isLocked: false, kravTraffar: kravForBrev(data) },
      stycke: ut.stycke,
    })
  } catch (error: any) {
    console.error('Krav error:', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
