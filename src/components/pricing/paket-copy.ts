/**
 * Prissidans, köpstegets och kontosidans strängar
 * (docs/design/copy-premium-2026-10-11.md, ägarens beslut 2026-10-11 i
 * spec-rummen avsnitt 17.3 och 17.4).
 *
 * Bara Jobbcoach Premium, 149 kr i månaden (all_month), säljs. Filen har
 * därför ett kort, en lista och en knapp. De osålda paketen (CV-paketet,
 * Träningspaketet, Dagspasset, Premium per vecka och kvartal) finns kvar i
 * PLANS för befintliga prenumeranter, och statusraderna nedan namnger dem
 * rätt tills de löpt ut, men de visas aldrig som ett val.
 *
 * En fil, delad mellan den publika prissidan, den inloggade kontosidan och
 * köpvägen: två kopior av samma rad glider isär, och då säger kassan en sak
 * och kortet en annan.
 *
 * Skrivregeln: fulla namnet "Jobbcoach Premium" en gång per yta, annars
 * "Premium" (paketKort()). Knappen är alltid kopKnapp() ur plans.ts. Alla
 * belopp läses ur PLANS och alla mallantal ur TEMPLATE_COUNT, aldrig som
 * fasta tal. Klientsäker: ren data och rena funktioner. Inga talstreck,
 * inga engelska gränssnittsord.
 */

import {
  PLAN_BY_KEY,
  SALD_PLAN,
  kopKnapp,
  nastaDragningEfter,
  paketKort,
  paketMedPris,
  paketNamn,
  prisPeriod,
  saljbarPlan,
  type PlanKey,
  type PlanLength,
} from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { GRATIS_MENING_LANG_DELAR, GRUNDNIVAN_ALLA_DAG } from '@/lib/plans/gratis-copy'
import { JOB_MATCHES_PER_RUN } from '@/lib/jobmatching/freeLimit'
import type { Feature } from '@/lib/access/features'
import type { RadIkonNamn } from '@/components/illustrations/PriserScener'
import { KOM_IGANG_LISTA } from '@/lib/onboarding/komigang'

/** "Jobbcoach Premium", ur PLANS. */
const HELA_NAMN = paketNamn(SALD_PLAN)
/** "Premium", kortformen. */
const PREMIUM = paketKort()
/** "149 kr i månaden". */
const PRIS = prisPeriod(SALD_PLAN)

/* ------------------------------------------------------------ paketet */

/**
 * Kortens id. Bara 'allt' finns kvar: Jobbcoach Premium. Typen står kvar
 * för de filer som slår upp FUNKTIONER, GUIDE och PAKET_KORT per id.
 */
export type PaketId = 'allt'

export const PAKET_IDS: readonly PaketId[] = ['allt']

export interface PaketRad {
  ikon: RadIkonNamn
  rubrik: string
  text: string
  /** Kortare text på mobil. Saknas den används text. */
  textMobil?: string
  /** Raden syns även på mobil. */
  mobil?: boolean
  /** Kortare rubrik på mobil. */
  rubrikMobil?: string
  /** Textlänk efter texten, till exempel till ett prov utan konto. */
  lank?: { text: string; href: string }
}

export interface PaketKortCopy {
  /** Kortnamnet ur PLANS: Jobbcoach Premium. */
  namn: string
  /** Förklaringsraden under namnet (R2), ur PLANS. */
  beskrivning: string
  /** Rubriken över listan. */
  listEtikett: string
  /** Vad som ingår, ur PLANS.highlights. */
  ingar: readonly string[]
  /** Prisraden ovanför knappen, kort form eftersom namnet står i rubriken. */
  prisrad: string
  knapp: string
  /** Raden under knappen. */
  fotnot: string
}

/** Det som ingår, utan raden om uppsägning (den står i prisraden). */
const INGAR = PLAN_BY_KEY[SALD_PLAN].highlights.filter((h) => !/^Säg upp/.test(h))

export const PAKET_KORT: Record<PaketId, PaketKortCopy> = {
  allt: {
    namn: HELA_NAMN,
    beskrivning: PLAN_BY_KEY[SALD_PLAN].beskrivning,
    listEtikett: `Allt i ${PREMIUM}`,
    ingar: INGAR,
    prisrad: `${PRIS}, säg upp när du vill.`,
    knapp: kopKnapp(),
    fotnot: 'Kortbetalning via Stripe. Kvitto på mejl.',
  },
}

/**
 * Längderna som går att välja: bara månaden. Dagen, veckan och kvartalet
 * säljs inte (spec-rummen 17.3). Exporten står kvar för läsare som loopar
 * över den.
 */
