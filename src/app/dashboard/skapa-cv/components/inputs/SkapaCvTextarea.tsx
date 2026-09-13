'use client'

import { forwardRef, TextareaHTMLAttributes } from 'react'
import { FIELD_OK, FIELD_ERR } from './SkapaCvInput'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  /** Visa tecken-räknare under fältet */
  showCount?: boolean
  maxCount?: number
}

export const TEXTAREA =
  'block w-full min-h-[120px] resize-y rounded-lg border bg-insunken px-3 py-2.5 text-base leading-relaxed text-ink-1 shadow-insunken placeholder:text-ink-3 transition-colors focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60'

const SkapaCvTextarea = forwardRef<HTMLTextAreaElement, Props>(function SkapaCvTextarea(
  { label, hint, error, optional, showCount = false, maxCount, value, className = '', id, ...rest },
  ref
) {
  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-ink-1">
          {label}
          {optional && <span className="ml-1.5 font-normal text-ink-3">(valfritt)</span>}
        </label>
        {showCount && maxCount && (
          <span
            className={`text-meta tabular-nums ${
              currentLength > maxCount ? 'text-fel' : 'text-ink-3'
            }`}
          >
            {currentLength}/{maxCount}
          </span>
        )}
      </div>
      <textarea
        ref={ref}
        id={id}
        enterKeyHint="enter"
        inputMode="text"
        autoComplete="off"
        value={value}
        aria-invalid={error ? true : undefined}
        className={`${TEXTAREA} ${error ? FIELD_ERR : FIELD_OK} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1.5 text-meta text-fel">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-meta text-ink-3">{hint}</p>}
    </div>
  )
})

export default SkapaCvTextarea
