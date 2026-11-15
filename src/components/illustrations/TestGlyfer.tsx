/**
 * Testtypernas nio glyfer (testelementet Nio, granskning-art-director.md
 * avsnitt 2, beslut om säljytorna 2026-11-15). 48-box, kontur 2, exakt en
 * kopparyta per symbol, ingen bakgrundscirkel. Kopparytan läser
 * ILLU.accent, alltså --illu-accent, så att TestBredd kan släcka den
 * (currentColor) på alla glyfer utom den markerade.
 *
 * Utan 'use client': inga hooks och inga gradienter, så publika
 * serverkomponenter ritar dem utan klient-JS. Sex av dem fanns i
 * RumSymboler.tsx och flyttades hit (RumSymboler re-exporterar dem); tre är
 * nya: SymTalserie, SymSpatial och SymVerbal, med art-directors koordinater.
 */

import { ILLU, IlluSvg, type IlluProps } from './primitives-bas'

const K = ILLU.accent

/** Matrislogik (#s-matris): rutnät med figurer, kopparfältet är den tomma rutan. */
export function SymMatris(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="6" y="6" width="36" height="36" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M18 6v36M30 6v36M6 18h36M6 30h36" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
      <rect x="21.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
      <path d="M36 9.4l3 5.2h-6z" fill="currentColor" />
      <rect x="9.5" y="21.5" width="5" height="5" rx="1" fill="currentColor" />
      <path d="M24 21.4l3 5.2h-6z" fill="currentColor" />
      <circle cx="36" cy="24" r="2.6" fill="currentColor" />
      <path d="M12 33.4l3 5.2h-6z" fill="currentColor" />
      <circle cx="24" cy="36" r="2.6" fill="currentColor" />
      <rect x="31.5" y="31.5" width="9" height="9" rx="2" fill="none" stroke={K} strokeWidth="2" strokeDasharray="3 2.5" />
    </IlluSvg>
  )
}

/** Figurer (#s-figurer, spec 15.3): en remsa med tre rutor, triangel och kvadrat, luckan sist i koppar. */
export function SymFigurer(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="4" y="15" width="40" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M17.3 15v18M30.6 15v18" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
      <path d="M10.7 19.5l3.6 6.2h-7.2z" fill="currentColor" />
      <rect x="21.6" y="21.6" width="4.8" height="4.8" rx="1" fill="currentColor" />
      <rect x="33.6" y="19.6" width="8" height="8" rx="2" fill="none" stroke={K} strokeWidth="2" strokeDasharray="3 2.5" />
    </IlluSvg>
  )
}

/**
 * Deduktivt (testplanen steg 1): IlluDeduktivs motiv i 48 px. Två
 * villkorsrader och en remsa med fyra platser, platsen svaret fyller i koppar.
 */
export function SymDeduktiv(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <path d="M8 11h22M8 18h15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      <rect x="4" y="25" width="40" height="15" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M14 25v15M24 25v15M34 25v15" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
      <rect x="7" y="30" width="4" height="5" rx="1" fill="currentColor" />
      <rect x="17" y="30" width="4" height="5" rx="1" fill="currentColor" />
      <rect x="27" y="29" width="6" height="7" rx="1.5" fill={K} />
      <rect x="37" y="30" width="4" height="5" rx="1" fill="currentColor" />
    </IlluSvg>
  )
}

/** Siffror (#s-siffror): tabell och staplar, den höga stapeln i koppar. */
export function SymSiffror(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="5" y="8" width="22" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M5 16h22M5 24h22M5 32h22M14 8v30" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
      <rect x="31" y="26" width="5" height="12" rx="1.5" fill="currentColor" opacity=".55" />
      <rect x="38" y="14" width="5" height="24" rx="1.5" fill={K} />
      <path d="M29 40h15" stroke="currentColor" strokeWidth="2" />
    </IlluSvg>
  )
}

/** Ord (#s-ord): textrader, ett ord markerat i koppar. */
export function SymOrd(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="6" y="7" width="36" height="34" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16h24M12 23h9M12 30h24M12 37h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      <rect x="23" y="20" width="14" height="6" rx="3" fill={K} />
    </IlluSvg>
  )
}

