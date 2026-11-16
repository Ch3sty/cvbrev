/**
 * Byggarens källa till förhandsvisningen, delad mellan servern (arkets
 * första HTML i page.tsx) och klienten (useForhandsvisning), så att
 * nyckeln i flikens cache blir densamma och första målningen inte hämtas om.
 *
 * Klientsäker, ren data.
 */
import type { CVMetadata } from '../cv-metadata'
import type { MallVal, Sektion } from '../mallar/kontrakt'
import type { ByggCv } from './modell'

/** Varifrån byggaren öppnades (cv_bygg_start). */
export type Entry = 'mina_cv' | 'hemskarm' | 'sidomeny' | 'registrering' | 'mall' | 'ateruppta' | 'annan'

/** CV:t utan byggarens egna fält: det som renderas, laddas ner och tolkas. */
export function utanBygge(cv: ByggCv): CVMetadata {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bygge, ...rest } = cv
  return rest
}

/** Valen som sparats på CV:t (typsnitt, färg, ordning), utan rubrikerna. */
export function valFor(cv: ByggCv): MallVal {
  const v = { ...(cv.bygge?.val ?? {}) }
  delete v.rubriker
  return v
}

/** Rubrikerna CV:t sparat (cv_texts.section_titles), rensade till kända avsnitt. */
export function rubrikerFor(sparade: Partial<Record<Sektion, string>> | null | undefined): Partial<Record<Sektion, string>> {
  const ut: Partial<Record<Sektion, string>> = {}
  for (const [k, v] of Object.entries(sparade ?? {})) if (typeof v === 'string' && v.trim()) ut[k as Sektion] = v
  return ut
}

export function byggKalla(a: {
  cv: ByggCv
  cvId: string | null
  mall: string
  val: MallVal
  rubriker: Partial<Record<Sektion, string>>
}) {
  return {
    typ: 'inloggad' as const,
    cvId: a.cvId ?? undefined,
    structuredData: utanBygge(a.cv),
    mall: a.mall,
    val: { ...a.val, rubriker: a.rubriker },
    spok: true,
  }
}
