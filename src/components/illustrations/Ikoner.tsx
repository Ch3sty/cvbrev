/**
 * Ikoner, Tråden (docs/designsystem.md, "Ikoner").
 *
 * Tolv motiv ritade i docs/design/rod-trad-preview.html. 24 px, stroke 1,75,
 * currentColor, i text-ink-2. Bredare proportioner än Lucide och en avsiktlig
 * asymmetri per motiv: dörren sitter till höger på huset, fotot till vänster
 * på CV:t, plusset i nedre högra hörnet på Skapa.
 *
 * Accentformen (elementet med fill var(--ia)) är tom överallt utom på
 * marginalplattan, där MarginPlate sätter --ia: var(--accent). Samma symbol,
 * två lägen, ingen extra fil.
 *
 * Lucide används fortfarande för pil, kryss, chevron och meny. Aldrig
 * Sparkles. Aldrig emoji.
 *
 * Inga React-hooks, ingen 'use client': ikonerna renderas på servern.
 */

import type { SVGProps } from 'react'

export interface IkonProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Renderad storlek i px. Standard 24. */
  size?: number
  /** Tillgängligt namn. Utan titel är ikonen dekorativ. */
  title?: string
}

/** Accentformens fyllning. Tom tills en platta tänder den. */
const IA = { fill: 'var(--ia, none)', stroke: 'none' } as const

function Ikon({
  size = 24,
  title,
  className,
  children,
  ...svg
}: IkonProps & { children: React.ReactNode }) {
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
      className={className}
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

/** Hem: hus med dörren till höger. Dörren är accentformen. */
export function IkonHem(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v10.5h13V10" />
      <path style={IA} d="M13.5 20.5v-5.5h3.5v5.5z" />
      <path d="M13.5 20.5v-5.5h3.5v5.5" />
    </Ikon>
  )
}

/** Ansökningar: mapp med flik. Fliken är accentformen. */
export function IkonAnsokningar(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path style={IA} d="M4.5 6H9l2 2H3.6A1.5 1.5 0 0 1 4.5 6z" />
      <path d="M3 11h18" />
    </Ikon>
  )
}

/** Skapa: ark med plus i nedre högra hörnet. Plussets cirkel är accentformen. */
export function IkonSkapa(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M5.5 3h8.5l4.5 4.5V13" />
      <path d="M5.5 3v18h7" />
      <path d="M14 3v4.5h4.5" />
      <circle style={IA} cx="17" cy="17.5" r="4.5" />
      <path d="M17 15v5M14.5 17.5h5" />
    </Ikon>
  )
}

/** Profil: huvud och axlar, axeln till höger är accentformen. */
export function IkonProfil(props: IkonProps) {
  return (
    <Ikon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20.5c.8-4.5 4-7 8-7 3.2 0 5.8 1.6 7.2 4.4" />
      <path style={IA} d="M14.5 20.5a5 5 0 0 1 5.5-4.2v4.2z" />
      <path d="M20 16.3v4.2" />
    </Ikon>
  )
}

/** Brev: kuvert, fliken är accentformen. */
export function IkonBrev(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M2.5 8.5A2 2 0 0 1 4.5 6.5h15a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z" />
      <path d="M2.5 9 12 14.5 21.5 9" />
      <path style={IA} d="M2.5 9 12 14.5 21.5 9V8.5a2 2 0 0 0-2-2h-15a2 2 0 0 0-2 2z" />
    </Ikon>
  )
}

/** CV: ark med vikt hörn och fotot till vänster. Hörnet är accentformen. */
export function IkonCv(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M5 3h9.5L19 7.5V21H5z" />
      <path style={IA} d="M14.5 3v4.5H19z" />
      <path d="M14.5 3v4.5H19" />
      <circle cx="9.5" cy="11" r="2" />
      <path d="M14 11h2.5M8 16.5h8M8 19h4.5" />
    </Ikon>
  )
}

