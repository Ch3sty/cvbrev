/**
 * En rad under Ska sökas (Jobbsöket F3).
 *
 * PUT    /api/jobbsok/ska-sokas/[id]
 *   Kropp: { job_title?, company?, location?, job_ad_url?, last_application_date?: 'YYYY-MM-DD' | null, note? }
 *   Svar: { success, data: SparadAnnons, rad: SkaSokasRad }
 *   Fel: 400 invalid_field (+ falt: ..., 'tom' när inget skickas), 404 not_found, 503 migrering_saknas.
 *
 * DELETE /api/jobbsok/ska-sokas/[id]
 *   Svar: { success }   ("Ta bort", även på en rad där sista dagen passerat)
 *   Fel: 404 not_found, 503 migrering_saknas.
 */
import { NextResponse } from 'next/server'
import { idagSv } from '@/lib/jobbsok/datum'
import { skaSokasRad } from '@/lib/jobbsok/bana'
import { arUuid, valideraAndradSparad } from '@/lib/jobbsok/validering'
import { MIGRERING_SAKNAS, admin, arSchemaFel, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import type { SparadAnnons } from '@/lib/jobbsok/typer'

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  if (!arUuid(id)) return felSvar(404, 'not_found', 'Raden hittades inte')
  const kropp = await lasKropp(request)
  if (!kropp) return felSvar(400, 'invalid_body', 'Ogiltig förfrågan')
  const andring = valideraAndradSparad(kropp)
  if ('fel' in andring) return felSvar(400, 'invalid_field', 'Kontrollera fälten', { falt: andring.fel })

  const { data, error } = await admin()
    .from('job_saved_ads')
    .update(andring)
    .eq('id', id)
    .eq('user_id', s.user.id)
    .select()
    .maybeSingle()
  if (error) {
    if (arSchemaFel(error)) return MIGRERING_SAKNAS()
    console.error('[ska-sokas] Kunde inte ändra:', error)
    return felSvar(500, 'spara_fel', 'Kunde inte spara ändringen')
  }
  if (!data) return felSvar(404, 'not_found', 'Raden hittades inte')
  return NextResponse.json({ success: true, data, rad: skaSokasRad(data as SparadAnnons, idagSv()) })
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  if (!arUuid(id)) return felSvar(404, 'not_found', 'Raden hittades inte')
  const { data, error } = await admin()
    .from('job_saved_ads')
    .delete()
    .eq('id', id)
    .eq('user_id', s.user.id)
    .select('id')
  if (error) {
    if (arSchemaFel(error)) return MIGRERING_SAKNAS()
    console.error('[ska-sokas] Kunde inte ta bort:', error)
    return felSvar(500, 'ta_bort_fel', 'Kunde inte ta bort raden')
  }
  if (!data || data.length === 0) return felSvar(404, 'not_found', 'Raden hittades inte')
  return NextResponse.json({ success: true })
}
