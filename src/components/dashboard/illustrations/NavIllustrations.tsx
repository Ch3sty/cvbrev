'use client'

/**
 * Ikoner för mobilens bottennavigation och Skapa-arket
 * (docs/plan-inloggat-omdesign.md, avsnitt 3 och våg 1 punkt 9).
 *
 * Egna SVG enligt docs/designsystem.md, aldrig lucide i gradientruta och
 * aldrig Sparkles. Konturer i currentColor så att navets aktiva tillstånd
 * styrs av textfärgen och ingen ikon behöver två varianter.
 *
 * Regler från src/components/illustrations/primitives.tsx:
 *   viewBox 24  ->  linjetjocklek 1.5, hörnradie 2
 * Navet renderar i 24 px, Skapa-arket i 24 px bredvid radrubriken.
 * Inga fyllningar i vitt, inga gradienter: de här är piktogram i en rad,
 * inte illustrationer i ett tomt tillstånd.
 */

import { ILLU, IlluSvg, type IlluProps } from '@/components/illustrations/primitives'

const SW = ILLU.stroke[24]
const R = ILLU.radius[24]

/** Hem: tak och dörr. Enklast möjliga, eftersom den bär "tillbaka till start". */
export function NavHemIllu({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <path
        d="M4 10.5 12 4l8 6.5"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M6 10v9.5h12V10"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path
        d="M10 19.5v-5h4v5"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </IlluSvg>
  )
}

/**
 * Ansökningar: en stapel dokument med en bock på det översta. Bocken är
 * poängen, det är svaret användaren väntar på som gör sidan värd att öppna.
 */
export function NavAnsokningarIllu({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <path
        d="M7 5.5h8.5L19 9v9.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M15 5.5V9h3.5" stroke="currentColor" strokeWidth={SW} />
      <path d="m9 14 2 2 4-4" stroke="currentColor" strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Skapa: ett plus i en ruta. Rutan skiljer den från en ren FAB-plus. */
export function NavSkapaIllu({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx={R}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M12 8.5v7M8.5 12h7" stroke="currentColor" strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Profil: huvud och axlar. */
export function NavProfilIllu({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth={SW} />
      <path
        d="M5.5 19.5a6.5 6.5 0 0 1 13 0"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </IlluSvg>
  )
}

/* ---------- Skapa-arkets tre rader ---------- */

/** Nytt brev: kuvert med penna. */
export function SkapaBrevIllu({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <path
        d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7.5"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M4 7v10a1 1 0 0 0 1 1h7" stroke="currentColor" strokeWidth={SW} />
      <path d="m4.5 7.5 7.5 5 7.5-5" stroke="currentColor" strokeWidth={SW} />
      <path
        d="m19 15.5-3.5 3.5-2 .5.5-2L17.5 14a1 1 0 0 1 1.5 1.5Z"
        stroke="currentColor"
        strokeWidth={SW}
      />
    </IlluSvg>
  )
}

/** Nytt CV: dokument med en pil uppåt, alltså uppladdning. */
export function SkapaCvIllu({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <path
        d="M6 10.5V5.5a1 1 0 0 1 1-1h6L18 9v9.5a1 1 0 0 1-1 1h-4"
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="M13 4.5V9h4.5" stroke="currentColor" strokeWidth={SW} />
      <path d="M7 20v-7.5" stroke="currentColor" strokeWidth={SW} />
      <path d="m4.5 15 2.5-2.5L9.5 15" stroke="currentColor" strokeWidth={SW} />
    </IlluSvg>
  )
}

/** Logga ansökan: bockad ruta i en lista. */
export function SkapaAnsokanIllu({ className, size, title }: IlluProps) {
  return (
    <IlluSvg box={24} size={size} className={className} title={title}>
      <rect
        x="4"
        y="4.5"
        width="8"
        height="8"
        rx={R}
        stroke="currentColor"
        strokeWidth={SW}
      />
      <path d="m6.5 8.5 1.5 1.5 3-3.5" stroke="currentColor" strokeWidth={SW} />
      <path d="M15 7h5" stroke="currentColor" strokeWidth={SW} />
      <path d="M4 16.5h16" stroke="currentColor" strokeWidth={SW} />
      <path d="M4 20h11" stroke="currentColor" strokeWidth={SW} />
    </IlluSvg>
  )
}
