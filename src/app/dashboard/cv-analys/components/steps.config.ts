/**
 * Stegdefinitioner för CV-analysen.
 *
 * Låg tidigare i AnalysisFlowProgress.tsx, som också renderade en egen fixed
 * progressrad i nederkanten. FlowShell äger progressen sedan flödet flyttade
 * dit, så komponenten är borttagen och definitionerna bor här.
 */

export interface AnalysisStep {
  id: number
  label: string
  shortLabel: string
}

export const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: 0, label: 'Välj CV', shortLabel: 'CV' },
  { id: 1, label: 'Analys', shortLabel: 'Analys' },
  { id: 2, label: 'Översikt', shortLabel: 'Översikt' },
  { id: 3, label: 'Förbättringar', shortLabel: 'Välj' },
  { id: 4, label: 'Granska', shortLabel: 'Granska' },
  { id: 5, label: 'Mall och spara', shortLabel: 'Mall' },
  { id: 6, label: 'Klar', shortLabel: 'Klar' },
]
