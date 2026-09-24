/**
 * Registreringstrattens strängar, ordagrant ur designfilens tabell "Alla
 * strängar på ett ställe" (docs/design/profil-registrering-2026-09-24.html).
 *
 * Paketnamn och priser läses alltid ur PLANS via paketNamn() och
 * paketMedPris(), aldrig som fasta strängar. Inga talstreck, "personliga
 * brev" och aldrig "spår" publikt.
 */

import { PLAN_BY_KEY, paketMedPris, paketNamn } from '@/lib/plans/plans'
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
  under: 'Tar under en minut. Med Google räcker ett tryck.',
  google: 'Fortsätt med Google',
  googleOppnar: 'Öppnar Google',
  googleFel: 'Google-inloggningen gick inte att starta. Försök igen.',
  eller: 'eller med e-post',
  namn: 'Namn',
  namnPlats: 'Förnamn och efternamn',
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
    namn: 'Skriv ditt namn, minst två tecken.',
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
    rubrik: 'Skapa konto och se alla svar med förklaring',
    knapp: 'Skapa konto och se svaren',
    status: 'Ditt svar är sparat i sju dagar',
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

const FORNYAS = 'Förnyas var sjunde dag, säg upp när du vill'

export const STEG3 = {
  topp: 'Kom igång',
  steg: 'Steg 3 av 3',
  eyebrow: 'Förslag utifrån ditt val',
  gratisEtikett: 'Gratis, utan kort',
  jamfor: 'Jämför alla tre paketen',
  borjaGratis: 'Börja gratis',
  busy: 'Sparar',
  kop: (plan: 'cv_week' | 'test_week' | 'all_week') => `Köp ${paketMedPris(plan)}`,
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
      under: `Grundnivån är öppen redan nu. Resten av nivåerna och provläget finns i ${paketNamn('test_week')}.`,
      kortRubrik: 'Var förberedd på testdagen',
      rader: [
        { fet: 'Alla nivåer', text: ' i matrislogik, verbalt och numeriskt.' },
        { fet: 'Provläge mot klockan', text: ', 25 till 40 minuter.' },
        { fet: 'Fördjupade personlighetstestet', text: ', 120 påståenden.' },
      ],
      prisText: FORNYAS,
      gratis: ['Grundnivån i alla fyra testtyperna, en gång per typ och dygn', 'Personlighetstestet med 50 påståenden'],
    },
    intervju: {
      rubrik: (f) => klart(f, 'Så övar du inför intervjun'),
      under: `Ett intervjuprov per dygn ingår gratis. Vill du öva utan tak finns ${paketNamn('test_week')}.`,
      kortRubrik: 'Var förberedd på testdagen',
      rader: [
        { fet: 'Intervjuprov utan tak', text: ', med återkoppling på varje svar.' },
        { fet: 'Fördjupade personlighetstestet', text: ', 120 påståenden.' },
        { fet: 'Alla nivåer', text: ' i rekryteringstesterna.' },
      ],
      prisText: FORNYAS,
      gratis: ['Ett intervjuprov per dygn med återkoppling', 'Personlighetstestet med 50 påståenden'],
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
          text: `, och allt i ${paketNamn('cv_week')} och ${paketNamn('test_week')}.`,
        },
      ],
      prisText: `Eller ${paketNamn('all_day')} ${PLAN_BY_KEY.all_day.amount} kr, månad ${PLAN_BY_KEY.all_month.amount} kr, kvartal ${PLAN_BY_KEY.all_quarter.amount} kr`,
      gratis: ['Tre matchade jobb', 'Tio frågor till Jobbcoachen'],
    },
  } satisfies Record<SignupIntent, ForslagCopy>,
  /** "79 kr / vecka" i kortets prisrad. */
  pris: (plan: 'cv_week' | 'test_week' | 'all_week') => `${PLAN_BY_KEY[plan].amount} kr / vecka`,
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
