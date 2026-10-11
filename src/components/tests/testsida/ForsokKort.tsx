'use client'

/**
 * Dina försök på testsidan (tester-lyftet): en serie över kortets bredd,
 * en prick per försök med andelen rätt, äldst till vänster och den senaste
 * i koppar med sin procent som enda etikett. Antalet försök är inget
 * resultat och står bara i aria-label (art-director 2026-10-11, avvikelse
 * 4). Datum, andel och tid per försök står i detaljvyn, en fällbar lista
 * med en rad per försök som går till sin genomgång.
 */

import Link from 'next/link'
import { IkonChev } from '@/components/illustrations/RumSymboler'
import { testPaths } from '@/app/dashboard/tester/testConfig'
import { TESTSIDA } from '@/lib/tester/copy'
import { minSek } from '@/lib/tester/resultat'

export interface ForsokRad {
  id: string
  score: number | null
  time_spent: number | null
  completed_at: string | null
}

export interface ForsokKortProps {
  slug: string
  /** Nyast först. */
  forsok: ForsokRad[]
  totalt: number
  className?: string
}

/** Serien visar de senaste så här många. */
const SERIE = 12
const H = 56
const LUFT = 6

function datum(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' })
}

export default function ForsokKort({ slug, forsok, totalt, className }: ForsokKortProps) {
  const pct = (s: ForsokRad) => Math.min(100, Math.round(((s.score ?? 0) / totalt) * 100))
  const serie = forsok.slice(0, SERIE).reverse()
  const n = serie.length
  const punkter = serie.map((s, i) => ({
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: LUFT + (1 - pct(s) / 100) * (H - LUFT * 2),
  }))
  const sista = punkter[n - 1] ?? null
  const senastePct = n > 0 ? pct(serie[n - 1]) : 0

  return (
    <section aria-label={TESTSIDA.forsok.rub} className={`rounded-2xl border border-kant bg-papper p-4 ${className ?? ''}`}>
      <p className="text-ey text-ink-3">{TESTSIDA.forsok.rub}</p>
      <div className="mt-6 pr-6">
        <div className="relative h-14 w-full" role="img" aria-label={TESTSIDA.forsok.aria(n, senastePct)}>
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <line x1="0" x2="100" y1={LUFT} y2={LUFT} stroke="var(--kant)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" x2="100" y1={H - LUFT} y2={H - LUFT} stroke="var(--kant)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {n > 1 ? (
              <polyline
                points={punkter.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="var(--ton-ink)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity=".75"
              />
            ) : null}
          </svg>
          {punkter.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`absolute block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-papper ${
                i === n - 1 ? 'bg-koppar' : 'bg-ton-ink'
              }`}
              style={{ left: `${p.x}%`, top: `${p.y}px` }}
            />
          ))}
          {sista ? (
            <span
              aria-hidden="true"
              className="absolute whitespace-nowrap pb-2 font-display text-[15px] font-bold leading-4 tabular-nums text-koppar-ink"
              style={{ left: `${sista.x}%`, top: `${sista.y}px`, transform: `translate(${sista.x > 80 ? '-100%' : '-50%'}, -100%)` }}
            >
              {senastePct} %
            </span>
          ) : null}
        </div>
      </div>
      <details className="group mt-3 border-t border-kant">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 pt-1 text-sm font-medium text-ink-1 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">{TESTSIDA.forsok.visaAlla}</span>
          <span className="hidden group-open:inline">{TESTSIDA.forsok.dolj}</span>
          <span className="sr-only">, {forsok.length} försök</span>
          <IkonChev size={20} className="shrink-0 text-ink-3 transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none" />
        </summary>
        <ul className="divide-y divide-kant" data-forsok-lista>
          {forsok.map((s) => (
            <li key={s.id}>
              <Link
                href={testPaths.results(slug, s.id)}
                className="grid min-h-12 grid-cols-[1fr_auto_4.5rem_20px] items-center gap-3 py-2 text-sm hover:bg-papper-2"
              >
                <span className="text-ink-2">{datum(s.completed_at)}</span>
                <span className="font-display text-base font-bold tabular-nums text-ink-1">{pct(s)} %</span>
                <span className="text-right text-meta tabular-nums text-ink-3">{s.time_spent ? minSek(s.time_spent) : ''}</span>
                <IkonChev size={20} className="text-ink-3" />
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
