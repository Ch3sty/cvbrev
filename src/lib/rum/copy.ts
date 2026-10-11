// src/lib/rum/copy.ts
//
// Rummens strängar (spec-rummen-2026-10-10 avsnitt 8, 9 och 16).
// Copywriterns granskning av våg 1b (docs/design/copy-rummen-1b-2026-10-11.md)
// är inarbetad. Ändra här, aldrig i JSX.

import type { Rum } from './rum'

/**
 * Dörrarnas etiketter. Aldrig "Brev" (beslut 4).
 *
 * Två uppsättningar, så att testrummets namn kan bytas på ett ställe och
 * heta olika på mobil och dator. Ägarens beslut 2026-10-11 (ersätter
 * copywriterns "Testträning"):
 *   mobil  dörrnavet längst ner, 11 px under ikonen i en 87 px bred plats
 *          på 360 px: "Tester".
 *   dator  sidomenyns dörrrad, och samma namn överallt där rummet nämns
 *          (toppradens brand, sidomenyns grupprubrik): "Rekryteringstester".
 * Rummet heter fortfarande `tran` i koden.
 */
export const DORR_ETIKETT: Record<'mobil' | 'dator', Record<Exclude<Rum, 'neutral'>, string>> = {
  mobil: {
    tran: 'Tester',
    cv: 'CV',
    brev: 'Personliga brev',
    jobb: 'Jobbsöket',
  },
  dator: {
    tran: 'Rekryteringstester',
    cv: 'CV',
    brev: 'Personliga brev',
    jobb: 'Jobbsöket',
  },
}

/** Rummets namn: toppradens brand. Testrummet följer dörren på dator. */
export const RUM_NAMN: Record<Rum, string> = {
  tran: DORR_ETIKETT.dator.tran,
  cv: 'CV',
  brev: 'Personliga brev',
  jobb: 'Jobbsöket',
  neutral: 'Konto',
}

/**
 * Grupprubriken ovanför rummets undersidor i sidomenyn: rummets namn, utan
 * "I" (copywritern: "I CV" och "I Konto" är inte svenska).
 */
export const GRUPP_RUBRIK: Record<Rum, string> = { ...RUM_NAMN }

/** Testrummets första förklarande rad (ägarens beslut 2026-10-11). */
export const TRAN_RAD = 'Träna inför ditt rekryteringstest.'

/** Undersidornas etiketter (spec 4.3). */
export const UNDERSIDA = {
  allaTester: 'Alla tester',
  provlaget: 'Provläget',
  minaCv: 'Mina CV',
  analyseraCv: 'Analysera CV',
  cvMallar: 'CV-mallar',
  linkedin: 'LinkedIn-profilen',
  minaBrev: 'Mina brev',
  skrivNyttBrev: 'Skriv nytt brev',
  oversikt: 'Översikt',
  soktaTjanster: 'Sökta tjänster',
  inforIntervjun: 'Inför intervjun',
  matchadeJobb: 'Matchade jobb',
  jobbcoachen: 'Jobbcoachen',
  bliUpptackt: 'Bli upptäckt',
  profil: 'Profil',
  prenumeration: 'Prenumeration',
  utseende: 'Utseende',
} as const

/** Chip-texter i sidomenyn. */
export const CHIP = {
  nyhet: 'Nyhet',
  nya: (n: number) => `${n} nya`,
  vantar: (n: number) => `${n} väntar`,
  lastEtikett: 'Öppnas med ett paket',
} as const

/** Toppraden. */
export const TOPPRAD = {
  kontoKnapp: 'Konto och inställningar',
  stang: 'Stäng',
} as const

/** Navets tillgängliga namn. globals.css pekar på nav[aria-label="Huvudmeny"]. */
export const NAV = {
  dorrar: 'Huvudmeny',
  sidomeny: 'Sidomeny',
} as const

/** Utseende-väljaren på profilen (spec 4.3 och 9, våg 1b). */
export const UTSEENDE = {
  rubrik: 'Utseende',
  val: {
    system: 'Följer systemet',
    ljust: 'Ljust',
    morkt: 'Mörkt',
  },
} as const

