/**
 * Registreringstrattens strängar, ordagrant ur designfilens tabell "Alla
 * strängar på ett ställe" (docs/design/profil-registrering-2026-09-24.html).
 *
 * Paketnamn och priser läses alltid ur PLANS via paketNamn() och
 * paketMedPris(), aldrig som fasta strängar. Inga talstreck, "personliga
 * brev" och aldrig "spår" publikt.
 */

import { PROV_COPY, type NyProvTyp } from '@/lib/tests/prov-typer'
import { SALD_PLAN, kopKnapp, paketKort, prisPeriod, type PlanKey } from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import type { SignupIntent, SmakprovTyp } from './intent'

/* ------------------------------------------------------------ skalet */

export const SKAL = {
  loggaIn: 'Logga in',
  harKonto: 'Har du redan ett konto?',
  skapaKonto: 'Skapa konto',
  tillbaka: 'Föregående steg',
  hem: 'Till startsidan',
} as const

/* ------------------------------------------------------------ steg 1 */

export const STEG1 = {
  steg: 'Steg 1 av 3',
  fraga: 'Vad vill du börja med?',
  under:
    'Vi öppnar rätt verktyg när kontot är klart. Allt annat finns i menyn, och det mesta går att prova gratis.',
  hoppaOver: 'Hoppa över och skapa konto direkt',
  fortsatt: 'Fortsätt',
  fotnot: 'Gratis att börja. Inget kort behövs.',
  sparr: 'Välj vad du vill börja med, eller hoppa över.',
  kort: {
    cv: {
      titel: 'Skriva CV',
      text: 'Bygg det steg för steg eller ladda upp ditt gamla och se vad rekryteraren ser.',
    },
    brev: {
      titel: 'Skriva personliga brev',
      text: 'Klistra in annonsen, så skriver vi brevet utifrån ditt CV.',
    },
    tester: {
      titel: 'Klara rekryteringstesterna',
      text: 'Matrislogik, verbalt, numeriskt och personlighet, med förklaring efter varje fråga.',
    },
    intervju: {
      titel: 'Förbereda intervjun',
      text: 'Svara på en vanlig intervjufråga och få återkoppling som från en rekryterare.',
    },
    jobb: {
      titel: 'Hitta jobb att söka',
      text: 'Vi matchar ditt CV mot lediga jobb varje natt och skriver varför de passar.',
    },
  } satisfies Record<SignupIntent, { titel: string; text: string }>,
} as const

/* ------------------------------------------------------------ steg 2 */

export const STEG2 = {
  topp: 'Skapa konto',
  steg: 'Steg 2 av 3',
  rubrik: 'Skapa ditt konto',
  /** Kontosteget efter provet när allt var rätt: inget att missa. */
  rubrikAllaRatt: 'Se regeln bakom varje mönster',
  /** Skissen 2026-11-09: den fetstilta delen står i positiv färg. */
  underFet: 'Gratis konto, inget kreditkort.',
  under: 'Gratis konto, inget kreditkort. Klart på en minut.',
  google: 'Fortsätt med Google',
  googleOppnar: 'Öppnar Google',
  googleFel: 'Google-inloggningen gick inte att starta. Försök igen.',
  eller: 'eller med e-post',
  epost: 'E-post',
  epostPlats: 'namn@exempel.se',
  losen: 'Lösenord',
  losenPlats: 'Minst 8 tecken',
  villkorFore: 'Genom att skapa konto godkänner du våra ',
  villkorLank: 'användarvillkor',
  villkorMitt: ' och vår ',
  integritetLank: 'integritetspolicy',
  villkorEfter: '.',
  primar: 'Skapa konto',
  busy: 'Skapar kontot',
  valrad: {
    cv: 'Du börjar med att skriva CV',
    brev: 'Du börjar med att skriva personliga brev',
    tester: 'Du börjar med rekryteringstesterna',
    intervju: 'Du börjar med intervjun',
    jobb: 'Du börjar med att hitta jobb',
  } satisfies Record<SignupIntent, string>,
  andra: 'Ändra',
  fel: {
    finnsRubrik: 'Det finns redan ett konto med den adressen',
    finnsText: 'Logga in i stället, så kommer du rätt. Ditt val följer med.',
    finnsLank: 'Logga in',
    losen: 'Lösenordet måste vara minst 8 tecken.',
    mansklig: 'Vi kunde inte bekräfta att du är en människa. Ladda om sidan och försök igen.',
    /** Rubriken för fel som inte har en egen. */
    allmanRubrik: 'Kontot kunde inte skapas',
    allman: 'Något gick fel. Försök igen om en stund.',
    epost: 'Skriv en e-postadress, till exempel namn@exempel.se.',
  },
} as const

