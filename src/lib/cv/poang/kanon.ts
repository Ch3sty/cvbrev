/**
 * Det kanoniska CV:t som poängen räknas på.
 *
 * structured_data har tre format (src/lib/cv/normalize-structured-data.ts och
 * src/lib/cv/sprak.ts): CVMetadata (personalInfo/experience), byggarens
 * bygge (CVMetadata med bygge) och inläsningens roles-format (ParsedCV).
 * Här blir alla tre CVMetadata, så att poängmodellen och förslagen alltid
 * arbetar på samma form.
 *
 * Regler:
 *  - CVMetadata kopieras rakt av. CV-texten används inte: allt som räknas
 *    står i strukturen. Därför ger ett sparat förbättrat CV exakt den poäng
 *    analysen lovade.
 *  - roles-formatet saknar kontaktuppgifter, så de läses lokalt ur CV-texten
 *    (samma regex som maskeringen, src/lib/privacy/extractContact.ts). Saknas
 *    språknyckeln letar vi efter ett språkavsnitt i texten.
 *  - Ingenting här beror på datum, slump eller AI. Funktionen är idempotent:
 *    kanonisktCv(kanonisktCv(x)) ger samma CV.
 *
 * Klientsäker.
 */
import type { CVExperience, CVEducation, CVLanguage, CVMetadata } from '../cv-metadata'
import { extractContactLocally } from '@/lib/privacy/extractContact'
import { tolkaNiva } from '../sprak'
import { delaPeriod, falt } from './matt'

type Obj = Record<string, unknown>

const arObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)

function klona<T>(v: T): T {
  return v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T)
}

/** Är det CVMetadata (inläsningens analysformat, byggaren, Word-importen)? */
function arCvMetadata(o: Obj): boolean {
  return arObj(o.personalInfo) || (Array.isArray(o.experience) && !Array.isArray(o.roles))
}

/** Är det inläsningens roles-format (ParsedCV)? */
function arRollformat(o: Obj): boolean {
  return Array.isArray(o.roles)
}

const SPRAKNAMN = [
  'svenska', 'engelska', 'tyska', 'franska', 'spanska', 'italienska', 'portugisiska', 'finska', 'norska',
  'danska', 'isländska', 'nederländska', 'polska', 'ryska', 'ukrainska', 'arabiska', 'persiska', 'farsi',
  'dari', 'kurdiska', 'turkiska', 'somaliska', 'tigrinja', 'amhariska', 'bosniska', 'kroatiska', 'serbiska',
  'albanska', 'grekiska', 'rumänska', 'ungerska', 'tjeckiska', 'kinesiska', 'mandarin', 'japanska',
  'koreanska', 'hindi', 'urdu', 'thai', 'vietnamesiska', 'tagalog', 'estniska', 'lettiska', 'litauiska',
  'teckenspråk', 'svenskt teckenspråk', 'english', 'swedish', 'german', 'french', 'spanish',
]

/**
 * Språken ur ett språkavsnitt i CV-texten, när strukturen aldrig letat efter
 * dem. Bara rader under en rubrik som "Språk" eller "Språkkunskaper" läses,
 * och bara kända språknamn räknas, så att "svenska kunder" i en rollbeskrivning
 * aldrig blir ett språk. Ingen rubrik: null (vi vet inte).
 */
export function sprakUrText(cvText: string | null | undefined): CVLanguage[] | null {
  if (!cvText) return null
  const rader = cvText.split(/\r?\n/)
  const RUBRIK = /^\s*(språk|språkkunskaper|languages)(?!\p{L})\s*:?\s*/iu
  const rubrik = rader.findIndex((r) => RUBRIK.test(r))
  if (rubrik < 0) return null
  const resten = rader[rubrik].replace(RUBRIK, '')
  const kandidater = [resten, ...rader.slice(rubrik + 1, rubrik + 8)]
  const ut: CVLanguage[] = []
  const sedda = new Set<string>()
  for (const rad of kandidater) {
    const t = rad.trim()
    if (!t && ut.length > 0) break
    // Nästa rubrik i versaler avslutar avsnittet.
    if (t && t.length > 3 && t === t.toUpperCase() && /\p{L}/u.test(t) && ut.length > 0) break
    for (const del of t.split(/[,;•|]/)) {
      const lag = del.toLowerCase()
      const namn = SPRAKNAMN.find((s) => new RegExp(`(^|[^\\p{L}])${s}([^\\p{L}]|$)`, 'u').test(lag))
      if (!namn || sedda.has(namn)) continue
      sedda.add(namn)
      ut.push({ language: namn.charAt(0).toUpperCase() + namn.slice(1), proficiency: tolkaNiva(del) })
    }
  }
  return ut
}

