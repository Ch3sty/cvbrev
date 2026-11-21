/**
 * Läsbarhetspoängen, version 1 (docs/poangmodell-cv-analys.md).
 *
 * En ren funktion av CV:ts innehåll: samma CV ger alltid samma poäng. Inget
 * här beror på slump, datum, klockslag eller AI-svar. Sju kategorier med
 * maxpoäng som summerar till 100, och varje delpoäng är något som går att
 * peka på i CV:t. Fler ord ger aldrig fler poäng: för lång profil, för många
 * punkter, för många kompetenser och för långt CV drar ner.
 *
 * Klientsäker och snabb (under en millisekund för ett vanligt CV), så att
 * väljsteget kan räkna om potentialen vid varje val.
 */
import type { CVMetadata } from '../cv-metadata'
import { sprakLage, tolkaNiva } from '../sprak'
import { kanonisktCv } from './kanon'
import {
  borjarMedVerb,
  falt,
  harTal,
  kompetenserIcv,
  ord,
  pastaenden,
  tolkaPeriod,
  type Period,
} from './matt'

/** Modellens version. Tal från olika versioner blandas aldrig. */
export const POANG_VERSION = 1 as const

export type KategoriId = 'kontakt' | 'profil' | 'erfarenhet' | 'kompetenser' | 'utbildning' | 'sprak' | 'format'

export interface Kontroll {
  id: string
  /** Vad som mäts, i klartext för rutan "Så räknas poängen". */
  text: string
  max: number
  /** Delpoängen, avrundad till en decimal. */
  poang: number
}

export interface Kategori {
  id: KategoriId
  namn: string
  max: number
  /** Kategorins poäng, heltal. Kategorierna summerar exakt till totalen. */
  poang: number
  kontroller: Kontroll[]
}

export interface Poang {
  version: typeof POANG_VERSION
  /** 0 till 100, heltal. */
  total: number
  kategorier: Kategori[]
}

/** Kategorierna i visningsordning, med maxpoäng. */
export const KATEGORIER: ReadonlyArray<{ id: KategoriId; namn: string; max: number }> = [
  { id: 'kontakt', namn: 'Kontaktuppgifter', max: 10 },
  { id: 'profil', namn: 'Personbeskrivning', max: 15 },
  { id: 'erfarenhet', namn: 'Erfarenhet', max: 35 },
  { id: 'kompetenser', namn: 'Kompetenser', max: 12 },
  { id: 'utbildning', namn: 'Utbildning', max: 8 },
  { id: 'sprak', namn: 'Språk', max: 5 },
  { id: 'format', namn: 'Datum, ordning och längd', max: 15 },
]

/** Så många roller räknas, i CV:ts ordning. Äldre roller väger inte in. */
export const ROLLER_SOM_RAKNAS = 5

const STOPP = new Set(['senior', 'junior', 'biträdande', 'tillförordnad', 'inom', 'med', 'och', 'för'])

const r2 = (n: number) => Math.round(n * 100) / 100
const andel = (del: number, hel: number) => (hel > 0 ? del / hel : 0)

function k(id: string, text: string, max: number, varde: number): Kontroll & { raw: number } {
  const raw = Math.max(0, Math.min(max, r2(varde)))
  return { id, text, max, poang: Math.round(raw * 10) / 10, raw }
}

type Mattad = ReturnType<typeof matt>

/** Allt modellen läser ur CV:t, mätt en gång. */
function matt(cv: CVMetadata) {
  const pi = (cv.personalInfo ?? {}) as unknown as Record<string, unknown>
  const profil = falt(cv.summary)

  const alla = (Array.isArray(cv.experience) ? cv.experience : []).filter(
    (e) => e && (falt(e.position) || falt(e.company) || (Array.isArray(e.description) && e.description.length > 0))
  )
  const roller = alla.map((e) => {
    const rader = [
      ...(Array.isArray(e.description) ? e.description : typeof e.description === 'string' ? [e.description] : []),
      ...(Array.isArray(e.achievements) ? e.achievements : []),
    ]
    return {
      titel: falt(e.position),
      arbetsgivare: falt(e.company),
      period: tolkaPeriod(e.startDate, e.endDate),
      pastaenden: pastaenden(rader),
    }
  })

  const utbildningar = (Array.isArray(cv.education) ? cv.education : [])
    .filter((u) => u && (falt(u.degree) || falt(u.institution)))
    .map((u) => {
      const s = falt(u.startDate)
      const e = falt(u.endDate)
      const g = falt(u.graduationYear)
      // Bara examensår eller bara slutår: avslutad det året.
      const period: Period = s ? tolkaPeriod(s, e || g) : tolkaPeriod(e || g, e || g)
      return { namn: falt(u.degree), skola: falt(u.institution), period, beskrivning: falt(u.description) }
    })

  const kompetenser = kompetenserIcv(cv.skills)

  const sprak = Array.isArray(cv.languages)
    ? cv.languages.filter((l) => l && typeof l.language === 'string' && l.language.trim())
    : []

  const totalOrd =
    ord(profil).length +
    roller.reduce(
      (s, r) => s + ord(r.titel).length + ord(r.arbetsgivare).length + r.pastaenden.reduce((t, p) => t + ord(p).length, 0),
      0
    ) +
    utbildningar.reduce((s, u) => s + ord(u.namn).length + ord(u.skola).length + ord(u.beskrivning).length, 0) +
    kompetenser.reduce((s, x) => s + ord(x).length, 0) +
    sprak.length +
    (Array.isArray(cv.projects)
      ? cv.projects.reduce((s, p) => s + ord(falt(p?.name)).length + ord(falt(p?.description)).length, 0)
      : 0) +
    (Array.isArray(cv.certifications)
      ? cv.certifications.reduce((s, c) => s + ord(falt(typeof c === 'string' ? c : c?.name)).length, 0)
      : 0)

  return {
    namn: falt(pi.fullName),
    epost: falt(pi.email),
    telefon: falt(pi.phone),
    ort: falt(pi.address) || falt(pi.location),
    titlar: [falt(pi.title), falt(cv.targetRole), ...roller.slice(0, 3).map((r) => r.titel)].filter(Boolean),
    profil,
    roller,
    utbildningar,
    kompetenser,
    sprakLage: sprakLage(cv),
    sprak,
    totalOrd,
  }
}

