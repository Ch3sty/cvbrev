/**
 * POST /api/jobbsok/ska-sokas/[id]/sokt   "Markera som sökt" och "Sökt ändå" (Jobbsöket F3)
 *
 * Skapar den sökta tjänsten förifylld ur raden (tjänst, arbetsgivare, ort,
 * länk, anteckning, kanal 'ad') på samma sätt som POST /api/applications,
 * och döljer raden (application_id sätts).
 *
 * Kropp (allt valfritt, skriver över det förifyllda):
 *   { applied_at?: 'YYYY-MM-DD', application_channel?: 'ad' | 'unsolicited' | 'network',
 *     cv_id?, letter_id?, notes?, job_title?, company?, location?, job_ad_url? }
 * Svar: { success, data: JobApplication, sparadId, alreadyExists?: true }
 *   alreadyExists: raden var redan markerad, eller brevet var redan kopplat till en sökt tjänst.
 * Fel: 404 not_found, 400 (som POST /api/applications), 503 migrering_saknas.
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { skapaSoktTjanst } from '@/lib/applications/skapa'
import { idagSv } from '@/lib/jobbsok/datum'
import { arUuid } from '@/lib/jobbsok/validering'
import { MIGRERING_SAKNAS, admin, agdTjanst, arSchemaFel, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import type { SparadAnnons } from '@/lib/jobbsok/typer'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  if (!arUuid(id)) return felSvar(404, 'not_found', 'Raden hittades inte')
  const kropp = (await lasKropp(request)) ?? {}

  const db = admin()
  const { data, error } = await db.from('job_saved_ads').select('*').eq('id', id).eq('user_id', s.user.id).maybeSingle()
  if (error && arSchemaFel(error)) return MIGRERING_SAKNAS()
  const rad = data as SparadAnnons | null
  if (!rad) return felSvar(404, 'not_found', 'Raden hittades inte')

  if (rad.application_id) {
    const finns = await agdTjanst(s.supabase, s.user.id, rad.application_id)
    if (finns) return NextResponse.json({ success: true, data: finns, sparadId: rad.id, alreadyExists: true })
  }

  const svar = await skapaSoktTjanst(s.supabase, s.user.id, {
    job_title: rad.job_title,
    company: rad.company,
    location: rad.location,
    job_ad_url: rad.job_ad_url,
    notes: rad.note,
    application_channel: 'ad',
    ...kropp,
  })
  if (!svar.ok) return felSvar(svar.status, svar.code, svar.error)

  const { error: kopplingsfel } = await db
    .from('job_saved_ads')
    .update({ application_id: svar.data.id })
    .eq('id', rad.id)
    .eq('user_id', s.user.id)
  if (kopplingsfel) console.error('[ska-sokas] Raden kunde inte kopplas till den sökta tjänsten:', kopplingsfel)

  captureServer('ska_sokas_markerad_sokt', s.user.id, {
    kalla: rad.source,
    sista_dag_passerad: !!rad.last_application_date && rad.last_application_date < idagSv(),
  })
  return NextResponse.json({
    success: true,
    data: svar.data,
    sparadId: rad.id,
    ...(svar.alreadyExists ? { alreadyExists: true } : {}),
  })
}
