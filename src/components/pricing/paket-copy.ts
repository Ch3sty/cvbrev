/**
 * Prissidans, spårvalets, köpstegets och kontosidans strängar
 * (docs/design/spec-prissida-2026-09-22.html, godkänd av ägaren 2026-09-22).
 *
 * En fil, delad mellan den publika prissidan, den inloggade kontosidan och
 * köpvägen. Skälet är detsamma som för paketkortet: två kopior av samma rad
 * glider isär, och då säger kassan en sak och kortet en annan.
 *
 * Alla belopp läses ur PLANS och alla mallantal ur TEMPLATE_COUNT, aldrig
 * som fasta tal i en sträng. Klientsäker: ren data och rena funktioner,
 * ingen env och ingen Supabase. Inga talstreck, inga engelska
 * gränssnittsord.
 */

import {
  PLAN_BY_KEY,
  paketMedPris,
  paketNamn,
  prisPeriod,
  type PlanKey,
  type PlanLength,
} from '@/lib/plans/plans'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import type { Feature } from '@/lib/access/features'
import type { RadIkonNamn } from '@/components/illustrations/PriserScener'

/* ------------------------------------------------------------ paketen */

/** De tre korten. Hela paketet bär fyra längder, de andra två bara veckan. */
export type PaketId = 'cv' | 'test' | 'allt'

export const PAKET_IDS: readonly PaketId[] = ['cv', 'test', 'allt']

/** Paketet ett kort leder till när ingen längd valts. */
export const PAKET_PLAN: Record<PaketId, PlanKey> = {
  cv: 'cv_week',
  test: 'test_week',
  allt: 'all_week',
}

export function paketForPlan(plan: PlanKey): PaketId {
  if (plan === 'cv_week') return 'cv'
  if (plan === 'test_week') return 'test'
  return 'allt'
}

const CV_PRIS = PLAN_BY_KEY.cv_week.amount
const TEST_PRIS = PLAN_BY_KEY.test_week.amount
const ALLT_VECKA = PLAN_BY_KEY.all_week.amount
const ALLT_MANAD = PLAN_BY_KEY.all_month.amount
const ALLT_DAG = PLAN_BY_KEY.all_day.amount
const ALLT_KVARTAL = PLAN_BY_KEY.all_quarter.amount

/** Namnen ur PLANS, aldrig som fasta strängar (plans.ts). */
const CV_NAMN = paketNamn('cv_week')
const TRANING_NAMN = paketNamn('test_week')
const HELA_NAMN = paketNamn('all_week')
const DAG_NAMN = paketNamn('all_day')

export interface PaketRad {
  ikon: RadIkonNamn
  rubrik: string
  text: string
  /** Kortare text på mobil. Saknas den används text. */
  textMobil?: string
  /** Raden syns även på mobil (sektion 2, vänstra telefonen). */
  mobil?: boolean
  /** Kortare rubrik på mobil. */
  rubrikMobil?: string
  /** Textlänk efter texten, till exempel till ett prov utan konto. */
  lank?: { text: string; href: string }
}

export interface PaketKortCopy {
  /** Kortnamnet ur PLANS: CV-paketet, Träningspaketet, Hela paketet. */
  namn: string
  /** Förklaringsraden under namnet (R2), ur PLANS. */
  beskrivning: string
  /** Färgetiketten överst. */
  tag: string
  /** Värdemeningen under namnet, i display-snitt. */
  varde: string
  /** Mobilens kortare värdemening. */
  vardeMobil: string
  /** "För dig som". På CV- och Träningspaketet bara desktop, på Hela paketet båda. */
  fordig: string
  fordigMobil?: string
  /** Raden efter beloppet, två rader. */
  prisSub: string
  prisSubMobil: string
  /** Etiketten över listan. */
  listEtikett: string
  rader: readonly PaketRad[]
  knapp: string
  /** Raden under knappen. */
  fotnot: string
}

