/**
 * Tempo mot provets tid (skiss Provbladet, avsnitt 3, steg s4): en stapel
 * per fråga, provets tid per fråga som streckad linje. Rätt är fylld ton,
 * fel är ihålig, långsammare än provet är koppar. Inget rött.
 */

import type { ResultatFraga, Tempo } from '@/lib/tester/resultat'
import { minSek } from '@/lib/tester/resultat'
import { RESULTAT } from '@/lib/tester/copy'

export interface TempoKortProps {
  tempo: Tempo
  fragor: ResultatFraga[]
  sak: { en: string; flera: string }
  className?: string
}

function Ruta({ typ }: { typ: 'ratt' | 'fel' | 'over' }) {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
      {typ === 'ratt' ? <rect x="2" y="2" width="10" height="10" rx="2" fill="var(--ton-ink)" opacity=".75" /> : null}
      {typ === 'fel' ? (
        <rect x="2.75" y="2.75" width="8.5" height="8.5" rx="2" fill="none" stroke="var(--ton-ink)" strokeWidth="1.5" />
      ) : null}
      {typ === 'over' ? <rect x="2" y="2" width="10" height="10" rx="2" fill="var(--koppar)" /> : null}
    </svg>
  )
}

export default function TempoKort({ tempo, fragor, sak, className }: TempoKortProps) {
  const maxTid = Math.max(0, ...fragor.map((f) => f.tid ?? 0))
  const skala = Math.max(maxTid, tempo.budget * 1.25)
  const budgetPct = (tempo.budget / skala) * 100
  const gap = fragor.length <= 20 ? 'gap-[5px]' : fragor.length <= 40 ? 'gap-0.5' : 'gap-px'
  const langsam = tempo.langsammastRatt

  return (
    <section aria-label={RESULTAT.tempo.rub} className={`rounded-2xl border border-kant bg-papper p-4 ${className ?? ''}`}>
      <p className="text-ey text-ink-3">{RESULTAT.tempo.rub}</p>
      <h3 className="mt-1 font-display text-lg font-bold leading-[23px] tracking-[-0.015em] text-ink-1">
        {RESULTAT.tempo.titel(tempo.over, tempo.matta, tempo.budget)}
      </h3>
      <p className="mt-1.5 text-sm leading-[21px] text-ink-2">
        {RESULTAT.tempo.snitt} <b className="font-semibold text-ink-1 tabular-nums">{tempo.snitt} s</b> per {sak.en}.
        {langsam ? <> {RESULTAT.tempo.langsam(langsam.nr, minSek(langsam.tid), sak)}</> : null}
      </p>

      <div
        className={`relative mt-6 flex h-[72px] items-end ${gap}`}
        role="img"
        aria-label={RESULTAT.tempo.aria(tempo.over, tempo.matta, tempo.budget)}
      >
        <span
          className="pointer-events-none absolute inset-x-0 border-t-[1.5px] border-dashed border-kant-stark"
          style={{ bottom: `${budgetPct}%` }}
          aria-hidden="true"
        >
          <em className="absolute -top-[18px] right-0 text-ax not-italic text-ink-3">
            <span className="lg:hidden">{RESULTAT.tempo.budgetKort(tempo.budget)}</span>
            <span className="hidden lg:inline">{RESULTAT.tempo.budget(tempo.budget)}</span>
          </em>
        </span>
        {fragor.map((f) => {
          const tid = f.tid ?? 0
          const over = tid > tempo.budget
          const ratt = f.utfall === 'ratt'
          const h = tid > 0 ? Math.max(6, (tid / skala) * 100) : 4
          const yta = ratt
            ? over
              ? 'bg-koppar'
              : 'bg-ton-ink opacity-75'
            : over
              ? 'border-[1.5px] border-koppar'
              : 'border-[1.5px] border-ton-ink opacity-75'
          return (
            <i
              key={f.nr}
              className={`block min-w-0 flex-1 rounded-t-[3px] ${tid > 0 ? yta : 'bg-kant'}`}
              style={{ height: `${h}%` }}
              aria-hidden="true"
            />
          )
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-ax text-ink-3">
        <span>{RESULTAT.tempo.axelForsta(sak)}</span>
        <span>{RESULTAT.tempo.axelSista(fragor.length, sak)}</span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs leading-4 text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <Ruta typ="ratt" />
          {RESULTAT.tempo.legend.ratt}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Ruta typ="fel" />
          {RESULTAT.tempo.legend.fel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Ruta typ="over" />
          {RESULTAT.tempo.legend.over}
        </span>
      </div>
    </section>
  )
}
