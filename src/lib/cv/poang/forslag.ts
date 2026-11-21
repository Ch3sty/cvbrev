/**
 * Analysens förslag, införda mekaniskt och poängsatta med samma funktion som
 * CV:t (docs/poangmodell-cv-analys.md, avsnittet "Plus som stämmer").
 *
 *  - Ett förslags plus är poäng(CV med förslaget infört) minus poäng(CV i dag).
 *  - "Med våra förslag" är poäng(CV med alla förslag införda), inte summan
 *    av plusen: förslag kan överlappa.
 *  - "Potential med dina val" är poäng(CV med de valda införda), med de
 *    redigerade texterna om hon ändrat något.
 *  - byggForbattratCv är också det analysflödet sparar, så det sparade CV:t
 *    får exakt den poäng som utlovades.
 *
 * AI:n skriver texterna i förslagen, aldrig talen. Talen räknas här.
 * Klientsäker.
 */
import type { CVMetadata } from '../cv-metadata'
import { kanonisktCv } from './kanon'
import { utanPiiPlatshallare, rensaDjupt } from '@/lib/privacy/cvForModel'
import { ersattPahittadeTal, falt, harPlatshallare, kompetenserIcv, stadaKompetenser, talIText } from './matt'
import { KATEGORIER, POANG_VERSION, raknaPoang, type KategoriId, type Poang } from './modell'
import { medSiffror, platshallareKvar, plusForSiffror } from './siffror'
import { arkKontakt as lasArkKontakt, type ArkKontakt, type KontaktKalla } from './kontakt'

type Obj = Record<string, unknown>
const arObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)

/** Kategorin som nya kompetenser hamnar i, samma som analysflödet alltid använt. */
export const KOMPLETTERANDE = 'Kompletterande färdigheter'

/** Vilka förslag som är valda. Index pekar in i analysens listor. */
export interface Val {
  profil: boolean
  roller: readonly number[]
  kompetenser: readonly number[]
}

/** Texter hon redigerat i väljsteget. Det som sparas är det som räknas. */
export interface Redigeringar {
  profil?: string | null
  roller?: ReadonlyMap<number, string> | Readonly<Record<number, string>>
}

/** Det ur analysresultatet som behövs för att införa förslagen. */
export interface AnalysForPoang {
  structuredCV?: unknown
  /** Kontaktuppgifterna som arket visar dem (kontakt.ts), när de är kända. */
  arkKontakt?: ArkKontakt | null
  profileSummary?: { improvedText?: unknown } | null
  roleBasedImprovements?: ReadonlyArray<{ suggestedText?: unknown; rollIndex?: unknown } | null> | null
  skillSuggestions?: ReadonlyArray<{ skill?: unknown } | null> | null
}

export interface PoangKategori {
  id: KategoriId
  namn: string
  max: number
  /** Kategorins poäng i dag. */
  idag: number
  /** Kategorins poäng med de förvalda förslagen (forvaltVal). */
  medAlla: number
  /** medAlla minus idag. Kan vara noll. */
  plus: number
  /** Kategorins poäng med förslagen och hennes siffror (medAllt). */
  medAllt: number
  /** medAllt minus idag. */
  plusAllt: number
}

/** Det den nya Analys-sidan och rutan "Så räknas poängen" läser. */
export interface PoangSammanfattning {
  version: typeof POANG_VERSION
  /** Poäng i dag, 0 till 100. */
  idag: number
  /**
   * Poäng med våra förslag: de förvalda, alltså alla som inte sänker
   * poängen (forvaltVal). Aldrig lägre än idag.
   */
  medAlla: number
  /** medAlla minus idag. */
  plus: number
  /**
   * Plus för hennes siffror ([antal] som står kvar i CV:t ifyllda,
   * plusForSiffror). Noll när inget står kvar.
   */
  siffrorPlus: number
  /**
   * Poängen med de förvalda förslagen OCH siffrorna ifyllda: talet som Ditt
   * CV, Mallar och Analys visar som "med"-tal. Lika med medAlla när inga
   * siffror står kvar. Räknat på CV:t, aldrig som en summa av plus.
   * Analysflödet (väljsteget) använder medAlla: där lovas bara förslagen.
   */
  medAllt: number
  /** medAllt minus idag. */
  plusAllt: number
  kategorier: PoangKategori[]
}

