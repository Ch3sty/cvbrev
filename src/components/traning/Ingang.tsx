'use client'

/**
 * Ingången i Rekryteringstester. Sedan testplanens steg 2 (2026-11-09,
 * skiss-tester-steg2 fliken Mitt test, brief-tester-steg2 avsnitt 6) två
 * steg i vanligt språk:
 *
 *   1  Vad ska du göra för test? Åtta val som kort, leverantören som andra
 *      rad. Polisen eller Försvarsmakten har varianten som chips, Matrigma
 *      sin klassisk eller adaptiv, Lokförare den ärliga anmärkningen och
 *      Annat eller vet inte dagens kryssrutor. Kortet "Så lägger vi upp det"
 *      visar vad valet ger innan man går vidare. Varumärkesraden sist.
 *      Förr två steg (Vad ska du testas på? och Vet du vem som gör testet?),
 *      nu ihopslagna: den som väljer Polisen eller SHL behöver inte kryssa.
 *   2  När är provet? Datum, chips, planen som bild. Hoppa över synligt.
 *      Bara personlighet: när är testet, inget sikte, ingen plan.
 *
 * Provdatumskärmen efter kontot (efterKonto, saas-leads beslut 4,
 * 2026-11-10): samma datumsteg som ett eget, enda steg, för konton som kom
 * från en artikel med valet I-prov eller lokförare. I-prov får varianten
 * (Polisen, värnplikt, officersprogrammet) på samma skärm. Hoppa över och
 * krysset går vidare utan att spara, dit kontot var på väg (nasta).
 *
 * Sparar med PUT /api/traning/plan (mittTest.ts planFranVal). Går det inte
 * står felet kvar i foten och ingenting säger "sparat"; användaren står kvar
 * på steget.
 *
 * Klient (FlowShell äger skärmen).
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FlowShell from '@/components/shell/FlowShell'
import { LANK } from '@/components/shell/knappar'
import { IkonKalender, SymPerson, SymPlan } from '@/components/illustrations/RumSymboler'
import { capture } from '@/lib/analytics/events'
import { sparaKontokalla } from '@/lib/analytics/provkalla'
import { INGANG } from '@/lib/traning/hem-copy'
import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum'
import { byggPlan, raknaPlan } from '@/lib/traning/plan'
import { datumText } from '@/lib/traning/rubrik'
import { talord, versal } from '@/lib/traning/copy'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import {
  DELTYPER,
  DELTYP_NAMN,
  MITT_TEST_COPY,
  MITT_TEST_KORT,
  deltypSynlig,
  mittTestNamn,
  iprovProvText,
  kryssUrPlan,
  mittTestUrPlan,
  planFranVal,
  synligaVal,
  upplagg,
  type Deltyp,
  type MittTest,
  type MittVariant,
} from '@/lib/traning/mittTest'
import { antalTid, formatTitel, ovningsformat } from '@/lib/ovningsprov/format'
import { TaBortSvar } from './HemKlient'

export interface IngangPlan {
  testtyper: string[] | null
  leverantor: string | null
  variant: string | null
  provdatum: string | null
  utfall?: string | null
  mitt_test?: string | null
  mitt_test_variant?: string | null
  extra_typer?: string[] | null
}

type IprovVar = 'polis' | 'varnplikt' | 'officer' | 'vet_inte'
type MatrigmaVar = 'klassisk' | 'adaptiv' | 'vet_inte'
const IPROV_VAR: IprovVar[] = ['polis', 'varnplikt', 'officer', 'vet_inte']
const MATRIGMA_VAR: MatrigmaVar[] = ['klassisk', 'adaptiv', 'vet_inte']

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

/** Övningsprovets rad i "Så lägger vi upp det", med talen ur format.ts. */
function ovningsprovRad(val: MittTest, variant: MatrigmaVar): string | null {
  if (val === 'personlighet') return null
  if (val === 'iprov') return iprovProvText()
  if (val === 'aon' || val === 'lokforare') {
    const f = ovningsformat('figurer', 'aon')
    return `Figurserier, ${antalTid(f)}.`
  }
  const lev = val === 'annat' ? null : val
  const f = ovningsformat('logik', lev, val === 'matrigma' && variant !== 'vet_inte' ? variant : null)
  return `${formatTitel(f)}: ${antalTid(f)}, två dagar före.`
}