/**
 * Jobbsökets handling som ersätter Skapa-arkets rad (spec 2.1). "Tjänst",
 * inte "jobb": knappen landar i Sökta tjänster (copywriterns rad 7).
 */
export const JOBBSOK = {
  loggaSoktJobb: 'Logga sökt tjänst',
} as const

/**
 * Kontoraden längst ner i sidomenyn, på två rader (spec 16.3.5): namnet
 * 13/500 och paketet 12 under. Paketnamnet kommer ur PLANS.name.
 */
export const KONTORAD = {
  utanPaket: 'Gratisnivån',
} as const

/**
 * Sidornas h1 (spec 16.3.2): undersidans namn i sidomenyn. Undantag är
 * Jobbsökets hem (hälsningen), Träningens hem (datumrubriken i våg 2) och
 * detaljsidor (brev, ansökan, test, resultat).
 */
export const RUBRIK = {
  minaCv: UNDERSIDA.minaCv,
  minaBrev: UNDERSIDA.minaBrev,
  soktaTjanster: UNDERSIDA.soktaTjanster,
  matchadeJobb: UNDERSIDA.matchadeJobb,
  analyseraCv: UNDERSIDA.analyseraCv,
  cvMallar: UNDERSIDA.cvMallar,
  linkedin: UNDERSIDA.linkedin,
  bliUpptackt: UNDERSIDA.bliUpptackt,
  profil: UNDERSIDA.profil,
  prenumeration: UNDERSIDA.prenumeration,
  inforIntervjun: UNDERSIDA.inforIntervjun,
  arbetsstil: 'Din arbetsstil',
  meddelanden: 'Meddelanden',
  /** Alla resultatsidor tills Resultatvy i våg 2 (spec 16.2 fråga 18). */
  resultat: 'Ditt resultat',
} as const

/** Nivån i resultatraden: "grundnivå", "avancerad nivå", "expertnivå", "provläget". */
export const NIVA_I_RAD = {
  grund: 'grundnivå',
  avancerad: 'avancerad nivå',
  expert: 'expertnivå',
  prov: 'provläget',
} as const

/** Raden under resultatets rubrik: "Logiktest, grundnivå. Genomfört 26 september 2026." */
export function resultatRad(test: string, niva: string | null, datum: string | null): string {
  const forsta = niva ? `${test}, ${niva}.` : `${test}.`
  return datum ? `${forsta} Genomfört ${datum}.` : forsta
}

/**
 * Provlägets låsta rad i sidomenyn bär formatet i klartext, så att värdet
 * syns före köpet (spec 16.2 fråga 2, testansvarigs villkor). Aldrig bara
 * "Provläget" med ett lås, aldrig "samma test".
 */
export function provlageFormat(uppgifter: number, minuter: number): string {
  return `Vårt provläge. ${uppgifter} uppgifter, ${minuter} minuter.`
}

/** Bli upptäckt (spec 16.2 fråga 10 och copywriterns rad 8). */
export const BLI_UPPTACKT = {
  rubrik: UNDERSIDA.bliUpptackt,
  radFore:
    'Rekryterare som söker din bakgrund kan hitta dig i kandidatpoolen. Du är anonym tills du själv godkänner en kontakt.',
  radEfter: 'Profilen är anonym och visas för rekryterare.',
  /** Läggs efter radEfter när någon tittat. */
  tittat: (n: number) => (n === 1 ? 'En rekryterare har sett den.' : `${n} rekryterare har sett den.`),
} as const

