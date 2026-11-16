/**
 * Rubrikmodellen (docs/plan-mallar-2026-11-15.md avsnitt 3.1, rapporten
 * mallar-genomgang-2026-11-15 avsnitt 3.4 och 7.4).
 *
 * Mallen äger formen, CV:t äger orden. Ingen mall byter rubrik. Rubriken för
 * ett avsnitt kommer, i den här ordningen, ur:
 *   1. valet i anropet (rubrikarket, osparat eller nyss sparat),
 *   2. CV:ts sparade rubriker (cv_texts.section_titles, CVMetadata.sectionTitles),
 *   3. uppsättningen för CV:ts yrkesområde (förval ur titeln, eller angiven),
 *   4. bibliotekets förval.
 *
 * Klientsäker och liten: ren data och rena funktioner, inga importer utom
 * typer. Artikelkomponenten använder `uppsattningForTitel` medan besökaren
 * skriver sin titel.
 */
import { SEKTIONER, type MallVal, type Sektion } from './mallar/kontrakt'

export { SEKTIONER }
export type { Sektion }

/** Längsta egna rubrik, i tecken. */
export const RUBRIK_MAX = 40

/**
 * Biblioteket: svenska standardrubriker per avsnitt, förvalet först
 * (copywriterns lista). Inga och-tecken: svenska rekryterare skriver "och".
 */
export const BIBLIOTEK: Readonly<Record<Sektion, readonly string[]>> = {
  profil: ['Profil', 'Sammanfattning', 'Om mig', 'Yrkesprofil', 'Personlig profil', 'Kort om mig'],
  erfarenhet: [
    'Arbetslivserfarenhet',
    'Yrkeserfarenhet',
    'Erfarenhet',
    'Klinisk erfarenhet',
    'Pedagogisk erfarenhet',
    'Praktik och arbetslivserfarenhet',
    'Uppdrag',
    'Anställningar',
  ],
  utbildning: ['Utbildning', 'Utbildning och examina', 'Utbildning och kurser', 'Akademisk bakgrund', 'Studier'],
  kompetenser: [
    'Kompetenser',
    'Kärnkompetenser',
    'Kompetensområden',
    'Tekniska kompetenser',
    'System och verktyg',
    'Yrkeskunskaper',
    'Färdigheter',
    'Kunskaper och verktyg',
  ],
  intyg: [
    'Certifieringar',
    'Kurser och intyg',
    'Legitimation och behörigheter',
    'Behörigheter och körkort',
    'Certifikat och behörigheter',
    'Legitimation och specialistbevis',
    'Utbildningar och certifikat',
    'Diplom och intyg',
  ],
  sprak: ['Språk', 'Språkkunskaper', 'Språk och nivå', 'Språkkompetens'],
  projekt: ['Projekt', 'Utvalda projekt', 'Projekt och uppdrag', 'Projekt och praktik', 'Egna projekt', 'Projekt och publikationer'],
  intressen: ['Intressen', 'Fritidsintressen', 'Engagemang och intressen', 'Ideellt engagemang', 'Övrigt', 'Intressen och fritid'],
  referenser: ['Referenser'],
}

/** Bibliotekets förval per avsnitt. */
export const STANDARD: Readonly<Record<Sektion, string>> = Object.fromEntries(
  SEKTIONER.map((s) => [s, BIBLIOTEK[s][0]])
) as Record<Sektion, string>

export const UPPSATTNING_IDS = [
  'allman',
  'vard',
  'it',
  'butik',
  'bygg',
  'lager',
  'ekonomi',
  'offentlig',
  'skola',
  'restaurang',
  'student',
  'chef',
] as const
export type UppsattningId = (typeof UPPSATTNING_IDS)[number]

