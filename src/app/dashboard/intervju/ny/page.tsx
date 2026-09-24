/**
 * Nytt intervjuprov (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 3):
 * FlowShell i två steg, fråga och svar. Servern läser proven en gång så att
 * frågevalets metarader ("Gjord 2 gånger · bäst 4 av 5") och det
 * rekommenderade kortet står rätt från första målningen.
 */

import { redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaProv } from '@/lib/intervju/data'
import { antalPerFraga, bastaNivaPerFraga, rekommenderadFraga } from '@/lib/intervju/nasta'
import { arFragaId } from '@/components/artiklar/intervjuprov/fragor'
import NyttProvFlow from './NyttProvFlow'

export const metadata = { title: 'Nytt intervjuprov' }
export const dynamic = 'force-dynamic'

export default async function NyttProvPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const params = await searchParams
  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const prov = await hamtaProv(admin, user.id, 200)
  const forvald = typeof params.fraga === 'string' && arFragaId(params.fraga) ? params.fraga : null

  return (
    <NyttProvFlow
      rekommenderad={rekommenderadFraga(prov)}
      forvald={forvald}
      antal={antalPerFraga(prov)}
      basta={bastaNivaPerFraga(prov)}
    />
  )
}