/* ------------------------------------------------------------ smakproven */

export const SMAKPROV: Record<
  SmakprovTyp,
  { eyebrow: string; rubrik: string; knapp: string; status: string; under?: string }
> = {
  intervju: {
    eyebrow: 'Ditt intervjuprov',
    rubrik: 'Skapa konto och läs hela återkopplingen',
    knapp: 'Skapa konto och läs återkopplingen',
    status: 'Ditt svar är sparat i sju dagar',
  },
  personlighet: {
    eyebrow: 'Ditt personlighetsprov',
    rubrik: 'Skapa konto och läs hela tolkningen',
    knapp: 'Skapa konto och läs tolkningen',
    status: 'Ditt svar är sparat i sju dagar',
  },
  test: {
    eyebrow: 'Ditt testprov',
    /* Skissen 2026-11-09: panelen bredvid visar resultatet, rubriken säger vad kontot öppnar. */
    rubrik: 'Se vad du missade',
    knapp: 'Skapa konto och se svaren',
    status: 'Ditt svar är sparat i sju dagar',
    under: 'Gratis konto, inget kreditkort. Du landar direkt på dina svar.',
  },
  draft: {
    eyebrow: 'Ditt brev',
    rubrik: 'Skapa konto och läs hela brevet',
    knapp: 'Skapa konto och läs brevet',
    status: 'Det du skrivit är sparat i sju dagar',
    under: 'Brevet sparas på kontot. Du landar på det direkt.',
  },
  cv_start: {
    eyebrow: 'Ditt CV',
    rubrik: 'Skapa konto och fortsätt på ditt CV',
    knapp: 'Skapa konto och fortsätt',
    status: 'Det du skrivit är sparat i sju dagar',
    under: 'Det du skrivit sparas på kontot. Du fortsätter där du slutade.',
  },
}

/** Underraden för proven. Brevet och CV-starten har egen rad (under ovan). */
export const SMAKPROV_UNDER = 'Svaret och bedömningen sparas på kontot. Du landar på dem direkt.'
export const SMAKPROV_FOTNOT = 'Gratis. Inget kort behövs.'

/* ------------------------------------------------------------ inloggningen */

export const LOGIN = {
  rubrik: 'Logga in',
  under: 'Välkommen tillbaka, fortsätt där du slutade.',
  google: 'Fortsätt med Google',
  epost: 'E-post',
  losen: 'Lösenord',
  glomt: 'Glömt lösenordet?',
  primar: 'Logga in',
  busy: 'Loggar in',
  harInte: 'Har du inget konto?',
  skapa: 'Skapa konto',
  fel: {
    rubrik: 'Inloggningen gick inte igenom',
    fel: 'Fel e-postadress eller lösenord.',
    allman: 'Något gick fel. Försök igen om en stund.',
    oauth: 'Google-inloggningen avbröts. Försök igen, eller logga in med e-post.',
  },
  bekraftad: 'Din e-post är bekräftad. Logga in nedan.',
  aterstallt: 'Lösenordet är bytt. Logga in med det nya.',
} as const

/* ------------------------------------------------------------ steg 3 */

export interface ForslagCopy {
  rubrik: (fornamn: string | null) => string
  under: string
  kortRubrik: string
  rader: readonly { fet: string; text: string }[]
  prisText: string
  gratis: readonly string[]
}

