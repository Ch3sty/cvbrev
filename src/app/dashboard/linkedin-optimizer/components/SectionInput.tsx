'use client'

import SectionStrength from './SectionStrength'

interface Props {
  id: string
  label: string
  placeholder: string
  rows: number
  required?: boolean
  hint?: string
  value: string
  onChange: (value: string) => void
  optimalMin?: number
  optimalMax?: number
  showStrength?: boolean
}

/**
 * Ett sektionsfält: etikett i ink-1, valfri-markering och teckenräknare i
 * ink-3, hjälptext 13 px, insunken textarea med fokusring i accent.
 */
export default function SectionInput({
  id,
  label,
  placeholder,
  rows,
  required = false,
  hint,
  value,
  onChange,
  optimalMin,
  optimalMax,
  showStrength = true,
}: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-1">
          {label}
          {!required && <span className="ml-1.5 text-meta text-ink-3">(valfritt)</span>}
        </label>
        <span className="text-meta tabular-nums text-ink-3">{value.length}</span>
      </div>

      {hint && <p className="mb-2 text-meta text-ink-3">{hint}</p>}

      <textarea
        id={id}
        enterKeyHint="enter"
        inputMode="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="block w-full resize-y rounded-lg border border-kant bg-insunken px-3 py-2.5 text-base leading-[22px] text-ink-1 shadow-insunken placeholder:text-ink-3 focus:border-kant-stark focus:bg-panel focus:outline-none focus:ring-2 focus:ring-accent"
      />

      {showStrength && value.trim().length > 0 && (
        <div className="mt-2">
          <SectionStrength text={value} optimalMin={optimalMin} optimalMax={optimalMax} />
        </div>
      )}
    </div>
  )
}
