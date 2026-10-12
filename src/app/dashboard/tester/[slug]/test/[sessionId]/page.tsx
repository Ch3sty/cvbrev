/**
 * Testkörningen för en session. En route för alla kognitiva test och prov.
 * Vilken testvy slugen ska ha avgörs i TestRunner, matad ur testConfig.
 *
 * Sidan är en server component. Sessionsraden (sparade svar och om provet
 * redan är rättat) läses här i stället för med ett fetch efter hydrering, så
 * provet kan målas ur första HTML. Se getRunData.ts för varför.
 *
 * Frågeurvalet ligger kvar i testvyn, seedat på sessionId precis som förut.
 * Ingenting här påverkar vilka frågor som visas eller i vilken ordning.
 */

import { notFound } from 'next/navigation'
import { figurserierSynliga } from '@/lib/figurserierV1/status'
import { deduktivSynlig } from '@/lib/deduktivV1/status'
import TestRunner from '@/components/tests/shared/TestRunner'
import { getTestConfig } from '../../../testConfig'
import { getRunData } from '../../getRunData'

export default async function TestRunPage({
  params,
}: {
  params: Promise<{ slug: string; sessionId: string }>
}) {
  const { slug, sessionId } = await params
  const config = getTestConfig(slug)
  if (!config || config.kind === 'personlighet') notFound()
  // Figurserierna syns först när banken är befordrad (src/lib/figurserierV1/status.ts).
  if (config.kind === 'figurserie' && !figurserierSynliga()) notFound()
  // Deduktiv syns först när banken är befordrad (src/lib/deduktivV1/status.ts).
  if (config.kind === 'deduktiv' && !deduktivSynlig()) notFound()

  const runData = await getRunData(config, sessionId)

  return <TestRunner config={config} sessionId={sessionId} runData={runData} />
}
