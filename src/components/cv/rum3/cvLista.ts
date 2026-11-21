/**
 * CV-listan i den form CV-raden och Byt CV-arket läser (CvListRad), ur
 * cv_texts-raderna som flikarnas sidor redan har. Klientsäker.
 */
import type { CvListRad } from './BytCvArk'
import { cvTextForVisning } from '@/lib/cv/visningsText'

export interface CvRadData {
  id: string
  file_name: string
  created_at: string
  updated_at?: string | null
  structured_data?: unknown
  cv_text?: string | null
}

export function cvListaUr(rader: readonly CvRadData[], lasta: ReadonlySet<string>, poang: Record<string, number> = {}): CvListRad[] {
  return rader.map((c) => ({
    id: c.id,
    namn: c.file_name,
    skapad: c.created_at,
    andrad: c.updated_at ?? null,
    last: lasta.has(c.id),
    utkast: (c.structured_data as { bygge?: { utkast?: boolean } } | null)?.bygge?.utkast === true,
    poang: poang[c.id] ?? null,
    // Råtext: kontaktuppgifterna ur strukturen, inte den maskade texten.
    cvText: cvTextForVisning(c.cv_text, c.structured_data),
  }))
}

/** CV:t en flik visar: ?cv= om det finns och inte är låst, annars det senaste olåsta. */
export function valtCvId(rader: readonly { id: string }[], lasta: ReadonlySet<string>, cvParam: string | null | undefined): string | null {
  if (cvParam && rader.some((c) => c.id === cvParam) && !lasta.has(cvParam)) return cvParam
  return rader.find((c) => !lasta.has(c.id))?.id ?? null
}
