// Personlighetsprofilen i resultatskärmens mall (plan-testflode-2026-11-20
// avsnitt 4.2, etapp 5). Sessionen läses på servern, så att profilen målas
// ur första HTML; utan svar från servern hämtar vyn själv som förut.

import ResultsView from '@/components/personalityTest/ResultsView'
import { lasPersonlighetResultat } from '@/lib/personalityTest/sparade.server'

export default async function PersonlighetResultatSida({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const session = await lasPersonlighetResultat(sessionId, 'personlighet-grund')
  return (
    <ResultsView
      sessionId={sessionId}
      testType="personlighet-grund"
      hubPath="/dashboard/tester/personlighet-grund"
      initial={session}
    />
  )
}
