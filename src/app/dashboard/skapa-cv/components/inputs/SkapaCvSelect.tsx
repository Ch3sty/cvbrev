'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { FIELD, FIELD_OK, FIELD_ERR, LABEL } from './SkapaCvInput'

interface Option {
  value: string
  label: string
}

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: Option[]
  hint?: string
  error?: string
  optional?: boolean
  placeholder?: string
}

const SkapaCvSelect = forwardRef<HTMLSelectElement, Props>(function SkapaCvSelect(
  { label, options, hint, error, optional, placeholder, className = '', id, ...rest },
  ref
) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-3">(valfritt)</span>}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          className={`${FIELD} cursor-pointer appearance-none pr-10 ${error ? FIELD_ERR : FIELD_OK} ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3"
          strokeWidth={1.75}
        />
      </div>
      {error && <p className="mt-1.5 text-meta text-fel">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-meta text-ink-3">{hint}</p>}
    </div>
  )
})

export default SkapaCvSelect