/** Det lyfta kortet först på golvet, per vy (spec 16.3.2). */
export const LYFT = {
  minaCv: {
    eyebrow: 'Nytt CV',
    titel: 'Ladda upp ett CV',
    text: 'PDF eller Word. Vi använder det i brev, analys och mallar.',
    handling: 'Ladda upp CV',
  },
  minaBrev: {
    eyebrow: 'Nytt brev',
    titel: 'Skriv ett brev mot en annons',
    text: 'Klistra in annonsen, så skriver vi utifrån ditt CV.',
    handling: 'Skapa nytt brev',
  },
  soktaTjanster: {
    eyebrow: 'Nytt',
    titel: 'Logga en sökt tjänst',
    text: 'Företag, tjänst och datum räcker. Vi påminner när det är dags att följa upp.',
  },
  test: {
    titel: (antal: number, minuter: number | string) => `${antal} frågor, cirka ${minuter} minuter`,
    text: 'Du kan pausa. Svaren sparas medan du gör testet.',
  },
  prov: {
    eyebrow: 'Prov',
    titel: (antal: number, minuter: number | string) => `${antal} frågor, cirka ${minuter} minuter, mot klockan`,
    text: 'Ingen förklaring under tiden. Genomgången kommer efter provet.',
  },
  /** Jobbsökets hem i tillstånd A (inget CV), spec 18.3 punkt 2. Barnet är uppladdningen. */
  jobbForstaCv: {
    eyebrow: 'Börja här',
    titel: 'Ladda upp ditt CV',
    text: 'PDF, Word eller text. Namn, telefon och adress maskas innan texten går vidare till någon AI.',
    byggLank: 'Har du inget CV? Bygg ett här',
  },
  /** Jobbsökets hem i tillstånd B (CV finns, inget brev). Kopparknappen flyttad från väggen. */
  jobbForstaBrev: {
    titel: 'Ditt första personliga brev',
    text: 'Ditt CV ligger inne. Klistra in en annons så skriver vi utkastet utifrån det.',
    handling: 'Skapa ditt första brev',
  },
  /** Eyebrow är nivåns namn ("Grund"), titeln till exempel "50 påståenden, cirka 10 minuter". */
  personlighet: {
    titel: (antal: number, minuter: number | string) => `${antal} påståenden, cirka ${minuter} minuter`,
    text: 'Inga rätta svar. Du får en profil, inte ett betyg.',
  },
} as const

/** Din arbetsstil (spec 18.4 punkt 1). Knapptexten ses över av testansvarig mot gratisnivån. */
export const ARBETSSTIL = {
  rad: 'Hur du arbetar, samarbetar och drivs. Alltid i ord, aldrig i siffror, och den privata delen är bara din.',
  forstTitel: 'Gör personlighetstestet först',
  forstText: 'Din arbetsstilsrapport byggs på ditt personlighetstest. Det tar ungefär tio minuter, och det finns inga rätta svar.',
  forstKnapp: 'Gör personlighetstestet',
} as const

/** Brevvyn, B1-skelettet (spec 16.3.2). */
export const BREVVY = {
  redigera: 'Redigera',
  kopiera: 'Kopiera text',
  kopierad: 'Kopierad',
  pdf: 'Ladda ner PDF',
  word: 'Ladda ner Word',
  taBort: 'Ta bort',
  allaBrev: 'Alla dina brev',
} as const

/* ------------------------------------------------------------ våg 4 */

/** Svenska datum: "15 okt" och "torsdag 15 oktober" (spec 8). */
const KORT_DATUM = new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'short', timeZone: 'Europe/Stockholm' })
export function kortDatum(iso: string | Date): string {
  return KORT_DATUM.format(typeof iso === 'string' ? new Date(iso) : iso).replace('.', '')
}

/** Jobbsökets hem (J1/J2). */
export const JOBBSOK_HEM = {
  /** Väggens rad: "3 sökta tjänster. Intervju på Klarna. En har varit tyst i 16 dagar." */
  rad: (a: {
    oppna: number
    svarIGar: number
    intervju: { company: string } | null
    tysta: number
    tystastDagar: number | null
  }): string | null => {
    const delar: string[] = []
    if (a.oppna > 0) delar.push(a.oppna === 1 ? 'En sökt tjänst pågår.' : `${a.oppna} sökta tjänster pågår.`)
    if (a.svarIGar > 0) delar.push(a.svarIGar === 1 ? 'Ett nytt svar sedan i går.' : `${a.svarIGar} nya svar sedan i går.`)
    if (a.intervju) delar.push(`Intervju på ${a.intervju.company}.`)
    if (a.tysta === 1 && a.tystastDagar !== null) delar.push(`En har varit tyst i ${a.tystastDagar} dagar.`)
    else if (a.tysta > 1) delar.push(`${a.tysta} har varit tysta i över ${NO_RESPONSE_DAGAR} dagar.`)
    return delar.length ? delar.join(' ') : null
  },
  soktaRubrik: 'Sökta tjänster',
  soktaAlla: (n: number) => `Alla ${n}`,
  foljUpp: 'Följ upp',
  merRubrik: 'Mer i Jobbsöket',
  ochFler: (n: number) => (n === 1 ? 'och en till i Sökta tjänster' : `och ${n} till i Sökta tjänster`),
} as const

