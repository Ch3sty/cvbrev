/**
 * Kortet "Vilken tjänst gäller provet?" på Hem i Rekryteringstester
 * (Jobbsöket omgång 2, byggspec 9.14). Grinden avgörs på servern ur data som
 * Hem redan har; Hoppa över ligger i webbläsaren (localStorage) och läses av
 * klientön TjanstFraga. Ren och klientsäker.
 *
 * Ingen nivå, inget resultat och ingen testtyp lämnar Hem den här vägen: bara
 * tjänsten, arbetsgivaren och varifrån hon kom (fran).
 */
import type { PlanV4, TesterV4Data } from './typer'

export interface Tjanstfraga {
  variant: 'plan' | 'plan_passerad' | 'utan_plan'
  fran: 'test-hem-plan' | 'test-hem'
  /** Nyckeln för Hoppa över: 'ingen' utan plan, annars `${mittTest}|${provdatum ?? ''}`. */
  nyckel: string
}

/** localStorage-nyckeln för Hoppa över (per enhet). */
export const TJANSTFRAGA_NYCKEL = 'tjanstfraga_test'

/** Nyckeln för Hoppa över för planen, eller 'ingen' utan plan. */
export function tjanstfragaNyckel(plan: Pick<PlanV4, 'mittTest' | 'provdatum'> | null): string {
  if (!plan) return 'ingen'
  return `${plan.mittTest}|${plan.provdatum ?? ''}`
}

/**
 * Är frågan hoppad för den här planen? Samma nyckel, eller samma prov där
 * datumet läggs in för första gången (den sparade nyckeln slutar med '|').
 * Ett nytt prov eller ett ändrat datum ställer frågan igen.
 */
export function arHoppad(sparad: string | null, nyckel: string): boolean {
  if (!sparad) return false
  if (sparad === nyckel) return true
  return sparad.endsWith('|') && nyckel.startsWith(sparad)
}

/** Kortet på Hem, eller null när det inte ska visas. */
export function tjanstfraga(
  data: Pick<TesterV4Data, 'plan' | 'dagens' | 'gratis' | 'tjanstfraga'>,
  iAppen: boolean
): Tjanstfraga | null {
  // 1. Aldrig i appen Testklar.
  if (iAppen) return null
  // 2. Minst en slutförd Nivåkoll.
  const u = data.tjanstfraga
  if (!u || !u.harNivakoll) return null
  // 3. Ingen sökt tjänst än.
  if (u.harSoktTjanst) return null
  // 4. Inte för den som står vid första steget.
  if (data.dagens.forstaSteget) return null
  // 5. Väggens knapp är en köpknapp.
  if (data.dagens.knapp.las !== null) return null
  // 6. Gratisraden står på Hem.
  if (!data.gratis.premium && data.gratis.grundKvarIdag <= 0) return null

  const plan = data.plan
  const nyckel = tjanstfragaNyckel(plan)
  if (!plan) return { variant: 'utan_plan', fran: 'test-hem', nyckel }
  const passerad = plan.provdatum !== null && plan.dagarKvar !== null && plan.dagarKvar < 0
  return { variant: passerad ? 'plan_passerad' : 'plan', fran: 'test-hem-plan', nyckel }
}
