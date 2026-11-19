/**
 * Dagar i rad (skissen Hem A, utkast v4 avsnitt 2 punkt 3 och 8): talet,
 * veckoraden måndag till söndag och dagsmålet. Dagar i rad räknar dagar med
 * slutfört test och pausar tyst; vi räknar aldrig missar, så veckoraden
 * visar gjorda dagar och i dag, aldrig kryss. Dagsmålet är frivilligt: utan
 * mål står "Inget dagsmål valt" och Välj dagsmål. Länken öppnar väljaren
 * Plan inför provet på steget med datum och dagsmål.
 *
 * Server component.
 */

import Link from 'next/link'
import { laggTill, veckodag, veckodagNamn } from '@/lib/traning/datum'
import { PROVDATUM_HREF } from '@/lib/tester/v4/rutter'
import type { Dag, DagsmalLage } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'

const K = HEM_V4.iRadKort
const BOKSTAV = ['M', 'T', 'O', 'T', 'F', 'L', 'S']

export type VeckoStatus = 'gjord' | 'idag' | 'idagGjord' | 'forbi' | 'kommande'

/** Veckan måndag till söndag runt i dag. Ren, testas. */
export function veckan(idag: Dag, aktiva: readonly Dag[]): { dag: Dag; status: VeckoStatus }[] {
  const mandag = laggTill(idag, -((veckodag(idag) + 6) % 7))
  const gjorda = new Set(aktiva)
  return Array.from({ length: 7 }, (_, i) => {
    const dag = laggTill(mandag, i)
    const status: VeckoStatus =
      dag === idag ? (gjorda.has(dag) ? 'idagGjord' : 'idag') : dag > idag ? 'kommande' : gjorda.has(dag) ? 'gjord' : 'forbi'
    return { dag, status }
  })
}

function Veckorad({ idag, aktiva }: { idag: Dag; aktiva: readonly Dag[] }) {
  const v = veckan(idag, aktiva)
  const gjorda = v.filter((d) => d.status === 'gjord' || d.status === 'idagGjord').map((d) => veckodagNamn(d.dag))
  const label = K.veckaAria(gjorda.join(', '), veckodagNamn(idag))
  const fyllt = { fill: 'var(--koppar)' }
  const kant = { stroke: 'var(--kant-stark)' }
  return (
    <svg viewBox="0 0 252 44" role="img" aria-label={label} className="block h-auto w-full max-w-[260px] overflow-visible" data-veckorad>
      {v.map((d, i) => {
        const cx = 18 + i * 36
        const ar = d.status === 'idag' || d.status === 'idagGjord'
        return (
          <g key={d.dag} data-status={d.status}>
            {d.status === 'gjord' || d.status === 'idagGjord' ? (
              <>
                <circle cx={cx} cy={16} r={10} style={fyllt} />
                <path d={`M${cx - 4.5} 16.5l3 3 5.5-6`} fill="none" style={{ stroke: 'var(--koppar-text)' }} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : d.status === 'idag' ? (
              <>
                <circle cx={cx} cy={16} r={10} style={{ fill: 'var(--papper)', stroke: 'var(--koppar)' }} strokeWidth={2.5} />
                <circle cx={cx} cy={16} r={3} style={fyllt} />
              </>
            ) : (
              <circle cx={cx} cy={16} r={9} fill="none" style={kant} strokeWidth={1.5} strokeDasharray={d.status === 'kommande' ? '2 3' : undefined} />
            )}
            <text
              x={cx}
              y={40}
              textAnchor="middle"
              style={{ fontSize: 11, fontWeight: ar ? 700 : 600, fill: ar ? 'var(--ink-1)' : 'var(--ink-3)' }}
            >
              {BOKSTAV[i]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Dagsmal({ lage, idag, aktivaDagar }: { lage: DagsmalLage; idag: Dag; aktivaDagar: readonly Dag[] }) {
  const { mal, gjortIdag, dagarIRad } = lage
  return (
    <section
      aria-labelledby="dagar-i-rad"
      className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 rounded-2xl border border-kant bg-papper px-4 py-3.5 sm:px-5 sm:py-4 xl:grid-cols-1 xl:content-start xl:gap-y-3"
      data-dagsmal
    >
      <h2 id="dagar-i-rad" className="col-span-full text-ey text-ink-3">
        {K.rubrik}
      </h2>
      <p className="flex items-baseline gap-2.5">
        <span className="font-display text-[40px] font-extrabold leading-[40px] tracking-[-.035em] text-ink-1 [font-variant-numeric:tabular-nums] xl:text-[44px] xl:leading-[44px]">
          {dagarIRad}
        </span>
        <span className="text-[13px] text-ink-2 xl:text-sm">
          <span className="xl:hidden">{K.dagKort(dagarIRad)}</span>
          <span className="hidden xl:inline">{K.dag(dagarIRad)}</span>
        </span>
      </p>
      <div className="justify-self-end xl:justify-self-start">
        <Veckorad idag={idag} aktiva={aktivaDagar} />
      </div>
      <p className="col-span-full flex items-center justify-between gap-2.5 text-meta text-ink-3 xl:mt-auto">
        <span>{mal ? K.mal(gjortIdag, mal) : K.ingetMal}</span>
        <Link href={PROVDATUM_HREF} className="inline-flex min-h-11 items-center text-[13px] font-semibold text-ink-2 underline decoration-kant-stark underline-offset-4">
          {mal ? K.andra : K.valj}
        </Link>
      </p>
    </section>
  )
}
