'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  rightSlot?: ReactNode
}

const SkapaCvInput = forwardRef<HTMLInputElement, Props>(function SkapaCvInput(
  { label, hint, error, optional, rightSlot, className = '', id, ...rest },
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
        <input
          ref={ref}
          id={id}
          className={`block w-full min-h-[44px] px-4 py-3 ${
            rightSlot ? 'pr-11' : ''
          } bg-white border rounded-xl text-base text-slate-900 placeholder-slate-400 transition-all hover:border-orange-200 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-orange-300 focus:ring-orange-100'
          } ${className}`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightSlot}
          </div>
        )}
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

export default SkapaCvInput