const profilText = (s: string) => s.trim().replace(/\s+/g, ' ')
const rollRader = (s: string) =>
  s
    .split(/\n+/)
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter((l) => l.length > 0)

function redigerad(red: Redigeringar | undefined, i: number): string | undefined {
  const r = red?.roller
  if (!r) return undefined
  const v = r instanceof Map ? r.get(i) : (r as Readonly<Record<number, string>>)[i]
  return typeof v === 'string' && v.trim() ? v : undefined
}

/**
 * CV:t med de valda förslagen införda, i den form det sparas. Profilen byts
 * mot förslagets text, en rolls beskrivning mot förslagets rader och nya
 * kompetenser läggs i "Kompletterande färdigheter" om de inte redan finns.
 * Kompetenslistan städas som vid sparandet (poängen påverkas inte av det).
 */
export function byggForbattratCv(
  analys: AnalysForPoang,
  val: Val,
  red?: Redigeringar
): CVMetadata | null {
  const cv = kanonisktCv(analys.structuredCV)
  if (!cv) return null

  if (val.profil) {
    const text = (typeof red?.profil === 'string' && red.profil.trim() ? red.profil : null) ?? falt(analys.profileSummary?.improvedText)
    if (text) cv.summary = profilText(text)
  }

  const roller = analys.roleBasedImprovements ?? []
  for (const i of [...val.roller].sort((a, b) => a - b)) {
    const f = roller[i]
    const ri = f?.rollIndex
    if (typeof ri !== 'number' || !cv.experience[ri]) continue
    const text = redigerad(red, i) ?? (typeof f?.suggestedText === 'string' ? f.suggestedText : '')
    const rader = rollRader(text)
    if (rader.length === 0) continue
    cv.experience[ri] = { ...cv.experience[ri], description: rader }
  }

  const kompetenser = analys.skillSuggestions ?? []
  const nya: string[] = []
  for (const i of [...val.kompetenser].sort((a, b) => a - b)) {
    const namn = falt(kompetenser[i]?.skill)
    if (namn) nya.push(namn)
  }
  if (nya.length > 0) {
    const finns = new Set(kompetenserIcv(cv.skills).map((s) => s.toLowerCase()))
    const skills = Array.isArray(cv.skills) ? cv.skills : []
    let grupp = skills.find((g) => g && typeof g === 'object' && g.category === KOMPLETTERANDE)
    for (const namn of nya) {
      if (finns.has(namn.toLowerCase())) continue
      finns.add(namn.toLowerCase())
      if (!grupp) {
        grupp = { category: KOMPLETTERANDE, skills: [] }
        skills.push(grupp)
      }
      grupp.skills = [...(Array.isArray(grupp.skills) ? grupp.skills : []), namn]
    }
    cv.skills = skills
  }

  cv.skills = stadaKompetenser(cv.skills)
  return cv
}

/** Poängen med de valda förslagen. null utan strukturerat CV. */
export function poangMedVal(analys: AnalysForPoang, val: Val, red?: Redigeringar): Poang | null {
  const cv = byggForbattratCv(analys, val, red)
  return cv ? raknaPoang(cv, analys.arkKontakt) : null
}

/** Alla förslag i resultatet valda. */
export function allaVal(analys: AnalysForPoang): Val {
  return {
    profil: Boolean(falt(analys.profileSummary?.improvedText)),
    roller: (analys.roleBasedImprovements ?? []).flatMap((f, i) => (typeof f?.rollIndex === 'number' ? [i] : [])),
    kompetenser: (analys.skillSuggestions ?? []).flatMap((f, i) => (falt(f?.skill) ? [i] : [])),
  }
}

/**
 * De förvalda förslagen: de som inte sänker poängen, varken var för sig
 * eller tillsammans. Förslagen prövas i ordning efter eget plus (störst
 * först) och läggs till bara om poängen med dem inte blir lägre än utan.
 * Ett förslag som ensamt sänker poängen är aldrig förvalt. Poängen med de
 * förvalda är därför aldrig lägre än i dag och aldrig lägre än det bästa
 * enskilda förslaget, också när två förslag överlappar.
 */
