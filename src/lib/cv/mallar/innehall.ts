/**
 * CV:t som innehåll, en gång för båda renderarna.
 *
 * HTML-renderaren (render/html.ts) och Word-byggaren (src/lib/cv/word/)
 * läser samma Dokument: samma texter, samma perioder, samma rubriker, samma
 * ordning och samma uppdelning mellan huvudspalt och sidospalt. Därför kan
 * Word-filens Rubrik 2 aldrig glida från PDF:ens h2 (testet i
 * __tests__/mallsystemet.test.ts jämför dem).
 *
 * Datan kommer i CVMetadata-form (normalizeStructuredData har redan tagit
 * hand om gamla ParsedCV-format) men kan bära HTML-rester, tomma poster och
 * fält i olika stavningar; allt det tas om hand här.
 */
import type { CVCertification, CVEducation, CVExperience, CVMetadata, CVProject } from '../cv-metadata'
import { rubriker as allaRubriker } from '../rubriker'
import { SEKTIONER, type MallVal, type Ordning, type Sektion } from './kontrakt'
import type { KompetensForm, MallDef } from './typer'

/* ------------------------------------------------------------- texttvätt */

/**
 * Text ur CV-datan blir ren text: HTML-rester och entiteter bort, tecken som
 * XML inte tillåter bort (Word läser annars inte filen), radbrytningar inne i
 * ett stycke blir mellanslag.
 */
export function rensa(text: unknown): string {
  if (text === null || text === undefined) return ''
  return String(text)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const c = Number(n)
      return c >= 32 && c < 0xd800 ? String.fromCharCode(c) : ''
    })
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    // Fast mellanslag mellan tal och %, kr och procent, så att enheten aldrig
    // står ensam på en rad (UX).
    .replace(/(\d) (%|kr\b|procent\b)/g, '$1\u00A0$2')
    .normalize('NFC')
}

/** Ett textblock blir stycken: tom rad skiljer stycken, enkel radbrytning gör det inte. */
export function stycken(text: unknown): string[] {
  if (!text) return []
  const delar = Array.isArray(text) ? text : String(text).replace(/\r\n?/g, '\n').split(/\n\s*\n/)
  return delar.map(rensa).filter(Boolean)
}

/** En punkt: inledande punkttecken som användaren skrivit själv tas bort. */
export function punkttext(text: unknown): string {
  return rensa(text).replace(/^([•·▪■◦‣\-–—*]\s*)+/, '').trim()
}

/* -------------------------------------------------------------- perioder */

const MANADER = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const PAGAENDE = /^(pågående|pagaende|nuvarande|nu|present|current|ongoing|idag|i dag|tills vidare)$/i

/**
 * Ett datum som det står i ett svenskt CV: "2021", "mar 2021". ISO-datum
 * ("2021-03" och "2021-03-01") skrivs om, annan text står kvar som den är.
 */
export function datum(s: unknown): string {
  const t = rensa(s)
  if (!t) return ''
  if (PAGAENDE.test(t)) return 'Pågående'
  const iso = t.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?(?:T.*)?$/)
  if (iso) {
    const m = Number(iso[2])
    return m >= 1 && m <= 12 ? `${MANADER[m - 1]} ${iso[1]}` : iso[1]
  }
  return t
}

/** Året ur ett datum ("2021-03" och "mar 2021" ger "2021"), annars tom. */
export function ar(s: unknown): string {
  return rensa(s).match(/(\d{4})/)?.[1] ?? ''
}

/** "2018 – 2021", "2021 – Pågående"; samma start och slut ger ett år. */
export function spann(start: string, slut: string): string {
  if (!start) return slut
  if (!slut || slut === start) return start
  return `${start} – ${slut}`
}

export function periodErfarenhet(e: CVExperience): string {
  const start = datum(e.startDate)
  const slut = datum(e.endDate)
  if (slut) return spann(start, slut)
  return start ? `${start} – Pågående` : ''
}

/**
 * Utbildningens period ur start- och slutdatum. Examensåret är bara reserv
 * när slutet saknas, så att "2018 – 2018" aldrig skrivs (plan avsnitt 6b).
 */
