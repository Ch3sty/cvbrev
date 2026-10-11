import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

/**
 * POST /api/profile/hjalp  { dold: boolean }
 *
 * "Dölj hjälpen" i Rekryteringstester och i profilen (src/lib/traning/hjalp.ts).
 * Skriver profiles.hjalp_dold med användarens egen klient; RLS begränsar
 * update till egen rad och kolumnen är inte skyddad.
 *
 * Kolumnen kommer med migreringen 20261011160000_hjalp_dold.sql. Saknas den
 * svarar rutten 204 ändå (42703 / PGRST204 sväljs): den lokala kopian i
 * localStorage bär valet tills migreringen är körd.
 */

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) return NextResponse.json({ error: 'Inte inloggad' }, { status: 401 })

  let dold: unknown
  try {
    dold = ((await req.json()) as { dold?: unknown })?.dold
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }
  if (typeof dold !== 'boolean') {
    return NextResponse.json({ error: 'dold måste vara sant eller falskt' }, { status: 400 })
  }

  const supabase = createServerClient({ cookies: await cookies() })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('profiles').update({ hjalp_dold: dold }).eq('id', user.id)
  if (error) {
    if (error.code === '42703' || error.code === 'PGRST204') return new NextResponse(null, { status: 204 })
    console.error('[profile/hjalp] kunde inte spara valet', error)
    return NextResponse.json({ error: 'Kunde inte spara' }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
