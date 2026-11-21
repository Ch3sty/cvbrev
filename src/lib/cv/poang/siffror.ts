/**
 * Platshållare som står kvar i CV:t (efterrättning A 2026-11-21).
 *
 * Analysens förslag skriver [antal] där hon ska fylla i sin egen siffra
 * (förslag hittar aldrig på tal, matt.ts). Efter "Ersätt mitt nuvarande CV"
 * står platshållaren i CV:t tills hon skrivit in talet, och filen laddas ner
 * med texten ordagrant. Här finns var de står (för påminnelserna på Ditt CV,
 * Analys och vid nedladdningen) och vad siffrorna är värda i poäng.
 *
 * Mönstret är poängmodellens (PLATSHALLARE_RE i matt.ts: text inom
 * hakparentes). Maskeringens platshållare ([NAMN], [EMAIL] ...) räknas inte:
 * de står aldrig i det hon själv ska fylla i. Kontaktuppgifterna läses inte.
 *
 * Plus för siffrorna räknas med poängmodellen: poäng(CV där varje
 * platshållare bytts mot ett tal) minus poäng(CV i dag). Poängmodellen ser
 * bara att ett tal finns, aldrig vilket, så vilket tal hon skriver ger samma
 * poäng (testat i siffror.test.ts). Klientsäker, rena funktioner.
 */
import type { CVMetadata } from '../cv-metadata'
import { harPiiPlatshallare } from '@/lib/privacy/cvForModel'
import { kanonisktCv } from './kanon'
import { PLATSHALLARE_MONSTER } from './matt'
import { raknaPoang } from './modell'

/** Avsnitten i arbetslägets ord (rum3/flikar.ts ArbetsAvsnitt), i CV:ts ordning. */
export type SiffrorAvsnitt = 'profil' | 'erfarenhet' | 'utbildning' | 'kompetenser' | 'fler'

export interface PlatshallareKvar {
  avsnitt: SiffrorAvsnitt
  /** Jobbets eller utbildningens plats i listan (erfarenhet, utbildning). */
  index?: number
  /** Raden där platshållaren står, som den står. */
  text: string
}

type Obj = Record<string, unknown>
const arObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v)

/** Platshållarna i en text som hon ska fylla i (inte maskeringens). */
function platshallareI(text: string): string[] {
  return (text.match(new RegExp(PLATSHALLARE_MONSTER, 'g')) ?? []).filter((m) => !harPiiPlatshallare(m))
}

/** Raderna i ett fält: strängar och listor av strängar, en rad per radbrytning. */
function rader(v: unknown): string[] {
  const lista = Array.isArray(v) ? v : [v]
  return lista.flatMap((x) => (typeof x === 'string' ? x.split(/\n+/) : [])).map((s) => s.trim()).filter(Boolean)
}

/**
 * Var platshållare står kvar i CV:t, i CV:ts ordning: profilen, jobben,
 * utbildningarna, kompetenserna och resten (projekt, certifikat). En rad per
 * rad med minst en platshållare. Tom lista när inget står kvar.
 */
export function platshallareKvar(cv: CVMetadata | null | undefined): PlatshallareKvar[] {
  if (!cv) return []
  const ut: PlatshallareKvar[] = []
  const lagg = (avsnitt: SiffrorAvsnitt, v: unknown, index?: number) => {
    for (const text of rader(v)) {
      if (platshallareI(text).length > 0) ut.push({ avsnitt, ...(index !== undefined ? { index } : {}), text })
    }
  }
  lagg('profil', cv.summary)
  ;(Array.isArray(cv.experience) ? cv.experience : []).forEach((e, i) => {
    if (!arObj(e)) return
    lagg('erfarenhet', e.position, i)
    lagg('erfarenhet', e.company, i)
    lagg('erfarenhet', e.description, i)
    lagg('erfarenhet', e.achievements, i)
  })
  ;(Array.isArray(cv.education) ? cv.education : []).forEach((u, i) => {
    if (!arObj(u)) return
    lagg('utbildning', u.degree, i)
    lagg('utbildning', u.institution, i)
    lagg('utbildning', u.description, i)
  })
  for (const g of Array.isArray(cv.skills) ? cv.skills : []) {
    if (typeof g === 'string') lagg('kompetenser', g)
    else if (arObj(g)) lagg('kompetenser', Array.isArray(g.skills) ? g.skills : g.name)
  }
  for (const p of Array.isArray(cv.projects) ? cv.projects : []) {
    if (!arObj(p)) continue
    lagg('fler', p.name)
    lagg('fler', p.description)
    lagg('fler', p.achievements)
  }
  for (const c of Array.isArray(cv.certifications) ? cv.certifications : []) {
    lagg('fler', typeof c === 'string' ? c : arObj(c) ? c.name : null)
  }
  return ut
}

/** Platshållarna i en lagrad CV-rad (structured_data i något av formaten). */
export function platshallareIRad(structuredData: unknown, cvText?: string | null): PlatshallareKvar[] {
  return platshallareKvar(kanonisktCv(structuredData, cvText ?? null))
}

/** Talet som står in för hennes siffra när plus räknas. Vilket tal som helst ger samma poäng. */
export const SIFFRA_FOR_PLUS = '10'

/**
 * CV:t med varje platshållare utbytt mot ett tal, så som det ser ut när hon
 * fyllt i sina siffror. Kontaktuppgifterna och maskeringens platshållare rörs inte.
 */
export function medSiffror(cv: CVMetadata, tal: string = SIFFRA_FOR_PLUS): CVMetadata {
  const byt = (v: unknown): unknown => {
    if (typeof v === 'string') {
      return v.replace(new RegExp(PLATSHALLARE_MONSTER, 'g'), (m) => (harPiiPlatshallare(m) ? m : tal))
    }
    if (Array.isArray(v)) return v.map(byt)
    if (arObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, byt(x)]))
    return v
  }
  const { personalInfo, ...resten } = cv
  return { ...(byt(resten) as Omit<CVMetadata, 'personalInfo'>), personalInfo } as CVMetadata
}

/**
 * Vad siffrorna ger i poäng: poäng(CV med siffrorna ifyllda) minus poäng(CV
 * i dag). Noll när inget står kvar eller när talen inte ändrar poängen.
 */
export function plusForSiffror(cv: CVMetadata | null | undefined): number {
  if (!cv || platshallareKvar(cv).length === 0) return 0
  return Math.max(0, raknaPoang(medSiffror(cv)).total - raknaPoang(cv).total)
}
