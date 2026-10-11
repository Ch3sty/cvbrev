// src/lib/traning/hem-copy.ts
// =============================================================================
// Texterna i hemvyn och ingången i Rekryteringstester (våg 2). Spec-rummen
// avsnitt 8: aldrig i JSX. Utkasten är art-directors ur konceptet
// (koncept-testvy-2026-10-10.html, ramarna E1 till E3-P, 1a till 1p, T1, X1,
// F1) med ägarens beslut i 17.1 och 17.2 inarbetade, och gäller tills
// svensk-ux-copywriter ersatt dem (avsnitt 9). Regler: vi-form, svenska
// facktermer, inga tankstreck, "samma format som", aldrig "samma test",
// paketnamn och pris ur PLANS (paketKort, kopKnapp, paketNamn i prisraden),
// Personlighetstestet alltid med "Inga rätta svar". Skrivregeln för
// Jobbcoach Premium (copy-premium-2026-10-11): kortformen Premium i låsta
// rader och brödtext, fulla namnet en gång per yta i prisraden.
// =============================================================================

import { SALD_PLAN, kopKnapp as planKopKnapp, paketKort, paketNamn, prisPeriod } from '@/lib/plans/plans';
import { talord, versal } from './copy';

/** Paketet som säljs (spec-rummen 17.3): Jobbcoach Premium, all_month. */
export const SALJS = SALD_PLAN;

/** Låst rad och låschip: "Ingår i Premium" (copy-premium avsnitt 3). */
export function ingarIPaketet(): string {
  return `Ingår i ${paketKort()}`;
}

/** Skärmläsarens slut på en låst rad: "Låst, ingår i Premium." (copy-premium avsnitt 5). */
export function lastAria(): string {
  return `Låst, ingår i ${paketKort()}.`;
}

/** "Köp Premium, 149 kr i månaden" (copy-premium avsnitt 8, ryms på 360 px). */
export function kopKnapp(): string {
  return planKopKnapp(SALJS);
}

/** Prisraden ovanför köpknappen, fulla namnet: "Jobbcoach Premium, 149 kr i månaden. Säg upp när du vill." */
export function prisrad(): string {
  return `${paketNamn(SALJS)}, ${prisPeriod(SALJS)}. Säg upp när du vill.`;
}

