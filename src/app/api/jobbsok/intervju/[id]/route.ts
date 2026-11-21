/**
 * Intervjuns tid och plats på en sökt tjänst (Jobbsöket F6, "Ändra tid"). [id] = job_applications.id.
 * Skriver på tjänstens senaste "Kallad till intervju".
 *
 * PUT    /api/jobbsok/intervju/[id]
 *   Kropp: { datum: 'YYYY-MM-DD' | null, tid?: 'HH:mm' | null, plats?: string | null }
 *   datum null tar bort tiden. Utan tid sparas datumet utan klockslag (00:00 svensk tid).
 *   Svar: { success, data: Handelse }
 *   Fel: 400 invalid_field (+ falt), 404 not_found / kallelse_saknas, 503 migrering_saknas.
 *
 * DELETE /api/jobbsok/intervju/[id]
 *   Tar bort tid och plats. Svar: { success, data: Handelse }
 *
 * Tiden går också att sätta när kallelsen loggas: POST /api/applications/[id]/events
 * med { event_type: 'interview_invited', intervju: { datum, tid?, plats? } }.
 */
import { NextResponse } from 'next/server'
import { valideraIntervjutid } from '@/lib/jobbsok/validering'
import { MIGRERING_SAKNAS, agdTjanst, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import { lasKallelse, skrivIntervjutid } from '@/lib/jobbsok/intervjuServer'

type Ctx = { params: Promise<{ id: string }> }

async function skriv(id: string, andring: Record<string, unknown> | null) {
  const s = await krav()
  if (s instanceof NextResponse) return s
  const tjanst = await agdTjanst(s.supabase, s.user.id, id)
  if (!tjanst) return felSvar(404, 'not_found', 'Den sökta tjänsten hittades inte')
  const indata = andring === null ? { interview_at: null, interview_place: null } : valideraIntervjutid(andring)
  if ('fel' in indata) return felSvar(400, 'invalid_field', 'Kontrollera tiden', { falt: indata.fel })
  const { kallelse } = await lasKallelse(s.supabase, id)
  if (!kallelse) return felSvar(404, 'kallelse_saknas', 'Logga "Kallad till intervju" först')
  const svar = await skrivIntervjutid(s.supabase, s.user.id, kallelse, indata, 'andra_tid')
  if (svar === 'saknas') return MIGRERING_SAKNAS()
  if (!svar) return felSvar(500, 'spara_fel', 'Kunde inte spara tiden')
  return NextResponse.json({ success: true, data: svar })
}

export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params
  const kropp = await lasKropp(request)
  if (!kropp) return felSvar(400, 'invalid_body', 'Ogiltig förfrågan')
  return skriv(id, kropp)
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params
  return skriv(id, null)
}
