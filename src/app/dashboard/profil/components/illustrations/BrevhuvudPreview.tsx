'use client'

/**
 * Levande miniatyr av brevhuvudet och CV-toppen.
 *
 * Visar VAR uppgifterna hamnar i stället för att bara påstå det i en textrad.
 * Fält som är ifyllda renderas som riktig text, tomma fält som streckade
 * platshållare, så att illustrationen fyller i sig själv medan användaren
 * skriver. Det gör kopplingen mellan formuläret och resultatet omedelbar.
 *
 * Liggande format, viewBox 240x136. Linjetjocklek och radie följer
 * primitives-tabellen för 240: stroke 6 på ramen skulle bli klumpigt i ett
 * så här tätt motiv, så konturen använder 240-skalans tunnare inre linje
 * (1.5) och ramen 2. Motivet är ett dokument, inte ett piktogram.
 *
 * All text renderas med SVG-text i currentColor. Accentytan är en enda:
 * den orange linjen under namnet, alltså det fält som betyder mest.
 */

import { ILLU, useIlluId } from '@/components/illustrations/primitives'

export interface BrevhuvudPreviewProps {
  fullName: string
  phone: string
  location: string
  hasPhoto: boolean
  showPhone: boolean
  showLocation: boolean
  className?: string
}

/** Klipper text som annars spiller ut ur miniatyren. */
function fit(value: string, max: number): string {
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1)}…`
}

export default function BrevhuvudPreview({
  fullName,
  phone,
  location,
  hasPhoto,
  showPhone,
  showLocation,
  className,
}: BrevhuvudPreviewProps) {
  const uid = useIlluId()
  const clipId = `${uid}-clip`

  const name = fit(fullName, 22)
  const hasName = name.length > 0
  const phoneText = fit(phone, 18)
  const hasPhone = phoneText.length > 0 && showPhone
  const locationText = fit(location, 16)
  const hasLocation = locationText.length > 0 && showLocation

  return (
    <svg
      viewBox="0 0 240 136"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={
        hasName
          ? `Förhandsvisning av brevhuvudet med namnet ${name}`
          : 'Förhandsvisning av brevhuvudet, ditt namn saknas än'
      }
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0.75" y="0.75" width="238.5" height="134.5" rx="8" />
        </clipPath>
      </defs>

      {/* Pappersytan */}
      <rect
        x="0.75"
        y="0.75"
        width="238.5"
        height="134.5"
        rx="8"
        fill={ILLU.fill}
        stroke="currentColor"
        strokeWidth={2}
      />

      <g clipPath={`url(#${clipId})`}>
        {/* Fotorutan uppe till höger, som i mallarna med plats för porträtt */}
        {hasPhoto ? (
          <>
            <rect
              x="186"
              y="16"
              width="36"
              height="40"
              rx="4"
              fill={ILLU.soft}
              stroke="currentColor"
              strokeWidth={1.5}
            />
            <circle cx="204" cy="31" r="6" stroke="currentColor" strokeWidth={1.5} />
            <path
              d="M193 50a11 11 0 0 1 22 0"
              stroke="currentColor"
              strokeWidth={1.5}
            />
          </>
        ) : (
          <rect
            x="186"
            y="16"
            width="36"
            height="40"
            rx="4"
            stroke={ILLU.muted}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        {/* Namnet, störst i dokumentet */}
        {hasName ? (
          <text
            x="18"
            y="34"
            fill="currentColor"
            fontSize="15"
            fontWeight="600"
            fontFamily="system-ui, sans-serif"
          >
            {name}
          </text>
        ) : (
          <rect
            x="18"
            y="22"
            width="104"
            height="13"
            rx="3"
            stroke={ILLU.muted}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        {/* Accentlinjen under namnet: enda accentytan i illustrationen */}
        <rect x="18" y="42" width="46" height="3" rx="1.5" fill={ILLU.accent} />

        {/* Kontaktraden */}
        {hasPhone ? (
          <text
            x="18"
            y="62"
            fill="currentColor"
            fontSize="9"
            opacity="0.75"
            fontFamily="system-ui, sans-serif"
          >
            {phoneText}
          </text>
        ) : (
          <rect
            x="18"
            y="54"
            width="62"
            height="8"
            rx="2"
            stroke={ILLU.muted}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        {hasLocation ? (
          <text
            x="104"
            y="62"
            fill="currentColor"
            fontSize="9"
            opacity="0.75"
            fontFamily="system-ui, sans-serif"
          >
            {locationText}
          </text>
        ) : (
          <rect
            x="104"
            y="54"
            width="52"
            height="8"
            rx="2"
            stroke={ILLU.muted}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        {/* Brödtexten: alltid streck, den skrivs inte här */}
        <g stroke="currentColor" strokeWidth={1.5} opacity="0.2">
          <path d="M18 82h204" />
          <path d="M18 94h204" />
          <path d="M18 106h186" />
          <path d="M18 118h142" />
        </g>
      </g>
    </svg>
  )
}
