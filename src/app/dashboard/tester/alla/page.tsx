/**
 * Tester v4 (docs/plan-tester-v4-bygg.md 3.2, skissen smal-plan-2026-11-18):
 * alla testtyper i ett rutnät, planens delar i en tonad grupp först, och
 * typens meny (Träna, Testa dig på en nivå, Mät dig) som panel bredvid
 * korten på dator och ark på smal skärm. ?typ=<id> öppnar menyn direkt.
 *
 * All data läses i en parallell omgång av hamtaTesterV4 (A); menyerna ligger
 * i sidans data, så att öppna en meny inte kostar något anrop. Varje del
 * faller för sig till tomt läge där, aldrig en trasig sida.
 *
 * Sidan omexporteras av appen (/app/tester/alla) och ritas i appens ram:
 * den beror därför inte på webbens sidomeny.
 */
import { permanentRedirect, redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaTesterV4 } from '@/lib/tester/v4/hamta.server'
import { arTestTypId } from '@/lib/tester/v4/typer'
import type { Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'
import { Betalvagg } from '@/components/traning/HemKlient'
import TesterVy from '@/components/tester-v4/tester/TesterVy'
import Vaggen from '@/components/tester-v4/omgang3/Vaggen'

const SCOPES: readonly string[] = ['cv', 'tester', 'allt']
const PLANER: readonly string[] = ['cv_week', 'test_week', 'all_day', 'all_week', 'all_month', 'all_quarter']
const somScope = (v: string | null): Scope | null => (v && SCOPES.includes(v) ? (v as Scope) : null)
const somPlan = (v: string | null): PlanKey | null => (v && PLANER.includes(v) ? (v as PlanKey) : null)

export default async function AllaTesterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  // Din utveckling har en egen sida sedan v4.
  if (sp.flik === 'utveckling') permanentRedirect('/dashboard/tester/kurvan')

  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const data = await hamtaTesterV4(user.id)
  const typ = Array.isArray(sp.typ) ? sp.typ[0] : sp.typ

  return (
    <Betalvagg scope={somScope(data.paket.scope)} track={somScope(data.paket.track)} planKey={somPlan(data.paket.planKey)} grundKvarIdag={data.gratis.premium ? null : data.gratis.grundKvarIdag}>
      <TesterVy data={data} startTyp={arTestTypId(typ) ? typ : null} vagg={<Vaggen data={data} sida="tester" />} />
    </Betalvagg>
  )
}
