'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

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
  {
    label,
    options,
    hint,
    error,
    optional,
    placeholder,
    className = '',
    id,
    ...rest
  },
  ref
) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 mb-1.5"
      >
        {label}
        {optional && (
          <span className="ml-1.5 text-slate-400 normal-case font-medium tracking-normal">
            (valfritt)
          </span>
        )}
      </label>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`block w-full min-h-[44px] pl-4 pr-10 py-3 bg-white border rounded-xl text-base text-slate-900 transition-all appearance-none cursor-pointer hover:border-orange-200 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-orange-300 focus:ring-orange-100'
          } ${className}`}
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
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          strokeWidth={2.4}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
      )}
      {!error && hint && (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
})

export default SkapaCvSelect
