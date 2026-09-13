/**
 * Dashboardens tre tillstånd (docs/design/koncept-2026-09-13.md, ram 7).
 *
 *   A  inget CV          → heron med uppladdningen
 *   B  CV men inget brev → heron pekar mot första brevet
 *   C  aktiv             → ingen hero, jobbsöksöversikten är startpunkten
 *
 * Funktionen bor i en egen fil, inte tillsammans med DashboardHero. Sidan
 * behöver veta tillståndet för att alls avgöra om heron ska renderas, och så
 * länge funktionen låg i komponentens modul drog importen med sig hela heron
 * plus InlineCVUpload och QuickScoreReveal, knappt 400 rader som aldrig körs
 * i tillstånd C. Nu kan heron lazy-laddas och tillståndet ändå räknas ut.
 */

export type DashboardState = 'A' | 'B' | 'C'

export function deriveDashboardState(cvCount: number, totalLetters: number): DashboardState {
  if (cvCount === 0) return 'A'
  if (totalLetters === 0) return 'B'
  return 'C'
}
