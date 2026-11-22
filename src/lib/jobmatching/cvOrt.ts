/**
 * Orten i CV:t, för Matchade jobb när sökprofilen saknar ort (klicktestet på
 * live 2026-11-22, punkt 5: kontot med "Göteborg" i CV:t stod på "Ingen ort
 * vald").
 *
 * Matchningen utgår från active_cv_for_matching.extracted_location, som
 * parse-cv-for-matching skriver ur modellens tolkning. Den kan bli tom,
 * också när orten står i CV:t (en ort utan postnummer i kontaktraden, eller
 * ett CV från provsidorna där orten låg i strukturen men inte i texten).
 * Här läses orten lokalt i stället: först strukturens kontaktfält, sedan
 * kontaktblocket i texten (extractContactLocally, samma regel som den
 * publika tolkningen). Bara en av Sveriges kommuner godtas, så att
 * avståndet till annonserna går att räkna: hellre ingen ort än fel ort.
 *
 * Ren och klientsäker.
 */
import { extractContactLocally } from '@/lib/privacy/extractContact'
import { KOMMUNNAMN } from '@/lib/privacy/kommunnamn'

const KOMMUNER = new Map(KOMMUNNAMN.map((namn) => [namn.toLowerCase(), namn]))

function somKommun(v: string | null | undefined): string | null {
  const t = (v ?? '').trim().replace(/\s+/g, ' ')
  if (!t) return null
  const exakt = KOMMUNER.get(t.toLowerCase())
  if (exakt) return exakt
  // "411 05 Göteborg", "Storgatan 1, 411 05 Göteborg", "Bor i Örebro".
  const ur = extractContactLocally(t).city
  return ur ? (KOMMUNER.get(ur.toLowerCase()) ?? null) : null
}

export function ortUrCv(structured: unknown, cvText: string | null | undefined): string | null {
  const pi = (structured && typeof structured === 'object'
    ? (structured as { personalInfo?: Record<string, unknown> }).personalInfo
    : null) ?? null
  for (const falt of ['location', 'city', 'address'] as const) {
    const v = pi?.[falt]
    const ort = typeof v === 'string' ? somKommun(v) : null
    if (ort) return ort
  }
  const ur = extractContactLocally(cvText ?? '').city
  return ur ? (KOMMUNER.get(ur.toLowerCase()) ?? null) : null
}
