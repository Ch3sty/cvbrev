/**
 * Datum i svensk tid för Jobbsöket. Klientsäker och ren.
 *
 * Kalenderdagar räknas som 'YYYY-MM-DD' i Europe/Stockholm och jämförs som
 * strängar eller med UTC-aritmetik på själva datumet, så att sommartid och
 * serverns tidszon aldrig flyttar en dag.
 */
import type { Dag } from './typer'

const TZ = 'Europe/Stockholm'
const DYGN_MS = 86_400_000
const DAG_RE = /^\d{4}-\d{2}-\d{2}$/

const DAG_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const DELAR_FORMAT = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export const MANADER = [
  'januari', 'februari', 'mars', 'april', 'maj', 'juni',
  'juli', 'augusti', 'september', 'oktober', 'november', 'december',
] as const
const MANADER_KORT = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'] as const
export const VECKODAGAR = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'] as const
const VECKODAGAR_KORT = ['mån', 'tis', 'ons', 'tors', 'fre', 'lör', 'sön'] as const

export function arDag(v: unknown): v is Dag {
  if (typeof v !== 'string' || !DAG_RE.test(v)) return false
  const [y, m, d] = v.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d
}

/** Dagens datum i svensk tid. */
export function idagSv(nu: Date = new Date()): Dag {
  return DAG_FORMAT.format(nu)
}

/**
 * En tid utan tidszon, som Arbetsförmedlingens annonser skickar den
 * ("2026-11-30T23:59:59"). Den är svensk lokal tid. `new Date()` skulle läsa
 * den i maskinens zon: på servern (UTC) blir 23.59 den 30 november då 00.59
 * den 1 december i Stockholm, i webbläsaren 30 november.
 */
const UTAN_ZON_RE = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/

/**
 * Kalenderdagen för en tidpunkt (svensk tid). En ren dag returneras som den
 * är, och en tid utan zon är svensk lokal tid (dagen är då datumdelen). En tid
 * med `Z` eller förskjutning räknas om till svensk tid.
 */
export function dagFor(v: string | Date | null | undefined): Dag | null {
  if (!v) return null
  if (typeof v === 'string') {
    if (DAG_RE.test(v)) return v
    const m = UTAN_ZON_RE.exec(v.trim())
    if (m) return arDag(m[1]) ? m[1] : null
  }
  const d = typeof v === 'string' ? new Date(v) : v
  if (Number.isNaN(d.getTime())) return null
  return DAG_FORMAT.format(d)
}

/**
 * Tidpunkten i millisekunder, samma på servern och i webbläsaren: en tid utan
 * zon är svensk lokal tid, en ren dag är midnatt svensk tid, en tid med `Z`
 * eller förskjutning läses som den står. Null när den inte går att läsa.
 */
export function tidpunkt(v: string | null | undefined): number | null {
  if (!v) return null
  const s = v.trim()
  if (DAG_RE.test(s)) return arDag(s) ? stockholmTillMs(s, 0, 0, 0) : null
  const m = UTAN_ZON_RE.exec(s)
  if (m) {
    const tim = Number(m[2])
    const min = Number(m[3])
    const sek = Number(m[4] ?? 0)
    if (!arDag(m[1]) || tim > 23 || min > 59 || sek > 59) return null
    return stockholmTillMs(m[1], tim, min, sek)
  }
  const t = Date.parse(s)
  return Number.isNaN(t) ? null : t
}

