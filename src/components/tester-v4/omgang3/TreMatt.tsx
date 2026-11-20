/**
 * Så ligger du till (omgång 3, skissens Hem och Hem-ny): tre mått i en panel
 * som överlappar väggen. Nivån i dagens typ med minigrafen och provets nivå,
 * tempot som ring, och senaste övningsprovet (med plan och ett gjort prov)
 * eller dagar i rad. Varje tal ur datan; utan underlag ritas måttet som
 * brädets lucka med "inte mätt än".
 */

import Link from 'next/link'
import { UTVECKLING_HREF } from '@/lib/tester/v4/rutter'
import { nivakollOmfang } from '@/lib/nivakoll/omfang'
import { laggTill, veckodag, veckodagNamn } from '@/lib/traning/datum'
import { kortDatumV, kortVeckodag } from '@/lib/tester/v4/vagen'
import { typNamnSmall } from '@/lib/tester/v4/copy'
import type { TesterV4Data, UtvecklingsPunkt } from '@/lib/tester/v4/typer'
import { Lucka, Rutor, TempoRing, UppChip, VantarChip } from './delar'
import { forandring4v, kvarTillProvet, PROVETS_NIVA, sparPunkter, tal1, tempoTal } from './matt'

const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv']
const versal = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function Minigraf({ pts, bredd, hojd, band }: { pts: { t: number; v: number }[]; bredd: number; hojd: number; band: string }) {
  const bandH = 26
  const lo = Math.min(...pts.map((p) => p.v)) - 0.3
  const hi = Math.max(Math.max(...pts.map((p) => p.v)), lo + 1)
  const X = (t: number) => 6 + t * (bredd - 16)
  const Y = (v: number) => hojd - 12 - ((v - lo) / (hi - lo)) * (hojd - bandH - 26)
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)} ${Y(p.v).toFixed(1)}`).join('')
  const sista = pts[pts.length - 1]
  const forsta = pts[0]
  return (
    <svg viewBox={`0 0 ${bredd} ${hojd}`} width={bredd} height={hojd} aria-hidden="true" className="block min-w-0 flex-1">
      <rect x="0" y="0" width={bredd} height={bandH} rx="8" style={{ fill: 'var(--t3-spar-prov)' }} />
      <text x="10" y="17" fontSize="11" fontWeight="700" style={{ fill: 'var(--sess-rad3-ink)' }}>
        {band}
      </text>
      {pts.length > 1 ? (
        <>
          <path d={`${d}V${hojd}H${X(forsta.t).toFixed(1)}Z`} style={{ fill: 'var(--koppar)' }} opacity=".14" />
          <path className="t3-kurva" d={d} fill="none" style={{ stroke: 'var(--koppar)' }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      <circle cx={X(sista.t)} cy={Y(sista.v)} r="7" style={{ fill: 'var(--koppar)', stroke: 'var(--papper)' }} strokeWidth="3" />
    </svg>
  )
}

function Skala({ bredd, text }: { bredd: number; text: string }) {
  const w = (bredd - 12) / 3
  return (
    <svg viewBox={`0 0 ${bredd} 96`} width={bredd} height={96} role="img" aria-label="Skalan går från 1 till 10 i tre zoner: Grund 1 till 4, Avancerad 4 till 7 och Expert 7 till 10." className="block min-w-0 flex-1">
      <rect x="0" y="0" width={bredd} height="26" rx="8" style={{ fill: 'var(--t3-spar-prov)' }} />
      <text x="10" y="17" fontSize="11" fontWeight="700" style={{ fill: 'var(--sess-rad3-ink)' }}>
        {text}
      </text>
      <g fontSize="11" fontWeight="600" style={{ fill: 'var(--ink-2)' }}>
        <text x="6" y="52">Grund</text>
        <text x={6 + w + 3} y="52">Avancerad</text>
        <text x={6 + 2 * (w + 3)} y="52">Expert</text>
      </g>
      <rect x="6" y="60" width={w} height="14" rx="5" style={{ fill: 'var(--t3-spar)' }} />
      <rect x={6 + w + 3} y="60" width={w} height="14" rx="5" style={{ fill: 'var(--sess-kant)' }} />
      <rect x={6 + 2 * (w + 3)} y="60" width={w} height="14" rx="5" style={{ fill: 'var(--ljus)' }} opacity=".7" />
      <g fontSize="11" fontWeight="600" style={{ fill: 'var(--ink-3)' }} textAnchor="middle">
        <text x="8" y="91">1</text>
        <text x={6 + w + 1.5} y="91">4</text>
        <text x={6 + 2 * w + 4.5} y="91">7</text>
        <text x={bredd - 12} y="91">10</text>
      </g>
    </svg>
  )
}

/** Veckan måndag till söndag: gjorda dagar i koppar, i dag med kopparkant. */
export function Veckorad({ idag, aktiva }: { idag: string; aktiva: readonly string[] }) {
  const vd = (veckodag(idag) + 6) % 7
  const mandag = laggTill(idag, -vd)
  const dagar = Array.from({ length: 7 }, (_, i) => laggTill(mandag, i))
  const gjorda = dagar.filter((d) => aktiva.includes(d))
  return (
    <span className="t3-vecka" role="img" aria-label={`Den här veckan: ${gjorda.length ? `tränat ${gjorda.map(veckodagNamn).join(', ')}` : 'ingen dag gjord än'}. I dag är ${veckodagNamn(idag)}.`}>
      {dagar.map((d) => (
        <span key={d} className="t3-vecka-dag" data-idag={d === idag ? '' : undefined}>
          <span className="t3-vecka-ruta" data-gjord={aktiva.includes(d) ? '' : undefined} />
          <small>{d === idag ? 'i dag' : kortVeckodag(d)}</small>
        </span>
      ))}
    </span>
  )
}

export default function TreMatt({ data }: { data: TesterV4Data }) {
  const { plan, idag } = data
  const typ = data.dagens.typ
  const kort = data.typer.find((t) => t.id === typ)
  const lage = kort?.niva
  const matt = lage?.status === 'matt' && lage.niva != null
  const omfang = nivakollOmfang(typ)
  const typSmall = typNamnSmall(typ)
  const iPlan = !!plan && plan.typer.includes(typ)
  const forand = lage ? forandring4v(data.kurva, typ, idag, lage) : null
  const pts = sparPunkter(data.kurva, typ, idag)
  const tempo = tempoTal(kort?.tempo)
  const provTyp = plan?.typer[0] ?? null
  const senasteProv: UtvecklingsPunkt | null = provTyp ? data.menyer[provTyp]?.senaste.prov.at(-1) ?? null : null
  const nastaProv = data.vaggBana.find((n) => n.forslag === 'ovningsprov')?.dag ?? null
  const nyIngen = !matt && data.dagens.forstaSteget
  const rubrik = nyIngen ? 'Tre mått som väntar på din första mätning' : plan ? `Tre mått inför ${plan.namn}` : 'Tre mått i dina tester'
  const rubrikKort = nyIngen ? 'Tre mått som väntar på dig' : rubrik
  const bandText = iPlan ? `Provets nivå, från ${tal1(PROVETS_NIVA)}` : `Avancerad, från ${tal1(PROVETS_NIVA)}`
  const kvar = matt ? kvarTillProvet(lage!.niva as number) : null
  const n = data.dagsmal.dagarIRad

  const nivaRad = matt ? (
    <p className="t3-matare-rad">
      <b>{kvar != null ? `${tal1(kvar)} kvar till ${iPlan ? 'provets nivå' : 'avancerad nivå'}.` : iPlan ? 'Du ligger på provets nivå.' : 'Du ligger på avancerad nivå eller högre.'}</b>{' '}
      {forand
        ? forand.riktning === 'upp'
          ? `Du har stigit ${tal1(forand.skillnad)} på fyra veckor.`
          : forand.riktning === 'ned'
            ? `Ned ${tal1(Math.abs(forand.skillnad))} på fyra veckor.`
            : 'Oförändrad på fyra veckor.'
        : ''}
    </p>
  ) : lage?.status === 'paborjad' && lage.svar ? (
    <p className="t3-matare-rad">
      <b>Nivåkollen är påbörjad.</b> {lage.svar.besvarade} av {lage.svar.antal} svar, gör klart den så får du nivån.
    </p>
  ) : (
    <p className="t3-matare-rad">
      <b>Nivåkollen sätter din nivå.</b>
      <span className="hidden xl:inline">{omfang ? ` ${versal(ORD[omfang.uppgifter] ?? String(omfang.uppgifter))} uppgifter, cirka ${ORD[omfang.minuter] ?? omfang.minuter} minuter.` : ''}</span>
      <span className="xl:hidden">{omfang ? ` Cirka ${ORD[omfang.minuter] ?? omfang.minuter} minuter.` : ''}</span>
    </p>
  )

  const visaProv = !!plan && !!senasteProv?.resultat

  return (
    <section className="t3-panel t3-panel-matt" data-panel3 aria-labelledby="t3-tremattt">
      <div className="t3-panel-huvud">
        <div>
          <p className="t3-ogon-golv">Så ligger du till</p>
          <h2 id="t3-tremattt" className="t3-h2">
            <span className="hidden xl:inline">{rubrik}</span>
            <span className="xl:hidden">{rubrikKort}</span>
          </h2>
        </div>
        <Link href={UTVECKLING_HREF} className="t3-lank hidden xl:inline-flex" data-ingang="utveckling">
          Hela utvecklingen
        </Link>
      </div>
      <div className="t3-matt-rutnat">
        <div className="t3-matare t3-matare-niva" data-matt="niva">
          <div className="t3-matare-topp">
            <p className="t3-ogon-matt">Nivån i {typSmall}</p>
            {matt && forand && forand.riktning !== 'oforandrad' ? <UppChip riktning={forand.riktning} varde={forand.skillnad} /> : !matt ? <VantarChip>{lage?.status === 'paborjad' ? 'påbörjad' : 'inte mätt än'}</VantarChip> : null}
          </div>
          <div className="t3-matare-mitt">
            {matt ? (
              <>
                <span className="t3-stortal">{tal1(lage!.niva as number)}</span>
                <span className="hidden min-w-0 flex-1 xl:block">
                  <Minigraf pts={pts.length ? pts : [{ t: 1, v: lage!.niva as number }]} bredd={280} hojd={96} band={bandText} />
                </span>
                <span className="block min-w-0 flex-1 xl:hidden">
                  <Minigraf pts={pts.length ? pts : [{ t: 1, v: lage!.niva as number }]} bredd={220} hojd={84} band={bandText} />
                </span>
              </>
            ) : (
              <>
                <Lucka etikett="Nivån är inte mätt än" />
                <span className="hidden min-w-0 flex-1 xl:block">
                  <Skala bredd={280} text="Nivåkollen placerar dig på skalan" />
                </span>
                <span className="block min-w-0 flex-1 xl:hidden">
                  <Skala bredd={220} text="Skalan 1 till 10" />
                </span>
              </>
            )}
          </div>
          {nivaRad}
        </div>

        <div className="t3-matare" data-matt="tempo">
          <div className="t3-matare-topp">
            <p className="t3-ogon-matt">Tempot</p>
            {tempo ? null : <VantarChip />}
          </div>
          <div className="t3-tempo-rad">
            <span className="hidden xl:block">
              <TempoRing procent={tempo?.procent ?? null} storlek={96} />
            </span>
            <span className="xl:hidden">
              <TempoRing procent={tempo?.procent ?? null} storlek={76} />
            </span>
            <span className="t3-tempo-text">{tempo ? 'av svaren inom provets tid' : 'av svaren inom uppgiftens tid'}</span>
          </div>
          <p className="t3-matare-rad hidden xl:block">
            {tempo ? `${tempo.over} av dina ${tempo.antal} svar senaste månaden tog längre än ${tempo.tid}.` : 'Räknas ur dina svar, från första testet.'}
          </p>
          <p className="t3-matare-rad xl:hidden">{tempo ? 'av svaren inom provets tid' : 'av svaren inom uppgiftens tid, från första testet'}</p>
        </div>

        {visaProv && senasteProv?.resultat ? (
          <div className="t3-matare" data-matt="prov">
            <p className="t3-ogon-matt">
              <span className="hidden xl:inline">Senaste övningsprovet</span>
              <span className="xl:hidden">Övningsprovet</span>
            </p>
            <div className="t3-prov-tal">
              <span className="t3-medeltal">{senasteProv.resultat.ratt}</span>
              <span>av {senasteProv.resultat.antal} rätt</span>
            </div>
            <span className="hidden xl:block">
              <Rutor ratt={senasteProv.resultat.ratt} antal={senasteProv.resultat.antal} />
            </span>
            <span className="xl:hidden">
              <Rutor ratt={senasteProv.resultat.ratt} antal={senasteProv.resultat.antal} storlek="liten" />
            </span>
            <p className="t3-matare-rad hidden xl:block">
              Gjort {veckodagNamn(senasteProv.dag)} {kortDatumV(senasteProv.dag)}.{nastaProv ? ` Nästa ligger på ${veckodagNamn(nastaProv)}.` : ''}
            </p>
            <p className="t3-matare-rad xl:hidden">Gjort {kortDatumV(senasteProv.dag)}</p>
          </div>
        ) : (
          <div className="t3-matare" data-matt="irad">
            <p className="t3-ogon-matt">Dagar i rad</p>
            <div className="t3-prov-tal">
              <span className="t3-medeltal" data-noll={n === 0 ? '' : undefined}>
                {n}
              </span>
              <span>{n === 1 ? 'dag i rad' : 'dagar i rad'}</span>
            </div>
            <Veckorad idag={idag} aktiva={data.aktivaDagar} />
            <p className="t3-matare-rad">
              {n === 0 ? (
                <>
                  <b>I dag kan bli dag 1.</b>
                  <span className="hidden xl:inline"> En dag räknas när du har slutfört ett test.</span>
                </>
              ) : data.dagsmal.gjortIdag > 0 ? (
                <b>I dag räknas redan.</b>
              ) : (
                <>
                  <b>Tränar du i dag blir det {ORD[n + 1] ?? n + 1}.</b>
                  <span className="hidden xl:inline"> En dag räknas när du har slutfört ett test.</span>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
