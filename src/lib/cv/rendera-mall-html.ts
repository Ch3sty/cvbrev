/**
 * Mallens HTML för nedladdning och kontroller: samma väg som
 * generate-formatted, så ATS-testet (scripts/ats-mallar.ts) och
 * sidbrytningstestet (scripts/mallar-sidbrytning.ts) provar exakt den HTML
 * som blir PDF:en.
 *
 * Mallsystemet sedan 2026-11-16: en mall är en definition
 * (src/lib/cv/mallar), gamla id löses med alias.
 */
import type { CVMetadata } from './cv-metadata'
import type { MallVal } from './mallar/kontrakt'
import { losMallId } from './mallar/register'
import { renderMallHtml, type RenderaHtmlVal } from './mallar/render/html'

/** HTML:en, eller null om mall-id:t är okänt också efter alias. */
export function renderaMallHtml(cvData: CVMetadata, mallId: string, val: MallVal = {}, opt: RenderaHtmlVal = {}): string | null {
  const id = losMallId(mallId)
  if (!id) return null
  return renderMallHtml(cvData, id, val, opt)
}
