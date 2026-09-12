/**
 * Resultatsidan för en testsession. En route för alla kognitiva test och prov.
 * Ersätter tolv resultatsidor, tre av dem på runt 670 rader styck.
 */

import { notFound } from 'next/navigation'
import TestResultsPage from '@/components/tests/shared/TestResultsPage'
import { getTestConfig } from '../../../../testConfig'

export default async function TestResultsRoute({
  params,
}: {
  params: Promise<{ slug: string; sessionId: string }>
}) {
  const { slug, sessionId } = await params
  const config = getTestConfig(slug)
  if (!config || config.kind === 'personlighet') notFound()

  return <TestResultsPage config={config} sessionId={sessionId} />
}
