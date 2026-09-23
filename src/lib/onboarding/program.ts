// src/lib/onboarding/program.ts
//
// Paketens och spårvalets texter, en enda sanningskälla
// (docs/plan-paket-och-onboarding.md, Fas 2B och Fas 2C).
//
// Strängarna har sina T-id i kommentar, så att en ändring i planen går att
// hitta i koden och tvärtom. Inga talstreck, inga engelska gränssnittsord.

import { PLAN_BY_KEY, paketMedPris, paketNamn, type PlanKey } from '@/lib/plans/plans'
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'

/** Namnen ur PLANS (beslut-paketnamn 2026-09-24), aldrig som fasta strängar. */
const CV_NAMN = paketNamn('cv_week')
const TRANING_NAMN = paketNamn('test_week')
const HELA_NAMN = paketNamn('all_week')

/**
 * Paketnycklarna ägs av plans.ts. Aliaset finns för att onboardingens
 * anropsplatser ska slippa importera två namn för samma sak.
 */
export type PlanKeyPaket = PlanKey

export type Track = 'cv' | 'tester' | 'allt'

export const TRACKS: readonly Track[] = ['cv', 'tester', 'allt']

export function isTrack(value: unknown): value is Track {
  return typeof value === 'string' && (TRACKS as readonly string[]).includes(value)
}

/* ------------------------------------------------------------------ paket */

export interface PaketInfo {
  key: PlanKeyPaket
  /** Bestämd form, ägarens beslut 6. Ur PLANS. */
  namn: string
  /** Ur PLANS. */
  belopp: number
  /** T16: förnyelseraden, eller sluttidsraden för engångsköpet. */
  intervall: string
  /** T17 till T20 */
  ingar: readonly string[]
  /** T21. Bara spårpaketen har raden. */
  ingarInte?: string
  /** T25 */
  knapp: string
  engangs?: boolean
}

/** Namn och belopp ur PLANS; det här är bara onboardingens egna rader. */
function paket(key: PlanKeyPaket, rest: Omit<PaketInfo, 'key' | 'namn' | 'belopp' | 'knapp'>): PaketInfo {
  const p = PLAN_BY_KEY[key]
  return { key, namn: p.name, belopp: p.amount, knapp: `Betala ${p.amount} kr`, ...rest }
}

export const PAKET: Record<PlanKeyPaket, PaketInfo> = {
  cv_week: paket('cv_week', {
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      `Alla ${TEMPLATE_COUNT} CV-mallar`,
      'Full CV-analys, alla fynd och poängen',
      'Personliga brev, skrivna och nedladdade',
      'CV-export utan tak, PDF och Word',
    ],
    ingarInte: 'Ingår inte: testnivåer över grundnivån, Jobbcoachen, Bli upptäckt.',
  }),
  test_week: paket('test_week', {
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      'Alla 19 tester, grundnivå till expert',
      'Tidsatt provläge, automatisk inlämning',
      'Fördjupade personlighetstestet, 120 påståenden',
      'Hela din historik, inte bara senaste',
    ],
    ingarInte: 'Ingår inte: CV-mallar utöver de tre fria, full analys, personliga brev.',
  }),
  all_day: paket('all_day', {
    // Avsnitt 8: engångsköpet har ingen förnyelse, så raden blir en sluttidsrad.
    intervall: 'Gäller 24 timmar. Inget dras igen.',
    ingar: [
      'Alla 25 jobbträffar med skälen',
      'Jobbcoachen, så mycket du vill',
      `Allt i ${CV_NAMN} och ${TRANING_NAMN}`,
      'Ett dygn, ingen prenumeration',
    ],
    engangs: true,
  }),
  all_week: paket('all_week', {
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      'Alla 25 jobbträffar med skälen',
      'Jobbcoachen, så mycket du vill',
      'Bli upptäckt och LinkedIn-optimering',
      `Allt i ${CV_NAMN} och ${TRANING_NAMN}`,
    ],
  }),
  all_month: paket('all_month', {
    intervall: 'Förnyas var trettionde dag tills du säger upp',
    ingar: [
      'Jobbmatchning, Jobbcoachen och Bli upptäckt, i trettio dagar',
      'Billigare än fyra veckor i rad',
      `Allt i ${CV_NAMN} och ${TRANING_NAMN}`,
      'Säg upp när som helst, ett klick',
    ],
  }),
  all_quarter: paket('all_quarter', {
    intervall: 'Förnyas var nittionde dag tills du säger upp',
    ingar: [
      'Jobbmatchning, Jobbcoachen och Bli upptäckt, i nittio dagar',
      'Lägsta priset per vecka',
      `Allt i ${CV_NAMN} och ${TRANING_NAMN}`,
      'Säg upp när som helst, ett klick',
    ],
  }),
}

