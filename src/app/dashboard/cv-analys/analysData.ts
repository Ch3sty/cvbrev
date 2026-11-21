/**
 * Analys-sidans data (CV-rummet steg 4, byggspecen avsnitt 8, skissen Analys).
 *
 * Byggs på servern ur analysraden och CV-raden. Alla tal kommer ur
 * poängmodellen (src/lib/cv/poang): poängen i dag, "med våra förslag",
 * varje fynds verkliga plus och uppdelningen per kategori. Gratisnivån får
 * åtgärdstexten bara för det som servern redan släpper (profilförslaget och
 * det tyngsta fyndet, gateAnalysisResult); övriga fynd går ut som rubrik och
 * plus, utan text. Klientsäker data, ingen funktion i resultatet.
 */
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import {
  analysForKlient,
  byggForbattratCv,
  kanonisktCv,
  kompetenserIcv,
  poangMedVal,
  poangsattAnalys,
  raknaPoang,
  harPlatshallare,
  type CvRad,
  type PoangKategori,
  type PoangSammanfattning,
  type Val,
} from '@/lib/cv/poang'

export type FyndTyp = 'profil' | 'roll' | 'kompetenser'

export interface AnalysFynd {
  /** profil, roll-<index i resultatets rollista> eller kompetenser. Väljer förslaget i flödet (?valj=). */
  nyckel: string
  typ: FyndTyp
  titel: string
  /** "Rollbeskrivning. Hög påverkan." */
  meta: string
  /** Verkligt plus ur poängmodellen. */
  plus: number
  /** Avsnittet på arket. */
  sektion: 'profil' | 'erfarenhet' | 'kompetenser'
  /** Rollens titel och arbetsgivare, för markeringen på arket. */
  roll?: { titel: string; foretag: string }
  /** Åtgärden syns (Premium, eller det gratisnivån får). */
  oppen: boolean
  /** Bara när oppen: texterna. */
  nuvarande?: string
  forslag?: string
  /** Vad förslaget förbättrar enligt poängmodellen. */
  andrat?: string[]
  /** Förslaget har [antal] där hon fyller i en egen siffra. */
  fyllI?: boolean
}

export interface AnalysVyData {
  jobbId: string
  klar: string | null
  poang: PoangSammanfattning
  fynd: AnalysFynd[]
  harFull: boolean
}

type Obj = Record<string, unknown>
const arObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)
const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

function paverkan(plus: number): string {
  return plus >= 6 ? 'Hög påverkan.' : plus >= 3 ? 'Medel.' : 'Låg påverkan.'
}

/** Hur en förbättrad kontroll läses i "Vad vi har ändrat". */
const ANDRING: Record<string, string> = {
  'profil.finns': 'det finns en personbeskrivning',
  'profil.langd': 'personbeskrivningen har lagom längd',
  'profil.roll': 'rollen står i personbeskrivningen',
  'profil.konkret': 'något konkret står med',
  'erfarenhet.beskrivning': 'rollen beskriver vad du gjorde',
  'erfarenhet.antal': 'lagom många punkter',
  'erfarenhet.tal': 'ett resultat med siffra',
  'erfarenhet.verb': 'punkterna börjar med vad du gjorde',
  'kompetenser.finns': 'ett avsnitt med kompetenser',
  'kompetenser.antal': 'lagom många kompetenser',
  'kompetenser.korta': 'korta, sökbara termer',
  'format.langd': 'lagom långt CV',
  'format.punkter': 'inga överlånga punkter',
}

/** Kontrollerna i poängmodellen som förslaget förbättrar, i klartext. */
function andringar(fore: CVMetadata, efter: CVMetadata | null): string[] {
  if (!efter) return []
  const a = raknaPoang(fore)
  const b = raknaPoang(efter)
  const ut: string[] = []
  for (const kat of b.kategorier) {
    const forra = a.kategorier.find((k) => k.id === kat.id)
    for (const k of kat.kontroller) {
      const f = forra?.kontroller.find((x) => x.id === k.id)
      if (f && k.poang > f.poang) ut.push(ANDRING[`${kat.id}.${k.id}`] ?? k.text.charAt(0).toLowerCase() + k.text.slice(1))
    }
  }
  return ut
}

/**
 * Bygger sidans data. `null` när analysen inte går att poängsätta (CV:t
 * saknar struktur och analysen har ingen egen): sidan visar då läget utan
 * struktur.
 */
