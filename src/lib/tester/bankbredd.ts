/**
 * Bankbredden: hur många aktiva uppgifter testerna kan visa, per testtyp
 * (art director 2026-11-19, docs/design/bankbredd-2026-11-19.md avsnitt 2).
 * En uppgift är det användaren svarar på: en matris, en figurserie, en
 * deduktiv uppgift, en talserie, en spatial uppgift, ett ord, ett påstående
 * i verbalt, en fråga i numeriskt. Bara den aktiva versionen av varje bank
 * räknas, pensionerade uppgifter och inaktiva partier inte.
 *
 * Ren fil utan bankimporter, samma mönster som antal-testtyper.ts: bankerna
 * är serverkod med facit och får inte in i klientens JavaScript (PaywallCard
 * är en klientkomponent). Talen är inskrivna här och vaktas av
 * __tests__/bankbredd.test.ts, som räknar om dem ur bankerna. Ändras en bank
 * faller testet, och då uppdateras talen här.
 */

import type { TestTyp } from '@/components/illustrations/TestGlyfer'

/** De åtta testtyperna med en bank av uppgifter, i Nio-radens ordning. Personlighetstestet har ingen. */
export type BankTyp = Exclude<TestTyp, 'personlighet'>

export const BANK_TYPER: readonly BankTyp[] = [
  'matris',
  'figurer',
  'deduktiv',
  'talserier',
  'spatial',
  'ordforrad',
  'verbalt',
  'numeriskt',
]

/** Aktiva uppgifter per typ. Vaktas av bankbredd.test.ts, som räknar ur bankerna (specen avsnitt 2.2). */
export const BANK_PER_TYP: Readonly<Record<BankTyp, number>> = {
  matris: 499,
  figurer: 386,
  deduktiv: 354,
  talserier: 505,
  spatial: 576,
  ordforrad: 557,
  verbalt: 368,
  numeriskt: 288,
}

/** Summan av alla aktiva uppgifter (3 533 den 2026-11-19). */
export const BANK_TOTAL: number = BANK_TYPER.reduce((a, t) => a + BANK_PER_TYP[t], 0)

/** Största banken, skalans topp: staplarnas höjd är antal / BANK_MAX, linjärt från noll. */
export const BANK_MAX: number = Math.max(...BANK_TYPER.map((t) => BANK_PER_TYP[t]))

/** Talet som visas: golvavrundat till hundratal så att "över" alltid är sant. 3533 ger 3500, exakt 3500 skulle ge 3400. */
export const BANK_VISAT: number = Math.floor((BANK_TOTAL - 1) / 100) * 100

/** Heltal med tunt mellanslag (U+2009) som tusentalsavstånd: 3500 blir "3 500". */
export function bankTal(n: number): string {
  return String(Math.trunc(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** "över 3 500 uppgifter", för copy som nämner talet i text (mejl, FAQ, registreringen). */
export const BANK_TEXT = `över ${bankTal(BANK_VISAT)} uppgifter`