export const ALLT_LANGDER: readonly {
  length: PlanLength
  plan: PlanKey
  label: string
  labelLang: string
}[] = [{ length: 'månad', plan: SALD_PLAN, label: 'månad', labelLang: 'månad' }] as const

/** Paketet för en längd: alltid månaden, det enda som säljs. */
export function planForLangd(_langd?: PlanLength): PlanKey {
  return SALD_PLAN
}

/** Raden efter beloppet. Osålda längder står kvar för befintliga kunder. */
export function alltPrisSub(plan: PlanKey): string {
  switch (PLAN_BY_KEY[plan].length) {
    case 'dag':
      return 'för 24 timmar\nengångsköp, inget dras igen'
    case 'vecka':
      return 'i veckan\nförnyas var sjunde dag'
    case 'månad':
      return 'i månaden\ndras varje månad på samma datum'
    case 'kvartal':
      return 'per kvartal\nförnyas var tredje månad'
  }
}

/**
 * Knappen på ett kort. Samma knapp överallt (copy-premium avsnitt 8):
 * "Köp Premium, 149 kr i månaden". Argumenten står kvar för äldre anrop.
 */
export function borjaKnapp(_paket?: PaketId, _plan?: PlanKey): string {
  return kopKnapp()
}


/* ------------------------------------------------------------ hero */

export const HERO = {
  eyebrow: 'Priser',
  /** "Jobbcoach Premium, 149 kr i månaden". Fulla namnet står här, en gång. */
  h1: paketMedPris(SALD_PLAN),
  /** Förklaringsraden under H1, samma rad som PLANS.beskrivning. */
  rad: PLAN_BY_KEY[SALD_PLAN].beskrivning,
  ingress: 'Allt är öppet från första minuten. Ingen bindningstid, du säger upp när du vill.',
  scenAlt: 'Ett CV med poäng, ett personligt brev och ett matristest på skrivbordet',
} as const

/* ------------------------------------------------------------ gratis */

/** Gratisraden. Fetade delar ritas av komponenten. */
export const GRATIS = {
  rubrik: 'Vill du se först?',
  /** Den kanoniska meningen, lång form, ur gratis-copy.ts. */
  delar: GRATIS_MENING_LANG_DELAR,
  knapp: 'Skapa konto gratis',
} as const

/* -------------------------------------------------------- funktionerna */

export interface FunktionKort {
  id: string
  scen: 'cv' | 'brev' | 'matris' | 'match' | 'coach'
  scenAlt: string
  rubrik: string
  sub: string
  text: string
  steg?: readonly string[]
  ingar: readonly PaketId[]
  /** Kortet spänner båda kolumnerna på desktop. */
  bred?: boolean
  /** Textlänk under stegen, till en publik sida utan konto. */
  lank?: { text: string; href: string }
}

/** "Ingår i Premium. Gratis: …" (copy-premium avsnitt 3). */
const ingarGratis = (gratis: string) => `Ingår i ${PREMIUM}. Gratis: ${gratis}`

