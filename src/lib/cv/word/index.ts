/**
 * CV:t som Word-fil (docs/plan-cv-word-2026-11-15.md). Bara på servern:
 * byggaren drar in docx. Klienten läser Word-stödet ur katalogen
 * (src/lib/cv/mallar/katalog.ts, harWord).
 *
 * ÖVERGÅNG (mallsystemet A1): Word-byggaren läser ännu de gamla
 * WordMallDef; A2 bygger varje mall med word: true ur samma MallDef som
 * PDF:en. Fram till dess får alla Word-mallar den enspaltiga grunden.
 */
import { Packer } from 'docx'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { wordTypsnittForCv } from '@/lib/documents/typsnitt'
import { byggDokument, type WordMallDef } from './base'
import { hantverkare } from './mallar/hantverkare'
import { myndighet } from './mallar/myndighet'
import { norrsken } from './mallar/norrsken'
import { stack } from './mallar/stack'
import { student } from './mallar/student'
import { tidlos } from './mallar/tidlos'

export { byggDokument }
export type { WordMallDef }

export const WORD_MALLAR: Record<string, WordMallDef> = {
  norrsken,
  'student-startup': student,
  'tidlos-formell': tidlos,
  myndighet,
  'stack-developer': stack,
  bygg: hantverkare,
}

/** Word-filens innehållstyp. */
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** CV:t som .docx-buffer i mallen, med valen. */
export async function byggWordCv(cv: CVMetadata, mallId: string, val: MallVal = {}): Promise<Buffer> {
  const def = WORD_MALLAR[mallId] ?? norrsken
  return Packer.toBuffer(byggDokument(cv, def, wordTypsnittForCv(val.typsnitt)))
}