const klart = (fornamn: string | null, resten: string) =>
  fornamn ? `Klart, ${fornamn}. ${resten}` : `Klart. ${resten}`

const CV_RADER = [
  { fet: 'Hela CV-analysen.', text: ' Varje fynd med åtgärd, kör om utan tak.' },
  { fet: `${TEMPLATE_COUNT} CV-mallar`, text: ' som rekryteringssystem läser.' },
  { fet: 'Personliga brev', text: ' på annonsen, som PDF.' },
] as const

/** Raden bredvid priset på förslagskortet. Priset står i kortets egen rad. */
const FORNYAS = 'Säg upp när du vill'
/** "Premium", kortformen; fulla namnet står på kortet (paketNamn). */
const PREMIUM = paketKort()

export const STEG3 = {
  topp: 'Kom igång',
  steg: 'Steg 3 av 3',
  eyebrow: 'Förslag utifrån ditt val',
  gratisEtikett: 'Gratis, utan kort',
  jamfor: 'Se vad som ingår',
  borjaGratis: 'Börja gratis',
  busy: 'Sparar',
  /** Köpknappen, samma som överallt (copy-premium avsnitt 8). */
  kop: (_plan?: PlanKey) => kopKnapp(),
  forslag: {
    cv: {
      rubrik: (f) => klart(f, 'Så får du CV:t genom urvalet'),
      under: 'Börja gratis direkt, eller ta med hela analysen och alla mallar från start.',
      kortRubrik: 'Få CV:t genom och skriv personliga brev',
      rader: CV_RADER,
      prisText: FORNYAS,
      gratis: [`${FREE_TEMPLATE_COUNT} CV-mallar och en nedladdning`, 'En CV-analys med poängen och det tyngsta fyndet'],
    },
    brev: {
      rubrik: (f) => klart(f, 'Så skriver du brev som svarar på annonsen'),
      under: 'Brevet skrivs utifrån ditt CV, så första steget är att lägga in det.',
      kortRubrik: 'Få CV:t genom och skriv personliga brev',
      rader: CV_RADER,
      prisText: FORNYAS,
      gratis: ['Ett personligt brev att läsa, sedan ett i veckan', 'En CV-analys med poängen och det tyngsta fyndet'],
    },
    tester: {
      rubrik: (f) => klart(f, 'Så går du in förberedd på testdagen'),
      under: `Nivåkollen och ett grundpass samma dag är gratis med kontot. Passen på din nivå varje dag ingår i ${PREMIUM}.`,
      kortRubrik: 'Var förberedd på testdagen',
      rader: [
        { fet: 'Alla nivåer', text: ' i matrislogik, verbalt och numeriskt.' },
        { fet: 'Övningsprov mot klockan', text: ', 25 till 40 minuter.' },
        { fet: 'Fördjupade personlighetstestet', text: ', 120 påståenden.' },
      ],
      prisText: FORNYAS,
      gratis: ['Nivåkollen med genomgång av varje fråga', 'Ett grundpass samma dag som Nivåkollen', 'Personlighetstestet med 50 påståenden'],
    },
    intervju: {
      rubrik: (f) => klart(f, 'Så övar du inför intervjun'),
      under: `Ett intervjuprov om dagen ingår gratis. Att öva utan tak ingår i ${PREMIUM}.`,
      kortRubrik: 'Var förberedd på testdagen',
      rader: [
        { fet: 'Intervjuprov utan tak', text: ', med återkoppling på varje svar.' },
        { fet: 'Fördjupade personlighetstestet', text: ', 120 påståenden.' },
        { fet: 'Alla nivåer', text: ' i rekryteringstesterna.' },
      ],
      prisText: FORNYAS,
      gratis: ['Ett intervjuprov om dagen med återkoppling', 'Personlighetstestet med 50 påståenden'],
    },
    jobb: {
      rubrik: (f) => klart(f, 'Så hittar jobben dig'),
      under: 'Matchningen läser ditt CV, så första steget är att lägga in det. Tre träffar ingår gratis.',
      kortRubrik: 'Allt ingår, plus jobb som hittar dig',
      rader: [
        { fet: 'Jobbmatchning:', text: ' 25 jobb per natt, med skälen utskrivna.' },
        { fet: 'Bli upptäckt:', text: ' rekryterare hittar dig, anonymt tills du svarar.' },
        {
          fet: 'Jobbcoachen',
          text: ', alla CV-mallar, CV-analysen, personliga brev och alla rekryteringstester.',
        },
      ],
      prisText: FORNYAS,
      gratis: ['Tre matchade jobb', 'Tio frågor till Jobbcoachen'],
    },
  } satisfies Record<SignupIntent, ForslagCopy>,
  /** "149 kr i månaden" i kortets prisrad, ur PLANS. */
  pris: (_plan?: PlanKey) => prisPeriod(SALD_PLAN),
} as const