export const HEM = {
  /** Ägarens första rad i rummet (17.1). */
  rumRad: 'Träna inför ditt rekryteringstest.',
  /**
   * Väggens h1 utan datum (art-director 20.5 fråga 3): h1 upprepar aldrig
   * toppradens brand "Rekryteringstester". T1 och X1 får ägarens rad, 1h
   * rytmen.
   */
  rubrikUtanDatum: 'Träna inför ditt rekryteringstest',
  rubrikUtanDatumPass: 'Ett pass om dagen',
  tomt: {
    rad: 'Börja med att mäta var du står. Vet du när provet är, så lägger vi upp planen fram till dagen.',
    boxTitel: 'Din första punkt på kurvan kommer med Nivåkollen.',
    boxText: 'Sedan ett pass om dagen, och var sjunde dag en ny nivåkoll.',
    status: 'Inget datum än. Går att sätta när som helst.',
  },
  ny: {
    /* Radbudget på mobil (beslut-hemvy, tillägget 2026-10-11 punkt 6): raden under rubriken och kurvmetan högst en rad. */
    rad: 'Först kollar vi var du står.',
    planRubrik: 'Planen',
    /** 1a gratis (20.5 fråga 4): märkena är grå och fyllda, inte ihåliga. */
    planMetaGratis: () =>
      `De grå dagarna ingår i ${paketKort()}.`,
    planMeta: 'Ihåliga märken är dagarna som kommer.',
  },
  matning: {
    eyebrow: 'Nivåkollen',
    titel: 'Kolla din nivå. Cirka 8 minuter.',
    /* Det lyfta kortets text högst två rader på mobil (tillägget punkt 7). */
    text: 'Tolv figuruppgifter som följer dina svar. Efteråt vet du din nivå.',
    knapp: 'Kolla min nivå, 8 min',
    gratis: `Nivåkollen är gratis, med eller utan ${paketKort()}.`,
    /**
     * Med smakprov (testansvarig 19.3 fråga 3): n frågor räknas in, minuterna
     * räknas på de nya (40 s per fråga, minst 3).
     */
    smakprovMinuter: (n: number) => Math.max(3, Math.round(((12 - n) * 40) / 60)),
    smakprovTitel: (m: number) => `Kolla din nivå. Cirka ${m} minuter.`,
    smakprovKnapp: (m: number) => `Kolla min nivå, ${m} min`,
    /** 1as/T1s (testansvarig 19.5 fråga 2): en text, inte två. Ersätter `text` när smakprov finns. */
    smakprovText: (n: number) =>
      `${versal(talord(12 - n))} nya figuruppgifter ovanpå de ${talord(n)} från smakprovet. Efteråt vet du din nivå.`,
  },
  /**
   * 1t (19.3 fråga 2): bara siffror eller bara text valt. Passen finns i dag
   * bara för figurer och mönster; hemvyn erbjuder det valda testet.
   */
  annatTest: {
    rad: 'Nivå, kurva och dagliga pass finns i dag för figurer och mönster. Siffror och text får det senare.',
    eyebrow: 'Första passet',
    titelSiffror: 'Gör siffertestet',
    titelText: 'Gör texttestet',
    text: 'Resultat och genomgång direkt. Vi säger till när passen finns.',
    knappSiffror: 'Starta siffertestet',
    knappText: 'Starta texttestet',
  },
  ommatning: {
    eyebrow: 'Ny nivåkoll',
    titel: 'Kolla din nivå igen. Cirka 8 minuter.',
    text: 'Tolv uppgifter, som första gången. Den visar om passen har flyttat dig.',
    knapp: 'Kolla igen, 8 min',
    lastText: () => `Nya nivåkoller efter den första ingår i ${paketKort()}.`,
  },
  pass: {
    /** Nivån är huvudtalet på väggen (copy-plan 3.8), så eyebrowen säger den inte. */
    eyebrow: 'Dagens pass',
    eyebrowGrund: 'Dagens pass på grundnivå',
    temaSaknas: 'Blandade mönster',
    text: 'Nio uppgifter på din nivå, ungefär tio minuter. Vi förklarar varje svar.',
    textGrund: 'Nio uppgifter, ungefär tio minuter. Dagens grundpass är gratis.',
    knapp: 'Starta dagens pass',
    knappGrund: 'Starta grundpasset',
    /** 17.2: från dag två ingår passen i Premium. */
    lastText: (svagaste: string | null) =>
      svagaste
        ? `Nio uppgifter, med extra övning på ${svagaste}. Från dag två ingår passen i ${paketKort()}.`
        : `Nio uppgifter på din nivå. Från dag två ingår passen i ${paketKort()}.`,
    lastFot: `Nivåkollen, resultatet och genomgången är dina, med eller utan ${paketKort()}.`,
  },
  vila: {
    eyebrow: 'Vilodag',
    titel: 'Söndag är vilodag',
    text: 'Dina dagar i rad bryts inte av en söndag. Vill du träna ändå räknas passet som vanligt.',
    knapp: 'Starta ett frivilligt pass',
  },
  klart: {
    eyebrow: 'Dagens pass är klart',
    eyebrowGeneral: 'Övningsprovet är klart',
    /* Rätt-talet är kortets huvudtal (copy-plan 3.3), titeln säger nivån. */
    upp: (niva: string) => `Nivån steg till ${niva}.`,
    samma: (niva: string) => `Nivån står på ${niva}.`,
    ner: (niva: string) => `Nivån ${niva}, ner en tiondel.`,
    nerMer: (niva: string) => `Nivån ${niva}.`,
    utanNiva: 'Extrapasset klart.',
    /** Ett pass utan nivå (sällsynt): ingen nivåmening att ge. */
    utanNivaPass: 'Passet är klart.',
    riktat: 'Ett extrapass övar ett mönster. Det ändrar inte din nivå.',
    talRatt: 'rätt',
    knapp: 'Visa genomgången',
    ettTill: 'Ett pass till, frivilligt',
  },
  tempo: {
    over: 'över provets tid i går',
    overIdag: 'över provets tid i dag',
    /** 19.2 fråga 7: talet räknar alla besvarade frågor, ingen förklaringsmening. */
    metaEget: 'Tiden räknas mot vårt eget format tills du anger vem som gör testet.',
  },
  rad: {
    serie: (dagar: string) => `${dagar} dagar i rad.`,
    serieBorjarOm: 'Dagarna i rad börjar om i dag.',
    passKvar: 'Dagens pass är kvar.',
    passGjort: 'Dagens pass är gjort.',
    vila: 'Söndag är vilodag.',
    ommatning: 'I dag gör du en ny nivåkoll.',
    infor: (pass: string) => `${pass} bakom dig. Nu återstår bara övningsprovet.`,
  },
  dagsrad: {
    nivaFran: (fran: string) => `din nivå, började på ${fran}`,
    nivaMattIdag: 'din nivå, kollad i dag',
    nivaMattIgar: 'din nivå, kollad i går',
    ringKvar: 'Dagens pass inte gjort än',
    ringGjord: 'Dagens pass gjort',
    ringGeneral: 'Övningsprovet inte gjort än',
    ringGeneralGjord: 'Övningsprovet gjort',
  },
  kurva: {
    rubrik: 'Din nivå, dag för dag',
    rubrikEfter: 'Din kurva fram till provet',
    /** Ett ord per form, utan "form:" och utan mittpunkt (copy-plan 3.7). */
    form: { stigande: 'På väg upp', stabil: 'Stabil', vilar: 'Vilar' } as Record<string, string>,
    hela: 'Hela kurvan',
    /* Instrumentens text, HTML över SVG:n (art-director 20.2 fråga 3). */
    sikte: (n: string) => `Mål ${n}`,
    sikteDator: (n: string) => `Mål ${n} före provet`,
    siktetSatts: 'Målet sätts med datumet',
    matning: 'start',
    matningDator: (n: string) => `start ${n}`,
    prov: 'Prov',
    provPasserat: (d: string) => `prov ${d}`,
    idag: 'i dag',
    ommatningAxel: (d: string) => `${d}, ny nivåkoll`,
    planMat: 'Nivåkollen',
    planOm: 'ny nivåkoll',
    planGen: 'övningsprov',
    planGenKort: 'övningsprov',
    gratisMeta: () => `De grå dagarna ingår i ${paketKort()}.`,
  },
  utanDatum: {
    box: 'Sätt ett datum, så lägger vi upp planen fram till provet: pass, övningsprov och vila.',
    sattDatum: 'Sätt datum',
    provradMeta: 'Inget datum än. Med ett datum lägger vi övningsprovet två dagar före provet.',
  },
  tappar: {
    rubrik: 'Var du tappar',
    allaFamiljer: 'Se alla mönster',
    /** Aldrig "0" (avvikelse 3): noll rätt sägs i ord. */
    rattAv: (ratt: number, antal: number) => (ratt === 0 ? `Inget rätt av ${antal}.` : `${ratt} av ${antal} rätt.`),
    rattAvMatning: (ratt: number, antal: number) =>
      ratt === 0 ? `Inget rätt av ${antal} i nivåkollen.` : `${ratt} av ${antal} rätt i nivåkollen.`,
    langsam: (namn: string) => `Rätt men långsamt: ${namn}`,
    langsamMeta: (n: number, antal: number) => `Alla rätt, men ${n} av ${antal} tog längre tid än provet ger.`,
    riktat: 'Öva på det',
    tempopass: 'Öva tempot',
    repetera: 'Repetera det du tappar på',
    kortPass: (namn: string) => `Kort pass på ${namn}`,
    kortPassMeta: 'Fem uppgifter, ungefär fem minuter.',
    starta: 'Starta',
  },
  provdagen: {
    rubrik: 'Inför provet',
    /** Radens namn (art-director 22.2 fråga 4); formatet står i metan. */
    radTitel: 'Övningsprovet',
    /** Metans tredje mening, samma för gratis och betalande (22.4 fråga 2). */
    iPlanen: (datum: string) => `Ligger i planen ${datum} och dagen före provet.`,
    gorEnNu: 'Gör ett nu',
    /** Sektionens rubriklänk på mobil, i stället för toppradens kontext. */
    andraDatum: 'Ändra datum',
    angeLeverantor: 'Vem gör testet?',
  },
  infor: {
    eyebrow: 'Övningsprov',
    titel: (format: string) => format,
    text2: 'Som på riktigt: ingen förklaring förrän efteråt och ingen paus. Sitt vid datorn i ett tyst rum. I morgon gör du ett till.',
    text1: 'Som på riktigt: ingen förklaring förrän efteråt och ingen paus. Sitt vid datorn i ett tyst rum. Det här är sista övningen före provet.',
    knapp: 'Starta övningsprovet',
    status: 'Övningsprov fram till provet. På provdagen bara tre uppvärmningsfrågor.',
    lastText: () => `Övningsprovet i samma format som ditt test ingår i ${paketKort()}. Resultat och genomgång av det du redan gjort är alltid dina.`,
  },
  provdag: {
    eyebrow: (mal: string) => `I dag: ${mal}`,
    text: (gjort: string) => `${gjort} Kurvan vilar i dag. Nivån står kvar där du lämnade den.`,
    textUtanPass: 'Kurvan vilar i dag. Lycka till.',
    uppvarmning: {
      eyebrow: 'Uppvärmning',
      titel: 'Tre frågor du redan kan, 2 minuter',
      text: 'Ingen tid, ingen nivå, inget sparas. Bara för att få igång blicken innan du öppnar länken från rekryteraren.',
      knapp: 'Värm upp, 2 min',
    },
    rad: {
      tystRum: 'Tyst rum, dator, laddare',
      /* Samma råd för alla format (19.3 fråga 4); formatspecifika råd först efter 14.4 punkt 5. */
      tystRumMeta: 'Stäng mejlen och mobilen innan du börjar.',
      lattForst: 'Det du kan först, det svåra sedan',
      lattForstMeta: 'Provet har total tid. Tar en uppgift över två minuter, gissa och gå vidare.',
      lattForstPerUppgift: 'Varje uppgift har sin egen tid. Gissa hellre än att låta tiden gå ut.',
      efterat: 'Efteråt frågar vi hur det gick',
      efteratMeta: 'En gång, frivilligt. Svaret styr bara vad vi föreslår härnäst.',
    },
    status: 'Inga pass i dag. Serien pausar, inget bryts.',
    skala: {
      du: (n: string) => `Du ${n}`,
      fran: (n: string) => `${n} vid start`,
    },
  },
  efter: {
    rad: 'Svaret är frivilligt och går att ta bort. Det styr bara vad vi föreslår härnäst.',
    svar: {
      vidare: 'Jag gick vidare',
      vet_inte: 'Vet inte än',
      inte_vidare: 'Jag gick inte vidare',
    },
    sparar: 'Sparar svaret',
    fel: 'Svaret gick inte att spara. Försök igen.',
    lyftEyebrow: 'När du svarat',
    lyftTitel: 'Gick du vidare är nästa steg ofta en intervju',
    lyftText:
      'Då blir Inför intervjun din nästa handling. Vet du inte än fortsätter passen och vi frågar igen om sju dagar. Gick du inte vidare står nivån kvar och du sätter nästa datum.',
    restenRubrik: 'Resten av Jobbcoachen',
    intervjuTitel: 'Inför intervjun',
    intervjuMeta: 'Frågorna som brukar komma, och dina svar.',
    brevTitel: 'Personliga brev',
    brevMeta: (n: number) => (n === 0 ? 'Skriv ett till nästa tjänst.' : `${n === 1 ? '1 brev' : `${n} brev`}. Skriv ett till nästa tjänst.`),
    status: (niva: string | null) =>
      niva ? `Nivån ${niva} och kurvan sparas. Ett nytt datum fortsätter från här.` : 'Ett nytt datum fortsätter från här.',
  },
  efterSvar: {
    vidare: 'Du gick vidare. Nästa steg är ofta en intervju.',
    vetInte: 'Vi frågar igen om några dagar. Passen fortsätter som vanligt.',
    inteVidare: 'Nivån står kvar. Sätt nästa datum när du vet det.',
    taBort: 'Ta bort svaret',
    intervju: {
      eyebrow: 'Nästa steg',
      titel: 'Förbered intervjun',
      text: 'Frågorna som brukar komma, och hur du svarar på dem. Ta dem i din takt.',
      knapp: 'Till Inför intervjun',
    },
  },
  personlighet: {
    rad: 'Inga rätta svar. Det som hjälper är att känna igen formen och veta hur profilen läses.',
    eyebrow: 'Profilen',
    titel: 'Gör profilen, 10 minuter',
    text: 'Femtio påståenden om dig. Efteråt ser du hur en rekryterare brukar läsa den, och vad som inte går att läsa ut.',
    knapp: 'Gör profilen, 10 min',
    klarTitel: 'Profilen är klar',
    klarText: (datum: string) => `Gjord ${datum}. Inga rätta svar. Läs hur en rekryterare brukar tolka den.`,
    klarKnapp: 'Visa profilen',
    tolkasTitel: 'Så tolkas profilen',
    tolkasMeta: 'Fem drag, vad arbetsgivaren brukar läsa ut, och vad testet inte kan säga.',
    flerTitel: 'Ingår det fler test?',
    flerMeta: 'Figurer, siffror eller text. Lägg till, så får du plan och pass.',
    laggTill: 'Lägg till',
  },
  fel: {
    eyebrow: 'Dagens pass',
    titel: 'Passet gick inte att hämta.',
    text: 'Försök igen. Din nivå och dina pass är sparade, ingenting försvann.',
    knapp: 'Försök igen',
    kurvan: 'Visa kurvan i stället',
  },
  flerTester: {
    /** "Fler tester" heter Träna fritt (copy-plan avsnitt 5). */
    rubrik: 'Träna fritt',
    /** Sektionslänken till Alla tester (beslut-hemvy 2026-10-11 punkt 1). */
    alla: 'Alla tester',
    figurer: 'Figurer och mönster',
    siffror: 'Siffror och tabeller',
    ord: 'Ord och text',
    personlighet: 'Personlighetstest',
    gjort: (datum: string) => `Senast gjort ${datum}.`,
    figurerEj: 'Inte gjort än. Kolla din nivå på 8 minuter.',
    siffrorEj: 'Inte gjort än. Läsa av tabeller, procent, andelar.',
    ordEj: 'Inte gjort än. Korta texter med frågor om vad som stämmer.',
    personlighetKlar: (datum: string) => `Profil klar ${datum}. Inga rätta svar, ingen nivå.`,
    personlighetEj: 'Inga rätta svar, ingen nivå. Se hur profilen tolkas.',
  },
  jobbsok: {
    /** Radens titel: rummets namn (beslut-hemvy 2026-10-11 punkt 2). */
    titel: 'Jobbsöket',
  },
  imorgon: {
    utanPlan: 'I morgon: nästa pass.',
  },
} as const;

