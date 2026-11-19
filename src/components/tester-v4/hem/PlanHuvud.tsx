/**
 * Hems vägg (utkast v4 avsnitt 2 punkt 1, skissens webb-Hem): väggen säger
 * var du är.
 *
 *   Med plan:   "Plan inför provet", provets namn som rubrik, provets
 *               format och Ändra planen, den stora nedräkningen i glas
 *               ("6 dagar kvar", provet onsdag 25 nov) och banan. På mobil
 *               står nedräkningen under rubriken med Ändra i glaset.
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
import { KNAPP_GLAS } from '@/components/shell/knappar'
import { veckodagNamn } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { PLAN_HREF, PROVDATUM_HREF } from '@/lib/tester/v4/rutter'
import type { BanaDag, Dag, PlanV4, TesttypKort } from '@/lib/tester/v4/typer'
import Bana from './Bana'
import { HEM_V4, datumRad } from './copy'

const GLAS = KNAPP_GLAS.replace(' h-12', ' h-11').replace(' text-[15px]', ' text-[13px]').replace(' px-[18px]', ' px-3.5')
const GLAS_LITEN = `${GLAS} shrink-0 !self-center !rounded-[10px] !px-3`

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
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8">
        <div className="min-w-0">
          <p className="mt-2 text-ey text-vagg-mjuk">{HEM_V4.planEyebrow}</p>
          <h1 className="mt-1.5 text-h1 text-vagg-ink">{plan.namn}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[15px] leading-[22px] text-vagg-mjuk" data-status>
            {plan.format ? <span className={utanDatum ? '' : 'hidden lg:inline'}>{plan.format}</span> : null}
            {utanDatum ? (
              <Link href={PROVDATUM_HREF} className={GLAS} data-lagg-till-datum>
                {HEM_V4.laggTillDatum}
              </Link>
            ) : (
              <Link href={PLAN_HREF} className={`${GLAS} !self-center hidden lg:inline-flex`}>
                {HEM_V4.nedrakning.andraPlanen}
              </Link>
            )}
          </div>
        </div>
        {utanDatum ? null : <Nedrakning provdatum={plan.provdatum as Dag} dagarKvar={plan.dagarKvar} />}
      </div>
      <Bana bana={bana} provdatum={plan.provdatum} dagarKvar={plan.dagarKvar} />
    </Vagg>
  )
}

/** Den stora nedräkningen i glas bredvid rubriken (på mobil under den, med Ändra). */
function Nedrakning({ provdatum, dagarKvar }: { provdatum: Dag; dagarKvar: number | null }) {
  const D = HEM_V4.nedrakning
  const veckodag = veckodagNamn(provdatum)
  const datum = kortDatum(provdatum)
  const n = dagarKvar ?? 0
  const idag = n <= 0
  return (
    <div
      className="mt-3.5 flex items-center gap-3 rounded-[18px] border border-vagg-kant bg-white/[.08] py-2.5 pl-4 pr-3.5 lg:mt-0 lg:gap-3.5 lg:rounded-[20px] lg:py-3 lg:pl-[18px] lg:pr-[22px]"
      data-nedrakning
    >
      <p className="flex min-w-0 flex-1 items-center gap-3 lg:gap-3.5">
        <span className="sr-only">{idag ? `${HEM_V4.provIdag}, ${veckodag} ${datum}` : D.aria(n, veckodag, datum)}</span>
        {idag ? null : (
          <span aria-hidden="true" className="font-display text-[52px] font-extrabold leading-[52px] tracking-[-.035em] text-vagg-ink [font-variant-numeric:tabular-nums] lg:text-[64px] lg:leading-[64px]">
            {n}
          </span>
        )}
        <span aria-hidden="true" className="grid min-w-0 gap-px">
          <b className="text-[15px] font-semibold leading-[19px] text-vagg-ink lg:text-base lg:leading-5">{idag ? HEM_V4.provIdag : D.dagar(n)}</b>
          <span className="text-[12.5px] leading-[17px] text-vagg-mjuk lg:text-[13px] lg:leading-[18px]">{D.provet(veckodag, datum)}</span>
        </span>
      </p>
      <Link href={PLAN_HREF} className={`${GLAS_LITEN} lg:hidden`} aria-label={`${HEM_V4.andra} planen`}>
        {HEM_V4.andra}
      </Link>
    </div>
  )
}