/** Hela paketets längder, i segmentets ordning. Veckan är förvald. */
export const ALLT_LANGDER: readonly PlanKeyPaket[] = ['all_day', 'all_week', 'all_month', 'all_quarter']

/** Paketet ett spår leder till på steg 2. Hela paketet får sitt via längdvalet. */
export function paketForTrack(track: Track, langd: PlanKeyPaket = 'all_week'): PaketInfo {
  if (track === 'cv') return PAKET.cv_week
  if (track === 'tester') return PAKET.test_week
  return PAKET[langd]
}

/* --------------------------------------------------- spårvalet, T1 till T13 */

export const SPARVAL = {
  fraga: 'Vad ska du få gjort den här veckan?', // T1
  ingress: 'Valet styr vad vi visar först. Du kan ändra det när du vill i din profil.', // T2
  hoppaOver: 'Jag vet inte än', // T12
  primar: 'Se vad det kostar', // T13
  /** Fas 2D, D1 och D2: Börja gratis som fullvärdigt val i foten. */
  gratisKnapp: 'Börja gratis', // D1
  gratisNot: 'Gratisnivån ger tre mallar, grundnivån i testerna och ett personligt brev i veckan.', // D2
  kort: {
    cv: {
      titel: 'Få ansökan klar', // T3
      text: 'CV, full analys, mallar och det personliga brevet. En ansökan du kan skicka i kväll.', // T4
      meta: paketMedPris('cv_week'), // T5
    },
    tester: {
      titel: 'Klara urvalstestet', // T6
      text: 'Alla nivåer, tidsatt provläge och förklaring till varje fråga du missar.', // T7
      meta: paketMedPris('test_week'), // T8
    },
    allt: {
      titel: 'Både och', // T9
      text: 'Du slipper välja. Har du både ansökan och ett test framför dig, ta den här.', // T10
      // Ägarens beslut 4: fyra längder, så kortet får inte säga 99.
      meta: `${HELA_NAMN}, från ${PLAN_BY_KEY.all_day.amount} kr`, // T11
    },
  },
} as const

/* ------------------------------ gratisanvändarens spårfråga, Fas 2D skärm 1.1b */

export const SPARVAL_GRATIS = {
  steg: 'Sista steget',
  fraga: 'Vad vill du börja med?', // D3
  ingress: 'Vi lägger det du väljer överst på hemskärmen. Inget kostar något.', // D4
  primar: 'Till hemskärmen', // D11
  kort: {
    cv: { titel: 'CV och personliga brev', text: 'Vi läser ditt CV och visar vad en rekryterare ser.' }, // D5, D6
    tester: { titel: 'Urvalstester', text: 'Grundnivån i varje testtyp ligger öppen.' }, // D7, D8
    ingen: { titel: 'Jag vet inte än', text: 'Då visar vi hemskärmen som den är.' }, // D9, D10
  },
} as const

/* --------------------------------------------- paketskärmen, T14 till T26 */

export const PAKETSKARM = {
  fraga: 'Så här ser veckan ut', // T14
  bytPaket: 'Byt paket', // T24
  kvitto: 'Kvittot skickas till din e-post direkt efter betalningen.', // T26
  // T23, kortad mot K1. Lagkravsstyrd, ändras bara mot avsnitt 8.
  samtycke:
    'Starta direkt. Jag förstår att ångerrätten på fjorton dagar inte gäller när innehållet påbörjats.',
  samtyckeHjalp: 'Kryssar du inte i får du tillgång först efter fjorton dagar.', // K2
  samtyckeSpärr: 'Kryssa i rutan ovanför för att fortsätta.',
  langdLabel: `Längd på ${HELA_NAMN}`,
  // D48b, dirigentens beslut 2026-09-22: dygnet är ett engångsköp och går
  // inte att lägga ovanpå en löpande prenumeration. Raden säger varför i
  // stället för att lämna en spärrad knapp oförklarad.
  dagSpärrad: 'Dagen är ett engångsköp och går inte att kombinera med din prenumeration.',
} as const

