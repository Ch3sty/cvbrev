/**
 * Språken i ett CV: inläsningens tvätt och läget "finns, saknas eller inte
 * inläst".
 *
 * Fältet heter `languages` och posterna `{ language, proficiency }` i alla
 * tre formaten i structured_data (CVMetadata, byggarens bygge och, sedan
 * 2026-11-21, inläsningens roles-format), med nivåerna ur CVLanguage.
 * Inläsningen sätter en tom nivå när CV:t inte anger någon: vi gissar aldrig.
 *
 * Nyckelns närvaro är signalen. En lyckad inläsning skriver alltid
 * `languages` (tom lista när CV:t inte nämner något språk); CV inlästa före
 * 2026-11-21 och reservstrukturen när AI-anropet faller saknar nyckeln.
 *
 * Klientsäker, ren data och rena funktioner.
 */
import type { CVLanguage, Sprakniva } from './cv-metadata'

export type { Sprakniva }

/** Ett språk ur inläsningen: nivån är tom när CV:t inte anger någon. */
export type InlastSprak = CVLanguage

export const SPRAKNIVAER: readonly Sprakniva[] = ['Modersmål', 'Tvåspråkig', 'Flytande', 'Konversation', 'Nybörjare']

/** Längsta rimliga språknamn; längre än så är en mening, inte ett språk. */
export const MAX_SPRAKNAMN = 40

/**
 * Nivån som CV:t skriver den, översatt till de fem nivåerna. Ordningen
 * spelar roll: "mycket god" före "god". Okänd eller saknad nivå blir tom.
 */
const NIVATABELL: [RegExp, Sprakniva][] = [
  [/modersm[aå]l|native|f[oö]rstaspr[aå]k|mother tongue/i, 'Modersmål'],
  [/tv[aå]spr[aå]kig|bilingual/i, 'Tvåspråkig'],
  [/flytande|flyt\b|fluent|mycket god|mycket bra|excellent|professionell|professional|\bc[12]\b/i, 'Flytande'],
  [/konversation|conversational|\bgod\b|goda|\bbra\b|good|\bb[12]\b|intermediate/i, 'Konversation'],
  [/grundl[aä]ggande|nyb[oö]rjare|basic|beginner|elementary|\ba[12]\b|skolkunskap/i, 'Nybörjare'],
]

export function tolkaNiva(niva: unknown): Sprakniva | '' {
  if (typeof niva !== 'string') return ''
  const t = niva.trim()
  if (!t) return ''
  const exakt = SPRAKNIVAER.find((n) => n.toLowerCase() === t.toLowerCase())
  if (exakt) return exakt
  return NIVATABELL.find(([re]) => re.test(t))?.[1] ?? ''
}

/**
 * Modellens språklista efter inläsningen: trimmad, utan dubbletter
 * (skiftlägesokänsligt), utan tomma och orimligt långa poster. Med CV-texten
 * följer bara språk med som står i texten, så att ett gissat modersmål
 * aldrig kommer med. Alltid en lista, tom när inget hittades.
 */
export function tvattaSprak(lista: unknown, cvText?: string): InlastSprak[] {
  if (!Array.isArray(lista)) return []
  const text = typeof cvText === 'string' ? cvText.toLowerCase() : null
  const sedda = new Set<string>()
  const ut: InlastSprak[] = []
  for (const post of lista) {
    const raw = typeof post === 'string' ? post : (post as { language?: unknown } | null)?.language
    const language = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : ''
    if (!language || language.length > MAX_SPRAKNAMN) continue
    const nyckel = language.toLowerCase()
    if (sedda.has(nyckel)) continue
    if (text !== null && !text.includes(nyckel)) continue
    sedda.add(nyckel)
    const niva = typeof post === 'string' ? '' : tolkaNiva((post as { proficiency?: unknown }).proficiency)
    ut.push({ language, proficiency: niva })
  }
  return ut
}

export type SprakLage = 'finns' | 'saknas' | 'inte_inlast'

const harNamn = (l: unknown) =>
  typeof l === 'string' ? l.trim().length > 0 : typeof (l as { language?: unknown } | null)?.language === 'string' && ((l as { language: string }).language.trim().length > 0)

/**
 * Språkläget i structured_data, för alla tre formaten (roles,
 * personalInfo/experience och byggarens bygge) och null.
 *  - 'finns': minst ett språk med namn
 *  - 'saknas': nyckeln finns men inget språk står där (vi har letat)
 *  - 'inte_inlast': ingen struktur eller ingen språknyckel (vi har aldrig letat)
 */
export function sprakLage(structuredData: unknown): SprakLage {
  if (!structuredData || typeof structuredData !== 'object' || Array.isArray(structuredData)) return 'inte_inlast'
  const sd = structuredData as Record<string, unknown>
  if (!('languages' in sd) || sd.languages === undefined || sd.languages === null) return 'inte_inlast'
  if (!Array.isArray(sd.languages)) return 'inte_inlast'
  return sd.languages.some(harNamn) ? 'finns' : 'saknas'
}