export function forvaltVal(analys: AnalysForPoang): Val {
  const tomt: Val = { profil: false, roller: [], kompetenser: [] }
  const cv = kanonisktCv(analys.structuredCV)
  if (!cv) return tomt
  const total = (val: Val) => poangMedVal(analys, val)?.total ?? 0
  const idag = raknaPoang(cv, analys.arkKontakt).total
  const alla = allaVal(analys)
  type Kandidat = { typ: 0 | 1 | 2; i: number; plus: number }
  const med = (val: Val, k: Kandidat): Val =>
    k.typ === 0
      ? { ...val, profil: true }
      : k.typ === 1
        ? { ...val, roller: [...val.roller, k.i] }
        : { ...val, kompetenser: [...val.kompetenser, k.i] }
  const kandidater: Kandidat[] = [
    ...(alla.profil ? [{ typ: 0 as const, i: 0 }] : []),
    ...alla.roller.map((i) => ({ typ: 1 as const, i })),
    ...alla.kompetenser.map((i) => ({ typ: 2 as const, i })),
  ].map((k) => ({ ...k, plus: total(med(tomt, { ...k, plus: 0 })) - idag }))
  kandidater.sort((a, b) => b.plus - a.plus || a.typ - b.typ || a.i - b.i)

  let val = tomt
  let nu = idag
  for (const k of kandidater) {
    if (k.plus < 0) continue
    const prov = med(val, k)
    const t = total(prov)
    if (t >= nu) {
      val = prov
      nu = t
    }
  }
  return { ...val, roller: [...val.roller].sort((a, b) => a - b), kompetenser: [...val.kompetenser].sort((a, b) => a - b) }
}

/**
 * Poäng i dag, med våra förslag och per kategori, för analysens resultat.
 * "Med våra förslag" (medAlla) är poängen med de förvalda förslagen
 * (forvaltVal): alla som inte sänker poängen.
 */
export function poangSammanfattning(analys: AnalysForPoang, forval?: Val): PoangSammanfattning | null {
  const cv = kanonisktCv(analys.structuredCV)
  if (!cv) return null
  const idag = raknaPoang(cv, analys.arkKontakt)
  const val = forval ?? forvaltVal(analys)
  const alla = poangMedVal(analys, val) ?? idag
  // Siffrorna ifyllda i CV:t först, sedan förslagen ovanpå: det CV hon har
  // när båda är gjorda. Platshållare i förslagens egna texter fylls inte.
  const harSiffror = platshallareKvar(cv).length > 0
  const allt = harSiffror ? (poangMedVal({ ...analys, structuredCV: medSiffror(cv) }, val) ?? alla) : alla
  return {
    version: POANG_VERSION,
    idag: idag.total,
    medAlla: alla.total,
    plus: alla.total - idag.total,
    siffrorPlus: harSiffror ? plusForSiffror(cv) : 0,
    medAllt: allt.total,
    plusAllt: allt.total - idag.total,
    kategorier: KATEGORIER.map(({ id, namn, max }) => {
      const a = idag.kategorier.find((x) => x.id === id)?.poang ?? 0
      const b = alla.kategorier.find((x) => x.id === id)?.poang ?? 0
      const c = allt.kategorier.find((x) => x.id === id)?.poang ?? 0
      return { id, namn, max, idag: a, medAlla: b, plus: b - a, medAllt: c, plusAllt: c - a }
    }),
  }
}

/* --------------------------------------------------------- rollmatchning */

const norm = (v: unknown) =>
  falt(v)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

/**
 * Vilken roll i CV:t varje rollförslag gäller. Förslaget bär rollens titel
 * och arbetsgivare (och, från analysversionen med lagrad struktur, rollens
 * plats i CV:t). Vi matchar i den ordningen: plats som stämmer med titel,
 * titel och arbetsgivare, bara titel. Varje roll används högst en gång.
 * Ett förslag utan träff kan inte införas och tas bort ur resultatet.
 */
