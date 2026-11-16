/**
 * "Föreslagna för dig" (plan-mallar 3.3): räknas deterministiskt ur
 * innehållet, aldrig ur yrket. Tre eller fler intyg föreslår paneler och
 * intyg först, erfarenhet under två år utbildning först, många system och
 * verktyg kompetenser först, lång karriär allt på en sida. Första platsen är
 * alltid en gratismall. Sedan utbud 2 (40 mallar) är urvalet handplockade
 * id-tabeller (FORESLAGNA, MERFORSALJNING_URVAL); poängreglerna på
 * katalogens fält finns kvar som reserv.
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

/**
 * Skälet ur signalerna. `harUtbildning`: ett CV utan jobb men med utbildning
 * (studenten) får också kort, alltså utbildning först (saas-lead 2026-11-16).
 */
export function skalFor(s: CvSignaler, harErfarenhet: boolean, harUtbildning = false): ForslagSkal {
  if (s.intyg >= 3) return 'intyg'
  if (harErfarenhet && s.erfarenhetAr < 2) return 'kort'
  if (!harErfarenhet && harUtbildning) return 'kort'
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
 * Föreslagna för dig, handplockat per skäl och foto (docs/design/
 * mallar-2-forslag-saas-lead.md avsnitt 3): gratismallen först, sedan två
 * Premiummallar med Word. Ändras för hand efter avläsningen; testet fäller
 * om ett id saknas i katalogen.
 */
export const FORESLAGNA: Record<ForslagSkal, { utanFoto: readonly string[]; medFoto: readonly string[] }> = {
  intyg: { utanFoto: ['linne', 'kalksten', 'granit'], medFoto: ['bjork', 'kalksten', 'granit'] },
  kort: { utanFoto: ['bjork', 'loft', 'kalksten'], medFoto: ['bjork', 'loft', 'kalksten'] },
  system: { utanFoto: ['linne', 'raster', 'stal'], medFoto: ['bjork', 'raster', 'granit'] },
  lang: { utanFoto: ['linne', 'not', 'arsring'], medFoto: ['bjork', 'not', 'alm'] },
  ingen: { utanFoto: ['linne', 'kalksten', 'arsring'], medFoto: ['bjork', 'kalksten', 'loft'] },
}

/**
 * Merförsäljningens tre kort, handplockade (samma dokument avsnitt 2). Den når
 * bara den som har en gratismall, så tabellen skiljer på foto och på Björk.
 * `enSida` ersätter tredje kortet när CV:t är längre än en sida; `reserv`
 * fyller platser som inte går att använda.
 */
export const MERFORSALJNING_URVAL: {
  utanFoto: readonly string[]
  medFotoLinne: readonly string[]
  medFotoBjork: readonly string[]
  enSida: string
  reserv: { utanFoto: readonly string[]; medFoto: readonly string[] }
} = {
  utanFoto: ['kalksten', 'koppar', 'skylt'],
  medFotoLinne: ['kalksten', 'koppar', 'alm'],
  medFotoBjork: ['sand', 'koppar', 'alm'],
  enSida: 'not',
  reserv: { utanFoto: ['spar', 'index', 'stal'], medFoto: ['loft', 'betong', 'ek'] },
}

/** Premium, finns som Word och inte konstnärlig: får stå i merförsäljningen och på Föreslagnas plats 2 och 3. */
export const arSaljbar = (m: MallKort) => m.niva === 'premium' && m.word && m.familj !== 'konstnarlig'

/**
 * Tre förslag: en gratismall först, sedan två Premiummallar med Word, ur
 * tabellen för skälet och fotot. Saknas ett id i katalogen fyller
 * poängregeln (lika poäng behåller katalogens ordning), så samma CV alltid
 * får samma förslag.
 */
export function foreslagna(katalog: readonly MallKort[], cv: CVMetadata | null | undefined, sidor = 1, antal = 3, harFoto = false): Forslag {
  const s = signalerUrCv(cv, sidor)
  const skal = skalFor(s, (cv?.experience?.length ?? 0) > 0, (cv?.education?.length ?? 0) > 0)
  const perId = new Map(katalog.map((m) => [m.id, m]))
  const tabell = (harFoto ? FORESLAGNA[skal].medFoto : FORESLAGNA[skal].utanFoto).map((id) => perId.get(id)).filter((m): m is MallKort => Boolean(m))
  const rangordnade = katalog
    .map((m, i) => ({ m, i, p: poang(m, skal) }))
    .sort((a, b) => b.p - a.p || a.i - b.i)
    .map((x) => x.m)
  const gratis = tabell.find((m) => m.niva === 'gratis') ?? rangordnade.find((m) => m.niva === 'gratis')
  const ids: string[] = gratis ? [gratis.id] : []
  // Platserna efter gratismallen: Premium med Word, aldrig konstnärlig, aldrig en andra gratismall.
  for (const m of [...tabell.filter(arSaljbar), ...rangordnade.filter(arSaljbar)]) {
    if (ids.length >= antal) break
    if (!ids.includes(m.id)) ids.push(m.id)
  }
  const ordning: Ordning | undefined =
    skal === 'intyg' ? 'intyg' : skal === 'kort' ? 'utbildning' : skal === 'system' ? 'kompetenser' : undefined
  return { ids, skal, ordning, enSida: skal === 'lang' ? true : undefined }
}
