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

export const SPRAKNIVAER: readonly Sprakniva[] = ['Modersmål', 'Tvåspråkig', 'Flytande', 'Goda kunskaper', 'Konversation', 'Nybörjare']

/** Längsta rimliga språknamn; längre än så är en mening, inte ett språk. */
export const MAX_SPRAKNAMN = 40

/** Längsta nivå som behålls ordagrant ur CV:t; längre tolkas till ett steg. */
export const MAX_EGEN_NIVA = 30

/**
 * Nivån som CV:t skriver den, översatt till stegen. Ordningen spelar roll:
 * "mycket god" före "god", och "konversation" före "god", så att
 * "god konversation" blir Konversation. Okänd eller saknad nivå blir tom.
 */
const NIVATABELL: [RegExp, Sprakniva][] = [
  [/modersm[aå]l|native|f[oö]rstaspr[aå]k|mother tongue/i, 'Modersmål'],
  [/tv[aå]spr[aå]kig|bilingual/i, 'Tvåspråkig'],
  [/flytande|flyt\b|fluent|mycket god|mycket bra|excellent|professionell|professional|\bc[12]\b/i, 'Flytande'],
  [/konversation|conversational|\bbra\b|intermediate/i, 'Konversation'],
  [/\bgod\b|goda|good|\bb[12]\b/i, 'Goda kunskaper'],
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
    const niva = typeof post === 'string' ? '' : egenEllerTolkadNiva((post as { proficiency?: unknown }).proficiency, text)
    ut.push({ language, proficiency: niva })
  }
  return ut
}

const utanBlank = (s: string) => s.replace(/\s+/g, ' ').trim()

/**
 * Personens egen formulering gäller (beslutet 2026-11-21): nivån behålls
 * ordagrant när den står i CV-texten och är högst 30 tecken. Är den ett av
 * stegen (oavsett skiftläge) skrivs steget, så att väljaren känner igen den.
 * Annars, eller utan CV-text, tolkas den till ett steg som förut.
 */
export function egenEllerTolkadNiva(niva: unknown, cvTextGemener: string | null): string {
  if (typeof niva !== 'string') return ''
  const t = utanBlank(niva)
  if (!t) return ''
  const steg = SPRAKNIVAER.find((n) => n.toLowerCase() === t.toLowerCase())
  if (steg) return steg
  if (cvTextGemener !== null && t.length <= MAX_EGEN_NIVA && utanBlank(cvTextGemener).includes(t.toLowerCase())) return t
  return tolkaNiva(t)
}

/**
 * Har språket en nivå? Ett steg, ett ord tolkaNiva känner igen, eller
 * personens egen formulering (som arket skriver ut). Poängdelen Språk och
 * genomgången räknar med den, så att ett språk med en synlig nivå aldrig
 * står som "saknar nivå". För CV med nivåer som förut ger det samma poäng.
 */
export function harNiva(niva: unknown): boolean {
  return typeof niva === 'string' && niva.trim().length > 0
}

/** Ett av stegen i väljaren (inte en egen formulering och inte tom)? */
export function arSteg(niva: unknown): niva is Sprakniva {
  return typeof niva === 'string' && (SPRAKNIVAER as readonly string[]).includes(niva)
}

/** En cv_texts-rad med nivåerna härledda för visning (harledSprakniva). */
export function radMedHarleddSprakniva<R extends { structured_data?: unknown; cv_text?: string | null }>(rad: R): R {
  const sd = harledSprakniva(rad.structured_data, rad.cv_text)
  return sd === rad.structured_data ? rad : { ...rad, structured_data: sd }
}

const ORD_GOD =/(^|[^\p{L}])(god|goda|bra)([^\p{L}]|$)/iu

/**
 * Redan inlästa CV (före 2026-11-21) fick "god", "goda" och "bra" som
 * Konversation. Står nivån Konversation och språkets rad i CV-texten säger
 * god, goda eller bra, visas Goda kunskaper. Härlett vid läsning, ingenting
 * skrivs i databasen. Bara den del av raden som hör till språket räknas (från
 * språknamnet till nästa språk i listan), så att "Engelska (konversation),
 * tyska (goda)" bara ändrar tyskan. Strukturen lämnas orörd när inget ändras.
 */
export function harledSprakniva<T>(structuredData: T, cvText: string | null | undefined): T {
  if (!cvText || !structuredData || typeof structuredData !== 'object' || Array.isArray(structuredData)) return structuredData
  const sd = structuredData as Record<string, unknown>
  if (!Array.isArray(sd.languages)) return structuredData
  const sprak = sd.languages as unknown[]
  if (!sprak.some((l) => (l as { proficiency?: unknown } | null)?.proficiency === 'Konversation')) return structuredData
  const namn = sprak
    .map((l) => (typeof (l as { language?: unknown } | null)?.language === 'string' ? (l as { language: string }).language.trim().toLowerCase() : ''))
    .filter(Boolean)
  const rader = cvText.toLowerCase().split(/\r?\n/)
  let andrad = false
  const nya = sprak.map((l) => {
    const post = l as { language?: unknown; proficiency?: unknown } | null
    if (!post || post.proficiency !== 'Konversation' || typeof post.language !== 'string') return l
    const eget = post.language.trim().toLowerCase()
    if (!eget) return l
    for (const rad of rader) {
      const start = rad.indexOf(eget)
      if (start < 0) continue
      let slut = rad.length
      for (const annat of namn) {
        if (annat === eget) continue
        const i = rad.indexOf(annat, start + eget.length)
        if (i >= 0 && i < slut) slut = i
      }
      const del = rad.slice(start + eget.length, slut)
      if (/konversation|conversational/.test(del)) return l
      if (ORD_GOD.test(del)) {
        andrad = true
        return { ...post, proficiency: 'Goda kunskaper' }
      }
      // Ingen nivå på den här raden (språket nämnt i en roll): nästa rad.
    }
    return l
  })
  return andrad ? ({ ...sd, languages: nya } as T) : structuredData
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
