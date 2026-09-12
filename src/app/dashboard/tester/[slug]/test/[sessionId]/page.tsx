/**
 * Testkörningen för en session. En route för alla kognitiva test och prov.
 * Vilken testvy slugen ska ha avgörs i TestRunner, matad ur testConfig.
 */

import { notFound } from 'next/navigation'
import TestRunner from '@/components/tests/shared/TestRunner'
import { getTestConfig } from '../../../testConfig'

export default async function TestRunPage({
  params,
}: {
  params: Promise<{ slug: string; sessionId: string }>
}) {
  const { slug, sessionId } = await params
  const config = getTestConfig(slug)
  if (!config || config.kind === 'personlighet') notFound()

  return <TestRunner config={config} sessionId={sessionId} />
}
