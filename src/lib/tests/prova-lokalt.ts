/**
 * Provets resultat i fliken (sessionStorage), för provet utan konto och
 * kontosteget efter det.
 *
 * Analysen 2026-11-08, punkt 2: den som gick till registreringen och tryckte
 * Tillbaka fick förut börja om provet. Nu står resultatet kvar så länge
 * provet väntar på ett konto i samma flik.
 *
 * Skissen 2026-11-09: kontosteget ritar brickorna av besökarens egna frågor.
 * Rutnäten är det besökaren redan sett (utan facit och utan alternativ), så
 * de sparas här i stället för att servern skickar dem igen. Antal rätt och
 * vilka som blev fel hämtar kontosteget alltid från servern.
 *
 * Nyckeln bytte namn 2026-11-09: den gamla bar en påhittad percentil.
 */

import type { LayeredCell } from '@/lib/logicTestV7/layered.v7'

export const PROVA_RESULTAT_KEY = 'jc_prova_resultat_v2'
const MAX_MS = 24 * 60 * 60 * 1000

export type Rutnat = (LayeredCell | null)[][]

export interface ProvaResultat {
  score: number
  total: number
  /** Positionerna 0 till 4 som blev fel. */
  fel: number[]
  /** Null tills underlaget räcker (prova-percentil.ts). */
  percentile: number | null
}

export interface SparatProv {
  token: string
  result: ProvaResultat
  rutnat: Rutnat[]
}

export function arProvaResultat(r: unknown): r is ProvaResultat {
  if (!r || typeof r !== 'object') return false
  const d = r as Record<string, unknown>
  return (
    typeof d.score === 'number' &&
    typeof d.total === 'number' &&
    Array.isArray(d.fel) &&
    d.fel.every((i) => Number.isInteger(i)) &&
    (d.percentile === null || typeof d.percentile === 'number')
  )
}

export function sparaProv(token: string, result: ProvaResultat, rutnat: Rutnat[]): void {
  try {
    sessionStorage.setItem(PROVA_RESULTAT_KEY, JSON.stringify({ token, result, rutnat, t: Date.now() }))
  } catch {
    /* privat läge: provet fungerar ändå, bara utan återställning */
  }
}

/** Det sparade provet om det hör till `token` och inte är äldre än ett dygn. */
export function lasSparatProv(token: string | null): SparatProv | null {
  if (!token) return null
  try {
    const raw = sessionStorage.getItem(PROVA_RESULTAT_KEY)
    if (!raw) return null
    const d = JSON.parse(raw) as { token?: unknown; result?: unknown; rutnat?: unknown; t?: unknown }
    if (
      d.token !== token ||
      typeof d.t !== 'number' ||
      Date.now() - d.t > MAX_MS ||
      !arProvaResultat(d.result)
    ) {
      return null
    }
    const rutnat = Array.isArray(d.rutnat) ? (d.rutnat as Rutnat[]) : []
    return { token, result: d.result, rutnat }
  } catch {
    return null
  }
}

export function glomProv(): void {
  try {
    sessionStorage.removeItem(PROVA_RESULTAT_KEY)
  } catch {
    /* privat läge */
  }
}