/** T22, förnyelseraden. Engångsköpet får sluttidsraden i stället. */
export function fornyelserad(paket: PaketInfo, datum: string): string {
  if (paket.engangs) {
    return `Dygnet tar slut ${datum}. Inget dras igen och det finns inget att säga upp.`
  }
  return `Nästa dragning ${datum}. Säg upp när som helst i ditt konto, utan skäl.`
}

/* ------------------------------------ fel paket i taket, T73 till T87 */

export const FEL_SPAR = {
  rubrik: 'Du ville ladda ner den här mallen', // T79
  primar: `Byt till ${HELA_NAMN}`, // T83, utan belopp: se felSparKnapp
  stang: 'Stäng', // T84
  proration: 'Dagarna du redan betalat för räknas av. Veckan fortsätter som förut.', // T82
  radLank: 'Så får du dem', // T75
} as const

/**
 * T79 per funktion. Rubriken sade alltid mallen, också när det var en
 * testnivå i taket (D2, de gråade valen). Nu följer den featuren.
 */
export function felSparRubrik(feature: string | null | undefined): string {
  switch (feature) {
    case 'tests_above_base':
      return 'Du ville köra den här nivån'
    case 'test_exam_mode':
      return 'Du ville köra provläget'
    case 'test_history':
      return 'Du ville se din utveckling'
    case 'chat_unlimited':
      return 'Du ville fråga jobbcoachen'
    case 'job_matches_all':
      return 'Du ville se alla träffar'
    case 'bli_upptackt':
      return 'Du ville bli upptäckt'
    case 'cv_export':
      return 'Du ville ladda ner det här'
    case 'letter_download':
      return 'Du ville ladda ner brevet'
    case 'cv_analysis_full':
      return 'Du ville se hela analysen'
    default:
      return FEL_SPAR.rubrik
  }
}

/** T74: radens text per betalt paket. Säger vad paketet ger, inte vad det saknar. */
export function felSparRad(scope: Track): string {
  if (scope === 'tester') {
    return `Du har ${TRANING_NAMN}, som ger alla tester och nivåer. Mallarna ligger i ${CV_NAMN}.`
  }
  if (scope === 'cv') {
    return `Du har ${CV_NAMN}, som ger mallar, analys och personliga brev. Testerna ligger i ${TRANING_NAMN}.`
  }
  return `${HELA_NAMN} ger allt.`
}

/** T80: kortets brödtext. FS1 alt B och FS2 alt A ur Fas 2B. */
export function felSparText(scope: Track): string {
  if (scope === 'tester') {
    return `${TRANING_NAMN} är rätt paket för testerna. Byter du till ${HELA_NAMN} öppnas mallarna, de personliga breven och analysen.`
  }
  if (scope === 'cv') {
    return `${CV_NAMN} är rätt paket för ansökan. Byter du till ${HELA_NAMN} öppnas alla nivåer, provläget och förklaringen till varje fråga.`
  }
  return `${HELA_NAMN} öppnar allt.`
}

/**
 * T83 med belopp (R1): knappen bär mellanskillnaden, som är det som dras,
 * aldrig hela veckopriset.
 */
export function felSparKnapp(kr: number | null): string {
  return kr === null ? FEL_SPAR.primar : `${FEL_SPAR.primar}, ${kr} kr till i veckan`
}

/** T81: bara mellanskillnaden, aldrig hela priset. */
export function mellanskillnad(kr: number | null): string {
  return kr === null ? 'Bara mellanskillnaden' : `Mellanskillnad, ${kr} kr`
}

export const EFTER_UPPGRADERING = {
  rubrik: `Du har ${HELA_NAMN} nu`, // T85
  primar: 'Ladda ner mallen', // T87
} as const

/** T86 */
export function efterUppgraderingText(datum: string): string {
  return `${PLAN_BY_KEY.all_week.amount} kr dras var sjunde dag från ${datum}. Veckan fortsätter på samma dag som förut.`
}