export const FUNKTIONER = {
  h2: 'Vad du faktiskt får, funktion för funktion',
  ingress: 'Inga floskler. Så här ser det ut när du använder det.',
  kort: [
    {
      id: 'cv-analys',
      scen: 'cv',
      scenAlt: 'CV-analysens genomgång',
      rubrik: 'CV-analysen',
      sub: ingarGratis('läsbarhetspoängen och genomgången i sju delar, för varje CV.'),
      text: 'De flesta CV:n sållas bort innan en människa läst dem. Analysen visar var ditt tappar, och vad du ändrar. Ladda upp som PDF eller Word, så går vi igenom CV:t i sju delar och räknar en läsbarhetspoäng av 100: kontaktuppgifter, personbeskrivning, erfarenhet, kompetenser, utbildning, språk och till sist datum, ordning och längd. Du ser var varje tappad poäng sitter. Jobbcoachen skriver förslag på nya formuleringar, och poängen räknas om när du sparar.',
      steg: [
        'Ladda upp, vi läser som en rekryterare gör på sex sekunder.',
        'En läsbarhetspoäng av 100: hur lätt CV:t är att läsa för rekryteraren och för rekryteringssystemen (ATS).',
        'Vad som saknas i var och en av de sju delarna, och Jobbcoachens förslag på nya formuleringar.',
        'Rätta och spara, så räknas poängen om.',
      ],
      ingar: ['allt'],
    },
    {
      id: 'personliga-brev',
      scen: 'brev',
      scenAlt: 'Annonsen blir ditt personliga brev',
      rubrik: 'Personliga brev',
      sub: ingarGratis('första personliga brevet, sedan ett var sjunde dag. De två senaste går att ändra, nedladdning ingår inte.'),
      text: 'Ett personligt brev som faktiskt svarar på annonsen är det som skiljer din ansökan från de tjugo som skickade samma mall. Klistra in annonsen, så skriver vi brevet utifrån ditt CV och det annonsen frågar efter, i den ton du väljer. Redigera, ladda ner som PDF eller Word, skicka.',
      steg: [
        'Klistra in annonsen, eller välj ett matchat jobb.',
        `Välj ton, från professionell till kreativ. I ${PREMIUM} väljer vi åt dig efter annonsen.`,
        'Det personliga brevet svarar på annonsens krav med exempel ur ditt CV.',
        'Redigera, ladda ner som PDF eller Word, skicka.',
      ],
      ingar: ['allt'],
    },
    {
      id: 'rekryteringstester',
      scen: 'matris',
      scenAlt: 'Matrislogik under tidspress',
      rubrik: 'Rekryteringstester',
      sub: ingarGratis(`${GRUNDNIVAN_ALLA_DAG}, med genomgång.`),
      text: 'Den som känner igen uppgiftstypen på testdagen tävlar på lika villkor. Här lär du dig mönstren i de typer de stora urvalstesten använder: matrislogik, figurserier, deduktiv slutledning, verbalt och numeriskt resonemang, talserier, spatial förmåga och ordförråd, i tre nivåer från grund till expert, plus personlighetstestet. I övningsprovet går klockan på riktigt i samma format som Matrigma, Alva, SHL, Aon och I-provet, och provet lämnas in automatiskt när tiden är ute. Efter varje fråga får du förklaringen, inte bara facit, och din utveckling dag för dag visar när du är redo.',
      steg: [
        'Grundnivån visar var du står i varje typ.',
        'Träna på avancerad och expertnivå i din svagaste typ, med förklaring på varje fråga.',
        'Kör övningsprovet mot klockan när du är redo. Automatisk inlämning, resultat direkt.',
        'Följ din utveckling, pass för pass.',
      ],
      ingar: ['allt'],
      bred: true,
      // Personlighetsprovet utan konto (docs/design/rod-trad-prov-spec-2026-09-24.md).
      // Länken stod förr på Träningspaketets kort och flyttade hit i våg 5.
      lank: { text: 'Gör personlighetstestet utan konto', href: '/verktyg/personlighetstest' },
    },
    {
      id: 'matchade-jobb',
      scen: 'match',
      scenAlt: 'Tre jobbträffar med matchningsgrad',
      rubrik: 'Matchade jobb',
      sub: ingarGratis('tre träffar.'),
      text: `Den som söker på sin vanliga yrkestitel missar jobben som efterfrågar samma kompetens under ett annat namn, i en annan bransch. Vi utgår i stället från dina kompetenser, erfarenheter och utbildningar och matchar dem mot annonserna i Platsbanken. Annonserna hämtas tre gånger per dygn, och du söker om med ett tryck när du vill se de senaste. Du får de ${JOB_MATCHES_PER_RUN} bästa träffarna med skälen utskrivna: vilken av dina roller som matchar och vilka av dina kompetenser annonsen frågar efter. Från en träff skriver du det personliga brevet, sparar annonsen till Ska sökas eller markerar den som sökt.`,
      ingar: ['allt'],
    },
    {
      id: 'jobbcoachen',
      scen: 'coach',
      scenAlt: 'Jobbcoachen svarar',
      rubrik: 'Jobbcoachen',
      sub: ingarGratis('tio meddelanden.'),
      text: 'Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Svaren utgår från svensk arbetsmarknad, med källor du kan kolla själv, inte från en amerikansk mall. Jobbcoachen känner till din målroll, ort och bransch och de dokument du själv delar i samtalet, och föreslår frågor utifrån läget i dina sökta tjänster.',
      ingar: ['allt'],
    },
  ] satisfies readonly FunktionKort[],
} as const

/* ---------------------------------------------------------- hjälpredan */

/** Det hjälpredan Kom igång leder igenom, i logisk ordning, profilen och CV:t först. */
export const GUIDE = {
  h2: 'Hjälpredan Kom igång tar dig igenom allt i rätt ordning',
  ingress:
    'Du gör vad du vill, när du vill. Hjälpredan Kom igång är en vägvisare som ser till att du hittar allt: fyller i profilen, provar varje funktion och inte missar det som ger mest. Gör du hela listan första kvällen är det lika bra. Dagen innan månaden förnyas mejlar vi vad du gjort, så att du kan säga upp innan nästa dragning om du är klar.',
  listor: {
    allt: {
      // Betalandes Kom igång-lista i produktens ordning (textbeslut GEM-13).
      // Antalet läses ur listan; paket-copy.test.ts vaktar att raderna följer.
      etikett: `${KOM_IGANG_LISTA.allt.length} steg`,
      steg: [
        'Profilen ifylld',
        'CV uppladdat',
        'CV-analysen: läsbarhetspoängen och Jobbcoachens förslag',
        'CV:t uppdaterat efter genomgången',
        'Första jobbmatchningen: jobb du inte hittat själv',
        'Mall vald och nedladdad',
        'Personligt brev på en annons',
        'LinkedIn-profilen omskriven',
        'Bli upptäckt: profilen synlig för rekryterare',
        'Jobbcoachen: intervjun och lönen förberedd',
        'Rekryteringstesterna: din nivå i matrislogik',
        'Intervjuprovet: ett svar med återkoppling',
      ],
    },
  } satisfies Record<PaketId, { etikett: string; steg: readonly string[] }>,
} as const

