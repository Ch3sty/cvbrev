/**
 * Startarket för övningsprovet i I-prov 2025 (testplanen steg 2). Läser
 * paketet (test_exam_mode), provdatumet och ett pågående prov på servern, så
 * att arket målas ur första HTML.
 */
import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { dagarMellan, dagSthlm } from '@/lib/traning/datum'
import { iprovProvSynligt } from '@/lib/tester/steg2Status'
import { harProvlage } from '@/lib/tester/steg2/iprov.server'
import { IPROV_TEST_TYPE } from '@/lib/tester/steg2/iprov'
import { IprovStartark } from '@/components/traning/iprov/IprovFlode'
import { TRANING_RUTT } from '@/lib/traning/rutter'

export default async function IprovStart() {
  if (!iprovProvSynligt()) notFound()
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  const supabase = createServerClient({ cookies: await cookies() })
  const admin = testSkrivKlient()
  const [provlage, planRes, pagRes] = await Promise.all([
    harProvlage(supabase as never, user.id).catch(() => false),
    admin.from('test_planer').select('provdatum').eq('user_id', user.id).maybeSingle(),
    admin.from('logic_test_v4_sessions').select('id').eq('user_id', user.id).eq('test_type', IPROV_TEST_TYPE).is('completed_at', null).order('created_at', { ascending: false }).limit(1),
  ])
  const provdatum = (planRes.data as { provdatum?: string | null } | null)?.provdatum ?? null
  const dagarKvar = provdatum ? dagarMellan(dagSthlm(), provdatum) : null
  const pagaende = ((pagRes.data ?? []) as { id: string }[])[0]?.id ?? null
  return <IprovStartark dagarKvar={dagarKvar} last={!provlage} pagaende={pagaende} tillbakaHref={TRANING_RUTT.alla} />
}
