/**
 * Ett övningsprov i verbalt eller numeriskt (Testerna v2, skiss 2 och 3):
 * pågår det visas frågan där hon står och klockan räknar från sessionens
 * start; är det avslutat visas resultatet och genomgången. Sessionen läses
 * här, så att provet målas ur första HTML.
 */

import { notFound, redirect } from 'next/navigation'
import OvningsprovFlode from '@/components/traning/ovningsprov/OvningsprovFlode'
import { hamtaOvningsprov, ovningsvy } from '@/lib/ovningsprov/motor.server'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { arGiltigDag, dagarMellan, dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { ovningsprovHref } from '@/lib/traning/rutter'
import { passSida } from '../../../pass/sida.server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function OvningsprovSessionSida({ params }: { params: Promise<{ typ: string; sessionId: string }> }) {
  const { typ, sessionId } = await params
  if (typ !== 'verbal' && typ !== 'numerisk') notFound()
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
  return <OvningsprovFlode vy={vy} dagarKvar={dagarKvar} datum={datum} />
}