/** Namnet i gränssnittet ("Rubriker: Vård och omsorg, ändra"). */
export const UPPSATTNING_NAMN: Readonly<Record<UppsattningId, string>> = {
  allman: 'Allmän',
  vard: 'Vård och omsorg',
  it: 'IT och utveckling',
  butik: 'Butik och försäljning',
  bygg: 'Bygg och hantverk',
  lager: 'Lager och logistik',
  ekonomi: 'Ekonomi',
  offentlig: 'Offentlig förvaltning',
  skola: 'Skola och förskola',
  restaurang: 'Restaurang och hotell',
  student: 'Student',
  chef: 'Chef och ledning',
}

/**
 * Tolv uppsättningar. En uppsättning är bara en mappning avsnitt till rubrik
 * ur biblioteket; avsnitt som inte nämns får bibliotekets förval.
 */
export const UPPSATTNINGAR: Readonly<Record<UppsattningId, Readonly<Partial<Record<Sektion, string>>>>> = {
  allman: {},
  vard: {
    profil: 'Yrkesprofil',
    erfarenhet: 'Klinisk erfarenhet',
    kompetenser: 'Kompetensområden',
    intyg: 'Legitimation och behörigheter',
  },
  it: {
    kompetenser: 'Tekniska kompetenser',
    projekt: 'Utvalda projekt',
  },
  butik: {
    profil: 'Om mig',
    kompetenser: 'Färdigheter',
    intyg: 'Kurser och intyg',
  },
  bygg: {
    profil: 'Yrkesprofil',
    erfarenhet: 'Yrkeserfarenhet',
    kompetenser: 'Yrkeskunskaper',
    intyg: 'Certifikat och behörigheter',
    projekt: 'Projekt och uppdrag',
  },
  lager: {
    erfarenhet: 'Yrkeserfarenhet',
    kompetenser: 'System och verktyg',
    intyg: 'Behörigheter och körkort',
  },
  ekonomi: {
    kompetenser: 'Kunskaper och verktyg',
    intyg: 'Utbildningar och certifikat',
  },
  offentlig: {
    utbildning: 'Utbildning och examina',
    kompetenser: 'Kompetensområden',
    intyg: 'Utbildningar och certifikat',
  },
  skola: {
    erfarenhet: 'Pedagogisk erfarenhet',
    utbildning: 'Utbildning och examina',
    kompetenser: 'Kompetensområden',
    intyg: 'Legitimation och behörigheter',
  },
  restaurang: {
    profil: 'Om mig',
    kompetenser: 'Yrkeskunskaper',
    intyg: 'Kurser och intyg',
  },
  student: {
    profil: 'Om mig',
    erfarenhet: 'Praktik och arbetslivserfarenhet',
    kompetenser: 'Färdigheter',
    projekt: 'Egna projekt',
    intressen: 'Engagemang och intressen',
  },
  chef: {
    profil: 'Sammanfattning',
    kompetenser: 'Kärnkompetenser',
    intyg: 'Utbildningar och certifikat',
  },
}

export function arUppsattning(id: unknown): id is UppsattningId {
  return typeof id === 'string' && (UPPSATTNING_IDS as readonly string[]).includes(id)
}

export function arSektion(id: unknown): id is Sektion {
  return typeof id === 'string' && (SEKTIONER as readonly string[]).includes(id)
}

/* ------------------------------------------------------------ ordlistan */

/**
 * Ord som pekar på ett yrkesområde. Matchas som delsträng i gemener, så att
 * svenska sammansättningar träffar ("butikssäljare", "systemutvecklare").
 * Ord som börjar med ^ måste stå först i ett ord, och med $ på slutet måste
 * de vara hela ordet ("^it$" träffar "IT-tekniker" och "inom IT" men inte
 * "kvalitet" eller "itererar").
 */