export const PAKET_KORT: Record<PaketId, PaketKortCopy> = {
  cv: {
    namn: CV_NAMN,
    beskrivning: PLAN_BY_KEY.cv_week.beskrivning,
    tag: 'CV och personliga brev',
    varde:
      'Få CV:t genom rekryteringssystemet och skriv personliga brev som svarar på annonsen.',
    vardeMobil:
      'För dig som vill få CV:t genom rekryteringssystemet och skriva personliga brev som svarar på annonsen.',
    fordig:
      'För dig som har annonser att svara på och vill att ansökan ska klara både maskinen och rekryterarens första blick.',
    prisSub: 'i veckan\nförnyas var sjunde dag',
    prisSubMobil: 'i veckan\nsäg upp när du vill',
    listEtikett: 'Så här fungerar det',
    rader: [
      {
        ikon: 'analys',
        rubrik: 'Vet exakt varför CV:t inte får svar',
        rubrikMobil: 'Hela CV-analysen',
        text: 'Hela analysen: poäng per område, varje fynd med åtgärd, nyckelorden rekryteringssystem (ATS) letar efter. Rätta, kör om, se poängen stiga.',
        textMobil: 'Vet exakt varför CV:t inte får svar, och rätta det.',
        mobil: true,
      },
      {
        ikon: 'mall',
        rubrik: `${TEMPLATE_COUNT} CV-mallar som rekryteringssystem läser`,
        rubrikMobil: `${TEMPLATE_COUNT} mallar som rekryteringssystem läser`,
        text: 'Ren struktur som maskinen tolkar rätt och som ser proffsig ut för människan. Byt mall med ett klick, ladda ned utan tak.',
        textMobil: 'Ladda ned utan tak.',
        mobil: true,
      },
      {
        ikon: 'brev',
        rubrik: 'Personliga brev som svarar på annonsen',
        rubrikMobil: 'Personliga brev på annonsen',
        text: 'Klistra in annonsen, välj ton, vi skriver utifrån ditt CV. Ladda ned som PDF, ett personligt brev per annons.',
        textMobil: 'Ett per annons, som PDF.',
        mobil: true,
      },
      {
        ikon: 'linkedin',
        rubrik: 'Bli hittad på LinkedIn',
        text: 'Vi skriver om rubrik och sammanfattning så rekryterare som söker på dina kompetenser hittar dig.',
      },
    ],
    knapp: `Börja med ${paketMedPris('cv_week')}`,
    fotnot: 'Rekryteringstester över grundnivå ingår inte',
  },
  test: {
    namn: TRANING_NAMN,
    beskrivning: PLAN_BY_KEY.test_week.beskrivning,
    tag: 'Rekryteringstester',
    varde:
      'Känn igen varje uppgift på testdagen. Och förstå vad personlighetstestet säger om dig.',
    vardeMobil:
      'För dig som ska göra urvalstest och vill lära dig mönstren, öva mot klockan och se att du blir bättre.',
    fordig:
      'För dig som fått kallelse till urvalstest och vill gå in förberedd i stället för överraskad.',
    prisSub: 'i veckan\nförnyas var sjunde dag',
    prisSubMobil: 'i veckan\nsäg upp när du vill',
    listEtikett: 'Så här fungerar det',
    rader: [
      {
        ikon: 'matris',
        rubrik: 'Lär dig mönstren i matrislogik, verbalt och numeriskt',
        rubrikMobil: 'Fyra testtyper, tre nivåer',
        text: 'Tre nivåer per typ, från grund till expert. Samma uppgiftstyper som de stora urvalstesten.',
        textMobil: 'Matrislogik, verbalt, numeriskt, personlighet.',
        mobil: true,
      },
      {
        ikon: 'timer',
        rubrik: 'Testa dig mot klockan',
        rubrikMobil: 'Tidsatt provläge',
        text: 'Provläge med 25 till 40 minuter och automatisk inlämning, samma tidspress som hos rekryteraren.',
        textMobil: 'Samma tidspress som på riktigt.',
        mobil: true,
      },
      {
        ikon: 'forkl',
        rubrik: 'Förstå varje svar',
        rubrikMobil: 'Förklaring på varje fråga',
        text: 'Förklaringen efter varje fråga, inte bara facit. Det är så mönstret sätter sig.',
        textMobil: 'Och kurvan som visar när du är redo.',
        mobil: true,
      },
      {
        ikon: 'kurva',
        rubrik: 'Vet vad personlighetstestet säger om dig',
        text: 'Det fördjupade testet, 120 påståenden. Se hur profilen tolkas och förbered svaren på frågorna som följer. Grundtestet är gratis.',
        // Personlighetsprovet utan konto (docs/design/rod-trad-prov-spec-2026-09-24.md).
        lank: { text: 'Gör provet utan konto', href: '/verktyg/personlighetstest' },
      },
      {
        ikon: 'kurva',
        rubrik: 'Se att du blir bättre',
        text: 'Alla sessioner i en kurva per testtyp, så du vet när du är redo.',
      },
    ],
    knapp: `Börja med ${paketMedPris('test_week')}`,
    fotnot: 'CV-mallar och personliga brev ingår inte',
  },
  allt: {
    namn: HELA_NAMN,
    beskrivning: PLAN_BY_KEY.all_week.beskrivning,
    tag: 'Allt ingår',
    varde: `Jobbmatchning, Jobbcoachen och Bli upptäckt. Och allt i ${CV_NAMN} och ${TRANING_NAMN}.`,
    vardeMobil: `Jobbmatchning, Jobbcoachen och Bli upptäckt. Och allt i ${CV_NAMN} och ${TRANING_NAMN}.`,
    fordig:
      'För dig som söker brett just nu och vill att jobben ska hitta dig lika mycket som du hittar dem.',
    fordigMobil: 'För dig som vill att jobben ska hitta dig lika mycket som du hittar dem.',
    prisSub: `i veckan\neller ${ALLT_MANAD} kr i månaden`,
    prisSubMobil: `i veckan\neller ${ALLT_MANAD} kr i månaden`,
    listEtikett: `Det här har bara ${HELA_NAMN}`,
    rader: [
      {
        ikon: 'match',
        rubrik: 'Hitta jobb du annars hade missat',
        text: 'Vi matchar dina kompetenser, erfarenheter och utbildningar mot alla branscher, inte bara den titel du brukar söka på. Fler annonser att svara på, i branscher du inte tänkt på. 25 träffar med skälen utskrivna, när du vill och varje natt.',
        textMobil:
          'Din kompetens matchad mot alla branscher, inte bara titeln du brukar söka på. 25 träffar med skälen utskrivna.',
        mobil: true,
      },
      {
        ikon: 'chat',
        rubrik: 'Gå in i intervjun och löneförhandlingen förberedd',
        rubrikMobil: 'Gå in i intervjun förberedd',
        text: 'Jobbcoachen svarar på lön, intervjufrågor, avtal och avslag utifrån svensk arbetsmarknad och ditt eget CV, så mycket du vill. Du vet vad du ska säga innan du sitter där.',
        textMobil: 'Jobbcoachen: lön, intervjufrågor, avtal, avslag.',
        mobil: true,
      },
      {
        ikon: 'oga',
        rubrik: 'Låt rekryterare hitta dig',
        text: 'Bli upptäckt: din profil syns för rekryterare som söker din kompetens, anonym tills du själv svarar. Jobb du inte behövde söka.',
        textMobil: 'Bli upptäckt, anonym tills du svarar. Jobb du inte behövde söka.',
        mobil: true,
      },
    ],
    knapp: `Börja med ${paketMedPris('all_week')}`,
    fotnot: 'Byt till ett av de andra paketen när som helst',
  },
}