/* ---------------------------------------------------------- förtroende */

export const FORTROENDE = [
  {
    key: 'uppsagning',
    rubrik: 'Säg upp när du vill',
    text: 'Under Profil och Prenumeration, ingen bindningstid. Månaden du betalat gäller ut.',
  },
  {
    key: 'stripe',
    rubrik: 'Kortbetalning via Stripe',
    text: 'Vi ser aldrig ditt kortnummer. Kvitto på mejl direkt.',
  },
  {
    key: 'moms',
    rubrik: 'Priser i kronor, moms ingår',
    text: 'Det du ser är det som dras. Inga tillägg.',
  },
] as const

/* ----------------------------------------------------------- spårvalet */

/**
 * Spårvalet finns inte längre: köpsteget visar Premium direkt. Kvar är
 * foten, "Börja gratis i stället", och primärens text för äldre läsare.
 */
export const SPARVAL = {
  primar: (_paket?: PaketId, _plan?: PlanKey) => kopKnapp(),
  sekundar: 'Börja gratis i stället',
  fotnot: `Gratis: ${FREE_TEMPLATE_COUNT} mallar, en analys, ett personligt brev, grundnivån i testerna`,
} as const

/* ----------------------------------------------------------- köpsteget */

/** Det copyn behöver av en kampanj (KampanjVisning i lib/kampanj). */
export interface KampanjPris {
  namn: string
  pris: number
  giltigTill: string
}

