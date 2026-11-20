// Personlighetstestet i sessionsramen (plan-testflode-2026-11-20, etapp 4).
// De sparade svaren läses på servern, så att första påståendet målas ur
// första HTML utan laddskelett (LCP, CLS 0). Utan svar från servern hämtar
// vyn själv som förut.

import { redirect } from 'next/navigation'
import TestSessionView from '@/components/personalityTest/TestSessionView'
import { ITEMS_AVANCERAD } from '@/lib/personalityTest/itemsAvancerad'
import { lasPersonlighetSvar } from '@/lib/personalityTest/sparade.server'

const BAS = '/dashboard/tester/personlighet-avancerad/test'

export default async function PersonlighetAvanceradTestPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const sparade = await lasPersonlighetSvar(sessionId)
  if (sparade?.completed) redirect(`${BAS}/${sessionId}/results`)
  return <TestSessionView sessionId={sessionId} testType="personlighet-avancerad" items={ITEMS_AVANCERAD} resultsBasePath={BAS} sparade={sparade} />
}
