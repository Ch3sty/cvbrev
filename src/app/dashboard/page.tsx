/**
 * Jobbsökets hemvy, och landningen i inloggat (spec-rummen avsnitt 5, våg 4).
 *
 * En landning på /dashboard (inloggningen, ett mejl, en bokmärkt adress)
 * öppnar rummet användaren senast var i, profiles.senaste_rum. Finns inget
 * sparat rum avgör ett satt provdatum (Rekryteringstester) och sedan valet i
 * registreringen. Ett klick inne i appen, dörren till Jobbsöket eller
 * Översikt i sidomenyn, öppnar alltid Jobbsöket: referensen är då en annan
 * /dashboard-sida (arLandning). Djuplänkar och adresser med parametrar
 * påverkas inte.
 *
 * Summeringen delas med layouten (hamtaSummaryForRequest), så beslutet
 * kostar ingen egen rundtur. Saknas kolumnen senaste_rum (migreringen ej
 * körd) läses den som tom.
 *
 * Serverdelen: den klientrenderade hemskärmen (DashboardHem) får sin
 * initiala data ur layoutens summering. Aktiviteten "Det här har du gjort"
 * är borta från hemmet (art-director 21.2 fråga 8): hemmet visar läget och
 * nästa handling, rummen sin egen historia. src/lib/dashboard/aktivitet.ts
 * ligger kvar tills saas-lead bestämt var historiken ska bo.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardHem from './(oversikt)/DashboardHem'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaSummaryForRequest } from '@/lib/dashboard/summaryForRequest'
import { arLandning, landningsrum, LANDNING_HREF } from '@/lib/rum/jobbsok'

async function landningsmal(sok: Record<string, string | string[] | undefined>): Promise<string | null> {
  if (Object.keys(sok).length > 0) return null
  const h = await headers()
  if (!arLandning(h.get('referer'), h.get('host'))) return null
  const user = await hamtaVerifieradAnvandare()
  if (!user) return null
  try {
    const summary = await hamtaSummaryForRequest(user.id)
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
  const mal = await landningsmal(await searchParams)
  if (mal) redirect(mal)

  return <DashboardHem />
}
