/**
 * POST /api/letters/[id]/forhandsvisa
 *
 * Brevet ritat i en annan mall eller ett annat typsnitt, utan att spara
 * (Mallar och mallväljaren). Ingen AI, ingen kvot, ingen skrivning. Gratis
 * får förhandsvisa alla mallar och typsnitt; att spara görs med
 * PUT /api/letters/[id], som nekar Premiummall och Helvetica för gratis.
 *
 * Kropp:
 *   { mall_id?, font_id? }   ett ark. mall_id saknas: brevets mall (eller
 *                            startmallen för ett gammalt brev). font_id
 *                            saknas: brevets typsnitt; null: mallens eget.
 *   { mallar: string[], font_id? }  flera ark i ett anrop (högst 40).
 *
 * Svar: { html, mall_id, font_id } eller { mallar: { [id]: html }, font_id }.
 *
 * id "exempel" ritar exempelbrevet med användarens namn (Mallar utan brev).
 * Ägarkontroll som övriga brevrutter: raden läses med id och user_id (404
 * annars). Låsta brev går att förhandsvisa (läsa ingår gratis).
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import { arBrevTypsnitt, brevMallId } from '@/lib/letters/brevRegler'
import { renderBrevHtml } from '@/lib/letters/brevmall'
import { mallarKalla, ritaIMallar } from '@/components/brev3/mallar/rita.server'
import { EXEMPEL_ID } from '@/components/brev3/mallar/klient'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    let body: Record<string, unknown> = {}
    try {
      const b = await request.json()
      if (b && typeof b === 'object') body = b as Record<string, unknown>
    } catch {
      // Tom kropp: brevets egen mall och typsnitt.
    }

    // Typsnittet: saknas = brevets, null eller tomt = mallens eget.
    let fontIn: string | null | undefined
    if (body.font_id === undefined) fontIn = undefined
    else if (body.font_id === null || body.font_id === '') fontIn = null
    else if (arBrevTypsnitt(body.font_id)) fontIn = body.font_id
    else return NextResponse.json({ error: 'Okänt typsnitt', code: 'invalid_field', falt: 'font_id' }, { status: 400 })

    let mallIn: string | undefined
    if (body.mall_id !== undefined) {
      const m = brevMallId(body.mall_id)
      if (!m) return NextResponse.json({ error: 'Okänd mall', code: 'invalid_field', falt: 'mall_id' }, { status: 400 })
      mallIn = m
    }
    const flera = body.mallar !== undefined
    if (flera && (!Array.isArray(body.mallar) || body.mallar.length === 0)) {
      return NextResponse.json({ error: 'Mallarna kunde inte läsas', code: 'invalid_field', falt: 'mallar' }, { status: 400 })
    }

    let rad: Record<string, any> | null = null
    if (id !== EXEMPEL_ID) {
      const { data, error } = await (supabase.from('letters') as any).select('*').eq('id', id).eq('user_id', user.id).maybeSingle()
      if (error) {
        console.error('Förhandsvisning, brevet kunde inte läsas:', error)
        return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
      }
      if (!data) return NextResponse.json({ error: 'Brevet hittades inte' }, { status: 404 })
      rad = data
    }

    const harBetalt = await userHasAccess(supabase, user.id, 'any')
    const kalla = await mallarKalla(supabase, user, rad as any, harBetalt)
    const fontId = fontIn === undefined ? ((rad?.font_id as string | null | undefined) ?? null) : fontIn

    const svarHuvud = { 'Cache-Control': 'private, no-store' }
    if (flera) {
      return NextResponse.json({ mallar: ritaIMallar(kalla.data, body.mallar as unknown[], fontId), font_id: fontId }, { headers: svarHuvud })
    }
    const mallId = mallIn ?? (rad?.mall_id as string | null | undefined) ?? kalla.startmall
    return NextResponse.json({ html: renderBrevHtml(mallId, kalla.data, { typsnitt: fontId }), mall_id: mallId, font_id: fontId }, { headers: svarHuvud })
  } catch (error) {
    console.error('Förhandsvisning error:', error)
    return NextResponse.json({ error: 'Serverfel vid förhandsvisning' }, { status: 500 })
  }
}
