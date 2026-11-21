/**
 * Dubbletten vid uppladdning jämförs på innehåll, inte på filnamn
 * (beslutet 2026-11-21, punkt 3).
 *
 * Förut öppnades det befintliga CV:t tyst så fort en rad hade samma
 * lagringsväg (samma filnamn), och lagringen skrev över filen. Den som rättat
 * sitt CV och laddade upp "cv.pdf" igen fick sitt gamla CV. Nu:
 *  - samma maskade text (blanktecken normaliserade) som en rad med samma
 *    filnamn: det befintliga CV:t öppnas, svaret bär fannsRedan
 *  - annan text: ett nytt CV med en egen lagringsväg (unikt suffix, den gamla
 *    filen skrivs aldrig över) och ett eget namn, "cv (2).pdf"
 *
 * Rena funktioner, testade i __tests__/dubblett.test.ts.
 */
import { sammaCvInnehall } from '@/lib/privacy/lagradCvText'

/** Raden i uppladdningszonen och arket Ett CV till när samma CV redan fanns. */
export const FANNS_REDAN_TEXT = 'Du har redan laddat upp det här CV:t, så vi öppnade det.'

/** Hur länge raden står innan det befintliga CV:t öppnas (ms). */
export const FANNS_REDAN_VANTAN = 2500

export interface EgenCvRad {
  id: string
  file_name?: string | null
  original_file_path?: string | null
  cv_text?: string | null
}

/** Suffixet som skiljer en ny version av samma filnamn i lagringen. */
const SUFFIX = '__v'

function delaSokvag(sokvag: string): { stam: string; andelse: string } {
  const snedstreck = sokvag.lastIndexOf('/')
  const punkt = sokvag.lastIndexOf('.')
  if (punkt <= snedstreck) return { stam: sokvag, andelse: '' }
  return { stam: sokvag.slice(0, punkt), andelse: sokvag.slice(punkt) }
}

function escapa(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** En lagringsväg som inte krockar med grundvägen: "users/u/cv__vk3x9a.pdf". */
export function unikSokvag(grund: string, nu: number = Date.now()): string {
  const { stam, andelse } = delaSokvag(grund)
  return `${stam}${SUFFIX}${nu.toString(36)}${andelse}`
}

/** Är vägen grundvägen eller en version av den (samma filnamn, uppladdad igen med annat innehåll)? */
export function arSammaFilnamn(sokvag: string | null | undefined, grund: string): boolean {
  if (!sokvag) return false
  if (sokvag === grund) return true
  const { stam, andelse } = delaSokvag(grund)
  return new RegExp(`^${escapa(stam)}${escapa(SUFFIX)}[a-z0-9]+${escapa(andelse)}$`).test(sokvag)
}

/** Raderna med samma filnamn som grundvägen. */
export function raderMedSammaFilnamn<T extends EgenCvRad>(rader: readonly T[] | null | undefined, grund: string): T[] {
  return (rader ?? []).filter((r) => arSammaFilnamn(r.original_file_path, grund))
}

/** Raden med samma filnamn och samma innehåll, eller null. */
export function hittaSammaCv<T extends EgenCvRad>(
  rader: readonly T[] | null | undefined,
  grund: string,
  maskadText: string,
): T | null {
  return raderMedSammaFilnamn(rader, grund).find((r) => sammaCvInnehall(r.cv_text, maskadText)) ?? null
}

/**
 * Samma fil byte för byte? Reserven när texten inte går att jämföra: byggaren
 * och arbetsläget skriver om cv_text ur strukturen vid varje sparning
 * (api/cv/strukturerad, maskad sedan 2026-11-21 men fortfarande i strukturens
 * form), så efter en redigering liknar raden inte längre filens text. Filen i
 * lagringen skrivs aldrig om, så den jämförs i stället.
 */
export function sammaFilinnehall(a: Uint8Array | null | undefined, b: Uint8Array | null | undefined): boolean {
  if (!a || !b || a.length === 0 || a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

const ANDELSER =/\.(pdf|docx?|txt)$/i

/**
 * Namnet för ett nytt CV när namnet redan finns: "cv.pdf" blir "cv (2).pdf",
 * "cv" blir "cv (2)", med nästa lediga nummer. Ett ledigt namn lämnas orört.
 * Jämförelsen bryr sig inte om skiftläge.
 */
export function nastaLedigaNamn(namn: string, befintliga: readonly (string | null | undefined)[]): string {
  const tagna = new Set(befintliga.filter((b): b is string => typeof b === 'string').map((b) => b.trim().toLowerCase()))
  if (!tagna.has(namn.trim().toLowerCase())) return namn
  const m = namn.match(ANDELSER)
  const andelse = m ? m[0] : ''
  const stam = (m ? namn.slice(0, -andelse.length) : namn).replace(/\s\(\d+\)$/, '')
  for (let n = 2; n < 1000; n++) {
    const forslag = `${stam} (${n})${andelse}`
    if (!tagna.has(forslag.toLowerCase())) return forslag
  }
  return `${stam} (${Date.now()})${andelse}`
}
