'use client'

/**
 * Tester v4 (utkast v4 avsnitt 3 och 4, skissens webbvy "Tester"): väggen
 * med "Alla tester" och planraden, kortet Nästa steg (C:s NastaSteg, som
 * plats tills integrationen), flikarna, rutnätet av testtyper och typens
 * meny.
 *
 * Med plan: provets delar och övningsprovet i en tonad grupp "Ingår i
 * <provet> · N delar", sedan "Används i andra rekryteringstest, inte i
 * <provet>" med övriga i samma kortstil och Personlighet sist. Utan plan:
 * "Alla testtyper".
 *
 * Komponenten äger den öppna menyn och ?typ= i adressen
 * (history.replaceState). Menyerna ligger i sidans data, så att öppna en
 * meny kostar inget nätverksanrop. Sidan beror inte på webbens sidomeny och
 * ritas likadant i appens ram (/app/tester/alla).
 */

import Link from 'next/link'
import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import Vagg from '@/components/rum/Vagg'
import Topprad from '@/components/rum/Topprad'
import Rubrik from '@/components/rum/Rubrik'
import Golv from '@/components/rum/Golv'
import { KNAPP_PRIMAR_SMAL } from '@/components/shell/knappar'
import { SALD_PLAN } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { kortDatum } from '@/lib/traning/rubrik'
import { PLAN_HREF, PROVDATUM_HREF, TESTER_HREF } from '@/lib/tester/v4/rutter'
import type { Handling, PlanV4, TestTypId, TesterV4Data } from '@/lib/tester/v4/typer'
import { arTestTypId } from '@/lib/tester/v4/typer'
import { LasProvider } from './LasKontext'
import TesttypKort from './TesttypKort'
import ProvGrupp from './ProvGrupp'
import OvrigaRubrik from './OvrigaRubrik'
import OvningsprovKort from './OvningsprovKort'
import PersonlighetKort from './PersonlighetKort'
import TypMenyPanel from './TypMenyPanel'
import { TESTER } from './copy'
import Flikar from '../hem/Flikar'

const GLAS =
  'inline-flex min-h-11 items-center rounded-xl border border-vagg-kant bg-white/[.08] px-3.5 text-[13px] font-semibold text-vagg-ink'

/** Rutnätet: ett kort på mobil, två från 640 px, tre från 1100 px (två när menyn står bredvid). */
export function rutnatKlass(oppen: boolean): string {
  return `grid grid-cols-1 gap-3 sm:grid-cols-2 ${oppen ? '' : 'min-[1100px]:grid-cols-3'}`
}

function satt(typ: TestTypId | null) {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (typ) url.searchParams.set('typ', typ)
    else url.searchParams.delete('typ')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {
    // Adressen är en bekvämlighet; menyn fungerar utan den.
  }
}

function PlanStatus({ plan }: { plan: PlanV4 | null }) {
  if (!plan) {
    return (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span>
          {TESTER.vagg.utanPlan} <b className="font-semibold text-vagg-ink">{TESTER.vagg.utanPlanFraga}</b>{' '}
          {TESTER.vagg.utanPlanRest}
        </span>
        <Link href={PLAN_HREF} className={GLAS}>
          {TESTER.vagg.valj}
        </Link>
      </span>
    )
  }
  const delar: string[] = []
  if (plan.provdatum) delar.push(kortDatum(plan.provdatum))
  if (plan.dagarKvar != null && plan.dagarKvar >= 0) delar.push(`${plan.dagarKvar} ${plan.dagarKvar === 1 ? 'dag' : 'dagar'} kvar`)
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span>
        {TESTER.vagg.planPrefix} <b className="font-semibold text-vagg-ink">{plan.namn}</b>
        {delar.length ? ` · ${delar.join(' · ')}` : ''}
      </span>
      {plan.provdatum ? (
        <Link href={PLAN_HREF} className={GLAS}>
          {TESTER.vagg.andra}
        </Link>
      ) : (
        <Link href={PROVDATUM_HREF} className={GLAS}>
          {TESTER.vagg.laggTillDatum}
        </Link>
      )}
    </span>
  )
}

function GratisRad({ gratis }: { gratis: TesterV4Data['gratis'] }) {
  if (gratis.premium) return null
  const kvar = gratis.grundKvarIdag > 0
  return (
    <section
      aria-label={kvar ? TESTER.gratis.rubrikKvar : TESTER.gratis.rubrikSlut}
      data-gratisrad={kvar ? 'kvar' : 'slut'}
      className="grid gap-1.5 rounded-2xl border border-kant bg-papper px-[18px] py-4"
    >
      <h2 className="font-display text-[17px] font-bold leading-[22px] text-ink-1">
        {kvar ? TESTER.gratis.rubrikKvar : TESTER.gratis.rubrikSlut}
      </h2>
      <p className="text-sm leading-[21px] text-ink-2">
        {TESTER.gratis.text(kvar, gratis.pris.prisrad, gratis.pris.namn)}
      </p>
      <div className="mt-1.5">
        <Link href={kopstegHref(SALD_PLAN, 'testniva')} className={`${KNAPP_PRIMAR_SMAL} w-full sm:w-auto`}>
          {gratis.pris.knapp || TESTER.gratis.knapp}
        </Link>
      </div>
    </section>
  )
}

