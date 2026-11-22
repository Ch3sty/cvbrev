/**
 * POST /api/public/letter-draft/claim
 *
 * Gör ett anonymt utkast till den nyss registrerade användarens brev
 * (docs/plan-konvertering.md, C6). Kräver inloggning: det är först här
 * hela brevtexten blir tillgänglig.
 *
 * Publikt omgång 3 (byggbriefens beslut 6): kroppen bär också besökarens
 * val från startflödet, { token, mall?, ton?, annons? }, sparat bredvid
 * utkastets token i webbläsaren (publikt-brev-val.ts). Brevet skrivs i
 * brevrummets format (stycken och mall_id) och öppnas i den valda mallen;
 * en Premiummall på gratisnivån provas i Mallar och brevet sparas i Linne.
 * Reglerna står i src/lib/letters/claim-brev.ts.
 *
 * Veckans gratisbrev (ägarens beslut 2026-11-22): kontots första inhämtade
 * utkast räknas inte mot kvoten. Ett andra utkast räknas som ett brev skrivet
 * i kontot, och nekas med 429 när veckans gratisbrev redan är skrivet.
 * Startflödets IP-gräns (public_rate_limits) begränsar utkasten före kontot.
 *
 * Idempotent: har samma användare redan hämtat utkastet får de tillbaka
 * samma brev i stället för ett nytt.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { forstaInhamtadeUtkast, getClaimableDraft, raknaInhamtadeUtkast } from '@/lib/letters/public-draft'
import { hamtaBrevProfil, ritaRad } from '@/lib/letters/server'
import { claimKvot, claimMall, claimRad, claimRedirect, lasClaimVal, type ClaimKvotProfil } from '@/lib/letters/claim-brev'
import { kvotSlutSvar, raknaBrevMotKvot } from '@/lib/letters/skrivBrev'
import { kvitteraBrevFranPublikt } from '@/lib/onboarding/forsta-handling.server'

export async function POST(request: Request) {
  let body: Record<string, unknown> | null = null
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  const token = typeof body?.token === 'string' ? body.token.trim() : undefined
  if (!token) {
    return NextResponse.json({ error: 'Token saknas' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
  }

  // De nya konverteringstabellerna finns ännu inte i database.types.ts, så
  // admin-klienten castas här på samma sätt som i supabase/middleware.ts.
  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const draft = await getClaimableDraft(admin, token)

  if (!draft) {
    return NextResponse.json(
      { error: 'Utkastet finns inte längre eller har gått ut.' },
      { status: 404 }
    )
  }

  // Redan hämtat av någon annan: neka.
  if (draft.claimed_by && draft.claimed_by !== user.id) {
    return NextResponse.json({ error: 'Utkastet är redan hämtat.' }, { status: 409 })
  }

  const val = lasClaimVal(body)
  // Samma behörighet som brevrummet läser (engångsköp och admin räknas).
  const harBetalt = await userHasAccess(supabase, user.id, 'any').catch(() => false)
  const mall = claimMall(val.mall, harBetalt)

  // Redan hämtat av samma användare: leta upp brevet och skicka tillbaka
  // samma redirect som första gången.
  if (draft.claimed_by === user.id) {
    const { data: existing } = await admin
      .from('letters')
      .select('id, mall_id')
      .eq('user_id', user.id)
      .eq('title', draft.role)
      .eq('company', draft.employer)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const rad = existing as { id?: string; mall_id?: string | null } | null
    if (rad?.id) {
      return NextResponse.json({ redirect: claimRedirect(rad.id, rad.mall_id ? mall : { sparad: mall.sparad, provas: null }) })
    }
  }

  // Veckans gratisbrev (ägarens beslut 2026-11-22, claim-brev.ts): kontots
  // första inhämtade utkast räknas inte. Varje utkast efter det räknas som
  // ett brev skrivet i kontot, och är veckans gratisbrev redan skrivet hämtas
  // det inte in (samma 429 som generate-preview ger).
  const nu = new Date()
  let kvot: ReturnType<typeof claimKvot> | null = null
  if (!harBetalt) {
    const [tidigare, { data: kvotRad }] = await Promise.all([
      raknaInhamtadeUtkast(admin, user.id, draft.token),
      supabase.from('profiles').select('weekly_letter_count, weekly_letter_first_used_at').eq('id', user.id).maybeSingle(),
    ])
    kvot = claimKvot(tidigare, false, kvotRad as ClaimKvotProfil | null, nu)
    if (kvot.beslut === 'slut') {
      return NextResponse.json(kvotSlutSvar(kvot.lage), { status: 429 })
    }
  }

  const rad = claimRad(draft, user.id, val, mall, nu)

  // content: färdig HTML i mallen för äldre kod, mejl och utkastvägen, som
  // generate-preview. Avsändaren ur profilen, efter alla AI-anrop. Går
  // ritningen fel står utkastets text kvar som content, som före omgång 3.
  let content = draft.letter_text
  if (rad.mall_id) {
    try {
      const { profil } = await hamtaBrevProfil(supabase, user.id, null)
      content = ritaRad(rad, profil, user)
    } catch (err) {
      console.error('[letter-draft/claim] Kunde inte rita brevet i mallen:', err)
    }
  }

  const { data: letter, error: insertError } = await admin
    .from('letters')
    .insert({ ...rad, content })
    .select('id')
    .single()

  if (insertError || !letter) {
    console.error('[letter-draft/claim] Kunde inte skapa brev:', insertError)
    return NextResponse.json({ error: 'Kunde inte spara brevet.' }, { status: 500 })
  }

  // Märk utkastet som hämtat. Villkoret på claimed_by is null gör att två
  // samtidiga anrop inte kan ge två brev.
  await admin
    .from('public_letter_drafts')
    .update({ claimed_by: user.id, claimed_at: new Date().toISOString() })
    .eq('token', draft.token)
    .is('claimed_by', null)

  const letterId = (letter as { id: string }).id

  if (kvot) {
    // Två samtidiga anrop med olika utkast kan båda ha sett noll tidigare.
    // Efter märkningen är bara kontots första inhämtade utkast fritt; ett
    // annat som trodde sig vara fritt räknas ändå.
    const raknas =
      kvot.beslut === 'raknas' ||
      (kvot.beslut === 'fritt' && ((await forstaInhamtadeUtkast(admin, user.id)) ?? draft.token) !== draft.token)
    if (raknas) await raknaBrevMotKvot(user.id, kvot.lage, nu)
  }

  // Kontots första brev, som om det skrivits i kontot: milstolpen,
  // onboardingsteget och Kom igångs bricka (klicktestet 2026-11-22, punkt 4).
  await kvitteraBrevFranPublikt(supabase, user.id, letterId)

  return NextResponse.json({
    redirect: claimRedirect(letterId, rad.mall_id ? mall : { sparad: mall.sparad, provas: null }),
  })
}
