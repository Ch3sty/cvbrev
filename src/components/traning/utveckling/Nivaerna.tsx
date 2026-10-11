/**
 * "Nivåerna mot varandra" (skiss Provbladet, avsnitt 2): en bricka per nivå
 * med namnet, bästa procenten som display-tal och en sparkline där varje
 * prick är ett försök. "N försök" är enda sekundära rad. Logikens tre nivåer
 * står alltid (ogjorda dämpade); verbalt och numeriskt när de är gjorda.
 */

import Link from 'next/link'
import type { TestSlug } from '@/hooks/use-all-test-stats'
import type { PerTestStats } from '@/app/dashboard/tester/getHubData'
import { KLASSISKA, type KlassisktTest } from './katalog'
import { UTV } from './copy'
import { Eyebrow, UKort } from './delar'

const N = UTV.nivaer
/** Bästa procent från vilken en nivå "sitter". Copy, inte data: testansvarig godkänner gränsen. */
const SITTER = 85

export function nivaRubrik(brickor: { t: KlassisktTest; s: PerTestStats }[]): string {
  // Rubriken talar om en testtyp i taget: logiken om den är gjord, annars den första gjorda.
  const allaGjorda = brickor.filter((b) => (b.s?.attempts ?? 0) > 0)
  const typ = allaGjorda.find((b) => b.t.typ === 'logik')?.t.typ ?? allaGjorda[0]?.t.typ
  const gjorda = allaGjorda.filter((b) => b.t.typ === typ)
  const sitter = [...gjorda].reverse().find((b) => b.s.bestPercentage >= SITTER)
  const satter = gjorda.find((b) => b.s.bestPercentage < SITTER && (!sitter || KLASSISKA.indexOf(b.t) > KLASSISKA.indexOf(sitter.t)))
  if (sitter && satter) return `${N.sitter(sitter.t.niva)} ${N.satter(satter.t.niva)}`
  if (sitter) return N.sitter(sitter.t.niva)
  return N.borjan
}

export function Sparkline({ varden }: { varden: number[] }) {
  const W = 120
  const H = 36
  const bas = 34
  const y = (v: number) => Math.round((bas - 4 - (Math.max(0, Math.min(100, v)) / 100) * (bas - 8)) * 10) / 10
  const x = (i: number) => (varden.length <= 1 ? W : Math.round(((i * W) / (varden.length - 1)) * 10) / 10)
  const pts = varden.map((v, i) => `${x(i)} ${y(v)}`)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="mt-1.5 block h-9 w-full overflow-visible">
      <line x1="0" x2={W} y1={bas} y2={bas} stroke="var(--kant)" strokeWidth="1" />
      {varden.length > 1 ? (
        <>
          <path d={`M${pts.join(' L')} L${W} ${bas} L0 ${bas} Z`} fill="var(--koppar)" opacity=".12" />
          <path d={`M${pts.join(' L')}`} fill="none" stroke="var(--koppar)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      {varden.map((v, i) =>
        i === varden.length - 1 ? (
          <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--koppar)" stroke="var(--papper)" strokeWidth="2" />
        ) : (
          <circle key={i} cx={x(i)} cy={y(v)} r="1.6" fill="var(--koppar)" opacity=".55" />
        )
      )}
    </svg>
  )
}

export default function Nivaerna({
  perTest,
  hasHistory,
  lyft,
  className,
}: {
  perTest: Record<TestSlug, PerTestStats>
  hasHistory: boolean
  lyft?: boolean
  className?: string
}) {
  const brickor = KLASSISKA.filter((t) => t.typ === 'logik' || (perTest[t.slug]?.attempts ?? 0) > 0).map((t) => ({ t, s: perTest[t.slug] }))
  return (
    <UKort label={N.rubrik} lyft={lyft} className={className} data="nivaer">
      <Eyebrow hjalp="D3">{N.rubrik}</Eyebrow>
      <h2 className="mt-1 font-display text-[18px] font-bold leading-[23px] tracking-[-0.015em] text-ink-1 lg:text-kort-t">{nivaRubrik(brickor)}</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {brickor.map(({ t, s }) => {
          const gjord = (s?.attempts ?? 0) > 0
          return (
            <Link
              key={t.slug}
              href={`/dashboard/tester/${t.slug}`}
              aria-label={gjord ? N.aria(t.namn, s.bestPercentage, s.attempts) : N.ariaInte(t.namn)}
              className="block min-w-0 rounded-xl border border-kant bg-papper px-3 py-2.5 hover:border-kant-stark"
              data-bricka={t.slug}
            >
              <b className="block text-xs font-semibold leading-4 tracking-[.02em] text-ink-2">{t.namn}</b>
              {gjord ? (
                <span className="mt-1 block font-display text-[22px] font-bold leading-[26px] tracking-[-0.02em] tabular-nums text-ink-1">
                  {s.bestPercentage} %
                </span>
              ) : (
                <span className="mt-1 block font-display text-[18px] font-semibold leading-[26px] text-ink-3">{N.minuter(t.minuter)}</span>
              )}
              {gjord ? <Sparkline varden={s.history.map((h) => h.percentage)} /> : <svg viewBox="0 0 120 36" aria-hidden="true" className="mt-1.5 block h-9 w-full"><line x1="0" x2="120" y1="34" y2="34" stroke="var(--kant)" strokeWidth="1" /></svg>}
              <span className="mt-1.5 block text-[11px] leading-[14px] text-ink-3">{gjord ? N.forsok(s.attempts) : N.inteGjord}</span>
            </Link>
          )
        })}
      </div>
      {!hasHistory ? <p className="mt-3 text-meta text-ink-3">{N.utanHistorik}</p> : null}
    </UKort>
  )
}