/** Personlighet (#s-person): skala med visare, nålens fäste i koppar. */
export function SymPerson(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <path d="M8 30a16 16 0 0 1 32 0" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 30h32" stroke="currentColor" strokeWidth="2" />
      <path d="M12 21l3 2M24 14v4M36 21l-3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" />
      <circle cx="29" cy="22" r="3.5" fill={K} />
      <path d="M24 30l5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 38h28" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
    </IlluSvg>
  )
}

/** Talserier: fyra celler på rad med en, två och tre punkter, luckan sist i koppar. */
export function SymTalserie(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="4" y="16" width="40" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M14 16v16M24 16v16M34 16v16" stroke="currentColor" strokeWidth="1.5" opacity=".5" />
      <circle cx="9" cy="24" r="2" fill="currentColor" />
      <circle cx="17" cy="24" r="2" fill="currentColor" />
      <circle cx="21" cy="24" r="2" fill="currentColor" />
      <circle cx="26" cy="24" r="1.6" fill="currentColor" />
      <circle cx="29" cy="24" r="1.6" fill="currentColor" />
      <circle cx="32" cy="24" r="1.6" fill="currentColor" />
      <rect x="36.5" y="19.5" width="5" height="9" rx="1.5" fill="none" stroke={K} strokeWidth="2" strokeDasharray="3 2.5" />
    </IlluSvg>
  )
}

/** Spatial förmåga: isometrisk kub, toppytan i koppar. */
export function SymSpatial(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <path d="M24 9 L38 17 L38 33 L24 41 L10 33 L10 17 Z" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 25 L24 41 M24 25 L10 17 M24 25 L38 17" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M24 9 L38 17 L24 25 L10 17 Z" fill={K} />
    </IlluSvg>
  )
}

/** Verbalt resonemang: text och ett ställningstagande, bocken i koppar. */
export function SymVerbal(p: IlluProps) {
  return (
    <IlluSvg box={48} {...p}>
      <rect x="6" y="7" width="36" height="34" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 15h24M12 21h18M12 27h24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      <path d="M12 35.5l3 3 5.5-6" fill="none" stroke={K} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 33l6 6M35 33l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".6" />
    </IlluSvg>
  )
}

/* ------------------------------------------------------------ Nio */

/** De nio testtyperna, i rutnätets ordning rad för rad. */
export const TEST_TYPER = [
  'matris',
  'figurer',
  'deduktiv',
  'talserier',
  'spatial',
  'ordforrad',
  'verbalt',
  'numeriskt',
  'personlighet',
] as const

export type TestTyp = (typeof TEST_TYPER)[number]

export const TESTGLYFER: Record<TestTyp, (p: IlluProps) => React.JSX.Element> = {
  matris: SymMatris,
  figurer: SymFigurer,
  deduktiv: SymDeduktiv,
  talserier: SymTalserie,
  spatial: SymSpatial,
  ordforrad: SymOrd,
  verbalt: SymVerbal,
  numeriskt: SymSiffror,
  personlighet: SymPerson,
}

/** Typernas namn, för skärmläsartexter. */
export const TEST_TYP_NAMN: Record<TestTyp, string> = {
  matris: 'matrislogik',
  figurer: 'figurserier',
  deduktiv: 'deduktiv slutledning',
  talserier: 'talserier',
  spatial: 'spatial förmåga',
  ordforrad: 'ordförråd',
  verbalt: 'verbalt resonemang',
  numeriskt: 'numeriskt resonemang',
  personlighet: 'personlighetstest',
}

/**
 * Testtypen i Nio för en kind i testkonfigurationen eller provet utan konto
 * ("figurserie", "numerisk", "talserie" ...). Okänd kind ger undefined.
 */
const TYP_FOR_KIND: Record<string, TestTyp> = {
  matris: 'matris',
  figurserie: 'figurer',
  deduktiv: 'deduktiv',
  talserie: 'talserier',
  spatial: 'spatial',
  ordforrad: 'ordforrad',
  verbal: 'verbalt',
  numerisk: 'numeriskt',
  personlighet: 'personlighet',
}

export function testTypForKind(kind: string | null | undefined): TestTyp | undefined {
  return kind ? TYP_FOR_KIND[kind] : undefined
}
