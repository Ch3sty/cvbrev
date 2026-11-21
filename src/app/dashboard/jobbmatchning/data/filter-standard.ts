/**
 * Filtrens form och grundläge. Låg förut i JobFilterPanel ('use client'),
 * flyttad hit så att serverladdaren (senaste körningen) kan räkna samma lista
 * som klienten. Innehållet är oförändrat; panelen exporterar dem vidare.
 *
 * Filter-tillstånd som skickas till match-jobs edge-funktionen.
 * Fälten mappar 1:1 mot JobSearch-API-parametrar (se multi-source-aggregator).
 * Tomma/falska värden = filtret är av (edge normaliserar bort dem).
 */
export interface JobFilters {
  remote: boolean // remote=true
  noExperience: boolean // experience=false
  worktimeExtent: string // worktime-extent concept_id ('' = alla)
  publishedAfterMinutes: number // published-after (0 = alla)
  sort: string // sort ('' = relevans/standard)
  municipality: string[] // municipality concept_ids
}

export const DEFAULT_FILTERS: JobFilters = {
  remote: false,
  noExperience: false,
  worktimeExtent: '',
  publishedAfterMinutes: 0,
  sort: '',
  municipality: [],
}

// Antal aktiva filter (för räknar-badge på mobilknappen).
export function countActiveFilters(f: JobFilters): number {
  let n = 0
  if (f.remote) n++
  if (f.noExperience) n++
  if (f.worktimeExtent) n++
  if (f.publishedAfterMinutes > 0) n++
  if (f.sort) n++
  n += f.municipality.length
  return n
}
