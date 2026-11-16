/**
 * Mallens HTML för nedladdning och kontroller: samma väg som
 * generate-formatted, så ATS-testet (scripts/ats-mallar.ts) provar exakt den
 * HTML som blir PDF:en.
 */
import type { CVMetadata, CVTemplateType } from './cv-metadata'
import { getTemplateGenerator } from './templates'

export function renderaMallHtml(cvData: CVMetadata, templateId: string, options: Record<string, unknown> = {}): string | null {
  // Referenser står alltid som den svenska standardfrasen.
  const standard = { ...cvData, references: 'Referenser lämnas på begäran' }
  const generator = getTemplateGenerator(templateId as CVTemplateType)
  return generator ? generator.generate(standard, options) : null
}