/** Hela paketets fyra längder, i den ordning längdvalet visar dem. Dagen är Dagspasset. */
export const ALLT_LANGDER: readonly {
  length: PlanLength
  plan: PlanKey
  label: string
  /** Desktopkortets etikett: "en dag" i stället för "dag". */
  labelLang: string
}[] = [
  { length: 'dag', plan: 'all_day', label: 'dag', labelLang: 'en dag' },
  { length: 'vecka', plan: 'all_week', label: 'vecka', labelLang: 'vecka' },
  { length: 'månad', plan: 'all_month', label: 'månad', labelLang: 'månad' },
  { length: 'kvartal', plan: 'all_quarter', label: 'kvartal', labelLang: 'kvartal' },
] as const

export function planForLangd(langd: PlanLength): PlanKey {
  return ALLT_LANGDER.find((l) => l.length === langd)?.plan ?? 'all_week'
}

/** Raden efter beloppet på Hela paketets kort följer vald längd. */
export function alltPrisSub(plan: PlanKey): string {
  switch (PLAN_BY_KEY[plan].length) {
    case 'dag':
      return 'för ett dygn\nengångsköp, inget dras igen'
    case 'vecka':
      return `i veckan\neller ${ALLT_MANAD} kr i månaden`
    case 'månad':
      return 'i månaden\nförnyas var trettionde dag'
    case 'kvartal':
      return 'per kvartal\nförnyas var tredje månad'
  }
}

/** Raden under längdvalet när dagen är vald: Dagspasset har eget namn. */
export const DAG_RAD = `En dag, ${DAG_NAMN}. ${PLAN_BY_KEY.all_day.amount} kr, förnyas inte.`

/**
 * Knappen på ett kort, med pris och period (R1): "Börja med CV-paketet, 79 kr
 * i veckan". Hela paketets knapp följer vald längd.
 */
export function borjaKnapp(paket: PaketId, plan?: PlanKey): string {
  if (paket === 'allt' && plan) return `Börja med ${paketMedPris(plan)}`
  return PAKET_KORT[paket].knapp
}

/* ------------------------------------------------------------ hero */

export const HERO = {
  eyebrow: 'Priser',
  h1: 'En vecka som bär hela jobbsöket.',
  /** Ingressen på desktop. Den fetade meningen står för sig. */
  ingress:
    'På sju dagar får du ett CV som rekryteringssystem släpper igenom och rekryterare minns, personliga brev som svarar på det annonsen faktiskt frågar efter, och testresultat du kan lita på när kallelsen kommer.',
  ingressFet: 'Det du bygger den här veckan använder du i varje ansökan framöver.',
  ingressSlut: 'Välj paketet som matchar var du är, betala per vecka, säg upp när du vill.',
  ingressMobil:
    'Ett CV som går igenom, personliga brev som svarar på annonsen, testresultat du litar på. Byggt på sju dagar, använt i varje ansökan sedan.',
  bevis: [
    { tal: '7 dagar', text: 'allt öppet från\nförsta minuten' },
    { tal: `${CV_PRIS} kr`, text: 'i veckan, ingen\nbindningstid' },
    { tal: '1 klick', text: 'för att säga upp,\ni ditt konto' },
  ],
  scenAlt:
    'Veckan på skrivbordet: ett CV med poäng, ett personligt brev och ett matristest på en tråd med sju dagar',
} as const

export const VALJARE = {
  h2: 'Tre paket. Ett för CV:t, ett för träningen, ett för hela jobbsöket.',
  ingress: `Alla per vecka, alla utan bindningstid. ${HELA_NAMN} finns också per dag, månad och kvartal.`,
  eyebrowMobil: 'Tre paket, välj det som matchar var du är',
  /** Numreringen på mobil. */
  nummer: (n: number) => `Paket ${n} av ${PAKET_IDS.length}`,
  rekommenderas: 'Rekommenderas',
  /** Ankarraden under korten på mobil. */
  ankare: [
    { text: 'Gratisnivån', href: '#gratis' },
    { text: 'Så fungerar det', href: '#funktioner' },
    { text: 'Så guidar vi dig', href: '#guide' },
  ],
} as const

/* ------------------------------------------------------------ gratis */

