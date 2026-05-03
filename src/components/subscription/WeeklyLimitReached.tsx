'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

/**
 * Custom SVG-illustration för "vecko-gräns nådd"-state.
 * Stil: 120×120, orange/röd-DNA, en kalender med markerade dagar och
 * en cirkulär timer-ring runt — visuellt tydligt att tiden är nådd
 * men nästa vecka närmar sig.
 */
function WeeklyLimitIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="wl-warm"
          x1="0"
          y1="0"
          x2="120"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient
          id="wl-deep"
          x1="0"
          y1="0"
          x2="120"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#DC2626" />
          <stop offset="1" stopColor="#BE185D" />
        </linearGradient>
        <linearGradient
          id="wl-soft"
          x1="0"
          y1="0"
          x2="0"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFEDD5" />
          <stop offset="1" stopColor="#FED7AA" />
        </linearGradient>
      </defs>

      {/* Bakgrund-blob */}
      <circle cx="60" cy="60" r="52" fill="url(#wl-soft)" opacity="0.5" />

      {/* Yttre timer-ring (3/4 fylld - representerar förbrukad tid) */}
      <circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="#FED7AA"
        strokeWidth="4"
        opacity="0.6"
      />
      <motion.circle
        cx="60"
        cy="60"
        r="48"
        fill="none"
        stroke="url(#wl-warm)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${2 * Math.PI * 48}`}
        initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
        animate={{
          strokeDashoffset: 2 * Math.PI * 48 * (1 - 0.92),
        }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 60 60)"
      />

      {/* Kalender-papper i mitten */}
      <g transform="translate(34 38)">
        {/* Skugga */}
        <rect
          x="2"
          y="3"
          width="52"
          height="46"
          rx="4"
          fill="rgba(0, 0, 0, 0.08)"
        />
        {/* Kalender-rektangel */}
        <rect
          x="0"
          y="0"
          width="52"
          height="46"
          rx="4"
          fill="white"
          stroke="#FB923C"
          strokeWidth="1.2"
        />
        {/* Kalender-toppband */}
        <rect
          x="0"
          y="0"
          width="52"
          height="10"
          rx="4"
          fill="url(#wl-warm)"
        />
        <rect x="0" y="6" width="52" height="4" fill="url(#wl-warm)" />
        {/* Kalender-ringar */}
        <rect x="11" y="-3" width="3" height="8" rx="1.5" fill="#94A3B8" />
        <rect x="38" y="-3" width="3" height="8" rx="1.5" fill="#94A3B8" />
        {/* Veckodagar (rad 1, små) */}
        <circle cx="8" cy="18" r="1.2" fill="#CBD5E1" />
        <circle cx="16" cy="18" r="1.2" fill="#CBD5E1" />
        <circle cx="24" cy="18" r="1.2" fill="#CBD5E1" />
        <circle cx="32" cy="18" r="1.2" fill="#CBD5E1" />
        <circle cx="40" cy="18" r="1.2" fill="#CBD5E1" />
        {/* Förbrukade dagar (rad 2, kryssade) */}
        <g transform="translate(0 24)">
          <circle cx="8" cy="0" r="3.5" fill="url(#wl-warm)" />
          <path
            d="M 6.5 -1.2 L 9.5 1.2 M 9.5 -1.2 L 6.5 1.2"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="0" r="3.5" fill="url(#wl-warm)" />
          <path
            d="M 14.5 -1.2 L 17.5 1.2 M 17.5 -1.2 L 14.5 1.2"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="24" cy="0" r="3.5" fill="url(#wl-warm)" />
          <path
            d="M 22.5 -1.2 L 25.5 1.2 M 25.5 -1.2 L 22.5 1.2"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Aktiv dag (idag - kryssad senast) */}
          <circle cx="32" cy="0" r="4" fill="url(#wl-deep)" />
          <path
            d="M 30 -1.5 L 33.5 1.5 M 33.5 -1.5 L 30 1.5"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* Framtida dagar */}
          <circle cx="40" cy="0" r="3" fill="none" stroke="#FED7AA" strokeWidth="1.2" />
        </g>
        {/* Vecko-räknare i botten */}
        <line
          x1="6"
          y1="36"
          x2="46"
          y2="36"
          stroke="#FED7AA"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="6"
          y1="40"
          x2="34"
          y2="40"
          stroke="#FED7AA"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>

      {/* Sparkles-prick i hörnet (premium-hint) */}
      <g transform="translate(96 24)">
        <circle cx="0" cy="0" r="9" fill="url(#wl-deep)" />
        <path
          d="M 0 -4 L 1.2 -1.2 L 4 0 L 1.2 1.2 L 0 4 L -1.2 1.2 L -4 0 L -1.2 -1.2 Z"
          fill="white"
        />
      </g>
    </svg>
  )
}

