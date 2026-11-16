/**
 * Övergång: det gamla gränssnittet generate(cv) för de komponenter som ännu
 * renderar exempel-CV:t i klienten (cv-exempel, yrkessidan, CV-byggarens
 * steg 7). Drar in renderaren och registret; byggagent C byter dem mot
 * /api/public/exempel/cv och /api/cv/preview-html, därefter tas filen bort.
 */
import type { CVMetadata } from '../cv-metadata'
import { losMallId } from './alias'
import { renderMallHtml } from './render/html'

export { isValidTemplateId } from './kompat'

export function getTemplateGenerator(id: string): { generate: (cv: CVMetadata, options?: Record<string, unknown>) => string } | undefined {
  const los = losMallId(id)
  if (!los) return undefined
  return {
    generate: (cv, options = {}) =>
      renderMallHtml(cv, los, options.includePhoto === undefined ? {} : { foto: Boolean(options.includePhoto) }, { forhandsvisning: true }),
  }
}