/** Gratisraden. Fetade delar ritas av komponenten. */
export const GRATIS = {
  rubrik: 'Vill du se först?',
  delar: <readonly { text: string; fet?: boolean }[]>[
    { text: 'Utan att betala får du ' },
    { text: `${FREE_TEMPLATE_COUNT} CV-mallar`, fet: true },
    { text: ' och en nedladdning, ' },
    { text: 'en CV-analys', fet: true },
    { text: ' som visar din poäng och det tyngsta fyndet, ' },
    { text: 'ett personligt brev', fet: true },
    { text: ' skrivet på en annons (att läsa, inte ladda ned), ' },
    { text: 'tre matchade jobb', fet: true },
    { text: ', ' },
    { text: 'tio frågor', fet: true },
    { text: ' till jobbcoachen, och ' },
    { text: 'grundnivån i alla fyra testtyperna', fet: true },
    { text: ': hela testet med förklaring efter varje fråga, en gång per typ och dygn.' },
  ],
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
}

export const FUNKTIONER = {
  h2: 'Vad du faktiskt får, funktion för funktion',
  ingress: 'Inga floskler. Så här ser det ut när du använder det.',
  kort: [
    {
      id: 'cv-analys',
      scen: 'cv',
      scenAlt: 'CV-analysens rapport',
      rubrik: 'CV-analysen',
      sub: `Ingår i ${CV_NAMN} och ${HELA_NAMN}. Gratis: poängen och det tyngsta fyndet.`,
      text: 'De flesta CV:n sållas bort innan en människa läst dem. Analysen visar varför ditt gör det, och vad du ändrar. Ladda upp som PDF eller Word, och inom en minut får du poäng 1 till 10 på tydlighet och struktur, innehåll, resultat och nyckelord, plus en lista med fynd där varje fynd har en åtgärd.',
      steg: [
        'Ladda upp, vi läser som en rekryterare gör på sex sekunder.',
        'Poäng per område och de fynd som drar ned mest.',
        'Nyckelorden rekryteringssystem (ATS) letar efter i din bransch.',
        'Rätta, kör om, se poängen röra sig.',
      ],
      ingar: ['cv', 'allt'],
    },
    {
      id: 'personliga-brev',
      scen: 'brev',
      scenAlt: 'Annonsen blir ditt personliga brev',
      rubrik: 'Personliga brev',
      sub: `Ingår i ${CV_NAMN} och ${HELA_NAMN}. Gratis: ett personligt brev att läsa, nedladdning ingår inte.`,
      text: 'Ett personligt brev som faktiskt svarar på annonsen är det som skiljer din ansökan från de tjugo som skickade samma mall. Klistra in annonsen, så skriver vi brevet utifrån ditt CV och det annonsen frågar efter, i den ton du väljer. Redigera, ladda ned som PDF, skicka.',
      steg: [
        'Klistra in annonsen, eller välj ett matchat jobb.',
        'Välj ton: saklig, personlig eller vi väljer åt dig.',
        'Det personliga brevet svarar på annonsens krav med exempel ur ditt CV.',
        'Redigera, ladda ned som PDF, skicka.',
      ],
      ingar: ['cv', 'allt'],
    },
    {
      id: 'rekryteringstester',
      scen: 'matris',
      scenAlt: 'Matrislogik under tidspress',
      rubrik: 'Rekryteringstester',
      sub: `Ingår i ${TRANING_NAMN} och ${HELA_NAMN}. Gratis: grundnivån i varje typ, en gång per dygn.`,
      text: 'Den som känner igen uppgiftstypen på testdagen tävlar på lika villkor. Här lär du dig mönstren i samma fyra typer som de stora urvalstesten använder: matrislogik, verbalt resonemang, numeriskt och personlighet, i tre nivåer från grund till expert. I provläget går klockan på riktigt, 25 till 40 minuter, och provet lämnas in automatiskt när tiden är ute. Efter varje fråga får du förklaringen, inte bara facit, och kurvan visar när du är redo.',
      steg: [
        'Diagnostest på grundnivå visar var du står per typ.',
        'Träna på avancerad och expertnivå i din svagaste typ, med förklaring på varje fråga.',
        'Kör tidsatt prov när du är redo. Automatisk inlämning, resultat direkt.',
        'Följ kurvan över veckan, session för session.',
      ],
      ingar: ['test', 'allt'],
      bred: true,
    },
    {
      id: 'matchade-jobb',
      scen: 'match',
      scenAlt: 'Tre jobbträffar med matchningsgrad',
      rubrik: 'Matchade jobb',
      sub: `Ingår i ${HELA_NAMN}. Gratis: tre träffar.`,
      text: 'Den som söker på sin vanliga yrkestitel missar jobben som efterfrågar samma kompetens under ett annat namn, i en annan bransch. Vi utgår i stället från dina kompetenser, erfarenheter och utbildningar och matchar dem mot alla annonser i Platsbanken. Kör när du vill, och varje natt får du de 25 bästa träffarna med skälen utskrivna: vilka krav du täcker och vad som saknas. Från en träff skriver du det personliga brevet med ett klick.',
      ingar: ['allt'],
    },
    {
      id: 'jobbcoachen',
      scen: 'coach',
      scenAlt: 'Jobbcoachen svarar',
      rubrik: 'Jobbcoachen',
      sub: `Ingår i ${HELA_NAMN}. Gratis: tio meddelanden.`,
      text: 'Fråga vad du vill om lön, intervju, uppsägningstid eller hur du svarar på ett avslag. Svaren utgår från svensk arbetsmarknad och ditt eget CV, inte från en amerikansk mall.',
      ingar: ['allt'],
    },
  ] satisfies readonly FunktionKort[],
} as const