export default function TesterVy({
  data,
  startTyp = null,
  nastaSteg,
}: {
  data: TesterV4Data
  startTyp?: TestTypId | null
  /** Kortet Nästa steg (C:s NastaSteg), monteras i integrationen. */
  nastaSteg?: ReactNode
}) {
  const [oppen, setOppen] = useState<TestTypId | null>(startTyp && arTestTypId(startTyp) ? startTyp : null)

  const oppna = useCallback((typ: TestTypId) => {
    setOppen((nu) => {
      const nasta = nu === typ ? null : typ
      satt(nasta)
      return nasta
    })
  }, [])
  const stang = useCallback(() => {
    setOppen(null)
    satt(null)
  }, [])

  // En ny adress med ?typ= (till exempel tillbaka från ett test) öppnar den menyn.
  useEffect(() => {
    if (startTyp && arTestTypId(startTyp)) setOppen(startTyp)
  }, [startTyp])

  // Nästa steg pekar på /dashboard/tester/alla?typ=<id>. Här står vi redan på
  // sidan, så länken öppnar menyn direkt utan att hämta sidan igen.
  const fangaMenyLank = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest?.('a')
      if (!a) return
      try {
        const url = new URL(a.href, window.location.href)
        const typ = url.searchParams.get('typ')
        if (url.origin !== window.location.origin || url.pathname !== TESTER_HREF || !arTestTypId(typ)) return
        e.preventDefault()
        setOppen(typ)
        satt(typ)
      } catch {
        // Länken får gå som vanligt.
      }
    },
    [],
  )

  const plan = data.plan
  const synliga = data.typer.filter((k) => k.synlig)
  const iPlan = plan ? synliga.filter((k) => k.ingarIPlan) : []
  const ovriga = plan ? synliga.filter((k) => !k.ingarIPlan) : synliga
  const premium = data.gratis.premium
  const rutnat = rutnatKlass(oppen != null)
  const tonFor = (ingar: boolean) => (plan && !ingar ? 'neutral' : 'koppar')

  const oppetKort = oppen ? synliga.find((k) => k.id === oppen) ?? data.typer.find((k) => k.id === oppen) : null
  const oppenMeny = oppen ? data.menyer[oppen] : null

  const menyTypForProv = plan?.typer[0] ?? null
  const provHandling: Handling | null =
    plan?.ovningsprov && menyTypForProv
      ? data.menyer[menyTypForProv]?.ovningsprov[0] ?? {
          slag: 'ovningsprov',
          etikett: TESTER.ovningsprov.knapp,
          href: plan.ovningsprov.href,
          las: premium ? null : { skal: 'premium', chip: TESTER.ovningsprov.las },
        }
      : null
  const senasteProv = menyTypForProv ? data.menyer[menyTypForProv]?.senaste.prov.at(-1) ?? null : null

  const kort = (k: (typeof synliga)[number]) => (
    <TesttypKort
      key={k.id}
      kort={k}
      planNamn={plan?.namn ?? null}
      ton={tonFor(k.ingarIPlan)}
      vald={oppen === k.id}
      premium={premium}
      onOppna={oppna}
    />
  )

  return (
    <LasProvider paket={data.paket}>
      <div className="flex flex-1 flex-col" data-tester-v4 data-plan={plan?.mittTest ?? 'ingen'}>
        <Vagg tat={!nastaSteg}>
          <Topprad />
          <p className="mt-4 text-ey text-vagg-mjuk lg:mt-2">{TESTER.vagg.eyebrow}</p>
          <Rubrik titel={TESTER.vagg.rubrik} rad={<PlanStatus plan={plan} />} className="!mt-1.5" />
        </Vagg>
        <Golv lyft={!!nastaSteg} className="pb-10">
          {nastaSteg ? <div onClickCapture={fangaMenyLank}>{nastaSteg}</div> : null}
          <Flikar aktiv="tester" />
          <div className={`grid items-start gap-4 ${oppen ? 'min-[1100px]:grid-cols-[minmax(0,1fr)_380px]' : ''}`}>
            <div className="grid min-w-0 gap-4">
              {plan && iPlan.length ? (
                <ProvGrupp namn={plan.namn} delar={plan.typer.length || iPlan.length} rutnat={rutnat}>
                  {iPlan.map(kort)}
                  {plan.ovningsprov && provHandling && menyTypForProv ? (
                    <OvningsprovKort
                      plan={plan as PlanV4 & { ovningsprov: NonNullable<PlanV4['ovningsprov']> }}
                      handling={provHandling}
                      senaste={senasteProv}
                      menyTyp={menyTypForProv}
                      vald={false}
                      onOppna={oppna}
                    />
                  ) : null}
                </ProvGrupp>
              ) : null}
              <OvrigaRubrik planNamn={plan && iPlan.length ? plan.namn : null} />
              <div className={rutnat}>
                {ovriga.map(kort)}
                <PersonlighetKort gjord={data.personlighet.gjord} href={data.personlighet.href} />
              </div>
            </div>
            {oppetKort && oppenMeny ? <TypMenyPanel key={oppetKort.id} kort={oppetKort} meny={oppenMeny} onStang={stang} /> : null}
          </div>
          <GratisRad gratis={data.gratis} />
        </Golv>
      </div>
    </LasProvider>
  )
}
