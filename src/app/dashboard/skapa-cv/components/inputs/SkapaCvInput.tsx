'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  rightSlot?: ReactNode
}

/** Fält i Tråden: insunket i papperet, panel och stark kant vid fokus. */
export const FIELD =
  'block w-full h-11 rounded-lg border bg-insunken px-3 text-base text-ink-1 shadow-insunken placeholder:text-ink-3 transition-colors focus:bg-panel focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60'

export const FIELD_OK = 'border-kant focus:border-kant-stark'
export const FIELD_ERR = 'border-fel bg-panel focus:border-fel'

export const LABEL = 'mb-1.5 block text-sm font-medium text-ink-1'

const SkapaCvInput = forwardRef<HTMLInputElement, Props>(function SkapaCvInput(
  { label, hint, error, optional, rightSlot, className = '', id, ...rest },
  ref
) {
  /* Tangentbordets returtangent säger "Nästa" som standard, eftersom
     fälten i det här flödet nästan alltid följs av ett till. Ett fält som
     avslutar sin grupp skickar in enterKeyHint="done" själv. */
  const enterKeyHint = rest.enterKeyHint ?? 'next'
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-3">(valfritt)</span>}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          enterKeyHint={enterKeyHint}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${FIELD} ${rightSlot ? 'pr-11' : ''} ${error ? FIELD_ERR : FIELD_OK} ${className}`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center">
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-meta text-fel">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-meta text-ink-3">
          {hint}
        </p>
      )}
    </div>
  )
})

export default SkapaCvInput
