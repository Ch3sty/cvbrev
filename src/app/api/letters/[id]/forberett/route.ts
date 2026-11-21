/**
 * POST /api/letters/[id]/forberett
 *
 * Markerar att brevet kopierats eller laddats ner (forberett_at, första
 * gången). Steget "läs igenom" på brevets väg blir klart. Tillåtet även på
 * låsta brev: läsa och kopiera ingår gratis. Rör inte updated_at, så att
 * kopieringen inte flyttar brevet i listan eller öppnar ett låst brev.
 *
 * Kropp: { som: 'kopierat' | 'nedladdat' } (förval 'kopierat')
 * Svar: { success, data: { forberett_at, forberett_som } }
 *
 * Nedladdningsrutten (arket) kan i stället anropa markeraForberett i
 * src/lib/letters/server.ts direkt efter en lyckad nedladdning.
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { markeraForberett, type ForberettSom } from '@/lib/letters/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    let som: ForberettSom = 'kopierat'
    try {
      const body = await request.json()
      if (body?.som !== undefined) {
        if (body.som !== 'kopierat' && body.som !== 'nedladdat') {
          return NextResponse.json({ error: 'Ogiltigt värde', code: 'invalid_field', falt: 'som' }, { status: 400 })
        }
        som = body.som
      }
    } catch {
      // Tom kropp: kopierat.
    }

    const ut = await markeraForberett(supabase, user.id, id, som)
    if (!ut) return NextResponse.json({ error: 'Brevet hittades inte' }, { status: 404 })
    return NextResponse.json({ success: true, data: ut })
  } catch (error: any) {
    console.error('Förberett error:', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
