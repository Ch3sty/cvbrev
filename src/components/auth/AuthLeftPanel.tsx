'use client'

import { ReactNode } from 'react'
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
      className={`relative overflow-hidden ${
        isMobile
          ? 'rounded-2xl px-5 py-6'
          : 'rounded-3xl p-10 xl:p-12 h-full min-h-[640px] flex flex-col'
      }`}
      style={{
        background:
          'linear-gradient(135deg, #7C2D12 0%, #BE185D 55%, #831843 100%)',
        boxShadow: isMobile
          ? '0 8px 24px -10px rgba(190, 24, 93, 0.35)'
          : '0 30px 60px -20px rgba(190, 24, 93, 0.45)',
      }}
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
            <circle cx="16" cy="16" r="1.4" fill="#FED7AA" opacity="0.6" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#auth-panel-dots-${variant})`}
        />
      </svg>

      {/* Mjuk glow uppe i hörnet */}
      <div
        className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-50 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(249, 115, 22, 0.6) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 ${
          isMobile
            ? 'flex items-center gap-4'
            : 'flex flex-col h-full gap-8'
        }`}
      >
        {/* Logo/Wordmark — bara desktop */}
        {!isMobile && (
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
              }}
            >
              <svg
                viewBox="0 0 20 20"
                className="w-5 h-5 text-white"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 3v3h3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-white font-black text-lg tracking-tight">
              jobbcoach<span className="text-orange-300">.ai</span>
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

        {/* Stats — bara desktop */}
        {!isMobile && stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-3"
              >
                <p className="text-white font-black text-lg leading-tight">
                  {stat.value}
                </p>
                <p className="text-white/70 text-[11px] font-medium leading-tight mt-0.5">
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
