import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'

/**
 * POST /api/rum/senaste  { rum: 'tran' | 'cv' | 'brev' | 'jobb' }
 *
 * Minns rummet användaren senast var i, så att /dashboard öppnar där vid
 * nästa landning (spec-rummen avsnitt 5, våg 4). Anropas av skalet när
 * rummet byts, efter att vyn målats (requestIdleCallback).
 *
 * Kolumnen profiles.senaste_rum kommer med migreringen
 * 20261011140000_rummen_vag4.sql. Saknas den svarar rutten 204 ändå: att
 * landningen inte minns rummet är inget fel användaren ska se.
 *
 * RLS begränsar update till egen rad; kolumnen är inte skyddad.
 */

export const dynamic = 'force-dynamic'

const RUMMEN = new Set(['tran', 'cv', 'brev', 'jobb'])

export async function POST(req: Request) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) return NextResponse.json({ error: 'Inte inloggad' }, { status: 401 })

  let rum: unknown
  try {
    rum = ((await req.json()) as { rum?: unknown })?.rum
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }
  if (typeof rum !== 'string' || !RUMMEN.has(rum)) {
    return NextResponse.json({ error: 'Okänt rum' }, { status: 400 })
  }

  const supabase = createServerClient({ cookies: await cookies() })
  const { error } = await supabase.from('profiles').update({ senaste_rum: rum }).eq('id', user.id)
  if (error) {
    // 42703 / PGRST204: kolumnen finns inte än (migreringen ej körd).
    if (error.code === '42703' || error.code === 'PGRST204') return new NextResponse(null, { status: 204 })
    console.error('[rum/senaste] kunde inte spara rummet', error)
    return NextResponse.json({ error: 'Kunde inte spara' }, { status: 500 })
  }
  return new NextResponse(null, { status: 204 })
}
