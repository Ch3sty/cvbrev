/**
 * Startsidan för ett enskilt test. En route för alla tolv kognitiva test
 * och prov (docs/plan-inloggat-omdesign.md, våg 3 punkt 22).
 *
 * Slugen är route-parameter och oförändrad, så varje gammal URL fortsätter
 * fungera. Vad testet är kommer ur testConfig, inte ur koden. Försöken läses
 * på servern (getForsok.ts), så bästa resultatet och serien står rätt från
 * första målningen (tester-lyftet, CLS 0).
 */

import { notFound } from 'next/navigation'
import { figurserierSynliga } from '@/lib/figurserierV1/status'
import TestHubPage from '@/components/tests/shared/TestHubPage'
import { getTestConfig } from '../testConfig'
import { getForsok } from './getForsok'

export default async function TestSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = getTestConfig(slug)
  if (!config || config.kind === 'personlighet') notFound()
  // Figurserierna syns först när banken är befordrad (src/lib/figurserierV1/status.ts).
  if (config.kind === 'figurserie' && !figurserierSynliga()) notFound()

  const forsok = await getForsok(config)

  return <TestHubPage config={config} forsok={forsok} />
}