/* ---------------------------------------------------------- hjälpredan */

/**
 * "Allt är öppet från första minuten." Rubrik och ingress ur prisspecen,
 * listorna ur onboardingspecens sektion 2: det hjälpredan Kom igång leder
 * igenom per paket, i logisk ordning, profilen och CV:t först.
 */
export const GUIDE = {
  h2: 'Allt är öppet från första minuten. Så här guidar vi dig igenom det.',
  ingress:
    'Du gör vad du vill, när du vill, inom ditt paket. Hjälpredan Kom igång är en vägvisare som ser till att du hittar allt: fyller i profilen, provar varje funktion, och inte missar det som ger mest. Gör du hela listan första kvällen är det lika bra. Dagen innan veckan förnyas visar vi vad du gjort, och först då frågar vi om du vill fortsätta.',
  listor: {
    cv: {
      etikett: `${8} steg`,
      steg: [
        'Profilen ifylld: önskad roll, ort, tillgänglig från',
        'CV uppladdat',
        'CV-analysen körd: poäng och alla fynd',
        'CV:t uppdaterat efter fynden, kört om',
        `Mall vald och nedladdad, ${TEMPLATE_COUNT} att välja på`,
        'Personligt brev på en annons',
        'LinkedIn-profilen omskriven',
        'Matrislogik på grundnivå, ingår gratis',
      ],
    },
    test: {
      etikett: `${8} steg`,
      steg: [
        'Profilen ifylld: vilket test du kallats till, när',
        'Matrislogik, grundnivå',
        'Matrislogik, avancerad nivå',
        'Verbalt och numeriskt, grundnivå',
        'Provläge mot klockan',
        'Personlighetstestet, och vad det säger om dig',
        'Din kurva, alla sessioner per typ',
        'CV:t uppladdat, ingår gratis',
      ],
    },
    allt: {
      etikett: `${11} steg`,
      steg: [
        'Profilen ifylld',
        'CV uppladdat och analyserat',
        'CV:t uppdaterat efter fynden',
        'Första jobbmatchningen: jobb du inte hittat själv',
        'Bli upptäckt: profilen synlig för rekryterare',
        'Jobbcoachen: intervjun och lönen förberedd',
        'Mall vald och nedladdad',
        'Personligt brev från en träff',
        'LinkedIn-profilen omskriven',
        'Testerna: grund, avancerad, expert',
        'Provläge mot klockan och personlighetstestet',
      ],
    },
  } satisfies Record<PaketId, { etikett: string; steg: readonly string[] }>,
} as const

/* ---------------------------------------------------------- förtroende */

