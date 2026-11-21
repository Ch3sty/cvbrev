/**
 * Genvägarna (F8): Sökta tjänster läser vy och filter ur adressen och
 * förstår de gamla parametrarna. Hrefs byggs här så att länkarna från
 * Översikt och Att göra nu alltid landar i rätt vy. Klientsäker och ren.
 */
import type { SoktaFilter, SoktaVy, TjanstFokus } from './typer'

export const SOKTA_HREF = '/dashboard/sokta-tjanster'
export const JOBB_HREF = '/dashboard/jobbmatchning'
export const INTERVJU_HREF = '/dashboard/intervju'
export const JOBBCOACHEN_HREF = '/dashboard/jobbcoachen'
export const OVERSIKT_HREF = '/dashboard'

type Parametrar = URLSearchParams | Record<string, string | string[] | undefined> | null | undefined

function las(p: Parametrar, nyckel: string): string | null {
  if (!p) return null
  if (p instanceof URLSearchParams || typeof (p as { get?: unknown }).get === 'function') return (p as URLSearchParams).get(nyckel)
  const v = p[nyckel]
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

const FILTER: readonly SoktaFilter[] = ['alla', 'folj-upp', 'ska-sokas', 'vantar-svar', 'intervju', 'erbjudande', 'avslutade']

export interface SoktaAdress {
  vy: SoktaVy
  filter: SoktaFilter
  /** Öppna arket Logga sökt tjänst (?logga=1 eller ?logga=ska-soka). */
  logga: false | 'sokt' | 'ska-soka'
  /** Rapportens månad, 'YYYY-MM', om adressen anger en. */
  manad: string | null
}

/**
 * Tolkar adressen till Sökta tjänster.
 *   ?vy=lista|statistik|rapport, ?filter=<SoktaFilter>, ?logga=1|ska-soka, ?manad=YYYY-MM
 * Gamla: ?tab=statistik|rapport|dela, ?rapport=1, ?filter=uppfoljning.
 */
export function tolkaSoktaAdress(p: Parametrar): SoktaAdress {
  const vyRa = las(p, 'vy') ?? las(p, 'tab')
  let vy: SoktaVy = 'lista'
  if (vyRa === 'statistik') vy = 'statistik'
  else if (vyRa === 'rapport' || vyRa === 'dela') vy = 'rapport'
  if (las(p, 'rapport') === '1') vy = 'rapport'

  const filterRa = las(p, 'filter')
  let filter: SoktaFilter = 'alla'
  if (filterRa === 'uppfoljning' || filterRa === 'folj-upp' || filterRa === 'foljupp') filter = 'folj-upp'
  else if (filterRa && (FILTER as readonly string[]).includes(filterRa)) filter = filterRa as SoktaFilter

  const loggaRa = las(p, 'logga')
  const logga: SoktaAdress['logga'] = loggaRa === 'ska-soka' ? 'ska-soka' : loggaRa === '1' || loggaRa === 'sokt' ? 'sokt' : false

  const manadRa = las(p, 'manad') ?? las(p, 'month')
  const manad = manadRa && /^\d{4}-(0[1-9]|1[0-2])$/.test(manadRa) ? manadRa : null

  return { vy, filter, logga, manad }
}

/** Länk till Sökta tjänster i en vy eller med ett filter. */
export function soktaHref(a: { vy?: SoktaVy; filter?: SoktaFilter; logga?: 'sokt' | 'ska-soka'; manad?: string } = {}): string {
  const q = new URLSearchParams()
  if (a.vy && a.vy !== 'lista') q.set('vy', a.vy)
  if (a.filter && a.filter !== 'alla') q.set('filter', a.filter)
  if (a.logga) q.set('logga', a.logga === 'sokt' ? '1' : 'ska-soka')
  if (a.manad) q.set('manad', a.manad)
  const s = q.toString()
  return s ? `${SOKTA_HREF}?${s}` : SOKTA_HREF
}

const FOKUS: readonly Exclude<TjanstFokus, null>[] = ['forbered', 'folj-upp', 'hur-gick', 'andra-tid']

/** Länk till en sökt tjänst, med det block sidan ska öppna i (?steg=). */
export function tjanstHref(id: string, fokus: TjanstFokus = null): string {
  const bas = `${SOKTA_HREF}/${encodeURIComponent(id)}`
  return fokus ? `${bas}?steg=${fokus}` : bas
}

/** Vilket block tjänstens sida ska öppna i. */
export function tolkaTjanstAdress(p: Parametrar): TjanstFokus {
  const v = las(p, 'steg')
  return v && (FOKUS as readonly string[]).includes(v) ? (v as TjanstFokus) : null
}

/** Matchade jobb med en vald annons i adressen (F7). */
export function jobbHref(annonsId?: string | null): string {
  return annonsId ? `${JOBB_HREF}?annons=${encodeURIComponent(annonsId)}` : JOBB_HREF
}

export function tolkaJobbAdress(p: Parametrar): { annons: string | null } {
  const v = las(p, 'annons')
  return { annons: v && v.length <= 100 ? v : null }
}
