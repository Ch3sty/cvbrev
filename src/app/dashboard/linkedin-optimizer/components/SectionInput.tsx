'use client'

import { type LucideIcon } from 'lucide-react'
import SectionStrength from './SectionStrength'

interface Props {
  id: string
  label: string
  icon: LucideIcon
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

export default function SectionInput({
  id,
  label,
  icon: Icon,
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-neutral-700" strokeWidth={2.4} />
          </div>
          <label
            htmlFor={id}
            className="text-sm font-semibold text-neutral-900"
          >
            {label}
            {!required && (
              <span className="ml-1.5 text-xs font-bold text-neutral-400 normal-case">
                (valfritt)
              </span>
            )}
          </label>
        </div>
        <span className="text-xs font-bold text-neutral-400 tabular-nums">
          {value.length}
        </span>
      </div>

      {hint && (
        <p className="text-xs text-neutral-500 leading-snug mb-2">{hint}</p>
      )}

      <textarea
        id={id}
        enterKeyHint="enter"
        inputMode="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="block w-full px-3.5 py-3 bg-white border border-neutral-200 rounded-xl text-base text-neutral-900 placeholder-neutral-400 leading-relaxed transition-all hover:border-orange-200 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-y"
      />

      {showStrength && value.trim().length > 0 && (
        <div className="mt-2">
          <SectionStrength
            text={value}
            optimalMin={optimalMin}
            optimalMax={optimalMax}
          />
        </div>
      )}
    </div>
  )
}
