/**
 * Perioder i byggaren: Från och Till som månad plus år, aldrig fritext
 * (UX-briefen). På CV:t sparas de som "2022-08" eller "2022"; renderaren
 * skriver dem som "aug 2022" (src/lib/cv/mallar/innehall.ts, datum).
 * Äldre CV:n kan ha "Jan 2021", "januari 2021" eller "01/2021"; de läses
 * också, så att ett uppladdat CV går att redigera i samma blad.
 *
 * Klientsäker.
 */

export interface ManadAr {
  /** 1 till 12, eller null när bara året är känt. */
  manad: number | null
  /** Fyra siffror, eller tom. */
  ar: string
}

export const MANADSNAMN = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
] as const

const KORT: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, maj: 5, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, dec: 12,
}

const PAGAENDE = /^(pågående|pagaende|nuvarande|nu|present|current|ongoing|idag|i dag|tills vidare)$/i

/** Står datumet för pågående? */
export function arPagaende(s: unknown): boolean {
  return typeof s === 'string' && PAGAENDE.test(s.trim())
}

/** Läser ett datum ur CV:t till månad och år. Okänd text ger tomt. */
export function tolkaDatum(s: unknown): ManadAr {
  const t = typeof s === 'string' ? s.trim().toLowerCase() : ''
  if (!t || PAGAENDE.test(t)) return { manad: null, ar: '' }
  const iso = t.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?(?:t.*)?$/)
  if (iso) {
    const m = Number(iso[2])
    return { manad: m >= 1 && m <= 12 ? m : null, ar: iso[1] }
  }
  const snedstreck = t.match(/^(\d{1,2})[/.](\d{4})$/)
  if (snedstreck) {
    const m = Number(snedstreck[1])
    return { manad: m >= 1 && m <= 12 ? m : null, ar: snedstreck[2] }
  }
  const ar = t.match(/(\d{4})/)?.[1] ?? ''
  const ord = t.match(/\p{L}+/u)?.[0] ?? ''
  const manad = ord ? KORT[ord.slice(0, 3)] ?? null : null
  return { manad: ar ? manad : null, ar }
}

/** Månad och år tillbaka till CV:t: "2022-08", "2022" eller tomt. */
export function skrivDatum(d: ManadAr): string {
  const ar = /^\d{4}$/.test(d.ar.trim()) ? d.ar.trim() : ''
  if (!ar) return ''
  if (d.manad && d.manad >= 1 && d.manad <= 12) return `${ar}-${String(d.manad).padStart(2, '0')}`
  return ar
}
