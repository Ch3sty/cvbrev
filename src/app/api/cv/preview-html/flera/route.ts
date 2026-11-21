/**
 * /api/cv/preview-html/flera
 *
 * Samma förhandsvisning som /api/cv/preview-html, men för flera mallar i ett
 * svar (CV-rummet, byggspecen avsnitt 6 punkt 2): CV:t tolkas och berikas en
 * gång, sedan ritas det i varje mall med samma renderare som PDF:en. Ditt
 * CV:s miniatyrer och Mallar-galleriets rader hämtar sina mallar här, en
 * fråga per rad i stället för en per ruta.
 *
 * Body: { mallar: string[] (högst 8), cvId?, structuredData | cvText, val? }.
 * Svar: { html: { [mall som den skickades]: string } }. Okända mallar hoppas
 * över tyst; finns ingen känd mall svarar rutten 400.
 */
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { renderaMallHtml } from '@/lib/cv/rendera-mall-html'
import { losMallId } from '@/lib/cv/mallar/alias'
import { tolkaVal } from '@/lib/cv/mallar/val'
import { forberedInloggatCv } from '@/lib/cv/forbered-inloggat-cv'

/** Högst så många mallar per fråga: en rad i galleriet, och snällt mot servern. */
const MAX_MALLAR = 8

interface Begaran {
  mallar?: unknown
  cvId?: string
  cvText?: string
  structuredData?: unknown
  val?: unknown
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Begaran
    const onskade = Array.isArray(body.mallar)
      ? [...new Set(body.mallar.filter((m): m is string => typeof m === 'string' && m.length > 0 && m.length < 40))].slice(0, MAX_MALLAR)
      : []
    const kanda = onskade.map((m) => [m, losMallId(m)] as const).filter((x): x is readonly [string, string] => Boolean(x[1]))
    if (!kanda.length) return NextResponse.json({ error: 'Inga kända mallar' }, { status: 400 })
    if (!body.cvText && !body.structuredData) {
      return NextResponse.json({ error: 'cvText eller structuredData krävs' }, { status: 400 })
    }

    const supabase = createServerClient({ cookies: await cookies() })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Inte inloggad' }, { status: 401 })

    const forberett = await forberedInloggatCv(supabase, user, {
      cvText: body.cvText,
      structuredData: body.structuredData,
      cvId: typeof body.cvId === 'string' ? body.cvId : undefined,
    })
    if (!forberett.ok) return NextResponse.json({ error: forberett.error }, { status: forberett.status })

    const val = tolkaVal(body.val, {})
    const html: Record<string, string> = {}
    for (const [fraga, mallId] of kanda) {
      const h = renderaMallHtml(forberett.cv, mallId, val, { forhandsvisning: true })
      if (h) html[fraga] = h
    }
    return NextResponse.json({ html })
  } catch (error: unknown) {
    console.error('Fel i /api/cv/preview-html/flera:', error)
    return NextResponse.json({ error: 'Internt fel' }, { status: 500 })
  }
}
