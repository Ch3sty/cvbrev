/**
 * HTML för ett CV i en mall, för den publika förhandsvisningen.
 *
 * TILLFÄLLIGT: byggagent A bygger renderMallHtml(cv, mallId, val) i det nya
 * mallsystemet. Tills den finns renderas med dagens generatorer, och av
 * valen fungerar bara typsnittet. När A:s renderare landar byts kroppen i
 * renderaMallHtml mot ett anrop till den; anroparna ändras inte.
 *
 * Bara för servern.
 */
import 'server-only'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { getTemplateGenerator, isValidTemplateId } from '@/lib/cv/templates'
import { getFontById, injectFontIntoHTML } from '@/lib/cv/preview-utils'

export function renderaMallHtml(cv: CVMetadata, mallId: string, val: MallVal = {}): string | null {
  if (!isValidTemplateId(mallId)) return null
  const generator = getTemplateGenerator(mallId)
  if (!generator) return null
  const html = generator.generate(cv, { includePhoto: val.foto === true })
  return val.typsnitt ? injectFontIntoHTML(html, getFontById(val.typsnitt).family) : html
}
