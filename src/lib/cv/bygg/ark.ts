/**
 * Bladet i adressen (skissen: "ett öppet blad skriver ?ark=erfarenhet:0 så
 * bakåtgesten stänger bladet"). Ren tolkning, klientsäker.
 *
 *   huvud               namn, titel och kontakt
 *   erfarenhet          listan över jobb
 *   erfarenhet:0        ett jobb; erfarenhet:ny ett nytt
 *   utbildning, utbildning:1, utbildning:ny
 *   kompetenser, profil, sprak, intyg, projekt, intressen
 *   fler                "+ Fler avsnitt"
 */
import type { CVMetadata } from '../cv-metadata'
import type { Sektion } from '../mallar/kontrakt'

export type PostSektion = 'erfarenhet' | 'utbildning'
export type HelSektion = 'kompetenser' | 'profil' | 'sprak' | 'intyg' | 'projekt' | 'intressen'

export type ArkVal =
  | { typ: 'huvud' }
  | { typ: 'fler' }
  | { typ: 'lista'; sektion: PostSektion }
  | { typ: 'post'; sektion: PostSektion; index: number | 'ny' }
  | { typ: 'avsnitt'; sektion: HelSektion }

const HELA: readonly string[] = ['kompetenser', 'profil', 'sprak', 'intyg', 'projekt', 'intressen']

export function tolkaArk(v: string | null | undefined): ArkVal | null {
  if (!v) return null
  if (v === 'huvud') return { typ: 'huvud' }
  if (v === 'fler') return { typ: 'fler' }
  const [s, i] = v.split(':')
  if (s === 'erfarenhet' || s === 'utbildning') {
    if (i === undefined) return { typ: 'lista', sektion: s }
    if (i === 'ny') return { typ: 'post', sektion: s, index: 'ny' }
    const n = Number(i)
    return Number.isInteger(n) && n >= 0 && n < 50 ? { typ: 'post', sektion: s, index: n } : null
  }
  if (HELA.includes(s) && i === undefined) return { typ: 'avsnitt', sektion: s as HelSektion }
  return null
}

export function arkNyckel(a: ArkVal): string {
  switch (a.typ) {
    case 'huvud':
    case 'fler':
      return a.typ
    case 'lista':
      return a.sektion
    case 'post':
      return `${a.sektion}:${a.index}`
    case 'avsnitt':
      return a.sektion
  }
}

/** Avsnittet bladet gäller, för kopparramen på arket. */
export function arkSektion(a: ArkVal | null): Sektion | null {
  if (!a || a.typ === 'huvud' || a.typ === 'fler') return null
  return a.sektion
}

/**
 * Bladet ett tryck på arket öppnar: ett tomt jobb- eller utbildningsavsnitt
 * går direkt till ett nytt, ett med en post till den, fler till listan.
 */
export function arkForAvsnitt(cv: CVMetadata, s: Sektion): ArkVal | null {
  if (s === 'erfarenhet' || s === 'utbildning') {
    const lista = s === 'erfarenhet' ? cv.experience ?? [] : cv.education ?? []
    if (lista.length === 0) return { typ: 'post', sektion: s, index: 'ny' }
    if (lista.length === 1) return { typ: 'post', sektion: s, index: 0 }
    return { typ: 'lista', sektion: s }
  }
  if (s === 'referenser') return { typ: 'fler' }
  return { typ: 'avsnitt', sektion: s }
}
