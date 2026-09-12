'use client'

/**
 * Flödet bakom löftet "Dina uppgifter går aldrig till någon AI".
 *
 * Visar tre steg i en rad, vänster till höger:
 *   1. Profilen, låst och kvar hos oss.
 *   2. Det avidentifierade CV:t, alltså det enda AI:n ser. Streckad kontur
 *      och överstrukna kontaktrader säger att uppgifterna är borttagna.
 *   3. Det färdiga dokumentet, där kontaktuppgifterna satts in efteråt.
 *
 * Den streckade pilen från profilen går till steg tre, inte till AI-rutan.
 * Det är hela poängen med bilden: uppgifterna tar en annan väg än texten.
 *
 * Liggande, viewBox 240x96. Accentytan är profilens lås, eftersom det är
 * påståendet bilden ska bära.
 */

import { ILLU } from '@/components/illustrations/primitives'

export interface IntegritetsFlodeProps {
  className?: string
}

export default function IntegritetsFlode({ className }: IntegritetsFlodeProps) {
  return (
    <svg
      viewBox="0 0 240 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dina profiluppgifter stannar hos oss. AI:n får bara en avidentifierad version av ditt CV, och uppgifterna sätts in i det färdiga dokumentet efteråt."
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 1. Profilen, låst */}
      <rect
        x="2"
        y="20"
        width="58"
        height="56"
        rx="6"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={2}
      />
      <circle cx="31" cy="38" r="6" stroke="currentColor" strokeWidth={2} />
      <path d="M21 52a10 10 0 0 1 20 0" stroke="currentColor" strokeWidth={2} />
      {/* Låset, enda accentytan */}
      <rect x="24" y="58" width="14" height="11" rx="2" fill={ILLU.accent} />
      <path
        d="M27 58v-2.5a4 4 0 0 1 8 0V58"
        stroke="currentColor"
        strokeWidth={2}
      />

      {/* 2. Det AI:n ser: avidentifierat CV, streckad kontur */}
      <rect
        x="91"
        y="20"
        width="58"
        height="56"
        rx="6"
        stroke={ILLU.muted}
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      {/* Kompetensrader som finns kvar */}
      <g stroke="currentColor" strokeWidth={2} opacity="0.45">
        <path d="M101 33h38" />
        <path d="M101 41h30" />
        <path d="M101 63h26" />
      </g>
      {/* Överstrukna kontaktrader: borttagna före anropet */}
      <g stroke={ILLU.muted} strokeWidth={2}>
        <path d="M101 52h22" opacity="0.4" />
        <path d="M99 52h26" />
      </g>

      {/* 3. Färdigt dokument, uppgifterna insatta efteråt */}
      <rect
        x="180"
        y="20"
        width="58"
        height="56"
        rx="6"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={2}
      />
      <rect x="189" y="30" width="24" height="4" rx="2" fill={ILLU.accent} />
      <g stroke="currentColor" strokeWidth={2} opacity="0.45">
        <path d="M189 42h40" />
        <path d="M189 50h40" />
        <path d="M189 58h32" />
        <path d="M189 66h24" />
      </g>

      {/* Texten går genom AI:n */}
      <path d="M64 48h22" stroke="currentColor" strokeWidth={2} opacity="0.5" />
      <path d="M82 44l4 4-4 4" stroke="currentColor" strokeWidth={2} opacity="0.5" />
      <path d="M153 48h22" stroke="currentColor" strokeWidth={2} opacity="0.5" />
      <path d="M171 44l4 4-4 4" stroke="currentColor" strokeWidth={2} opacity="0.5" />

      {/* Uppgifterna tar vägen runt, aldrig genom AI-rutan */}
      <path
        d="M31 78v6a4 4 0 0 0 4 4h170a4 4 0 0 0 4-4v-6"
        stroke={ILLU.accent}
        strokeWidth={2}
        strokeDasharray="5 4"
      />
      <path d="M205 82l4-4 4 4" stroke={ILLU.accent} strokeWidth={2} />
    </svg>
  )
}
