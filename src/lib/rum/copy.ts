// src/lib/rum/copy.ts
//
// Rummens strängar (spec-rummen-2026-10-10 avsnitt 8 och 9, våg 1b).
// Konceptets texter är art-directors utkast och gäller tills
// svensk-ux-copywritern ersatt dem; ordet "Testträning" provas av
// copywritern under bygget (avsnitt 0, beslut 4). Ändra här, aldrig i JSX.

import type { Rum } from './rum'

/** Rummets namn: toppradens brand och sidomenyns grupprubrik. */
export const RUM_NAMN: Record<Rum, string> = {
  tran: 'Träningen',
  cv: 'CV',
  brev: 'Personliga brev',
  jobb: 'Jobbsöket',
  neutral: 'Konto',
}

/** Dörrarnas etiketter, i ordning. Aldrig "Brev" (beslut 4). */
export const DORR_ETIKETT: Record<Exclude<Rum, 'neutral'>, string> = {
  tran: 'Testträning',
  cv: 'CV',
  brev: 'Personliga brev',
  jobb: 'Jobbsöket',
}

/** Grupprubriken ovanför rummets undersidor i sidomenyn. */
export const GRUPP_RUBRIK: Record<Rum, string> = {
  tran: 'I Träningen',
  cv: 'I CV',
  brev: 'I Personliga brev',
  jobb: 'I Jobbsöket',
  neutral: 'I Konto',
}

/** Undersidornas etiketter (spec 4.3). */
export const UNDERSIDA = {
  allaTester: 'Alla tester',
  provlaget: 'Provläget',
  minaCv: 'Mina CV',
  analyseraCv: 'Analysera CV',
  cvMallar: 'CV-mallar',
  linkedin: 'LinkedIn-profilen',
  minaBrev: 'Mina brev',
  skrivNyttBrev: 'Skriv nytt brev',
  oversikt: 'Översikt',
  soktaTjanster: 'Sökta tjänster',
  inforIntervjun: 'Inför intervjun',
  matchadeJobb: 'Matchade jobb',
  jobbcoachen: 'Jobbcoachen',
  bliUpptackt: 'Bli upptäckt',
  profil: 'Profil',
  prenumeration: 'Prenumeration',
  utseende: 'Utseende',
} as const

/** Chip-texter i sidomenyn. */
export const CHIP = {
  nyhet: 'Nyhet',
  nya: (n: number) => `${n} nya`,
  vantar: (n: number) => `${n} väntar`,
  lastEtikett: 'Ingår inte i ditt paket',
} as const

/** Toppraden. */
export const TOPPRAD = {
  kontoKnapp: 'Konto och inställningar',
  stang: 'Stäng',
} as const

/** Navets tillgängliga namn. */
export const NAV = {
  dorrar: 'Rummen',
  sidomeny: 'Sidomeny',
} as const

/** Utseende-väljaren på profilen (spec 4.3 och 9, våg 1b). */
export const UTSEENDE = {
  rubrik: 'Utseende',
  val: {
    system: 'Följer systemet',
    ljust: 'Ljust',
    morkt: 'Mörkt',
  },
} as const

/** Jobbsökets hemvy: knappen som ersätter Skapa-arkets rad (spec 2.1). */
export const JOBBSOK = {
  loggaSoktJobb: 'Logga sökt jobb',
} as const

/** Kontoraden längst ner i sidomenyn. */
export function kontoRad(namn: string, paket: string): string {
  return `${namn} · ${paket}`
}