/** Gränsen för "tyst" i Sökta tjänster (NO_RESPONSE_NUDGE_DAYS i status.ts). */
const NO_RESPONSE_DAGAR = 12

/** Metaraden per sökt tjänst på Jobbsökets hem. */
export const SOKT_META = {
  tyst: (dagar: number) => `Sökt för ${dagar} dagar sedan, inget svar än. Följ upp med ett kort mejl.`,
  sokt: (dagar: number) => (dagar === 0 ? 'Sökt i dag. Svar brukar dröja en till två veckor.' : `Sökt för ${dagar} dagar sedan. Väntar svar.`),
  svar: (datum: string) => `Svar ${datum}. Väntar på nästa steg.`,
  kallad: (datum: string) => `Kallad till intervju ${datum}.`,
  intervjuGjord: (datum: string) => `Intervju gjord ${datum}. Väntar besked.`,
  provjobbat: (datum: string) => `Provjobbat ${datum}. Väntar besked.`,
  erbjudande: (datum: string) => `Erbjudande ${datum}.`,
} as const

/** Spårets etiketter (Spar.tsx). Stationerna står i konceptets ordning. */
export const SPAR = {
  stationer: ['Sökt', 'Svar', 'Intervju', 'Erbjudande'] as const,
  tyst: (dagar: number) => `tyst ${dagar} dagar`,
  sokt: (datum: string) => `sökt ${datum}`,
  svar: (datum: string) => `svar ${datum}`,
  kallad: (datum: string) => `kallad ${datum}`,
  intervjuGjord: 'intervju gjord',
  provjobbat: 'provjobbat',
  erbjudande: 'erbjudande',
  /** aria-label per rad: "Klarna på intervju" */
  laget: ['sökt', 'har fått svar', 'på intervju', 'har fått erbjudande'] as const,
  aria: (rader: string[]) => `Spåret: ${rader.join(', ')}.`,
} as const

/**
 * Korsreferensen från Jobbsöket till Rekryteringstester (spec avsnitt 6,
 * våg 4, J1 och J2). Nivån står som "nivå", aldrig som poäng.
 */
export const KORS = {
  niva: (niva: string, typ: string) => `Nivå ${niva} i ${typ}.`,
  dagarTill: (dagar: number, till: string) =>
    dagar === 0 ? `I dag: ${till}.` : dagar === 1 ? `I morgon: ${till}.` : `${dagar} dagar till ${till}.`,
  aldrigMattFraga: 'Har du ett rekryteringstest på gång?',
  aldrigMattTitel: 'Mät din nivå, 8 minuter.',
  aldrigMattText: 'Gratis. Sedan ett pass om dagen fram till provet, i samma format som leverantören.',
  lank: 'Till Rekryteringstester',
  /** Typen i nivåraden ("i figurer och mönster"). */
  typNiva: { matris: 'figurer och mönster', numerisk: 'siffror', verbal: 'text' } as Record<string, string>,
  /** Rubriktabellen (spec avsnitt 11): provet utan leverantör. */
  typProv: { matris: 'logiktestet', numerisk: 'siffertestet', verbal: 'texttestet' } as Record<string, string>,
  provet: 'provet',
} as const

/** "Mer i Jobbsöket" (J1). Raderna säger bara det som är sant. */
export const MER = {
  matchade: {
    titel: UNDERSIDA.matchadeJobb,
    meta: 'Jobb som passar ditt CV, med skäl per träff.',
    metaNya: (n: number) => (n === 1 ? 'En ny träff sedan du tittade senast.' : `${n} nya träffar sedan du tittade senast.`),
  },
  jobbcoachen: {
    titel: UNDERSIDA.jobbcoachen,
    meta: 'Fråga om lön, uppsägningstid eller hur du svarar en arbetsgivare.',
  },
  bliUpptackt: {
    titel: UNDERSIDA.bliUpptackt,
    metaAv: 'Anonym profil mot rekryterare. Du godkänner varje kontakt.',
    metaPa: 'Profilen är anonym och visas för rekryterare.',
  },
  intervju: {
    titel: UNDERSIDA.inforIntervjun,
    meta: 'Frågorna som brukar komma, och dina svar med exempel ur CV:t.',
  },
} as const

