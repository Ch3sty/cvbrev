/**
 * Ikonerna i mallflödet (docs/design/skiss-mallar-2026-11-15.html, ikonsatsen
 * överst i skissen). 24-viewBox, kontur 1,75, runda ändar, currentColor, som
 * Tråden i Ikoner.tsx.
 *
 * Ägarens punkt 2 och 4 (2026-11-15): inga v-pilar (chevrons) någonstans i
 * mallflödet, riktiga ikoner i stället, och PDF och Word som filikoner i
 * formatvalet och på knappen. Aldrig gnistikonen.
 *
 * Inga hooks och ingen 'use client': ikonerna renderas på servern och i
 * klientkomponenter.
 */

import type { SVGProps } from 'react'

export interface MallIkonProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Renderad storlek i px. Standard 18, som i skissen. */
  size?: number
  title?: string
}

function Ikon({ size = 18, title, children, ...svg }: MallIkonProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
      {...svg}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export const IkonStang = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Ikon>
)
export const IkonPenna = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M4 20l4-1 11-11-3-3L5 16z" />
    <path d="M13 8l3 3" />
  </Ikon>
)
export const IkonUppladdning = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M12 15.5V4M7.5 8.5L12 4l4.5 4.5" />
    <path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Ikon>
)
export const IkonLaddaNerFil = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5" />
    <path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Ikon>
)
export const IkonDela = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M12 15V4M8 8l4-4 4 4" />
    <path d="M5 13v5.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V13" />
  </Ikon>
)
export const IkonOppna = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M19 13v5.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-11A1.5 1.5 0 0 1 6.5 6H12" />
  </Ikon>
)
export const IkonZoom = (p: MallIkonProps) => (
  <Ikon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5" />
  </Ikon>
)
export const IkonSok = (p: MallIkonProps) => (
  <Ikon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Ikon>
)
export const IkonBock = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Ikon>
)
export const IkonLas = (p: MallIkonProps) => (
  <Ikon {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Ikon>
)
/** PDF som filikon: arket med hörnet och bokstäverna PDF. */
export const IkonPdf = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
    <path d="M14 3.5v5h5" />
    <path d="M8 17v-5h1.6a1.5 1.5 0 0 1 0 3H8M12.2 17v-5h1.3a2.5 2.5 0 0 1 0 5h-1.3M16.3 17v-5h2.4M16.3 14.5h2" />
  </Ikon>
)
/** Word som filikon: arket med hörnet och ett W. */
export const IkonWord = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
    <path d="M14 3.5v5h5" />
    <path d="M8 12l1.4 5 1.6-4 1.6 4 1.4-5" />
  </Ikon>
)
export const IkonTypsnitt = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M3.5 18l4-11 4 11M5 14.5h5" />
    <path d="M14.5 13.5a2.5 2.5 0 0 1 5 0V18M19.5 15.8c-1.4-.3-5 0-5 1.6 0 1.6 3.6 1.2 5-.4" />
  </Ikon>
)
export const IkonFarg = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M12 3.5c-4.7 0-8.5 3.6-8.5 8s3.8 8 8.5 8c1 0 1.5-.6 1.5-1.3 0-.6-.5-1-.5-1.7 0-.7.6-1.2 1.4-1.2h1.6c2.5 0 4.5-1.7 4.5-4 0-4.3-3.8-7.8-8.5-7.8z" />
    <circle cx="8" cy="11" r="1" />
    <circle cx="11.5" cy="7.5" r="1" />
    <circle cx="16" cy="9" r="1" />
  </Ikon>
)
export const IkonFoto = (p: MallIkonProps) => (
  <Ikon {...p}>
    <rect x="3.5" y="6.5" width="17" height="13" rx="2" />
    <path d="M8.5 6.5l1.5-2.5h4l1.5 2.5" />
    <circle cx="12" cy="13" r="3.5" />
  </Ikon>
)
export const IkonOrdning = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M4 7h16M4 12h10M4 17h7" />
    <path d="M18 11v9M15 17l3 3 3-3" />
  </Ikon>
)
export const IkonTillbaka = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Ikon>
)
export const IkonRutnat = (p: MallIkonProps) => (
  <Ikon {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Ikon>
)
export const IkonPek = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M9 11.5V5a1.5 1.5 0 0 1 3 0v6M12 10.5a1.5 1.5 0 0 1 3 0v2M15 11.5a1.5 1.5 0 0 1 3 0v4.5a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-4.2-2.3L4.5 14a1.4 1.4 0 0 1 2.3-1.6L9 15v-3.5" />
  </Ikon>
)
/** Sidbrickan: ett ark. */
export const IkonSida = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" />
    <path d="M14 3.5v5h5" />
  </Ikon>
)
/** Filtret i toppraden ("Visa"): tre linjer som smalnar av. */
export const IkonFilter = (p: MallIkonProps) => (
  <Ikon {...p}>
    <path d="M4 7h16M7 12h10M10 17h4" />
  </Ikon>
)
/** Info om en mall. */
export const IkonInfo = (p: MallIkonProps) => (
  <Ikon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 8h.01" />
  </Ikon>
)

/** Google-märket i kontoarket finns i AuthIllustrations (GoogleMark). */
