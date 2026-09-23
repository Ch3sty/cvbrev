/**
 * POST /api/public/intervjuprov/claim
 *
 * Kopplar ett anonymt intervjusvar till det nyss skapade kontot
 * (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 5). Först därefter
 * visas hela återkopplingen och det omskrivna svaret, på
 * /dashboard/intervju/[token].
 *
 * Idempotent: har samma användare redan hämtat svaret får hon samma
 * redirect igen. Hämtat av någon annan, utgånget eller okänt ger 404.
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { logActivityServer } from '@/lib/activation-tracking'
import { arToken, hamtaEllerGorAnsprak } from '@/lib/intervju/rad'

export async function POST(request: Request) {
  let token: unknown
  try {
    const body = await request.json()
    token = typeof body?.token === 'string' ? body.token.trim() : undefined
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  if (!arToken(token)) {
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
    return NextResponse.json(
      { error: 'Svaret finns inte längre eller har gått ut.' },
      { status: 404 }
    )
  }

  try {
    await logActivityServer(user.id, 'interview_sample_claimed', 'Hämtade intervjuprovet från artikeln', {
      question: rad.question,
      level: rad.level,
      anonymous_origin: true,
    })
  } catch (err) {
    console.error('[intervjuprov/claim] Kunde inte logga aktivitet:', err)
  }

  return NextResponse.json({ redirect: `/dashboard/intervju/${rad.token}` })
}