const ORDLISTA: Readonly<Record<Exclude<UppsattningId, 'allman'>, readonly string[]>> = {
  chef: [
    'chef', '^vd$', 'direktör', 'teamledare', 'gruppledare', 'arbetsledare', 'head of', '^ceo$', '^cfo$', '^cto$',
    '^coo$', 'ledningsgrupp', 'personalansvar',
  ],
  vard: [
    'undersköterska', 'sjuksköterska', 'vårdbiträde', 'barnmorska', 'läkare', 'fysioterapeut', 'sjukgymnast',
    'arbetsterapeut', 'tandsköterska', 'tandläkare', 'tandhygienist', 'personlig assistent', 'skötare', 'apotekare',
    'receptarie', 'farmaceut', 'psykolog', 'kurator', 'biomedicinsk', 'ambulans', 'hemtjänst', 'äldreomsorg',
    'omvårdnad', 'omsorg', 'sjukvård', 'patient', 'boendestödjare', 'stödassistent', 'dietist', 'logoped',
    'läkemedel',
  ],
  it: [
    'utvecklare', 'developer', 'programmerare', 'mjukvar', 'frontend', 'backend', 'fullstack', 'devops', '^it$',
    'systemadministratör', 'nätverkstekniker', 'it-arkitekt', 'lösningsarkitekt', 'systemarkitekt', 'testare',
    'testautomat', '^qa$', '^ux$', 'datavetenskap', 'datateknik', 'data engineer', 'data scientist',
    'dataanalytiker', 'javascript', 'typescript', 'python', '^react', '^java', '^c#', '^sql', '^aws$', 'azure',
    'kubernetes', 'docker', 'scrum master', 'systemutveckling', 'drifttekniker', 'helpdesk', 'cybersäkerhet',
    'informationssäkerhet',
  ],
  butik: [
    'butik', 'säljare', 'försäljning', '^kassa', 'kassör', 'kundtjänst', 'kundservice', 'kundmottagare', 'e-handel',
    'visual merchandis', 'detaljhandel', 'säljrådgivare', 'innesäljare', 'key account', 'account manager',
  ],
  bygg: [
    'snickare', 'elektriker', 'rörmokare', '^vvs', 'målare', 'murare', 'plattsättare', 'byggnadsarbetare', '^bygg',
    'anläggning', 'betong', 'takläggare', 'ställningsbyggare', 'svetsare', 'montör', 'installatör', 'mekaniker',
    'fordonstekniker', 'maskinförare', 'hantverk', 'golvläggare', 'plåtslagare', '^cnc', 'industriarbetare',
    'fastighetsskötare', 'servicetekniker', 'lärling', 'gesällbrev', 'yrkesbevis',
  ],
  lager: [
    'lagerarbetare', '^lager', 'truck', 'terminalarbetare', 'logistik', 'chaufför', 'yrkesförare', 'budbil',
    'orderplock', 'plockare', '^transport', 'speditör', 'distribution', '^wms$', 'godsmottag',
  ],
  ekonomi: [
    'ekonom', 'redovisning', 'controller', 'revisor', 'revision', 'lönehandläggare', 'löneadministratör',
    'lönekonsult', 'bokföring', 'bokförare', 'finans', '^kredit', '^skatt', 'fortnox', 'visma', 'bokslut',
    'reskontra', 'business controller', 'treasury',
  ],
  offentlig: [
    'handläggare', 'utredare', 'socialsekreterare', 'myndighet', 'kommun', '^region', 'förvaltning', 'registrator',
    'nämndsekreterare', 'planarkitekt', 'statsvetenskap', 'offentlig', 'jurist', 'polis', 'tullverket',
    'försäkringskassan', 'arbetsförmedlingen', 'skatteverket', 'socionom',
  ],
  skola: [
    'lärare', 'förskollärare', 'barnskötare', 'fritidspedagog', 'fritidsledare', 'elevassistent', 'rektor', 'pedagog',
    'studie- och yrkesvägledare', 'lärarexamen', 'förskola', 'grundskola', 'gymnasieskola', 'undervisning',
    'lärarlegitimation', 'resurspedagog',
  ],
  restaurang: [
    'kock', 'servitör', 'servitris', 'bartender', 'restaurang', 'diskare', 'köksbiträde', 'hotell', 'receptionist',
    'hovmästare', 'barista', 'café', 'kafé', 'storkök', 'kallskänk', 'frukostvärd', 'konditor', 'bagare',
    'livsmedelshygien', 'catering',
  ],
  student: [
    '^student', 'studerande', '^elev$', 'nyexaminerad', 'praktikant', 'trainee', 'sommarjobb', 'extrajobb',
    'examensarbete',
  ],
}

