/**
 * Word-mallarna (docs/plan-cv-word-2026-11-15.md avsnitt 3). Bara på
 * servern: byggaren drar in docx. Klienten läser id:na ur
 * src/lib/cv/template-antal.ts.
 */
import { Packer } from 'docx'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { harWordVersion, type WordTemplateId } from '@/lib/cv/template-antal'
import { byggDokument, type WordMallDef } from './base'
import { hantverkare } from './mallar/hantverkare'
import { myndighet } from './mallar/myndighet'
import { norrsken } from './mallar/norrsken'
import { stack } from './mallar/stack'
import { student } from './mallar/student'
import { tidlos } from './mallar/tidlos'

export { harWordVersion, byggDokument }
export type { WordMallDef }

export const WORD_MALLAR: Record<WordTemplateId, WordMallDef> = {
  norrsken,
  'student-startup': student,
  'tidlos-formell': tidlos,
  myndighet,
  'stack-developer': stack,
  bygg: hantverkare,
}

/** Word-filens innehållstyp. */
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** CV:t som .docx-buffer. `typsnitt` null ger mallens eget typsnitt. */
export async function byggWordCv(cv: CVMetadata, mall: WordTemplateId, typsnitt?: string | null): Promise<Buffer> {
  return Packer.toBuffer(byggDokument(cv, WORD_MALLAR[mall], typsnitt))
}
