/**
 * Startsidan för ett enskilt test. En route för alla tolv kognitiva test
 * och prov (docs/plan-inloggat-omdesign.md, våg 3 punkt 22).
 *
 * Slugen är route-parameter och oförändrad, så varje gammal URL fortsätter
 * fungera. Vad testet är kommer ur testConfig, inte ur koden.
 */

import { notFound } from 'next/navigation'
import TestHubPage from '@/components/tests/shared/TestHubPage'
import { DYNAMIC_TEST_SLUGS, getTestConfig } from '../testConfig'

export function generateStaticParams() {
  return DYNAMIC_TEST_SLUGS.map((slug) => ({ slug }))
}

export default async function TestSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const config = getTestConfig(slug)
  if (!config || config.kind === 'personlighet') notFound()

  return <TestHubPage config={config} />
}
