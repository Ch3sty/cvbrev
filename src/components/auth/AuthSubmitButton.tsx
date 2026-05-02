'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: ReactNode
}

export default function AuthSubmitButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className = '',
  ...rest
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`group relative w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
      style={{
        background:
          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
      }}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  )
}
