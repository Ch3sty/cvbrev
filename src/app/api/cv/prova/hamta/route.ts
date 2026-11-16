/**
 * POST /api/cv/prova/hamta
 *
 * Hämtar hem utkastet från provsidan till kontot (plan-mallar 3.2): direkt
 * efter kontot, i samma flik, aldrig efter e-postverifiering. CV:t sparas i
 * cv_texts med structured_data i CVMetadata-format och de valda rubrikerna
 * i section_titles; cv_text skrivs ur den strukturerade datan.
 *
 * Body: { cv: CVMetadata, mall?: string, rubriker?: Record<Sektion,string>,
 * filnamn?: string }. Svar: { cvId } eller 403 { kod: 'grans' } när kontot
 * redan har så många CV:n som nivån tillåter (nedladdningen går ändå, med
 * datan i anropet).
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCvGrans } from '@/lib/supabase/premiumAccess'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { formatCVMetadataAsText } from '@/lib/linkedin/linkedin-to-cv-converter'
import { arPlatshallareNamn, arPlatshallareTelefon, arPlatshallareTitel } from '@/lib/profile/dokumentKontakt'
import { arTomEllerPlatshallare } from '@/lib/profile/dokumentEpost'
import { arSektion } from '@/lib/cv/mallval/sektioner'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: { cv?: unknown; rubriker?: unknown; filnamn?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  }
  const cv = normalizeStructuredData(body.cv)
  if (!cv) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ kod: 'utloggad' }, { status: 401 })

  const { maxCvs } = await getCvGrans(supabase, user.id)
  const { count } = await supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  if ((count ?? 0) >= maxCvs) return NextResponse.json({ kod: 'grans' }, { status: 403 })

  // Platshållare sparas aldrig (samma regel som LinkedIn-importen).
  const pi = cv.personalInfo
  if (arPlatshallareNamn(pi.fullName)) pi.fullName = ''
  if (arTomEllerPlatshallare(pi.email)) pi.email = ''
  if (pi.phone !== undefined && arPlatshallareTelefon(pi.phone)) pi.phone = ''
  if (arPlatshallareTitel(pi.title)) pi.title = ''

  const rubriker: Record<string, string> = {}
  if (body.rubriker && typeof body.rubriker === 'object') {
    for (const [k, v] of Object.entries(body.rubriker as Record<string, unknown>)) {
      if (arSektion(k) && typeof v === 'string' && v.trim()) rubriker[k] = v.trim().slice(0, 40)
    }
  }

  const datum = new Date().toLocaleDateString('sv-SE')
  const namn =
    typeof body.filnamn === 'string' && body.filnamn.trim()
      ? body.filnamn.trim().slice(0, 120)
      : `CV ${pi.fullName || ''} ${datum}`.replace(/\s+/g, ' ').trim()

  const rad: Record<string, unknown> = {
    user_id: user.id,
    file_name: namn,
    original_file_path: `prova/${user.id}/${Date.now()}.json`,
    cv_text: formatCVMetadataAsText(cv),
    structured_data: cv,
    text_extraction_failed: false,
  }
  if (Object.keys(rubriker).length > 0) rad.section_titles = rubriker

  let { data, error } = await supabase.from('cv_texts').insert(rad).select('id').single()
  // Kolumnen section_titles saknas i en miljö där migreringen inte körts: spara utan.
  if (error && 'section_titles' in rad && /section_titles/.test(error.message ?? '')) {
    delete rad.section_titles
    ;({ data, error } = await supabase.from('cv_texts').insert(rad).select('id').single())
  }
  if (error || !data) {
    console.error('[cv/prova/hamta] kunde inte spara:', error)
    return NextResponse.json({ kod: 'fel' }, { status: 500 })
  }
  return NextResponse.json({ cvId: (data as { id: string }).id })
}
