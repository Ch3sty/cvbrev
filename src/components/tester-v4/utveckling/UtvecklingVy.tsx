'use client'

/**
 * Din utveckling, omgång 3 (skissens Utveckling, Utveckling-fa,
 * Utveckling-ny, Mobil-utveckling och Mobil-utveckling-ny). Samma vägg som
 * Hem och Tester (sidan skickar den som `vagg`), och golvet:
 *
 *   Panelen        Nivån över tid i en testtyp: rubriken med förändringen,
 *                  perioden, typerna, kurvan (kurva3.ts), förklaringen och
 *                  detaljen för vald punkt
 *   Tre kort       Nivån nu, tempot och träningsdagarna på fyra veckor
 *   Mönstren       figurer och mönster: elva regler i fyra steg
 *   Alla testtyper nivån och förändringen per typ, eller Nivåkollen att göra
 *   Historiken     varje test med facit; gratis bara senaste per typ och låset
 *
 * Klient för valen (typ, period, punkt, visa äldre). Första bilden ritas på
 * servern ur samma props, så inget hoppar. ?typ=<id> väljer typen och följer
 * valet med replaceState.
 */

import Link from 'next/link'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { LasChip } from '@/components/traning/HemKlient'
import { DELTYP_NAMN } from '@/lib/traning/mittTest'
import { laggTill, veckodag, type Dag } from '@/lib/traning/datum'
import { TEST_TYP_ORDNING, type TestTypId, type UtvecklingsPunkt, type UtvecklingV4Data } from '@/lib/tester/v4/typer'
import { LAS_CHIP } from '@/lib/tester/v4/copy'
import { menyHref, nivakollHrefV4, omattMeta } from '@/lib/tester/v4/rutter'
import { arSvagt, MONSTER_MIN_SVAR } from '@/lib/tester/v4/monster'
import { kortDatumV, kortVeckodag } from '@/lib/tester/v4/vagen'
import { synligaPunkter, type Period } from './geometri'
import PunktDetalj from './PunktDetalj'
import { UTV } from './copy'
import KurvGraf3 from '@/components/tester-v4/omgang3/KurvGraf3'
import { byggKurva3 } from '@/components/tester-v4/omgang3/kurva3'
import { Lucka, Matare3, matareEtikett, Pips, UppChip, VantarChip } from '@/components/tester-v4/omgang3/delar'
import { forandring4v, kvarTillProvet, nivaPunkter, PROVETS_NIVA, tal1, tempoTal, ZON_TEXT, zonFor } from '@/components/tester-v4/omgang3/matt'

export interface UtvecklingVyProps {
  data: UtvecklingV4Data
  /** Ur ?typ= */
  startTyp?: TestTypId | null
  startPeriod?: Period | null
  /** Förhandsvisningen: en vald punkt vid start. */
  startPunkt?: string | null
  /** Väggen (omgang3/Vaggen) med Din utveckling aktiv; sidan bygger den på servern. */
  vagg?: ReactNode
  /** Dagens typ ur Hem (TesterV4Data.dagens.typ), vald när ?typ= saknas. */
  standardTyp?: TestTypId | null
  /** Banans förslag om övningsprov (TesterV4Data.vaggBana). */
  ovningsprovForslag?: Dag | null
}

const NAMN: Record<TestTypId, string> = Object.fromEntries(TEST_TYP_ORDNING.map((t) => [t, DELTYP_NAMN[t]])) as Record<TestTypId, string>
const KORT_NAMN: Partial<Record<TestTypId, string>> = { deduktiv: 'Deduktiv', spatial: 'Spatial' }
const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']
const versal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const typSmall = (t: TestTypId) => NAMN[t].toLowerCase()