export const KOPSTEG = {
  /** Rubriken bär fulla namnet; prisraden under har kort form. */
  rubrik: (plan: PlanKey = SALD_PLAN) => paketNamn(saljbarPlan(plan)),
  /** "149 kr i månaden, säg upp när du vill." */
  prisrad: (plan: PlanKey = SALD_PLAN) => `${prisPeriod(saljbarPlan(plan))}, säg upp när du vill.`,
  under: 'Allt öppnas direkt efter betalningen.',
  farEtikett: `Det här ingår i ${PREMIUM}`,
  villkor: {
    fornyas: 'Förnyas',
    uppsagning: 'Uppsägning',
    uppsagningVarde: 'när som helst i ditt konto',
    angerratt: 'Ångerrätt',
    angerrattVarde: 'gäller inte, du startar direkt',
    /** Engångsköpet har ingen förnyelse. */
    galler: 'Gäller',
  },
  fornyasVarde: (plan: PlanKey, datum: string) => {
    switch (PLAN_BY_KEY[plan].length) {
      case 'dag':
        return `till ${datum}`
      case 'vecka':
        return `var sjunde dag, nästa ${datum}`
      case 'månad':
        return `varje månad på samma datum, nästa ${datum}`
      case 'kvartal':
        return `var tredje månad på samma datum, nästa ${datum}`
    }
  },
  /** Första steget efter betalningen. */
  forstaSteg: {
    rubrik: 'Första steget: ladda upp CV:t',
    text: 'Tar en kvart. Sedan är allt ovan öppet, i vilken ordning du vill.',
  },
  /**
   * Ångerrättssamtycket, ordagrant det kunden kryssar i (lagkrav,
   * oförändrat). Beloppet är paketets pris och datumet nästa dragning räknad
   * som Stripe räknar den (nastaDragningEfter i plans.ts).
   */
  samtycke: (plan: PlanKey, nasta?: string, kampanj?: KampanjPris | null) => {
    const p = PLAN_BY_KEY[plan]
    const start =
      'Jag vill att innehållet startar direkt och förstår att ångerrätten därmed inte gäller.'
    if (p.length === 'dag') {
      return `${start} Det är ett engångsköp på ${p.amount} kr, inget dras igen.`
    }
    const takt =
      p.length === 'vecka'
        ? 'var sjunde dag'
        : p.length === 'månad'
          ? 'varje månad på samma datum'
          : 'var tredje månad på samma datum'
    const nastaGang = nasta ? `, nästa gång ${nasta},` : ''
    // Kampanjen sänker bara första dragningen. Texten säger båda beloppen,
    // eftersom den sparas som bevis i Stripe (create-plan-session).
    if (kampanj && p.length === 'månad') {
      return `${start} ${kampanj.pris} kr dras i dag, sedan ${p.amount} kr ${takt}${nastaGang} tills jag säger upp prenumerationen.`
    }
    return `${start} ${p.amount} kr dras ${takt}${nastaGang} tills jag säger upp prenumerationen.`
  },
  samtyckeSparr: 'Kryssa i rutan ovanför för att fortsätta.',
  primar: (plan: PlanKey = SALD_PLAN, kampanj?: KampanjPris | null) =>
    `Till betalning, ${kampanj ? kampanj.pris : PLAN_BY_KEY[saljbarPlan(plan)].amount} kr`,
  /** Prisraden under rubriken när en kampanj gäller kontot. */
  prisradKampanj: (k: KampanjPris) =>
    `${k.pris} kr första månaden, sedan ${PLAN_BY_KEY[SALD_PLAN].amount} kr i månaden. Säg upp när du vill.`,
  /** Raden ovanför rubriken: "Black Week, gäller till söndag 29 november 23.59". */
  kampanjRad: (k: KampanjPris) => `${k.namn}, gäller ${k.giltigTill}`,
  /** 409 prisAndrat: kampanjen hann börja eller sluta medan steget var öppet. */
  prisAndrat: (ny: KampanjPris | null) =>
    ny
      ? `Priset har ändrats. ${ny.namn} började medan sidan var öppen, och första månaden kostar nu ${ny.pris} kr. Inget har dragits från ditt kort. Kryssa i rutan igen för att fortsätta.`
      : `Priset har ändrats. Kampanjen tog slut medan sidan var öppen, och ${PREMIUM} kostar nu ${PLAN_BY_KEY[SALD_PLAN].amount} kr i månaden från första dragningen. Inget har dragits från ditt kort. Kryssa i rutan igen för att fortsätta.`,
  busy: 'Öppnar kassan',
  fotnot: 'Kortbetalning via Stripe. Kvitto på mejl.',
  /** 400 med saljs: false. Aldrig "klart": kassan öppnades inte. */
  saljsInte: `Paketet du valde säljs inte längre. Det vi säljer är ${paketMedPris(SALD_PLAN)}. Ladda om sidan och försök igen.`,
  /** 409: kontot har redan en löpande prenumeration. */
  redan: `Du har redan ${HELA_NAMN}.`,
  /**
   * 409 med upgradeAvailable: en spårkund (CV-paketet, Träningspaketet) som
   * försöker köpa Premium. Bytet görs på samma prenumeration, på
   * prenumerationssidan, aldrig i en ny kassa (spec-rummen 17.5).
   */
  harSpar: (namn: string) => `Du har ${namn}. Byt till ${PREMIUM} på prenumerationssidan.`,
  tillPrenumeration: 'Till prenumerationssidan',
  prenumerationHref: '/dashboard/profil/prenumeration',
  felKassa: 'Kassan kunde inte öppnas just nu. Försök igen.',
  /** Flödets namn i toppraden. */
  topp: 'Kom igång',
  forsokIgen: 'Försök igen',
  sparar: 'Sparar',
  sparaFel: 'Valet kunde inte sparas. Försök igen.',
  /** Gratisfrågans spärrade knapp. */
  gratisSparr: 'Välj vad du vill börja med.',
} as const

/**
 * Nästa dragning för ett köp som görs nu, i formen "24 oktober", svensk tid.
 * Samma datum som Stripe sätter som current_period_end när prenumerationen
 * skapas, eftersom köpet är periodens ankare.
 */
export function nastaDragningText(plan: PlanKey, nu: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Stockholm',
  }).format(nastaDragningEfter(plan, nu))
}

/**
 * Samtycket som det står i köpstegets kryssruta, med datumet ifyllt. Rutterna
 * lägger exakt den här texten i sessionens metadata, så beviset och det
 * kunden läste är samma mening.
 */
export function samtyckeVidKop(
  plan: PlanKey,
  nu: Date = new Date(),
  kampanj?: KampanjPris | null
): string {
  const engangs = PLAN_BY_KEY[plan].mode === 'payment'
  return KOPSTEG.samtycke(plan, engangs ? undefined : nastaDragningText(plan, nu), engangs ? null : kampanj)
}

/* -------------------------------------------------------- kontosidan */

/** Datum i formen "11 november", svensk tid. */
function datumText(d: Date): string {
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' })
}