export function matchaRoller(
  cv: CVMetadata,
  forslag: ReadonlyArray<Obj>
): Array<number | null> {
  const E = cv.experience ?? []
  const tagna = new Set<number>()
  const titel = E.map((e) => norm(e?.position))
  const bolag = E.map((e) => norm(e?.company))
  return forslag.map((f) => {
    const t = norm(f.roleTitle)
    const b = norm(f.company)
    const hint = typeof f.rollIndex === 'number' ? f.rollIndex : typeof f.experienceIndex === 'number' ? f.experienceIndex : null
    const valj = (i: number) => {
      tagna.add(i)
      return i
    }
    if (hint !== null && E[hint] && !tagna.has(hint) && (!t || titel[hint] === t || (b && bolag[hint] === b))) {
      return valj(hint)
    }
    if (t) {
      const ok = E.findIndex((_, i) => !tagna.has(i) && titel[i] === t && (!b || !bolag[i] || bolag[i] === b))
      if (ok >= 0) return valj(ok)
    }
    if (t) {
      const ok = E.findIndex((_, i) => !tagna.has(i) && titel[i] === t)
      if (ok >= 0) return valj(ok)
    }
    if (b) {
      const ok = E.findIndex((_, i) => !tagna.has(i) && bolag[i] === b && !titel[i])
      if (ok >= 0) return valj(ok)
    }
    return null
  })
}

/* ------------------------------------------------------ analysens resultat */

/** CV-raden poängen räknas på. */
export interface CvRad {
  structured_data?: unknown
  cv_text?: string | null
  /**
   * Profilen som arket fyller kontaktuppgifterna ur (kontakt.ts). Med den
   * räknas kontaktuppgifterna som arket visar dem; utan läses CV:ts egna fält
   * (den publika snabbpoängen, där det inte finns något ark).
   */
  kontakt?: KontaktKalla | null
}

/** Arkets kontaktuppgifter för CV-raden (eller reservstrukturen), null utan profil. */
function arkFor(cvRad: CvRad | null | undefined, reservStruktur?: unknown): ArkKontakt | null {
  if (!cvRad?.kontakt) return null
  return lasArkKontakt(kanonisktCv(cvRad.structured_data, cvRad.cv_text) ? cvRad.structured_data : reservStruktur, cvRad.kontakt)
}

/** Behåller ordningen vid lika plus: stabil sortering på ursprungsindex. */
function sorteraEfterPlus<T extends { plus: number; ursprung: number }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => b.plus - a.plus || a.ursprung - b.ursprung)
}

/**
 * Analysens resultat med riktiga tal. Alla tal i resultatet räknas om här,
 * så att sparade analyser (med AI:ns påhittade tal) visas enligt modellen:
 *
 *  - structuredCV blir CV:t i dag i kanonisk form, ur CV-raden. Saknar raden
 *    struktur används analysens egen sparade struktur.
 *  - Varje förslag får plus (verkligt, kan vara negativt) och atsImpact
 *    (plus, men aldrig under noll) och rollförslag rollIndex. Förslag som
 *    inte går att införa tas bort.
 *  - Roll- och kompetensförslag sorteras efter verkligt plus. Sparade val
 *    (selectedImprovements) följer med i den nya ordningen.
 *  - Allmänna råd får plus 0: de införs inte, så de lovar inga poäng.
 *  - atsFriendliness.score blir poängen i dag, poang sammanfattningen och
 *    poangVersion modellens version.
 */
