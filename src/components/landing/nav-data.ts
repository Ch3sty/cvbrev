/**
 * Den publika navigationens innehåll (docs/design/analys-visuell-linje-2026-09-22.html,
 * avsnitt 5): headerns fem val, megamenyns tre grupper och footerns kolumner.
 *
 * Samma tre grupper som sidomenyn i inloggat läge (Skriv och förbättra, Hitta
 * jobb, Träna), så att besökaren känner igen strukturen efter registreringen.
 * En fil, så att headern, mobilmenyn och footern inte glider isär.
 *
 * Ren data, inga komponenter: ikonerna anges som nyckel och slås upp där de
 * ritas, så att filen kan läsas av både server- och klientkomponenter.
 */

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

export interface NavLank {
  label: string
  href: string
  ikon?: NavIkon
}

export interface NavGrupp {
  rubrik: string
  lankar: readonly NavLank[]
}

/** Headerns val. "Vad vi erbjuder" öppnar megamenyn och står mellan Priser och Artiklar. */
export const HEADER_FORE: readonly NavLank[] = [
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Priser', href: '/priser' },
]
export const HEADER_EFTER: readonly NavLank[] = [
  { label: 'Artiklar', href: '/artiklar' },
  { label: 'Om oss', href: '/om-oss' },
]

export const GRUPPER: readonly NavGrupp[] = [
  {
    rubrik: 'Skriv och förbättra',
    lankar: [
      { label: 'Personligt brev', href: '/verktyg/personligt-brev', ikon: 'brev' },
      { label: 'CV-analys', href: '/verktyg/cv-analys', ikon: 'analys' },
      { label: 'Skapa CV', href: '/verktyg/skapa-cv', ikon: 'cv' },
      { label: 'CV-mallar', href: '/verktyg/cv-mallar', ikon: 'mallar' },
      { label: 'LinkedIn-profilen', href: '/verktyg/linkedin-optimering', ikon: 'lank' },
    ],
  },
  {
    rubrik: 'Hitta jobb',
    lankar: [
      { label: 'Jobbmatchning', href: '/verktyg/jobbmatchning', ikon: 'matchning' },
      { label: 'Bli upptäckt', href: '/verktyg/bli-upptackt', ikon: 'synlig' },
    ],
  },
  {
    rubrik: 'Träna',
    lankar: [
      { label: 'Rekryteringstester', href: '/verktyg/rekryteringstester', ikon: 'tester' },
      { label: 'Jobbcoachen', href: '/verktyg/jobbcoachen', ikon: 'coach' },
      { label: 'Räkna ut lön och skatt', href: '/rakna-ut', ikon: 'krona' },
    ],
  },
]

/** Footerns fjärde kolumn. Exempel och yrkesmallar står här så att länkarna från headern inte försvinner ur ramen. */
export const LAS: NavGrupp = {
  rubrik: 'Läs',
  lankar: [
    { label: 'Artiklar', href: '/artiklar' },
    { label: 'CV-exempel', href: '/cv-exempel' },
    { label: 'Personligt brev-exempel', href: '/personligt-brev-exempel' },
    { label: 'CV-mallar per yrke', href: '/cv-mallar' },
    { label: 'Exempel och mallar', href: '/exempel' },
    { label: 'Insikter för rekryterare', href: '/for-rekryterare/insikter' },
    { label: 'Priser', href: '/priser' },
  ],
}

/** Footerns första kolumn under varumärket. */
export const FORETAG: readonly NavLank[] = [
  { label: 'Om oss', href: '/om-oss' },
  { label: 'Funktioner', href: '/funktioner' },
  { label: 'Kontakt', href: '/kontakt' },
  { label: 'Hjälpcenter', href: '/hjalpcenter' },
  { label: 'För rekryterare', href: '/for-rekryterare' },
]
