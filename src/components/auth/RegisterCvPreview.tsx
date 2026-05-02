'use client'

import { Mail, MapPin, Phone } from 'lucide-react'

interface RegisterCvPreviewProps {
  fullName: string
  email: string
  phone: string
  location: string
  variant?: 'desktop' | 'mobile'
}

export default function RegisterCvPreview({
  fullName,
  email,
  phone,
  location,
  variant = 'desktop',
}: RegisterCvPreviewProps) {
  const isMobile = variant === 'mobile'
  const displayName = fullName.trim() || 'Förnamn Efternamn'
  const hasName = fullName.trim().length > 0

  // Visa inte alls på mobil om inget är ifyllt
  if (isMobile && !fullName.trim() && !email.trim()) {
    return null
  }

  return (
    <div
      className={`relative bg-white rounded-xl border border-orange-100 overflow-hidden ${
        isMobile ? '' : ''
      }`}
      style={{
        boxShadow: '0 8px 20px -10px rgba(249, 115, 22, 0.25)',
      }}
    >
      {/* Mini orange topplist */}
      <div
        className="h-1.5"
        style={{
          background:
            'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
        }}
        aria-hidden="true"
      />

      <div className={isMobile ? 'px-3.5 py-3' : 'px-4 py-4'}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-1 h-2.5 rounded-sm"
            style={{
              background:
                'linear-gradient(180deg, #F97316 0%, #DC2626 100%)',
            }}
            aria-hidden="true"
          />
          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-orange-700">
            CV-förhandsvisning
          </span>
        </div>

        {/* Namn */}
        <p
          className={`font-black leading-tight tracking-tight transition-colors ${
            hasName ? 'text-slate-900' : 'text-slate-300'
          } ${isMobile ? 'text-base' : 'text-lg'}`}
        >
          {displayName}
        </p>

        {/* Kontaktrad */}
        <div
          className={`mt-1.5 flex flex-wrap gap-x-3 gap-y-1 ${
            isMobile ? 'text-[11px]' : 'text-xs'
          }`}
        >
          <span
            className={`inline-flex items-center gap-1 ${
              email.trim() ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <Mail className="w-3 h-3" strokeWidth={2} />
            <span className="truncate max-w-[160px]">
              {email.trim() || 'din.email@example.com'}
            </span>
          </span>
          {!isMobile && (
            <span
              className={`inline-flex items-center gap-1 ${
                phone.trim() ? 'text-slate-600' : 'text-slate-300'
              }`}
            >
              <Phone className="w-3 h-3" strokeWidth={2} />
              <span>{phone.trim() || '+46 70 123 45 67'}</span>
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 ${
              location.trim() ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            <MapPin className="w-3 h-3" strokeWidth={2} />
            <span>{location.trim() || 'Stockholm'}</span>
          </span>
        </div>

        {/* Skeleton-rader (CV-look) — bara desktop */}
        {!isMobile && (
          <div className="mt-3 pt-3 border-t border-orange-50 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-1 h-2 rounded-sm bg-orange-200" />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Erfarenhet
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-slate-100 w-3/4" />
              <div className="h-1.5 rounded-full bg-slate-100 w-1/2" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-1 h-2 rounded-sm bg-orange-200" />
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Kompetenser
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className="h-1.5 w-12 rounded-full bg-slate-100" />
              <span className="h-1.5 w-10 rounded-full bg-slate-100" />
              <span className="h-1.5 w-14 rounded-full bg-slate-100" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
