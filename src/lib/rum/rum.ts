// src/lib/rum/rum.ts
//
// Rummen (spec-rummen-2026-10-10 avsnitt 4.1 och 5). Varje route i
// inloggat hör till ett rum: Träningen (indigo), CV (petrol), Personliga
// brev (plommon), Jobbsöket (skog) eller kontot (grafit). Rummet sätts som
// data-rum på skalet redan i serverns HTML (layouten läser x-pathname ur
// proxyn) och följer usePathname på klienten.
//
// Klientsäker: ren data och rena funktioner.

import { DORR_ETIKETT } from './copy'

export type Rum = 'tran' | 'cv' | 'brev' | 'jobb' | 'neutral'

export const RUMMEN: readonly Rum[] = ['tran', 'cv', 'brev', 'jobb', 'neutral']

/** Sant om sökvägen är prefixet eller ligger under det. */
function under(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + '/')
}

const TRAN = ['/dashboard/tester']
const CV = [
  '/dashboard/profil/cv',
  '/dashboard/skapa-cv',
  '/dashboard/cv-analys',
  '/dashboard/cv-mallar',
  '/dashboard/linkedin-optimizer',
]
const BREV = ['/dashboard/mina-brev', '/dashboard/skapa-brev']
const NEUTRAL = [
  '/dashboard/profil',
  '/dashboard/valj-spar',
  '/dashboard/kontakt',
  '/dashboard/bugg-feedback',
  '/dashboard/valkommen',
  '/dashboard/vecka',
]

/**
 * Rummet för en sökväg, tabellen i spec avsnitt 5, i ordning: första
 * träff vinner. Allt annat under /dashboard är Jobbsöket.
 */
export function rumForPath(pathname: string | null | undefined): Rum {
  const p = (pathname ?? '/dashboard').split('?')[0].replace(/\/+$/, '') || '/dashboard'
  if (TRAN.some((x) => under(p, x))) return 'tran'
  if (CV.some((x) => under(p, x))) return 'cv'
  if (BREV.some((x) => under(p, x))) return 'brev'
  if (NEUTRAL.some((x) => under(p, x))) return 'neutral'
  return 'jobb'
}

/** Väggens färg per rum (--vagg), för statusfältet (generateViewport). */
export const VAGG_FARG: Record<Rum, string> = {
  tran: '#1B2246',
  cv: '#113538',
  brev: '#3A1930',
  jobb: '#1B3324',
  neutral: '#26262C',
}

export interface Dorr {
  rum: Exclude<Rum, 'neutral'>
  /** Dörrnavet på mobil. */
  etikett: string
  /** Sidomenyn på dator. */
  etikettDator: string
  href: string
}

/** De fyra dörrarna, i ordning (beslut 4). Ikonerna står i Dorrnav och Sidomeny. */
export const DORRAR: readonly Dorr[] = [
  { rum: 'tran', etikett: DORR_ETIKETT.mobil.tran, etikettDator: DORR_ETIKETT.dator.tran, href: '/dashboard/tester' },
  { rum: 'cv', etikett: DORR_ETIKETT.mobil.cv, etikettDator: DORR_ETIKETT.dator.cv, href: '/dashboard/profil/cv' },
  { rum: 'brev', etikett: DORR_ETIKETT.mobil.brev, etikettDator: DORR_ETIKETT.dator.brev, href: '/dashboard/mina-brev' },
  { rum: 'jobb', etikett: DORR_ETIKETT.mobil.jobb, etikettDator: DORR_ETIKETT.dator.jobb, href: '/dashboard' },
]

/**
 * Den undersida i en lista som en sökväg står på: exakt träff för de som
 * är exakta, annars längsta prefix. Används av sidomenyn så att bara en
 * rad bär kopparlinjen.
 */
export function aktivUndersida<T extends { href: string; exact?: boolean }>(
  pathname: string,
  undersidor: readonly T[],
): T | null {
  const p = pathname.replace(/\/+$/, '') || '/dashboard'
  let bast: T | null = null
  for (const u of undersidor) {
    const traff = u.exact ? p === u.href : under(p, u.href)
    if (traff && (!bast || u.href.length > bast.href.length)) bast = u
  }
  return bast
}
