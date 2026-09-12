/**
 * Startsidan för personlighet-grund.
 *
 * Personlighetstesten har annan struktur än de kognitiva och ligger därför
 * kvar som egna routes, men på den delade sidmallen. Innehållet kommer ur
 * testConfig, precis som för den dynamiska routen.
 */

import { notFound } from 'next/navigation'
import PersonalityHubPage from '@/components/tests/shared/PersonalityHubPage'
import { getTestConfig } from '../testConfig'

export default function Page() {
  const config = getTestConfig('personlighet-grund')
  if (!config) notFound()
  return <PersonalityHubPage config={config} />
}
