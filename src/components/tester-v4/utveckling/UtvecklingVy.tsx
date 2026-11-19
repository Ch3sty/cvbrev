'use client'

/**
 * Din utveckling på webben (utkast v4 avsnitt 6, skissens webb() med fliken
 * Din utveckling; planen 3.4). Klient för valen: testtyp, period och vald
 * punkt. Första bilden ritas på servern ur samma props, så grafen står på
 * plats utan att något hoppar.
 *
 *   Väggen      Din utveckling, planens namn eller Alla testtyper, en statusrad
 *   Lyft kort   Nivån över tid: valen, grafen, legenden, detaljen
 *   Flikar      Hem, Tester, Din utveckling
 *   Golvet      Nivå per testtyp | Resultat och mönstren
 *
 * ?typ=<id> väljer typen vid start och följer valet med replaceState (ingen
 * navigering). Gratis: bara senaste punkten per typ och låsta rader.
 */

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import Vagg from '@/components/rum/Vagg'
import Topprad from '@/components/rum/Topprad'
import Rubrik from '@/components/rum/Rubrik'
import Golv from '@/components/rum/Golv'
import LyftKort from '@/components/rum/LyftKort'
import { KNAPP_PRIMAR_SMAL } from '@/components/shell/knappar'
import { LasChip } from '@/components/traning/HemKlient'
import { DELTYP_NAMN } from '@/lib/traning/mittTest'
import { TEST_TYP_ORDNING, type TestTypId, type UtvecklingsPunkt, type UtvecklingV4Data } from '@/lib/tester/v4/typer'
import { HEM_HREF, TESTER_HREF, UTVECKLING_HREF, menyHref } from '@/lib/tester/v4/rutter'
import { LAS_CHIP } from '@/lib/tester/v4/copy'
import Graf, { tonFarg } from './Graf'
import GrafChips from './GrafChips'
import PunktDetalj from './PunktDetalj'
import NivaPerTyp from './NivaPerTyp'
import Resultat from './Resultat'
import Monsterrutor from './Monsterrutor'
import { byggGraf, periodGranser, synligaPunkter, type Period, type TypVal } from './geometri'
import { UTV } from './copy'
import s from './serier.module.css'

export interface UtvecklingVyProps {
  data: UtvecklingV4Data
  /** Ur ?typ= */
  startTyp?: TestTypId | null
  startPeriod?: Period | null
  /** Förhandsvisningen: en vald punkt vid start. */
  startPunkt?: string | null
}

const NAMN: Record<TestTypId, string> = Object.fromEntries(TEST_TYP_ORDNING.map((t) => [t, DELTYP_NAMN[t]])) as Record<
  TestTypId,
  string
>

function Flikar() {
  const flikar = [
    { href: HEM_HREF, text: UTV.flikar.hem },
    { href: TESTER_HREF, text: UTV.flikar.tester },
    { href: UTVECKLING_HREF, text: UTV.flikar.utveckling, aktiv: true },
  ]
  return (
    <nav aria-label={UTV.flikar.etikett} className="-mt-1 flex gap-1.5 border-b border-kant" data-flikar>
      {flikar.map((f) => (
        <Link
          key={f.href}
          href={f.href}
          aria-current={f.aktiv ? 'page' : undefined}
          prefetch={f.aktiv ? false : undefined}
          className={`-mb-px inline-flex h-11 items-center border-b-2 px-3.5 text-sm font-semibold ${
            f.aktiv ? 'border-koppar text-ink-1' : 'border-transparent text-ink-3 hover:text-ink-1'
          }`}
        >
          {f.text}
        </Link>
      ))}
    </nav>
  )
}

