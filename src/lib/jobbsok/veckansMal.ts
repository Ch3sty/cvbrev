/**
 * Veckans mål (F4): antal sökta tjänster per vecka, måndag till söndag i
 * svensk tid, räknat på applied_at. Förval 3, går att ändra 1 till 10. Ingen
 * svit, inga uteblivna veckor. Ska sökas räknas aldrig. Klientsäker och ren.
 */
import { dagFor, idagSv, isoVecka, plusDagar, veckaStart } from './datum'
import {
  VECKANS_MAL_FORVAL,
  VECKANS_MAL_MAX,
  VECKANS_MAL_MIN,
  type Dag,
  type JobApplication,
  type VeckansMal,
} from './typer'

/** Kolumnvärdet som ett giltigt mål, eller null (förvalet). */
export function tolkaVeckansMal(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v
  if (typeof n !== 'number' || !Number.isInteger(n)) return null
  if (n < VECKANS_MAL_MIN || n > VECKANS_MAL_MAX) return null
  return n
}

export function veckansMal(
  ansokningar: ReadonlyArray<Pick<JobApplication, 'applied_at' | 'created_at'>>,
  malKolumn: number | null | undefined,
  nu: Date = new Date()
): VeckansMal {
  const idag = idagSv(nu)
  const start: Dag = veckaStart(idag)
  const slut: Dag = plusDagar(start, 6)
  const mal = tolkaVeckansMal(malKolumn) ?? VECKANS_MAL_FORVAL
  let sokta = 0
  for (const a of ansokningar) {
    const d = dagFor(a.applied_at) ?? dagFor(a.created_at)
    if (d && d >= start && d <= slut) sokta++
  }
  const klart = sokta >= mal
  return {
    mal,
    forval: tolkaVeckansMal(malKolumn) === null,
    sokta,
    klart,
    kvar: Math.max(0, mal - sokta),
    vecka: isoVecka(idag),
    start,
    slut,
    text: klart ? `Veckans mål klart: ${sokta} av ${mal}` : `Veckans mål: ${sokta} av ${mal} sökta`,
  }
}
