/**
 * Utkastet på provsidan (plan-mallar 3.2, beslut 2): CV:t besökaren laddat
 * upp eller skrivit ligger bara i hennes webbläsare, i localStorage under
 * jc_cv_prova i 24 timmar. Ingen servertabell. Efter kontot postas det till
 * cv_texts och tas bort här.
 *
 * Alla läsningar och skrivningar i try/catch: privat läge, blockerad lagring
 * och förhandsvisningar ska ge en sida som fungerar utan utkast.
 */
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'

export const UTKAST_NYCKEL = 'jc_cv_prova'
const LIVSLANGD_MS = 24 * 60 * 60 * 1000

export interface ProvaUtkast {
  cv: CVMetadata
  mall: string
  val: MallVal
  /** Filens namn om hon laddade upp, annars null. */
  filnamn: string | null
  /** Vad tolkningen hittade, för raden under dokumentet. */
  hittade?: string[]
  sparad: number
  /** Väntar på att hämtas hem efter kontot: format och om köpet valdes. */
  vantar?: { format: 'pdf' | 'docx'; kop: boolean } | null
}

export function lasUtkast(nu: number = Date.now()): ProvaUtkast | null {
  try {
    const raw = window.localStorage.getItem(UTKAST_NYCKEL)
    if (!raw) return null
    const u = JSON.parse(raw) as ProvaUtkast
    if (!u || typeof u !== 'object' || !u.cv || typeof u.sparad !== 'number') return null
    if (nu - u.sparad > LIVSLANGD_MS) {
      window.localStorage.removeItem(UTKAST_NYCKEL)
      return null
    }
    return u
  } catch {
    return null
  }
}

export function sparaUtkast(u: Omit<ProvaUtkast, 'sparad'>): void {
  try {
    window.localStorage.setItem(UTKAST_NYCKEL, JSON.stringify({ ...u, sparad: Date.now() }))
  } catch {
    // Lagringen är full eller avstängd: sidan fungerar ändå, utkastet följer bara inte med.
  }
}

export function rensaUtkast(): void {
  try {
    window.localStorage.removeItem(UTKAST_NYCKEL)
  } catch {
    // Se ovan.
  }
}

/** Ett tomt CV med namn och titel, för "skriv ditt namn och börja från början". */
export function tomtCv(namn = '', titel = ''): CVMetadata {
  return {
    personalInfo: { fullName: namn, email: '', title: titel },
    experience: [],
    education: [],
    skills: [],
  }
}
