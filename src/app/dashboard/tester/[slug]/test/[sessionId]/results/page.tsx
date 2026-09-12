/**
 * Resultatsidan för en testsession. En route för alla kognitiva test och prov.
 * Ersätter tolv resultatsidor, tre av dem på runt 670 rader styck.
 *
 * Sidan är en server component. Sessionen, percentilen och bryggans underlag
 * hämtas i en parallell omgång här i stället för i fyra klientkedjor efter
 * hydrering. Se getResultsData.ts för räkningen.
 *
 * Poängen läses som den står i raden. Ingen rättning sker här.
 */

import { notFound } from 'next/navigation'
import TestResultsPage from '@/components/tests/shared/TestResultsPage'
import { getTestConfig } from '../../../../testConfig'
import { getResultsData } from '../../../getResultsData'

export default async function TestResultsRoute({
  params,
}: {
  params: Promise<{ slug: string; sessionId: string }>
}) {
  const { slug, sessionId } = await params
  const config = getTestConfig(slug)
  if (!config || config.kind === 'personlighet') notFound()

  const resultsData = await getResultsData(config, sessionId)

  return (
    <TestResultsPage
      config={config}
      sessionId={sessionId}
      resultsData={resultsData}
    />
  )
}
