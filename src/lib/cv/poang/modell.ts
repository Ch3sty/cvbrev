/**
 * Läsbarhetspoängen, version 2 (docs/poangmodell-cv-analys.md).
 *
 * Version 2 (2026-11-21): kontaktuppgifterna läses som arket ritar dem
 * (kontakt.ts), personbeskrivningen är lagom från 30 ord, rollernas och
 * utbildningarnas datumformat jämförs var för sig, CV:t är lagom från 150
 * ord, titlar med bindestreck och korta titlar hittas i personbeskrivningen,
 * samtidiga roller får stå i valfri ordning och några vanliga verb till
 * räknas. Varje kontroll ska gå att uppfylla med ett vanligt, korrekt CV.
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
import { harNiva, sprakLage } from '../sprak'
import { kanonisktCv } from './kanon'
import type { ArkKontakt } from './kontakt'
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
export const POANG_VERSION = 2 as const

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

const STOPP = new Set([
  'senior', 'junior', 'biträdande', 'tillförordnad', 'inom', 'med', 'och', 'för', 'på', 'av', 'vid', 'som', 'hos',
  'i', 'en', 'ett', 'the', 'of', 'and', 'at',
])

/** Personbeskrivningen är lagom lång från och med så många ord (version 2: 30, förut 35). */
export const PROFIL_LAGOM_MIN = 30
export const PROFIL_LAGOM_MAX = 110
/** CV:t är lagom långt från och med så många ord (version 2: 150, förut 200). */
export const CV_LAGOM_MIN = 150
export const CV_LAGOM_MAX = 1100
/** En punkt längre än så är överlång. */
export const PUNKT_MAX_ORD = 35
/** Kompetenserna: lagom många, och högst så här många ord per kompetens. */
export const KOMPETENSER_LAGOM_MIN = 6
export const KOMPETENSER_LAGOM_MAX = 20
export const KOMPETENS_MAX_ORD = 4

const r2 = (n: number) => Math.round(n * 100) / 100
const andel = (del: number, hel: number) => (hel > 0 ? del / hel : 0)

/** En kontroll med opåverkad delpoäng (raw), för genomgångens status. */
export type KontrollRaw = Kontroll & { raw: number }

function k(id: string, text: string, max: number, varde: number): KontrollRaw {
  const raw = Math.max(0, Math.min(max, r2(varde)))
  return { id, text, max, poang: Math.round(raw * 10) / 10, raw }
}

export type Mattad = ReturnType<typeof matt>

/** Bokstäverna i en text, gemener, utan bindestreck och skiljetecken ("IT-konsult" blir "itkonsult"). */
const baraBokstaver = (s: string) => s.toLowerCase().replace(/[^\p{L}\s]/gu, '')

/**
 * Säger personbeskrivningen vilken roll hon har? Titelorden jämförs med
 * bindestreck och skiljetecken bortplockade på båda sidor, så att
 * "IT-konsult" och "HR-chef" hittas. Ord på minst fem bokstäver får stå i
 * ett sammansatt ord ("projektledare" i "IT-projektledare"); kortare titlar
 * ("Kock", "Chef", "VD") måste stå som egna ord.
 */
export function profilenNamnerRollen(profil: string, titlar: readonly string[]): boolean {
  const text = ` ${baraBokstaver(profil).replace(/\s+/g, ' ')} `
  for (const titel of titlar) {
    const ord = titel.toLowerCase().split(/\s+/).filter(Boolean)
    const kandidater = new Set<string>()
    for (const w of ord) {
      kandidater.add(baraBokstaver(w))
      for (const del of w.split(/[^\p{L}]+/u)) kandidater.add(del)
    }
    for (const w of kandidater) {
      if (!w || w.length < 2 || STOPP.has(w)) continue
      // Fem bokstäver: var som helst. Tre eller fyra: i början av ett ord
      // ("kock", "kocken"). Två ("VD"): bara som eget ord.
      if (w.length >= 5 ? text.includes(w) : w.length >= 3 ? text.includes(` ${w}`) : text.includes(` ${w} `)) return true
    }
  }
  return false
}