export function periodUtbildning(e: CVEducation): string {
  const start = datum(e.startDate)
  const slut = datum(e.endDate) || datum(e.graduationYear)
  return spann(start, slut)
}

function periodProjekt(p: CVProject): string {
  return spann(datum(p.startDate), datum(p.endDate))
}

const tid = (s?: string) => {
  if (!s) return NaN
  const t = rensa(s)
  if (PAGAENDE.test(t)) return Date.now()
  const ar = t.match(/(\d{4})/)
  if (!ar) return NaN
  const iso = t.match(/^(\d{4})-(\d{1,2})/)
  return new Date(Number(ar[1]), iso ? Number(iso[2]) - 1 : 0, 1).getTime()
}

/** Nyast först: pågående överst, sedan efter slutdatum. Lika: efter startdatum. */
function sorteraErfarenhet(lista: CVExperience[]): CVExperience[] {
  return [...lista].sort((a, b) => {
    const da = a.endDate ? tid(a.endDate) : Date.now()
    const db = b.endDate ? tid(b.endDate) : Date.now()
    if ((db || 0) !== (da || 0)) return (db || 0) - (da || 0)
    return (tid(b.startDate) || 0) - (tid(a.startDate) || 0)
  })
}

function sorteraUtbildning(lista: CVEducation[]): CVEducation[] {
  const slut = (e: CVEducation) => (e.endDate ? tid(e.endDate) : e.graduationYear ? tid(e.graduationYear) : Date.now())
  return [...lista].sort((a, b) => (slut(b) || 0) - (slut(a) || 0))
}

/* ----------------------------------------------------------------- typer */

/** En post i erfarenhet, utbildning eller projekt. */
export interface Post {
  /** Jobbtitel, examen eller projektnamn. */
  titel: string
  /** Arbetsgivare eller skola, med ort. */
  under: string
  period: string
  /** Punkterna (jobb) eller detaljraderna (utbildning, projekt). */
  punkter: string[]
  /** Löptext under posten (utbildningens beskrivning, projektets text). */
  text: string[]
  /** Startåret ("2021") och slutet ("Pågående", "2021"), för stora årtal och tidsaxeln. */
  startAr: string
  slut: string
}

/** En certifiering: namnet, och utgivare och år var för sig. */
export interface IntygRad {
  namn: string
  utgivare: string
  ar: string
}

export type AvsnittInnehall =
  | { typ: 'text'; stycken: string[] }
  | { typ: 'poster'; poster: Post[] }
  | { typ: 'kompetenser'; grupper: { namn: string; lista: string[] }[] }
  | { typ: 'lista'; rader: string[] }
  | { typ: 'intyg'; rader: IntygRad[] }
  | { typ: 'sprak'; rader: { sprak: string; niva: string }[] }

export interface Avsnitt {
  sektion: Sektion
  rubrik: string
  innehall: AvsnittInnehall
}

export interface KontaktRad {
  typ: 'epost' | 'telefon' | 'ort' | 'linkedin' | 'webb'
  text: string
  /** Länkmål för e-post, LinkedIn och webb. */
  href?: string
}

export interface Dokument {
  namn: string
  titel: string
  kontakt: KontaktRad[]
  /** Fotots adress när fotot ska visas, annars undefined. */
  foto?: string
  /** Initialen i en tom fotoplats (bara förhandsvisning). */
  initial: string
  /** Avsnitt i full bredd före spalterna (tvåspalt). */
  fullBredd: Avsnitt[]
  /** Avsnitten i huvudspalten, i ordning, bara de med innehåll. */
  huvudspalt: Avsnitt[]
  /** Avsnitten i sidospalten, i ordning, bara de med innehåll. */
  sidospalt: Avsnitt[]
  rubriker: Record<Sektion, string>
  /** Punkterna på tidsaxeln (Horisont): år, etikett och typ. */
  tidsaxel: { ar: number; etikett: string; typ: 'jobb' | 'utbildning' }[]
}

/* ------------------------------------------------------------ avsnitten */

