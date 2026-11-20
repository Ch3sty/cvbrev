'use client'

/**
 * Tester, omgång 3 (skissens Main och Mobil-tester): samma vägg som Hem och
 * Din utveckling (sidan skickar den som `vagg`), och golvet:
 *
 *   Panelen      provets del överst med plan (Det här prövar <provet>),
 *                annars dagens typ: brädet, nivån, mätaren och Välj hur du
 *                vill öva (Träna, mönstret, Nivåkollen, övningsprovet och
 *                nivåtesten)
 *   Rutnätet     Fler testtyper (eller Alla testtyper) som kort med scen,
 *                nivå och handling; ett tryck öppnar startarket
 *   Gratisraden  som förut
 *
 * Komponenten äger det öppna startarket och ?typ= i adressen
 * (history.replaceState). Menyerna ligger i sidans data, så att öppna ett
 * startark kostar inget nätverksanrop. Sidan ritas likadant i appens ram
 * (/app/tester/alla).
 */

import Link from 'next/link'
import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react'
import { KNAPP_PRIMAR_SMAL } from '@/components/shell/knappar'
import { SALD_PLAN } from '@/lib/plans/plans'
import { kopstegHref } from '@/lib/onboarding/steps'
import { TESTER_HREF } from '@/lib/tester/v4/rutter'
import type { TestTypId, TesterV4Data } from '@/lib/tester/v4/typer'
import { arTestTypId } from '@/lib/tester/v4/typer'
import { kortDatumV } from '@/lib/tester/v4/vagen'
import { LasProvider } from './LasKontext'
import TypMenyPanel from './TypMenyPanel'
import { TESTER } from './copy'
import SattAttOva from '@/components/tester-v4/omgang3/SattAttOva'
import TypKort3, { PersonlighetKort3 } from '@/components/tester-v4/omgang3/TypKort3'
import { Lucka, Matare3, matareEtikett, TypBrade, VantarChip } from '@/components/tester-v4/omgang3/delar'
import { kvarTillProvet, tal1, ZON_TEXT, zonFor } from '@/components/tester-v4/omgang3/matt'

/** Rutnätet: två kort på telefonen, fyra från 1280 px. */
export function rutnatKlass(): string {
  return 't3-typer'
}

function satt(typ: TestTypId | null) {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (typ) url.searchParams.set('typ', typ)
    else url.searchParams.delete('typ')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  } catch {
    // Adressen är en bekvämlighet; arket fungerar utan den.
  }
}

function GratisRad({ gratis }: { gratis: TesterV4Data['gratis'] }) {
  if (gratis.premium) return null
  const kvar = gratis.grundKvarIdag > 0
  return (
    <section aria-label={kvar ? TESTER.gratis.rubrikKvar : TESTER.gratis.rubrikSlut} data-gratisrad={kvar ? 'kvar' : 'slut'} className="t3-radk t3-gratis">
      <span className="t3-radk-text">
        <b>{kvar ? TESTER.gratis.rubrikKvar : TESTER.gratis.rubrikSlut}</b>
        <small>{TESTER.gratis.text(kvar, gratis.pris.prisrad, gratis.pris.namn)}</small>
      </span>
      <Link href={kopstegHref(SALD_PLAN, 'testniva')} className={`${KNAPP_PRIMAR_SMAL} shrink-0`}>
        {gratis.pris.knapp || TESTER.gratis.knapp}
      </Link>
    </section>
  )
}

function Planpanel({ data, typ }: { data: TesterV4Data; typ: TestTypId }) {
  const kort = data.typer.find((k) => k.id === typ)
  const meny = data.menyer[typ]
  if (!kort || !meny) return null
  const plan = data.plan
  const iPlan = !!plan && kort.ingarIPlan
  const lage = kort.niva
  const matt = lage.status === 'matt' && lage.niva != null
  const v = matt ? (lage.niva as number) : null
  const kvar = v != null ? kvarTillProvet(v) : null
  const chip = iPlan && plan ? (plan.typer.length === 1 ? 'Enda delen i provet' : `En av ${plan.typer.length} delar i provet`) : null
  const ogon = iPlan && plan ? `Det här prövar ${plan.namn}` : 'Dagens träning'
  const fot = [
    'Skalan går från 1 till 10.',
    kort.senasteNivakoll ? `Senaste Nivåkollen ${kortDatumV(kort.senasteNivakoll)}` : null,
    kort.antalTraningar ? `${kort.antalTraningar} ${kort.antalTraningar === 1 ? 'träning' : 'träningar'}` : null,
  ]
  const fotText = fot[1] || fot[2] ? `${fot[0]} ${[fot[1], fot[2]].filter(Boolean).join(', ')}.` : fot[0]

  return (
    <section className="t3-panel t3-planpanel" data-panel3 aria-labelledby="t3-planpanel-rubrik" data-planpanel={typ}>
      <div className="t3-plan-vanster">
        <div>
          <p className="t3-ogon-golv">{ogon}</p>
          <h2 id="t3-planpanel-rubrik" className="t3-h2">
            {kort.namn}
          </h2>
        </div>
        <div className="t3-plan-niva">
          <span className="hidden xl:block">
            <TypBrade typ={typ} storlek={132} />
          </span>
          <span className="xl:hidden">
            <TypBrade typ={typ} storlek={92} />
          </span>
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            {chip ? <span className="t3-ingar">{chip}</span> : null}
            {v != null ? (
              <div className="flex items-end gap-2.5">
                <span className="t3-stortal">{tal1(v)}</span>
                <b className="pb-[3px] text-[15px] font-semibold leading-5">{ZON_TEXT[zonFor(v)]}</b>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Lucka bredd={72} hojd={52} etikett="Nivån är inte mätt än" />
                <VantarChip>{lage.status === 'paborjad' ? 'påbörjad' : 'inte mätt än'}</VantarChip>
              </div>
            )}
            <span className="t3-plan-kvar">
              {v != null
                ? kvar != null
                  ? `${tal1(kvar)} kvar till ${iPlan ? 'provets nivå' : 'avancerad nivå'}`
                  : iPlan
                    ? 'På provets nivå'
                    : 'På avancerad nivå eller högre'
                : lage.status === 'paborjad' && lage.svar
                  ? `${lage.svar.besvarade} av ${lage.svar.antal} svar i Nivåkollen`
                  : 'Nivåkollen sätter din nivå'}
            </span>
          </div>
        </div>
        <div className="t3-plan-skala">
          <Matare3 niva={v} etikett={matareEtikett(v)} />
          <div className="t3-matt-etiketter">
            <span>Grund</span>
            <span data-prov>{iPlan ? 'Provets nivå' : 'Avancerad'}</span>
            <span>Expert</span>
          </div>
          <span className="t3-plan-fot">{fotText}</span>
        </div>
      </div>
      <SattAttOva kort={kort} meny={meny} planNamn={plan?.namn ?? null} />
    </section>
  )
}

