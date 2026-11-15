/**
 * Mallantalen som tal, utan mallregistret.
 *
 * simple-templates.ts bär hela registret (namn, beskrivningar, layoutdata
 * för 41 mallar). Prisstegen i src/lib/plans/plans.ts behövde bara talet 41,
 * men importen drog in registret i varje publik sidas JavaScript via headerns
 * paketmeny: 14 kB komprimerat som ingen läste. Talen står därför här, och
 * simple-templates.ts exporterar dem vidare. Testet i
 * src/lib/cv/__tests__/template-count.test.ts fäller om registret och talen
 * glider isär.
 */

/** Antalet CV-mallar i registret. */
export const TEMPLATE_COUNT = 41

/** Antalet mallar som ingår på gratisnivån. */
export const FREE_TEMPLATE_COUNT = 3

/** Antalet mallar som kräver CV-paketet eller Hela paketet. */
export const PREMIUM_TEMPLATE_COUNT = 38

/**
 * Gratis CV-nedladdningar per konto. Spärren i
 * src/app/api/cv/generate-formatted/route.ts och sidornas text läser samma
 * tal (spec-publikt-v2 del A avsnitt 6).
 */
export const FREE_CV_EXPORTS = 1

/**
 * Mallarna som också laddas ner som Word-fil (docs/plan-cv-word-2026-11-15.md
 * avsnitt 3): de fria Norrsken och Student och fyra premiummallar, alla
 * enspaltiga. Id:na står här och inte i src/lib/cv/word/, så att galleriet
 * och de publika sidorna kan märka mallarna utan att dra in Word-byggaren.
 * Testet i src/lib/cv/__tests__/template-count.test.ts fäller om ett id
 * saknas i registret eller i WORD_MALLAR.
 */
export const WORD_TEMPLATE_IDS = [
  'norrsken',
  'student-startup',
  'tidlos-formell',
  'myndighet',
  'stack-developer',
  'bygg',
] as const

export type WordTemplateId = (typeof WORD_TEMPLATE_IDS)[number]

/** Antalet Word-mallar. Texter skriver talet härifrån, aldrig som siffra. */
export const WORD_TEMPLATE_COUNT = WORD_TEMPLATE_IDS.length

/** Har mallen en Word-version? Klientsäker. */
export function harWordVersion(templateId: unknown): templateId is WordTemplateId {
  return typeof templateId === 'string' && (WORD_TEMPLATE_IDS as readonly string[]).includes(templateId)
}

/**
 * Antalet Word-mallar som ord, för löptext ("sex av mallarna"). Testet i
 * template-count.test.ts fäller om ordet och talet glider isär.
 */
export const WORD_TEMPLATE_COUNT_ORD = 'sex'

/** Word-mallarnas namn i registrets ordning för löptext: "Norrsken, Student ... och Hantverkare". */
export const WORD_MALL_NAMN: Record<WordTemplateId, string> = {
  norrsken: 'Norrsken',
  'student-startup': 'Student',
  'tidlos-formell': 'Tidlös',
  myndighet: 'Myndighet',
  'stack-developer': 'Stack',
  bygg: 'Hantverkare',
}

export function wordMallarSomText(): string {
  const namn = WORD_TEMPLATE_IDS.map((id) => WORD_MALL_NAMN[id])
  return `${namn.slice(0, -1).join(', ')} och ${namn[namn.length - 1]}`
}

/**
 * Typsnittet varje Word-mall har i Word-filen, som id i verktygsradens
 * typsnittslista (src/lib/cv/preview-utils.ts). Steg 3 visar det när Word är
 * valt och användaren inte själv bytt typsnitt. Testet i
 * src/lib/cv/word/__tests__/word-mallar.test.ts håller det lika med
 * WORD_MALLAR.
 */
export const WORD_MALL_TYPSNITT: Record<WordTemplateId, 'calibri' | 'arial' | 'garamond'> = {
  norrsken: 'calibri',
  'student-startup': 'calibri',
  'tidlos-formell': 'garamond',
  myndighet: 'arial',
  'stack-developer': 'calibri',
  bygg: 'calibri',
}
