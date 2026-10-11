// src/lib/traning/hem-copy.ts
// =============================================================================
// Texterna i hemvyn och ingången i Rekryteringstester (våg 2). Spec-rummen
// avsnitt 8: aldrig i JSX. Utkasten är art-directors ur konceptet
// (koncept-testvy-2026-10-10.html, ramarna E1 till E3-P, 1a till 1p, T1, X1,
// F1) med ägarens beslut i 17.1 och 17.2 inarbetade, och gäller tills
// svensk-ux-copywriter ersatt dem (avsnitt 9). Regler: vi-form, svenska
// facktermer, inga tankstreck, "samma format som", aldrig "samma test",
// paketnamn och pris ur PLANS (paketNamn), Personlighetstestet alltid med
// "Inga rätta svar".
// =============================================================================

import { paketNamn, prisPeriod } from '@/lib/plans/plans';
import { talord, versal } from './copy';

/** Paketet som säljs i Rekryteringstester (17.3). Namnbytet till Jobbcoach Premium sker i PLANS i våg 5. */
export const SALJS = 'all_month' as const;

export function ingarIPaketet(): string {
  return `Ingår i ${paketNamn(SALJS)}`;
}

/** "Köp Hela paketet, 149 kr i månaden" (verbet Köp, pris efter namnet). */
export function kopKnapp(): string {
  return `Köp ${paketNamn(SALJS)}, ${prisPeriod(SALJS)}`;
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
    rad: 'Börja med att mäta var du står. Sätt ett datum när du vet det, så räknar vi bakåt.',
    boxTitel: 'Din första punkt kommer efter mätningen.',
    boxText: 'Sedan ett pass om dagen och ommätning var sjunde dag.',
    status: 'Inget datum än. Går att sätta när som helst.',
  },
  ny: {
    rad: 'Vi börjar med att mäta var du står. Sedan ett pass om dagen fram till provdagen.',
    planRubrik: 'Planen',
    /** 1a gratis (20.5 fråga 4): märkena är grå och fyllda, inte ihåliga. */
    planMetaGratis: () =>
      `Din första punkt på kurvan kommer efter mätningen. Grå platser ingår i ${paketNamn(SALJS)}: passen från dag två, ommätningen och generalrepetitionen.`,
    planMeta: 'Din första punkt på kurvan kommer efter mätningen. Ihåliga märken är planerade dagar, luckorna är söndagar.',
  },
  matning: {
    eyebrow: 'Första passet',
    titel: 'Mät din nivå. Cirka 8 minuter.',
    text: 'Tolv figuruppgifter över hela svårighetsspannet, svårare efter varje rätt svar. Ingen förklaring under tiden. Efteråt vet vi din nivå, ditt tempo och var du tappar.',
    knapp: 'Mät min nivå, 8 min',
    gratis: 'Mätningen är gratis, med eller utan paket.',
    /**
     * Med smakprov (testansvarig 19.3 fråga 3): n frågor räknas in, minuterna
     * räknas på de nya (40 s per fråga, minst 3).
     */
    smakprovMinuter: (n: number) => Math.max(3, Math.round(((12 - n) * 40) / 60)),
    smakprovTitel: (m: number) => `Mät din nivå. Cirka ${m} minuter.`,
    smakprovKnapp: (m: number) => `Mät min nivå, ${m} min`,
    /** 1as/T1s (testansvarig 19.5 fråga 2): en text, inte två. Ersätter `text` när smakprov finns. */
    smakprovText: (n: number) =>
      `${versal(talord(12 - n))} nya figuruppgifter ovanpå de ${talord(n)} från smakprovet, svårare efter varje rätt svar. Ingen förklaring under tiden. Efteråt vet vi din nivå, ditt tempo och var du tappar.`,
  },
  /**
   * 1t (19.3 fråga 2): bara siffror eller bara text valt. Passen finns i dag
   * bara för figurer och mönster; hemvyn erbjuder det valda testet.
   */
  annatTest: {
    rad: 'Nivå, kurva och dagliga pass finns i dag för figurer och mönster. Siffror och text får pass senare.',
    eyebrow: 'Första passet',
    titelSiffror: 'Gör siffertestet',
    titelText: 'Gör texttestet',
    text: 'Resultat och genomgång direkt. Vi säger till när passen finns.',
    knappSiffror: 'Starta siffertestet',
    knappText: 'Starta texttestet',
  },
  ommatning: {
    eyebrow: 'Veckans ommätning',
    titel: 'Mät din nivå igen. Cirka 8 minuter.',
    text: 'Tolv uppgifter som i mätningen. Ommätningen väger tyngre än ett pass och visar om passen har flyttat dig.',
    knapp: 'Mät igen, 8 min',
    lastText: () => `Ommätningarna ingår i ${paketNamn(SALJS)}.`,
  },
  pass: {
    eyebrowNiva: (niva: number) => `Dagens pass · nivå ${niva}`,
    eyebrowGrund: 'Dagens pass · grundnivå',
    temaSaknas: 'Blandade mönster',
    text: 'Nio uppgifter, tio minuter. Sex nära din nivå, två säkra, en över. Regeln efter varje fråga.',
    textGrund: 'Nio uppgifter på grundnivå, tio minuter. Regeln efter varje fråga. Grundpasset i dag är gratis.',
    knapp: 'Starta dagens pass',
    knappGrund: 'Starta grundpasset',
    /** 17.2: från dag två ingår passen i paketet. */
    lastText: (svagaste: string | null) =>
      svagaste
        ? `Nio uppgifter, tio minuter, nära din nivå och riktat mot ${svagaste.toLowerCase()}. Från andra dagen ingår passen i ${paketNamn(SALJS)}.`
        : `Nio uppgifter, tio minuter, nära din nivå. Från andra dagen ingår passen i ${paketNamn(SALJS)}.`,
    lastFot: 'Mätningen, resultatet och genomgången är dina, med eller utan paket.',
  },
  vila: {
    eyebrow: 'Vilodag',
    titel: 'Söndag är vilodag',
    text: 'Serien bryts inte av en söndag. Vill du ändå träna räknas passet som vanligt.',
    knapp: 'Starta ett frivilligt pass',
  },
  klart: {
    eyebrow: 'Dagens pass · klart',
    eyebrowGeneral: 'Generalrepetition · klar',
    upp: (ratt: number, antal: number, niva: string) => `${ratt} av ${antal} rätt. Nivån steg till ${niva}.`,
    samma: (ratt: number, antal: number, niva: string) => `${ratt} av ${antal} rätt. Nivån står på ${niva}.`,
    ner: (ratt: number, antal: number, niva: string) => `${ratt} av ${antal} rätt. Nivån ${niva}, ner en tiondel.`,
    nerMer: (ratt: number, antal: number, niva: string) => `${ratt} av ${antal} rätt. Nivån ${niva}.`,
    utanNiva: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    riktat: 'Riktade pass räknas i familjen, inte i nivån.',
    talRatt: 'rätt',
    talNiva: (fran: string) => `nivå, från ${fran}`,
    talOver: 'över provets tid',
    knapp: 'Visa genomgången',
    ettTill: 'Ett pass till, frivilligt',
  },
  tempo: {
    over: 'över provets tid i går',
    overIdag: 'över provets tid i dag',
    snitt: (budget: number) => `snitt, provet ger ${budget}`,
    snittEget: (budget: number) => `snitt, provläget ger ${budget}`,
    passGjorda: 'pass gjorda',
    /** 19.2 fråga 7: talet räknar alla besvarade frågor, ingen förklaringsmening. */
    metaEget: 'Tiden per uppgift följer vårt provläge tills du anger leverantör.',
  },
  rad: {
    niva: (heltal: number) => `Nivå ${heltal}.`,
    serie: (dagar: string) => `${dagar} dagar i rad.`,
    serieBorjarOm: 'Serien börjar om i dag.',
    passKvar: 'Dagens pass är kvar.',
    passGjort: 'Dagens pass är gjort.',
    vila: 'Söndag är vilodag.',
    ommatning: 'I dag: ommätning.',
    infor: (pass: string, ommatningar: string) => `${pass} och ${ommatningar} bakom dig. Serien räknas inte de här dagarna.`,
  },
  dagsrad: {
    nivaFran: (fran: string) => `nivå, från ${fran}`,
    nivaMattIdag: 'nivå, mätt i dag',
    nivaMattIgar: 'nivå, mätt i går',
    kvarSikte: (sikte: string) => `kvar till siktet ${sikte}`,
    siktetNatt: 'siktet, nått',
    passGjorda: 'pass gjorda',
    mattningGjord: 'mätning gjord',
    dagarIRad: 'dagar i rad',
    dagarTillProvet: (n: number) => (n === 1 ? 'dag till provet' : 'dagar till provet'),
    ringKvar: 'Dagens pass inte gjort än',
    ringGjord: 'Dagens pass gjort',
    ringGeneral: 'Generalrepetitionen inte gjord än',
    ringGeneralGjord: 'Generalrepetitionen gjord',
  },
  kurva: {
    rubrik: 'Din nivå, dag för dag',
    rubrikEfter: 'Din kurva fram till provet',
    form: (ord: string) => `form: ${ord}`,
    hela: 'Hela kurvan',
    /* Instrumentens text, HTML över SVG:n (art-director 20.2 fråga 3). */
    sikte: (n: string) => `Sikte ${n}`,
    sikteDator: (n: string) => `Sikte ${n} före provet`,
    siktetSatts: 'Siktet sätts med datumet',
    matning: 'mätning',
    matningDator: (n: string) => `mätning ${n}`,
    prov: 'Prov',
    provPasserat: (d: string) => `prov ${d}`,
    idag: 'i dag',
    ommatningAxel: (d: string) => `${d} · ommätning`,
    planMat: 'Mät min nivå',
    planOm: 'ommätning',
    planGen: 'generalrepetition',
    planGenKort: 'generalrep.',
    gratisMeta: () => `Grå platser: ommätningarna och generalrepetitionen ingår i ${paketNamn(SALJS)}. Kurvans historik också.`,
  },
  utanDatum: {
    box: 'Sätt ett datum så räknar vi bakåt: ommätningar, generalrepetition och vila.',
    sattDatum: 'Sätt datum',
    provradMeta: 'Inget datum än; med datum lägger vi generalrepetitionen två dagar före.',
  },
  tappar: {
    rubrik: 'Var du tappar',
    allaFamiljer: 'Alla familjer',
    rattAv: (ratt: number, antal: number) => `${ratt} av ${antal} rätt.`,
    rattAvMatning: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i mätningen.`,
    langsam: (namn: string) => `Rätt men långsamma: ${namn.toLowerCase()}`,
    langsamMeta: (n: number, antal: number) => `${n} av ${antal} över provets tid. Alla rätt.`,
    riktat: 'Riktat pass',
    tempopass: 'Tempopass',
    repetera: 'Repetera svagheten',
    kortPass: (namn: string) => `${namn}, kort pass`,
    kortPassMeta: (ratt: number, antal: number) => `Fem uppgifter, fem minuter. ${ratt} av ${antal} rätt hittills.`,
    starta: 'Starta',
  },
  provdagen: {
    rubrik: 'Provdagen',
    /** Radens namn (art-director 22.2 fråga 4); formatet står i metan. */
    radTitel: 'Generalrepetitionen',
    oppnar: (datum: string) => `Öppnar ${datum}.`,
    dagenFore: 'Dagen före provet.',
    gorEnNu: 'Gör en nu',
    angeLeverantor: 'Ange leverantör',
  },
  infor: {
    eyebrow: 'Generalrepetition',
    titel: (format: string) => format,
    text2: 'Fast ordning, ingen förklaring förrän efteråt. Sitt som på provet: tyst rum, dator, ingen paus. Dagen före gör du den en gång till.',
    text1: 'Fast ordning, ingen förklaring förrän efteråt. Sitt som på provet: tyst rum, dator, ingen paus. Sista repetitionen före provet.',
    knapp: 'Starta generalrepetitionen',
    status: 'Dagen före: generalrepetition. Provdagen: tre uppvärmningsfrågor, inget mer.',
    lastText: () => `Generalrepetitionen i leverantörens format ingår i ${paketNamn(SALJS)}. Resultat och genomgång av det du redan gjort är alltid dina.`,
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
      lattForst: 'Lätt uppgift först, svår sedan',
      lattForstMeta: 'Provet har total tid. Tar en uppgift över två minuter, gissa och gå vidare.',
      lattForstPerUppgift: 'Varje uppgift har sin egen tid. Gissa hellre än att låta tiden gå ut.',
      efterat: 'Efteråt frågar vi hur det gick',
      efteratMeta: 'En gång, frivilligt. Svaret styr bara vad vi föreslår härnäst.',
    },
    status: 'Inga pass i dag. Serien pausar, inget bryts.',
    skala: {
      du: (n: string) => `Du ${n}`,
      fran: (n: string) => `${n} · mätningen`,
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
    rubrik: 'Fler tester',
    figurer: 'Figurer och mönster',
    siffror: 'Siffror och tabeller',
    ord: 'Ord och text',
    personlighet: 'Personlighetstest',
    gjort: (datum: string) => `Senast gjort ${datum}.`,
    figurerEj: 'Ej mätt. Mät din nivå, 8 minuter.',
    siffrorEj: 'Inte gjort än. Läsa av tabeller, procent, andelar.',
    ordEj: 'Inte gjort än. Korta texter med frågor om vad som stämmer.',
    personlighetKlar: (datum: string) => `Profil klar ${datum}. Inga rätta svar, ingen nivå.`,
    personlighetEj: 'Inga rätta svar, ingen nivå. Se hur profilen tolkas.',
  },
  jobbsok: {
    lank: 'Till Jobbsöket',
  },
  imorgon: {
    utanPlan: 'I morgon: nästa pass.',
  },
} as const;

/** "3 sökta tjänster, 1 intervju, 2 personliga brev." och de tomma varianterna. */
export function jobbsokRad(antal: { tjanster: number; intervjuer: number; brev: number }): string {
  const { tjanster, intervjuer, brev } = antal;
  const brevText = brev === 1 ? '1 personligt brev' : `${brev} personliga brev`;
  if (tjanster === 0) {
    return brev > 0 ? `Inga sökta tjänster än. ${brevText}.` : 'Inga sökta tjänster eller personliga brev än.';
  }
  const delar = [tjanster === 1 ? '1 sökt tjänst' : `${tjanster} sökta tjänster`];
  if (intervjuer > 0) delar.push(intervjuer === 1 ? '1 intervju' : `${intervjuer} intervjuer`);
  if (brev > 0) delar.push(brevText);
  return `${delar.join(', ')}.`;
}

/* ------------------------------------------------------------ ingången */

export const INGANG = {
  flode: 'Rekryteringstester',
  undertitel: {
    steg1: 'Tre frågor, sedan din plan',
    personlighet: 'Personlighet',
  },
  stegEtikett: (steg: number, av: number, frivilligt?: boolean) =>
    `Steg ${steg} av ${av}${frivilligt ? ' · frivilligt' : ''}`,
  typ: {
    fraga: 'Vad ska du testas på?',
    ledtrad: 'Välj det som står i kallelsen eller mejlet. Du kan välja flera. Vi lägger planen efter det.',
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
      'Namnet står ofta i kallelsen, i länkens avsändare eller i rekryterarens mejl. Till exempel Assessio eller Matrigma, Alva Labs, SHL, Aon eller cut-e. Vet du inte så tränar du i vårt eget provläge.',
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
    variantMeta: 'Vet du inte så tränar vi tempot mot den klassiska och visar den adaptiva i provläget. Det täcker båda formaten.',
    varumarke: 'Leverantörsnamnen är deras varumärken. Vi samarbetar inte med dem och tränar i samma format, inte med deras uppgifter.',
  },
  datum: {
    fraga: 'När är provet?',
    fragaPersonlighet: 'När är testet?',
    ledtrad: 'Vi räknar bakåt från dagen: mätning i dag, ett pass om dagen, ommätning var sjunde dag, generalrepetition dagen före, vila på provdagen.',
    ledtradPersonlighet:
      'Inga rätta svar och inget att öva in. Vi visar hur profilen tolkas, så du känner igen frågorna och vet vad som händer med svaren.',
    falt: 'Provdagen',
    faltPersonlighet: 'Testdagen',
    chips: { vecka: 'Om en vecka', tvaVeckor: 'Om två veckor', manad: 'Om en månad' },
    /** "14 dagar." + planens innehåll (granskningen 3.3). */
    planDagar: (n: number) => (n === 1 ? '1 dag.' : `${n} dagar.`),
    plan: (pass: string, vila: string, ommatning: string | null, general: string | null) =>
      [
        'Mätning i dag',
        pass,
        vila,
        ommatning,
        general,
        'vila på provdagen',
      ]
        .filter(Boolean)
        .join(', ')
        .replace(/, vila på provdagen$/, ' och vila på provdagen') + '. Går att ändra när som helst från huvudet.',
    planIdag: 'Provet är i dag. Vi hoppar över planen och ger dig tre uppvärmningsfrågor.',
    personlighetKort: (datum: string) => `Personlighetstest den ${datum}.`,
    personlighetText: 'Inga rätta svar, men det hjälper att veta hur det tolkas. Inga pass, ingen nivå, ingen serie.',
    hoppaOver: 'Hoppa över, jag vet inte än',
    taBort: 'Ta bort datumet',
    knapp: 'Visa min plan',
    knappPersonlighet: 'Visa hur det tolkas',
    passerat: 'Datumet har redan varit. Välj i dag eller senare.',
  },
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
