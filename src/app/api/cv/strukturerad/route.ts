/**
 * PUT /api/cv/strukturerad
 *
 * Avsnittsarket i galleriet (plan-mallar 3.2, /dashboard/cv-mallar): när ett
 * avsnitt sparas skrivs structured_data i CVMetadata-format och cv_text
 * skrivs om ur den, så att analysen och dokumentet säger samma sak. Gamla
 * format (ParsedCV) konverteras vid första sparningen. Bara eget CV.
 *
 * Body: { cvId, cv: CVMetadata }. Svar: { ok: true }.
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { formatCVMetadataAsText } from '@/lib/linkedin/linkedin-to-cv-converter'

export async function PUT(request: Request) {
  const raw = await request.text().catch(() => '')
  if (!raw || raw.length > 120_000) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  let body: { cvId?: unknown; cv?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  }
  const cv = normalizeStructuredData(body.cv)
  if (typeof body.cvId !== 'string' || !cv) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ kod: 'utloggad' }, { status: 401 })

  const { data, error } = await supabase
    .from('cv_texts')
    .update({ structured_data: cv, cv_text: formatCVMetadataAsText(cv) })
    .eq('id', body.cvId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()
  if (error) {
    console.error('[cv/strukturerad] kunde inte spara:', error)
    return NextResponse.json({ kod: 'fel' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ kod: 'saknas' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