/** Ordningen när två områden får lika många poäng: chef före fack, fack före student. */
const PRIORITET: readonly Exclude<UppsattningId, 'allman'>[] = [
  'chef', 'vard', 'skola', 'it', 'bygg', 'lager', 'restaurang', 'butik', 'ekonomi', 'offentlig', 'student',
]

/** Lägsta poäng för ett förval. Under det: allmän. */
const TROSKEL = 3

const FORE = '(^|[^\\p{L}\\p{N}])'
const EFTER = '($|[^\\p{L}\\p{N}])'

/** Ordlistan som färdiga mönster, byggda en gång. */
const MONSTER = Object.fromEntries(
  Object.entries(ORDLISTA).map(([id, ord]) => [
    id,
    ord.map((o) => {
      if (!o.startsWith('^')) return o
      const helt = o.endsWith('$')
      const rot = o.slice(1, helt ? -1 : undefined).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(FORE + rot + (helt ? EFTER : ''), 'u')
    }),
  ])
) as unknown as Record<Exclude<UppsattningId, 'allman'>, readonly (string | RegExp)[]>

/** Antalet ord ur områdets lista som finns i texten. */
function poangFor(text: string, id: Exclude<UppsattningId, 'allman'>): number {
  if (!text) return 0
  let traffar = 0
  for (const m of MONSTER[id]) if (typeof m === 'string' ? text.includes(m) : m.test(text)) traffar++
  return traffar
}

/** Det som räknas i förvalet, i gemener. */
interface Signaler {
  titel: string
  roll: string
  senasteTjanst: string
  utbildning: string
  kompetenser: string
  utanErfarenhet: boolean
}

/** Den del av ett CV som förvalet läser. Både CVMetadata och delar av den duger. */
export interface RubrikCV {
  personalInfo?: { title?: string | null } | null
  targetRole?: string | null
  experience?: ReadonlyArray<{ position?: string | null; endDate?: string | null } | null> | null
  education?: ReadonlyArray<{ degree?: string | null; institution?: string | null } | null> | null
  skills?: ReadonlyArray<{ category?: string | null; skills?: ReadonlyArray<string | null> | null } | string | null> | null
  sectionTitles?: Partial<Record<Sektion, string>> | null
}

const sma = (s: unknown) => (typeof s === 'string' ? s.toLowerCase() : '')

function signaler(cv: RubrikCV): Signaler {
  const erf = (cv.experience ?? []).filter(Boolean) as { position?: string | null }[]
  return {
    titel: sma(cv.personalInfo?.title),
    roll: sma(cv.targetRole),
    senasteTjanst: sma(erf[0]?.position),
    utbildning: (cv.education ?? [])
      .filter(Boolean)
      .map((e) => `${sma(e!.degree)} ${sma(e!.institution)}`)
      .join(' | '),
    kompetenser: (cv.skills ?? [])
      .map((g) => (typeof g === 'string' ? sma(g) : g ? [sma(g.category), ...(g.skills ?? []).map(sma)].join(' ') : ''))
      .join(' | '),
    utanErfarenhet: erf.length === 0,
  }
}

function basta(poang: Map<Exclude<UppsattningId, 'allman'>, number>): UppsattningId {
  let bast: UppsattningId = 'allman'
  let hogst = TROSKEL - 1
  for (const id of PRIORITET) {
    const p = poang.get(id) ?? 0
    if (p > hogst) {
      hogst = p
      bast = id
    }
  }
  return bast
}