function Legend({ data, typer }: { data: UtvecklingV4Data; typer: TestTypId[] }) {
  const plan = data.plan
  const planTyper = typer.filter((t) => plan?.typer.includes(t))
  const ovriga = typer.filter((t) => !plan?.typer.includes(t))
  const markor = 'inline-block shrink-0'
  return (
    <ul className={`flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-ink-2 ${s.rot}`} aria-label="Teckenförklaring" data-legend>
      <li className="inline-flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className={markor}>
          <circle cx="6" cy="6" r="4.2" fill="none" style={{ stroke: 'var(--ink-2)' }} strokeWidth="2" />
        </svg>
        {UTV.legend.nivakoll}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={markor}>
          <circle cx="5" cy="5" r="3.5" style={{ fill: 'var(--ink-2)' }} />
        </svg>
        {UTV.legend.trana}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={markor}>
          <rect x="0.5" y="0.5" width="9" height="9" rx="2" style={{ fill: 'var(--ink-2)' }} />
        </svg>
        {UTV.legend.ovningsprov}
      </li>
      {plan ? (
        <>
          {planTyper.length ? (
            <li className="inline-flex items-center gap-1.5 font-semibold text-ink-1">
              <span aria-hidden="true" className="h-[3px] w-3.5 rounded-sm bg-koppar" />
              {UTV.legend.ingarI(plan.namn)}
            </li>
          ) : null}
          {ovriga.length ? (
            <li className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-[3px] w-3.5 rounded-sm bg-ink-3 opacity-60" />
              {UTV.legend.ovriga}
            </li>
          ) : null}
        </>
      ) : (
        typer.map((t) => (
          <li key={t} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="h-[3px] w-3.5 rounded-sm" style={{ background: tonFarg('serie', t) }} />
            {NAMN[t]}
          </li>
        ))
      )}
    </ul>
  )
}

