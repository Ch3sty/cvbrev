/**
 * POST /api/onboarding/komigang
 *
 * Kvitterar en bricka i hjälpredan "Kom igång" som inte har någon
 * serverhandling att haka på. I dag är det bara "Din kurva": att se
 * utvecklingsfliken är en vy, inte en skrivning, så fliken anmäler sig här
 * när den öppnats med historik.
 *
 * Alla andra brickor kvitteras i sina rutter (komigang-server.ts) eller
 * härleds ur tabellerna. Rutten tar därför bara emot en snäv lista, så
 * ingen kan markera "CV-analysen körd" utan att ha kört den.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { markeraBricka } from '@/lib/onboarding/komigang-server'
import type { BrickaKey } from '@/lib/onboarding/komigang'

const TILLATNA: readonly BrickaKey[] = ['kurva']

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Ej autentiserad' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as { key?: unknown }
    const key = body.key
    if (typeof key !== 'string' || !(TILLATNA as readonly string[]).includes(key)) {
      return NextResponse.json({ success: false, error: 'Ogiltig bricka' }, { status: 400 })
    }

    await markeraBricka(user.id, key as BrickaKey)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[onboarding/komigang] Fel:', error)
    return NextResponse.json({ success: false, error: 'Serverfel' }, { status: 500 })
  }
}