/* Symbolerna i "Så lägger vi upp det" (skissens sym-plan, sym-prov, sym-lista). */
function SymUpplagg({ nyckel }: { nyckel: 'passen' | 'provet' | 'alla' }) {
  return (
    <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true" className="shrink-0 text-ton-ink">
      {nyckel === 'passen' ? (
        <>
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <rect x="6" y="9" width="28" height="24" rx="3" />
            <path d="M6 16h28M13 6v6M27 6v6" />
          </g>
          <circle cx="14" cy="23" r="2" fill="currentColor" />
          <circle cx="20" cy="23" r="2" fill="currentColor" />
          <circle cx="26" cy="23" r="2" fill="currentColor" opacity=".4" />
        </>
      ) : nyckel === 'provet' ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="20" cy="22" r="12" />
          <path d="M20 15v7l4.5 3M16 5h8" />
        </g>
      ) : (
        <>
          <g fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M13 11h20M13 20h20M13 29h20" />
          </g>
          <circle cx="7.5" cy="11" r="2" fill="currentColor" />
          <circle cx="7.5" cy="20" r="2" fill="currentColor" />
          <circle cx="7.5" cy="29" r="2" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

export default function Ingang({
  idag,
  plan,
  startSteg,
  forsta,
  efterKonto = null,
}: {
  idag: Dag
  plan: IngangPlan | null
  startSteg: 'test' | 'datum'
  forsta: boolean
  /** Provdatumskärmen efter kontot: ett enda steg, sedan nasta. */
  efterKonto?: { nasta: string } | null
}) {
  const router = useRouter()
  const valen = useMemo(() => synligaVal(), [])
  const sparatVal = mittTestUrPlan(plan)
  const [steg, setSteg] = useState<'test' | 'datum'>(startSteg)
  const [val, setVal] = useState<MittTest | null>(sparatVal && valen.includes(sparatVal) ? sparatVal : null)
  const [kryss, setKryss] = useState<Set<Deltyp>>(() => new Set(kryssUrPlan(plan).filter(deltypSynlig)))
  const [iprovVar, setIprovVar] = useState<IprovVar>(
    (['polis', 'varnplikt', 'officer'] as const).find((v) => v === plan?.mitt_test_variant) ?? 'vet_inte'
  )
  const [matrigmaVar, setMatrigmaVar] = useState<MatrigmaVar>(
    plan?.variant === 'klassisk' || plan?.variant === 'adaptiv' ? plan.variant : 'vet_inte'
  )
  const [datum, setDatum] = useState<string>(plan?.provdatum ?? '')
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  useEffect(() => {
    if (efterKonto && sparatVal) capture('provdatum_skarm_visad', { mitt_test: sparatVal })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Efter kontot: vidare dit kontot var på väg, med eller utan datum. */
  const vidare = () => {
    if (!efterKonto) return
    router.replace(efterKonto.nasta)
  }

  const kryssLista = (): Deltyp[] => {
    const k = DELTYPER.filter((t) => kryss.has(t))
    return k.length ? k : ['matris']
  }
  const baraPersonlighet =
    val === 'personlighet' || (val === 'annat' && kryss.size === 1 && kryss.has('personlighet'))
  const varianten = (): MittVariant | null =>
    val === 'iprov' ? (iprovVar === 'vet_inte' ? null : iprovVar) : val === 'matrigma' && matrigmaVar !== 'vet_inte' ? matrigmaVar : null

  const valjVal = (v: MittTest) => {
    setVal(v)
    setFel(null)
    // Annat eller vet inte börjar med figurer och mönster ikryssat (skissen).
    if (v === 'annat' && kryss.size === 0) setKryss(new Set(['matris']))
  }
  const vaxla = (t: Deltyp) =>
    setKryss((f) => {
      const n = new Set(f)
      if (n.has(t)) n.delete(t)
      else n.add(t)
      return n
    })

  const datumFel = datum && datum < idag ? INGANG.datum.passerat : null
  const planInfo = useMemo(() => (datum && datum >= idag ? plantext(idag, datum) : null), [datum, idag])

  const upplaggRader = useMemo(
    () => (val ? upplagg(val, [...kryss], ovningsprovRad(val, matrigmaVar)) : []),
    [val, kryss, matrigmaVar]
  )

  const spara = async (provdatum: string | null, hoppade: boolean) => {
    if (sparar || !val) return
    setSparar(true)
    setFel(null)
    const p = planFranVal(val, varianten(), kryssLista())
    const kropp = { ...p, provdatum }
    try {
      const svar = await fetch('/api/traning/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kropp),
      })
      if (!svar.ok) throw new Error(String(svar.status))
      // Valet följer med till betalväggens händelser (provkalla.ts).
      sparaKontokalla({ mitt_test: p.mitt_test })
      if (provdatum) {
        capture('provdatum_satt', {
          dagar_kvar: dagarMellan(idag, provdatum),
          leverantor: p.leverantor,
          typer: [...p.testtyper, ...p.extra_typer],
          surface: efterKonto ? 'efter_konto' : forsta ? 'ingang' : 'installningar',
          mitt_test: p.mitt_test,
          variant: p.mitt_test_variant,
        })
      } else if (hoppade) {
        capture('provdatum_hoppat_over', efterKonto ? { steg: 'efter_konto', mitt_test: p.mitt_test } : { steg: 3 })
      }
      if (efterKonto) {
        vidare()
        return
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
    if (efterKonto) {
      capture('provdatum_hoppat_over', { steg: 'efter_konto', mitt_test: sparatVal })
      vidare()
      return
    }
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
    if (steg === 'test') {
      if (!val) return
      capture('ingang_steg', { steg: 2, val, forsta })
      capture('mitt_test_valt', { val, variant: varianten(), surface: 'ingang', forsta })
      setSteg('datum')
    } else {
      capture('ingang_steg', { steg: 3, val: datum ? 'datum' : 'inget', forsta })
      void spara(datum || null, false)
    }
  }

  const stegNr = steg === 'test' ? 1 : 2
  const totalt = efterKonto ? 1 : 2
  const undertitel = steg === 'test' ? MITT_TEST_COPY.fraga : val ? MITT_TEST_KORT[val].titel : ''

  const primar = efterKonto
    ? INGANG.fortsatt
    : steg === 'datum'
      ? baraPersonlighet
        ? INGANG.datum.knappPersonlighet
        : INGANG.datum.knapp
      : INGANG.fortsatt
  const sparrad = steg === 'test' ? !val : !!datumFel

  const chips: { text: string; dag: Dag }[] = [
    { text: INGANG.datum.chips.vecka, dag: laggTill(idag, 7) },
    { text: INGANG.datum.chips.tvaVeckor, dag: laggTill(idag, 14) },
    { text: INGANG.datum.chips.manad, dag: laggTill(idag, 30) },
  ]

  const kortKlass = (vald: boolean) =>
    `relative flex min-h-[84px] flex-col rounded-[14px] border bg-papper px-3 pb-3 pt-3 text-left ${
      vald ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant'
    }`
  const chipKlass = (vald: boolean) =>
    `inline-flex h-10 items-center rounded-[10px] border bg-papper px-3.5 text-sm font-medium text-ink-1 ${
      vald ? 'border-ink-1 shadow-[inset_0_0_0_1px_var(--ink-1)]' : 'border-kant-stark'
    }`

  return (
    <FlowShell
      title={INGANG.flode}
      step={efterKonto ? 1 : stegNr}
      totalSteps={totalt}
      smal
      onBack={steg === 'datum' && !efterKonto ? () => setSteg('test') : undefined}
      // Efter kontot finns inget steg att backa till: bara krysset, som går vidare.
      utanTillbaka={!!efterKonto}
      onExit={lamna}
      exitLabel={INGANG.stang}
      primaryLabel={primar}
      onPrimary={fortsatt}
      primaryDisabled={sparrad}
      primaryBlockedReason={steg === 'test' && sparrad ? MITT_TEST_COPY.tomt : datumFel ?? fel ?? undefined}
      primaryBusy={sparar}
      busyLabel={INGANG.sparar}
      footerSecondary={
        forsta && !efterKonto ? (
          // Förbi planen (beslut-hemvy 2026-10-11): en länk, aldrig en knapp.
          <Link href={TRANING_RUTT.alla} className={`${LANK} inline-flex min-h-9 items-center`} data-ingang-alla>
            {INGANG.allaTester}
          </Link>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3.5 pb-4" data-steg={steg}>
        <p className="text-xs font-semibold uppercase leading-4 tracking-[.06em] text-ink-3">
          {efterKonto && val ? mittTestNamn(val, varianten()) : INGANG.stegEtikett(stegNr, 2, false)}
          {efterKonto ? null : <span className="sr-only">. {undertitel}</span>}
        </p>

        {steg === 'test' ? (
          <>
            <div className="-mt-2.5">
              <h1 className="font-display text-[26px] font-bold leading-[30px] tracking-[-.02em] text-ink-1">{MITT_TEST_COPY.fraga}</h1>
              <p className="mt-1.5 text-meta text-ink-3">{MITT_TEST_COPY.ledtrad}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Mitt test" data-mitt-test>
              {valen.map((v) => {
                const vald = val === v
                return (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={vald}
                    onClick={() => valjVal(v)}
                    className={kortKlass(vald)}
                    data-val={v}
                  >
                    <span className="block pr-5 text-[15px] font-semibold leading-[19px] text-ink-1">{MITT_TEST_KORT[v].titel}</span>
                    <span className="mt-1 block text-xs leading-4 text-ink-3">{MITT_TEST_KORT[v].rad}</span>
                    {vald ? (
                      <span aria-hidden="true" className="absolute right-3 top-3 h-4 w-4 rounded-full bg-ink-1" />
                    ) : null}
                  </button>
                )
              })}
            </div>

            {val === 'iprov' ? (
              <div className="px-0.5">
                <p className="text-[13px] font-semibold leading-[18px] text-ink-2">{MITT_TEST_COPY.variantRubrik}</p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={MITT_TEST_COPY.variantRubrik}>
                  {IPROV_VAR.map((v) => (
                    <button key={v} type="button" role="radio" aria-checked={iprovVar === v} onClick={() => setIprovVar(v)} className={chipKlass(iprovVar === v)}>
                      {MITT_TEST_COPY.iprovVariant[v === 'vet_inte' ? 'vetInte' : v]}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-4 text-ink-3">{MITT_TEST_COPY.iprovVariantMeta}</p>
              </div>
            ) : null}

            {val === 'matrigma' ? (
              <div className="px-0.5">
                <p className="text-[13px] font-semibold leading-[18px] text-ink-2">{INGANG.leverantor.variantRubrik}</p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={INGANG.leverantor.variantRubrik}>
                  {MATRIGMA_VAR.map((v) => (
                    <button key={v} type="button" role="radio" aria-checked={matrigmaVar === v} onClick={() => setMatrigmaVar(v)} className={chipKlass(matrigmaVar === v)}>
                      {INGANG.leverantor.variant[v === 'vet_inte' ? 'vetInte' : v]}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-4 text-ink-3">{INGANG.leverantor.variantMeta}</p>
              </div>
            ) : null}

            {val === 'lokforare' ? (
              <p className="flex items-start gap-2.5 rounded-xl border border-kant bg-papper px-3.5 py-2.5 text-meta text-ink-1" data-lokforare>
                <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-koppar" />
                {MITT_TEST_COPY.lokforare}
              </p>
            ) : null}

            {val === 'annat' ? (
              <div className="px-0.5" data-kryss>
                <p className="text-[13px] font-semibold leading-[18px] text-ink-2">{MITT_TEST_COPY.kryssFraga}</p>
                <p className="mt-0.5 text-xs leading-4 text-ink-3">{MITT_TEST_COPY.kryssLedtrad}</p>
                <div className="mt-2.5 flex flex-col gap-2" role="group" aria-label={MITT_TEST_COPY.kryssFraga}>
                  {DELTYPER.filter(deltypSynlig).map((t) => {
                    const vald = kryss.has(t)
                    return (
                      <button
                        key={t}
                        type="button"
                        role="checkbox"
                        aria-checked={vald}
                        onClick={() => vaxla(t)}
                        className="flex min-h-11 items-center gap-3 rounded-xl border border-kant bg-papper px-3.5 text-left text-[15px] text-ink-1"
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border ${vald ? 'border-ink-1 bg-ink-1 text-papper' : 'border-kant-stark bg-papper'}`}
                        >
                          {vald ? (
                            <svg viewBox="0 0 20 20" width="16" height="16">
                              <path d="M5.5 10.5l3 3L14.5 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                        {DELTYP_NAMN[t]}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {val && val !== 'annat' && upplaggRader.length ? (
              <section className="rounded-2xl border border-kant bg-papper px-4 pb-1 pt-3.5" aria-labelledby="upplagg-rubrik" data-upplagg>
                <h2 id="upplagg-rubrik" className="text-ey uppercase text-ink-3">
                  {MITT_TEST_COPY.upplaggRubrik}
                </h2>
                <ul className="mt-1 list-none p-0">
                  {upplaggRader.map((r, i) => (
                    <li key={r.nyckel} className={`flex items-start gap-3 py-2.5 ${i > 0 ? 'border-t border-kant' : ''}`}>
                      <SymUpplagg nyckel={r.nyckel} />
                      <span className="min-w-0">
                        <span className="block text-[15px] font-semibold leading-[19px] text-ink-1">{r.titel}</span>
                        <span className="mt-0.5 block text-[13px] leading-[18px] text-ink-3">{r.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <p className="px-1 text-xs leading-4 text-ink-3">{INGANG.leverantor.varumarke}</p>
          </>
        ) : null}

        {steg === 'datum' ? (
          <>
            <div className="-mt-2.5">
              <h1 className="font-display text-[26px] font-bold leading-[30px] tracking-[-.02em] text-ink-1">
                {baraPersonlighet ? INGANG.datum.fragaPersonlighet : INGANG.datum.fraga}
              </h1>
              <p className="mt-1.5 text-meta text-ink-3">{baraPersonlighet ? INGANG.datum.ledtradPersonlighet : INGANG.datum.ledtrad}</p>
            </div>
            {efterKonto && val === 'iprov' ? (
              <div className="px-0.5" data-variant>
                <p className="text-[13px] font-semibold leading-[18px] text-ink-2">{MITT_TEST_COPY.variantRubrik}</p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={MITT_TEST_COPY.variantRubrik}>
                  {IPROV_VAR.map((v) => (
                    <button key={v} type="button" role="radio" aria-checked={iprovVar === v} onClick={() => setIprovVar(v)} className={chipKlass(iprovVar === v)}>
                      {MITT_TEST_COPY.iprovVariant[v === 'vet_inte' ? 'vetInte' : v]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
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
              {efterKonto ? (
                <button type="button" className={`${LANK} min-h-11 text-left`} disabled={sparar} onClick={() => (val === 'iprov' && iprovVar !== 'vet_inte' ? void spara(null, true) : void lamna())} data-hoppa-over>
                  {INGANG.datum.ingetDatum}
                </button>
              ) : (
                <button type="button" className={`${LANK} min-h-11 text-left`} disabled={sparar} onClick={() => void spara(null, true)}>
                  {INGANG.datum.hoppaOver}
                </button>
              )}
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
