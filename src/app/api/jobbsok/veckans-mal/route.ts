/**
 * Veckans mål (Jobbsöket F4). Gratis för alla (ägarens beslut 3).
 *
 * GET /api/jobbsok/veckans-mal
 *   Svar: { success, data: VeckansMal }
 *
 * PUT /api/jobbsok/veckans-mal
 *   Kropp: { mal: 1..10 | null }   (null = tillbaka till förvalet 3)
 *   Svar: { success, data: VeckansMal }
 *   Fel: 400 invalid_field (falt 'mal'), 503 migrering_saknas.
 *
 * Kolumnen profiles.weekly_application_goal skrivs med användarens session:
 * den finns inte i profiles_skydda_kolumner och profilens egna policyer gäller.
 */
import { NextResponse } from 'next/server'
import { captureServer } from '@/lib/analytics/server'
import { veckansMal } from '@/lib/jobbsok/veckansMal'
import { valideraVeckansMal } from '@/lib/jobbsok/validering'
import { lasVeckansMal } from '@/lib/jobbsok/server'
import { MIGRERING_SAKNAS, arSchemaFel, felSvar, krav, lasKropp } from '@/lib/jobbsok/rutt'
import { VECKANS_MAL_FORVAL } from '@/lib/jobbsok/typer'

async function veckansSokta(supabase: any, userId: string) {
  const { data } = await supabase.from('job_applications').select('applied_at, created_at').eq('user_id', userId)
  return (data ?? []) as Array<{ applied_at: string; created_at: string }>
}

export async function GET() {
  const s = await krav()
  if (s instanceof NextResponse) return s
  const [mal, sokta] = await Promise.all([lasVeckansMal(s.supabase, s.user.id), veckansSokta(s.supabase, s.user.id)])
  return NextResponse.json({ success: true, data: veckansMal(sokta, mal.rader), migreringSaknas: mal.saknas })
}

export async function PUT(request: Request) {
  const s = await krav()
  if (s instanceof NextResponse) return s
  const kropp = await lasKropp(request)
  if (!kropp) return felSvar(400, 'invalid_body', 'Ogiltig förfrågan')
  const indata = valideraVeckansMal(kropp)
  if ('fel' in indata) return felSvar(400, 'invalid_field', 'Målet är 1 till 10', { falt: 'mal' })

  const forut = await lasVeckansMal(s.supabase, s.user.id)
  if (forut.saknas) return MIGRERING_SAKNAS()
  const { error } = await s.supabase.from('profiles').update({ weekly_application_goal: indata.mal }).eq('id', s.user.id)
  if (error) {
    if (arSchemaFel(error)) return MIGRERING_SAKNAS()
    console.error('[veckans-mal] Kunde inte spara:', error)
    return felSvar(500, 'spara_fel', 'Kunde inte spara målet')
  }
  const sokta = await veckansSokta(s.supabase, s.user.id)
  const vm = veckansMal(sokta, indata.mal)
  captureServer('veckans_mal_andrat', s.user.id, {
    mal: vm.mal,
    forut: forut.rader ?? VECKANS_MAL_FORVAL,
    forval: indata.mal === null,
  })
  return NextResponse.json({ success: true, data: vm })
}
