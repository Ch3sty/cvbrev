'use client'

import Link from 'next/link'

/**
 * Custom SVG-illustration för "kvot uppnådd"-state.
 * Stil: 56×56, orange/röd-DNA, en stack med 2 CV-papper och en
 * 3:e som svävar med lås-ikon ovanför — visuellt tydligt att
 * gränsen är nådd.
 */
function QuotaFullIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="qb-warm"
          x1="0"
          y1="0"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient
          id="qb-deep"
          x1="0"
          y1="0"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#DC2626" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
        <linearGradient
          id="qb-soft"
          x1="0"
          y1="0"
          x2="0"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFEDD5" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
      </defs>

      {/* Bakgrund-blob */}
      <circle cx="28" cy="28" r="26" fill="url(#qb-soft)" opacity="0.7" />

      {/* CV-stack: två aktiva CV staplade */}
      {/* Bakre CV (lutar lite) */}
      <g transform="translate(8 22) rotate(-4 16 14)">
        <rect
          x="0"
          y="0"
          width="22"
          height="26"
          rx="3"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1"
        />
        <rect x="0" y="0" width="22" height="2" fill="url(#qb-warm)" />
        <line
          x1="4"
          y1="8"
          x2="14"
          y2="8"
          stroke="#94A3B8"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="13"
          x2="18"
          y2="13"
          stroke="#CBD5E1"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="17"
          x2="16"
          y2="17"
          stroke="#CBD5E1"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>

      {/* Främre CV (rakt fram) */}
      <g transform="translate(18 20)">
        <rect
          x="0"
          y="0"
          width="22"
          height="26"
          rx="3"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.2"
        />
        <rect x="0" y="0" width="22" height="2" fill="url(#qb-deep)" />
        <circle cx="6" cy="9" r="2" fill="#FED7AA" />
        <line
          x1="10"
          y1="8"
          x2="18"
          y2="8"
          stroke="#94A3B8"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="14"
          x2="18"
          y2="14"
          stroke="#CBD5E1"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="18"
          x2="16"
          y2="18"
          stroke="#CBD5E1"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <line
          x1="4"
          y1="22"
          x2="14"
          y2="22"
          stroke="#CBD5E1"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>

      {/* Lås-cirkel uppe i hörnet — markering att gränsen är nådd */}
      <g transform="translate(38 10)">
        <circle
          cx="0"
          cy="0"
          r="9"
          fill="white"
          stroke="url(#qb-warm)"
          strokeWidth="1.5"
        />
        <circle cx="0" cy="0" r="7" fill="url(#qb-warm)" />
        {/* Lås-bygel */}
        <path
          d="M -3 -1 L -3 -3 Q -3 -5.5 0 -5.5 Q 3 -5.5 3 -3 L 3 -1"
          fill="none"
          stroke="white"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Lås-kropp */}
        <rect
          x="-3.5"
          y="-1"
          width="7"
          height="5.5"
          rx="1"
          fill="white"
        />
        {/* Nyckelhål-prick */}
        <circle cx="0" cy="1.5" r="0.8" fill="url(#qb-warm)" />
      </g>

      {/* Liten orange "stop"-prick nere till höger */}
      <circle cx="46" cy="42" r="3" fill="url(#qb-deep)" />
      <circle cx="46" cy="42" r="5" fill="#DC2626" opacity="0.18" />
    </svg>
  )
}

interface Props {
  /** Felmeddelandet från servern (eller fallback) */
  message: string
  /** Visas som rubrik. Default: "Du har nått din CV-gräns" */
  title?: string
}

/**
 * Återanvändbar banner för "kvot överskriden"-felmeddelanden.
 * Visas när /api/cv/* returnerar 403 med quota_exceeded: true.
 *
 * Innehåller två tydliga vägar framåt:
 * 1. "Hantera CV →" — radera ett befintligt CV i Mina CV-sidan
 * 2. "Uppgradera till Premium →" — abonnemangs-sidan
 */
export default function QuotaExceededBanner({
  message,
  title = 'Du har nått din CV-gräns',
}: Props) {
  return (
    <div
      className="rounded-xl border border-orange-200 bg-orange-50/60 p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <QuotaFullIllustration className="w-12 h-12 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 mb-1">{title}</p>
          <p className="text-xs text-slate-700 leading-relaxed mb-2.5">
            {message}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/profil/cv"
              className="inline-flex items-center text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors"
            >
              Hantera CV →
            </Link>
            <Link
              href="/dashboard/profil/prenumeration"
              className="inline-flex items-center text-xs font-bold text-orange-700 hover:text-orange-800 transition-colors"
            >
              Uppgradera till Premium →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
