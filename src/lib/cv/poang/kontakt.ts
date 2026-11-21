/**
 * Kontaktuppgifterna som de står på arket (poängmodellen version 2).
 *
 * Arket (förhandsvisningen POST /api/cv/preview-html, arbetslägets första
 * HTML och PDF:en) läser CV:t med normalizeStructuredData och fyller sedan
 * tomma fält och platshållare ur profilen med kontaktForCv
 * (src/lib/cv/forbered-inloggat-cv.ts). Förut läste poängen bara
 * structured_data, så ett CV vars e-post, telefon och ort kom ur profilen
 * fick 2 av 10 fast arket visade allt. Nu använder poängen exakt samma
 * uppslag: det som står på arket är det som poängsätts.
 *
 * Det uppslagna förs aldrig in i CV:t. Det bärs bredvid (arkKontakt i
 * analysens resultat, kontakt på CV-raden) så att inget profilvärde sparas i
 * cv_texts av analysflödet. Klientsäker, rena funktioner.
 */
import { normalizeStructuredData } from '../normalize-structured-data'
import { kontaktForCv, type CvKontakt, type ProfilKontakt } from '@/lib/profile/dokumentKontakt'

/** Namn, e-post, telefon och ort så som arket visar dem. */
export interface ArkKontakt {
  namn: string
  epost: string
  telefon: string
  ort: string
}

/** Profilen (och kontots e-post) som arket fyller kontaktuppgifterna ur. */
export interface KontaktKalla {
  profil: ProfilKontakt
  anvandare?: { email?: string | null } | null
}

/** Kolumnerna i profiles som arket läser (samma som forberedInloggatCv). */
export const PROFIL_KONTAKT_FALT = 'full_name, email, contact_email, phone, location'

/**
 * Arkets kontaktuppgifter ur CV:ts personalInfo och profilen. Samma regel som
 * förhandsvisningen och PDF:en: det som står i CV:t vinner, profilen fyller
 * tomma fält och platshållare. Utan profilrad står CV:ts egna värden kvar.
 */
export function kontaktPaArket(
  personalInfo: CvKontakt,
  profil: ProfilKontakt,
  anvandare?: { email?: string | null } | null,
  kalla: 'strukturerad' | 'text' = 'strukturerad'
): { fullName: string; email: string; phone: string; address: string } {
  if (!profil) {
    return {
      fullName: personalInfo.fullName ?? '',
      email: personalInfo.email ?? '',
      phone: personalInfo.phone ?? '',
      address: (personalInfo.address ?? '') || (personalInfo.location ?? ''),
    }
  }
  return kontaktForCv(personalInfo, profil, anvandare, kalla)
}

/**
 * Kontaktuppgifterna på arket för en lagrad CV-rad, eller null när arket
 * inte går att läsa ur strukturen (då räknar poängen på CV:ts egna fält).
 */
export function arkKontakt(structuredData: unknown, kalla: KontaktKalla | null | undefined): ArkKontakt | null {
  if (!kalla) return null
  const cv = normalizeStructuredData(structuredData)
  if (!cv || !cv.personalInfo) return null
  const k = kontaktPaArket(cv.personalInfo, kalla.profil, kalla.anvandare)
  return { namn: k.fullName, epost: k.email, telefon: k.phone, ort: k.address }
}