function Mini({ pts, ton }: { pts: { t: number; v: number }[]; ton: 'koppar' | 'indigo' }) {
  if (!pts.length) return null
  // En punkt per dag (den sista), så att samma dag inte ritas som ett lodrätt streck.
  pts = pts.filter((p, i) => i === pts.length - 1 || Math.abs(pts[i + 1].t - p.t) > 0.02)
  const lo = Math.min(...pts.map((p) => p.v)) - 0.4
  const hi = Math.max(...pts.map((p) => p.v), lo + 1.2)
  const X = (t: number) => 3 + t * 90
  const Y = (v: number) => 24 - ((v - lo) / (hi - lo)) * 18
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)} ${Y(p.v).toFixed(1)}`).join('')
  const s = pts[pts.length - 1]
  const farg = ton === 'koppar' ? 'var(--koppar)' : 'var(--sess-indigo)'
  return (
    <svg viewBox="0 0 96 28" width="96" height="28" aria-hidden="true" className="shrink-0">
      {pts.length === 1 ? <path d={`M${X(s.t) - 80} ${Y(s.v)}H${X(s.t) - 8}`} style={{ stroke: 'var(--sess-kant)' }} strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" /> : null}
      {pts.length > 1 ? <path d={d} fill="none" style={{ stroke: farg }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /> : null}
      <circle cx={X(s.t)} cy={Y(s.v)} r="4" style={{ fill: farg }} />
    </svg>
  )
}

function Traningsdagar({ idag, aktiva, ny }: { idag: Dag; aktiva: readonly Dag[]; ny: boolean }) {
  // Fyra veckor, måndag till söndag, den sista veckan till och med söndag efter i dag.
  const vd = (veckodag(idag) + 6) % 7
  const start = laggTill(idag, -vd - 21)
  const dagar = Array.from({ length: 28 }, (_, i) => laggTill(start, i))
  return (
    <span className="t3-dagar28" role="img" aria-label={`Fyra veckor, ${aktiva.length} ${aktiva.length === 1 ? 'dag' : 'dagar'} med träning. I dag är ${kortVeckodag(idag)}.`}>
      {dagar.map((d) => (
        <span key={d} className="t3-dag28" data-a={aktiva.includes(d) ? '' : undefined} data-nu={d === idag ? '' : undefined} data-sen={d > idag || ny ? '' : undefined} />
      ))}
    </span>
  )
}

export default function UtvecklingVy({ data, startTyp = null, startPeriod = null, startPunkt = null, vagg = null, standardTyp = null, ovningsprovForslag = null }: UtvecklingVyProps) {
  const plan = data.plan
  const synliga = data.typer
  const harData = (t: TestTypId) => data.punkter.some((p) => p.typ === t)
  const forval: TestTypId =
    startTyp ?? standardTyp ?? plan?.typer[0] ?? TEST_TYP_ORDNING.find((t) => data.typer.some((x) => x.id === t && x.niva.status === 'matt')) ?? 'matris'
  const [typ, setTyp] = useState<TestTypId>(forval)
  const [period, setPeriod] = useState<Period>(startPeriod && (startPeriod !== 'plan' || plan) ? startPeriod : '4v')
  const [valdId, setValdId] = useState<string | null>(startPunkt)
  const [allaHist, setAllaHist] = useState(false)

  const kort = synliga.find((t) => t.id === typ) ?? synliga[0]
  const lage = kort?.niva
  const punkter = useMemo(() => synligaPunkter(data.punkter, null, data.historikLast), [data.punkter, data.historikLast])

  const bygg = (bredd: 'dator' | 'mellan' | 'mobil') =>
    byggKurva3({ idag: data.idag, plan, provdag: data.provdag, punkter, typ, niva: lage, period, bredd, ovningsprovForslag })
  const dator = bygg('dator')
  const mellan = bygg('mellan')
  const mobil = bygg('mobil')

  // Förvalt: den senaste Nivåkollen i typen visar sin etikett, som i skissen.
  const standardPunkt = [...dator.linje].reverse().find((q) => q.p.slag === 'nivakoll')?.p.id ?? null
  const valdPunkt = valdId ?? standardPunkt
  const vald = punkter.find((p) => p.id === valdPunkt) ?? null

  const sattUrl = useCallback((t: TestTypId) => {
    try {
      const u = new URL(window.location.href)
      u.searchParams.set('typ', t)
      window.history.replaceState(window.history.state, '', u.toString())
    } catch {
      // Adressen är en bekvämlighet; valet står ändå.
    }
  }, [])
  const valjTyp = (t: TestTypId) => {
    setTyp(t)
    setValdId(null)
    sattUrl(t)
  }

  const f4 = lage ? forandring4v(punkter, typ, data.idag, lage) : null
  const v = lage?.status === 'matt' ? lage.niva : null
  const nyAllt = !data.punkter.length
  const linjeLage = dator.lage
  const iPlan = !!plan && plan.typer.includes(typ)
  const tempo = tempoTal(kort?.tempo)
  const aktiva = data.aktivaDagar28 ?? []
  const antalAktiva = aktiva.length

  const rubrik =
    linjeLage === 'fylld' && dator.linje.length
      ? `${NAMN[typ]}: från ${tal1(dator.linje[0].p.niva as number)} till ${tal1(dator.linje.at(-1)!.p.niva as number)}`
      : linjeLage === 'en' && dator.linje[0]
        ? `${NAMN[typ]}: ${tal1(dator.linje[0].p.niva as number)} vid första mätningen`
        : `${NAMN[typ]}: här ritas din kurva`
  const rubrikMobil =
    linjeLage === 'fylld' && dator.linje.length
      ? `Från ${tal1(dator.linje[0].p.niva as number)} till ${tal1(dator.linje.at(-1)!.p.niva as number)}`
      : linjeLage === 'en' && dator.linje[0]
        ? `${tal1(dator.linje[0].p.niva as number)} vid första mätningen`
        : 'Här ritas din kurva'

  const chip =
    linjeLage === 'fylld' && f4 ? (
      <UppChip riktning={f4.riktning} varde={f4.skillnad} svans=" på fyra veckor" />
    ) : linjeLage === 'en' ? (
      <VantarChip>en punkt hittills</VantarChip>
    ) : linjeLage === 'ingen' ? (
      <VantarChip />
    ) : null

  // Historiken: nyast först.
  const hist = [...punkter].sort((a, b) => (a.dag < b.dag ? 1 : a.dag > b.dag ? -1 : 0))
  const histVisas = allaHist ? hist : hist.slice(0, 7)

  // Mönstren i figurer och mönster.
  const monster = data.matrisMonster
  const visaMonster = !!monster?.length && (typ === 'matris' || (!harData(typ) && !plan))
  const monsterAntal = monster?.length ?? 0
  const allaOmott = !!monster && monster.every((m) => m.lage === 'omott')
  const faSvar = !!monster && !allaOmott && monster.every((m) => (m.antal ?? 0) < MONSTER_MIN_SVAR)
  // "Här tappar du mest" bara på de svagaste: högst tre, bland dem med tillräckligt många svar.
  const svagaste = new Set(
    (monster ?? [])
      .filter((m) => arSvagt({ ratt: m.ratt ?? 0, antal: m.antal ?? 0 }))
      .sort((a, b) => (a.ratt ?? 0) / (a.antal || 1) - (b.ratt ?? 0) / (b.antal || 1) || (b.antal ?? 0) - (a.antal ?? 0))
      .slice(0, 3)
      .map((m) => m.family),
  )

  const periodVal: { id: Period; text: string }[] = [
    { id: '4v', text: '4 veckor' },
    ...(plan ? [{ id: 'plan' as Period, text: 'Planen' }] : []),
    { id: 'allt', text: 'Allt' },
  ]

  return (
    <div className="flex flex-1 flex-col" data-vy="din-utveckling">
      {vagg}
      <div className="t3-golv t3-golv-utv" data-golv="utveckling">
        <section className="t3-panel t3-kurvpanel" data-panel3 aria-labelledby="t3-kurva-rubrik" id="utv-graf">
          <div className="t3-kurv-huvud">
            <div className="min-w-0">
              <p className="t3-ogon-golv">Nivån över tid</p>
              <div className="t3-kurv-titel">
                <h2 id="t3-kurva-rubrik" className="t3-h2">
                  <span className="hidden xl:inline">{rubrik}</span>
                  <span className="xl:hidden">{rubrikMobil}</span>
                </h2>
                {chip}
              </div>
            </div>
            {linjeLage === 'fylld' ? (
              <div className="t3-seg hidden xl:inline-flex" role="group" aria-label="Period">
                {periodVal.map((p) => (
                  <button key={p.id} type="button" aria-pressed={period === p.id} onClick={() => setPeriod(p.id)}>
                    {p.text}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="t3-valrad" role="group" aria-label="Testtyp">
            {synliga.map((t) => (
              <button key={t.id} type="button" className="t3-val" aria-pressed={typ === t.id} onClick={() => valjTyp(t.id)} data-typ-val={t.id}>
                {typ === t.id || (harData(t.id) && linjeLage === 'en') ? <span className="t3-val-prick" data-ton={typ === t.id ? 'koppar' : 'indigo'} /> : null}
                <span className="hidden xl:inline">{t.id === 'matris' ? NAMN[t.id] : KORT_NAMN[t.id] ?? NAMN[t.id]}</span>
                <span className="xl:hidden">{KORT_NAMN[t.id] ?? NAMN[t.id]}</span>
              </button>
            ))}
          </div>
          <div className="hidden xl:block">
            <KurvGraf3 k={dator} typ={typ} namn={NAMN[typ]} niva={lage} valdId={valdPunkt} onValj={setValdId} idPrefix="dator" detaljId="utv-detalj" />
          </div>
          <div className="hidden md:block xl:hidden">
            <KurvGraf3 k={mellan} typ={typ} namn={NAMN[typ]} niva={lage} valdId={valdPunkt} onValj={setValdId} idPrefix="mellan" detaljId="utv-detalj" />
          </div>
          <div className="md:hidden">
            <KurvGraf3 k={mobil} typ={typ} namn={NAMN[typ]} niva={lage} valdId={valdPunkt} onValj={setValdId} idPrefix="mobil" detaljId="utv-detalj" />
          </div>
          <div className="t3-legend">
            <span>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="5.5" style={{ fill: 'var(--papper)', stroke: 'var(--koppar)' }} strokeWidth="3" />
              </svg>
              Nivåkoll
            </span>
            <span>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="5" style={{ fill: 'var(--koppar)' }} />
              </svg>
              Träning
            </span>
            <span>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2.5" y="2.5" width="11" height="11" rx="2.5" style={{ fill: 'var(--t3-streck)' }} />
              </svg>
              Övningsprov
            </span>
            <span className="hidden xl:inline-flex">
              <span className="t3-legend-band" />
              Mätningens osäkerhet
            </span>
            <span className="t3-legend-hoger hidden xl:inline">
              {linjeLage === 'ingen' ? 'Så ritas kurvan. Varje punkt går att öppna och se uppgifterna bakom.' : 'Tryck på en punkt och se uppgifterna bakom den.'}
            </span>
          </div>
          {linjeLage === 'fylld' ? (
            <div className="t3-seg t3-seg-mobil xl:hidden" role="group" aria-label="Period">
              {periodVal.map((p) => (
                <button key={p.id} type="button" aria-pressed={period === p.id} onClick={() => setPeriod(p.id)}>
                  {p.text}
                </button>
              ))}
            </div>
          ) : null}
          {linjeLage !== 'ingen' ? (
            <div id="utv-detalj" aria-live="polite" className="t3-detalj">
              <PunktDetalj punkt={vald} namn={NAMN} />
            </div>
          ) : null}
          {data.historikLast && !nyAllt ? (
            <div className="t3-las-rad" data-historik-las>
              <span>{UTV.graf.historikLast}</span>
              <LasChip feature="tests_above_base" plats="historik" text={LAS_CHIP.premium} label={`${UTV.graf.historikLast}. ${LAS_CHIP.premium}`} />
            </div>
          ) : null}
        </section>

        <div className="t3-stat-rutnat">
          <div className="t3-kort t3-stat t3-stat-niva" data-stat="niva">
            <div className="t3-matare-topp">
              <p className="t3-ogon-matt">Nivån nu</p>
              {v == null ? <VantarChip /> : null}
            </div>
            <div className="t3-stat-tal">
              {v != null ? <span className="t3-tal48">{tal1(v)}</span> : <Lucka bredd={60} hojd={42} etikett="Nivån är inte mätt än" />}
              <span>{v != null ? ZON_TEXT[zonFor(v)] : 'på skalan 1 till 10'}</span>
            </div>
            <Matare3 niva={v} etikett={matareEtikett(v)} provZon={iPlan || v != null} />
            <p className="t3-stat-rad">
              {v != null
                ? `${linjeLage === 'en' ? 'En mätning hittills. ' : ''}${kvarTillProvet(v) != null ? `${tal1(kvarTillProvet(v) as number)} kvar till ${iPlan ? 'provets nivå' : 'Avancerad'}, som börjar på ${tal1(PROVETS_NIVA)}.` : iPlan ? 'Du ligger på provets nivå.' : 'Du ligger på avancerad nivå eller högre.'}`
                : 'Grund, Avancerad eller Expert. Nivåkollen visar var du börjar.'}
            </p>
          </div>
          <div className="t3-kort t3-stat" data-stat="tempo">
            <div className="t3-matare-topp">
              <p className="t3-ogon-matt">Tempot</p>
              {tempo ? null : <VantarChip />}
            </div>
            <div className="t3-stat-tal">
              {tempo ? <span className="t3-tal48">{`${tempo.procent} %`}</span> : <Lucka bredd={60} hojd={42} etikett="Tempot är inte mätt än" />}
              <span>{tempo ? 'inom provets tid' : 'inom uppgiftens tid'}</span>
            </div>
            {tempo ? (
              <span className="t3-tempo-bar" role="img" aria-label={`${tempo.inom} av ${tempo.antal} svar inom provets tid, ${tempo.over} över`}>
                <span style={{ width: `${tempo.procent}%` }} />
                <span />
              </span>
            ) : (
              <span className="t3-tempo-bar" data-tom aria-hidden="true">
                <span style={{ width: '72%' }} />
                <span />
              </span>
            )}
            <p className="t3-stat-rad xl:hidden">{tempo ? 'av svaren inom provets tid' : 'av svaren inom uppgiftens tid, från första testet'}</p>
            <p className="t3-stat-rad hidden xl:block">
              {tempo ? `${tempo.over} av dina ${tempo.antal} svar senaste månaden tog längre än ${tempo.tid}, provets tid per uppgift.` : 'Hur stor del av svaren du hinner inom tiden. Räknas från första testet.'}
            </p>
          </div>
          <div className="t3-kort t3-stat" data-stat="dagar">
            <p className="t3-ogon-matt">Träningsdagar</p>
            <div className="t3-stat-dagar">
              <div className="t3-stat-tal">
                <span className="t3-tal48" data-noll={antalAktiva === 0 ? '' : undefined}>
                  {antalAktiva}
                </span>
                <span>dagar på fyra veckor</span>
              </div>
              <Traningsdagar idag={data.idag} aktiva={aktiva} ny={antalAktiva === 0} />
            </div>
            <p className="t3-stat-rad">{antalAktiva === 0 ? 'I dag kan bli den första. En dag räknas när du har slutfört ett test.' : `${versal(ORD[antalAktiva] ?? String(antalAktiva))} ${antalAktiva === 1 ? 'dag' : 'dagar'} med minst ett slutfört test.`}</p>
          </div>
        </div>

        {visaMonster && monster ? (
          <section className="t3-sektion" aria-labelledby="t3-monster">
            <div className="t3-sektion-huvud t3-sektion-huvud-rad">
              <div>
                <h2 id="t3-monster" className="t3-h2">
                  Mönstren i figurer och mönster
                </h2>
                <p className="t3-sektion-rad">
                  {`${versal(ORD[monsterAntal] ?? String(monsterAntal))} regler återkommer i proven. `}
                  {allaOmott ? 'Här ser du hur långt du har kommit med var och en.' : faSvar ? `En regel bedöms först efter ${ORD[MONSTER_MIN_SVAR]} svar, så här långt är du.` : 'Så långt har du kommit med var och en.'}
                </p>
              </div>
              {!allaOmott && !faSvar ? (
                <div className="t3-monster-legend hidden xl:flex" aria-hidden="true">
                  <span><i data-l="omott" />Inte mött</span>›<span><i data-l="mott" />Mött</span>›<span><i data-l="saker" />Säker</span>›<span><i data-l="snabb" />Snabb</span>
                </div>
              ) : faSvar ? (
                <p className="t3-monster-legend hidden xl:flex">
                  <Pips ratt={1} antal={2} tomma={1} /> rätt, fel och svar som återstår till {ORD[MONSTER_MIN_SVAR]}
                </p>
              ) : null}
            </div>
            {allaOmott ? (
              <div className="t3-kort t3-monster-ny">
                <div className="t3-monster-steg">
                  {(
                    [
                      { l: 'omott', b: 'Inte mött', s: 'Regeln har inte kommit än' },
                      { l: 'mott', b: 'Mött', s: 'Du har svarat på regeln' },
                      { l: 'saker', b: 'Säker', s: 'Du svarar oftast rätt' },
                      { l: 'snabb', b: 'Snabb', s: 'Rätt och inom tiden' },
                    ] as const
                  ).map((x) => (
                    <div key={x.l} className="t3-mon" data-l={x.l}>
                      <i>
                        <MonIkon l={x.l} />
                      </i>
                      <span>
                        <b>{x.b}</b>
                        <small>{x.s}</small>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="t3-ogon-matt mt-4">Alla {ORD[monsterAntal] ?? monsterAntal} börjar som inte mötta</p>
                <div className="t3-regler">
                  {monster.map((m) => (
                    <span key={m.family} className="t3-regel">
                      {m.namn}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="t3-monster-rutnat">
                {monster.map((m) => {
                  const svag = svagaste.has(m.family)
                  const fa = (m.antal ?? 0) < MONSTER_MIN_SVAR && m.lage !== 'omott'
                  const rad =
                    m.lage === 'omott'
                      ? 'Inte mött än'
                      : fa
                        ? null
                        : svag
                          ? `Här tappar du mest · ${m.ratt} av ${m.antal}`
                          : `${m.lage === 'snabb' ? 'Snabb' : m.lage === 'saker' ? 'Säker' : 'Mött'} · ${m.ratt ?? 0} av ${m.antal ?? 0} rätt`
                  const inne = (
                    <>
                      <i>
                        <MonIkon l={m.lage} andel={m.antal ? (m.ratt ?? 0) / m.antal : 0} />
                      </i>
                      <span className="min-w-0">
                        <b>{m.namn}</b>
                        {fa ? (
                          <small className="t3-mon-fa">
                            <Pips ratt={m.ratt ?? 0} antal={m.antal ?? 0} tomma={Math.max(0, MONSTER_MIN_SVAR - (m.antal ?? 0))} />
                            <span className="hidden xl:inline">
                              {m.antal} av {MONSTER_MIN_SVAR} svar
                            </span>
                          </small>
                        ) : (
                          <small data-svag={svag ? '' : undefined}>{rad}</small>
                        )}
                      </span>
                    </>
                  )
                  return data.gratis.premium && m.lage !== 'omott' ? (
                    <Link key={m.family} href={m.href} className="t3-mon" data-l={m.lage} data-svag={svag ? '' : undefined} aria-label={`${UTV.monster.tranaAria(m.namn)}, ${rad ?? `${m.antal} av ${MONSTER_MIN_SVAR} svar`}`}>
                      {inne}
                    </Link>
                  ) : (
                    <div key={m.family} className="t3-mon" data-l={m.lage} data-svag={svag ? '' : undefined}>
                      {inne}
                    </div>
                  )
                })}
              </div>
            )}
            {faSvar ? <p className="t3-sektion-rad mt-3">För få svar för att säga var du är säker eller tappar. Det kommer med träningen.</p> : null}
            {!data.gratis.premium && !allaOmott ? (
              <div className="t3-las-rad">
                <span>{UTV.monster.las}</span>
                <LasChip feature="tests_above_base" plats="riktat" text={LAS_CHIP.premium} label={`${UTV.monster.las}. ${LAS_CHIP.premium}`} />
              </div>
            ) : null}
          </section>
        ) : null}

        <div className="t3-tva">
          <section className="t3-kort t3-lista" aria-labelledby="t3-alla">
            <div className="t3-lista-huvud">
              <h2 id="t3-alla" className="t3-h2s">
                Alla testtyper
              </h2>
              <p>{nyAllt ? 'Varje typ får sin nivå med en egen Nivåkoll.' : 'Nivån nu och förändringen på fyra veckor.'}</p>
            </div>
            {synliga.map((t) => {
              const tl = t.niva
              const pts = nivaPunkter(punkter, t.id)
                .filter((p) => p.dag >= laggTill(data.idag, -27))
                .map((p) => ({ t: Math.max(0, Math.min(1, 1 - (Date.parse(data.idag) - Date.parse(p.dag)) / (27 * 86400000))), v: p.niva as number }))
              const ff = forandring4v(punkter, t.id, data.idag, tl)
              const nk = nivakollHrefV4(t.id) ?? menyHref(t.id)
              return (
                <div key={t.id} className="t3-rad" data-rad-typ={t.id}>
                  <b className="flex-1">{t.namn}</b>
                  {tl.status === 'matt' && tl.niva != null ? (
                    <>
                      <span className="hidden xl:block">
                        <Mini pts={pts.length ? pts : [{ t: 1, v: tl.niva }]} ton={plan?.typer.includes(t.id) ? 'koppar' : 'indigo'} />
                      </span>
                      <span className="t3-rad-niva">{tal1(tl.niva)}</span>
                      <span className="t3-rad-forr" data-ton={ff?.riktning ?? 'ny'}>
                        {ff ? (ff.riktning === 'oforandrad' ? 'lika' : `${ff.riktning} ${tal1(Math.abs(ff.skillnad))}`) : 'ny'}
                      </span>
                    </>
                  ) : tl.status === 'paborjad' && tl.svar ? (
                    <span className="t3-rad-meta">
                      <span className="hidden xl:inline">{`Nivåkoll påbörjad, ${tl.svar.besvarade} av ${tl.svar.antal} svar`}</span>
                      <span className="xl:hidden">Nivåkoll påbörjad</span>
                    </span>
                  ) : nyAllt || !harData(t.id) ? (
                    <>
                      {nyAllt && t.id === (standardTyp ?? 'matris') ? <span className="t3-borja">börja här</span> : null}
                      <Link href={nk} className="t3-rad-lank">
                        {omattMeta(t.id)}
                      </Link>
                    </>
                  ) : (
                    <span className="t3-rad-meta">Inte mätt än</span>
                  )}
                </div>
              )
            })}
          </section>

          <section className="t3-kort t3-lista" aria-labelledby="t3-hist">
            <div className="t3-lista-huvud">
              <h2 id="t3-hist" className="t3-h2s">
                Historiken
              </h2>
              <p>{nyAllt ? 'Här hamnar varje test du gör. Varje rad öppnar uppgifterna med facit.' : 'Varje rad öppnar uppgifterna med facit.'}</p>
            </div>
            {nyAllt ? (
              <div className="t3-hist-exempel">
                <p className="t3-ogon-matt">Så ser en rad ut</p>
                <div className="t3-rad" aria-hidden="true">
                  <span className="t3-rad-dag">i dag</span>
                  <span className="flex-1">
                    <b>Nivåkoll</b>, {typSmall(standardTyp ?? 'matris')}
                  </span>
                  <span className="t3-rad-fraga">?</span>
                </div>
                <div className="t3-rad" aria-hidden="true">
                  <span className="t3-rad-dag">i morgon</span>
                  <span className="flex-1">
                    <b>Träning</b>, {typSmall(standardTyp ?? 'matris')}
                  </span>
                  <span className="t3-rad-fraga">?</span>
                </div>
                <p className="t3-stat-rad hidden xl:block">Datum, vad du gjorde, rätt och fel per uppgift och nivån efteråt.</p>
              </div>
            ) : (
              <>
                {histVisas.map((p) => (
                  <HistRad key={p.id} p={p} />
                ))}
                {hist.length > 7 ? (
                  <div className="t3-rad justify-center">
                    <button type="button" className="t3-visa-aldre" aria-expanded={allaHist} onClick={() => setAllaHist((a) => !a)}>
                      {allaHist ? 'Visa färre' : 'Visa äldre'}
                    </button>
                  </div>
                ) : hist.length <= 3 ? (
                  <p className="t3-rad t3-stat-rad">Det här är allt hittills. Nästa rad kommer med nästa test.</p>
                ) : null}
                {data.historikLast ? (
                  <div className="t3-las-rad t3-las-rad-lista" data-last-rad>
                    <span>{UTV.resultat.historikLast}</span>
                    <LasChip feature="tests_above_base" plats="historik" text={LAS_CHIP.premium} label={`${UTV.resultat.historikLast}. ${LAS_CHIP.premium}`} />
                  </div>
                ) : null}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function HistRad({ p }: { p: UtvecklingsPunkt }) {
  const slag = p.slag === 'ovningsprov' ? 'Övningsprov' : p.kalla === 'nivatest' ? 'Nivåtest' : p.slag === 'nivakoll' ? 'Nivåkoll' : 'Träning'
  const vad = p.slag === 'ovningsprov' ? (p.provNamn ?? '').replace(/^Övningsprov\s*/, '') : typSmall(p.typ)
  const inne = (
    <>
      <span className="t3-rad-dag">
        <span className="hidden xl:inline">{`${kortVeckodag(p.dag)} ${kortDatumV(p.dag)}`}</span>
      </span>
      <span className="t3-rad-vad">
        <span>
          <b>{slag}</b>
          {vad ? (p.slag === 'ovningsprov' ? ` ${vad}` : `, ${vad}`) : ''}
        </span>
        <small className="xl:hidden">{`${kortVeckodag(p.dag)} ${kortDatumV(p.dag)}${p.slag === 'nivakoll' && p.resultat ? `, ${p.resultat.antal} uppgifter` : ''}`}</small>
      </span>
      {p.slag === 'trana' && p.resultat ? (
        <Pips ratt={p.resultat.ratt} antal={Math.min(p.resultat.antal, 12)} />
      ) : p.slag === 'ovningsprov' && p.resultat ? (
        <span className="t3-rad-prov">{`${p.resultat.ratt} av ${p.resultat.antal} rätt`}</span>
      ) : p.resultat ? (
        <span className="t3-rad-meta hidden xl:inline">{`${p.resultat.antal} uppgifter`}</span>
      ) : null}
      <span className="t3-rad-niva t3-rad-niva-s">{p.slag === 'ovningsprov' ? <small>prov</small> : p.niva != null ? tal1(p.niva) : ''}</span>
    </>
  )
  return p.href ? (
    <Link href={p.href} className="t3-rad t3-rad-lankad" data-hist={p.id}>
      {inne}
    </Link>
  ) : (
    <div className="t3-rad" data-hist={p.id}>
      {inne}
    </div>
  )
}

function MonIkon({ l, andel = 0.5 }: { l: 'omott' | 'mott' | 'saker' | 'snabb'; andel?: number }) {
  if (l === 'snabb')
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 2L5 13.5h5.5L9.5 22 19 10h-6z" />
      </svg>
    )
  if (l === 'saker')
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.5 12.5l5 5L19.5 7" />
      </svg>
    )
  if (l === 'mott') {
    const a = Math.max(0.12, Math.min(0.95, andel)) * 2 * Math.PI
    const x = 12 + 8 * Math.sin(a)
    const y = 12 - 8 * Math.cos(a)
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" fill="none" style={{ stroke: 'var(--sess-kant)' }} strokeWidth="4" />
        <path d={`M12 4A8 8 0 ${a > Math.PI ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