export function byggAnalysVy(
  jobb: { id: string; completed_at: string | null; result: Obj },
  cvRad: CvRad | null,
  harFull: boolean
): AnalysVyData | null {
  const full = poangsattAnalys(jobb.result, cvRad)
  const poang = full.poang as PoangSammanfattning | null
  const bas = kanonisktCv(full.structuredCV)
  if (!poang || !bas) return null
  const synligt = harFull ? full : analysForKlient(jobb.result, cvRad, false)

  const fynd: AnalysFynd[] = []
  const bygg = (val: Val) => byggForbattratCv(full, val)

  // Sammanfattningen: profilförslaget är gratis för alla.
  const profil = arObj(full.profileSummary) ? full.profileSummary : null
  const profilPlus = typeof profil?.plus === 'number' ? profil.plus : 0
  if (profil && profilPlus > 0) {
    const val: Val = { profil: true, roller: [], kompetenser: [] }
    fynd.push({
      nyckel: 'profil',
      typ: 'profil',
      titel: 'Sammanfattningen',
      meta: `Personbeskrivning. ${paverkan(profilPlus)}`,
      plus: profilPlus,
      sektion: 'profil',
      oppen: true,
      nuvarande: text(bas.summary),
      forslag: text(profil.improvedText),
      andrat: andringar(bas, bygg(val)),
      fyllI: harPlatshallare(profil.improvedText),
    })
  }

  // Rollerna, i resultatets ordning (index = ?valj=roll-<i>).
  const roller = Array.isArray(full.roleBasedImprovements) ? (full.roleBasedImprovements as Obj[]) : []
  const synligaRoller = new Set(
    (Array.isArray(synligt.roleBasedImprovements) ? (synligt.roleBasedImprovements as Obj[]) : []).map((r) => r.rollIndex)
  )
  roller.forEach((r, i) => {
    const plus = typeof r.plus === 'number' ? r.plus : 0
    if (plus <= 0) return
    const titel = text(r.roleTitle)
    const foretag = text(r.company)
    const oppen = harFull || synligaRoller.has(r.rollIndex)
    const val: Val = { profil: false, roller: [i], kompetenser: [] }
    fynd.push({
      nyckel: `roll-${i}`,
      typ: 'roll',
      titel: foretag ? `${titel}, ${foretag}` : titel || 'En roll i ditt CV',
      meta: `Rollbeskrivning. ${paverkan(plus)}`,
      plus,
      sektion: 'erfarenhet',
      roll: { titel, foretag },
      oppen,
      ...(oppen
        ? {
            nuvarande: text(r.currentText),
            forslag: text(r.suggestedText),
            andrat: andringar(bas, bygg(val)),
            fyllI: harPlatshallare(r.suggestedText),
          }
        : {}),
    })
  })

  // Kompetenserna: de förvalda tillsammans (plus kan inte summeras).
  const komp = Array.isArray(full.skillSuggestions) ? (full.skillSuggestions as Obj[]) : []
  const forvalda = komp.flatMap((k, i) => (k.forvald === true ? [i] : []))
  if (forvalda.length > 0) {
    const val: Val = { profil: false, roller: [], kompetenser: forvalda }
    const med = poangMedVal(full, val)
    const plus = med ? med.total - poang.idag : 0
    if (plus > 0) {
      const synligaKomp = Array.isArray(synligt.skillSuggestions) ? (synligt.skillSuggestions as Obj[]) : []
      const oppen = harFull || synligaKomp.length > 0
      const visade = harFull ? forvalda.map((i) => text(komp[i].skill)) : synligaKomp.map((k) => text(k.skill))
      fynd.push({
        nyckel: 'kompetenser',
        typ: 'kompetenser',
        titel: 'Kompetenser mot kravprofilen',
        meta: `Kompetenser. ${paverkan(plus)}`,
        plus,
        sektion: 'kompetenser',
        oppen,
        ...(oppen
          ? {
              nuvarande: kompetenserIcv(bas.skills).join(', '),
              forslag: visade.filter(Boolean).join(', '),
              andrat: andringar(bas, bygg(val)),
              fyllI: false,
            }
          : {}),
      })
    }
  }

  // Störst effekt först; lika plus behåller ordningen ovan. Gratis: det första
  // öppna fyndet (det hon får med åtgärd) står först, som på Ditt CV.
  fynd.sort((a, b) => b.plus - a.plus)
  if (!harFull) {
    const i = fynd.findIndex((f) => f.oppen)
    if (i > 0) fynd.unshift(...fynd.splice(i, 1))
  }

  return { jobbId: jobb.id, klar: jobb.completed_at, poang, fynd, harFull }
}

/** Kategorierna med plus, i modellens ordning, för "Så räknas poängen". */
export function kategorierMedPlus(p: PoangSammanfattning): PoangKategori[] {
  return p.kategorier.filter((k) => k.plus > 0)
}
