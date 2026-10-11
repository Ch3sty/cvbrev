'use client'

/**
 * Ingången i Rekryteringstester (spec-rummen 4.4 Ingang och våg 2,
 * konceptets E1, E2, E3 och E3-P): tre korta frågor i vanligt språk på
 * golvet, ingen behöver kunna ett leverantörsnamn.
 *
 *   E1  Vad ska du testas på? Flera val, "Vet inte" ger figurer och mönster.
 *   E2  Vet du vem som gör testet? Frivilligt, med ledtråd, Matrigma-varianten
 *       och varumärkesraden. Hoppa över synligt.
 *   E3  När är provet? Datum, chips, planen som bild. Hoppa över synligt.
 *   E3-P  Bara personlighet: två steg, inget sikte, ingen plan, ingen nedräkning.
 *
 * Sparar med PUT /api/traning/plan. Går det inte står felet kvar i foten och
 * ingenting säger "sparat"; användaren står kvar på steget.
 *
 * Klient (FlowShell äger skärmen).
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FlowShell from '@/components/shell/FlowShell'
import { LANK } from '@/components/shell/knappar'
import { IkonKalender, SymMatris, SymOrd, SymPerson, SymPlan, SymSiffror, SymVetInte } from '@/components/illustrations/RumSymboler'
import { capture } from '@/lib/analytics/events'
import { INGANG } from '@/lib/traning/hem-copy'
import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum'
import { byggPlan, raknaPlan } from '@/lib/traning/plan'
import { datumText } from '@/lib/traning/rubrik'
import { talord, versal } from '@/lib/traning/copy'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { TaBortSvar } from './HemKlient'

export interface IngangPlan {
  testtyper: string[] | null
  leverantor: string | null
  variant: string | null
  provdatum: string | null
  utfall?: string | null
}

type Typ = 'matris' | 'numerisk' | 'verbal' | 'personlighet'
type Lev = 'matrigma' | 'alva' | 'shl' | 'aon' | 'annat' | 'vet_inte'
type Var = 'klassisk' | 'adaptiv' | 'vet_inte'

const TYPER: { id: Typ; Sym: typeof SymMatris }[] = [
  { id: 'matris', Sym: SymMatris },
  { id: 'numerisk', Sym: SymSiffror },
  { id: 'verbal', Sym: SymOrd },
  { id: 'personlighet', Sym: SymPerson },
]
const LEV: Lev[] = ['matrigma', 'alva', 'shl', 'aon', 'annat', 'vet_inte']
const VARIANTER: Var[] = ['klassisk', 'adaptiv', 'vet_inte']

const TAL_UPP = ['elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo']
function ord(n: number, ett: 'en' | 'ett' = 'ett'): string {
  return n >= 11 && n <= 20 ? TAL_UPP[n - 11] : talord(n, ett)
}

/** "14 dagar. Åtta pass fram till provet, ett övningsprov två dagar före och vila på provdagen. Du kan ändra datumet när du vill." */
export function plantext(idag: Dag, prov: Dag): { dagar: string; text: string } {
  const n = dagarMellan(idag, prov)
  if (n <= 0) return { dagar: '', text: INGANG.datum.planIdag }
  const r = raknaPlan(byggPlan({ start: idag, prov, idag, betalande: true }))
  // Vila och nivåmätningar syns i planbilden, inte i meningen (copy-plan 3.6).
  const pass = `${versal(ord(r.pass))} pass`
  const gen = r.general >= 2 ? 'ett övningsprov två dagar före' : r.general === 1 ? 'ett övningsprov dagen före' : null
  return { dagar: INGANG.datum.planDagar(n), text: INGANG.datum.plan(pass, gen) }
}

