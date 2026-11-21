/**
 * POST /api/jobbsok/intervju/[id]/utfall   "Hur gick intervjun?" (Jobbsöket F6). [id] = job_applications.id.
 *
 * Kropp:
 *   { svar: 'genomford' }                                         loggar "Intervju genomförd" på intervjudagen
 *   { svar: 'flyttad', datum: 'YYYY-MM-DD', tid?: 'HH:mm', plats? }  ny tid på kallelsen
 *   { svar: 'installd' }                                          tiden (och platsen) tas bort
 * Svar: { success, svar, data: Handelse }   (genomford: den nya händelsen; annars kallelsen)
 * Fel: 400 invalid_field (+ falt), 404 not_found / kallelse_saknas, 503 migrering_saknas.
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { genomfordDag } from '@/lib/jobbsok/intervju'
import { valideraUtfall } from '@/lib/jobbsok/validering'
import { MIGRERING_SAKNAS, agdTjanst, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import { lasKallelse, skrivIntervjutid } from '@/lib/jobbsok/intervjuServer'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const kropp = await lasKropp(request)
  if (!kropp) return felSvar(400, 'invalid_body', 'Ogiltig förfrågan')
  const utfall = valideraUtfall(kropp)
  if ('fel' in utfall) return felSvar(400, 'invalid_field', 'Kontrollera svaret', { falt: utfall.fel })

  const { kallelse } = await lasKallelse(s.supabase, id)
  if (!kallelse) return felSvar(404, 'kallelse_saknas', 'Det finns ingen kallelse till intervju')

  if (utfall.svar === 'genomford') {
    const { count } = await s.supabase
      .from('job_application_events')
      .select('id', { count: 'exact', head: true })
      .eq('application_id', id)
      .eq('event_type', 'interview_completed')
    const { data, error } = await s.supabase
      .from('job_application_events')
      .insert({
        application_id: id,
        event_type: 'interview_completed',
        interview_round: Math.min((count ?? 0) + 1, 10),
        occurred_at: genomfordDag(kallelse.interview_at ?? null),
      })
      .select()
      .single()
    if (error || !data) {
      console.error('[intervju] Kunde inte logga genomförd intervju:', error)
      return felSvar(500, 'spara_fel', 'Kunde inte logga intervjun')
    }
    captureServer('intervju_utfall', s.user.id, { svar: 'genomford' })
    return NextResponse.json({ success: true, svar: 'genomford', data })
  }

  const andring = utfall.svar === 'flyttad' ? utfall.ny ?? {} : { interview_at: null, interview_place: null }
  const svar = await skrivIntervjutid(s.supabase, s.user.id, kallelse, andring, 'flyttad')
  if (svar === 'saknas') return MIGRERING_SAKNAS()
  if (!svar) return felSvar(500, 'spara_fel', 'Kunde inte spara tiden')
  captureServer('intervju_utfall', s.user.id, { svar: utfall.svar })
  return NextResponse.json({ success: true, svar: utfall.svar, data: svar })
}