/** Allt modellen läser ur CV:t, mätt en gång. Kontaktuppgifterna som arket visar dem, när de är kända. */
export function matt(cv: CVMetadata, ark?: ArkKontakt | null) {
  const pi = (cv.personalInfo ?? {}) as unknown as Record<string, unknown>
  const profil = falt(cv.summary)

  // index: postens plats i CV:ts lista, för genomgångens pekare.
  const roller = (Array.isArray(cv.experience) ? cv.experience : []).flatMap((e, index) => {
    if (!e || !(falt(e.position) || falt(e.company) || (Array.isArray(e.description) && e.description.length > 0))) return []
    const rader = [
      ...(Array.isArray(e.description) ? e.description : typeof e.description === 'string' ? [e.description] : []),
      ...(Array.isArray(e.achievements) ? e.achievements : []),
    ]
    return [
      {
        index,
        titel: falt(e.position),
        arbetsgivare: falt(e.company),
        period: tolkaPeriod(e.startDate, e.endDate),
        pastaenden: pastaenden(rader),
      },
    ]
  })

  const utbildningar = (Array.isArray(cv.education) ? cv.education : []).flatMap((u, index) => {
    if (!u || !(falt(u.degree) || falt(u.institution))) return []
    const s = falt(u.startDate)
    const e = falt(u.endDate)
    const g = falt(u.graduationYear)
    // Bara examensår eller bara slutår: avslutad det året.
    const period: Period = s ? tolkaPeriod(s, e || g) : tolkaPeriod(e || g, e || g)
    return [{ index, namn: falt(u.degree), skola: falt(u.institution), period, beskrivning: falt(u.description) }]
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
    namn: ark ? falt(ark.namn) : falt(pi.fullName),
    epost: ark ? falt(ark.epost) : falt(pi.email),
    telefon: ark ? falt(ark.telefon) : falt(pi.phone),
    ort: ark ? falt(ark.ort) : falt(pi.address) || falt(pi.location),
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
  const langd =
    n >= PROFIL_LAGOM_MIN && n <= PROFIL_LAGOM_MAX
      ? 4
      : (n >= 20 && n < PROFIL_LAGOM_MIN) || (n > PROFIL_LAGOM_MAX && n <= 150)
        ? 2
        : 0
  const rollen = n >= 5 && profilenNamnerRollen(m.profil, m.titlar)
  return [
    k('finns', 'Det finns en personbeskrivning (minst 15 ord)', 5, finns),
    k('langd', `Lagom lång: ${PROFIL_LAGOM_MIN} till ${PROFIL_LAGOM_MAX} ord`, 4, langd),
    k('roll', 'Den säger vilken roll du har eller söker', 3, rollen ? 3 : 0),
    k('konkret', 'Den har något konkret: år, antal eller resultat', 3, n >= 5 && harTal(m.profil) ? 3 : 0),
  ]
}

/** Har rollen minst ett påstående med ett tal (kontrollen "tal"). */
export function rollHarTal(r: { pastaenden: readonly string[] }): boolean {
  return r.pastaenden.some(harTal)
}

/** Andelen av rollens påståenden som börjar med ett handlingsverb (kontrollen "verb"). */
export function rollVerbAndel(r: { pastaenden: readonly string[] }): number {
  return andel(r.pastaenden.filter(borjarMedVerb).length, r.pastaenden.length)
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
  const medTal = R.filter(rollHarTal).length
  const verb = R.map((r) => (r.pastaenden.length === 0 ? 0 : Math.min(1, rollVerbAndel(r) / 0.5)))
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
  const antal = n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 3 : n <= KOMPETENSER_LAGOM_MAX ? 6 : n <= 30 ? 4 : 2
  const korta = andel(m.kompetenser.filter((x) => ord(x).length <= KOMPETENS_MAX_ORD).length, n)
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
  // En nivå finns: ett steg eller personens egen formulering (sprak.ts, harNiva).
  const nivaer = finns && m.sprak.every((l) => harNiva(l.proficiency))
  return [
    k('finns', 'Språk står med', 3, finns ? 3 : 0),
    k('niva', 'Nivå på varje språk', 2, nivaer ? 2 : 0),
  ]
}

/**
 * Datumformatet i en grupp perioder: ett format för alla (år, eller månad
 * och år), eller null när de blandas. Tom grupp: 'tom'.
 */
export function gruppFormat(perioder: readonly Period[]): 'tom' | 'ar' | 'manad' | null {
  const format = new Set(perioder.filter((p) => p.tolkbar).map((p) => p.format))
  if (format.size === 0) return 'tom'
  if (format.size > 1 || format.has('blandat')) return null
  return format.has('manad') ? 'manad' : 'ar'
}

/**
 * Står rollerna med senaste först? Jämför slutåret (pågående är senast).
 * Roller som slutar samma år, eller som pågår samtidigt, får stå i valfri
 * ordning (version 2: förut avgjorde startåret, och ett extrajobb som pågår
 * bredvid huvudjobbet kunde aldrig stå rätt). Returnerar index för den
 * första roll som står för tidigt, eller -1.
 */
export function forstaFelOrdnad(perioder: readonly Period[]): number {
  const slut = (p: Period) => (p.pagar ? Infinity : (p.slutAr ?? -Infinity))
  const tolkbara = perioder.map((p, i) => ({ p, i })).filter((x) => x.p.tolkbar)
  for (let j = 1; j < tolkbara.length; j++) {
    if (slut(tolkbara[j].p) > slut(tolkbara[j - 1].p)) return tolkbara[j].i
  }
  return -1
}

function format(m: Mattad) {
  const perioder = [...m.roller.map((r) => r.period), ...m.utbildningar.map((u) => u.period)]
  const tolkbara = perioder.filter((p) => p.tolkbar)
  // Version 2: rollerna jämförs för sig och utbildningarna för sig. Roller
  // med månad och år och utbildningar med bara examensår är enhetligt.
  const enhetligt =
    tolkbara.length > 0 &&
    gruppFormat(m.roller.map((r) => r.period)) !== null &&
    gruppFormat(m.utbildningar.map((u) => u.period)) !== null

  const kronologi = m.roller.some((r) => r.period.tolkbar) && forstaFelOrdnad(m.roller.map((r) => r.period)) < 0

  const o = m.totalOrd
  const langd =
    o >= CV_LAGOM_MIN && o <= CV_LAGOM_MAX ? 3 : (o >= 100 && o < CV_LAGOM_MIN) || (o > CV_LAGOM_MAX && o <= 1500) ? 1.5 : 0

  const alla = m.roller.flatMap((r) => r.pastaenden)
  const korta = andel(alla.filter((p) => ord(p).length <= PUNKT_MAX_ORD).length, alla.length)

  return [
    k('datum', 'Alla perioder går att tolka (år, eller pågående)', 4, 4 * andel(tolkbara.length, perioder.length)),
    k('enhetligt', 'Samma datumformat i rollerna, och i utbildningarna', 2, enhetligt ? 2 : 0),
    k('ordning', 'Senaste rollen står först', 3, kronologi ? 3 : 0),
    k('langd', `Lagom långt: ${CV_LAGOM_MIN} till ${CV_LAGOM_MAX} ord`, 3, langd),
    k('punkter', `Inga överlånga punkter (högst ${PUNKT_MAX_ORD} ord)`, 3, alla.length === 0 ? 0 : korta >= 0.9 ? 3 : 3 * korta),
  ]
}

const RAKNA: Record<KategoriId, (m: Mattad) => KontrollRaw[]> = {
  kontakt,
  profil,
  erfarenhet,
  kompetenser,
  utbildning,
  sprak,
  format,
}

/**
 * Mätningen och varje kontroll med opåverkad delpoäng. Samma uträkning som
 * raknaPoang (som bygger på den), för genomgången (genomgang.ts), så att
 * förklaringen aldrig mäter på ett annat sätt än poängen.
 */
export function raknaDetalj(cv: CVMetadata, ark?: ArkKontakt | null) {
  const m = matt(cv, ark)
  const kategorier = KATEGORIER.map(({ id, namn, max }) => {
    const kontroller = RAKNA[id](m)
    const summa = r2(kontroller.reduce((s, x) => s + x.raw, 0))
    return { id, namn, max, poang: Math.max(0, Math.min(max, Math.round(summa))), kontroller }
  })
  return { m, kategorier }
}

/**
 * Poängen för ett CV i kanonisk form (kanonisktCv). Kategorierna avrundas
 * var för sig till heltal och summeras, så att uppdelningen alltid går jämnt
 * upp i totalen. Med `ark` räknas kontaktuppgifterna som arket visar dem
 * (kontakt.ts); utan läses de ur CV:ts egna fält.
 */
export function raknaPoang(cv: CVMetadata, ark?: ArkKontakt | null): Poang {
  const kategorier: Kategori[] = raknaDetalj(cv, ark).kategorier.map(({ kontroller, ...rest }) => ({
    ...rest,
    kontroller: kontroller.map(({ raw: _raw, ...k }) => k),
  }))
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
export function poangFor(structuredData: unknown, cvText?: string | null, ark?: ArkKontakt | null): Poang | null {
  const cv = kanonisktCv(structuredData, cvText)
  return cv ? raknaPoang(cv, ark) : null
}
