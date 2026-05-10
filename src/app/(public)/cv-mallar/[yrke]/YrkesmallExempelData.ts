/**
 * Generisk exempel-CV-data fOr yrkesmall-sidan.
 *
 * Anvands i den interaktiva mall-preview-komponenten. Datan ar inte
 * yrkes-unik utan en bas-mock som anpassas via yrket (titel, plats).
 * For mer detaljerade yrkes-specifika exempel finns /cv-exempel/[yrke].
 */

export interface YrkesmallExempelCV {
  namn: string
  titel: string
  kontakt: {
    telefon: string
    epost: string
    plats: string
    linkedin?: string
  }
  profil: string
  erfarenhet: Array<{
    titel: string
    arbetsgivare: string
    period: string
    beskrivning: string[]
  }>
  utbildning: Array<{
    titel: string
    skola: string
    period: string
    beskrivning?: string
  }>
  kompetenser: {
    tekniska: string[]
    personliga: string[]
  }
  certifieringar: string[]
  sprak: Array<{
    sprak: string
    niva: string
  }>
}

/**
 * Bygger en generisk exempel-CV anpassad fOr ett yrke.
 * Yrkesnamnet anvands som titel + i profil-paragrafen.
 */
export function buildYrkesmallExempelCV(
  yrkesNamn: string,
  kompetenser: { tekniska: string[]; personliga: string[] }
): YrkesmallExempelCV {
  const yrkesNamnLower = yrkesNamn.toLowerCase()

  return {
    namn: 'Anna Lindström',
    titel: yrkesNamn,
    kontakt: {
      telefon: '070-123 45 67',
      epost: 'anna.lindstrom@email.se',
      plats: 'Stockholm',
      linkedin: 'linkedin.com/in/annalindstrom',
    },
    profil: `Erfaren ${yrkesNamnLower} med flera års erfarenhet inom branschen. Arbetar strukturerat och resultatinriktat med fokus på kvalitet och kundnöjdhet. Söker nya utmaningar i en organisation som värderar utveckling och kollegialt samarbete.`,
    erfarenhet: [
      {
        titel: yrkesNamn,
        arbetsgivare: 'Företag AB',
        period: '2021 – Pågående',
        beskrivning: [
          `Ansvarig för operativa uppgifter inom ${yrkesNamnLower}-rollen med fokus på kvalitet och effektivitet`,
          'Samarbetade tvärfunktionellt med team om 8-12 personer för att leverera projekt i tid',
          'Implementerade nya rutiner som ökade produktiviteten med 20% under första året',
          'Mentor för nya kollegor under introduktionsperiod och löpande kompetensutveckling',
        ],
      },
      {
        titel: `Junior ${yrkesNamn}`,
        arbetsgivare: 'Branschföretag i Sverige AB',
        period: '2018 – 2021',
        beskrivning: [
          `Lärde dig grunderna inom ${yrkesNamnLower}-rollen genom strukturerad upplärning och eget ansvar`,
          'Hanterade dagliga uppgifter självständigt och rapporterade direkt till operativ chef',
          'Bidrog till att förbättra interna processer genom dokumentation och förslag på effektiviseringar',
        ],
      },
    ],
    utbildning: [
      {
        titel: `Utbildning inom ${yrkesNamnLower}`,
        skola: 'Yrkeshögskolan Stockholm',
        period: '2016 – 2018',
        beskrivning: 'Praktikperioder hos branschledande arbetsgivare under utbildningstiden.',
      },
    ],
    kompetenser: {
      tekniska: kompetenser.tekniska.slice(0, 7),
      personliga: kompetenser.personliga.slice(0, 5),
    },
    certifieringar: [],
    sprak: [
      { sprak: 'Svenska', niva: 'Modersmål' },
      { sprak: 'Engelska', niva: 'Flytande' },
    ],
  }
}
