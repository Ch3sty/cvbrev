// src/lib/onboarding/program.ts
//
// Veckoprogrammet och spårvalets texter, en enda sanningskälla
// (docs/plan-paket-och-onboarding.md, Fas 2B och Fas 2C).
//
// Strängarna har sina T-id i kommentar, så att en ändring i planen går att
// hitta i koden och tvärtom. Inga talstreck, inga engelska gränssnittsord.

import type { PlanKey } from '@/lib/plans/plans'

/**
 * Paketnycklarna ägs av plans.ts. Aliaset finns för att onboardingens
 * anropsplatser ska slippa importera två namn för samma sak.
 */
export type PlanKeyPaket = PlanKey

export type Track = 'cv' | 'tester' | 'allt'

/** Spåret som styr veckans dagar. 'allt' kör det spår användaren valde. */
export type WeekTrack = 'cv' | 'tester'

export const TRACKS: readonly Track[] = ['cv', 'tester', 'allt']

export function isTrack(value: unknown): value is Track {
  return typeof value === 'string' && (TRACKS as readonly string[]).includes(value)
}

/* ------------------------------------------------------------------ paket */

export interface PaketInfo {
  key: PlanKeyPaket
  /** Bestämd form, ägarens beslut 6. */
  namn: string
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

export const PAKET: Record<PlanKeyPaket, PaketInfo> = {
  cv_week: {
    key: 'cv_week',
    namn: 'CV-veckan',
    belopp: 79,
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      'Alla 41 CV-mallar',
      'Full CV-analys, alla fynd och poängen',
      'Personligt brev, skrivet och nedladdat',
      'CV-export utan tak, PDF och Word',
    ],
    ingarInte: 'Ingår inte: testnivåer över grundnivån, jobbcoachen, Bli upptäckt.',
    knapp: 'Betala 79 kr',
  },
  test_week: {
    key: 'test_week',
    namn: 'Testveckan',
    belopp: 79,
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      'Alla 19 tester, grundnivå till expert',
      'Tidsatt provläge, automatisk inlämning',
      'Förklaring till varje fråga',
      'Hela din historik, inte bara senaste',
    ],
    ingarInte: 'Ingår inte: CV-mallar utöver de tre fria, full analys, brevet.',
    knapp: 'Betala 79 kr',
  },
  all_day: {
    key: 'all_day',
    namn: 'Allt-dagen',
    belopp: 49,
    // Avsnitt 8: engångsköpet har ingen förnyelse, så raden blir en sluttidsrad.
    intervall: 'Gäller 24 timmar. Inget dras igen.',
    ingar: [
      'Allt i CV-veckan och Testveckan',
      'Alla 25 jobbträffar med skälen',
      'Jobbcoachen utan tak',
      'Ett dygn, ingen prenumeration',
    ],
    knapp: 'Betala 49 kr',
    engangs: true,
  },
  all_week: {
    key: 'all_week',
    namn: 'Allt-veckan',
    belopp: 99,
    intervall: 'Förnyas var sjunde dag tills du säger upp',
    ingar: [
      'Allt i CV-veckan och Testveckan',
      'Alla 25 jobbträffar med skälen',
      'Jobbcoachen utan tak',
      'Bli upptäckt och LinkedIn-optimering',
    ],
    knapp: 'Betala 99 kr',
  },
  all_month: {
    key: 'all_month',
    namn: 'Allt-månaden',
    belopp: 149,
    intervall: 'Förnyas var trettionde dag tills du säger upp',
    ingar: [
      'Allt i Allt-veckan, i trettio dagar',
      'Billigare än fyra veckor i rad',
      'Båda spåren, inget val att göra',
      'Säg upp när som helst, ett klick',
    ],
    knapp: 'Betala 149 kr',
  },
  all_quarter: {
    key: 'all_quarter',
    namn: 'Allt-kvartalet',
    belopp: 299,
    intervall: 'Förnyas var nittionde dag tills du säger upp',
    ingar: [
      'Allt i Allt-veckan, i nittio dagar',
      'Lägsta priset per vecka',
      'Båda spåren, inget val att göra',
      'Säg upp när som helst, ett klick',
    ],
    knapp: 'Betala 299 kr',
  },
}

/** Längderna på Allt, i segmentets ordning. Allt-veckan är förvald. */
export const ALLT_LANGDER: readonly PlanKeyPaket[] = ['all_day', 'all_week', 'all_month', 'all_quarter']