/**
 * Uppsättningen för en yrkestitel, utan resten av CV:t. Liten och
 * klientsäker: artikelkomponenten byter rubriker medan besökaren skriver.
 * En träff i titeln räcker.
 */
export function uppsattningForTitel(titel: string | null | undefined): UppsattningId {
  const t = sma(titel).trim()
  if (!t) return 'allman'
  const poang = new Map<Exclude<UppsattningId, 'allman'>, number>()
  for (const id of PRIORITET) poang.set(id, poangFor(t, id) * TROSKEL)
  return basta(poang)
}

/**
 * Förvalet för ett CV: deterministisk ordlista mot titel, önskad roll,
 * senaste tjänst, utbildning och kompetensord. Titel och roll väger tyngst
 * (tre poäng per träff), tjänst och utbildning två, kompetenser en. Under tre
 * poäng är signalen svag, och då blir det allmän.
 */
export function forvalFor(cv: RubrikCV | null | undefined): UppsattningId {
  if (!cv) return 'allman'
  const s = signaler(cv)
  const poang = new Map<Exclude<UppsattningId, 'allman'>, number>()
  for (const id of PRIORITET) {
    let p =
      poangFor(s.titel, id) * 3 +
      poangFor(s.roll, id) * 3 +
      poangFor(s.senasteTjanst, id) * 2 +
      Math.min(poangFor(s.utbildning, id), 2) * 2 +
      Math.min(poangFor(s.kompetenser, id), 3)
    // Utan erfarenhet och med en utbildning är det sannolikt en student.
    if (id === 'student' && s.utanErfarenhet && s.utbildning.trim()) p += TROSKEL
    poang.set(id, p)
  }
  return basta(poang)
}

/**
 * En egen rubrik som text: inga taggar, inga styrtecken, ett mellanslag
 * mellan orden, högst RUBRIK_MAX tecken. Tom sträng betyder "ingen rubrik vald".
 */
export function rensaRubrik(text: unknown): string {
  if (typeof text !== 'string') return ''
  return text
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, RUBRIK_MAX)
    .trim()
}

/**
 * Valda rubriker som går att lita på: bara kända avsnitt och icke-tomma
 * rubriker, rensade. Används både när rubriker sparas och när de läses.
 */
export function rensaRubriker(indata: unknown): Partial<Record<Sektion, string>> {
  const ut: Partial<Record<Sektion, string>> = {}
  if (!indata || typeof indata !== 'object' || Array.isArray(indata)) return ut
  for (const [k, v] of Object.entries(indata as Record<string, unknown>)) {
    if (!arSektion(k)) continue
    const r = rensaRubrik(v)
    if (r) ut[k] = r
  }
  return ut
}

/** Uppsättningen som gäller för CV:t och valen. */
export function uppsattningFor(cv: RubrikCV | null | undefined, val?: Pick<MallVal, 'uppsattning'> | null): UppsattningId {
  return arUppsattning(val?.uppsattning) ? val!.uppsattning as UppsattningId : forvalFor(cv)
}

/** Rubriken för ett avsnitt (se ordningen överst i filen). */
export function rubrik(
  sektion: Sektion,
  cv: RubrikCV | null | undefined,
  val?: Pick<MallVal, 'rubriker' | 'uppsattning'> | null
): string {
  const vald = rensaRubrik(val?.rubriker?.[sektion])
  if (vald) return vald
  const sparad = rensaRubrik(cv?.sectionTitles?.[sektion])
  if (sparad) return sparad
  return UPPSATTNINGAR[uppsattningFor(cv, val)][sektion] ?? STANDARD[sektion]
}

/** Alla rubriker på en gång, för renderarna. */
export function rubriker(
  cv: RubrikCV | null | undefined,
  val?: Pick<MallVal, 'rubriker' | 'uppsattning'> | null
): Record<Sektion, string> {
  return Object.fromEntries(SEKTIONER.map((s) => [s, rubrik(s, cv, val)])) as Record<Sektion, string>
}
