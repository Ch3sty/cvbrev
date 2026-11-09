/**
 * Ett övningsprov i I-prov 2025: mellanbladen, deltesten och resultatet.
 * Sessionen läses här, så att vyn målas ur första HTML.
 */
import { notFound, redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { hamtaIprov, iprovVy } from '@/lib/tester/steg2/iprov.server'
import IprovFlode from '@/components/traning/iprov/IprovFlode'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function IprovSession({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  if (!UUID.test(sessionId)) notFound()
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  const rad = await hamtaIprov(testSkrivKlient(), user.id, sessionId)
  const vy = rad ? iprovVy(rad) : null
  if (!vy) notFound()
  return <IprovFlode vy={vy} />
}
