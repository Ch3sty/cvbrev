/**
 * PUT /api/cv/section-titles
 *
 * Sparar rubrikerna ett CV valt (rubrikarket, docs/plan-mallar-2026-11-15.md
 * avsnitt 3.1) i cv_texts.section_titles. Gratis för alla.
 *
 * Body: { cvId: string, rubriker: { [sektion]: string | null } }
 *  - en sträng sätter avsnittets rubrik (högst 40 tecken),
 *  - null eller tom sträng tar bort den ("Tillbaka till förslaget"),
 *  - avsnitt som inte nämns lämnas som de är.
 *
 * Svar: { rubriker } med det som nu är sparat. Bara eget CV: RLS och
 * user_id i villkoret.
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { RUBRIK_MAX, arSektion, rensaRubrik, rensaRubriker } from '@/lib/cv/rubriker'
import { arCvId } from '@/lib/cv/mallar/sparade-rubriker'
import type { Sektion } from '@/lib/cv/mallar/kontrakt'

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient({ cookies: cookieStore })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Inte inloggad' }, { status: 401 })

  let body: { cvId?: unknown; rubriker?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }
  if (!arCvId(body.cvId)) return NextResponse.json({ error: 'cvId saknas' }, { status: 400 })
  const indata = body.rubriker
  if (!indata || typeof indata !== 'object' || Array.isArray(indata)) {
    return NextResponse.json({ error: 'rubriker saknas' }, { status: 400 })
  }

  // Validera allt innan något skrivs.
  const andringar: [Sektion, string | null][] = []
  for (const [sektion, varde] of Object.entries(indata as Record<string, unknown>)) {
    if (!arSektion(sektion)) return NextResponse.json({ error: `Okänt avsnitt: ${sektion}` }, { status: 400 })
    if (varde === null || varde === '') {
      andringar.push([sektion, null])
      continue
    }
    if (typeof varde !== 'string') return NextResponse.json({ error: `Rubriken för ${sektion} är ingen text` }, { status: 400 })
    if (varde.trim().length > RUBRIK_MAX) {
      return NextResponse.json({ error: `Rubriken får vara högst ${RUBRIK_MAX} tecken` }, { status: 400 })
    }
    andringar.push([sektion, rensaRubrik(varde) || null])
  }

  const { data: rad, error: lasFel } = await supabase
    .from('cv_texts')
    .select('section_titles')
    .eq('id', body.cvId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (lasFel) return NextResponse.json({ error: 'Kunde inte läsa CV:t' }, { status: 500 })
  if (!rad) return NextResponse.json({ error: 'CV:t finns inte' }, { status: 404 })

  const nya: Partial<Record<Sektion, string>> = rensaRubriker((rad as { section_titles?: unknown }).section_titles)
  for (const [sektion, varde] of andringar) {
    if (varde) nya[sektion] = varde
    else delete nya[sektion]
  }

  const { error: skrivFel } = await supabase
    .from('cv_texts')
    .update({ section_titles: Object.keys(nya).length ? nya : null })
    .eq('id', body.cvId)
    .eq('user_id', user.id)
  if (skrivFel) return NextResponse.json({ error: 'Kunde inte spara rubrikerna' }, { status: 500 })

  return NextResponse.json({ rubriker: nya })
}
