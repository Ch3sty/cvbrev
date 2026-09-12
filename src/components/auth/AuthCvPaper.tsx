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
      <div
        className="relative bg-white rounded-xl lg:rounded-xl border border-orange-100 overflow-hidden"
      >
        <div className="px-6 sm:px-8 pt-7 pb-7">
          {/* Huvudrubrik + underrubrik */}
          <div className="mb-6">
            <h1 className="text-3xl sm:text-[32px] font-semibold text-neutral-900 leading-[1.1] tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm sm:text-base text-neutral-600 leading-relaxed">
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
                className="w-1 h-3.5 rounded-sm bg-orange-600"
                aria-hidden="true"
              />
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
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