/** Paketet ett spår leder till på steg 2. Allt får sitt via längdvalet. */
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
  gratisNot: 'Gratisnivån ger tre mallar, grundnivån i testerna och ett brev i veckan.', // D2
  kort: {
    cv: {
      titel: 'Få ansökan klar', // T3
      text: 'CV, full analys, mallar och brevet. En ansökan du kan skicka i kväll.', // T4
      meta: 'CV-veckan, 79 kr i veckan', // T5
    },
    tester: {
      titel: 'Klara urvalstestet', // T6
      text: 'Alla nivåer, tidsatt provläge och förklaring till varje fråga du missar.', // T7
      meta: 'Testveckan, 79 kr i veckan', // T8
    },
    allt: {
      titel: 'Både och', // T9
      text: 'Du slipper välja. Har du både ansökan och ett test framför dig, ta den här.', // T10
      // Ägarens beslut 4: fyra längder, så kortet får inte säga 99.
      meta: 'Allt, från 49 kr', // T11
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
    cv: { titel: 'CV och brev', text: 'Vi läser ditt CV och visar vad en rekryterare ser.' }, // D5, D6
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
  langdLabel: 'Längd på Allt',
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

/* -------------------------------- hemskärmen utan köp, T27 till T29 */

export const SPARRAD = {
  cv: {
    beskrivning: 'Vi börjar med ditt CV, så ser du vad en rekryterare ser.', // T27
    rad: 'Du valde CV och brev, så det ligger först här', // T28
    lank: 'Se CV-veckan', // T29
  },
  tester: {
    beskrivning: 'Vi lägger testerna överst, så hittar du dem direkt.', // T27
    rad: 'Du valde urvalstester, så de ligger först här', // T28
    lank: 'Se Testveckan', // T29
  },
  allt: {
    beskrivning: 'Du valde både och, så CV och tester ligger sida vid sida.',
    rad: 'Du valde både och, så båda ligger först här',
    lank: 'Se Allt-veckan',
  },
} as const

/* ------------------------------------- efter köpet, T30 till T36 */

export const KOPT = {
  primar: 'Börja med dag 1', // T34
  helaVeckan: 'Se hela veckan', // T35
  kvitto: 'Kvitto och uppsägning', // T36
  dagEtikett: 'Dag 1 av 7',
} as const

/** T30. Veckopaketen slutar på söndag, längre paket på ett datum. */
export function koptRubrik(paket: PaketInfo, slutDatum: string): string {
  if (paket.engangs) return `Du har ${paket.namn} i ett dygn`
  if (paket.key === 'cv_week' || paket.key === 'test_week' || paket.key === 'all_week') {
    return `Du har ${paket.namn} till söndag`
  }
  return `Du har ${paket.namn} till ${slutDatum}`
}

/** T31. Köp efter klockan 20 svensk tid flyttar dag 1 till morgondagen. */
export function koptIngress(paket: PaketInfo, nastaDragning: string, dagEttIMorgon: boolean): string {
  const dagEtt = dagEttIMorgon ? 'Dag 1 börjar i morgon.' : 'Dag 1 börjar nu.'
  if (paket.engangs) {
    return `${paket.belopp} kr är betalt en gång. Inget dras igen. Kvittot ligger i din mail. ${dagEtt}`
  }
  const takt = paket.key === 'all_month' ? 'var trettionde dag' : paket.key === 'all_quarter' ? 'var nittionde dag' : 'var sjunde dag'
  return `${paket.belopp} kr dras ${takt}, nästa gång ${nastaDragning}, tills du säger upp. Kvittot ligger i din mail. ${dagEtt}`
}

/* --------------------------------- tomma tillstånd, T37 till T43 */

export const TOMT = {
  cvRubrik: 'Vi börjar med ditt CV', // T37
  cvText: 'Ladda upp det du har, hur ofärdigt det än är. Vi läser det och visar vad som saknas.', // T38
  cvFil: 'Välj fil eller dra hit den', // T39
  // T40: taket följer uppladdningsrutten. Se bygg-noter, punkt om filstorleken.
  // Taket följer uppladdningsrutten, som säger 5 MB (verifierat 2026-09-22).
  cvFormat: 'PDF, Word eller text. Högst 5 MB.',
  cvBygg: 'Jag har inget CV, bygg ett åt mig', // T41
  cvPrimar: 'Läs mitt CV', // T42
  testTidigare: 'Vi använde dina tidigare testresultat, så du slipper göra om diagnosen.', // T43
} as const

/* ------------------------------------ veckoprogrammet, T44 till T72 */

export interface Dag {
  dag: number
  titel: string // T45
  text: string // T46
  meta: string // T47
  knapp: string // T48
  href: string
  /** T51 alt: vad som blev gjort, den dagsspecifika kvitteringen. */
  klarTitel: string
  /** T52: vad som skapades och var det finns. */
  klarText: string
  /** T66 till T72: kortform i hoppa-arket. */
  kort: string
}

export const CV_VECKAN: readonly Dag[] = [
  {
    dag: 1,
    titel: 'CV in, analys ut',
    text: 'Ladda upp CV:t, läs hela analysen, välj en mall och ladda ner den.',
    meta: 'Ungefär tjugo minuter',
    knapp: 'Ladda upp CV:t',
    href: '/dashboard/profil/cv',
    klarTitel: 'CV:t är uppe och analyserat',
    klarText: 'Ditt CV och mallen finns under Mina CV.',
    kort: 'CV in, analys ut',
  },
  {
    dag: 2,
    titel: 'Rätta de tyngsta fynden',
    text: 'Ta de tre översta fynden, ett i taget, och kör om analysen efteråt.',
    meta: 'Ungefär femton minuter',
    knapp: 'Öppna analysen',
    href: '/dashboard/cv-analys',
    klarTitel: 'Fynden är rättade',
    klarText: 'Den nya poängen finns under CV-analys.',
    kort: 'Rätta de tyngsta fynden',
  },
  {
    dag: 3,
    titel: 'Brevet till annonsen',
    text: 'Klistra in annonsen du sökte, så läser vi kravprofilen och skriver.',
    meta: 'Ungefär tio minuter',
    knapp: 'Skriv brevet',
    href: '/dashboard/skapa-brev',
    klarTitel: 'Brevet är skrivet',
    klarText: 'Brevet finns under Mina brev.',
    kort: 'Brevet till annonsen',
  },
  {
    dag: 4,
    titel: 'En mall till, för en annan roll',
    text: 'Samma innehåll, annat uttryck. En stramare mall eller en öppnare.',
    meta: 'Under fem minuter',
    knapp: 'Välj en ny mall',
    href: '/dashboard/cv-mallar',
    klarTitel: 'En mall till är nedladdad',
    klarText: 'Båda mallarna finns under Mina CV.',
    kort: 'En mall till',
  },
  {
    dag: 5,
    titel: 'Läsbarheten mot systemen',
    text: 'Vi visar vad som sänker poängen. Oftast tabeller, kolumner eller grafik.',
    meta: 'Ungefär tio minuter',
    knapp: 'Se läsbarhetspoängen',
    href: '/dashboard/cv-analys',
    klarTitel: 'Läsbarheten är kontrollerad',
    klarText: 'Poängen finns under CV-analys.',
    kort: 'Läsbarheten mot systemen',
  },
  {
    dag: 6,
    titel: 'LinkedIn mot samma CV',
    text: 'Ny rubrik, ny om mig-text och kompetenserna som bör ligga överst.',
    meta: 'Ungefär femton minuter',
    knapp: 'Optimera profilen',
    href: '/dashboard/linkedin-optimizer',
    klarTitel: 'Profilen är uppdaterad',
    klarText: 'Förslagen finns under LinkedIn.',
    kort: 'LinkedIn mot samma CV',
  },
  {
    dag: 7,
    titel: 'Veckan sammanställd',
    text: 'Vad du skickat, vad du laddat ner och vad som står kvar till nästa vecka.',
    meta: 'Under fem minuter',
    knapp: 'Se sammanställningen',
    href: '/dashboard',
    klarTitel: 'Veckan är sammanställd',
    klarText: 'Sammanställningen finns här på hemskärmen.',
    kort: 'Veckan sammanställd',
  },
]

export const TEST_VECKAN: readonly Dag[] = [
  {
    dag: 1,
    titel: 'Diagnos och plan',
    text: 'Grundnivå i varje testtyp, sedan lägger vi din träningsplan för veckan.',
    meta: 'Ungefär tjugo minuter',
    knapp: 'Gör diagnostestet',
    href: '/dashboard/tester',
    klarTitel: 'Diagnosen är gjord',
    klarText: 'Din träningsplan finns under Tester.',
    kort: 'Diagnos och plan',
  },
  {
    dag: 2,
    titel: 'Din svagaste typ, en nivå upp',
    text: 'Avancerad nivå där du tappade mest, med förklaring till varje fråga.',
    meta: 'Ungefär tjugo minuter',
    knapp: 'Kör avancerad nivå',
    href: '/dashboard/tester',
    klarTitel: 'Avancerad nivå är körd',
    klarText: 'Resultatet finns under Tester.',
    kort: 'Svagaste typen, en nivå upp',
  },
  {
    dag: 3,
    titel: 'Verbalt, med klockan på',
    text: 'Samma tidspress som i ett skarpt urval, med automatisk inlämning.',
    meta: 'Tjugofem minuter, tidsatt',
    knapp: 'Starta testet',
    href: '/dashboard/tester',
    klarTitel: 'Det verbala testet är inlämnat',
    klarText: 'Resultatet finns under Tester.',
    kort: 'Verbalt, tidsatt',
  },
  {
    dag: 4,
    titel: 'Numeriskt, tidsatt',
    text: 'Tabeller och diagram under tidspress. Läs frågan före tabellen.',
    meta: 'Tjugofem minuter, tidsatt',
    knapp: 'Starta testet',
    href: '/dashboard/tester',
    klarTitel: 'Det numeriska testet är inlämnat',
    klarText: 'Resultatet finns under Tester.',
    kort: 'Numeriskt, tidsatt',
  },
  {
    dag: 5,
    titel: 'Expertnivå i din starkaste typ',
    text: 'Här flyttar du dig från godkänt till särskiljande i ett tätt urval.',
    meta: 'Ungefär tjugo minuter',
    knapp: 'Kör expertnivån',
    href: '/dashboard/tester',
    klarTitel: 'Expertnivån är körd',
    klarText: 'Resultatet finns under Tester.',
    kort: 'Expertnivå i starkaste typen',
  },
  {
    dag: 6,
    titel: 'Fullt prov, skarp tidspress',
    text: 'Alla testtyper i följd, inga pauser, automatisk inlämning. Sitt ostört.',
    meta: 'Fyrtio minuter, tidsatt',
    knapp: 'Starta provet',
    href: '/dashboard/tester',
    klarTitel: 'Provet är inlämnat',
    klarText: 'Hela provet finns under Tester.',
    kort: 'Fullt prov, skarp tidspress',
  },
  {
    dag: 7,
    titel: 'Din utveckling över veckan',
    text: 'Alla sessioner i en kurva, per testtyp. Var du började och var du landade.',
    meta: 'Under fem minuter',
    knapp: 'Se din kurva',
    href: '/dashboard/tester',
    klarTitel: 'Kurvan är klar',
    klarText: 'Utvecklingen finns under Tester.',
    kort: 'Din utveckling över veckan',
  },
]

/**
 * Allt kör det valda spårets vecka, men dag 4 byts mot en handling ur det
 * andra spåret (avsnitt 6). Det är enda stället vi korsar folkgrupperna.
 */
const ALLT_DAG4_CV: Dag = {
  dag: 4,
  titel: 'Ett diagnostest, en gång',
  text: 'Grundnivå i varje testtyp. Du ser var du står innan ett urval gör det.',
  meta: 'Ungefär tjugo minuter',
  knapp: 'Gör diagnostestet',
  href: '/dashboard/tester',
  klarTitel: 'Diagnosen är gjord',
  klarText: 'Resultatet finns under Tester.',
  kort: 'Ett diagnostest',
}

const ALLT_DAG4_TEST: Dag = {
  dag: 4,
  titel: 'En CV-mall, en gång',
  text: 'Samma meriter i en mall som rekryteringssystemen faktiskt läser.',
  meta: 'Under fem minuter',
  knapp: 'Välj en mall',
  href: '/dashboard/cv-mallar',
  klarTitel: 'Mallen är nedladdad',
  klarText: 'Ditt CV finns under Mina CV.',
  kort: 'En CV-mall',
}

/** Veckans sju dagar för ett spår. 'allt' kör weekTrack med korsningen dag 4. */
export function veckansDagar(track: Track, weekTrack: WeekTrack = 'cv'): readonly Dag[] {
  if (track === 'cv') return CV_VECKAN
  if (track === 'tester') return TEST_VECKAN
  const bas = weekTrack === 'tester' ? TEST_VECKAN : CV_VECKAN
  const kors = weekTrack === 'tester' ? ALLT_DAG4_TEST : ALLT_DAG4_CV
  return bas.map((d) => (d.dag === 4 ? kors : d))
}

/** Paketnamnet som veckopanelens etikett, till exempel "CV-VECKAN · DAG 3 AV 7". */
export function veckansNamn(track: Track): string {
  if (track === 'cv') return 'CV-veckan'
  if (track === 'tester') return 'Testveckan'
  return 'Allt-veckan'
}

/** T44: "Dag 3 i CV-veckan. Brevet står på tur." Aldrig hur många dagar som är kvar. */
export function veckoIngress(track: Track, dag: Dag): string {
  return `Dag ${dag.dag} i ${veckansNamn(track)}. ${dag.titel} står på tur.`
}

export const VECKOPANEL = {
  hoppa: 'Hoppa till en annan dag', // T49
  helaVeckan: 'Hela veckan', // T50
  vidare: (n: number) => `Vidare till dag ${n}`, // T53
  klartForIdag: 'Klart för i dag', // T54
  arkRubrik: 'Veckans sju dagar', // T64
  arkText: 'Ordningen är ett förslag. Ta vilken dag du vill, när du vill.', // T65
} as const

/* ------------------------------------------- dag 7, T55 till T63 */

export const DAG7 = {
  cv: {
    rubrik: 'Så här såg din vecka ut', // T55
    tal: ['brev', 'CV', 'mallar', 'dagar'], // T56 till T59
    alltKlart: 'Hela veckan är gjord. Vecka 2 börjar om med ett nytt CV eller en ny annons.',
  },
  tester: {
    rubrik: 'Så här flyttade du dig på sju dagar', // T55
    tal: ['sessioner', 'testtyper', 'prov', 'dagar'], // T56 till T59
    alltKlart: 'Hela veckan är gjord. Vecka 2 går djupare i den typ du tappar mest på.',
  },
  primar: 'Se vecka 2', // T61
  avsluta: 'Avsluta prenumerationen', // T62
} as const

/** T60: vilka dagar som står kvar, och vad de innehåller. */
export function dag7Kvar(dagar: readonly Dag[], klaraDagar: number[], track: WeekTrack): string {
  const kvar = dagar.filter((d) => d.dag < 7 && !klaraDagar.includes(d.dag))
  if (kvar.length === 0) return track === 'tester' ? DAG7.tester.alltKlart : DAG7.cv.alltKlart
  const nummer = kvar.map((d) => d.dag)
  const lista =
    nummer.length === 1
      ? `Dag ${nummer[0]} står kvar.`
      : `Dag ${nummer.slice(0, -1).join(', ')} och ${nummer[nummer.length - 1]} står kvar.`
  return `${lista} ${kvar.map((d) => d.titel).join(', ')}.`
}

/** T63: den varma statusraden på dag 7. */
export function dag7Dragning(belopp: number, datum: string): string {
  return `${belopp} kr dras ${datum}. Säg upp i ditt konto om du är klar.`
}

/* ------------------------------------- fel spår i taket, T73 till T87 */

export const FEL_SPAR = {
  rubrik: 'Du ville ladda ner den här mallen', // T79
  primar: 'Byt till Allt-veckan', // T83
  stang: 'Stäng', // T84
  proration: 'Dagarna du redan betalat för räknas av. Veckan fortsätter som förut.', // T82
  radLank: 'Så får du dem', // T75
} as const

/** T74: radens text per betalt spår. Säger vad paketet ger, inte vad det saknar. */
export function felSparRad(scope: Track): string {
  if (scope === 'tester') {
    return 'Du har Testveckan, som ger alla tester och nivåer. Mallarna ligger i CV-spåret.'
  }
  if (scope === 'cv') {
    return 'Du har CV-veckan, som ger mallar, analys och brev. Testerna ligger i testspåret.'
  }
  return 'Allt-veckan ger båda spåren.'
}

/** T80: kortets brödtext. FS1 alt B och FS2 alt A ur Fas 2B. */
export function felSparText(scope: Track): string {
  if (scope === 'tester') {
    return 'Testveckan är rätt paket för testerna. Byter du till Allt-veckan öppnas mallarna, brevet och analysen.'
  }
  if (scope === 'cv') {
    return 'CV-veckan är rätt paket för ansökan. Byter du till Allt-veckan öppnas alla nivåer, provläget och förklaringen till varje fråga.'
  }
  return 'Allt-veckan öppnar båda spåren.'
}

/** T81: bara mellanskillnaden, aldrig hela priset. */
export function mellanskillnad(kr: number | null): string {
  return kr === null ? 'Bara mellanskillnaden' : `Mellanskillnad, ${kr} kr`
}

export const EFTER_UPPGRADERING = {
  rubrik: 'Du har Allt-veckan nu', // T85
  primar: 'Ladda ner mallen', // T87
} as const

/** T86 */
export function efterUppgraderingText(datum: string): string {
  return `99 kr dras var sjunde dag från ${datum}. Veckan fortsätter på samma dag som förut.`
}
