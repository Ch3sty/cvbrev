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

function versal(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}

/** "uppgift 4", "uppgift 4 och 5", "uppgift 2, 4 och 5" (index från 0). */
export function uppgiftLista(index: readonly number[]): string {
  const nr = [...index].sort((a, b) => a - b).map((i) => String(i + 1))
  if (nr.length <= 1) return `uppgift ${nr[0] ?? ''}`.trim()
  return `uppgift ${nr.slice(0, -1).join(', ')} och ${nr[nr.length - 1]}`
}

const ORDNING = ['första', 'andra', 'tredje', 'fjärde', 'femte', 'sjätte']

/**
 * Omgång 3, de publika proven (beslut A, B och G, förlagorna i
 * omgang3-publikt/project): resultatet med ett öppet facit, spärren i tre
 * varianter och löftena som gäller för gratiskontot (gratisniva.ts: ett
 * grundnivåtest om dagen i alla åtta typer, genomgång alltid, Nivåkollen en
 * gång). Inga planlöften, inga priser.
 */
export const PROV3 = {
  eyebrow: 'Provet klart',
  /** Tvåspaltsdomen i det öppna kortet (skissen Publik-prov-resultat-1440). */
  dom: {
    regeln: 'Regeln',
    duValde: (valt: string, ratt: string) => `Du valde ${valt}. Rätt svar är ${ratt}.`,
    duValdeRatt: (valt: string) => `Du valde ${valt}.`,
    duValdeKort: 'Du valde',
    rattKort: 'Rätt',
  },
  /** Väggens mening under huvudtalet. */
  mening: (typ: ProvTyp, variant: 'noll' | 'en' | 'flera', fel: readonly number[]): string => {
    const ord = forklaringOrd(typ)
    if (variant === 'noll') return `Alla rätt. Här nedanför ser du ${ord} bakom en av uppgifterna, som den ser ut i kontot.`
    if (variant === 'en') return `En miss, i ${uppgiftLista(fel)}. Här nedanför ser du hur en förklaring ser ut, på en uppgift du klarade.`
    return `${antalOrd(fel.length, true)} missar. Den första går vi igenom här nedanför, med ${ord} och var det gick snett.`
  },
  remsaTitel: (antal: number) => `Dina ${antalOrd(antal)} uppgifter`,
  remsaHoger: (ratt: number, antal: number) => {
    const fel = antal - ratt
    if (fel === 0) return `alla ${antalOrd(antal)} rätt`
    return `${antalOrd(ratt)} rätt, ${antalOrd(fel)} ${fel === 1 ? 'miss' : 'missar'}`
  },
  remsaRatt: 'Rätt',
  remsaFel: 'Fel',
  /** Rubriken över det öppna facit. */
  oppenRubrik: (typ: ProvTyp, variant: 'noll' | 'en' | 'flera', nr: number) =>
    variant === 'flera' ? 'Din första miss' : `${versal(forklaringOrd(typ))} bakom uppgift ${nr}`,
  oppenHoger: 'Så här ser varje förklaring ut i kontot.',
  kortUppgift: (nr: number) => `Uppgift ${nr}`,
  kortUnder: 'Hela facit, utan konto',
  oppetPiller: 'Öppet facit',
  ratt: 'Rätt',
  fel: 'Fel',
  andraRubrik: (antal: number) => `De andra ${antalOrd(antal)} uppgifterna`,
  andraHoger: (typ: ProvTyp, ratt: number, fel: number) => {
    const Ord = versal(forklaringOrd(typ))
    if (fel === 0) return `Alla rätt. ${Ord} bakom var och en följer med kontot.`
    const missar = `${antalOrd(fel)} ${fel === 1 ? 'miss' : 'missar'}`
    const borjan = ratt === 0 ? versal(missar) : `${antalOrd(ratt, true)} rätt och ${missar}`
    return `${borjan}. ${Ord} bakom ${fel === 1 ? 'missen' : 'missarna'} följer med kontot.`
  },
  radRatt: (typ: ProvTyp) => (typ === 'matris' || typ === 'figurserie' ? 'Du valde rätt figur' : 'Du svarade rätt'),
  radLasFel: (typ: ProvTyp) => `${versal(forklaringOrd(typ))} och ditt misstag`,
  radLasBakom: (typ: ProvTyp) => `${versal(forklaringOrd(typ))} bakom`,
  gorOm: 'Gör om provet',
  lasOm: 'Läs om rekryteringstester',
  loggaIn: 'Logga in',
  harKonto: 'Har du redan ett konto?',
  sparr: {
    eyebrow: 'Med ett gratis konto',
    /** Spärrens rubrik per variant (briefen, Förlagor och texter). */
    rubrik: (typ: ProvTyp, variant: 'noll' | 'en' | 'flera', antalFel: number, antal: number): string => {
      const ord = forklaringOrd(typ)
      if (variant === 'noll') return `${antalOrd(antal, true)} av ${antalOrd(antal)}. Mät din nivå på skalan 1 till 10`
      if (variant === 'en') return `Se ${ord} bakom uppgiften du missade`
      const rest = antalFel - 1
      return rest === 1 ? `Se ${ord} bakom din andra miss` : `Se ${ord} bakom dina ${antalOrd(rest)} andra missar`
    },
    /** Det fasta arket på telefon: noll missar utan "Fem av fem.". */
    arkRubrik: (typ: ProvTyp, variant: 'noll' | 'en' | 'flera', antalFel: number, antal: number): string =>
      variant === 'noll' ? 'Mät din nivå på skalan 1 till 10' : PROV3.sparr.rubrik(typ, variant, antalFel, antal),
    /** Raden över eyebrow: uppgifterna som väntar. */
    vantar: (variant: 'noll' | 'en' | 'flera', lasta: readonly number[]): { fet: string; text: string } | null => {
      if (variant === 'noll' || lasta.length === 0) return null
      const lista = versal(uppgiftLista(lasta))
      return variant === 'en' ? { fet: lista, text: 'din enda miss, väntar på dig' } : { fet: lista, text: 'väntar på dig' }
    },
    /** Artikelns spärr: meningen under rubriken. */
    under: (typ: ProvTyp, variant: 'noll' | 'en' | 'flera', lasta: readonly number[], antal: number): string => {
      if (variant === 'noll') return `Nivåkollen mäter var du står, och kontot visar ${forklaringOrd(typ)} bakom alla ${antalOrd(antal)}.`
      const lista = versal(uppgiftLista(lasta))
      const vantar = `${lista} väntar i kontot, förklarad på samma sätt.`
      return variant === 'en' ? vantar : `Den första ser du här ovanför. ${vantar}`
    },
    knapp: 'Skapa konto gratis',
    knappKort: 'Skapa konto',
    google: 'Fortsätt med Google',
    liten: 'Gratis. Inget kort.',
    litenKort: 'Gratis konto. Inget kort.',
    nivaGrund: 'Grund',
    nivaProv: 'Provens nivå',
    nivaExpert: 'Expert',
    nivaInte: 'inte mätt än',
    nivaDin: 'Din nivå:',
  },
  /** Löftena, sanna för gratiskontot. Ordningen följer varianten. */
  loften: (
    typ: ProvTyp,
    variant: 'noll' | 'en' | 'flera',
    ratt: number,
    antal: number,
    lasta: readonly number[]
  ): { id: 'forklaringar' | 'niva' | 'grund'; titel: string; text: string }[] => {
    const ord = forklaringOrd(typ)
    const Ord = versal(ord)
    const forklaringar = {
      id: 'forklaringar' as const,
      titel: 'Alla förklaringar',
      text:
        variant === 'noll'
          ? `${Ord} bakom alla ${antalOrd(antal)} uppgifter, också de ${antalOrd(antal - 1)} som är stängda här.`
          : variant === 'en'
            ? `${Ord} och ditt misstag i ${uppgiftLista(lasta)}, och ${ord} bakom de ${antalOrd(ratt)} du klarade.`
            : ratt > 0
              ? `${Ord} och ditt misstag i ${uppgiftLista(lasta)}, och ${ord} bakom dem du klarade.`
              : `${Ord} och ditt misstag i ${uppgiftLista(lasta)}.`,
    }
    const niva = { id: 'niva' as const, titel: 'Din nivå på skalan 1 till 10', text: 'Nivåkollen mäter var du står mot provens nivå.' }
    const grund = { id: 'grund' as const, titel: 'Ett test på grundnivån om dagen', text: 'I alla åtta testtyper, med genomgång efteråt.' }
    return variant === 'noll' ? [niva, forklaringar, grund] : [forklaringar, niva, grund]
  },
  artikel: {
    eyebrow: (typ: ProvTyp) => (typ === 'iprov' ? 'Ditt resultat, I-provet' : `Ditt resultat i ${PROV_NAMN[typ].toLowerCase()}`),
    mening: (variant: 'noll' | 'en' | 'flera', fel: readonly number[]): string => {
      if (variant === 'noll') return 'Alla rätt. Här går vi igenom en av uppgifterna.'
      if (variant === 'en') return `En miss, i ${uppgiftLista(fel)}. Här går vi igenom en uppgift du klarade.`
      return `${antalOrd(fel.length, true)} uppgifter att titta närmare på. Den första går vi igenom här.`
    },
    oppenRubrik: (variant: 'noll' | 'en' | 'flera', nr: number) => (variant === 'flera' ? `Uppgift ${nr}, din första miss` : `Uppgift ${nr}`),
    oppenPiller: 'Hela förklaringen',
    /** "Din andra miss", "Din enda miss". */
    missRad: (variant: 'noll' | 'en' | 'flera', ordning: number) => (variant === 'en' ? 'Din enda miss' : `Din ${ORDNING[ordning] ?? `${ordning + 1}:e`} miss`),
  },
  panel: {
    under: 'Resultatet följer med till kontot.',
    oppnas: 'Det här öppnas när kontot är klart',
    chipRatt: 'Rätt',
    chipOppet: 'Öppet',
    chipOppnas: 'Öppnas',
    /** Formulärets rad under "Skapa ditt konto". */
    sedan: (typ: ProvTyp, variant: 'noll' | 'en' | 'flera', lasta: readonly number[], antal: number) =>
      variant === 'noll'
        ? `Sedan öppnas ${forklaringOrd(typ)} bakom alla ${antalOrd(antal)} uppgifter.`
        : `Sedan öppnas ${forklaringOrd(typ)} bakom ${uppgiftLista(lasta)}.`,
    gratis: 'Gratis. Inget kort.',
  },
} as const

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
        titel: 'Efteråt: antal rätt och hela facit på en uppgift.',
        text: `${versal(forklaringOrd(typ))} bakom resten får du med ett gratiskonto.`,
      },
    ],
    knapp: 'Starta provet',
    fotnot: 'Inget konto behövs för att prova.',
    valjTyp: 'Välj typ',
    valjTypRad: 'Fem uppgifter i varje prov, sex i I-provet.',
    valjTypRubrik: 'Vilket test vill du prova?',
    /** Matrisens ingress efter den fetstilta meningen (skissen). */
    ingressMatris: ' Fem uppgifter, inget konto, ingen tidtagning. Resultatet får du direkt.',
    /** Väggens eyebrow: "Figurer och mönster, fem uppgifter". */
    eyebrow: (typ: ProvTyp) => `${PROV_NAMN[typ]}, ${antalOrd(provAntal(typ))} uppgifter`,
    /** Telefonens tre fakta bredvid brädet. */
    fakta: (typ: ProvTyp): [string, string, string] => [`${antalOrd(provAntal(typ), true)} uppgifter`, `Cirka ${antalOrd(MINUTER[typ])} minuter`, 'Inget konto'],
    merFore: 'Vill du veta mer om hur testerna fungerar?',
    merLank: 'Läs om rekryteringstester',
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
