/**
 * Veckoremsan i spärren för veckans gratisbrev (skissens Sparr-vecka-1440):
 * åtta rutor från dagen då veckans brev skrevs till dagen då nästa öppnar.
 * Allt räknas ur datumet då nästa gratisbrev öppnar (servern skickar det med
 * kvoten) och dagens datum, i svensk tid. Ren funktion, klientsäker.
 */

const VECKODAG_KORT = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'] as const
const VECKODAG = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'] as const
const MANAD_KORT = ['jan', 'feb', 'mars', 'apr', 'maj', 'juni', 'juli', 'aug', 'sep', 'okt', 'nov', 'dec'] as const
const MANAD = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'] as const

export type DagLage = 'gjord' | 'idag' | 'tom' | 'nasta'

export interface RemsDag {
  /** ÅÅÅÅ-MM-DD i svensk tid. */
  datum: string
  /** Etiketten under rutan: "fre", "i dag", "27 nov". */
  etikett: string
  lage: DagLage
}

export interface Veckoremsa {
  dagar: RemsDag[]
  /** Dagar kvar till nästa gratisbrev (minst 1 när det inte öppnat än). */
  dagarKvar: number
  /** "fredag 27 nov", för raderna "Nästa gratisbrev fredag 27 nov" och påminnelsen. */
  nastaText: string
  /** Skärmläsarens mening om remsan. */
  etikett: string
}

/** Kalenderdagen i Stockholm för ett ögonblick, som ÅÅÅÅ-MM-DD. */
export function svenskDag(t: Date): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(t)
}

function tillUtc(dag: string): Date {
  const [a, m, d] = dag.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d))
}

function plusDagar(dag: string, n: number): string {
  const t = tillUtc(dag)
  t.setUTCDate(t.getUTCDate() + n)
  return t.toISOString().slice(0, 10)
}

function skillnad(fran: string, till: string): number {
  return Math.round((tillUtc(till).getTime() - tillUtc(fran).getTime()) / 86_400_000)
}

/** "fredag 27 nov" */
export function dagText(dag: string): string {
  const t = tillUtc(dag)
  return `${VECKODAG[t.getUTCDay()]} ${t.getUTCDate()} ${MANAD_KORT[t.getUTCMonth()]}`
}

function langText(dag: string): string {
  const t = tillUtc(dag)
  return `${VECKODAG[t.getUTCDay()]} ${t.getUTCDate()} ${MANAD[t.getUTCMonth()]}`
}

/**
 * Remsan för nästa gratisbrev. nasta är ögonblicket (ISO eller Date) då nästa
 * brev öppnar, idag ett ögonblick i dag (standard: nu).
 */
export function veckoremsa(nasta: string | Date, idag: Date = new Date()): Veckoremsa {
  const nastaDag = svenskDag(typeof nasta === 'string' ? new Date(nasta) : nasta)
  const idagDag = svenskDag(idag)
  const start = plusDagar(nastaDag, -7)
  const dagar: RemsDag[] = Array.from({ length: 8 }, (_, i) => {
    const datum = plusDagar(start, i)
    const t = tillUtc(datum)
    if (i === 7) return { datum, etikett: `${t.getUTCDate()} ${MANAD_KORT[t.getUTCMonth()]}`, lage: 'nasta' as const }
    if (i === 0) return { datum, etikett: datum === idagDag ? 'i dag' : VECKODAG_KORT[t.getUTCDay()], lage: 'gjord' as const }
    if (datum === idagDag) return { datum, etikett: 'i dag', lage: 'idag' as const }
    return { datum, etikett: VECKODAG_KORT[t.getUTCDay()], lage: 'tom' as const }
  })
  const dagarKvar = Math.max(1, skillnad(idagDag, nastaDag))
  const delar = [`Veckans brev skrevs ${langText(start)}.`]
  if (idagDag !== start) delar.push(`I dag är det ${VECKODAG[tillUtc(idagDag).getUTCDay()]}.`)
  delar.push(`Nästa gratisbrev öppnar ${langText(nastaDag)}.`)
  return { dagar, dagarKvar, nastaText: dagText(nastaDag), etikett: delar.join(' ') }
}
