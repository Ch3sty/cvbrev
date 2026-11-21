/**
 * CV-rummets tre flikar (byggspecen avsnitt 1 punkt 2), samma mönster som
 * testernas Hem, Tester och Din utveckling. Adresserna är de gamla. Valt CV
 * bärs i ?cv=<id> mellan flikarna.
 *
 * Klientsäker, ren data.
 */

import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { valTillQuery } from '@/lib/cv/mallar/val'

export type CvFlik = 'cv' | 'mallar' | 'analys'

export const DITT_CV_HREF = '/dashboard/profil/cv'
export const MALLAR_HREF = '/dashboard/cv-mallar'
export const ANALYS_HREF = '/dashboard/cv-analys'

export const CV_FLIKAR: readonly { id: CvFlik; href: string; namn: string; rad: string; radKort: string }[] = [
  { id: 'cv', href: DITT_CV_HREF, namn: 'Ditt CV', rad: 'Läget och nästa steg', radKort: 'Läget' },
  { id: 'mallar', href: MALLAR_HREF, namn: 'Mallar', rad: `Samma CV i ${TEMPLATE_COUNT} mallar`, radKort: `${TEMPLATE_COUNT} utseenden` },
  { id: 'analys', href: ANALYS_HREF, namn: 'Analys', rad: 'Poängen och vad som drar ner', radKort: 'Vad som drar ner' },
]

/**
 * Förhämtas länken? CV-rummets tre sidor förhämtas inte (false): en
 * förhämtad sida ligger kvar i routerns minne i minuter, och efter en
 * nedladdning, en sparning i arbetsläget eller en analys visade Ditt CV,
 * Mallar och Analys då gamla tal och "Inte nedladdat än" tills sidan
 * laddades om. Övriga länkar förhämtas som förut (true).
 */
export function forhamtaCvSida(href: string): boolean {
  const vag = href.split('?')[0]
  return vag !== DITT_CV_HREF && vag !== MALLAR_HREF && vag !== ANALYS_HREF
}

/** Fliken med CV:t i adressen. Utan id: fliken som den är (senaste aktiva CV:t). */
export function flikHref(flik: CvFlik, cvId?: string | null, extra?: Record<string, string>): string {
  const href = CV_FLIKAR.find((f) => f.id === flik)!.href
  const q = new URLSearchParams({ ...(cvId ? { cv: cvId } : {}), ...(extra ?? {}) })
  const s = q.toString()
  return s ? `${href}?${s}` : href
}

/** Avsnitten arbetsläget öppnar (byggspecen 10b). */
export type ArbetsAvsnitt = 'kontakt' | 'profil' | 'erfarenhet' | 'utbildning' | 'kompetenser' | 'sprak' | 'fler'

/**
 * Arbetsläget (steg 3) på sin enda adress, kontraktet i byggspecen 10b:
 * /dashboard/skapa-cv?cv=&avsnitt=&mall=&fran=. "Klar" och tillbaka går till
 * sidan i `fran` med samma cv och mall. Utan avsnitt öppnar arbetsläget
 * sitt första. Valen (typsnitt, färg, ordning) står i adressen med samma
 * namn som exempel-API:t och följer med tillbaka.
 */
export function arbetslageHref(cvId: string, fran: 'mallar' | 'ditt-cv' | 'analys', opts?: { avsnitt?: ArbetsAvsnitt; mall?: string; val?: MallVal }): string {
  const q = new URLSearchParams({ cv: cvId })
  if (opts?.avsnitt) q.set('avsnitt', opts.avsnitt)
  if (opts?.mall) q.set('mall', opts.mall)
  // Valen från Mallar (typsnitt, färg, ordning) följer med, så att arket är detsamma.
  if (opts?.val) valTillQuery(opts.val, q)
  q.set('fran', fran)
  return `/dashboard/skapa-cv?${q.toString()}`
}
