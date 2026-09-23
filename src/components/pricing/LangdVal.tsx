'use client'

/**
 * Längdvalet på Hela paketet (docs/design/spec-prissida-2026-09-22.html, .langd).
 *
 * Fyra lika breda rutor i en ram, beloppet överst i display-snitt och
 * längden under. Valt läge inverteras: på ink-ytan blir det vitt med ink-text,
 * på papper blir det ink med vit text. role="radiogroup" och role="radio"
 * som Segment, men med två rader per knapp, vilket Segment inte har.
 *
 * Ett spärrat läge (dagen för en löpande kund, D48b) står kvar med lägre
 * opacitet, så raden ser likadan ut för alla, och anroparen säger varför.
 */

import { PLAN_BY_KEY, type PlanLength } from '@/lib/plans/plans'
import { ALLT_LANGDER } from './paket-copy'

export interface LangdValProps {
  /** Valt läge. null betyder inget valt (köpstegets "Vill du ha allt i stället?"). */
  value: PlanLength | null
  onChange: (langd: PlanLength) => void
  /** Ytan valet står på. Styr inverteringen. */
  yta?: 'ink' | 'papper'
  /** Lägen som inte går att välja. */
  inaktiva?: readonly PlanLength[]
  /** Desktopetiketten "en dag" i stället för "dag". */
  langaEtiketter?: boolean
  label: string
  className?: string
}

export default function LangdVal({
  value,
  onChange,
  yta = 'ink',
  inaktiva = [],
  langaEtiketter,
  label,
  className,
}: LangdValProps) {
  const ram =
    yta === 'ink' ? 'border-ink-1-kant' : 'border-kant-stark'

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`grid grid-cols-4 overflow-hidden rounded-lg border ${ram} ${className ?? ''}`}
    >
      {ALLT_LANGDER.map((l) => {
        const on = l.length === value
        const av = inaktiva.includes(l.length)
        const talFarg = on
          ? 'text-ink-1'
          : yta === 'ink'
            ? 'text-white'
            : 'text-ink-1'
        const textFarg = on
          ? 'text-ink-3'
          : yta === 'ink'
            ? 'text-ink-1-mjuk'
            : 'text-ink-3'
        const bakgrund = on ? (yta === 'ink' ? 'bg-panel' : 'bg-insunken shadow-val') : ''
        return (
          <button
            key={l.length}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={av}
            aria-disabled={av || undefined}
            onClick={() => onChange(l.length)}
            className={`flex min-h-11 flex-col items-center justify-center px-1 py-2 text-xs leading-4 transition-colors duration-[120ms] disabled:cursor-not-allowed disabled:opacity-40 ${bakgrund} ${textFarg}`}
          >
            <span
              className={`font-display text-[15px] font-bold leading-5 tabular-nums ${talFarg}`}
            >
              {PLAN_BY_KEY[l.plan].amount}
            </span>
            <span>{langaEtiketter ? l.labelLang : l.label}</span>
          </button>
        )
      })}
    </div>
  )
}
