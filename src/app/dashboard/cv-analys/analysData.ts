/**
 * Analys-sidans data (CV-rummet steg 4, byggspecen avsnitt 8, skissen Analys).
 *
 * Byggs på servern ur analysraden och CV-raden. Alla tal kommer ur
 * poängmodellen (src/lib/cv/poang): poängen i dag, "med våra förslag",
 * varje fynds verkliga plus och uppdelningen per kategori. Gratisnivån får
 * åtgärdstexten bara för det som servern redan släpper (det tyngsta fyndet,
 * gateAnalysisResult, också när det är profilförslaget); övriga fynd går ut som rubrik och
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
  platshallareKvar,
  plusForSiffror,
  medSiffror,
  genomgang,
  type ArkKontakt,
  type CvRad,
  type GenomgangDel,
  type KategoriId,
  type SiffrorAvsnitt,
  type PoangKategori,
  type PoangSammanfattning,
  type Val,
} from '@/lib/cv/poang'

export type FyndTyp = 'profil' | 'roll' | 'kompetenser' | 'siffror'

export interface AnalysFynd {
  /** Delen i genomgången förslaget hör till (profil, erfarenhet, kompetenser; siffrorna där de står). */
  del: KategoriId
  /**
   * profil, roll-<index i resultatets rollista>, kompetenser eller siffror.
   * Väljer förslaget i flödet (?valj=); siffror går till arbetsläget.
   */
  nyckel: string
  typ: FyndTyp
  titel: string
  /** "Rollbeskrivning. Hög påverkan." */
  meta: string
  /** Verkligt plus ur poängmodellen. Siffrorna: noll när talen inte ändrar poängen. */
  plus: number
  /** Avsnittet på arket (och i arbetsläget för siffrorna). */
  sektion: SiffrorAvsnitt
  /** Siffrorna: rader med [antal] kvar. */
  rader?: number
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
  /** Genomgången: de sju delarna med kontroller och brister (poängmodellen version 2). Öppen för alla. */
  delar: GenomgangDel[]
  /** Delar där de öppna förslagen täcker allt som saknas: ingen egen Öppna i CV:t-knapp. */
  delarTackta: KategoriId[]
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

  // Sammanfattningen: öppen för gratis bara när servern släpper den (det
  // tyngsta fyndet), som rollerna och kompetenserna.
  const profil = arObj(full.profileSummary) ? full.profileSummary : null
  const profilPlus = typeof profil?.plus === 'number' ? profil.plus : 0
  if (profil && profilPlus > 0) {
    const val: Val = { profil: true, roller: [], kompetenser: [] }
    const oppen = harFull || arObj(synligt.profileSummary)
    fynd.push({
      nyckel: 'profil',
      typ: 'profil',
      del: 'profil',
      titel: 'Sammanfattningen',
      meta: `Personbeskrivning. ${paverkan(profilPlus)}`,
      plus: profilPlus,
      sektion: 'profil',
      oppen,
      ...(oppen
        ? {
            nuvarande: text(bas.summary),
            forslag: text(profil.improvedText),
            andrat: andringar(bas, bygg(val)),
            fyllI: harPlatshallare(profil.improvedText),
          }
        : {}),
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
      del: 'erfarenhet',
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
        del: 'kompetenser',
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

  // Siffrorna som står kvar ([antal] i CV:t): ett fynd bland de andra, sist
  // vid lika plus. Plus är poäng(CV med talen ifyllda) minus poäng i dag.
  // Öppet också för gratisnivån: det är hennes egen uppgift, ingen åtgärd från oss.
  const kvar = platshallareKvar(bas)
  if (kvar.length > 0) {
    const plus = plusForSiffror(bas)
    const forsta = kvar[0]
    const e = forsta.avsnitt === 'erfarenhet' && forsta.index !== undefined ? bas.experience[forsta.index] : null
    fynd.push({
      nyckel: 'siffror',
      typ: 'siffror',
      del: forsta.avsnitt === 'fler' ? 'erfarenhet' : forsta.avsnitt,
      titel: 'Dina siffror',
      meta: plus > 0 ? `Dina egna tal. ${paverkan(plus)}` : 'Dina egna tal.',
      plus,
      sektion: forsta.avsnitt,
      ...(e ? { roll: { titel: text(e.position), foretag: text(e.company) } } : {}),
      rader: kvar.length,
      oppen: true,
    })
  }

  // Störst effekt först; lika plus behåller ordningen ovan. Gratis: det första
  // öppna förslaget (det hon får med åtgärd) står först, som på Ditt CV.
  fynd.sort((a, b) => b.plus - a.plus)
  if (!harFull) {
    const i = fynd.findIndex((f) => f.oppen && f.typ !== 'siffror')
    if (i > 0) fynd.unshift(...fynd.splice(i, 1))
  }

  // Genomgången räknas på samma CV och samma kontaktuppgifter som poängen.
  const ark = (full.arkKontakt as ArkKontakt | null | undefined) ?? null
  const delar = genomgang(bas, ark)

  // Delar där de öppna förslagen täcker allt som saknas (med hennes siffror
  // ifyllda där förslaget har [antal]): där är "Öppna i CV:t" en dubblett av
  // förslagets "Ändra texten". Låsta förslag räknas inte: de rättar inget åt henne.
  const delarTackta: KategoriId[] = []
  for (const d of delar) {
    if (d.poang >= d.max) continue
    const oppna = fynd.filter((f) => f.del === d.id && f.oppen && f.typ !== 'siffror')
    if (oppna.length === 0 || fynd.some((f) => f.del === d.id && !f.oppen)) continue
    const val: Val = {
      profil: oppna.some((f) => f.typ === 'profil'),
      roller: oppna.filter((f) => f.typ === 'roll').map((f) => Number(f.nyckel.slice(5))),
      kompetenser: oppna.some((f) => f.typ === 'kompetenser') ? forvalda : [],
    }
    const efter = bygg(val)
    const delEfter = efter ? genomgang(medSiffror(efter), ark).find((x) => x.id === d.id) : null
    if (delEfter && delEfter.poang >= delEfter.max) delarTackta.push(d.id)
  }

  return { jobbId: jobb.id, klar: jobb.completed_at, poang, fynd, delar, delarTackta, harFull }
}

/** Kategorierna med plus, i modellens ordning, för "Så räknas poängen". */
export function kategorierMedPlus(p: PoangSammanfattning): PoangKategori[] {
  return p.kategorier.filter((k) => k.plus > 0)
}