/** CV-rummet (C1). */
export const CV_RUM = {
  ringAria: (poang: number) => `Läsbarhetspoäng ${poang} av 100`,
  avHundra: 'av 100',
  drarNer: (n: number) =>
    n === 0
      ? 'Inget drar ner just nu.'
      : n === 1
        ? 'En sak drar ner. Den går att åtgärda i kväll.'
        : `${n === 2 ? 'Två' : n === 3 ? 'Tre' : n} saker drar ner. Alla går att åtgärda i kväll.`,
  senaste: (namn: string, datum: string) => `Senaste analysen: ${namn}, ${datum}.`,
  vagen: ['utkast', 'analyserat', 'åtgärdat', 'nedladdat'] as const,
  vagenAria: (klara: string[], nasta: string | null) =>
    `Dokumentets väg: ${klara.length ? klara.join(', ') + ' klart' : 'inget klart än'}${nasta ? `, nästa steg ${nasta}` : ''}.`,
  atgardaForst: 'Åtgärda först',
  atgardaKnapp: 'Åtgärda i CV:t',
  fyndRubrik: 'Vad som drar ner, i ordning',
  fyndAria: (n: number) => `${n} fynd`,
  plus: (n: number) => `+${n}`,
  plusAria: (n: number) => `${n} poäng till om det åtgärdas`,
  /** Fyndens namn. */
  fynd: {
    sammanfattning: 'Sammanfattningen',
    sammanfattningMeta: 'Inledningen säger inte tydligt vem du är som yrkesperson.',
    roll: (titel: string, foretag: string) => (foretag ? `${titel}, ${foretag}` : titel),
    rollMeta: 'Beskriver ansvar mer än resultat. Förslaget lägger till utfall och nyckelord.',
    kompetenser: 'Kompetenser mot kravprofilen',
    kompetenserMeta: (namn: string[]) =>
      namn.length ? `Saknas i CV:t: ${namn.slice(0, 3).join(', ')}${namn.length > 3 ? ' med flera' : ''}.` : 'Efterfrågade kompetenser saknas i CV:t.',
  },
  minaCvRubrik: UNDERSIDA.minaCv,
  cvMeta: {
    poang: (p: number) => `${p} av 100.`,
    inteAnalyserat: 'Inte analyserat.',
    andrat: (nar: string) => `Ändrat ${nar}.`,
  },
} as const

/** Brevrummet (B1). */
export const BREV_RUM = {
  ey: 'Brevet klart',
  titel: (foretag: string | null) => (foretag ? `Ditt brev till ${foretag}` : 'Ditt personliga brev'),
  traffar: (n: number, av: number) =>
    n === av ? `Det möter alla ${av} krav vi hittade i annonsen.` : `Det möter ${n} av ${av} krav vi hittade i annonsen.`,
  saknas: (ord: string) => `"${ord}" nämner du inte alls.`,
  traffarAria: (moter: string[], saknas: string[]) =>
    `Krav i annonsen som brevet möter: ${moter.join(', ') || 'inga'}.${saknas.length ? ` Saknas: ${saknas.join(', ')}.` : ''}`,
  sparaSokt: 'Spara som sökt tjänst',
  sparaSoktMeta: 'Brevet, annonsen och datumet hamnar i Jobbsöket, så du kan följa upp.',
  sparaKnapp: 'Spara',
  sparad: 'Sparad i Sökta tjänster.',
  sparadLank: 'Öppna',
  sparaFel: 'Det gick inte att spara. Försök igen.',
  redanSparad: 'Brevet ligger redan i Sökta tjänster.',
  sparar: 'Sparar',
  laggTill: (krav: string) => `Lägg till ${krav}`,
  laggTillMeta: 'Kravet står i annonsen men inte i brevet. Nämn det med ett exempel ur ditt CV.',
  gratis: 'Ett personligt brev om dagen ingår gratis. Nästa i morgon.',
} as const
