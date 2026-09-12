'use client'

import { ReactNode } from 'react'
import { FileText } from 'lucide-react'
import TypewriterQuote from './TypewriterQuote'

interface StatPill {
  value: string
  label: string
}

interface AuthLeftPanelProps {
  illustration?: ReactNode
  quotes: string[]
  stats?: StatPill[]
  variant?: 'desktop' | 'mobile'
  customSlot?: ReactNode
}

export default function AuthLeftPanel({
  illustration,
  quotes,
  stats,
  variant = 'desktop',
  customSlot,
}: AuthLeftPanelProps) {
  const isMobile = variant === 'mobile'

  return (
    <div
      className={`relative overflow-hidden bg-white border border-neutral-200 ${
        isMobile
          ? 'rounded-xl px-5 py-6'
          : 'rounded-xl p-10 xl:p-12 h-full min-h-[640px] flex flex-col'
      }`}
    >
      {/* Dot-pattern overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={`auth-panel-dots-${variant}`}
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="16" cy="16" r="1.4" fill="#E5E5E5" opacity="0.6" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#auth-panel-dots-${variant})`}
        />
      </svg>

      <div
        className={`relative z-10 ${
          isMobile
            ? 'flex items-center gap-4'
            : 'flex flex-col h-full gap-8'
        }`}
      >
        {/* Logo/Wordmark, bara desktop */}
        {!isMobile && (
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-700" strokeWidth={2} />
            <span className="text-neutral-900 font-semibold text-lg tracking-tight">
              jobbcoach<span className="text-orange-600">.ai</span>
            </span>
          </div>
        )}

        {/* Illustration */}
        {illustration && (
          <div
            className={
              isMobile
                ? 'flex-shrink-0 w-16 h-16'
                : 'flex justify-center my-2'
            }
          >
            <div className={isMobile ? 'w-16 h-16' : 'w-32 h-32 xl:w-40 xl:h-40'}>
              {illustration}
            </div>
          </div>
        )}

        {/* Citat */}
        <div className={isMobile ? 'flex-1 min-w-0' : 'flex-1'}>
          <TypewriterQuote
            quotes={quotes}
            className={
              isMobile
                ? 'text-sm leading-snug'
                : 'text-2xl xl:text-3xl leading-[1.15]'
            }
          />
        </div>

        {/* Custom slot (t.ex. live CV-preview på register) */}
        {customSlot && !isMobile && (
          <div className="mt-2">{customSlot}</div>
        )}

        {/* Stats, bara desktop */}
        {!isMobile && stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-neutral-50 border border-neutral-200 px-3 py-3"
              >
                <p className="text-neutral-900 font-semibold text-lg leading-tight">
                  {stat.value}
                </p>
                <p className="text-neutral-500 text-xs font-medium leading-tight mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
