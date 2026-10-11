/**
 * Små multiplar för de klassiska testerna (skiss Provbladet, avsnitt 2):
 * en ruta per testtyp, procent rätt per försök över tid på samma skala
 * (0 till 100) i alla tre. Nivåerna skiljs med form, inte färg: grund
 * ihålig ring, avancerad fylld ring, expert fylld kvadrat. Varje prick bär
 * datum och procent i title.
 */

import type { TestSlug } from '@/hooks/use-all-test-stats'
import type { PerTestStats } from '@/app/dashboard/tester/getHubData'
import { dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { KLASSISKA, TESTTYPER, TYPRUBRIK, type Niva } from './katalog'
import { UTV } from './copy'
import { Eyebrow, Legend, LegendPost, UKort } from './delar'

const M = UTV.multi
const W = 300
const H = 120
const X0 = 6
const XW = W - 12
const Y0 = 10
const YH = 96

function Markor({ niva, cx, cy, titel }: { niva: Niva; cx: number; cy: number; titel?: string }) {
  const t = titel ? <title>{titel}</title> : null
  if (niva === 'expert') {
    return (
      <rect x={cx - 3.5} y={cy - 3.5} width="7" height="7" rx="1.5" fill="var(--ton-ink)" stroke="var(--papper)" strokeWidth="1.5">
        {t}
      </rect>
    )
  }
  if (niva === 'avancerad') {
    return (
      <circle cx={cx} cy={cy} r="4" fill="var(--ton-ink)" stroke="var(--papper)" strokeWidth="1.5">
        {t}
      </circle>
    )
  }
  return (
    <circle cx={cx} cy={cy} r="3.5" fill="var(--papper)" stroke="var(--ton-ink)" strokeWidth="1.75">
      {t}
    </circle>
  )
}

export default function SmaMultiplar({ perTest, className }: { perTest: Record<TestSlug, PerTestStats>; className?: string }) {
  const typer = TESTTYPER.filter((typ) => KLASSISKA.some((t) => t.typ === typ && (perTest[t.slug]?.attempts ?? 0) > 0))
  if (typer.length === 0) return null
  return (
    <UKort label={M.rubrik} className={className} data="multi">
      <Eyebrow hjalp="D1">{M.rubrik}</Eyebrow>
      <p className="mt-1 text-sm leading-[21px] text-ink-2">{M.text}</p>
      <Legend>
        <LegendPost ruta={<circle cx="7" cy="7" r="3.5" fill="var(--papper)" stroke="var(--ton-ink)" strokeWidth="1.75" />}>{M.legend.grund}</LegendPost>
        <LegendPost ruta={<circle cx="7" cy="7" r="4" fill="var(--ton-ink)" />}>{M.legend.avancerad}</LegendPost>
        <LegendPost ruta={<rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="var(--ton-ink)" />}>{M.legend.expert}</LegendPost>
      </Legend>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TESTTYPER.map((typ) => {
          const nivaer = KLASSISKA.filter((t) => t.typ === typ)
          const forsok = nivaer.flatMap((t) => (perTest[t.slug]?.history ?? []).map((h) => ({ niva: t.niva, ...h })))
          if (!typer.includes(typ)) return null
          const tider = forsok.map((f) => new Date(f.completedAt).getTime())
          const min = Math.min(...tider)
          const max = Math.max(...tider)
          const x = (ms: number) => (max > min ? X0 + ((ms - min) / (max - min)) * XW : X0 + XW / 2)
          const y = (p: number) => Y0 + (1 - Math.max(0, Math.min(100, p)) / 100) * YH
          const r1 = (n: number) => Math.round(n * 10) / 10
          return (
            <figure key={typ} className="min-w-0 rounded-xl border border-kant px-3 pb-2 pt-2.5" data-multi={typ}>
              <figcaption className="flex items-baseline justify-between gap-2">
                <b className="text-xs font-semibold leading-4 tracking-[.02em] text-ink-2">{TYPRUBRIK[typ]}</b>
                <span className="text-ax tabular-nums text-ink-3">{UTV.nivaer.forsok(forsok.length)}</span>
              </figcaption>
              <div className="relative mt-1.5">
                <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={M.aria(TYPRUBRIK[typ], forsok.length)} className="block h-auto w-full overflow-visible">
                  {[0, 50, 100].map((v) => (
                    <line key={v} x1={X0} x2={X0 + XW} y1={y(v)} y2={y(v)} stroke="var(--kant)" strokeWidth="1" strokeDasharray={v === 0 ? undefined : '2 3'} />
                  ))}
                  {nivaer.map((t) => {
                    const h = (perTest[t.slug]?.history ?? []).map((a) => ({ ...a, ms: new Date(a.completedAt).getTime() }))
                    if (h.length < 2) return null
                    return (
                      <path
                        key={t.slug}
                        d={`M${h.map((a) => `${r1(x(a.ms))} ${r1(y(a.percentage))}`).join(' L')}`}
                        fill="none"
                        stroke="var(--ton-ink)"
                        strokeOpacity={t.niva === 'grund' ? 0.35 : t.niva === 'avancerad' ? 0.55 : 0.8}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    )
                  })}
                  {forsok.map((f, i) => (
                    <Markor
                      key={i}
                      niva={f.niva}
                      cx={r1(x(new Date(f.completedAt).getTime()))}
                      cy={r1(y(f.percentage))}
                      titel={M.prick(f.niva, f.percentage, kortDatum(dagSthlm(f.completedAt)))}
                    />
                  ))}
                </svg>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 text-ax text-ink-3">
                  <span className="absolute left-0 -translate-y-full" style={{ top: `${(y(100) / H) * 100}%` }}>100 %</span>
                  <span className="absolute left-0 -translate-y-full" style={{ top: `${(y(50) / H) * 100}%` }}>50 %</span>
                </div>
              </div>
              <div aria-hidden="true" className="mt-1 flex justify-between text-ax text-ink-3">
                <span>{kortDatum(dagSthlm(min))}</span>
                {max > min ? <span>{kortDatum(dagSthlm(max))}</span> : null}
              </div>
            </figure>
          )
        })}
      </div>
    </UKort>
  )
}
