'use client'

/**
 * Valen ovanför grafen (skissens grafChips): testtyp (Alla eller en, planens
 * typer framhävda med en kopparpunkt) och period (4 veckor, Planen, Allt).
 * Ett tryck byter direkt, utan nätverk. Valet markeras med bläck, inte koppar
 * (designsystemet 5).
 */

import type { TestTypId } from '@/lib/tester/v4/typer'
import { PERIODER, type Period, type TypVal } from './geometri'
import { UTV } from './copy'

const CHIP =
  'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-semibold transition-colors lg:h-9'
const AV = 'border-kant-stark bg-papper text-ink-2 hover:border-ink-3 hover:text-ink-1'
const PA = 'border-ink-1 bg-ink-1 text-papper'

export interface GrafChipsProps {
  typer: { id: TestTypId; namn: string; ingarIPlan: boolean }[]
  typVal: TypVal
  period: Period
  harPlan: boolean
  onTyp: (v: TypVal) => void
  onPeriod: (p: Period) => void
}

export default function GrafChips({ typer, typVal, period, harPlan, onTyp, onPeriod }: GrafChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label={UTV.chips.typEtikett} className="flex flex-wrap gap-2" data-chips="typ">
        <button type="button" aria-pressed={typVal === 'alla'} className={`${CHIP} ${typVal === 'alla' ? PA : AV}`} onClick={() => onTyp('alla')}>
          {UTV.chips.alla}
        </button>
        {typer.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={typVal === t.id}
            className={`${CHIP} ${typVal === t.id ? PA : AV}`}
            onClick={() => onTyp(typVal === t.id ? 'alla' : t.id)}
          >
            {t.ingarIPlan ? <span aria-hidden="true" className="h-2 w-2 rounded-full bg-koppar" /> : null}
            {t.namn}
          </button>
        ))}
      </div>
      <div role="group" aria-label={UTV.chips.periodEtikett} className="flex flex-wrap gap-2" data-chips="period">
        {PERIODER.filter((p) => p !== 'plan' || harPlan).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={period === p}
            className={`${CHIP} !h-10 !text-xs lg:!h-8 ${period === p ? PA : AV}`}
            onClick={() => onPeriod(p)}
          >
            {UTV.chips.period[p]}
          </button>
        ))}
      </div>
    </div>
  )
}