function erfarenhet(cv: CVMetadata): AvsnittInnehall | null {
  const lista = (cv.experience ?? []).filter((e) => e && (rensa(e.position) || rensa(e.company)))
  if (!lista.length) return null
  const poster = sorteraErfarenhet(lista).map((e): Post => {
    const harTitel = Boolean(rensa(e.position))
    const foretag = harTitel ? rensa(e.company) : ''
    const ort = rensa(e.location)
    const beskrivning = Array.isArray(e.description) ? e.description : e.description ? [e.description] : []
    const prestationer = Array.isArray(e.achievements) ? e.achievements : []
    return {
      titel: harTitel ? rensa(e.position) : rensa(e.company),
      under: [foretag, ort && !foretag.includes(ort) ? ort : ''].filter(Boolean).join(', '),
      period: periodErfarenhet(e),
      punkter: [...beskrivning, ...prestationer].map(punkttext).filter(Boolean),
      text: [],
      startAr: ar(e.startDate),
      slut: e.endDate ? ar(e.endDate) || datum(e.endDate) : 'Pågående',
    }
  })
  return { typ: 'poster', poster }
}

function utbildning(cv: CVMetadata): AvsnittInnehall | null {
  const lista = (cv.education ?? []).filter((e) => e && (rensa(e.degree) || rensa(e.institution)))
  if (!lista.length) return null
  const poster = sorteraUtbildning(lista).map((e): Post => {
    const harExamen = Boolean(rensa(e.degree))
    const skola = harExamen ? rensa(e.institution) : ''
    const ort = rensa(e.location)
    const punkter: string[] = []
    if (rensa(e.gpa)) punkter.push(`Betyg: ${rensa(e.gpa)}`)
    if (rensa(e.honors)) punkter.push(rensa(e.honors))
    const kurser = (e.relevantCourses ?? []).map(rensa).filter(Boolean)
    if (kurser.length) punkter.push(`Kurser: ${kurser.join(', ')}`)
    if (rensa(e.thesis)) punkter.push(`Examensarbete: ${rensa(e.thesis)}`)
    return {
      titel: harExamen ? rensa(e.degree) : rensa(e.institution),
      under: [skola, ort && !skola.includes(ort) ? ort : ''].filter(Boolean).join(', '),
      period: periodUtbildning(e),
      punkter,
      text: stycken(e.description),
      startAr: ar(e.startDate) || ar(e.graduationYear),
      slut: ar(e.endDate) || ar(e.graduationYear),
    }
  })
  return { typ: 'poster', poster }
}

function projekt(cv: CVMetadata): AvsnittInnehall | null {
  const lista = (cv.projects ?? []).filter((p) => p && rensa(p.name || p.title))
  if (!lista.length) return null
  return {
    typ: 'poster',
    poster: lista.map((p): Post => {
      const teknik = (p.technologies ?? []).map(rensa).filter(Boolean)
      return {
        titel: rensa(p.name || p.title),
        under: rensa(p.link || p.url).replace(/^https?:\/\/(www\.)?/i, ''),
        period: periodProjekt(p),
        punkter: [...(p.achievements ?? []).map(punkttext).filter(Boolean), ...(teknik.length ? [`Verktyg: ${teknik.join(', ')}`] : [])],
        text: stycken(p.description),
        startAr: ar(p.startDate),
        slut: ar(p.endDate),
      }
    }),
  }
}

/** Kompetensgrupperna, utan språk som redan står under Språk. */
function kompetenser(cv: CVMetadata): AvsnittInnehall | null {
  const sprak = (cv.languages ?? []).map((l) => rensa(typeof l === 'string' ? l : l?.language).toLowerCase()).filter(Boolean)
  const arSprak = (s: string) => sprak.some((l) => s.toLowerCase() === l || s.toLowerCase().startsWith(`${l} `) || s.toLowerCase().startsWith(`${l},`))
  const grupper = (cv.skills ?? [])
    .map((g) => {
      if (typeof g === 'string') return { namn: '', lista: [rensa(g)] }
      const lista = (g?.skills ?? []).length ? g.skills : g?.name ? [g.name] : []
      return { namn: rensa(g?.category), lista: lista.map(rensa) }
    })
    .map((g) => ({
      namn: g.namn,
      lista: g.lista.filter((s) => s && !/se bifogad|finns specificerade/i.test(s) && !arSprak(s)),
    }))
    .filter((g) => g.lista.length > 0)
  if (!grupper.length) return null
  // Fristående strängar slås ihop till en grupp utan namn.
  const utanNamn = grupper.filter((g) => !g.namn).flatMap((g) => g.lista)
  const medNamn = grupper.filter((g) => g.namn)
  const alla = [...medNamn, ...(utanNamn.length ? [{ namn: '', lista: utanNamn }] : [])]
  return { typ: 'kompetenser', grupper: alla }
}

