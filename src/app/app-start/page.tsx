'use client'

import Link from 'next/link'
import Logo from '@/components/Logo'

export default function AppStartPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{ backgroundColor: '#0A0F1E' }}
    >
      {/* Övre del: logo + illustration */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm gap-10">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Logo variant="on-dark" height={44} />
          <p
            className="text-sm font-medium tracking-wide text-center"
            style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}
          >
            SMARTARE JOBBSÖKNING, PÅ SVENSKA
          </p>
        </div>

        {/* Illustration */}
        <AppIllustration />

        {/* Feature-pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['8 AI-verktyg', '2 min till CV', '94% når intervju'].map((label) => (
            <span
              key={label}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(249,115,22,0.12)',
                color: '#FB923C',
                border: '1px solid rgba(249,115,22,0.2)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Nedre del: knappar */}
      <div className="w-full max-w-sm flex flex-col gap-3 pt-8">
        <Link
          href="/login"
          className="w-full flex items-center justify-center font-bold text-white rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
            height: 56,
            fontSize: 17,
            boxShadow: '0 8px 24px -8px rgba(220,38,38,0.5)',
          }}
        >
          Logga in
        </Link>
        <Link
          href="/register"
          className="w-full flex items-center justify-center font-bold rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.07)',
            color: '#FFFFFF',
            height: 56,
            fontSize: 17,
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          Skapa konto
        </Link>
      </div>
    </div>
  )
}

function AppIllustration() {
  return (
    <svg
      viewBox="0 0 280 200"
      width="280"
      height="200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Bakgrundscirklar */}
      <circle cx="240" cy="40" r="60" fill="rgba(249,115,22,0.06)" />
      <circle cx="40" cy="160" r="50" fill="rgba(220,38,38,0.06)" />

      {/* CV-kort */}
      <rect x="20" y="30" width="140" height="160" rx="14" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      {/* Header-stripe på CV-kortet */}
      <rect x="20" y="30" width="140" height="36" rx="14" fill="url(#g2)" />
      <rect x="20" y="52" width="140" height="14" rx="0" fill="url(#g2)" />
      {/* Avatar-cirkel */}
      <circle cx="44" cy="48" r="14" fill="url(#g1)" opacity="0.9" />
      <text x="44" y="53" fontFamily="system-ui" fontSize="12" fontWeight="900" fill="white" textAnchor="middle">J</text>
      {/* Textrader */}
      {[80, 100, 116, 132, 148, 164].map((y, i) => (
        <rect
          key={y}
          x="36"
          y={y}
          width={i % 3 === 2 ? 60 : i % 2 === 0 ? 100 : 80}
          height="7"
          rx="3.5"
          fill="rgba(255,255,255,0.08)"
        />
      ))}

      {/* AI-chip — flytande till höger */}
      <rect x="148" y="70" width="110" height="44" rx="12" fill="url(#g1)" opacity="0.95" />
      <text x="203" y="88" fontFamily="system-ui" fontSize="10" fontWeight="700" fill="rgba(255,255,255,0.8)" textAnchor="middle" letterSpacing="0.08em">AI-ANALYS</text>
      <text x="203" y="104" fontFamily="system-ui" fontSize="11" fontWeight="900" fill="white" textAnchor="middle">94% match</text>

      {/* Liten brev-ikon nedre höger */}
      <rect x="168" y="130" width="80" height="52" rx="10" fill="rgba(255,255,255,0.04)" stroke="rgba(249,115,22,0.2)" strokeWidth="1" />
      <path d="M168 140 L208 158 L248 140" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" fill="none" />
      {[148, 158, 168].map((y) => (
        <rect key={y} x="176" y={y} width={y === 158 ? 44 : 36} height="5" rx="2.5" fill="rgba(255,255,255,0.06)" />
      ))}
    </svg>
  )
}
