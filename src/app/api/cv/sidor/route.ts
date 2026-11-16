/**
 * POST /api/cv/sidor
 *
 * Helskärmens sidor för den inloggade (skissen V4b): samma indata och samma
 * tolkning som /api/cv/preview-html (forberedInloggatCv), svaret är PDF:en ur
 * nedladdningens kedja sida för sida som webp (src/lib/cv/mallar/sidbilder.ts),
 * aldrig själva filen, så att spärrarna i generate-formatted gäller som förut.
 *
 * Body: { template, structuredData | cvText, val?, cvId? }.
 * Svar: { sidor, bilder: string[], kvot }.
 */
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { losMallId } from '@/lib/cv/mallar/alias'
import { tolkaVal } from '@/lib/cv/mallar/val'
import { forberedInloggatCv } from '@/lib/cv/forbered-inloggat-cv'
import { renderaSidbilder } from '@/lib/cv/mallar/sidbilder'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { template?: string; cvText?: string; structuredData?: unknown; cvId?: string; val?: unknown }
    const { template, cvText, structuredData, cvId } = body
    if (!template || (!cvText && !structuredData)) {
      return NextResponse.json({ error: 'Template och antingen cvText eller structuredData krävs' }, { status: 400 })
    }
    const supabase = createServerClient({ cookies: await cookies() })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Inte inloggad' }, { status: 401 })

    const mallId = losMallId(template)
    if (!mallId) return NextResponse.json({ error: 'Okänd mall' }, { status: 400 })
    const forberett = await forberedInloggatCv(supabase, user, { cvText, structuredData, cvId })
    if (!forberett.ok) return NextResponse.json({ error: forberett.error }, { status: forberett.status })

    const s = await renderaSidbilder(forberett.cv, mallId, tolkaVal(body.val))
    if (!s) return NextResponse.json({ error: 'Okänd mall' }, { status: 400 })
    return NextResponse.json(s, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[cv/sidor]', err)
    return NextResponse.json({ error: 'Internt fel' }, { status: 500 })
  }
}