function intygRad(c: CVCertification | string): IntygRad {
  if (typeof c === 'string') return { namn: rensa(c), utgivare: '', ar: '' }
  const namn = rensa(c?.name)
  const utgivare = rensa(c?.issuer)
  return { namn, utgivare: namn.includes(utgivare) ? '' : utgivare, ar: datum(c?.issueDate || c?.date) }
}

/** Utgivare och år som en text: "PMI 2022", eller med komma ("PMI, 2022"). */
export function intygDetalj(r: IntygRad, sep = ' '): string {
  return [r.utgivare, r.ar].filter(Boolean).join(sep)
}

function intyg(cv: CVMetadata): AvsnittInnehall | null {
  const rader = ((cv.certifications ?? []) as (CVCertification | string)[]).map(intygRad).filter((r) => r.namn)
  return rader.length ? { typ: 'intyg', rader } : null
}

function sprakAvsnitt(cv: CVMetadata): AvsnittInnehall | null {
  const rader = (cv.languages ?? [])
    .map((l) => (typeof l === 'string' ? { sprak: rensa(l), niva: '' } : { sprak: rensa(l?.language), niva: rensa(l?.proficiency) }))
    .filter((l) => l.sprak)
  return rader.length ? { typ: 'sprak', rader } : null
}

function intressen(cv: CVMetadata): AvsnittInnehall | null {
  const rader = (cv.interests ?? []).map(rensa).filter(Boolean)
  return rader.length ? { typ: 'lista', rader } : null
}

function profil(cv: CVMetadata): AvsnittInnehall | null {
  const s = stycken(cv.summary)
  return s.length ? { typ: 'text', stycken: s } : null
}

/** Referenser står alltid som den svenska standardfrasen. */
export const REFERENSER_TEXT = 'Lämnas på begäran'

function referenser(): AvsnittInnehall {
  return { typ: 'text', stycken: [REFERENSER_TEXT] }
}

const BYGGARE: Record<Sektion, (cv: CVMetadata) => AvsnittInnehall | null> = {
  profil,
  erfarenhet,
  utbildning,
  kompetenser,
  intyg,
  sprak: sprakAvsnitt,
  projekt,
  intressen,
  referenser,
}

/* --------------------------------------------------------------- ordning */

/**
 * Ordningsvalet: avsnittet flyttas upp direkt efter profilen (eller först om
 * profilen saknas i listan). 'standard' lämnar mallens ordning.
 */
export function ordna(lista: readonly Sektion[], ordning: Ordning | undefined): Sektion[] {
  const ut = [...lista]
  if (!ordning || ordning === 'standard') return ut
  const flytta: Sektion = ordning
  const i = ut.indexOf(flytta)
  if (i < 0) return ut
  ut.splice(i, 1)
  const efter = ut.indexOf('profil')
  ut.splice(efter + 1, 0, flytta)
  return ut
}

/* ------------------------------------------------------------------ bygg */

function kontakt(cv: CVMetadata): KontaktRad[] {
  const p = cv.personalInfo ?? ({} as CVMetadata['personalInfo'])
  const ut: KontaktRad[] = []
  const epost = rensa(p.email)
  if (epost) ut.push({ typ: 'epost', text: epost, href: `mailto:${epost}` })
  const tel = rensa(p.phone)
  if (tel) ut.push({ typ: 'telefon', text: tel })
  const ort = (rensa(p.address) || rensa(p.location)).replace(/,\s*Sverige$/i, '')
  if (ort) ut.push({ typ: 'ort', text: ort })
  const li = rensa(p.linkedin || p.linkedIn)
  if (li) {
    const text = li.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
    ut.push({ typ: 'linkedin', text, href: `https://${text}` })
  }
  const webb = rensa(p.website || p.github)
  if (webb) {
    const text = webb.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
    ut.push({ typ: 'webb', text, href: `https://${text}` })
  }
  return ut
}