interface Props {
  /** Rubrik. Default: "Veckogräns nådd" */
  title?: string
  /** Förklarande text */
  description?: string
  /** Liten tidsindikation om relevant (t.ex. "Återställs på måndag") */
  resetHint?: string
}

/**
 * Tom-state-komponent för när användaren har slut på sin veckokvot.
 * Tydlig CTA till Premium med både primary-knapp och "Läs mer"-länk.
 * Designad i orange/röd-DNA med custom SVG-illustration.
 */
export default function WeeklyLimitReached({
  title = 'Veckogräns nådd',
  description = 'Du har använt alla dina CV-analyser denna vecka.',
  resetHint,
}: Props) {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <div
          className="relative bg-white rounded-3xl border border-orange-100 p-6 sm:p-8 text-center overflow-hidden"
          style={{
            boxShadow: '0 20px 40px -16px rgba(249, 115, 22, 0.18)',
          }}
        >
          {/* Glow-bakgrund */}
          <div
            className="hidden sm:block absolute -inset-3 rounded-3xl opacity-25 blur-2xl pointer-events-none -z-10"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }}
            aria-hidden="true"
          />

          {/* Orange topplist */}
          <div
            className="absolute top-0 inset-x-0 h-1"
            style={{
              background:
                'linear-gradient(90deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            }}
            aria-hidden="true"
          />

          {/* Illustration */}
          <div className="flex justify-center mb-5 mt-2">
            <WeeklyLimitIllustration className="w-32 h-32" />
          </div>

          {/* Eyebrow */}
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-2">
            Premium-funktion
          </div>

          {/* Rubrik */}
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight mb-2">
            {title}
          </h2>

          {/* Beskrivning */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-1">
            {description}
          </p>

          {resetHint && (
            <p className="text-xs text-slate-500 mb-5">{resetHint}</p>
          )}

          {/* Premium-värde */}
          <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 mb-5 text-left">
            <div className="flex items-start gap-2.5">
              <Sparkles
                className="w-4 h-4 text-orange-700 flex-shrink-0 mt-0.5"
                strokeWidth={2.4}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 mb-1.5">
                  Med Premium får du
                </p>
                <ul className="space-y-1 text-xs text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <span
                      className="mt-1 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    Obegränsade CV-analyser
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span
                      className="mt-1 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    Upp till 50 sparade CV
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span
                      className="mt-1 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    Obegränsade LinkedIn-optimeringar
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard/profil/prenumeration"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl text-white font-bold text-base transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              background:
                'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
              boxShadow: '0 12px 28px -10px rgba(220, 38, 38, 0.5)',
            }}
          >
            <span>Uppgradera till Premium</span>
            <ArrowRight className="w-5 h-5" strokeWidth={2.4} />
          </Link>

          {/* Sekundär länk */}
          <Link
            href="/priser"
            className="inline-block mt-3 text-xs font-bold text-slate-500 hover:text-orange-700 transition-colors"
          >
            Se alla planer och priser →
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
