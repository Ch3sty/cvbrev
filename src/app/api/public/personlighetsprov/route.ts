/**
 * POST /api/public/personlighetsprov
 *
 * Personlighetsprovet i artiklarna och på /verktyg/personlighetstest
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 5). Besökaren
 * skickar tjugo svar och får profilen: en mening och fem faktorer med
 * bandord, segment och en läsning i rekryterarens perspektiv.
 *
 * Ren beräkning, ingen modell. Omvändningen görs här med motorns
 * computeScores och lämnar aldrig servern: svaret innehåller inga råpoäng,
 * ingen faktor per påstående och inga kravprofiler. Allt det visas först på
 * /dashboard/intervju/profil/[token] efter claim.
 *
 * Kvot: tre prov per IP och dygn för besökare utan konto (scope
 * anon_personality). Inloggade har ingen kvot, raden ägs direkt. Raden
 * skrivs aldrig till user_personality_profile.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createServerClient } from '@/lib/supabase/server'
import { checkIpRateLimit, getClientIp, hashIp } from '@/lib/rate-limit/ip'
import { poangForSmakprov } from '@/lib/personlighet/smakprov-facit'
import { faktorUtfall, profilMening } from '@/lib/personlighet/smakprov-tolkning'
import { validerBegaran } from '@/lib/personlighet/smakprov-validering'
import { profilHref } from '@/lib/intervju/lankar'
import type { BigFiveScores } from '@/lib/personalityTest/types'
import { COPY } from '@/components/artiklar/personlighetsprov/personlighetsprov-copy'

/** Tre prov per IP och dygn, som testprovet: ingen modellkostnad. */
const IP_LIMIT = 3
const SCOPE = 'anon_personality'

/** Antal platshållarrader i de tre låsta blocken. */
const LOCKED_COUNTS = { krav: 6, intervju: 5, omvanda: 3 } as const

/** Det synliga svaret. Samma form för ny rad och för en upprepad token. */
function synligtSvar(token: string, scores: BigFiveScores, expiresAt: string | null, inloggad: boolean) {
  return {
    token,
    mening: profilMening(scores),
    faktorer: faktorUtfall(scores).map((f) => ({
      key: f.key,
      namn: f.namn,
      band: f.band,
      bandOrd: f.bandOrd,
      segment: f.segment,
      lasning: f.lasning,
    })),
    lockedCounts: LOCKED_COUNTS,
    expiresAt,
    ...(inloggad ? { href: profilHref(token) } : {}),
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // 1. Validering.
  const begaran = validerBegaran(body)
  if (!begaran) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 2. Idempotens: "Försök igen" efter ett nätverksfel ger aldrig en dubblett
  // och räknas aldrig som ett nytt prov.
  const { data: finns } = await admin
    .from('anon_personality_samples')
    .select('token, scores, expires_at, user_id, claimed_by')
    .eq('token', begaran.token)
    .maybeSingle()
  if (finns) {
    const rad = finns as {
      token: string
      scores: BigFiveScores
      expires_at: string | null
      user_id: string | null
      claimed_by: string | null
    }
    const agare = rad.claimed_by ?? rad.user_id
    // En token som redan hör till någon annan lämnar ingenting ut.
    if (agare && agare !== user?.id) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    return NextResponse.json(synligtSvar(rad.token, rad.scores, rad.expires_at, Boolean(user)))
  }

  // 3. Kvot, bara anonym.
  const ip = getClientIp(request)
  if (!user) {
    const rate = await checkIpRateLimit(admin, ip, SCOPE, IP_LIMIT)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', message: COPY.kvot.ip, registerHref: '/register', resetAt: rate.resetAt },
        { status: 429 }
      )
    }
  }

  // 4. Poäng och lagring.
  const scores = poangForSmakprov(begaran.answers)
  const { data, error } = await admin
    .from('anon_personality_samples')
    .insert({
      token: begaran.token,
      answers: begaran.answers,
      scores,
      ip_hash: hashIp(ip),
      source_slug: begaran.slug,
      user_id: user?.id ?? null,
      claimed_by: user?.id ?? null,
      // Inloggad: raden ägs direkt och är permanent (beslut 2).
      ...(user ? { expires_at: null } : {}),
    })
    .select('token, expires_at')
    .single()

  if (error || !data) {
    console.error('[personlighetsprov] Kunde inte spara provet:', error)
    return NextResponse.json({ error: 'server', message: COPY.fel.server.text }, { status: 500 })
  }

  const row = data as { token: string; expires_at: string | null }

  // 5. Det synliga svaret.
  return NextResponse.json(synligtSvar(row.token, scores, row.expires_at, Boolean(user)))
}
