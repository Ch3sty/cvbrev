/**
 * Översikt, Jobbsökets första flik, och landningen i inloggat (spec-rummen
 * avsnitt 5, våg 4; Jobbsöket omgång 1, etapp 2A).
 *
 * En landning på /dashboard (inloggningen, ett mejl, en bokmärkt adress)
 * öppnar rummet användaren senast var i, profiles.senaste_rum. Finns inget
 * sparat rum avgör ett satt provdatum (Rekryteringstester) och sedan valet i
 * registreringen. Ett klick inne i appen, dörren till Jobbsöket eller
 * Översikt i sidomenyn, öppnar alltid Jobbsöket: referensen är då en annan
 * /dashboard-sida (arLandning). Djuplänkar och adresser med parametrar
 * påverkas inte. Regeln är oförändrad.
 *
 * Sidan läses på servern i ett varv (hamtaJobbsokOversikt, som delar
 * summeringen med layouten via cache()). Träffarna läses i en egen
 * Suspense-gräns inne i vyn.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaSummaryForRequest } from '@/lib/dashboard/summaryForRequest'
import { arLandning, landningsrum, LANDNING_HREF } from '@/lib/rum/jobbsok'
import { hamtaJobbsokOversikt } from '@/lib/jobbsok/server'
import OversiktVy from '@/components/jobb3/oversikt/OversiktVy'

export const dynamic = 'force-dynamic'

async function landningsmal(sok: Record<string, string | string[] | undefined>, userId: string): Promise<string | null> {
  if (Object.keys(sok).length > 0) return null
  const h = await headers()
  if (!arLandning(h.get('referer'), h.get('host'))) return null
  try {
    const summary = await hamtaSummaryForRequest(userId)
    const rum = landningsrum({
      senasteRum: (summary.profile as Record<string, unknown> | null)?.senaste_rum,
      harProvdatum: Boolean(summary.jobbsok?.traning?.provdatum),
      intent: summary.komIgang?.intent ?? null,
    })
    return rum === 'jobb' ? null : LANDNING_HREF[rum]
  } catch {
    return null
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sok = await searchParams
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const mal = await landningsmal(sok, user.id)
  if (mal) redirect(mal)

  const data = await hamtaJobbsokOversikt(user.id)
  return <OversiktVy data={data} userId={user.id} visaCv={sok.cv === '1'} />
}
