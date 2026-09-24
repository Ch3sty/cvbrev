/**
 * POST /api/public/personlighetsprov/claim
 *
 * Kopplar ett anonymt personlighetsprov till det nyss skapade kontot
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 5), som
 * intervjuprovets claim. Först därefter visas hela tolkningen, på
 * /dashboard/intervju/profil/[token]. Raden blir permanent.
 *
 * Idempotent: har samma användare redan hämtat provet får hon samma
 * redirect igen. Hämtat av någon annan, utgånget eller okänt ger 404.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logActivityServer } from '@/lib/activation-tracking'
import { hamtaEllerGorAnsprak } from '@/lib/personlighet/smakprov-rad'
import { arUuid } from '@/lib/personlighet/smakprov-validering'
import { profilHref } from '@/lib/intervju/lankar'

export async function POST(request: Request) {
  let token: unknown
  try {
    const body = await request.json()
    token = typeof body?.token === 'string' ? body.token.trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  if (!arUuid(token)) {
    return NextResponse.json({ error: 'Token saknas' }, { status: 400 })
  }

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
  }

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rad = await hamtaEllerGorAnsprak(admin, token, user.id)

  if (!rad) {
    return NextResponse.json({ error: 'Provet finns inte längre eller har gått ut.' }, { status: 404 })
  }

  try {
    await logActivityServer(user.id, 'personality_sample_claimed', 'Hämtade personlighetsprovet', {
      source_slug: rad.source_slug,
      anonymous_origin: true,
    })
  } catch (err) {
    console.error('[personlighetsprov/claim] Kunde inte logga aktivitet:', err)
  }

  return NextResponse.json({ redirect: profilHref(rad.token) })
}