export const KONTO = {
  /** Väggens rad på gratisnivån (statusen står på väggen, 24.2 fråga 3). */
  statusGratis: 'Du är på gratisnivån',
  /** Rubriken över kortet (ersätter "Köp eller byt paket"). */
  paketRubrik: 'Prenumeration',
  /**
   * "Du har Premium", för andra ytor. Prenumerationssidan visar den inte:
   * där är statusen väggens rad och kortet finns inte för den som har Premium.
   */
  dittPaket: `Du har ${PREMIUM}`,
  ingarIAllt: `Ingår i ${PREMIUM}`,
  /** Köpknappen, samma som överallt. */
  bytTillAllt: kopKnapp(),
  /** Äldre namn på knappen; alla byten leder till Premium. */
  bytSpar: (_plan?: PlanKey) => kopKnapp(),
  bytLangd: (_plan?: PlanKey) => kopKnapp(),
  /** Rubriken på erbjudandet till en kund med ett osålt paket. */
  bytRubrik: HELA_NAMN,
  /** Varför bytet lönar sig, för en kund med CV-paketet eller Träningspaketet. */
  bytText: (fran: PlanKey) => {
    const scope = PLAN_BY_KEY[fran].scope
    if (scope === 'cv') {
      return `${PREMIUM} ger allt du har i dag och dessutom alla rekryteringstester, övningsprov, jobbmatchningen och Jobbcoachen.`
    }
    if (scope === 'tester') {
      return `${PREMIUM} ger allt du har i dag och dessutom alla CV-mallar, CV-analysen, personliga brev, jobbmatchningen och Jobbcoachen.`
    }
    return `${PREMIUM} ger allt.`
  },
  /**
   * Raden ovanför knappen vid byte: vad som dras och när. Stämmer med
   * create-upgrade-session: veckopris till månadspris byter intervall, så
   * Stripe drar av den oanvända veckotiden (proration, always_invoice) och
   * flyttar dragningsdagen till bytesdagen (billing_cycle_anchor).
   */
  bytPrisrad: `${PRIS}. Det du redan har betalat för resten av veckan drar vi av, och månaden räknas från i dag.`,
  hantera: 'Hantera',
  bytKort: 'Byt betalkort',
  kvitton: 'Kvitton',
  sagUpp: 'Säg upp',
  /** Uppsagt läge: Premium gäller perioden ut men förnyas inte. */
  angraUppsagning: 'Ångra uppsägningen',
  uppsagdNot:
    'Uppsägningen är klar. Prenumerationen gäller perioden ut och inget mer dras. Ångrar du dig fortsätter den som vanligt, utan nytt köp.',
  stoppRubrik: 'Det här har tagit stopp',
  gratisRubrik: 'Vad gratisnivån ger',
  adminTilldelad: 'Din tillgång är tilldelad av oss och hanteras inte i ett abonnemang.',
  tidsbegransad: 'Tillgången gäller en begränsad tid och förnyas inte av sig själv.',
  felKontakt: 'Kontakta support@jobbcoach.ai om problemet kvarstår.',
  stangFel: 'Stäng meddelande',
} as const

/* --------------------------------------------- bakåtkompatibla strängar */

/** Raden under paketnamnet i schemat och i äldre ytor. */
export const PAKET_RAD: Record<PlanKey, string> = {
  cv_week: 'CV-mallar, CV-analys och personliga brev, en vecka i taget.',
  test_week: 'Alla rekryteringstester och övningsprov, en vecka i taget.',
  all_day: `${HELA_NAMN} i 24 timmar. Ett engångsköp, ingenting dras igen.`,
  all_week: `${HELA_NAMN} en vecka i taget.`,
  all_month: PLAN_BY_KEY[SALD_PLAN].body,
  all_quarter: `${HELA_NAMN} i tre månader i taget.`,
}

/** Tre punkter per paket, för kontosidans "Det här ingår". */
export const PAKET_PUNKTER: Record<PlanKey, readonly string[]> = {
  cv_week: [
    `Alla ${TEMPLATE_COUNT} CV-mallar`,
    'Hela CV-analysen, alla fynd och poängen',
    'Personliga brev, skrivna och nedladdade',
  ],
  test_week: [
    'Alla testtyper, grundnivå till expert',
    'Övningsprov mot klockan och fördjupade personlighetstestet',
    'Förklaring per fråga och din utveckling',
  ],
  all_day: [`Allt i ${PREMIUM}, i 24 timmar`, 'Engångsköp, ingen prenumeration', 'Tiden räknas från köpet'],
  all_week: [`Allt i ${PREMIUM}, en vecka i taget`, 'Förnyas var sjunde dag', 'Säg upp när du vill, ingen bindningstid'],
  all_month: [`Allt i ${PREMIUM}, en månad i taget`, 'Dras samma datum varje månad', 'Säg upp när du vill, ingen bindningstid'],
  all_quarter: [`Allt i ${PREMIUM}, i tre månader`, 'Förnyas var tredje månad', 'Säg upp när du vill, ingen bindningstid'],
}