function rollTillErfarenhet(r: Obj): CVExperience {
  const { start, slut } = delaPeriod(r.period)
  const beskrivning = typeof r.description === 'string' ? r.description : ''
  let rader = beskrivning
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (rader.length === 0 && Array.isArray(r.responsibilities)) {
    rader = r.responsibilities.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).map((s) => s.trim())
  }
  const ut: CVExperience = {
    position: falt(r.title),
    company: falt(r.company),
    startDate: start,
    description: rader,
  }
  if (slut && !/^(pågående|pagaende|nuvarande|present)$/i.test(slut)) ut.endDate = slut
  return ut
}

function utbildningUrRoll(e: Obj): CVEducation {
  const { start, slut } = delaPeriod(e.period)
  const ut: CVEducation = {
    degree: falt(e.degree),
    institution: falt(e.institution),
  }
  if (start) ut.startDate = start
  if (slut) ut.endDate = slut
  if (typeof e.description === 'string' && e.description.trim()) ut.description = e.description.trim()
  return ut
}

/**
 * Det kanoniska CV:t, eller null när strukturen saknas eller inte går att
 * läsa. Anroparen avgör då om CV:t ska struktureras (en gång, och sparas).
 */
export function kanonisktCv(structuredData: unknown, cvText?: string | null): CVMetadata | null {
  if (!arObj(structuredData)) return null
  const o = structuredData

  if (arCvMetadata(o)) {
    const k = klona(o) as unknown as CVMetadata & Obj
    const pi = arObj(k.personalInfo) ? (k.personalInfo as unknown as Obj) : {}
    k.personalInfo = {
      ...(pi as object),
      fullName: typeof pi.fullName === 'string' ? pi.fullName : '',
      email: typeof pi.email === 'string' ? pi.email : '',
    } as CVMetadata['personalInfo']
    k.experience = Array.isArray(k.experience) ? k.experience : []
    k.education = Array.isArray(k.education) ? k.education : []
    k.skills = Array.isArray(k.skills) ? k.skills : []
    return k
  }

  if (arRollformat(o)) {
    const kontakt = extractContactLocally(cvText ?? '')
    const c = arObj(o.contact) ? o.contact : {}
    const ort = falt(c.address) || [kontakt.address, kontakt.postalCode, kontakt.city].filter(Boolean).join(', ')
    const cv: CVMetadata = {
      personalInfo: {
        fullName: falt(o.name) || kontakt.fullName || '',
        email: falt(c.email) || kontakt.email || '',
        ...(falt(c.phone) || kontakt.phone ? { phone: falt(c.phone) || kontakt.phone } : {}),
        ...(ort ? { address: ort } : {}),
        ...(kontakt.linkedIn ? { linkedIn: kontakt.linkedIn } : {}),
      },
      experience: (o.roles as unknown[]).filter(arObj).map(rollTillErfarenhet),
      education: (Array.isArray(o.education) ? o.education : []).filter(arObj).map(utbildningUrRoll),
      skills: Array.isArray(o.skills)
        ? [{ category: '', skills: o.skills.filter((s): s is string => typeof s === 'string') }]
        : [],
    }
    if (typeof o.profile === 'string' && o.profile.trim()) cv.summary = o.profile.trim()
    if (Array.isArray(o.languages)) {
      cv.languages = klona(o.languages) as CVLanguage[]
    } else {
      const urText = sprakUrText(cvText)
      if (urText) cv.languages = urText
    }
    return cv
  }

  return null
}
