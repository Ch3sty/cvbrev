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

import { notFound, redirect } from 'next/navigation'
import { figurserierSynliga } from '@/lib/figurserierV1/status'
import { deduktivSynlig } from '@/lib/deduktivV1/status'
import { steg2Synlig } from '@/lib/tester/steg2Status'
import { arSteg2Kind } from '@/app/dashboard/tester/testConfig'
import TestRunner from '@/components/tests/shared/TestRunner'
import { ovningsprovHref } from '@/lib/traning/rutter'
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
  // De gamla provsidorna (*-prov) är ersatta av övningsproven i ramen (etapp 0
  // och 5): sidan svarar 301 i next.config, en gammal sessionslänk landar här.
  if (config.level === 'prov') redirect(ovningsprovHref(config.kind === 'matris' ? 'logik' : config.kind === 'verbal' ? 'verbal' : 'numerisk'))
  // Figurserierna syns först när banken är befordrad (src/lib/figurserierV1/status.ts).
  if (config.kind === 'figurserie' && !figurserierSynliga()) notFound()
  // Deduktiv syns först när banken är befordrad (src/lib/deduktivV1/status.ts).
  if (config.kind === 'deduktiv' && !deduktivSynlig()) notFound()
  // Steg 2: syns när motor och vy är klara (src/lib/tester/steg2Status.ts).
  if (arSteg2Kind(config.kind) && !steg2Synlig(config.kind)) notFound()

  const runData = await getRunData(config, sessionId)

  return <TestRunner config={config} sessionId={sessionId} runData={runData} />
}
