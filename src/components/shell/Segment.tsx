'use client'

/**
 * Segment: lika breda knappar på 44 px (docs/designsystem.md).
 *
 * Valt segment får kant ink-1 (1 px plus 1 px inset) och vikt 500. Ingen
 * fyllning, ingen tråd. Används för korta, ömsesidigt uteslutande val som
 * språk eller vy, aldrig för fler än fyra alternativ.
 */

export interface SegmentOption<T extends string> {
  value: T
  label: string
  disabled?: boolean
}

export interface SegmentProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: SegmentOption<T>[]
  /** Tillgängligt namn på gruppen. */
  label: string
  className?: string
}

export default function Segment<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex gap-2 ${className ?? ''}`}>
      {options.map((option) => {
        const on = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={`h-11 flex-1 rounded-lg border bg-panel px-3 text-sm text-ink-1 transition-[border-color,background-color] duration-[120ms] hover:border-kant-stark active:bg-insunken disabled:cursor-not-allowed disabled:opacity-60 ${
              on ? 'border-ink-1 font-medium shadow-val' : 'border-kant'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
