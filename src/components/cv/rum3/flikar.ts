/**
 * CV-rummets tre flikar (byggspecen avsnitt 1 punkt 2), samma mönster som
 * testernas Hem, Tester och Din utveckling. Adresserna är de gamla. Valt CV
 * bärs i ?cv=<id> mellan flikarna.
 *
 * Klientsäker, ren data.
 */

import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'

export type CvFlik = 'cv' | 'mallar' | 'analys'

export const DITT_CV_HREF = '/dashboard/profil/cv'
export const MALLAR_HREF = '/dashboard/cv-mallar'
export const ANALYS_HREF = '/dashboard/cv-analys'

export const CV_FLIKAR: readonly { id: CvFlik; href: string; namn: string; rad: string; radKort: string }[] = [
  { id: 'cv', href: DITT_CV_HREF, namn: 'Ditt CV', rad: 'Läget och nästa steg', radKort: 'Läget' },
  { id: 'mallar', href: MALLAR_HREF, namn: 'Mallar', rad: `Samma CV i ${TEMPLATE_COUNT} mallar`, radKort: `${TEMPLATE_COUNT} utseenden` },
  { id: 'analys', href: ANALYS_HREF, namn: 'Analys', rad: 'Poängen och vad som drar ner', radKort: 'Vad som drar ner' },
]

/** Fliken med CV:t i adressen. Utan id: fliken som den är (senaste aktiva CV:t). */
export function flikHref(flik: CvFlik, cvId?: string | null, extra?: Record<string, string>): string {
  const href = CV_FLIKAR.find((f) => f.id === flik)!.href
  const q = new URLSearchParams({ ...(cvId ? { cv: cvId } : {}), ...(extra ?? {}) })
  const s = q.toString()
  return s ? `${href}?${s}` : href
}