/** Analys: förstoringsglas, övre högra kvadranten är accentformen. */
export function IkonAnalys(props: IkonProps) {
  return (
    <Ikon {...props}>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M14.8 14.8 21 21" />
      <path style={IA} d="M10 3.5a6.5 6.5 0 0 1 6.5 6.5H10z" />
      <path d="M7 10h6M10 7v6" />
    </Ikon>
  )
}

/** Professionell: byggnad, dörren är accentformen. */
export function IkonProfessionell(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M3 20.5h18" />
      <path d="M5 20.5V6.5l7-3.5 7 3.5v14" />
      <path d="M8.5 10h2M13.5 10h2M8.5 13.5h2M13.5 13.5h2" />
      <path style={IA} d="M10 20.5v-4.5h4v4.5z" />
      <path d="M10 20.5v-4.5h4v4.5" />
    </Ikon>
  )
}

/** Entusiastisk: pratbubbla med stigande staplar, den högsta är accentformen. */
export function IkonEntusiastisk(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M3.5 5.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7L7 20v-3.5H5.5a2 2 0 0 1-2-2z" />
      <path d="M8 13v-2.5M11.5 13V8.5" />
      <path style={IA} d="M14 6.5h2.5V13H14z" />
      <path d="M15.25 13V6.5" />
    </Ikon>
  )
}

/** Kreativ: penna, spetsen är accentformen. */
export function IkonKreativ(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M4 20l1.6-5.4L15.4 4.8a2.2 2.2 0 0 1 3.1 3.1L8.7 17.7z" />
      <path d="M13.5 6.7 17.3 10.5" />
      <path style={IA} d="M5.6 14.6 8.7 17.7 4 20z" />
      <path d="M12 20h8.5" />
    </Ikon>
  )
}

/** Självsäker: vimpel, duken är accentformen. */
export function IkonSjalvsaker(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M6 21V3.5" />
      <path style={IA} d="M6 4h12.5l-3.2 4.5 3.2 4.5H6z" />
      <path d="M6 4h12.5l-3.2 4.5 3.2 4.5H6" />
    </Ikon>
  )
}

/** Balanserad: våg, högra skålen är accentformen. */
export function IkonBalanserad(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M12 3.5v17M6 20.5h12" />
      <path d="M12 6l6.5 1.5M12 6 5.5 7.5" />
      <path d="M3 13.5 5.5 7.5 8 13.5a2.5 2.5 0 0 1-5 0z" />
      <path style={IA} d="M16 13.5 18.5 7.5 21 13.5a2.5 2.5 0 0 1-5 0z" />
      <path d="M16 13.5 18.5 7.5 21 13.5a2.5 2.5 0 0 1-5 0z" />
    </Ikon>
  )
}

/* ---------- Skalets egna piktogram, samma språk ---------- */

/** Notisklocka. */
export function IkonKlocka(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M6 3.5v3.5M18 3.5v3.5" />
      <path d="M12 3a7 7 0 0 1 7 7v3.5l1.8 2.4H3.2L5 13.5V10a7 7 0 0 1 7-7z" />
      <path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" />
    </Ikon>
  )
}

/** Meddelanden: två pratbubblor. */
export function IkonMeddelanden(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M3 6.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-3.5 3v-3H5a2 2 0 0 1-2-2z" />
      <path d="M18.5 9h.5a2 2 0 0 1 2 2v5.5a2 2 0 0 1-2 2h-1v2.5l-3-2.5h-3" />
    </Ikon>
  )
}

/** Hjälp: frågetecken i cirkel. */
export function IkonHjalp(props: IkonProps) {
  return (
    <Ikon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8v.5" />
      <path d="M12 17h.01" />
    </Ikon>
  )
}

/** Fel: utropstecken i cirkel. */
export function IkonFel(props: IkonProps) {
  return (
    <Ikon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8v5M12 16h.01" />
    </Ikon>
  )
}

