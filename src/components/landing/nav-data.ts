/**
 * Den publika navigationens innehåll: headerns fem val, menyns fyra delar
 * och fotens kolumner. En fil, så att headern, telefonmenyn och foten inte
 * glider isär.
 *
 * Publikt omgång 3 (2026-11-22, skissen docs/design/publikt-omgang3/sidor/meny.html,
 * textbeslut NAV-1, byggbriefens beslut 1 och 2): fyra delar i samma ordning
 * och färger som inloggat, Rekryteringstester först. Dagens ankartexter står
 * kvar (de är sidornas primärord, seo-krav.md "Menyn och foten"). Priser har
 * egen länk i headern och foten. Jobbcoachen står under Jobbsöket.
 * Jobbkartan, Räkna ut lön och skatt och För rekryterare står utanför delarna.
 *
 * Ren data, inga komponenter: läses av både server- och klientkomponenter.
 * Raden under varje länk i menyn räknas ur konstanter i LandingNavbarMega.tsx
 * (servern), så att talen inte drar in data i klientens JavaScript.
 */

import type { Farg } from '@/components/publikt/v3/farg'

/** Ikonnycklar som NavIkon.tsx kan rita (kvar för den som vill ha dem). */
export type NavIkon =
  | 'brev'
  | 'analys'
  | 'cv'
  | 'mallar'
  | 'lank'
  | 'matchning'
  | 'synlig'
  | 'tester'
  | 'coach'
  | 'krona'
  | 'karta'

export interface NavLank {
  label: string
  href: string
  ikon?: NavIkon
  /** Märket Nyhet efter länken. */
  nyhet?: boolean
}

export interface NavDel {
  farg: Exclude<Farg, 'neutral'>
  rubrik: string
  /** Delens huvudsida: huvudet i menyn är en länk dit. */
  href: string
  lankar: readonly NavLank[]
}

/** Den nya sidan för Sökta tjänster (byggs av P4 i omgång 3). */
export const SOKTA_TJANSTER_HREF = '/verktyg/sokta-tjanster'

/** Headerns val. "Vad vi erbjuder" öppnar menyn och står mellan Priser och Artiklar. */
export const HEADER_FORE: readonly NavLank[] = [
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Priser', href: '/priser' },
]
export const HEADER_EFTER: readonly NavLank[] = [
  { label: 'Artiklar', href: '/artiklar' },
  { label: 'Om oss', href: '/om-oss' },
]

/** Menyns fyra delar (NAV-1), testerna först. */
export const DELAR: readonly NavDel[] = [
  {
    farg: 'tran',
    rubrik: 'Rekryteringstester',
    href: '/verktyg/rekryteringstester',
    lankar: [
      { label: 'Rekryteringstester', href: '/verktyg/rekryteringstester', ikon: 'tester' },
      { label: 'Personlighetstest', href: '/verktyg/personlighetstest' },
    ],
  },
  {
    farg: 'cv',
    rubrik: 'CV',
    href: '/verktyg/cv-analys',
    lankar: [
      { label: 'CV-analys', href: '/verktyg/cv-analys', ikon: 'analys' },
      { label: 'Skapa CV', href: '/verktyg/skapa-cv', ikon: 'cv' },
      { label: 'CV-mallar', href: '/cv-mallar', ikon: 'mallar' },
      { label: 'LinkedIn-profilen', href: '/verktyg/linkedin-optimering', ikon: 'lank' },
    ],
  },
  {
    farg: 'brev',
    rubrik: 'Personliga brev',
    href: '/verktyg/personligt-brev',
    lankar: [
      { label: 'Personligt brev', href: '/verktyg/personligt-brev', ikon: 'brev' },
      { label: 'Personligt brev-exempel', href: '/personligt-brev-exempel' },
    ],
  },
  {
    farg: 'jobb',
    rubrik: 'Jobbsöket',
    href: '/verktyg/jobbmatchning',
    lankar: [
      { label: 'Jobbmatchning', href: '/verktyg/jobbmatchning', ikon: 'matchning' },
      // Märket Nyhet tas bort 2027-01-12 (SEO:s slutbesked punkt 24).
      { label: 'Sökta tjänster', href: SOKTA_TJANSTER_HREF, nyhet: true },
      { label: 'Jobbcoachen', href: '/verktyg/jobbcoachen', ikon: 'coach' },
      { label: 'Bli upptäckt', href: '/verktyg/bli-upptackt', ikon: 'synlig' },
    ],
  },
]

/** Utanför delarna, i menyns fot. */
export const MER: readonly NavLank[] = [
  { label: 'Alla funktioner', href: '/funktioner' },
  { label: 'Jobbkartan', href: '/jobbkartan', ikon: 'karta' },
  { label: 'Räkna ut lön och skatt', href: '/rakna-ut', ikon: 'krona' },
  { label: 'För rekryterare', href: '/for-rekryterare' },
]

/**
 * Telefonmenyns rutor under delarna: headerns val och det som står utanför
 * delarna. Alla funktioner står inte här, Funktioner gör samma sak.
 */
export const TELEFON_MER: readonly NavLank[] = [
  ...HEADER_FORE,
  ...HEADER_EFTER,
  { label: 'Jobbkartan', href: '/jobbkartan' },
  { label: 'För rekryterare', href: '/for-rekryterare' },
  { label: 'Räkna ut lön och skatt', href: '/rakna-ut' },
]

/**
 * Fotens fyra kolumner: delarnas länkar plus exempel, mallar per yrke och
 * Jobbsökets verktyg utanför menyn. Ingen länk från dagens fot försvinner
 * (jämfört mot GRUPPER, LAS och FORETAG före omgång 3).
 */
export const FOT_DELAR: readonly NavDel[] = [
  DELAR[0],
  {
    ...DELAR[1],
    lankar: [
      { label: 'CV-analys', href: '/verktyg/cv-analys' },
      { label: 'Skapa CV', href: '/verktyg/skapa-cv' },
      { label: 'CV-mallar', href: '/cv-mallar' },
      { label: 'CV-exempel', href: '/cv-exempel' },
      // SEO:s slutbesked punkt 26: avsnittet "CV-mallar för ditt yrke" har id="yrken".
      { label: 'CV-mallar per yrke', href: '/cv-mallar#yrken' },
      { label: 'LinkedIn-profilen', href: '/verktyg/linkedin-optimering' },
    ],
  },
  {
    ...DELAR[2],
    lankar: [...DELAR[2].lankar, { label: 'Exempel och mallar', href: '/exempel' }],
  },
  {
    ...DELAR[3],
    lankar: [
      ...DELAR[3].lankar.map(({ label, href }) => ({ label, href })),
      { label: 'Jobbkartan', href: '/jobbkartan' },
      { label: 'Räkna ut lön och skatt', href: '/rakna-ut' },
    ],
  },
]

/** Fotens första kolumn under varumärket. */
export const FORETAG: readonly NavLank[] = [
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Priser', href: '/priser' },
  { label: 'Artiklar', href: '/artiklar' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Hjälpcenter', href: '/hjalpcenter' },
  { label: 'För rekryterare', href: '/for-rekryterare' },
  { label: 'Insikter för rekryterare', href: '/for-rekryterare/insikter' },
]