export const FORTROENDE = [
  {
    key: 'uppsagning',
    rubrik: 'Säg upp med ett klick',
    text: 'I ditt konto, utan skäl. Veckan du betalat gäller ut.',
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

/** Bakåtkompatibel form av förtroenderaden. */
export const FORTROENDE_RADER = FORTROENDE.map((f) => ({ key: f.key, text: f.rubrik }))

/* ----------------------------------------------------------- spårvalet */

export interface SparValKort {
  paket: PaketId
  rubrik: string
  namn: string
  /** Fyra "du får"-rader. Den fetade delen först. */
  duFar: readonly { fet: string; text: string }[]
  prisText: string
  pris: string
}

export const SPARVAL = {
  fraga: 'Vad ska du göra den här veckan?',
  under: 'Vi ordnar hemskärmen efter det. Går att byta sen.',
  /** Plan följer med när längden redan är vald (?paket=all_month), annars veckan. */
  primar: (paket: PaketId, plan?: PlanKey) => `Fortsätt med ${paketMedPris(plan ?? PAKET_PLAN[paket])}`,
  sekundar: 'Börja gratis i stället',
  fotnot: `Gratis: ${FREE_TEMPLATE_COUNT} mallar, en analys, ett personligt brev, testernas grundnivå`,
  kort: [
    {
      paket: 'cv',
      rubrik: 'Få CV:t genom och skriv personliga brev',
      namn: CV_NAMN,
      duFar: [
        {
          fet: 'Hela CV-analysen.',
          text: ' Poäng per område, varje fynd med åtgärd, nyckelorden rekryteringssystem letar efter. Kör om utan tak.',
        },
        { fet: `${TEMPLATE_COUNT} CV-mallar`, text: ' som rekryteringssystem läser. Ladda ned utan tak.' },
        { fet: 'Personliga brev', text: ' skrivna på annonsen, ett per annons, som PDF.' },
        { fet: 'LinkedIn-profilen', text: ' omskriven så rekryterare hittar dig.' },
      ],
      prisText: 'Förnyas var sjunde dag, säg upp när du vill',
      pris: `${CV_PRIS} kr / vecka`,
    },
    {
      paket: 'test',
      rubrik: 'Var förberedd på testdagen',
      namn: TRANING_NAMN,
      duFar: [
        {
          fet: 'Matrislogik, verbalt och numeriskt',
          text: ' i tre nivåer, med förklaring efter varje fråga.',
        },
        { fet: 'Tidsatt provläge', text: ', 25 till 40 minuter, automatisk inlämning.' },
        { fet: 'Fördjupade personlighetstestet', text: ', 120 påståenden, innan rekryteraren ser profilen.' },
        { fet: 'Din utveckling', text: ' i en kurva per typ.' },
      ],
      prisText: 'Förnyas var sjunde dag, säg upp när du vill',
      pris: `${TEST_PRIS} kr / vecka`,
    },
    {
      paket: 'allt',
      rubrik: 'Allt ingår, plus jobb som hittar dig',
      namn: HELA_NAMN,
      duFar: [
        {
          fet: 'Jobbmatchning:',
          text: ' 25 jobb per natt ur alla branscher, med skälen utskrivna. Jobb du annars missar.',
        },
        { fet: 'Jobbcoachen:', text: ' lön, intervju, avtal, så mycket du vill. Förberedd innan du sitter där.' },
        { fet: 'Bli upptäckt:', text: ' rekryterare hittar dig, anonymt tills du svarar.' },
        { fet: `Allt i ${CV_NAMN} och ${TRANING_NAMN}.`, text: '' },
      ],
      prisText: `${ALLT_VECKA} kr i veckan, eller ${DAG_NAMN} ${ALLT_DAG} kr, månad ${ALLT_MANAD}, kvartal ${ALLT_KVARTAL}`,
      pris: `${ALLT_VECKA} kr / vecka`,
    },
  ] satisfies readonly SparValKort[],
} as const

/* ----------------------------------------------------------- köpsteget */

export const KOPSTEG = {
  rubrik: (plan: PlanKey) =>
    PLAN_BY_KEY[plan].length === 'dag'
      ? `${paketNamn(plan)}, från nu`
      : `${paketNamn(plan)}, från i kväll`,
  under: 'Allt öppnas direkt efter betalningen.',
  farEtikett: (plan: PlanKey) =>
    PLAN_BY_KEY[plan].length === 'dag' ? 'Det här får du från nu' : 'Det här får du från i kväll',
  /** Raden efter beloppet i kvittots huvud. */
  prisEnhet: (plan: PlanKey) => {
    switch (PLAN_BY_KEY[plan].length) {
      case 'dag':
        return 'engångs'
      case 'vecka':
        return 'i veckan'
      case 'månad':
        return 'i månaden'
      case 'kvartal':
        return 'per kvartal'
    }
  },
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
        return `var trettionde dag, nästa ${datum}`
      case 'kvartal':
        return `var tredje månad, nästa ${datum}`
    }
  },
  /** Första steget efter betalningen, ett per paket. */
  forstaSteg: {
    cv: {
      rubrik: 'Första steget: ladda upp CV:t',
      text: 'Tar en kvart. Sedan är allt ovan öppet, i vilken ordning du vill.',
    },
    test: {
      rubrik: 'Första steget: matrislogik, grundnivå',
      text: 'Cirka 20 minuter, med förklaring efter varje fråga. Sedan är allt ovan öppet, i vilken ordning du vill.',
    },
    allt: {
      rubrik: 'Första steget: ladda upp CV:t',
      text: 'Tar en kvart. Sedan är allt ovan öppet, i vilken ordning du vill.',
    },
  } satisfies Record<PaketId, { rubrik: string; text: string }>,
  alltIStallet: `Vill du ha ${HELA_NAMN} i stället?`,
  alltLangd: `Hur länge vill du ha ${HELA_NAMN}?`,
  dagSparrad: 'Dagen är ett engångsköp och går inte att kombinera med din prenumeration.',
  samtycke: (plan: PlanKey) => {
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
          ? 'var trettionde dag'
          : 'var tredje månad'
    return `${start} Prenumerationen förnyas med ${p.amount} kr ${takt} tills jag säger upp den.`
  },
  samtyckeSparr: 'Kryssa i rutan ovanför för att fortsätta.',
  primar: (plan: PlanKey) => `Till betalning, ${PLAN_BY_KEY[plan].amount} kr`,
  fotnot: 'Kortbetalning via Stripe. Kvitto på mejl.',
  bytPaket: 'Byt paket',
} as const

/** Köpstegets fyra rader "Det här får du från i kväll", per paket. */
export const KOPSTEG_FAR: Record<PaketId, readonly { fet: string; text: string }[]> = {
  cv: [
    { fet: 'Hela CV-analysen', text: ', kör om utan tak' },
    { fet: `${TEMPLATE_COUNT} CV-mallar`, text: ', ladda ned utan tak' },
    { fet: 'Personliga brev', text: ' på annonsen, som PDF' },
    { fet: 'LinkedIn-profilen', text: ' omskriven' },
  ],
  test: [
    { fet: 'Matrislogik, verbalt och numeriskt', text: ' i tre nivåer' },
    { fet: 'Tidsatt provläge', text: ', 25 till 40 minuter' },
    { fet: 'Fördjupade personlighetstestet', text: ', 120 påståenden' },
    { fet: 'Din utveckling', text: ' i en kurva per typ' },
  ],
  allt: [
    { fet: 'Jobbmatchning', text: ', 25 jobb per natt med skälen utskrivna' },
    { fet: 'Jobbcoachen', text: ': lön, intervju, avtal, så mycket du vill' },
    { fet: 'Bli upptäckt', text: ', anonymt tills du svarar' },
    { fet: `Allt i ${CV_NAMN} och ${TRANING_NAMN}`, text: '' },
  ],
}