/* ---------------------------------------------------------- kategorierna */

function kontakt(m: Mattad) {
  return [
    k('namn', 'Namn', 2, m.namn.length >= 2 ? 2 : 0),
    k('epost', 'E-postadress', 3, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m.epost) ? 3 : 0),
    k('telefon', 'Telefonnummer', 3, m.telefon.replace(/\D/g, '').length >= 7 ? 3 : 0),
    k('ort', 'Ort eller adress', 2, m.ort ? 2 : 0),
  ]
}

function profil(m: Mattad) {
  const n = ord(m.profil).length
  // En rad på fem till fjorton ord är en början, inte en personbeskrivning.
  const finns = n >= 15 ? 5 : n >= 5 ? 2 : 0
  const langd = n >= 35 && n <= 110 ? 4 : (n >= 20 && n < 35) || (n > 110 && n <= 150) ? 2 : 0
  const lag = m.profil.toLowerCase()
  const nyckelord = m.titlar
    .flatMap((t) => ord(t.toLowerCase()).map((w) => w.replace(/[^\p{L}]/gu, '')))
    .filter((w) => w.length >= 5 && !STOPP.has(w))
  const rollen = n >= 5 && nyckelord.some((w) => lag.includes(w))
  return [
    k('finns', 'Det finns en personbeskrivning (minst 15 ord)', 5, finns),
    k('langd', 'Lagom lång: 35 till 110 ord', 4, langd),
    k('roll', 'Den säger vilken roll du har eller söker', 3, rollen ? 3 : 0),
    k('konkret', 'Den har något konkret: år, antal eller resultat', 3, n >= 5 && harTal(m.profil) ? 3 : 0),
  ]
}

function erfarenhet(m: Mattad) {
  const R = m.roller.slice(0, ROLLER_SOM_RAKNAS)
  const n = R.length
  const komplett = R.filter((r) => r.titel && r.arbetsgivare && r.period.tolkbar).length
  const beskriven = R.filter((r) => r.pastaenden.length >= 1).length
  const antalPoang = R.map((r) => {
    const p = r.pastaenden.length
    if (p >= 2 && p <= 8) return 1
    if (p === 1 || (p >= 9 && p <= 12)) return 0.5
    return 0
  })
  const medTal = R.filter((r) => r.pastaenden.some(harTal)).length
  const verb = R.map((r) => {
    if (r.pastaenden.length === 0) return 0
    const a = andel(r.pastaenden.filter(borjarMedVerb).length, r.pastaenden.length)
    return Math.min(1, a / 0.5)
  })
  const medel = (v: number[]) => (v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0)
  return [
    k('finns', 'Minst en roll', 5, n > 0 ? 5 : 0),
    k('rubrik', 'Varje roll har titel, arbetsgivare och period', 8, 8 * andel(komplett, n)),
    k('beskrivning', 'Varje roll beskriver vad du gjorde', 6, 6 * andel(beskriven, n)),
    k('antal', 'Lagom många punkter per roll: 2 till 8', 4, 4 * medel(antalPoang)),
    k('tal', 'Varje roll har minst ett resultat i siffror', 6, 6 * andel(medTal, n)),
    k('verb', 'Minst hälften av punkterna börjar med vad du gjorde', 6, 6 * medel(verb)),
  ]
}

