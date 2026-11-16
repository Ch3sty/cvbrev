/**
 * Mallantalen som tal, utan mallregistret.
 *
 * Talen räknas ur mallkatalogen (src/lib/cv/mallar/katalog.ts), som är
 * liten och klientsäker, så att prisstegen, säljcopyn och de publika sidorna
 * kan läsa dem utan att dra in renderaren eller definitionerna. Inga
 * hårdkodade tal: en ny mall i katalogen ändrar talen överallt. Testet i
 * src/lib/cv/__tests__/template-count.test.ts bevakar att copy som inte kan
 * importera konstanterna säger samma sak.
 */
import {
  GRATIS_ANTAL,
  MALL_ANTAL,
  MALL_KATALOG,
  PREMIUM_ANTAL,
  WORD_MALL_IDS,
  harWord,
} from './mallar/katalog'

/** Antalet CV-mallar i katalogen. */
export const TEMPLATE_COUNT = MALL_ANTAL

/** Antalet mallar som ingår på gratisnivån. */
export const FREE_TEMPLATE_COUNT = GRATIS_ANTAL

/** Antalet mallar som kräver Premium. */
export const PREMIUM_TEMPLATE_COUNT = PREMIUM_ANTAL

/**
 * Gratis CV-nedladdningar per konto. Spärren i
 * src/app/api/cv/generate-formatted/route.ts och sidornas text läser samma
 * tal (spec-publikt-v2 del A avsnitt 6).
 */
export const FREE_CV_EXPORTS = 1

/** Mallarna som också laddas ner som Word-fil, i katalogens ordning. */
export const WORD_TEMPLATE_IDS: readonly string[] = WORD_MALL_IDS

export type WordTemplateId = string

/** Antalet Word-mallar. Texter skriver talet härifrån, aldrig som siffra. */
export const WORD_TEMPLATE_COUNT = WORD_MALL_IDS.length

/** Har mallen en Word-version? Klientsäker. Gamla id: lös dem först (losMallId). */
export function harWordVersion(templateId: unknown): templateId is WordTemplateId {
  return harWord(templateId)
}

const TALORD = ['inga', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo']

/** Ett antal som ord för löptext ("sex av mallarna"); över tjugo som siffror. */
export function talSomOrd(n: number): string {
  return TALORD[n] ?? String(n)
}

/** Antalet Word-mallar som ord, för löptext. */
export const WORD_TEMPLATE_COUNT_ORD = talSomOrd(WORD_TEMPLATE_COUNT)

/** Word-mallarnas namn per id. */
export const WORD_MALL_NAMN: Record<WordTemplateId, string> = Object.fromEntries(
  MALL_KATALOG.filter((m) => m.word).map((m) => [m.id, m.namn])
)

/** Word-mallarnas namn i katalogens ordning för löptext: "Linne, Björk ... och Stål". */
export function wordMallarSomText(): string {
  const namn = WORD_MALL_IDS.map((id) => WORD_MALL_NAMN[id])
  if (namn.length <= 1) return namn.join('')
  return `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`
}

/**
 * Typsnittet varje Word-mall har i Word-filen, som id i verktygsradens
 * typsnittslista. Steg 3 visar det när Word är valt och användaren inte
 * själv bytt typsnitt.
 */
export const WORD_MALL_TYPSNITT: Record<WordTemplateId, string> = Object.fromEntries(
  MALL_KATALOG.filter((m) => m.word).map((m) => [m.id, m.typsnitt ?? 'calibri'])
)
