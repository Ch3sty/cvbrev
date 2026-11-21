/**
 * POST /api/letters/[id]/skriv-om
 *
 * Skriver om brevet med AI i en ny ton eller på ett nytt språk (BYGGSPEC
 * avsnitt 2 och 4). Räknas som ett nytt brev mot veckokvoten, som i dag,
 * men brevet behåller sitt id, sin mall och sitt typsnitt. Ändringar
 * användaren gjort i texten ersätts; hälsningen går tillbaka till mallens
 * förval och kraven läses om.
 *
 * Kropp: { tonality?: string, language?: 'sv' | 'en' }
 * Svar: { success, data: Letter & { isLocked, kravTraffar }, kvot: BrevKvot }
 * Fel: 403 letter_locked, 402 premium_required (sparr 'ton'), 422
 * name_required, 429 quota_exceeded (samma kropp som genereringen), 409
 * cv_saknas eller annons_saknas.
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { arPlatshallareNamn } from '@/lib/profile/dokumentKontakt'
import { DAILY_LIMIT_LETTERS } from '@/lib/quota/quotaService'
import { arTon, premiumSparr } from '@/lib/letters/brevRegler'
import { brevKvotEfterSkrivning } from '@/lib/letters/brevKvot'
import { titelUrStrukturerad } from '@/lib/letters/brevData'
import { kravForBrev } from '@/lib/letters/lage'
import {
  LAST_SVAR,
  arBrevLastForAnvandare,
  hamtaBrevProfil,
  ritaRad,
  startmallForCv,
} from '@/lib/letters/server'
import { kvotArSlut, kvotLage, kvotSlutSvar, raknaBrevMotKvot, skrivBrevtext } from '@/lib/letters/skrivBrev'

/** "Ansökan: X" blir "Application: X" och tvärtom när språket byts. */
function titelForSprak(titel: string | null, sprak: 'sv' | 'en'): string | null {
  if (!titel) return titel
  const m = titel.match(/^(Ansökan|Application):\s*(.+)$/)
  if (m) return `${sprak === 'en' ? 'Application' : 'Ansökan'}: ${m[2]}`
  if (titel === 'Ansökningsbrev' && sprak === 'en') return 'Job Application'
  if (titel === 'Job Application' && sprak === 'sv') return 'Ansökningsbrev'
  return titel
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    let body: { tonality?: unknown; language?: unknown } = {}
    try {
      body = (await request.json()) ?? {}
    } catch {
      body = {}
    }
    if (body.tonality !== undefined && !arTon(body.tonality)) {
      return NextResponse.json({ error: 'Okänd ton', code: 'invalid_tone' }, { status: 400 })
    }
    if (body.language !== undefined && body.language !== 'sv' && body.language !== 'en') {
      return NextResponse.json({ error: 'Okänt språk', code: 'invalid_language' }, { status: 400 })
    }

    const { data: brev, error: brevFel } = await supabase
      .from('letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (brevFel || !brev) return NextResponse.json({ error: 'Brevet hittades inte' }, { status: 404 })

    const ton = (body.tonality as string | undefined) ?? brev.tonality ?? 'professional'
    const sprak: 'sv' | 'en' = ((body.language as string | undefined) ?? brev.language) === 'en' ? 'en' : 'sv'

    const harBetalt = await userHasAccess(supabase, user.id, 'any')
    if (await arBrevLastForAnvandare(supabase, user.id, id, harBetalt)) {
      return NextResponse.json(LAST_SVAR, { status: 403 })
    }
    const sparr = premiumSparr({ ton: body.tonality as string | undefined }, harBetalt)
    if (sparr) {
      return NextResponse.json({ error: 'premium_required', code: 'premium_required', sparr }, { status: 402 })
    }

    const annons = (brev.job_description ?? '').trim()
    if (!annons) {
      return NextResponse.json({ error: 'Annonsen saknas för det här brevet', code: 'annons_saknas' }, { status: 409 })
    }

    const { profil, cvStrukturerad } = await hamtaBrevProfil(supabase, user.id, brev.cv_id ?? null)
    if (!profil) return NextResponse.json({ error: 'Kunde inte hämta användarprofil' }, { status: 500 })
    if (arPlatshallareNamn(profil.full_name)) {
      return NextResponse.json({ error: 'name_required', code: 'name_required' }, { status: 422 })
    }

    // CV-texten: CV:t brevet skrevs mot, annars texten som sparades med brevet.
    let cvText: string | null = null
    if (brev.cv_id) {
      const { data: cv } = await supabase
        .from('cv_texts')
        .select('cv_text')
        .eq('id', brev.cv_id)
        .eq('user_id', user.id)
        .maybeSingle()
      cvText = (cv as { cv_text?: string | null } | null)?.cv_text ?? null
    }
    cvText = cvText || brev.cv_text || null
    if (!cvText) {
      return NextResponse.json({ error: 'CV:t för brevet finns inte längre', code: 'cv_saknas' }, { status: 409 })
    }

    // Kvoten: omskrivningen räknas som ett nytt brev (samma kolumner som genereringen).
    const nu = new Date()
    const kvot = kvotLage(profil, nu)
    if (!harBetalt && kvotArSlut(kvot)) {
      return NextResponse.json(kvotSlutSvar(kvot), { status: 429 })
    }
    if (!harBetalt) await raknaBrevMotKvot(user.id, kvot, nu)

    const skriven = await skrivBrevtext({
      supabase,
      userId: user.id,
      cvText,
      cvStrukturerad,
      profil,
      annons,
      ton,
      sprak,
      flode: 'letter_rewrite',
    })

    const rad = {
      ...brev,
      body_stycken: skriven.stycken,
      halsning: null,
      krav: skriven.krav,
      tonality: ton,
      language: sprak,
      title: titelForSprak(brev.title, sprak),
      mall_id: brev.mall_id ?? startmallForCv(cvStrukturerad, harBetalt),
      ai_model: skriven.ai_model,
      ai_tokens: skriven.ai_tokens,
      ai_cost: skriven.ai_cost,
      generation_time_ms: skriven.generation_time_ms,
      is_saved: true,
      updated_at: nu.toISOString(),
    }
    const avsandare = { ...profil, titel: titelUrStrukturerad(cvStrukturerad) }
    const content = ritaRad(rad, avsandare, user)

    const { data, error } = await supabase
      .from('letters')
      .update({
        body_stycken: rad.body_stycken,
        halsning: null,
        krav: rad.krav,
        tonality: rad.tonality,
        language: rad.language,
        title: rad.title,
        mall_id: rad.mall_id,
        ai_model: rad.ai_model,
        ai_tokens: rad.ai_tokens,
        ai_cost: rad.ai_cost,
        generation_time_ms: rad.generation_time_ms,
        is_saved: true,
        updated_at: rad.updated_at,
        content,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !data) {
      console.error('Omskrivningen kunde inte sparas:', error)
      return NextResponse.json({ error: 'Kunde inte spara brevet' }, { status: 500 })
    }

    const kvotEfter = harBetalt
      ? { harBetalt: true, grans: DAILY_LIMIT_LETTERS, anvant: 0, kvar: null, nastaGratisbrev: null }
      : brevKvotEfterSkrivning(profil, nu)

    return NextResponse.json({
      success: true,
      data: { ...data, isLocked: false, kravTraffar: kravForBrev(data) },
      kvot: kvotEfter,
    })
  } catch (error: any) {
    console.error('Omskrivning error:', error)
    return NextResponse.json({ error: 'Serverfel vid omskrivning av brevet: ' + error.message }, { status: 500 })
  }
}