function kompetenser(m: Mattad) {
  const n = m.kompetenser.length
  const antal = n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 3 : n <= 20 ? 6 : n <= 30 ? 4 : 2
  const korta = andel(m.kompetenser.filter((x) => ord(x).length <= 4).length, n)
  return [
    k('finns', 'Det finns ett avsnitt med kompetenser', 3, n > 0 ? 3 : 0),
    k('antal', 'Lagom många: 6 till 20', 6, antal),
    k('korta', 'Korta, sökbara termer (högst fyra ord)', 3, n === 0 ? 0 : korta >= 0.9 ? 3 : 3 * korta),
  ]
}

function utbildning(m: Mattad) {
  const U = m.utbildningar
  const n = U.length
  return [
    k('finns', 'Minst en utbildning', 4, n > 0 ? 4 : 0),
    k('namn', 'Varje utbildning har namn och skola', 2, 2 * andel(U.filter((u) => u.namn && u.skola).length, n)),
    k('period', 'Varje utbildning har år eller period', 2, 2 * andel(U.filter((u) => u.period.tolkbar).length, n)),
  ]
}

function sprak(m: Mattad) {
  const finns = m.sprakLage === 'finns' && m.sprak.length > 0
  const nivaer = finns && m.sprak.every((l) => tolkaNiva(l.proficiency) !== '')
  return [
    k('finns', 'Språk står med', 3, finns ? 3 : 0),
    k('niva', 'Nivå på varje språk', 2, nivaer ? 2 : 0),
  ]
}

function format(m: Mattad) {
  const perioder = [...m.roller.map((r) => r.period), ...m.utbildningar.map((u) => u.period)]
  const tolkbara = perioder.filter((p) => p.tolkbar)
  const format = new Set(tolkbara.map((p) => p.format))
  const enhetligt = tolkbara.length > 0 && format.size === 1 && !format.has('blandat')

  // Senaste rollen först: slutår (pågående sist i tiden), sedan startår.
  const nyckel = (p: Period) => [p.pagar ? Infinity : (p.slutAr ?? -Infinity), p.startAr ?? -Infinity] as const
  const ordnade = m.roller.filter((r) => r.period.tolkbar).map((r) => nyckel(r.period))
  let kronologi = ordnade.length > 0
  for (let i = 1; i < ordnade.length; i++) {
    const [aS, aB] = ordnade[i - 1]
    const [bS, bB] = ordnade[i]
    if (bS > aS || (bS === aS && bB > aB)) {
      kronologi = false
      break
    }
  }

  const o = m.totalOrd
  const langd = o >= 200 && o <= 1100 ? 3 : (o >= 120 && o < 200) || (o > 1100 && o <= 1500) ? 1.5 : 0

  const alla = m.roller.flatMap((r) => r.pastaenden)
  const korta = andel(alla.filter((p) => ord(p).length <= 35).length, alla.length)

  return [
    k('datum', 'Alla perioder går att tolka (år, eller pågående)', 4, 4 * andel(tolkbara.length, perioder.length)),
    k('enhetligt', 'Samma datumformat genom hela CV:t', 2, enhetligt ? 2 : 0),
    k('ordning', 'Senaste rollen står först', 3, kronologi ? 3 : 0),
    k('langd', 'Lagom långt: 200 till 1100 ord', 3, langd),
    k('punkter', 'Inga överlånga punkter (högst 35 ord)', 3, alla.length === 0 ? 0 : korta >= 0.9 ? 3 : 3 * korta),
  ]
}

const RAKNA: Record<KategoriId, (m: Mattad) => Array<Kontroll & { raw: number }>> = {
  kontakt,
  profil,
  erfarenhet,
  kompetenser,
  utbildning,
  sprak,
  format,
}

/**
 * Poängen för ett CV i kanonisk form (kanonisktCv). Kategorierna avrundas
 * var för sig till heltal och summeras, så att uppdelningen alltid går jämnt
 * upp i totalen.
 */
export function raknaPoang(cv: CVMetadata): Poang {
  const m = matt(cv)
  const kategorier: Kategori[] = KATEGORIER.map(({ id, namn, max }) => {
    const kontroller = RAKNA[id](m)
    const summa = r2(kontroller.reduce((s, x) => s + x.raw, 0))
    return {
      id,
      namn,
      max,
      poang: Math.max(0, Math.min(max, Math.round(summa))),
      kontroller: kontroller.map(({ raw: _raw, ...rest }) => rest),
    }
  })
  return {
    version: POANG_VERSION,
    total: kategorier.reduce((s, x) => s + x.poang, 0),
    kategorier,
  }
}

/**
 * Poängen ur lagrad data (cv_texts.structured_data och cv_text). null när
 * strukturen saknas: då finns inget att räkna på.
 */
export function poangFor(structuredData: unknown, cvText?: string | null): Poang | null {
  const cv = kanonisktCv(structuredData, cvText)
  return cv ? raknaPoang(cv) : null
}
