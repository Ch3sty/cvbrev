/**
 * Ett övningsprov i verbalt eller numeriskt (Testerna v2, skiss 2 och 3):
 * pågår det visas frågan där hon står och klockan räknar från sessionens
 * start; är det avslutat visas resultatet och genomgången. Sessionen läses
 * här, så att provet målas ur första HTML.
 */

import { notFound, redirect } from 'next/navigation'
import FigurserieOvningsprov from '@/components/session/figurserie/FigurserieOvningsprov'
import VnOvningsprov from '@/components/session/vn/VnOvningsprov'
import DeduktivOvningsprov from '@/components/session/deduktiv/DeduktivOvningsprov'
import { hamtaOvningsprov, ovningsvy } from '@/lib/ovningsprov/motor.server'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { arGiltigDag, dagarMellan, dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { ovningsprovHref } from '@/lib/traning/rutter'
import { passSida } from '../../../pass/sida.server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function OvningsprovSessionSida({ params }: { params: Promise<{ typ: string; sessionId: string }> }) {
  const { typ, sessionId } = await params
  if (typ !== 'verbal' && typ !== 'numerisk' && typ !== 'figurer' && typ !== 'deduktiv') notFound()
  if (!UUID.test(sessionId)) notFound()
  const { userId } = await passSida()
  const admin = testSkrivKlient()
  const [rad, planRes] = await Promise.all([
    hamtaOvningsprov(admin, userId, sessionId),
    admin.from('test_planer').select('*').eq('user_id', userId).maybeSingle(),
  ])
  const vy = rad ? ovningsvy(rad) : null
  if (!vy) notFound()
  if (vy.typ !== typ) redirect(ovningsprovHref(vy.typ))
  const idag = dagSthlm()
  const provdatum = (planRes.data as { provdatum?: unknown } | null)?.provdatum
  const dagarKvar = arGiltigDag(provdatum) ? dagarMellan(idag, provdatum) : null
  const datum = rad?.completed_at ? kortDatum(dagSthlm(rad.completed_at)) : kortDatum(idag)
  // Omgång 3: förra avslutade övningsprovet i samma typ, för brickan på resultatet.
  const forra = rad?.completed_at ? await forraOvningsprov(admin, userId, rad.test_type, rad.created_at) : null
  // Sessionsramen (plan-testflode-2026-11-20, etapp 1): figurserierna i ramen.
  if (vy.typ === 'figurer') return <FigurserieOvningsprov vy={vy} dagarKvar={dagarKvar} datum={datum} forra={forra} />
  // Etapp 2: ord och text, siffror och tabeller i ramen.
  if (vy.typ === 'verbal' || vy.typ === 'numerisk') return <VnOvningsprov vy={vy} dagarKvar={dagarKvar} datum={datum} forra={forra} />
  // Etapp 3: deduktivt i ramen.
  return <DeduktivOvningsprov vy={vy} dagarKvar={dagarKvar} datum={datum} forra={forra} />
}

/** Rätt och antal i det senaste avslutade övningsprovet före det här, null när det inte finns. */
async function forraOvningsprov(admin: ReturnType<typeof testSkrivKlient>, userId: string, testType: string, fore: string): Promise<{ ratt: number; antal: number } | null> {
  try {
    const { data } = await admin
      .from('logic_test_v4_sessions')
      .select('id, test_type, meta, answers, created_at, started_at, completed_at')
      .eq('user_id', userId)
      .eq('test_type', testType)
      .not('completed_at', 'is', null)
      .lt('created_at', fore)
      .order('created_at', { ascending: false })
      .limit(1)
    const r = data?.[0] ? ovningsvy(data[0] as never)?.resultat : null
    return r && r.antal > 0 ? { ratt: r.ratt, antal: r.antal } : null
  } catch {
    return null
  }
}