/**
 * Jobbsökets rad på testväggen, högst ett tal (beslut-hemvy 2026-10-11 punkt
 * 2, copy-plan 3.4): intervjun vinner, annars sökta tjänster. Breven räknas
 * aldrig här. Copyplanens "1 intervju på gång. 13 sökta tjänster." har två
 * tal; art-directors form (ett tal) gäller, så meningen slutar efter intervjun.
 */
export function jobbsokRad(antal: { tjanster: number; intervjuer: number; brev?: number }): string {
  const { tjanster, intervjuer } = antal;
  if (intervjuer > 0) return intervjuer === 1 ? '1 intervju på gång.' : `${intervjuer} intervjuer på gång.`;
  if (tjanster > 0) return tjanster === 1 ? '1 sökt tjänst.' : `${tjanster} sökta tjänster.`;
  return 'Inga sökta tjänster än.';
}

/* ------------------------------------------------------------ ingången */

export const INGANG = {
  flode: 'Rekryteringstester',
  undertitel: {
    steg1: 'Tre frågor, sedan din plan',
    personlighet: 'Personlighet',
  },
  stegEtikett: (steg: number, av: number, frivilligt?: boolean) =>
    `Steg ${steg} av ${av}${frivilligt ? ', frivilligt' : ''}`,
  typ: {
    fraga: 'Vad ska du testas på?',
    ledtrad: 'Välj det som står i kallelsen eller mejlet. Du kan välja flera. Vi lägger upp din plan efter det.',
    val: {
      matris: { titel: 'Figurer och mönster', rad: 'Rutnät där en bit saknas. Kallas ofta logiktest eller matriser.' },
      numerisk: { titel: 'Siffror och tabeller', rad: 'Läsa av tabeller, procent, andelar.' },
      verbal: { titel: 'Ord och text', rad: 'Korta texter med frågor om vad som stämmer.' },
      personlighet: { titel: 'Personlighet', rad: 'Påståenden om dig. Inga rätta svar.' },
      vetInte: { titel: 'Vet inte', rad: 'Då börjar vi med figurer och mönster, det som oftast ingår.' },
    },
    tomt: 'Välj minst ett, eller Vet inte.',
  },
  leverantor: {
    fraga: 'Vet du vem som gör testet?',
    ledtrad:
      'Namnet står ofta i kallelsen, i länkens avsändare eller i rekryterarens mejl. Till exempel Assessio eller Matrigma, Alva Labs, SHL, Aon eller cut-e. Vet du inte, så tränar du i vårt eget format.',
    val: {
      matrigma: 'Matrigma (Assessio)',
      alva: 'Alva Logic',
      shl: 'SHL Verify',
      aon: 'Aon scales (cut-e)',
      annat: 'Annat',
      vetInte: 'Vet inte',
    },
    variantRubrik: 'Vilken Matrigma?',
    variant: {
      klassisk: 'Klassisk, 35 uppgifter på 40 min',
      adaptiv: 'Adaptiv, cirka 12 min',
      vetInte: 'Vet inte',
    },
    variantMeta: 'Vet du inte, så tränar vi tempot mot den klassiska. Övningsprovet visar också den adaptiva, så du har sett båda.',
    varumarke: 'Leverantörsnamnen är deras varumärken. Vi samarbetar inte med dem och tränar i samma format, inte med deras uppgifter.',
  },
  datum: {
    fraga: 'När är provet?',
    fragaPersonlighet: 'När är testet?',
    ledtrad: 'Vi räknar bakåt från provdagen: ett kort pass om dagen, ett övningsprov dagen före och vila på själva dagen.',
    ledtradPersonlighet:
      'Inga rätta svar och inget att öva in. Vi visar hur profilen tolkas, så du känner igen frågorna och vet vad som händer med svaren.',
    falt: 'Provdagen',
    faltPersonlighet: 'Testdagen',
    chips: { vecka: 'Om en vecka', tvaVeckor: 'Om två veckor', manad: 'Om en månad' },
    /** "14 dagar." + planens innehåll (granskningen 3.3). */
    planDagar: (n: number) => (n === 1 ? '1 dag.' : `${n} dagar.`),
    /** "Tio pass fram till provet, ett övningsprov två dagar före och vila på provdagen." (copy-plan 3.6) */
    plan: (pass: string, general: string | null) =>
      [`${pass} fram till provet`, general, 'vila på provdagen']
        .filter(Boolean)
        .join(', ')
        .replace(/, vila på provdagen$/, ' och vila på provdagen') + '. Du kan ändra datumet när du vill.',
    planIdag: 'Provet är i dag. Vi hoppar över planen och ger dig tre uppvärmningsfrågor.',
    personlighetKort: (datum: string) => `Personlighetstest den ${datum}.`,
    personlighetText: 'Inga rätta svar, men det hjälper att veta hur det tolkas. Inga pass och ingen nivå.',
    hoppaOver: 'Hoppa över, jag vet inte än',
    taBort: 'Ta bort datumet',
    knapp: 'Visa min plan',
    knappPersonlighet: 'Visa hur det tolkas',
    passerat: 'Datumet har redan varit. Välj i dag eller senare.',
  },
  /** Ingångens sekundära länk förbi planen (beslut-hemvy 2026-10-11 punkt 1). */
  allaTester: 'Till alla tester',
  fortsatt: 'Fortsätt',
  hoppaOver: 'Hoppa över',
  sparar: 'Sparar',
  fel: 'Det gick inte att spara. Kontrollera anslutningen och försök igen.',
  stang: 'Stäng',
  tillbaka: 'Tillbaka',
  installningar: {
    rubrik: 'Test och datum',
    rad: 'Vad du ska testas på, vem som gör testet och när. Ändra när du vill.',
    taBortSvaret: 'Ta bort svaret på Hur gick det?',
    svaretBorttaget: 'Svaret är borttaget.',
  },
} as const;
