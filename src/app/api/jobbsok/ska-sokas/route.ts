/**
 * Ska sökas (Jobbsöket F3).
 *
 * GET  /api/jobbsok/ska-sokas
 *   Svar: { success, data: SkaSokasRad[] }   (bara rader som inte blivit sökta)
 *
 * POST /api/jobbsok/ska-sokas
 *   Kropp: { job_title, company, location?, job_ad_url?, last_application_date?: 'YYYY-MM-DD' | null,
 *            source?: 'match' | 'egen', af_ad_id?, match_score?: 0..100, note? }
 *   Svar: { success, data: SparadAnnons, rad: SkaSokasRad, alreadyExists?: true }
 *   Idempotent på af_ad_id: samma träff två gånger ger den befintliga raden.
 *   Fel: 400 invalid_field (+ falt), 409 redan_sokt (+ application_id), 503 migrering_saknas.
 *
 * Gratis för alla (ägarens beslut 3). Skrivs med admin-klienten efter sessionen.
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { idagSv } from '@/lib/jobbsok/datum'
import { skaSokasLista, skaSokasRad } from '@/lib/jobbsok/bana'
import { lasSparade } from '@/lib/jobbsok/server'
import { valideraNySparad } from '@/lib/jobbsok/validering'
import { MIGRERING_SAKNAS, admin, arSchemaFel, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import type { SparadAnnons } from '@/lib/jobbsok/typer'
// Kom igång-brickan "Logga en tjänst du har sökt" (Jobbsöket omgång 2). Med
// await: den sparade nyckeln är enda källan för en sparad annons, summeringen
// räknar inte job_saved_ads. markeraBricka kastar aldrig.
import { markeraBricka } from '@/lib/onboarding/komigang-server'

export async function GET() {
  const s = await krav()
  if (s instanceof NextResponse) return s
  const sparade = await lasSparade(s.supabase, s.user.id)
  if (sparade.saknas) return NextResponse.json({ success: true, data: [], migreringSaknas: true })
  if (sparade.fel) return felSvar(500, 'las_fel', 'Kunde inte läsa Ska sökas')
  return NextResponse.json({ success: true, data: skaSokasLista(sparade.rader, idagSv()) })
}

export async function POST(request: Request) {
  const s = await krav()
  if (s instanceof NextResponse) return s
  const kropp = await lasKropp(request)
  if (!kropp) return felSvar(400, 'invalid_body', 'Ogiltig förfrågan')
  const indata = valideraNySparad(kropp)
  if ('fel' in indata) return felSvar(400, 'invalid_field', 'Kontrollera fälten', { falt: indata.fel })

  const db = admin()
  const idag = idagSv()

  if (indata.af_ad_id) {
    const { data: finns, error } = await db
      .from('job_saved_ads')
      .select('*')
      .eq('user_id', s.user.id)
      .eq('af_ad_id', indata.af_ad_id)
      .maybeSingle()
    if (error && arSchemaFel(error)) return MIGRERING_SAKNAS()
    const rad = finns as SparadAnnons | null
    if (rad?.application_id) {
      return felSvar(409, 'redan_sokt', 'Annonsen är redan markerad som sökt', { application_id: rad.application_id })
    }
    if (rad) {
      captureServer('ska_sokas_sparad', s.user.id, {
        kalla: rad.source,
        har_sista_dag: !!rad.last_application_date,
        dagar_kvar: skaSokasRad(rad, idag).dagarKvar,
        match_score: rad.match_score,
        redan_sparad: true,
      })
      await markeraBricka(s.user.id, 'sokt_tjanst')
      return NextResponse.json({ success: true, data: rad, rad: skaSokasRad(rad, idag), alreadyExists: true })
    }
  }

  const { data, error } = await db
    .from('job_saved_ads')
    .insert({ ...indata, user_id: s.user.id })
    .select()
    .single()
  if (error || !data) {
    if (arSchemaFel(error)) return MIGRERING_SAKNAS()
    // Två samtidiga tryck på samma träff: unika indexet säger nej, den första raden gäller.
    if (error?.code === '23505' && indata.af_ad_id) {
      const { data: rad } = await db.from('job_saved_ads').select('*').eq('user_id', s.user.id).eq('af_ad_id', indata.af_ad_id).maybeSingle()
      if (rad) {
        await markeraBricka(s.user.id, 'sokt_tjanst')
        return NextResponse.json({ success: true, data: rad, rad: skaSokasRad(rad as SparadAnnons, idag), alreadyExists: true })
      }
    }
    console.error('[ska-sokas] Kunde inte spara:', error)
    return felSvar(500, 'spara_fel', 'Kunde inte spara annonsen')
  }

  const rad = data as SparadAnnons
  const vy = skaSokasRad(rad, idag)
  captureServer('ska_sokas_sparad', s.user.id, {
    kalla: rad.source,
    har_sista_dag: !!rad.last_application_date,
    dagar_kvar: vy.dagarKvar,
    match_score: rad.match_score,
    redan_sparad: false,
  })
  await markeraBricka(s.user.id, 'sokt_tjanst')
  return NextResponse.json({ success: true, data: rad, rad: vy })
}
