/**
 * POST /api/public/test-session/claim
 *
 * Kopplar en anonym provsession till det nyss skapade kontot
 * (docs/plan-konvertering.md, C9) och skickar till resultatsidan
 * /dashboard/tester/prov/[token], där alla fem svar står med rätt eller fel
 * och förklaringen per fråga (docs/qa/qa-slutflode-2026-09-24.md, K1).
 * Raden blir permanent (expires_at null), som intervjuprovets.
 *
 * Idempotent: har samma användare redan hämtat provet får hon samma
 * redirect igen. Hämtat av någon annan, utgånget eller okänt ger 404.
 *
 * Vi skapar ingen test_sessions-rad: provet är fem frågor, inte ett helt
 * test, och ska inte förorena percentilstatistiken.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { arProvToken, hamtaEllerGorAnsprakProv, provGenomgang, provResultatHref } from '@/lib/tests/prov-rad'
import { logActivityServer } from '@/lib/activation-tracking'

export async function POST(request: Request) {
  let token: unknown
  try {
    const body = await request.json()
    token = typeof body?.token === 'string' ? body.token.trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  if (!arProvToken(token)) {
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

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const fore = await admin.from('anon_test_sessions').select('claimed_by').eq('token', token).maybeSingle()
  const redanHamtad = (fore.data as { claimed_by: string | null } | null)?.claimed_by === user.id
  const rad = await hamtaEllerGorAnsprakProv(admin, token, user.id)

  if (!rad) {
    return NextResponse.json({ error: 'Provet finns inte längre eller har gått ut.' }, { status: 404 })
  }

  const { ratt, totalt } = provGenomgang(rad.token, rad.answers ?? [])

  // Aktiviteten loggas bara vid första hämtningen, så att en omladdning
  // inte ger dubbletter i historiken.
  if (!redanHamtad) {
    try {
      await logActivityServer(user.id, 'test_completed', 'Gjorde provet utan konto', {
        slug: 'matrislogik-prova',
        score: ratt,
        total: totalt,
        anonymous_origin: true,
      })
    } catch (err) {
      console.error('[test-session/claim] Kunde inte logga aktivitet:', err)
    }
  }

  return NextResponse.json({ redirect: provResultatHref(rad.token), score: ratt, total: totalt })
}