/** Intervallraden under beloppet. Dagen förnyas inte. */
export const INTERVALL_RAD: Record<PlanKey, string> = {
  cv_week: 'i veckan, förnyas var sjunde dag',
  test_week: 'i veckan, förnyas var sjunde dag',
  all_day: 'i 24 timmar, förnyas inte',
  all_week: 'i veckan, förnyas var sjunde dag',
  all_month: 'i månaden, dras samma datum varje månad',
  all_quarter: 'i kvartalet, förnyas var tredje månad',
}

/**
 * Knapptexten i betalväggarna: alltid "Köp Premium, 149 kr i månaden"
 * (copy-premium avsnitt 8). Ett osålt paket leder till det som säljs.
 */
export function knappText(plan: PlanKey = SALD_PLAN): string {
  return kopKnapp(saljbarPlan(plan))
}

/** H1 på prissidan. */
export const PR_H1 = HERO.h1

export const D_PRENUMERATION = {
  statusGratis: KONTO.statusGratis,
  stoppRubrik: KONTO.stoppRubrik,
  gratisRubrik: KONTO.gratisRubrik,
  ingarRubrik: 'Det här ingår',
  bytTillAllt: KONTO.bytTillAllt,
  hantera: KONTO.hantera,
  bytKort: KONTO.bytKort,
  kvitton: KONTO.kvitton,
  sagUpp: KONTO.sagUpp,
} as const

/** En etikett per feature. Substantiv, aldrig en uppmaning. */
export const FEATURE_ETIKETT: Record<Feature, string> = {
  cv_templates_all: 'Fler CV-mallar',
  cv_export: 'Fler CV-nedladdningar',
  cv_export_word: 'CV som Word-fil',
  cv_analysis_full: 'Hela CV-analysen',
  letter_download: 'Brevnedladdning',
  tests_above_base: 'Testnivå över grundnivån',
  test_daily_pass: 'Text- och sifferpass varje dag',
  test_exam_mode: 'Övningsprov mot klockan',
  test_history: 'Din testhistorik',
  chat_unlimited: 'Fler meddelanden i chatten',
  interview_unlimited: 'Fler intervjuprov',
  job_matches_all: 'Fler jobbträffar',
  linkedin: 'LinkedIn-profilen',
}

/** Antalsraden bredvid etiketten. Korrekt svensk förkortning. */
export function gangerText(antal: number): string {
  return antal === 1 ? '1 gg' : `${antal} ggr`
}

/** "Vi föreslår Jobbcoach Premium, 149 kr i månaden". Bara det som säljs. */
export function forslagRubrik(_plan?: PlanKey): string {
  return `Vi föreslår ${paketMedPris(SALD_PLAN)}`
}

export function forslagKnapp(plan: PlanKey = SALD_PLAN): string {
  return knappText(plan)
}

function antalOrd(antal: number): string {
  const ord = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio']
  return antal <= 9 ? ord[antal] : String(antal)
}

/**
 * D28, förslagets skäl, räknat ur samma tal som blockeringslistan. Förslaget
 * är alltid Premium; skälet säger vad som tog stopp.
 */
export function forslagSkal(input: {
  plan?: PlanKey
  antal: number
  badaSparen: boolean
  track: 'cv' | 'tester' | 'allt' | null
}): string {
  const { antal, badaSparen, track } = input

  if (antal > 0 && badaSparen) {
    return `Du har stoppats både på CV-sidan och i testerna. ${PREMIUM} öppnar båda.`
  }

  if (antal > 0) {
    const gang = antal === 1 ? 'en gång' : `${antalOrd(antal)} gånger`
    return `Du har slagit i taket ${gang} den här veckan. ${PREMIUM} öppnar allt du stoppades av.`
  }

  if (track === 'cv') {
    return `Du sa att du vill jobba med ditt CV. ${PREMIUM} ger alla mallar, alla förslag i analysen och de personliga breven.`
  }

  if (track === 'tester') {
    return `Du sa att du vill träna på testerna. ${PREMIUM} ger alla nivåer, övningsprov och förklaringarna.`
  }

  return `Vi vet inte vad du behöver än. ${PREMIUM} rymmer allt, så du behöver inte välja.`
}

/** Prisraden för en längd. Dagen bär prepositionen "för". */
export function langdPrisRad(plan: PlanKey): string {
  const p = PLAN_BY_KEY[plan]
  return p.length === 'dag' ? `${p.amount} kr för 24 timmar` : prisPeriod(plan)
}

/** Knappen som förr bytte längd. Längder säljs inte längre: köpknappen. */
export function bytLangdKnapp(_plan?: PlanKey): string {
  return kopKnapp()
}

/**
 * Statusraden för ett uppsagt paket: "Jobbcoach Premium, uppsagt. Gäller
 * till 11 november, förnyas inte." Datumet ur prenumerationen.
 */
