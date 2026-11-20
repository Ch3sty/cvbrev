/**
 * Startskärmen för personlighet-avancerad i sessionsramens mall (etapp 5).
 *
 * Personlighetstesten har annan struktur än de kognitiva och ligger därför
 * kvar som egna routes. Innehållet kommer ur testConfig; försöken, en
 * påbörjad session och nivåns spärr läses på servern, så att skärmen målas
 * rätt ur första HTML.
 */

import { notFound } from 'next/navigation'
import PersonalityHubPage from '@/components/tests/shared/PersonalityHubPage'
import { lasPersonlighetStart } from '@/lib/personalityTest/sparade.server'
import { getTestConfig } from '../testConfig'

export default async function Page() {
  const config = getTestConfig('personlighet-avancerad')
  if (!config) notFound()
  const startlage = await lasPersonlighetStart('personlighet-avancerad', config.totalQuestions, config.requiresFeature ?? null)
  return <PersonalityHubPage config={config} startlage={startlage} />
}