/** Ska fotot visas? Mallen måste ha fotoplats, valet får inte vara av. */
export function visaFoto(def: MallDef, val: MallVal | undefined): boolean {
  if (!def.foto) return false
  return val?.foto ?? def.foto.forval
}

/** Kompetensformen för ett avsnitt i huvud- eller sidospalten. */
export function kompetensForm(def: MallDef, iSidospalt: boolean): KompetensForm {
  return iSidospalt ? def.kompetenserISpalt ?? 'lista' : def.kompetenser
}

/** Spaltens avsnitt ur layouten: sidospalt eller tvåspaltens högerspalt. */
export function spaltSektioner(def: MallDef): { fullBredd: Sektion[]; spalt: Sektion[]; vanster: Sektion[] | null } {
  const l = def.layout
  if (l.typ === 'sidospalt') return { fullBredd: [], spalt: l.spalt.sektioner, vanster: null }
  if (l.typ === 'tvaspalt') return { fullBredd: l.fullBredd, spalt: l.hoger, vanster: l.vanster }
  return { fullBredd: [], spalt: [], vanster: null }
}

/** CV:t som Dokument för en mall och ett val. */
export function byggDokument(cv: CVMetadata, def: MallDef, val: MallVal = {}): Dokument {
  const rub = allaRubriker(cv, val)
  const bygg = (s: Sektion): Avsnitt | null => {
    const innehall = BYGGARE[s](cv)
    return innehall ? { sektion: s, rubrik: rub[s], innehall } : null
  }
  const delar = spaltSektioner(def)
  const iSpalt = new Set([...delar.spalt, ...delar.fullBredd])
  // Huvudspaltens ordning: mallens (eller tvåspaltens vänsterspalt), plus
  // avsnitt som inte nämns någonstans (så att inget innehåll tappas),
  // referenser sist.
  const bas = delar.vanster ?? def.ordning
  const namnda = new Set<Sektion>([...bas, ...iSpalt])
  const huvud = [...bas.filter((s) => !iSpalt.has(s)), ...SEKTIONER.filter((s) => !namnda.has(s) && s !== 'referenser')]
  if (!namnda.has('referenser')) huvud.push('referenser')
  const ordning = val.ordning && (!def.ordningsval || def.ordningsval.includes(val.ordning)) ? val.ordning : 'standard'

  const p = cv.personalInfo ?? ({} as CVMetadata['personalInfo'])
  const namn = rensa(p.fullName)
  const foto = visaFoto(def, val) ? rensa(p.profilePhotoUrl) || undefined : undefined
  return {
    namn,
    titel: rensa(p.title),
    kontakt: kontakt(cv),
    foto,
    initial: (namn.match(/\p{L}/u)?.[0] ?? '').toUpperCase(),
    fullBredd: delar.fullBredd.map(bygg).filter((a): a is Avsnitt => a !== null),
    huvudspalt: ordna(huvud, ordning).map(bygg).filter((a): a is Avsnitt => a !== null),
    sidospalt: ordna(delar.spalt, ordning).map(bygg).filter((a): a is Avsnitt => a !== null),
    rubriker: rub,
    tidsaxel: tidsaxel(cv),
  }
}

/** Tidsaxelns punkter: varje anställning och utbildning med startår. */
function tidsaxel(cv: CVMetadata): Dokument['tidsaxel'] {
  const ut: Dokument['tidsaxel'] = []
  for (const e of cv.experience ?? []) {
    const a = Number(ar(e?.startDate))
    if (a && rensa(e.company || e.position)) ut.push({ ar: a, etikett: rensa(e.company) || rensa(e.position), typ: 'jobb' })
  }
  for (const e of cv.education ?? []) {
    const a = Number(ar(e?.startDate) || ar(e?.graduationYear))
    if (a && rensa(e.institution || e.degree)) ut.push({ ar: a, etikett: rensa(e.institution) || rensa(e.degree), typ: 'utbildning' })
  }
  return ut.sort((x, y) => x.ar - y.ar)
}