/**
 * Steg 3 för valet tester (undersökningen 2026-10-12): den gratis vägen leder,
 * Premium står under som information. Samma ord som hemvyns lyfta kort
 * (hem-copy matning.knapp) så att knappen hon trycker på här är den hon
 * känner igen i rummet.
 */
export const STEG3_TESTER = {
  rubrik: (f: string | null) => klart(f, 'Först kollar vi var du står'),
  under:
    'Du väljer test och provdatum, sedan gör du Nivåkollen. Den tar cirka 8 minuter och visar din nivå, med genomgång av varje fråga.',
  knapp: 'Kolla min nivå, 8 min',
  gratisEtikett: 'Gratis, utan kort',
  gratis: STEG3.forslag.tester.gratis,
  premiumEyebrow: 'När du vill träna varje dag',
  kop: () => kopKnapp(),
} as const

/* ------------------------------------------------------------ provet och panelen */

/** "fråga 3", "fråga 2 och 4", "fråga 1, 3 och 5" (index från 0). */
export function fragorText(fel: readonly number[]): string {
  const n = fel.map((i) => String(i + 1))
  if (n.length <= 1) return `fråga ${n[0] ?? ''}`.trim()
  return `fråga ${n.slice(0, -1).join(', ')} och ${n[n.length - 1]}`
}

/** "Nivåkollen, 5 minuter": minuterna räknas som på hemvyn (HEM.matning.smakprovMinuter). */
const nivakollMinuter = (svar: number) => Math.max(3, Math.round(((12 - svar) * 40) / 60))

export interface PanelRad {
  fet: string
  text: string
}

/**
 * Panelen i kontosteget efter provet och spärren under resultatet (skissen
 * 2026-11-09). Raderna byggs av besökarens eget resultat: vilka frågor som
 * blev fel. Inga tal i löptext utöver produktens egna.
 */
export const KONTO_PANEL = {
  kick: 'Ditt prov, sparat i sju dagar',
  av: (totalt: number) => `av ${totalt} rätt`,
  /** Panelens rubrik. */
  rubrik: (fel: readonly number[], totalt: number): string => {
    if (fel.length === 0) return 'Kontot visar regeln bakom varje mönster'
    if (fel.length === totalt) return 'Kontot visar alla svar och reglerna bakom'
    if (fel.length === 1) return `Kontot visar ${fragorText(fel)} och regeln bakom`
    if (fel.length >= 3) return `Kontot visar de ${talordProv(fel.length)} du missade och reglerna bakom`
    return `Kontot visar ${fragorText(fel)} och reglerna bakom`
  },
  /** Utan resultat (anropet misslyckades): samma löfte utan tal. */
  rubrikUtan: 'Kontot visar alla svar och regeln bakom varje mönster',
  rader: (fel: readonly number[] | null, totalt: number): PanelRad[] => {
    const forsta: PanelRad =
      !fel || fel.length === 0 || fel.length === totalt
        ? { fet: 'Rätt svar', text: ' och regeln bakom varje mönster' }
        : fel.length === 1
          ? { fet: versalFraga(fragorText(fel)), text: ' med rätt svar och regeln bakom mönstret' }
          : { fet: versalFraga(fragorText(fel)), text: ' med rätt svar och reglerna bakom' }
    return [
      forsta,
      { fet: 'Genomgång', text: ` av alla ${talordProv(totalt)} frågor` },
      { fet: 'Nivåkollen', text: `, ${nivakollMinuter(totalt)} minuter, räknar in de här svaren` },
    ]
  },
  /** Premium som text, aldrig knapp (ägarens beslut 2026-11-09). Pris ur PLANS. */
  premium: {
    namn: paketKort(),
    text: `, ${prisPeriod(SALD_PLAN)}, när du sedan vill träna på din nivå varje dag. Först Nivåkollen, gratis.`,
  },
} as const

