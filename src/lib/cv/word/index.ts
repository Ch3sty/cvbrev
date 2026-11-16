/**
 * CV:t som Word-fil (docs/plan-mallar-2026-11-15.md avsnitt 3.4). Bara på
 * servern: byggaren drar in docx och sharp. Klienten läser Word-stödet ur
 * katalogen (src/lib/cv/mallar/katalog.ts, harWord).
 *
 * Varje mall med word: true byggs ur samma MallDef och samma innehåll som
 * PDF:en (bygg.ts).
 */
import { Packer } from 'docx'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { getMallMedAlias } from '@/lib/cv/mallar/register'
import { byggWordDokument, hallIhopPunkt, hallIhopRad, fotoSomPng } from './bygg'

export { byggWordDokument, hallIhopPunkt, hallIhopRad, fotoSomPng }

/** Word-filens innehållstyp. */
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** CV:t som .docx-buffer i mallen, med valen. Gamla id löses med alias. */
export async function byggWordCv(cv: CVMetadata, mallId: string, val: MallVal = {}): Promise<Buffer> {
  const def = getMallMedAlias(mallId)
  if (!def) throw new Error(`Okänd mall: ${mallId}`)
  if (!def.word) throw new Error(`Mallen ${def.id} finns inte som Word-fil`)
  return Packer.toBuffer(await byggWordDokument(cv, def, val))
}