export function uppsagdStatusText(plan: PlanKey, slut: Date | null): string {
  const namn = PLAN_BY_KEY[plan].name
  if (!slut) return `${namn}, uppsagt. Förnyas inte.`
  return `${namn}, uppsagt. Gäller till ${datumText(slut)}, förnyas inte.`
}

/* ------------------------------------------------- köpbekräftelsen */

/**
 * Kvittot på hemskärmen efter Stripe-returen (PurchaseConfirmation).
 * Rubriken läser PAKETRADER.tackTitel: "Tack. Du har Jobbcoach Premium."
 */
export const KOPBEKRAFTELSE = {
  /** "Nästa dragning 11 november, 149 kr. Säg upp när du vill i ditt konto." */
  lopande: (plan: PlanKey, datum: string | null) =>
    datum
      ? `Nästa dragning ${datum}, ${PLAN_BY_KEY[plan].amount} kr. Säg upp när du vill i ditt konto.`
      : 'Säg upp när du vill i ditt konto.',
  /** Engångsköp (Dagspasset, för köp gjorda innan det slutade säljas). */
  engangs: (namn: string, datum: string | null) =>
    datum
      ? `${namn} gäller till och med ${datum}. Inget dras automatiskt efter det.`
      : `${namn} är aktiverat. Inget dras automatiskt.`,
  skrivBrev: 'Skriv ett brev',
  sePrenumeration: 'Se din prenumeration',
  stang: 'Stäng',
} as const

/** Datum för köpbekräftelsen: "11 november", svensk tid. */
export function kopDatum(iso: string): string {
  return datumText(new Date(iso))
}

/* ------------------------------------------ byte från betalväggen */

/**
 * Svaren på bytesknapparna för en kund med CV-paketet eller Träningspaketet
 * (docs/qa/qa-kop-testlage-2026-09-24.md, bugg 3). Bytet går bara till
 * Premium; inga sidbyten och inga längdbyten.
 */
export const PAKETBYTE = {
  /** Bytet gick igenom på servern. "Du har nu Jobbcoach Premium" */
  klart: (plan: PlanKey) => `Du har nu ${PLAN_BY_KEY[plan].name}`,
  /** Under klicket. */
  arbetar: `Byter till ${PREMIUM}`,
  /** 409: kontot har redan Premium. */
  redanPaket: `Du har redan ${HELA_NAMN}.`,
  tillPrenumeration: 'Till prenumerationen',
  href: '/dashboard/profil/prenumeration',
  fel: 'Bytet gick inte igenom just nu. Försök igen om en stund.',
  /** 400 med saljs: false från rutten. */
  saljsInte: `Det bytet går inte längre. Det vi säljer är ${paketMedPris(SALD_PLAN)}.`,
  /**
   * 409 med vidFornyelse: från Premium nedåt eller en annan längd. Perioden
   * kunden betalat för gäller ut, och inget byte schemaläggs åt henne, så
   * raden säger vad hon gör i kundportalen.
   */
  vidFornyelse: (skal: 'nedgradering' | 'langd') =>
    skal === 'nedgradering'
      ? `Nedgradering sker vid nästa förnyelse. Säg upp ${HELA_NAMN} i kundportalen, så gäller det perioden ut.`
      : `Längden byts inte mitt i en period. Säg upp ${HELA_NAMN} i kundportalen, så gäller det perioden ut, och köp sedan ${PREMIUM}, ${PRIS}.`,
  tillPortalen: 'Till kundportalen',
  portalHref: '/api/stripe/create-portal-session',
} as const

/**
 * Statusraden på kontosidan, med datumet ur prenumerationen.
 *
 *   Premium per månad  "Jobbcoach Premium, 149 kr i månaden. Nästa dragning 11 november."
 *   Premium, osåld längd  "Jobbcoach Premium, 99 kr i veckan. Nästa dragning 17 oktober."
 *   CV-paketet, Träningspaketet  "Träningspaketet, 79 kr i veckan, förnyas 17 oktober"
 *   Dagspasset  "Dagspasset, gäller till 21:40 i dag"
 */
export function statusRadText(plan: PlanKey, slut: Date | null): string {
  const p = PLAN_BY_KEY[plan]

  if (p.length === 'dag') {
    if (!slut) return p.name
    const tid = slut.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Stockholm',
    })
    return `${p.name}, gäller till ${tid} i dag`
  }

  if (p.scope === 'allt') {
    if (!slut) return `${paketMedPris(plan)}.`
    return `${paketMedPris(plan)}. Nästa dragning ${datumText(slut)}.`
  }

  if (!slut) return paketMedPris(plan)
  return `${paketMedPris(plan)}, förnyas ${datumText(slut)}`
}