/** Panelen på bar /register: vad som ingår gratis (skissen 2026-11-09). */
export const KONTO_GRATIS = {
  kick: 'Det här ingår gratis',
  rubrik: 'Börja med det som avgör urvalet',
  rader: [
    { ikon: 'matris', namn: 'Nivåkollen', text: 'Var du står i rekryteringstesterna, med genomgång av varje fråga.' },
    { ikon: 'cv', namn: 'CV-analysen', text: 'Poängen och det tyngsta fyndet i ditt CV.' },
    { ikon: 'brev', namn: 'Ett personligt brev', text: 'Skrivet på annonsen utifrån ditt CV.' },
  ] as const satisfies readonly { ikon: 'matris' | 'cv' | 'brev'; namn: string; text: string }[],
  premium: `, ${prisPeriod(SALD_PLAN)}, när du vill ha allt utan tak. Säg upp när du vill.`,
} as const

/** Brickornas skärmläsartext: "Fråga 3 fel, de andra rätt". */
export function brickorText(fel: readonly number[], totalt: number): string {
  if (fel.length === 0) return `Alla ${talordProv(totalt)} rätt`
  if (fel.length === totalt) return 'Alla fel'
  return `${versalFraga(fragorText(fel))} fel, de andra rätt`
}

function versalFraga(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s
}

const TALORD_PROV = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
function talordProv(n: number): string {
  return TALORD_PROV[n] ?? String(n)
}

/** Provets vyer (skissen 2026-11-09). */
export const PROVA = {
  intro: {
    kick: 'Matrislogik, fem frågor',
    h1: 'Prova ett rekryteringstest',
    ingressFet: 'Samma typ av frågor som i de skarpa urvalstesten.',
    ingress: ' Fem frågor, inget konto, ingen tidtagning. Resultatet får du direkt.',
    steg: ['Fem frågor', 'Resultatet direkt', 'Kontot visar vad du missade'],
    knapp: 'Starta provet',
    knappBusy: 'Startar provet',
    liten: 'Utan konto och utan tidtagning',
    bladKick: 'Så ser en fråga ut',
    bladFotRubrik: 'Regeln bakom mönstret',
    bladFot: 'Visas för varje fråga när provet är hämtat till ditt konto.',
    merFore: 'Vill du veta mer om hur testerna fungerar?',
    merLank: 'Läs om rekryteringstester',
    skapaKonto: 'Skapa ett gratiskonto',
  },
  fraga: {
    kick: 'Matrislogik, provet',
    rubrik: (nu: number, av: number) => `Fråga ${nu} av ${av}`,
    fraga: 'Vilken figur saknas?',
    under: 'Ingen tidtagning. Nästa fråga kommer när du svarat.',
    rattar: 'Rättar provet',
    alternativ: (bokstav: string) => `Svarsalternativ ${bokstav}`,
  },
  resultat: {
    kick: 'Ditt resultat',
    rubrik: (ratt: number, totalt: number) => `${versalFraga(talordProv(ratt))} rätt av ${talordProv(totalt)}`,
    ringAv: (totalt: number) => `av ${totalt} rätt`,
    percentil: (n: number) => `Bland de ${n} procent som löser flest`,
    percentilUnder: 'av den här typen av frågor.',
    sparr: (fel: readonly number[]): string => {
      if (fel.length === 0) return 'Se regeln bakom varje mönster'
      if (fel.length === 1) return 'Se vilken du missade och regeln bakom'
      return 'Se vilka du missade och reglerna bakom'
    },
    knapp: (fel: readonly number[]) => (fel.length === 0 ? 'Se genomgången' : 'Se vad jag missade'),
    liten: 'Gratis konto, inget kreditkort.',
  },
} as const