export function poangsattAnalys(result: Obj, cvRad?: CvRad | null): Obj {
  const bas =
    kanonisktCv(cvRad?.structured_data, cvRad?.cv_text) ?? kanonisktCv(result.structuredCV, cvRad?.cv_text ?? null)

  const ats = arObj(result.atsFriendliness) ? result.atsFriendliness : {}
  const allmant = Array.isArray(result.generalImprovements)
    ? result.generalImprovements.map((g) => (arObj(g) ? { ...rensaDjupt(g), atsImpact: 0, plus: 0 } : g))
    : result.generalImprovements

  if (!bas) {
    // Inget att räkna på: inga tal alls, hellre än påhittade.
    return {
      ...result,
      generalImprovements: allmant,
      roleBasedImprovements: Array.isArray(result.roleBasedImprovements)
        ? result.roleBasedImprovements.map((r) => (arObj(r) ? { ...r, atsImpact: 0, plus: 0 } : r))
        : result.roleBasedImprovements,
      skillSuggestions: Array.isArray(result.skillSuggestions)
        ? result.skillSuggestions.map((s) => (arObj(s) ? { ...s, atsImpact: 0, plus: 0 } : s))
        : result.skillSuggestions,
      profileSummary: arObj(result.profileSummary) ? { ...result.profileSummary, atsImpact: 0, plus: 0 } : result.profileSummary,
      atsFriendliness: { ...ats, score: null, feedback: '' },
      arkKontakt: null,
      poang: null,
      poangVersion: POANG_VERSION,
    }
  }

  // Kontaktuppgifterna som arket visar dem, när profilen är känd. Följer med
  // i resultatet (arkKontakt) så att väljsteget räknar likadant på klienten.
  const ark = arkFor(cvRad, result.structuredCV)
  const idag = raknaPoang(bas, ark).total
  const grund: AnalysForPoang = { structuredCV: bas, arkKontakt: ark }
  const plusFor = (analys: AnalysForPoang, val: Val) => (poangMedVal({ ...grund, ...analys }, val)?.total ?? idag) - idag

  // Förslag får aldrig hitta på fakta. Talen i CV:t (utom kontaktuppgifterna)
  // är de enda tal ett förslag får använda; andra byts mot [antal] och
  // förslaget märks fyllI så att gränssnittet ber om hennes egen siffra.
  const { personalInfo: _pi, ...innehall } = bas
  const kanda = new Set(talIText(JSON.stringify(innehall)))
  const granska = (text: string) => {
    // Maskeringens platshållare ([NAMN], [TELEFON] ...) visas aldrig för henne.
    const { text: ren, ersatta } = ersattPahittadeTal(utanPiiPlatshallare(text), kanda)
    return { text: ren, ersatta, fyllI: harPlatshallare(ren) }
  }

  // Profilen
  let profil: Obj | null | undefined = result.profileSummary as Obj | null | undefined
  // Redan införd profiltext: inget kvar att göra.
  if (arObj(profil) && falt(profil.improvedText) && profilText(String(profil.improvedText)) === profilText(bas.summary ?? '')) {
    profil = undefined
  }
  if (arObj(profil)) {
    const g = granska(typeof profil.improvedText === 'string' ? profil.improvedText : '')
    const text = falt(g.text)
    const plus = text ? plusFor({ profileSummary: { improvedText: text } }, { profil: true, roller: [], kompetenser: [] }) : 0
    profil = {
      ...profil,
      improvedText: g.text,
      currentText: bas.summary ?? '',
      atsImpact: Math.max(0, plus),
      plus,
      fyllI: g.fyllI,
      // Summan över omräkningarna: en andra granskning hittar inget nytt.
      ersattaTal: (typeof profil.ersattaTal === 'number' ? profil.ersattaTal : 0) + g.ersatta,
    }
  }

  // Rollerna
  const rollerIn = (Array.isArray(result.roleBasedImprovements) ? result.roleBasedImprovements : []).filter(arObj)
  const traffar = matchaRoller(bas, rollerIn)
  const roller = sorteraEfterPlus(
    rollerIn.flatMap((r, ursprung) => {
      const rollIndex = traffar[ursprung]
      const g = granska(typeof r.suggestedText === 'string' ? r.suggestedText : '')
      const text = g.text
      if (rollIndex === null || !text.trim()) return []
      const e = bas.experience[rollIndex]
      // Redan infört (CV:t sparat eller ersatt med förslaget): inget kvar att göra.
      const nu = (Array.isArray(e?.description) ? e.description : []).map((l) => String(l).trim().replace(/\s+/g, ' ')).filter(Boolean)
      if (nu.join('\n') === rollRader(text).join('\n')) return []
      const plus = plusFor(
        { roleBasedImprovements: [{ suggestedText: text, rollIndex }] },
        { profil: false, roller: [0], kompetenser: [] }
      )
      return [
        {
          ...r,
          suggestedText: text,
          fyllI: g.fyllI,
          ersattaTal: (typeof r.ersattaTal === 'number' ? r.ersattaTal : 0) + g.ersatta,
          rollIndex,
          roleTitle: falt(e?.position) || r.roleTitle,
          company: falt(e?.company) || r.company,
          currentText: Array.isArray(e?.description) ? e.description.join('\n') : '',
          atsImpact: Math.max(0, plus),
          plus,
          ursprung,
        },
      ]
    })
  )

  // Kompetenserna
  const kompIn = (Array.isArray(result.skillSuggestions) ? result.skillSuggestions : []).filter(arObj)
  const kompetenser = sorteraEfterPlus(
    kompIn.flatMap((s, ursprung) => {
      const namn = falt(typeof s.skill === 'string' ? utanPiiPlatshallare(s.skill) : s.skill)
      if (!namn) return []
      const plus = plusFor({ skillSuggestions: [{ skill: namn }] }, { profil: false, roller: [], kompetenser: [0] })
      return [{ ...rensaDjupt(s), skill: namn, atsImpact: Math.max(0, plus), plus, ursprung }]
    })
  )

  // Sparade val följer förslagen till deras nya plats.
  let valt = result.selectedImprovements
  if (arObj(valt)) {
    const flytta = (gamla: unknown, lista: Array<{ ursprung: number }>) =>
      Array.isArray(gamla)
        ? gamla.flatMap((g) => {
            const ny = lista.findIndex((x) => x.ursprung === g)
            return ny >= 0 ? [ny] : []
          })
        : gamla
    valt = { ...valt, roles: flytta(valt.roles, roller), skills: flytta(valt.skills, kompetenser) }
  }

  const utan = <T extends { ursprung: number }>(x: T) => {
    const { ursprung: _u, ...rest } = x
    return rest
  }

  const ut: Obj = {
    ...result,
    structuredCV: bas,
    arkKontakt: ark,
    profileSummary: profil,
    roleBasedImprovements: roller.map(utan),
    skillSuggestions: kompetenser.map(utan),
    generalImprovements: allmant,
    ...(valt !== undefined ? { selectedImprovements: valt } : {}),
    poangVersion: POANG_VERSION,
  }
  return medSammanfattning(ut)
}

