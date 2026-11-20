// src/components/publikt/prov/prov-copy.ts
// =============================================================================
// De publika provens ord i sessionsramen (omgång 2 steg C, skissen
// KtViRMpthysT8t34isdnPK rad 11 till 14): provsidan, artikelns provruta och
// registreringens panel. Spärren lovar bara det kontot ger: rätt svar och
// förklaringen per uppgift (genomgången efter kontot), att resultatet sparas
// och Nivåkollen, som är gratis en gång i alla åtta testtyper. Inga
// talstreck, svenska facktermer, uppgift i stället för fråga.
// =============================================================================

import { PROV_COPY, arNyProvTyp, provAntal, type ProvTyp } from '@/lib/tests/prov-typer'
import { antalOrd } from '@/components/session/copy'

/** "regeln", "förklaringen", "lösningen" eller "tekniken" bakom varje uppgift. */
export function forklaringOrd(typ: ProvTyp): string {
  return arNyProvTyp(typ) ? PROV_COPY[typ].forklaring : 'regeln'
}

const FACIT_EYEBROW: Record<string, string> = {
  regeln: 'Facit och regler',
  förklaringen: 'Facit och förklaringar',
  lösningen: 'Facit och lösningar',
  tekniken: 'Facit och teknik',
}

/** Typernas namn som i Tester (sessionsramens TypRitare.namn), för ramens titel och panelen. */
export const PROV_NAMN: Record<ProvTyp, string> = {
  matris: 'Figurer och mönster',
  figurserie: 'Figurserier',
  deduktiv: 'Deduktiv slutledning',
  verbal: 'Ord och text',
  numerisk: 'Siffror och tabeller',
  talserie: 'Talserier',
  spatial: 'Spatial förmåga',
  ordforrad: 'Ordförråd',
  iprov: 'I-provet',
}

/** Ungefärlig tid för hela provet utan klocka, i minuter. */
const MINUTER: Record<ProvTyp, number> = {
  matris: 3,
  figurserie: 3,
  talserie: 3,
  ordforrad: 2,
  spatial: 3,
  iprov: 4,
  verbal: 5,
  deduktiv: 5,
  numerisk: 6,
}

export const PROV_RAM = {
  /** Ramens undertitel: "Prova gratis, fem uppgifter". */
  undertitel: (antal: number) => `Prova gratis, ${antalOrd(antal)} uppgifter`,
  start: {
    regler: (typ: ProvTyp): [{ titel: string; text: string }, { titel: string; text: string }, { titel: string; text: string }] => [
      { titel: `${antalOrd(provAntal(typ), true)} uppgifter, cirka ${antalOrd(MINUTER[typ])} minuter.`, text: 'En i taget, i fast ordning.' },
      { titel: 'Ingen klocka och inga förklaringar under tiden.', text: 'Facit kommer efteråt, som i ett riktigt prov.' },
      {
        titel: 'Efteråt ser du antal rätt och vilka som blev fel.',
        text: `Rätt svar och ${forklaringOrd(typ)} bakom varje uppgift får du med ett gratiskonto.`,
      },
    ],
    knapp: 'Starta provet',
    fotnot: 'Inget konto behövs för att prova.',
    valjTyp: 'Välj typ',
    valjTypAria: 'Välj typ av prov',
  },
  resultat: {
    /** Meningen på väggen under huvudtalet. */
    mening: (typ: ProvTyp, fel: number): string => {
      const facit = `Facit visar ${forklaringOrd(typ)} bakom varje uppgift.`
      if (fel === 0) return `Alla rätt. ${facit}`
      if (fel === 1) return `En uppgift att titta närmare på. ${facit}`
      return `${antalOrd(fel, true)} uppgifter att titta närmare på. ${facit}`
    },
    percentil: (n: number) => `Bland de ${n} procent som löser flest av den här typen av uppgifter.`,
    gorOm: 'Gör om provet',
  },
  sparr: {
    eyebrow: (typ: ProvTyp) => FACIT_EYEBROW[forklaringOrd(typ)] ?? 'Facit',
    titel: (typ: ProvTyp) => `Se rätt svar och ${forklaringOrd(typ)} bakom varje uppgift`,
    text: (antal: number) =>
      `Skapa ett gratiskonto så låser vi upp facit för de här ${antalOrd(antal)} och sparar resultatet. Du kan också göra Nivåkollen i alla åtta testtyper.`,
    textKort: (antal: number) => `Skapa ett gratiskonto så låser vi upp facit för de här ${antalOrd(antal)} och sparar resultatet.`,
    knapp: 'Skapa konto gratis',
    liten: 'Inget kreditkort. Avsluta när du vill.',
    litenKort: 'Inget kreditkort.',
  },
  artikel: {
    eyebrow: 'Prova själv',
    raknare: (nr: number, antal: number) => `Uppgift ${nr} av ${antal}`,
    fot: 'Inget konto behövs.',
    svara: 'Svara',
    visaResultatet: 'Visa resultatet',
    startar: 'Startar provet',
    rattar: 'Rättar provet',
    huvudtal: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
  },
  panel: {
    /** "Ditt prov i talserier". */
    eyebrow: (namn: string) => `Ditt prov i ${namn.toLowerCase()}`,
    eyebrowIprov: 'Ditt prov, I-provet',
    huvudtal: (ratt: number, antal: number) => `${ratt} av ${antal} rätt`,
    fot: (typ: ProvTyp) => `Facit och ${forklaringOrd(typ)} bakom varje uppgift låses upp när kontot är klart.`,
    rad: (nr: number, ratt: boolean) => `Uppgift ${nr}, ${ratt ? 'rätt' : 'fel'}`,
  },
} as const