export default function TesterVy({
  data,
  startTyp = null,
  vagg,
}: {
  data: TesterV4Data
  startTyp?: TestTypId | null
  /** Väggen (omgang3/Vaggen) med Tester aktiv; sidan bygger den på servern. */
  vagg?: ReactNode
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

  useEffect(() => {
    if (startTyp && arTestTypId(startTyp)) setOppen(startTyp)
  }, [startTyp])

  // Länkar till /dashboard/tester/alla?typ=<id> på sidan öppnar startarket direkt.
  const fangaMenyLank = useCallback((e: MouseEvent<HTMLDivElement>) => {
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
  }, [])

  const plan = data.plan
  const synliga = data.typer.filter((k) => k.synlig)
  const panelTyp: TestTypId = plan ? (plan.typer.includes(data.dagens.typ) ? data.dagens.typ : plan.typer[0] ?? data.dagens.typ) : data.dagens.typ
  const ovriga = synliga.filter((k) => k.id !== panelTyp)
  const iPlanOvriga = plan ? ovriga.filter((k) => k.ingarIPlan) : []
  const utanforPlan = plan ? ovriga.filter((k) => !k.ingarIPlan) : ovriga
  const oppetKort = oppen ? synliga.find((k) => k.id === oppen) ?? data.typer.find((k) => k.id === oppen) : null
  const oppenMeny = oppen ? data.menyer[oppen] : null

  return (
    <LasProvider paket={data.paket} grundKvarIdag={data.gratis.premium ? null : data.gratis.grundKvarIdag}>
      <div className="flex flex-1 flex-col" data-tester-v4 data-plan={plan?.mittTest ?? 'ingen'} onClickCapture={fangaMenyLank}>
        {vagg}
        <div className="t3-golv" data-golv="tester">
          <Planpanel data={data} typ={panelTyp} />
          {iPlanOvriga.length && plan ? (
            <section className="t3-sektion" aria-labelledby="t3-fler-plan">
              <div className="t3-sektion-huvud">
                <h2 id="t3-fler-plan" className="t3-h2">
                  Fler delar i {plan.namn}
                </h2>
              </div>
              <div className="t3-typer">
                {iPlanOvriga.map((k) => (
                  <TypKort3 key={k.id} kort={k} planNamn={plan.namn} vald={oppen === k.id} onOppna={oppna} />
                ))}
              </div>
            </section>
          ) : null}
          <section className="t3-sektion" aria-labelledby="t3-fler">
            <div className="t3-sektion-huvud t3-sektion-huvud-rad">
              <div>
                <h2 id="t3-fler" className="t3-h2">
                  {plan ? 'Fler testtyper' : 'Alla testtyper'}
                </h2>
                <p className="t3-sektion-rad">
                  {plan
                    ? `De här ingår inte i ${plan.namn}, men förekommer i andra rekryteringstest. Tryck på ett test för att välja hur du vill öva.`
                    : 'Tryck på ett test för att välja hur du vill öva.'}
                  <span className="xl:hidden"> Det mörkare fältet i mätaren är provens nivå.</span>
                </p>
              </div>
              <p className="t3-sektion-not hidden xl:block">Det mörkare fältet i mätaren är provens nivå.</p>
            </div>
            <div className="t3-typer">
              {utanforPlan.map((k) => (
                <TypKort3 key={k.id} kort={k} planNamn={plan?.namn ?? null} vald={oppen === k.id} onOppna={oppna} />
              ))}
              <PersonlighetKort3 gjord={data.personlighet.gjord} href={data.personlighet.href} />
            </div>
          </section>
          <GratisRad gratis={data.gratis} />
        </div>
        {oppetKort && oppenMeny ? <TypMenyPanel key={oppetKort.id} kort={oppetKort} meny={oppenMeny} onStang={stang} planNamn={plan?.namn ?? null} /> : null}
      </div>
    </LasProvider>
  )
}