/** Sköld, för admin. */
export function IkonSkold(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M12 3 20 6v6c0 4.5-3.5 8-8 9.5C7.5 20 4 16.5 4 12V6z" />
      <path d="M9 12l2 2 4-4.5" />
    </Ikon>
  )
}

/** Krona, för Premium-raden. */
export function IkonKrona(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M3.5 8 7 12l5-6.5 5 6.5 3.5-4-1.5 10h-14z" />
      <path style={IA} d="M5.5 20.5h13l.4-2.5H5.1z" />
      <path d="M5.1 18h13.8" />
    </Ikon>
  )
}

/** Nedladdning: pil ner i låda. */
export function IkonLaddaNer(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5" />
      <path d="M4 15.5v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </Ikon>
  )
}

/** Länk, för LinkedIn-raden: två kedjelänkar. */
export function IkonLank(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </Ikon>
  )
}

/** Matchning: två överlappande cirklar, snittet är accentformen. */
export function IkonMatchning(props: IkonProps) {
  return (
    <Ikon {...props}>
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
      <path style={IA} d="M12 6.8a6 6 0 0 1 0 10.4 6 6 0 0 1 0-10.4z" />
    </Ikon>
  )
}

/** Mallar: två ark, det främre är accentformen. */
export function IkonMallar(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M8 3.5h10a1.5 1.5 0 0 1 1.5 1.5v11" />
      <path style={IA} d="M4.5 7.5A1.5 1.5 0 0 1 6 6h9a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 15 20.5H6A1.5 1.5 0 0 1 4.5 19z" />
      <path d="M4.5 7.5A1.5 1.5 0 0 1 6 6h9a1.5 1.5 0 0 1 1.5 1.5V19A1.5 1.5 0 0 1 15 20.5H6A1.5 1.5 0 0 1 4.5 19z" />
      <path d="M7.5 10.5h6M7.5 13.5h6M7.5 16.5h3.5" />
    </Ikon>
  )
}

/** Synlig: öga, för Bli upptäckt. Pupillen är accentformen. */
export function IkonSynlig(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z" />
      <circle style={IA} cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="3" />
    </Ikon>
  )
}

/**
 * Intervju: två pratbubblor, frågan till vänster och svaret till höger
 * (docs/design/rod-trad-prov-2026-09-24.html, sidomenyn). Svarsbubblan är
 * accentformen.
 */
export function IkonIntervju(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M4 5h11v8H8l-4 3z" />
      <path style={IA} d="M13 11h7v8h-3l-3 2v-2h-1z" />
      <path d="M13 11h7v8h-3l-3 2v-2h-1" />
    </Ikon>
  )
}

/** Bugg: skalbagge. */
export function IkonBugg(props: IkonProps) {
  return (
    <Ikon {...props}>
      <path d="M8 9a4 4 0 0 1 8 0" />
      <path d="M9 6.5 7.5 5M15 6.5 16.5 5" />
      <rect x="7.5" y="9" width="9" height="11" rx="4.5" />
      <path d="M12 11v9" />
      <path d="M3.5 12h4M3.5 16h4M16.5 12h4M16.5 16h4" />
    </Ikon>
  )
}

/** Alla motiv i kartform, för ytor som väljer ikon efter nyckel. */
export const IKONER = {
  hem: IkonHem,
  ansokningar: IkonAnsokningar,
  skapa: IkonSkapa,
  profil: IkonProfil,
  brev: IkonBrev,
  cv: IkonCv,
  analys: IkonAnalys,
  professionell: IkonProfessionell,
  entusiastisk: IkonEntusiastisk,
  kreativ: IkonKreativ,
  sjalvsaker: IkonSjalvsaker,
  balanserad: IkonBalanserad,
} as const

export type IkonNamn = keyof typeof IKONER

/** Rekryteringstester: tre rutor och ett plus, som i registreringens val (profil-registrering 2026-09-24). */
export function IkonTest(props: IkonProps) {
  return (
    <Ikon {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <path d="M16.5 13.5v6M13.5 16.5h6" />
    </Ikon>
  )
}
