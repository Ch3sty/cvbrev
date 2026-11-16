/**
 * Valen i mallflödet som adress och tillbaka (plan-mallar 3.2): provsidan,
 * artikelns "Fortsätt med ditt CV" och /dashboard/cv-mallar bär valet i
 * adressen. Klientsäker, ren data.
 */
import type { MallVal, Ordning, TypsnittId } from '@/lib/cv/mallar/kontrakt'

const ORDNINGAR: readonly Ordning[] = ['standard', 'intyg', 'utbildning', 'kompetenser']
const TYPSNITT: readonly TypsnittId[] = [
  'calibri',
  'arial',
  'verdana',
  'georgia',
  'garamond',
  'times',
  'lato',
  'open-sans',
  'roboto',
  'poppins',
  'helvetica',
]

export function lasOrdning(v: unknown): Ordning | undefined {
  return typeof v === 'string' && (ORDNINGAR as readonly string[]).includes(v) ? (v as Ordning) : undefined
}

export function lasTypsnitt(v: unknown): TypsnittId | undefined {
  return typeof v === 'string' && (TYPSNITT as readonly string[]).includes(v) ? (v as TypsnittId) : undefined
}

/** Bara säkra tecken i ett mall-id eller en uppsättning. */
export function lasId(v: unknown): string | undefined {
  return typeof v === 'string' && /^[a-z0-9-]{1,60}$/.test(v) ? v : undefined
}

/** Valen ur en adress. Okända värden faller bort tyst. */
export function valUrParams(get: (namn: string) => string | null | undefined): MallVal {
  const val: MallVal = {}
  const ordning = lasOrdning(get('ordning'))
  if (ordning) val.ordning = ordning
  const typsnitt = lasTypsnitt(get('typsnitt'))
  if (typsnitt) val.typsnitt = typsnitt
  const farg = Number(get('farg'))
  if (Number.isInteger(farg) && farg >= 0 && farg <= 3) val.farg = farg
  if (get('ensida') === '1') val.enSida = true
  if (get('foto') === '1') val.foto = true
  const uppsattning = lasId(get('uppsattning') ?? get('rubriker'))
  if (uppsattning) val.uppsattning = uppsattning
  return val
}

/** Valen som parametrar, bara de som skiljer sig från förvalet. */
export function valTillParams(val: MallVal, q: URLSearchParams = new URLSearchParams()): URLSearchParams {
  if (val.ordning && val.ordning !== 'standard') q.set('ordning', val.ordning)
  if (val.typsnitt) q.set('typsnitt', val.typsnitt)
  if (typeof val.farg === 'number' && val.farg > 0) q.set('farg', String(val.farg))
  if (val.enSida) q.set('ensida', '1')
  if (val.foto) q.set('foto', '1')
  if (val.uppsattning) q.set('uppsattning', val.uppsattning)
  return q
}

/** Valen som en sträng för A:s rutter (?val=<json>), kort och stabil. */
export function valTillJson(val: MallVal): string {
  const ren: MallVal = {}
  if (val.ordning && val.ordning !== 'standard') ren.ordning = val.ordning
  if (val.typsnitt) ren.typsnitt = val.typsnitt
  if (typeof val.farg === 'number' && val.farg > 0) ren.farg = val.farg
  if (val.enSida) ren.enSida = true
  if (val.foto) ren.foto = true
  if (val.uppsattning) ren.uppsattning = val.uppsattning
  if (val.rubriker && Object.keys(val.rubriker).length > 0) ren.rubriker = val.rubriker
  return JSON.stringify(ren)
}

/** Filnamnsdelen: små bokstäver och bindestreck, å ä ö som a a o. */
export function filnamnsdel(s: string): string {
  return s
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** cv-<mall>-<namn>.<pdf|docx>, som galleriet gjort sedan Word-planen. */
export function filnamn(mallNamn: string, cvNamn: string, format: 'pdf' | 'docx'): string {
  const namn = filnamnsdel(cvNamn) || 'cv'
  return `cv-${filnamnsdel(mallNamn)}-${namn}.${format}`
}
