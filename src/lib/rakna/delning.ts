/**
 * Delning av ett resultat: länken med parametrarna i query-strängen, och
 * adressen till den delade vyns OG-bild.
 *
 * En länk med kalkylatorns nyckelparameter skrivs om i next.config.ts till
 * /rakna-ut/<slug>/delad, som läser parametrarna på servern, ritar
 * resultatet direkt och pekar og:image på /api/og/rakna-ut/<slug>. Utan
 * parametrar är sidan statisk som förut. Klientsäker: inga tabeller här.
 */
import { queryStrang, type Parametrar } from './sok'

export const SAJT = 'https://www.jobbcoach.ai'

export const SLUGGAR = [
  'lon-efter-skatt',
  'uppsagningstid',
  'semesterersattning',
  'timlon-till-manadslon',
  'loneforhandling',
  'vad-kostar-en-anstalld',
  'felrekrytering',
  'sourcing',
  'traffsakerhet',
] as const

export type Slug = (typeof SLUGGAR)[number]

/**
 * Parametern som alltid står med i en delad länk. next.config.ts skriver om
 * adressen till den delade vyn när den finns. Testet i
 * src/lib/rakna/__tests__/delning.test.ts håller listorna i takt.
 */
export const NYCKEL: Record<Slug, string> = {
  'lon-efter-skatt': 'lon',
  uppsagningstid: 'vem',
  semesterersattning: 'lage',
  'timlon-till-manadslon': 'belopp',
  loneforhandling: 'lon',
  'vad-kostar-en-anstalld': 'lon',
  felrekrytering: 'lon',
  sourcing: 'kanal',
  traffsakerhet: 'metod',
}

export function arSlug(s: string): s is Slug {
  return (SLUGGAR as readonly string[]).includes(s)
}

/** Länken som delas: kalkylatorns adress med resultatets parametrar. */
export function delningsUrl(slug: Slug, params: Parametrar): string {
  const qs = queryStrang(params)
  return `${SAJT}/rakna-ut/${slug}${qs ? `?${qs}` : ''}`
}

/** OG-bildens adress för samma parametrar. */
export function ogBildUrl(slug: Slug, params: Parametrar | string): string {
  const qs = typeof params === 'string' ? params : queryStrang(params)
  return `${SAJT}/api/og/rakna-ut/${slug}${qs ? `?${qs}` : ''}`
}