export default function Ingang({
  idag,
  plan,
  startSteg,
  forsta,
}: {
  idag: Dag
  plan: IngangPlan | null
  startSteg: 1 | 2 | 3
  forsta: boolean
}) {
  const router = useRouter()
  const forval = (plan?.testtyper ?? []).filter((t): t is Typ => ['matris', 'numerisk', 'verbal', 'personlighet'].includes(t))
  const [steg, setSteg] = useState<1 | 2 | 3>(startSteg)
  const [typer, setTyper] = useState<Set<Typ>>(new Set(forval))
  const [vetInte, setVetInte] = useState(false)
  const [lev, setLev] = useState<Lev | null>((plan?.leverantor as Lev | null) ?? null)
  const [variant, setVariant] = useState<Var>((plan?.variant as Var | null) ?? 'vet_inte')
  const [datum, setDatum] = useState<string>(plan?.provdatum ?? '')
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  const baraPersonlighet = typer.size === 1 && typer.has('personlighet') && !vetInte
  const antalSteg = baraPersonlighet ? 2 : 3
  const visatSteg = baraPersonlighet && steg === 3 ? 2 : steg
  const typerUt = (): Typ[] => (vetInte || typer.size === 0 ? ['matris'] : [...typer])

  const vaxla = (t: Typ) => {
    setVetInte(false)
    setTyper((f) => {
      const n = new Set(f)
      if (n.has(t)) n.delete(t)
      else n.add(t)
      return n
    })
  }

  const datumFel = datum && datum < idag ? INGANG.datum.passerat : null
  const planInfo = useMemo(() => (datum && datum >= idag ? plantext(idag, datum) : null), [datum, idag])

  const spara = async (provdatum: string | null, hoppade: boolean) => {
    if (sparar) return
    setSparar(true)
    setFel(null)
    const testtyper = typerUt()
    const leverantor = baraPersonlighet || !lev || lev === 'vet_inte' ? null : lev
    const kropp = {
      testtyper,
      leverantor,
      variant: leverantor === 'matrigma' && variant !== 'vet_inte' ? variant : null,
      provdatum,
    }
    try {
      const svar = await fetch('/api/traning/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kropp),
      })
      if (!svar.ok) throw new Error(String(svar.status))
      if (provdatum) {
        capture('provdatum_satt', {
          dagar_kvar: dagarMellan(idag, provdatum),
          leverantor,
          typer: testtyper,
          surface: forsta ? 'ingang' : 'installningar',
        })
      } else if (hoppade) {
        capture('provdatum_hoppat_over', { steg: 3 })
      }
      router.push(TRANING_RUTT.hem)
      router.refresh()
    } catch {
      setFel(INGANG.fel)
      setSparar(false)
    }
  }

  /** Krysset. Första gången sparas en tom plan, så ingången inte kommer tillbaka vid varje besök. */
  const lamna = async () => {
    if (forsta) {
      try {
        const r = await fetch('/api/traning/plan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ testtyper: [] }),
        })
        if (!r.ok) throw new Error(String(r.status))
        router.push(TRANING_RUTT.hem)
      } catch {
        router.push(`${TRANING_RUTT.hem}?visa=hem`)
      }
      return
    }
    router.push(TRANING_RUTT.hem)
  }

  const fortsatt = () => {
    if (steg === 1) {
      capture('ingang_steg', { steg: 1, val: vetInte ? 'vet_inte' : [...typer].join(','), forsta })
      setSteg(baraPersonlighet ? 3 : 2)
    } else if (steg === 2) {
      capture('ingang_steg', { steg: 2, val: lev ?? 'inget', forsta })
      setSteg(3)
    } else {
      capture('ingang_steg', { steg: 3, val: datum ? 'datum' : 'inget', forsta })
      void spara(datum || null, false)
    }
  }

  const undertitel =
    steg === 1
      ? INGANG.undertitel.steg1
      : baraPersonlighet
        ? INGANG.undertitel.personlighet
        : steg === 3 && lev && lev !== 'vet_inte' && lev !== 'annat'
          ? `Samma format som ${INGANG.leverantor.val[lev].replace(/ \(.*\)$/, '')}`
          : vetInte
            ? INGANG.typ.val.matris.titel
            : [...typer].map((t) => INGANG.typ.val[t].titel).join(', ')

  const primar =
    steg === 3 ? (baraPersonlighet ? INGANG.datum.knappPersonlighet : INGANG.datum.knapp) : INGANG.fortsatt
  const sparrad = steg === 1 ? typer.size === 0 && !vetInte : steg === 3 ? !!datumFel : false

  const chips: { text: string; dag: Dag }[] = [
    { text: INGANG.datum.chips.vecka, dag: laggTill(idag, 7) },
    { text: INGANG.datum.chips.tvaVeckor, dag: laggTill(idag, 14) },
    { text: INGANG.datum.chips.manad, dag: laggTill(idag, 30) },
  ]

  const valKlass = (vald: boolean) =>
    `relative flex min-h-[118px] flex-col gap-2.5 rounded-[14px] border bg-papper px-3 pb-3 pt-3.5 text-left ${
      vald ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant'
    }`
  const chipKlass = (vald: boolean) =>
    `inline-flex h-10 items-center rounded-[10px] border bg-papper px-3.5 text-sm font-medium text-ink-1 ${
      vald ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant-stark'
    }`
  const Bock = () => (
    <span aria-hidden="true" className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink-1 text-papper">
      <svg viewBox="0 0 20 20" width="20" height="20">
        <path d="M6 10.5l2.5 2.5L14 7.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )

  return (
    <FlowShell
      title={INGANG.flode}
      step={visatSteg}
      totalSteps={antalSteg}
      smal
      onBack={steg > 1 ? () => setSteg(steg === 3 && baraPersonlighet ? 1 : ((steg - 1) as 1 | 2)) : undefined}
      onExit={lamna}
      exitLabel={INGANG.stang}
      primaryLabel={primar}
      onPrimary={fortsatt}
      primaryDisabled={sparrad}
      primaryBlockedReason={steg === 1 && sparrad ? INGANG.typ.tomt : datumFel ?? fel ?? undefined}
      primaryBusy={sparar}
      busyLabel={INGANG.sparar}
      footerSecondary={
        steg === 2 || forsta ? (
          <div className="flex flex-wrap items-center justify-between gap-x-6">
            {steg === 2 ? (
              <button
                type="button"
                className={`${LANK} min-h-9`}
                onClick={() => {
                  setLev(null)
                  capture('provdatum_hoppat_over', { steg: 2 })
                  setSteg(3)
                }}
              >
                {INGANG.hoppaOver}
              </button>
            ) : null}
            {forsta ? (
              // Förbi planen (beslut-hemvy 2026-10-11): en länk, aldrig en knapp.
              <Link href={TRANING_RUTT.alla} className={`${LANK} inline-flex min-h-9 items-center`} data-ingang-alla>
                {INGANG.allaTester}
              </Link>
            ) : null}
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3.5 pb-4" data-steg={steg}>
        <p className="text-xs font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">
          {INGANG.stegEtikett(visatSteg, antalSteg, steg === 2)}
          <span className="sr-only">. {undertitel}</span>
        </p>

        {steg === 1 ? (
          <>
            <div className="-mt-2.5">
              <h1 className="font-display text-[26px] font-bold leading-[30px] tracking-[-.02em] text-ink-1">{INGANG.typ.fraga}</h1>
              <p className="mt-1.5 text-meta text-ink-3">{INGANG.typ.ledtrad}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5" role="group" aria-label="Testtyp">
              {TYPER.map(({ id, Sym }) => {
                const vald = typer.has(id) && !vetInte
                return (
                  <button key={id} type="button" role="checkbox" aria-checked={vald} onClick={() => vaxla(id)} className={valKlass(vald)}>
                    <Sym size={44} className="text-ton-ink" />
                    <span>
                      <span className="block text-[15px] font-semibold leading-[19px] text-ink-1">{INGANG.typ.val[id].titel}</span>
                      <span className="mt-0.5 block text-xs leading-4 text-ink-3">{INGANG.typ.val[id].rad}</span>
                    </span>
                    {vald ? <Bock /> : null}
                  </button>
                )
              })}
              <button
                type="button"
                role="checkbox"
                aria-checked={vetInte}
                onClick={() => {
                  setVetInte((v) => !v)
                  setTyper(new Set())
                }}
                className={`${valKlass(vetInte)} col-span-2 !min-h-16 !flex-row items-center`}
              >
                <SymVetInte size={44} className="shrink-0 text-ton-ink" />
                <span className="pr-6">
                  <span className="block text-[15px] font-semibold leading-[19px] text-ink-1">{INGANG.typ.val.vetInte.titel}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-ink-3">{INGANG.typ.val.vetInte.rad}</span>
                </span>
                {vetInte ? <Bock /> : null}
              </button>
            </div>
          </>
        ) : null}

        {steg === 2 ? (
          <>
            <div className="-mt-2.5">
              <h1 className="font-display text-[26px] font-bold leading-[30px] tracking-[-.02em] text-ink-1">{INGANG.leverantor.fraga}</h1>
              <p className="mt-1.5 text-meta text-ink-3">{INGANG.leverantor.ledtrad}</p>
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Vem gör testet">
              {LEV.map((l) => (
                <button key={l} type="button" role="radio" aria-checked={lev === l} onClick={() => setLev(l)} className={chipKlass(lev === l)}>
                  {INGANG.leverantor.val[l === 'vet_inte' ? 'vetInte' : l]}
                </button>
              ))}
            </div>
            {lev === 'matrigma' ? (
              <div className="rounded-2xl border border-kant bg-papper px-4 py-3.5">
                <p className="text-ey text-ink-3">{INGANG.leverantor.variantRubrik}</p>
                <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Variant">
                  {VARIANTER.map((v) => (
                    <button key={v} type="button" role="radio" aria-checked={variant === v} onClick={() => setVariant(v)} className={chipKlass(variant === v)}>
                      {INGANG.leverantor.variant[v === 'vet_inte' ? 'vetInte' : v]}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-meta text-ink-3">{INGANG.leverantor.variantMeta}</p>
              </div>
            ) : null}
            <p className="px-1 text-meta text-ink-3">{INGANG.leverantor.varumarke}</p>
          </>
        ) : null}

        {steg === 3 ? (
          <>
            <div className="-mt-2.5">
              <h1 className="font-display text-[26px] font-bold leading-[30px] tracking-[-.02em] text-ink-1">
                {baraPersonlighet ? INGANG.datum.fragaPersonlighet : INGANG.datum.fraga}
              </h1>
              <p className="mt-1.5 text-meta text-ink-3">{baraPersonlighet ? INGANG.datum.ledtradPersonlighet : INGANG.datum.ledtrad}</p>
            </div>
            <div>
              <label htmlFor="provdatum" className="mb-1.5 block text-sm font-medium text-ink-2">
                {baraPersonlighet ? INGANG.datum.faltPersonlighet : INGANG.datum.falt}
              </label>
              <div className="flex h-12 items-center rounded-xl border border-kant bg-papper-2 px-3.5">
                <IkonKalender size={20} className="mr-2.5 shrink-0 text-ink-3" />
                <input
                  id="provdatum"
                  type="date"
                  min={idag}
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink-1 outline-none [color-scheme:inherit]"
                />
              </div>
            </div>
            {!baraPersonlighet ? (
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <button key={c.text} type="button" aria-pressed={datum === c.dag} onClick={() => setDatum(c.dag)} className={chipKlass(datum === c.dag)}>
                    {c.text}
                  </button>
                ))}
              </div>
            ) : null}
            {baraPersonlighet ? (
              <div className="flex items-center gap-3.5 rounded-2xl border border-kant bg-papper px-4 py-3.5">
                <SymPerson size={48} className="shrink-0 text-ton-ink" />
                <p className="text-meta text-ink-2">
                  {datum && !datumFel ? <b className="font-semibold text-ink-1">{INGANG.datum.personlighetKort(datumText(datum))} </b> : null}
                  {INGANG.datum.personlighetText}
                </p>
              </div>
            ) : planInfo ? (
              <div className="flex items-center gap-3.5 rounded-2xl border border-kant bg-papper px-4 py-3.5">
                <SymPlan size={56} className="shrink-0 text-ton-ink" />
                <p className="text-meta text-ink-2" data-plantext>
                  {planInfo.dagar ? <b className="font-semibold text-ink-1">{planInfo.dagar} </b> : null}
                  {planInfo.text}
                </p>
              </div>
            ) : null}
            <div className="flex flex-col items-start gap-1 px-1">
              <button type="button" className={`${LANK} min-h-11 text-left`} disabled={sparar} onClick={() => void spara(null, true)}>
                {INGANG.datum.hoppaOver}
              </button>
              {plan?.provdatum ? (
                <button type="button" className={`${LANK} min-h-11 text-left`} disabled={sparar} onClick={() => void spara(null, false)}>
                  {INGANG.datum.taBort}
                </button>
              ) : null}
              {plan?.utfall ? <TaBortSvar /> : null}
            </div>
            {fel ? (
              <p role="alert" className="rounded-xl border border-[color:var(--fel-kant)] bg-[color:var(--fel-mjuk)] px-4 py-3 text-sm text-[color:var(--fel-morker)]">
                {fel}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </FlowShell>
  )
}