/**
 * Sätter poang och atsFriendliness.score ur de förslag resultatet bär. Körs
 * igen efter gratisfiltreringen, så att "med våra förslag" bara räknar de
 * förslag hon faktiskt ser.
 */
export function medSammanfattning(result: Obj): Obj {
  const val = forvaltVal(result as AnalysForPoang)
  const s = poangSammanfattning(result as AnalysForPoang, val)
  const ats = arObj(result.atsFriendliness) ? result.atsFriendliness : {}
  // forvald: om förslaget är förvalt (sänker inte poängen, ensamt eller
  // tillsammans med de andra förvalda). Väljsteget förväljer bara dessa.
  const markera = (lista: unknown, valda: readonly number[]) =>
    Array.isArray(lista) ? lista.map((x, i) => (arObj(x) ? { ...x, forvald: valda.includes(i) } : x)) : lista
  return {
    ...result,
    profileSummary: arObj(result.profileSummary) ? { ...result.profileSummary, forvald: val.profil } : result.profileSummary,
    roleBasedImprovements: markera(result.roleBasedImprovements, val.roller),
    skillSuggestions: markera(result.skillSuggestions, val.kompetenser),
    atsFriendliness: {
      ...ats,
      score: s ? s.idag : null,
      feedback: s ? `Läsbarhetspoäng ${s.idag} av 100` : '',
    },
    poang: s,
    poangVersion: POANG_VERSION,
  }
}

/** Ett CV:ts poäng ur CV-raden, med analysens sparade struktur som reserv. */
export function poangForRad(cvRad: CvRad | null | undefined, reservStruktur?: unknown): number | null {
  const cv = kanonisktCv(cvRad?.structured_data, cvRad?.cv_text) ?? kanonisktCv(reservStruktur, cvRad?.cv_text ?? null)
  return cv ? raknaPoang(cv, arkFor(cvRad, reservStruktur)).total : null
}