/* ------------------------------------------------------------ bredden, hemskärmen */

/** Raden "Prova också" efter första dokumentet (designfilen, Bredden punkt 3). */
export const PROVA_OCKSA = {
  etikett: 'Prova också',
  knapp: 'Prova',
  tester: {
    rubrik: 'Klarar du logiktestet?',
    text: 'Du har ett CV klart. Logiktest är vanliga i urvalet efter ansökan. Grundnivån ingår gratis.',
    href: '/dashboard/tester/matrislogik-grund',
  },
  'cv-analys': {
    rubrik: 'Vad ser rekryteraren i ditt CV?',
    text: 'Analysen visar poängen och det tyngsta fyndet, gratis.',
    href: '/dashboard/cv-analys',
  },
} as const

/* ------------------------------------------------------------ provet per typ */

/** "uppgift 3", "uppgift 2 och 4" (index från 0), för typerna utöver matrisen. */
export function uppgifterText(fel: readonly number[]): string {
  return fragorText(fel).replace(/^fråga/, 'uppgift')
}

/**
 * Spärren och kontostegets panel för typerna utöver matrisen
 * (spec-prov-fler-typer-2026-11-09 avsnitt 4). Matrisen behåller KONTO_PANEL
 * och PROVA. I-provets Premiumrad är saas-leads beslut 1 (2026-11-10):
 * övningsprovet i provets ordning, med tid per deltest, ingår i Premium.
 */
export const PROV_TYP_PANEL = {
  rubrik: (typ: NyProvTyp, fel: readonly number[], totalt: number): string => {
    const f = PROV_COPY[typ].forklaring
    if (fel.length === 0) return `Kontot visar ${f} bakom varje uppgift`
    if (fel.length === totalt) return `Kontot visar alla svar och ${f} bakom`
    if (fel.length === 1) return `Kontot visar ${uppgifterText(fel)} och ${f} bakom`
    return `Kontot visar ${uppgifterText(fel)} och ${f} bakom`
  },
  rader: (typ: NyProvTyp, fel: readonly number[] | null, totalt: number): PanelRad[] => {
    const c = PROV_COPY[typ]
    const forsta: PanelRad =
      !fel || fel.length === 0 || fel.length === totalt
        ? { fet: 'Rätt svar', text: ` och ${c.forklaring} bakom varje uppgift` }
        : { fet: versalFraga(uppgifterText(fel)), text: ` med rätt svar och ${c.forklaring} bakom` }
    const tredje: PanelRad = c.nivakollMinuter
      ? { fet: 'Nivåkollen', text: `, cirka ${c.nivakollMinuter} minuter, räknar in de här svaren` }
      : typ === 'iprov'
        ? { fet: 'Grundnivån', text: ' i alla deltester, gratis med kontot' }
        : { fet: 'Grundtestet', text: ` i ${c.namn}, gratis med kontot` }
    return [forsta, { fet: 'Genomgång', text: ` av alla ${talordProv(totalt)} uppgifter` }, tredje]
  },
  premium: (typ: NyProvTyp): string =>
    typ === 'iprov'
      ? `, ${prisPeriod(SALD_PLAN)}: hela övningsprovet i I-provets ordning, med tid per deltest.`
      : `, ${prisPeriod(SALD_PLAN)}, när du sedan vill träna på din nivå varje dag.`,
  sparr: (typ: NyProvTyp, fel: readonly number[]): string => {
    const f = PROV_COPY[typ].forklaring
    if (fel.length === 0) return `Se ${f} bakom varje uppgift`
    if (fel.length === 1) return `Se vilken du missade och ${f} bakom`
    return `Se vilka du missade och ${f} bakom`
  },
  fraga: (nu: number, av: number) => `Uppgift ${nu} av ${av}`,
} as const
