'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  /** Visa tecken-räknare under fältet */
  showCount?: boolean
  maxCount?: number
}

const SkapaCvTextarea = forwardRef<HTMLTextAreaElement, Props>(
  function SkapaCvTextarea(
    {
      label,
      hint,
      error,
      optional,
      showCount = false,
      maxCount,
      value,
      className = '',
      id,
      ...rest
    },
    ref
  ) {
    const currentLength =
      typeof value === 'string' ? value.length : 0

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor={id}
            className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"
          >
            {label}
            {optional && (
              <span className="ml-1.5 text-slate-400 normal-case font-medium tracking-normal">
                (valfritt)
              </span>
            )}
          </label>
          {showCount && maxCount && (
            <span
              className={`text-[11px] font-medium tabular-nums ${
                currentLength > maxCount
                  ? 'text-red-600'
                  : 'text-slate-400'
              }`}
            >
              {currentLength}/{maxCount}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          id={id}
          value={value}
          className={`block w-full min-h-[120px] px-4 py-3 bg-white border rounded-xl text-base text-slate-900 placeholder-slate-400 leading-relaxed transition-all hover:border-orange-200 focus:outline-none focus:ring-2 resize-y disabled:bg-slate-50 disabled:cursor-not-allowed ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-orange-300 focus:ring-orange-100'
          } ${className}`}
          {...rest}
        />
        {error && (
          <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
        )}
        {!error && hint && (
          <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
        )}
      </div>
    )
  }
)

export default SkapaCvTextarea
