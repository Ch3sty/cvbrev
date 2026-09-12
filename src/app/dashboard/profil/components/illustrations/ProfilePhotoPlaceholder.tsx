'use client'

/**
 * Platshållare när profilbild saknas (profil-spec, sektion 1).
 *
 * Egen SVG enligt src/components/illustrations/primitives.tsx, inte en
 * lucide-ikon i en gradientruta. viewBox 48 ger linjetjocklek 2 och
 * hörnradie 4 enligt tabellen i designsystemet.
 *
 * Motivet är en porträttram, inte en avatar: bilden det handlar om hamnar i
 * ett CV, och ramen säger det utan text.
 */

import {
  ILLU,
  IlluSvg,
  type IlluProps,
} from '@/components/illustrations/primitives'

const SW = ILLU.stroke[48]
const R = ILLU.radius[48]

export default function ProfilePhotoPlaceholder({
  className,
  size,
  title,
}: IlluProps) {
  return (
    <IlluSvg box={48} size={size} className={className} title={title}>
      {/* Ramen */}
      <rect
        x="7"
        y="6"
        width="34"
        height="36"
        rx={R}
        stroke="currentColor"
        strokeWidth={SW}
      />
      {/* Huvud */}
      <circle cx="24" cy="20" r="5.5" stroke="currentColor" strokeWidth={SW} />
      {/* Axlar, avskurna av ramen nedtill */}
      <path
        d="M14.5 36.5a9.5 9.5 0 0 1 19 0"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </IlluSvg>
  )
}
