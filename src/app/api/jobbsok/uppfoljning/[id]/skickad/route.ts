/**
 * POST /api/jobbsok/uppfoljning/[id]/skickad   logga "Följde upp" (Jobbsöket F5)
 *
 * Två vägar in, samma rutt:
 *   - "Skickade du mejlet?" Ja, efter "Öppna i e-post" (via 'epost') eller
 *     "Kopiera mejlet" (via 'kopierat'): det oskickade utkastet markeras som skickat.
 *   - "Jag har redan skickat det" (via 'eget'): loggas direkt, utan utkast. Gratis
 *     för alla och går förbi spärren. Finns ett oskickat utkast markeras det.
 * Efter en uppföljning kommer ingen ny påminnelse på tolv dagar.
 *
 * Kropp: { via?: 'epost' | 'kopierat' | 'eget' (förval 'eget'), datum?: 'YYYY-MM-DD' (förval i dag, aldrig framåt) }
 * Svar: { success, data: Uppfoljning, nastaPaminnelse: 'YYYY-MM-DD' }
 * Fel: 400 invalid_field (+ falt), 404 not_found, 503 migrering_saknas.
 *
 * DELETE /api/jobbsok/uppfoljning/[id]/skickad?uppfoljning=<uuid>   ångra en loggad uppföljning
 *   En rad med utkast blir oskickad igen (texten står kvar och räknas fortfarande
 *   som kontots utkast); en rad utan utkast tas bort.
 *   Svar: { success }   Fel: 404 not_found, 409 utkast_finns (ett annat oskickat utkast finns redan).
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { nastaPaminnelse, senasteAktivitet } from '@/lib/jobbsok/lage'
import { dagarMellan, idagSv } from '@/lib/jobbsok/datum'
import { valideraSkickad } from '@/lib/jobbsok/uppfoljning'
import { arUuid } from '@/lib/jobbsok/validering'
import { MIGRERING_SAKNAS, admin, agdTjanst, arSchemaFel, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import { lasTjanstensUppfoljningar, oskickat } from '@/lib/jobbsok/uppfoljningServer'
import type { Handelse, Uppfoljning } from '@/lib/jobbsok/typer'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const kropp = await lasKropp(request)
  if (!kropp) return felSvar(400, 'invalid_body', 'Ogiltig förfrågan')
  const indata = valideraSkickad(kropp)
  if ('fel' in indata) return felSvar(400, 'invalid_field', 'Kontrollera uppgifterna', { falt: indata.fel })

  const db = admin()
  const [lista, handelserRes] = await Promise.all([
    lasTjanstensUppfoljningar(db, s.user.id, id),
    s.supabase.from('job_application_events').select('*').eq('application_id', id),
  ])
  if (lista.error && arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
  // Tystnaden före loggningen, för mätningen.
  const dagarTyst = dagarMellan(
    senasteAktivitet({ ansokan: tjanst, handelser: (handelserRes.data ?? []) as Handelse[], uppfoljningar: lista.rader }),
    idagSv()
  )

  const utkast = oskickat(lista.rader)
  const { data, error } = utkast
    ? await db
        .from('job_application_followups')
        .update({ sent_at: indata.datum, sent_via: indata.via })
        .eq('id', utkast.id)
        .eq('user_id', s.user.id)
        .select()
        .single()
    : await db
        .from('job_application_followups')
        .insert({ application_id: id, user_id: s.user.id, sent_at: indata.datum, sent_via: indata.via })
        .select()
        .single()
  if (error || !data) {
    if (arSchemaFel(error)) return MIGRERING_SAKNAS()
    console.error('[uppfoljning] Kunde inte logga uppföljningen:', error)
    return felSvar(500, 'spara_fel', 'Kunde inte logga uppföljningen')
  }
  const rad = data as Uppfoljning
  captureServer('uppfoljning_loggad', s.user.id, {
    via: indata.via,
    med_utkast: !!utkast?.body,
    dagar_tyst: Number.isFinite(dagarTyst) ? Math.max(0, dagarTyst) : null,
  })
  return NextResponse.json({ success: true, data: rad, nastaPaminnelse: nastaPaminnelse(indata.datum) })
}

export async function DELETE(request: Request, { params }: Ctx) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const radId = new URL(request.url).searchParams.get('uppfoljning')
  if (!arUuid(radId)) return felSvar(404, 'not_found', 'Uppföljningen hittades inte')

  const db = admin()
  const lista = await lasTjanstensUppfoljningar(db, s.user.id, id)
  if (lista.error && arSchemaFel(lista.error)) return MIGRERING_SAKNAS()
  const rad = lista.rader.find((r) => r.id === radId && r.sent_at)
  if (!rad) return felSvar(404, 'not_found', 'Uppföljningen hittades inte')

  if (rad.body) {
    if (oskickat(lista.rader)) return felSvar(409, 'utkast_finns', 'Det finns redan ett utkast som inte skickats')
    const { error } = await db
      .from('job_application_followups')
      .update({ sent_at: null, sent_via: null })
      .eq('id', rad.id)
      .eq('user_id', s.user.id)
    if (error) return felSvar(500, 'spara_fel', 'Kunde inte ångra')
  } else {
    const { error } = await db.from('job_application_followups').delete().eq('id', rad.id).eq('user_id', s.user.id)
    if (error) return felSvar(500, 'spara_fel', 'Kunde inte ångra')
  }
  return NextResponse.json({ success: true })
}
