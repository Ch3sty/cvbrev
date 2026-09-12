/**
 * Stegdefinitioner för CV-byggaren.
 *
 * Låg tidigare i SkapaCvProgress.tsx, som också renderade en egen fixed
 * progressrad i nederkanten. Sedan flödena flyttade in i FlowShell äger
 * skalet progressen, så komponenten är borttagen och definitionerna bor här.
 * Ikonerna följde inte med: FlowShell visar räknare och stapel, inte ikoner.
 */

export interface SkapaCvStep {
  id: number
  label: string
  shortLabel: string
}

export const SKAPA_CV_STEPS: SkapaCvStep[] = [
  { id: 0, label: 'Kontaktuppgifter', shortLabel: 'Kontakt' },
  { id: 1, label: 'Om dig', shortLabel: 'Om dig' },
  { id: 2, label: 'Erfarenhet', shortLabel: 'Erfarenhet' },
  { id: 3, label: 'Utbildning', shortLabel: 'Utbildning' },
  { id: 4, label: 'Kompetenser', shortLabel: 'Kompetenser' },
  { id: 5, label: 'Språk', shortLabel: 'Språk' },
  { id: 6, label: 'Granska och spara', shortLabel: 'Granska' },
]
