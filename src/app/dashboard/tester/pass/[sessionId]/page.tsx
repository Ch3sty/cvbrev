/**
 * En träningssession (våg 3b): återupptar ett pass, en mätning eller en
 * generalrepetition där den står, eller visar genomgången när den redan är
 * avslutad. Sessionen läses här, så att frågan målas ur första HTML
 * (prestandabudgeten för flöden, LCP under 2,0 s).
 */

import { notFound } from 'next/navigation'
import PassFlode from '@/components/traning/PassFlode'
import { hamtaSession, sessionsvy } from '@/lib/traning/motor.server'
import { hamtaVnPass, vnPassVy } from '@/lib/tester/pass.server'
import VnPassFlode from '@/components/traning/vnpass/VnPassFlode'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { passSida } from '../sida.server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function PassSessionSida({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  if (!UUID.test(sessionId)) notFound()
  const { userId, betalande } = await passSida()
  const admin = testSkrivKlient()
  const rad = await hamtaSession(admin, userId, sessionId)
  const vy = rad ? sessionsvy(rad) : null
  if (!vy) {
    // Text- och sifferpassen har samma adress (beställning omgång 2, B3).
    const vn = await hamtaVnPass(admin, userId, sessionId)
    const vnVy = vn ? vnPassVy(vn) : null
    if (!vnVy) notFound()
    return <VnPassFlode vy={vnVy} />
  }
  return <PassFlode vy={vy} betalande={betalande} />
}
