'use client'

import { ReactNode } from 'react'

interface AuthCvPaperProps {
  title: string
  subtitle?: string
  sectionLabel?: string
  topAccessory?: ReactNode
  children: ReactNode
}

export default function AuthCvPaper({
  title,
  subtitle,
  sectionLabel,
  topAccessory,
  children,
}: AuthCvPaperProps) {
  return (
    <div className="relative w-full">
      {/* Glow bara på desktop */}
      <div
        className="hidden lg:block absolute -inset-3 rounded-3xl opacity-25 blur-2xl pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative bg-white rounded-2xl lg:rounded-3xl border border-orange-100 overflow-hidden"
        style={{
          boxShadow: '0 20px 40px -16px rgba(249, 115, 22, 0.18)',
        }}
      >
        {/* Orange topplist (CV-look) */}
        <div
          className="h-2"
          style={{
            background:
              'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
          }}
          aria-hidden="true"
        />

        <div className="px-6 sm:px-8 pt-7 pb-7">
          {/* Huvudrubrik + underrubrik */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-[32px] font-black text-slate-900 leading-[1.1] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Top-accessoar (t.ex. ATS-meter) */}
          {topAccessory && <div className="mb-5">{topAccessory}</div>}

          {/* Sektions-label */}
          {sectionLabel && (
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-1 h-3.5 rounded-sm"
                style={{
                  background:
                    'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
                }}
                aria-hidden="true"
              />
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                {sectionLabel}
              </span>
            </div>
          )}

          {/* Innehåll */}
          {children}
        </div>
      </div>
    </div>
  )
}
