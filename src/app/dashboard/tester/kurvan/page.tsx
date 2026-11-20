/**
 * Din utveckling (v4, planen 3.4): grafen med en linje per testtyp, nivå per
 * testtyp, resultat och mönstren. Serverrenderad ur hamtaUtvecklingV4, så
 * grafen står på plats i första HTML:en. ?typ=<id> väljer typen i grafen.
 *
 * I appen nås adressen aldrig: proxyn skriver om den till appens Utveckling.
 */
import { redirect } from 'next/navigation'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaTesterV4, hamtaUtvecklingV4 } from '@/lib/tester/v4/hamta.server'
import Vaggen from '@/components/tester-v4/omgang3/Vaggen'
import { arTestTypId } from '@/lib/tester/v4/typer'
import UtvecklingVy from '@/components/tester-v4/utveckling/UtvecklingVy'
import { Betalvagg } from '@/components/traning/HemKlient'
import { sparrDataFor } from '@/lib/tester/v4/sparrData'
import type { Scope } from '@/lib/access/features'
import type { PlanKey } from '@/lib/plans/plans'

const SCOPES: readonly string[] = ['cv', 'tester', 'allt']
const PLANER: readonly string[] = ['cv_week', 'test_week', 'all_day', 'all_week', 'all_month', 'all_quarter']
const somScope = (v: string | null): Scope | null => (v && SCOPES.includes(v) ? (v as Scope) : null)
const somPlan = (v: string | null): PlanKey | null => (v && PLANER.includes(v) ? (v as PlanKey) : null)

export default async function KurvanSida({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')
  // hamtaTesterV4 delar underlaget (React cache) med hamtaUtvecklingV4: ingen extra läsning,
  // bara modellen för navigeringens undertexter.
  const [data, tester, sp] = await Promise.all([hamtaUtvecklingV4(user.id), hamtaTesterV4(user.id), searchParams])
  const typ = Array.isArray(sp.typ) ? sp.typ[0] : sp.typ
  const sparr = sparrDataFor(tester, null)
  return (
    <Betalvagg scope={somScope(data.paket.scope)} track={somScope(data.paket.track)} planKey={somPlan(data.paket.planKey)} grundKvarIdag={tester.gratis.premium ? null : tester.gratis.grundKvarIdag} sparrData={sparr.data} dagarKvar={sparr.dagarKvar}>
      <UtvecklingVy
        data={data}
        startTyp={arTestTypId(typ) ? typ : null}
        standardTyp={tester.dagens.typ}
        ovningsprovForslag={tester.vaggBana.find((n) => n.forslag === 'ovningsprov')?.dag ?? null}
        vagg={<Vaggen data={tester} sida="utveckling" />}
      />
    </Betalvagg>
  )
}
