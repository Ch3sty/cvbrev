/**
 * "Föreslagna för dig" (plan-mallar 3.3): räknas deterministiskt ur
 * innehållet, aldrig ur yrket. Tre eller fler intyg föreslår paneler och
 * intyg först, erfarenhet under två år utbildning först, många system och
 * verktyg kompetenser först, lång karriär allt på en sida. Första platsen är
 * alltid en gratismall. Mallarna väljs på katalogens fält (familj, kort,
 * foto), aldrig på namn eller id, så förslagen följer med när mallarna görs om.
 *
 * Klientsäker: tar korten som argument.
 */
import type { MallKort, Ordning } from '@/lib/cv/mallar/kontrakt'
import type { CVMetadata } from '@/lib/cv/cv-metadata'

export type ForslagSkal = 'intyg' | 'kort' | 'system' | 'lang' | 'ingen'

export interface CvSignaler {
  intyg: number
  /** År från första till sista anställningen, avrundat nedåt. */
  erfarenhetAr: number
  /** Antal system, verktyg och kompetensord. */
  system: number
  /** Sidor i förhandsvisningen (1 innan den mätts). */
  sidor: number
}

export interface Forslag {
  ids: string[]
  skal: ForslagSkal
  /** Ordningen som följer av skälet, att föreslå i verktygsraden. */
  ordning?: Ordning
  enSida?: boolean
}

const ARTAL = /(19|20)\d{2}/g

function ar(text: string | undefined): number[] {
  return (text ?? '').match(ARTAL)?.map(Number) ?? []
}

export function signalerUrCv(cv: CVMetadata | null | undefined, sidor = 1): CvSignaler {
  if (!cv) return { intyg: 0, erfarenhetAr: 0, system: 0, sidor }
  const nu = new Date().getFullYear()
  const starter: number[] = []
  const slut: number[] = []
  for (const e of cv.experience ?? []) {
    const s = ar(e.startDate)
    const t = ar(e.endDate)
    if (s.length) starter.push(Math.min(...s))
    slut.push(t.length ? Math.max(...t) : e.endDate && !/pågå|nu|present/i.test(e.endDate) ? (s[0] ?? nu) : nu)
  }
  const erfarenhetAr = starter.length ? Math.max(0, Math.max(...slut) - Math.min(...starter)) : 0
  const system = (cv.skills ?? []).reduce((n, s) => n + (s.skills?.length ?? (s.name ? 1 : 0)), 0)
  return { intyg: cv.certifications?.length ?? 0, erfarenhetAr, system, sidor }
}

export function skalFor(s: CvSignaler, harErfarenhet: boolean): ForslagSkal {
  if (s.intyg >= 3) return 'intyg'
  if (harErfarenhet && s.erfarenhetAr < 2) return 'kort'
  if (s.system >= 10) return 'system'
  if (s.sidor > 1) return 'lang'
  return 'ingen'
}

/** Hur väl ett kort passar skälet; högre är bättre, 0 passar inte särskilt. */
function poang(m: MallKort, skal: ForslagSkal): number {
  const kort = `${m.kort} ${m.stil}`.toLowerCase()
  switch (skal) {
    case 'intyg':
      return (m.familj === 'sidospalt' ? 3 : 0) + (/intyg|panel|behörig|fält/.test(kort) ? 2 : 0)
    case 'kort':
      return (m.familj === 'en-spalt' ? 2 : 0) + (/student|lätt|enkel|utbildning|luft/.test(kort) ? 2 : 0)
    case 'system':
      return (m.familj === 'marginal' || m.familj === 'en-spalt' ? 1 : 0) + (/kompetens|spalt|system|tekn/.test(kort) ? 3 : 0)
    case 'lang':
      return (/en sida|kompakt|tät|tätare/.test(kort) ? 4 : 0) + (m.familj === 'en-spalt' ? 1 : 0)
    default:
      return m.familj === 'en-spalt' ? 1 : 0
  }
}

/**
 * Tre förslag: en gratismall först (den som passar skälet bäst), sedan de
 * två mallar som passar bäst bland resten. Lika poäng behåller katalogens
 * ordning, så samma CV alltid får samma förslag.
 */
export function foreslagna(katalog: readonly MallKort[], cv: CVMetadata | null | undefined, sidor = 1, antal = 3): Forslag {
  const s = signalerUrCv(cv, sidor)
  const skal = skalFor(s, (cv?.experience?.length ?? 0) > 0)
  const rangordnade = katalog
    .map((m, i) => ({ m, i, p: poang(m, skal) }))
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .map((x) => x.m)
  const gratis = rangordnade.find((m) => m.niva === 'gratis')
  const ids: string[] = gratis ? [gratis.id] : []
  for (const m of rangordnade) {
    if (ids.length >= antal) break
    if (!ids.includes(m.id)) ids.push(m.id)
  }
  const ordning: Ordning | undefined =
    skal === 'intyg' ? 'intyg' : skal === 'kort' ? 'utbildning' : skal === 'system' ? 'kompetenser' : undefined
  return { ids, skal, ordning, enSida: skal === 'lang' ? true : undefined }
}