function tillUtc(dag: Dag): number {
  const [y, m, d] = dag.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

function franUtc(ms: number): Dag {
  return new Date(ms).toISOString().slice(0, 10)
}

export function plusDagar(dag: Dag, n: number): Dag {
  return franUtc(tillUtc(dag) + n * DYGN_MS)
}

/** Hela dagar från `fran` till `till` (negativt om `till` ligger före). */
export function dagarMellan(fran: Dag, till: Dag): number {
  return Math.round((tillUtc(till) - tillUtc(fran)) / DYGN_MS)
}

/** 0 = måndag, 6 = söndag. */
export function veckodag(dag: Dag): number {
  return (new Date(tillUtc(dag)).getUTCDay() + 6) % 7
}

/** Måndagen i veckan (svensk vecka, måndag till söndag). */
export function veckaStart(dag: Dag): Dag {
  return plusDagar(dag, -veckodag(dag))
}

/** ISO-veckonummer. */
export function isoVecka(dag: Dag): number {
  const torsdag = plusDagar(dag, 3 - veckodag(dag))
  const ar = Number(torsdag.slice(0, 4))
  const forsta = `${ar}-01-04`
  const forstaTorsdag = plusDagar(forsta, 3 - veckodag(forsta))
  return 1 + Math.round(dagarMellan(forstaTorsdag, torsdag) / 7)
}

/** Stockholms klocka för en tidpunkt. */
function vaggklocka(ms: number): { dag: Dag; tim: number; min: number; ms: number } {
  const delar = Object.fromEntries(DELAR_FORMAT.formatToParts(new Date(ms)).map((p) => [p.type, p.value]))
  const dag = `${delar.year}-${delar.month}-${delar.day}`
  const tim = Number(delar.hour)
  const min = Number(delar.minute)
  const sek = Number(delar.second)
  return { dag, tim, min, ms: tillUtc(dag) + ((tim * 60 + min) * 60 + sek) * 1000 }
}

/**
 * En dag och ett klockslag i svensk tid som ISO (UTC). Utan klockslag blir det
 * 00:00, vilket läses som "bara datum" (harKlockslag).
 */
export function franStockholm(dag: Dag, klockslag?: string | null): string | null {
  if (!arDag(dag)) return null
  let tim = 0
  let min = 0
  if (klockslag) {
    const m = /^(\d{1,2})[:.](\d{2})$/.exec(klockslag.trim())
    if (!m) return null
    tim = Number(m[1])
    min = Number(m[2])
    if (tim > 23 || min > 59) return null
  }
  return new Date(stockholmTillMs(dag, tim, min, 0)).toISOString()
}

/** En dag och en tid på Stockholms väggklocka som millisekunder (UTC). */
function stockholmTillMs(dag: Dag, tim: number, min: number, sek: number): number {
  const onskad = tillUtc(dag) + ((tim * 60 + min) * 60 + sek) * 1000
  // Två varv räcker även vid sommartidsbytet.
  let gissning = onskad
  for (let i = 0; i < 2; i++) {
    const vagg = vaggklocka(gissning)
    gissning += onskad - vagg.ms
  }
  return gissning
}

/** "10.00", eller null när tiden är 00:00 svensk tid (bara datum satt). */
export function klockslag(iso: string | null | undefined): string | null {
  if (!iso) return null
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return null
  const v = vaggklocka(t)
  if (v.tim === 0 && v.min === 0) return null
  return `${String(v.tim).padStart(2, '0')}.${String(v.min).padStart(2, '0')}`
}

/** "26 nov". */
export function kortDag(dag: Dag): string {
  const [, m, d] = dag.split('-').map(Number)
  return `${d} ${MANADER_KORT[m - 1]}`
}

/** "26 november". */
export function langDag(dag: Dag): string {
  const [, m, d] = dag.split('-').map(Number)
  return `${d} ${MANADER[m - 1]}`
}

/** "26 november 2026". */
export function langDagMedAr(dag: Dag): string {
  return `${langDag(dag)} ${dag.slice(0, 4)}`
}

export function veckodagNamn(dag: Dag): string {
  return VECKODAGAR[veckodag(dag)]
}

export function veckodagKort(dag: Dag): string {
  return VECKODAGAR_KORT[veckodag(dag)]
}

/** "tors 26 nov". */
export function veckodagOchDag(dag: Dag): string {
  return `${veckodagKort(dag)} ${kortDag(dag)}`
}

/**
 * När, i löptext: "i dag", "i morgon", "på tisdag" (inom sex dagar),
 * annars "den 3 december".
 */
export function narText(dag: Dag, idag: Dag): string {
  const d = dagarMellan(idag, dag)
  if (d === 0) return 'i dag'
  if (d === 1) return 'i morgon'
  if (d === -1) return 'i går'
  if (d > 1 && d <= 6) return `på ${veckodagNamn(dag)}`
  return `den ${langDag(dag)}`
}

/**
 * När något hände, bakåt i tiden: "i dag", "i går", "i tisdags" (två till
 * sex dagar sedan), annars "den 12 november". En dag efter `idag` (klockor
 * som går olika) läses som i dag.
 */
export function sedanText(dag: Dag, idag: Dag): string {
  const d = dagarMellan(dag, idag)
  if (d <= 0) return 'i dag'
  if (d === 1) return 'i går'
  if (d <= 6) return `i ${veckodagNamn(dag)}s`
  return `den ${langDag(dag)}`
}

/**
 * Raden över de nya träffarna: "Sedan du tittade i tisdags". `seddaAt` är
 * när Matchade jobb senast visades (profiles.matchningar_sedda_at, läst
 * innan sidan markerar den som sedd igen). Null utan tidpunkt.
 */
export function sedanDuTittade(seddaAt: string | null | undefined, idag: Dag): string | null {
  const dag = dagFor(seddaAt)
  if (!dag) return null
  return `Sedan du tittade ${sedanText(dag, idag)}`
}

/** "Oktober" ur 'YYYY-MM'. */
export function manadEtikett(manad: string): string {
  const m = Number(manad.slice(5, 7))
  const namn = MANADER[m - 1] ?? ''
  return namn.charAt(0).toUpperCase() + namn.slice(1)
}

/** Antal ord, som de räknas i uppföljningsmejlet. */
export function raknaOrdITexten(text: string): number {
  return text.split(/\s+/).filter((o) => /[\p{L}\p{N}]/u.test(o)).length
}
