'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  rightSlot?: ReactNode
  optional?: boolean
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, hint, rightSlot, optional, className = '', id, ...rest },
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
          } bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 transition-all hover:border-orange-200 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:cursor-not-allowed ${className}`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>
      {hint && (
        <p className="mt-1.5 text-xs text-slate-500 flex items-start gap-1.5">
          {hint}
        </p>
      )}
    </div>
  )
})

export default AuthInput
