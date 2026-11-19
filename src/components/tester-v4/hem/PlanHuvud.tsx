/**
 * Hems vägg (utkast v4 avsnitt 2 punkt 1, skissens webb-Hem): väggen säger
 * var du är.
 *
 *   Med plan:   "Plan inför provet", provets namn som rubrik, "7 dagar kvar
 *               till provet 25 nov · dagsmål två" med Ändra, och banan.
 *   Artikel:    samma utan datum, med "Lägg till provdatum" i stället och
 *               banan med öppet slut.
 *   Utan plan:  datumet, "Hem", "Var du står och vad som är rimligt
 *               härnäst." och hur många testtyper som är mätta.
 *
 * Väggen bär aldrig primärknappen (designsystemet 6). Server component;
 * Topprad är en klientö.
 */

import Link from 'next/link'
import Vagg from '@/components/rum/Vagg'
import Topprad from '@/components/rum/Topprad'
import { KNAPP_GLAS, LANK_VAGG } from '@/components/shell/knappar'
import { PLAN_HREF, PROVDATUM_HREF } from '@/lib/tester/v4/rutter'
import type { BanaDag, Dag, PlanV4, TesttypKort } from '@/lib/tester/v4/typer'
import Bana from './Bana'
import { HEM_V4, datumRad } from './copy'

const GLAS = KNAPP_GLAS.replace(' h-12', ' h-11').replace(' text-[15px]', ' text-[13px]').replace(' px-[18px]', ' px-3.5')

export default function PlanHuvud({
  plan,
  idag,
  typer,
  bana,
}: {
  plan: PlanV4 | null
  idag: Dag
  typer: TesttypKort[]
  bana: BanaDag[]
}) {
  if (!plan) {
    const synliga = typer.filter((t) => t.synlig)
    const matta = synliga.filter((t) => t.niva.status === 'matt').length
    return (
      <Vagg>
        <Topprad />
        <p className="mt-2 text-ey text-vagg-mjuk">{datumRad(idag)}</p>
        <h1 className="mt-1.5 text-h1 text-vagg-ink">{HEM_V4.rubrik}</h1>
        <p className="mt-2 max-w-[60ch] text-[15px] leading-[22px] text-vagg-mjuk" data-status>
          {HEM_V4.rad}
          {matta > 0 ? (
            <>
              {' '}
              <b className="font-semibold text-vagg-ink">{HEM_V4.matta(matta, synliga.length)}</b>
              {HEM_V4.mattaSvans}
            </>
          ) : null}
        </p>
      </Vagg>
    )
  }

  const utanDatum = !plan.provdatum
  return (
    <Vagg>
      <Topprad />
      <p className="mt-2 text-ey text-vagg-mjuk">{HEM_V4.planEyebrow}</p>
      <h1 className="mt-1.5 text-h1 text-vagg-ink">{plan.namn}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-[22px] text-vagg-mjuk" data-status>
        {utanDatum ? (
          <Link href={PROVDATUM_HREF} className={GLAS} data-lagg-till-datum>
            {HEM_V4.laggTillDatum}
          </Link>
        ) : (
          <>
            <span>
              {plan.dagarKvar != null && plan.dagarKvar <= 0 ? (
                <b className="font-semibold text-vagg-ink">{HEM_V4.provIdag}</b>
              ) : (
                <>
                  <b className="font-semibold text-vagg-ink">{HEM_V4.dagarKvar(plan.dagarKvar ?? 0)}</b>
                  {HEM_V4.tillProvet(plan.provdatum as Dag)}
                </>
              )}
              {plan.dagsmal ? HEM_V4.dagsmalVagg(plan.dagsmal) : null}
            </span>
            <Link href={PLAN_HREF} className={`${LANK_VAGG} -my-2.5 inline-flex min-h-11 items-center text-[13px]`} aria-label={`${HEM_V4.andra} planen`}>
              {HEM_V4.andra}
            </Link>
          </>
        )}
      </div>
      <Bana bana={bana} provdatum={plan.provdatum} dagarKvar={plan.dagarKvar} />
    </Vagg>
  )
}