export default function UtvecklingVy({ data, startTyp = null, startPeriod = null, startPunkt = null }: UtvecklingVyProps) {
  const plan = data.plan
  const [typVal, setTypVal] = useState<TypVal>(startTyp ?? 'alla')
  const [period, setPeriod] = useState<Period>(startPeriod && (startPeriod !== 'plan' || plan) ? startPeriod : 'allt')
  const [valdId, setValdId] = useState<string | null>(startPunkt)

  const synligaAlla = useMemo(() => synligaPunkter(data.punkter, null, data.historikLast), [data.punkter, data.historikLast])
  const typerMedData = useMemo(() => TEST_TYP_ORDNING.filter((t) => synligaAlla.some((p) => p.typ === t)), [synligaAlla])
  const chipTyper = useMemo(() => {
    const planT = plan?.typer ?? []
    return [...typerMedData.filter((t) => planT.includes(t)), ...typerMedData.filter((t) => !planT.includes(t))].map((t) => ({
      id: t,
      namn: NAMN[t],
      ingarIPlan: planT.includes(t),
    }))
  }, [typerMedData, plan])

  const bygg = (bredd: 'mobil' | 'dator') =>
    byggGraf({
      idag: data.idag,
      plan,
      provdag: data.provdag,
      punkter: data.punkter,
      historikLast: data.historikLast,
      typVal,
      period,
      bredd,
    })
  const mobil = bygg('mobil')
  const dator = bygg('dator')
  const vald = synligaAlla.find((p) => p.id === valdId) ?? null

  const sattUrl = useCallback((t: TypVal) => {
    try {
      const u = new URL(window.location.href)
      if (t === 'alla') u.searchParams.delete('typ')
      else u.searchParams.set('typ', t)
      window.history.replaceState(window.history.state, '', u.toString())
    } catch {
      // Adressen är en bekvämlighet; valet står ändå.
    }
  }, [])

  const valjTyp = (t: TypVal) => {
    setTypVal(t)
    sattUrl(t)
    if (vald && t !== 'alla' && vald.typ !== t) setValdId(null)
  }

  const valjPunkt = (p: UtvecklingsPunkt) => {
    if (typVal !== 'alla' && typVal !== p.typ) valjTyp(p.typ)
    const g = periodGranser(period, { idag: data.idag, plan, provdag: data.provdag, punkter: data.punkter })
    if (p.dag < g.fran || p.dag > g.till) setPeriod('allt')
    setValdId(p.id)
    try {
      const reducerad = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      document.getElementById('utv-graf')?.scrollIntoView({ block: 'nearest', behavior: reducerad ? 'auto' : 'smooth' })
    } catch {
      // Inget att rulla till.
    }
  }

  const matta = data.typer.filter((t) => t.niva.status === 'matt').length
  const statusrad = plan ? (
    plan.dagarKvar != null && plan.dagarKvar >= 0 ? (
      <>
        {plan.dagarKvar === 0 ? (
          <b className="font-semibold text-vagg-ink">{UTV.provetIdag}</b>
        ) : (
          <>
            <b className="font-semibold text-vagg-ink">{UTV.dagarKvar(plan.dagarKvar)}</b>
            {UTV.dagarKvarRad}
          </>
        )}
        {UTV.undertext}
      </>
    ) : (
      <>
        {UTV.utanDatum}
        {UTV.undertext}
      </>
    )
  ) : (
    <>
      <b className="font-semibold text-vagg-ink">{UTV.matta(matta, data.typer.length)}</b>
      {UTV.mattaRad}
      {UTV.undertext}
    </>
  )

  const tom = synligaAlla.length === 0
  const forstaTyp: TestTypId =
    plan?.typer.find((t) => data.typer.find((x) => x.id === t)?.niva.status !== 'matt') ?? plan?.typer[0] ?? 'matris'
  const periodTom = !tom && dator.markorer.length === 0
  const visaMonster =
    !!data.matrisMonster?.length && (plan ? plan.typer.includes('matris') : typerMedData.includes('matris'))

  return (
    <div className="flex flex-1 flex-col" data-vy="din-utveckling">
      <Vagg>
        <Topprad brand={UTV.brand} />
        <p className="mt-2 text-ey text-vagg-mjuk">{UTV.eyebrow}</p>
        <Rubrik titel={plan ? plan.namn : UTV.rubrikUtanPlan} rad={statusrad} className="!mt-1" />
      </Vagg>
      <Golv lyft>
        {tom ? (
          <LyftKort
            label={UTV.graf.eyebrow}
            eyebrow={UTV.graf.eyebrow}
            eyebrowTon="neutral"
            text={UTV.graf.tom}
            handling={
              <Link href={menyHref(forstaTyp)} className={`${KNAPP_PRIMAR_SMAL} self-start`}>
                {UTV.graf.tomKnapp}
              </Link>
            }
          />
        ) : (
          <LyftKort label={UTV.graf.eyebrow} eyebrow={UTV.graf.eyebrow} eyebrowTon="neutral">
            <div className="mt-3 flex flex-col gap-3" id="utv-graf">
              <GrafChips
                typer={chipTyper}
                typVal={typVal}
                period={period}
                harPlan={!!plan}
                onTyp={valjTyp}
                onPeriod={setPeriod}
              />
              <div className="lg:hidden">
                <Graf modell={mobil} namn={NAMN} valdId={valdId} onValj={(id) => setValdId(id)} idPrefix="mobil" detaljId="utv-detalj" />
              </div>
              <div className="hidden lg:block">
                <Graf modell={dator} namn={NAMN} valdId={valdId} onValj={(id) => setValdId(id)} idPrefix="dator" detaljId="utv-detalj" />
              </div>
              {periodTom ? <p className="text-meta text-ink-3">{UTV.graf.tomPeriod}</p> : null}
              <Legend data={data} typer={typerMedData} />
              <div id="utv-detalj" aria-live="polite" className="min-h-[60px]">
                <PunktDetalj punkt={vald} namn={NAMN} />
              </div>
              {data.historikLast ? (
                <div className="flex justify-center" data-historik-las>
                  <LasChip
                    feature="tests_above_base"
                    plats="historik"
                    text={UTV.graf.historikLast}
                    label={`${UTV.graf.historikLast}. ${LAS_CHIP.premium}`}
                  />
                </div>
              ) : null}
            </div>
          </LyftKort>
        )}
        <Flikar />
        <div className="grid grid-cols-1 items-start gap-4 pb-10 lg:grid-cols-2">
          <NivaPerTyp typer={data.typer} planNamn={plan?.namn ?? null} typVal={typVal} onTyp={valjTyp} />
          <div className="flex flex-col gap-4">
            <Resultat
              punkter={synligaAlla}
              typVal={typVal}
              planTyper={plan?.typer ?? []}
              planNamn={plan?.namn ?? null}
              namn={NAMN}
              valdId={valdId}
              historikLast={data.historikLast}
              onValj={valjPunkt}
            />
            {visaMonster && data.matrisMonster ? <Monsterrutor monster={data.matrisMonster} premium={data.gratis.premium} /> : null}
          </div>
        </div>
      </Golv>
    </div>
  )
}