/* -------------------------------------------------------- kontosidan */

export const KONTO = {
  ingress: 'Vad du har i dag, och vad som öppnar resten.',
  statusGratis: 'Du är på gratisnivån',
  paketRubrik: 'Köp eller byt paket',
  dittPaket: 'Du har det här paketet',
  ingarIAllt: `Ingår i ${HELA_NAMN}`,
  bytTillAllt: `Byt till ${paketMedPris('all_week')}`,
  /** Prisraden på Hela paketets kort för en kund med CV- eller Träningspaketet. */
  mellanskillnadSub: (fran: PlanKey) =>
    `mer i veckan än i dag\nmellanskillnaden dras direkt, ${PLAN_BY_KEY.all_week.amount} kr från nästa vecka`,
  bytSpar: (plan: PlanKey) => `Byt till ${paketMedPris(plan)}`,
  byterVidFornyelse: 'Byter vid nästa förnyelse',
  dagInaktiv: `${DAG_NAMN} kan inte väljas härifrån`,
  bytLangd: (plan: PlanKey) => `Byt till ${paketMedPris(plan)}`,
  oforandrad: 'Det här har du i dag',
  hantera: 'Hantera',
  bytKort: 'Byt betalkort',
  kvitton: 'Kvitton',
  sagUpp: 'Säg upp',
  stoppRubrik: 'Det här har tagit stopp',
  gratisRubrik: 'Vad gratisnivån ger',
} as const

/* --------------------------------------------- bakåtkompatibla strängar */

/** Raden under paketnamnet i schemat och i äldre ytor. */
export const PAKET_RAD: Record<PlanKey, string> = {
  cv_week: PAKET_KORT.cv.varde,
  test_week: PAKET_KORT.test.varde,
  all_day: `${HELA_NAMN} i ett dygn. Ett engångsköp, ingenting dras igen.`,
  all_week: PAKET_KORT.allt.varde,
  all_month: `${HELA_NAMN} i en månad, billigare än fyra veckor i rad.`,
  all_quarter: `${HELA_NAMN} i tre månader, för ett sök som du vet tar tid.`,
}

/** Tre punkter per paket, för kontosidans "Det här ingår". */
export const PAKET_PUNKTER: Record<PlanKey, readonly string[]> = {
  cv_week: [
    `Alla ${TEMPLATE_COUNT} CV-mallar`,
    'Hela CV-analysen, alla fynd och poängen',
    'Personliga brev, skrivna och nedladdade',
  ],
  test_week: [
    'Fyra testtyper, grundnivå till expert',
    'Tidsatt provläge och fördjupade personlighetstestet',
    'Förklaring per fråga och din utveckling',
  ],
  all_day: [
    `Allt i ${HELA_NAMN}, i 24 timmar`,
    'Engångsköp, ingen prenumeration',
    'Dygnet räknas från köpet',
  ],
  all_week: [
    'Alla 25 jobbträffar med skälen utskrivna',
    'Jobbcoachen och Bli upptäckt',
    `Allt i ${CV_NAMN} och ${TRANING_NAMN}`,
  ],
  all_month: [
    `Allt i ${HELA_NAMN}, i trettio dagar`,
    'Billigare än fyra veckor i rad',
    'Säg upp när som helst, ett klick',
  ],
  all_quarter: [
    `Allt i ${HELA_NAMN}, i tre månader`,
    'Billigare än tretton veckor i rad',
    'Säg upp när som helst, ett klick',
  ],
}

/** Intervallraden under beloppet. Dagen förnyas inte. */
export const INTERVALL_RAD: Record<PlanKey, string> = {
  cv_week: 'i veckan, förnyas var sjunde dag',
  test_week: 'i veckan, förnyas var sjunde dag',
  all_day: 'i 24 timmar, förnyas inte',
  all_week: 'i veckan, förnyas var sjunde dag',
  all_month: 'i månaden, förnyas var trettionde dag',
  all_quarter: 'i kvartalet, förnyas var tredje månad',
}

/** Knapptexten i betalväggarna: verbet Skaffa, namnet, pris och period (R1). */
export function knappText(plan: PlanKey): string {
  return `Skaffa ${paketMedPris(plan)}`
}

/** H1 på prissidan, samma rad återanvänds på startsidan. */
export const PR_H1 = HERO.h1

export const PR_INGRESS = HERO.ingressMobil

export const D_GRATIS_LANK = GRATIS.knapp

export const D_PRENUMERATION = {
  ingress: KONTO.ingress,
  statusGratis: KONTO.statusGratis,
  stoppRubrik: KONTO.stoppRubrik,
  seAllaPaket: 'Se alla paket',
  allaPaket: 'Alla paket',
  gratisRubrik: KONTO.gratisRubrik,
  ingarRubrik: 'Det här ingår',
  bytTillAllt: `Byt till ${paketMedPris('all_week')}`,
  hantera: KONTO.hantera,
  bytKort: KONTO.bytKort,
  kvitton: KONTO.kvitton,
  sagUpp: KONTO.sagUpp,
  alltIngar: 'Allt ingår',
  bytLangd: 'Byt längd',
  byterVidFornyelse: KONTO.byterVidFornyelse,
  dagInaktiv: KONTO.dagInaktiv,
} as const

