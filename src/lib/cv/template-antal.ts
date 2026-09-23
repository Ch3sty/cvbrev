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
