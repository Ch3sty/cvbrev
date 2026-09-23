/**
 * Läser query-parametrar oavsett om de kommer som URLSearchParams (klienten,
 * OG-routen) eller som Next:s searchParams-objekt (serversidan).
 */

export type Sok = URLSearchParams | string | Record<string, string | string[] | undefined> | null | undefined

export function hamta(sok: Sok, nyckel: string): string | null {
  if (!sok) return null
  if (typeof sok === 'string') return new URLSearchParams(sok).get(nyckel)
  if (sok instanceof URLSearchParams) return sok.get(nyckel)
  const v = sok[nyckel]
  if (Array.isArray(v)) return v[0] ?? null
  return v ?? null
}

/** Heltal ur en parameter, bara siffror godtas. */
export function heltal(sok: Sok, nyckel: string): number | null {
  const v = hamta(sok, nyckel)
  if (v === null || !/^\d+$/.test(v)) return null
  return parseInt(v, 10)
}

/** Heltal inom ett spann, annars null. */
export function heltalMellan(sok: Sok, nyckel: string, min: number, max: number): number | null {
  const n = heltal(sok, nyckel)
  return n !== null && n >= min && n <= max ? n : null
}

export type Parametrar = Record<string, string | null>

/** Bygger en query-sträng av parametrar, tomma och null utelämnas. */
export function queryStrang(params: Parametrar): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== '') sp.set(k, v)
  }
  return sp.toString()
}