/** En etikett per feature. Substantiv, aldrig en uppmaning. */
export const FEATURE_ETIKETT: Record<Feature, string> = {
  cv_templates_all: 'Fler CV-mallar',
  cv_export: 'Fler CV-nedladdningar',
  cv_analysis_full: 'Hela CV-analysen',
  letter_download: 'Brevnedladdning',
  tests_above_base: 'Testnivå över grundnivån',
  test_exam_mode: 'Tidsatt provläge',
  test_history: 'Din testhistorik',
  chat_unlimited: 'Fler meddelanden i chatten',
  interview_unlimited: 'Fler intervjuprov',
  job_matches_all: 'Fler jobbträffar',
  bli_upptackt: 'Bli upptäckt',
  linkedin: 'LinkedIn-profilen',
}

/** Antalsraden bredvid etiketten. Korrekt svensk förkortning. */
export function gangerText(antal: number): string {
  return antal === 1 ? '1 gg' : `${antal} ggr`
}

export function forslagRubrik(plan: PlanKey): string {
  return `Vi föreslår ${paketMedPris(plan)}`
}

export function forslagKnapp(plan: PlanKey): string {
  return knappText(plan)
}

function antalOrd(antal: number): string {
  const ord = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio']
  return antal <= 9 ? ord[antal] : String(antal)
}

/** Förslagets skäl, räknat ur samma tal som blockeringslistan. */
export function forslagSkal(input: {
  plan: PlanKey
  antal: number
  badaSparen: boolean
  track: 'cv' | 'tester' | 'allt' | null
}): string {
  const { plan, antal, badaSparen, track } = input

  if (antal > 0 && badaSparen) {
    return `Du har stoppats både på CV-sidan och i testerna. ${HELA_NAMN} öppnar båda, så du slipper välja.`
  }

  if (antal > 0) {
    const var_ = plan === 'test_week' ? 'i testerna' : 'på CV-sidan'
    const gang = antal === 1 ? 'en gång' : `${antalOrd(antal)} gånger`
    return `Du har slagit i taket ${var_} ${gang} den här veckan. ${paketNamn(plan)} öppnar allt du stoppades av.`
  }

  if (track === 'cv') {
    return `Du sa att du vill jobba med ditt CV. ${CV_NAMN} ger mallarna, hela analysen och de personliga breven.`
  }

  if (track === 'tester') {
    return `Du sa att du vill träna på testerna. ${TRANING_NAMN} ger alla nivåer, provläget och förklaringarna.`
  }

  return 'Vi vet inte vad du behöver än, så vi visar det som rymmer allt. Välj ett av de andra paketen om du vet.'
}

export function uppgraderingSkal(antal: number): string {
  if (antal <= 0) {
    return `${HELA_NAMN} lägger jobbmatchningen, Jobbcoachen och Bli upptäckt ovanpå det du redan har, och öppnar det andra paketet.`
  }
  const gang = antal === 1 ? 'en gång' : `${antalOrd(antal)} gånger`
  return `Du har stoppats utanför ditt paket ${gang}. ${HELA_NAMN} öppnar det, och du behåller allt du har i dag.`
}

/** Mellanskillnaden mot Hela paketet per vecka. Räknas ur PLANS, aldrig som fast tal. */
export function mellanskillnad(fran: PlanKey, till: PlanKey = 'all_week'): number {
  return Math.max(0, PLAN_BY_KEY[till].amount - PLAN_BY_KEY[fran].amount)
}

/**
 * Prisraden i längdvalet. Dagen bär prepositionen "för", eftersom den inte
 * upprepas; resten är prisPeriod ur plans.ts.
 */
export function langdPrisRad(plan: PlanKey): string {
  const p = PLAN_BY_KEY[plan]
  return p.length === 'dag' ? `${p.amount} kr för ett dygn` : prisPeriod(plan)
}

/** Besparingsraden. Visas bara när den är sann, och talet räknas. */
export function besparing(plan: PlanKey): string | null {
  const vecka = PLAN_BY_KEY.all_week.amount
  if (plan === 'all_month') {
    const diff = vecka * 4 - PLAN_BY_KEY.all_month.amount
    return diff > 0 ? `Sparar ${diff} kr mot fyra veckor i rad` : null
  }
  if (plan === 'all_quarter') {
    const diff = vecka * 13 - PLAN_BY_KEY.all_quarter.amount
    return diff > 0 ? `Sparar ${diff} kr mot tretton veckor i rad` : null
  }
  return null
}

/** Knappen i längdvalet. Namnger målet med pris och period. */
export function bytLangdKnapp(plan: PlanKey): string {
  return `Byt till ${paketMedPris(plan)}`
}

/** Statusraden. Dagen bär klockslag, resten datum. */
export function statusRadText(plan: PlanKey, slut: Date | null): string {
  const namn = PLAN_BY_KEY[plan].name
  if (!slut) return namn

  if (PLAN_BY_KEY[plan].length === 'dag') {
    const tid = slut.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
    return `${namn}, gäller till ${tid} i dag`
  }

  const datum = slut.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })
  return `${namn}, förnyas ${datum}`
}
