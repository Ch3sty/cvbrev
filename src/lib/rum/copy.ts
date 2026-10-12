// src/lib/rum/copy.ts
//
// Rummens strängar (spec-rummen-2026-10-10 avsnitt 8, 9 och 16).
// Copywriterns granskning av våg 1b (docs/design/copy-rummen-1b-2026-10-11.md)
// är inarbetad. Ändra här, aldrig i JSX.

import type { Rum } from './rum'
import { paketKort } from '@/lib/plans/plans'

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
  /** Hemvyn: samma ord som lägesraden (beslut-hemvy 2026-10-11, copy-plan avsnitt 5). */
  dagensPass: 'Min plan',
  kurvan: 'Kurvan',
  testOchDatum: 'Test och datum',
  allaTester: 'Alla tester',
  provlaget: 'Övningsprov',
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
  /** Kontots och appens val (skiss-installningar-2026-10-12). */
  installningar: 'Inställningar',
} as const

/**
 * Lägesraden i Rekryteringstester (beslut-hemvy 2026-10-11 punkt 1): samma
 * ord som sidomenyns undersidor, så att samma sida aldrig har två namn.
 */
export const LAGESRAD = {
  etikett: 'Träna efter planen eller fritt',
  plan: UNDERSIDA.dagensPass,
  alla: UNDERSIDA.allaTester,
} as const

/** Chip-texter i sidomenyn. */
export const CHIP = {
  nyhet: 'Nyhet',
  nya: (n: number) => `${n} nya`,
  vantar: (n: number) => `${n} väntar`,
  /** Låst undersida (copy-premium avsnitt 3). */
  lastEtikett: `Ingår i ${paketKort()}`,
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

/**
 * Utseende-väljaren (spec 4.3 och 9, våg 1b): segmentet i avatarmenyn och
 * sektionen på Inställningar (skiss-installningar-2026-10-12).
 */
export const UTSEENDE = {
  rubrik: 'Utseende',
  val: {
    system: 'Följer systemet',
    ljust: 'Ljust',
    morkt: 'Mörkt',
  },
  /** Raden under menyns symboler, före valet i klartext: "Utseende: Ljust". */
  rad: 'Utseende:',
  /** Sektionens underrad på Inställningar. Valet sparas per enhet. */
  under: 'Gäller den här enheten.',
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
  installningar: UNDERSIDA.installningar,
  inforIntervjun: UNDERSIDA.inforIntervjun,
  arbetsstil: 'Din arbetsstil',
  meddelanden: 'Meddelanden',
  /** Alla resultatsidor tills Resultatvy i våg 2 (spec 16.2 fråga 18). */
  resultat: 'Ditt resultat',
} as const

/** Nivån i resultatraden: "grundnivå", "avancerad nivå", "expertnivå", "övningsprov". */
export const NIVA_I_RAD = {
  grund: 'grundnivå',
  avancerad: 'avancerad nivå',
  expert: 'expertnivå',
  prov: 'övningsprov',
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
  return `Övningsprov i vårt eget format: ${uppgifter} uppgifter på ${minuter} minuter.`
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
    eyebrow: 'Övningsprov',
    titel: (antal: number, minuter: number | string) => `${antal} frågor, cirka ${minuter} minuter, mot klockan`,
    text: 'Ingen förklaring under tiden. Genomgången kommer efteråt.',
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

/**
 * Din arbetsstil (spec 18.4 punkt 1, copywriterns våg 4 punkt 7). Kortet
 * säger före klicket att grundtestet är gratis och att hela rapporten bygger
 * på det fördjupade testet. Talen läses ur TEST_CONFIGS, aldrig fasta.
 */
export const ARBETSSTIL = {
  rad: 'Hur du arbetar, samarbetar och drivs. Alltid i ord, aldrig i siffror, och den privata delen är bara din.',
  forstTitel: 'Börja med personlighetstestet',
  forstText: (grund: { antal: number; minuter: number }, fordjupatAntal: number) =>
    `Grundtestet är gratis: ${grund.antal} påståenden, cirka ${talord(grund.minuter)} minuter, inga rätta svar. Det ger dina styrkor. Hela rapporten om hur du arbetar bygger på det fördjupade testet med ${fordjupatAntal} påståenden.`,
  forstKnapp: 'Starta grundtestet',
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

const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'] as const

/**
 * Tal i löpande mening (copywriterns regel, copy-rummen-vag4): bokstäver till
 * och med tolv, siffror därefter. `ett` ger neutrum för ett. Instrumenten
 * (ringen, chippen, "Alla 5", spårets dagar) behåller siffror.
 */
export function talord(n: number, ett = false): string {
  if (Number.isInteger(n) && n >= 0 && n <= 12) return n === 1 && ett ? 'ett' : TALORD[n]
  return String(n)
}

/** Talordet med versal, för meningens början. */
export function Talord(n: number, ett = false): string {
  const t = talord(n, ett)
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/**
 * Nästa handling: uppföljningen (art-director 21.3 punkt 5, copywriterns
 * punkt 8). En tyst tjänst som finns i hemmets lista namnges; annars heter
 * posten "sökt tjänst", aldrig "ansökan".
 */
export const NASTA_FOLJ_UPP = {
  namnTitel: (foretag: string) => `Följ upp ${foretag}`,
  namnText: (dagar: number) => `Sökt för ${dagar} dagar sedan, inget svar. Ett kort mejl brukar ge besked. Vi skriver utkastet.`,
  titel: (n: number) => (n === 1 ? 'Följ upp en sökt tjänst' : `Följ upp ${talord(n)} sökta tjänster`),
  textEn: 'Den har inte svarat på över tolv dagar. Ett kort mejl brukar räcka, och vi skriver utkastet åt dig.',
  textFlera: 'De har inte svarat på över tolv dagar. Ett kort mejl brukar räcka, och vi skriver utkasten åt dig.',
  knapp: 'Följ upp',
} as const

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
    // Väggens rad är en mening: talen med bokstäver till och med tolv
    // (copywriterns våg 4 punkt 4). Dagarna är ett mått och står som siffror.
    if (a.oppna > 0) delar.push(a.oppna === 1 ? 'En sökt tjänst pågår.' : `${Talord(a.oppna)} sökta tjänster pågår.`)
    if (a.svarIGar > 0) delar.push(a.svarIGar === 1 ? 'Ett nytt svar sedan i går.' : `${Talord(a.svarIGar)} nya svar sedan i går.`)
    if (a.intervju) delar.push(`Intervju på ${a.intervju.company}.`)
    if (a.tysta === 1 && a.tystastDagar !== null) delar.push(`En har varit tyst i ${a.tystastDagar} dagar.`)
    else if (a.tysta > 1) delar.push(`${Talord(a.tysta)} har varit tysta i över ${talord(NO_RESPONSE_DAGAR)} dagar.`)
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
  intervjuGjord: (datum: string) => `Intervju genomförd ${datum}. Väntar på besked.`,
  provjobbat: (datum: string) => `Provjobbat ${datum}. Väntar på besked.`,
  erbjudande: (datum: string) => `Erbjudande ${datum}.`,
} as const

/**
 * Spårets etiketter (Spar.tsx). Stationerna står i konceptets ordning.
 * Regel (copywriterns våg 4 punkt 5): etiketten under en station upprepar
 * aldrig stationens namn; den lägger till det som skiljer, oftast datumet.
 */
export const SPAR = {
  stationer: ['Sökt', 'Svar', 'Intervju', 'Erbjudande'] as const,
  tyst: (dagar: number) => `tyst ${dagar} dagar`,
  sokt: (datum: string) => datum,
  svar: (datum: string) => datum,
  kallad: (datum: string) => `kallad ${datum}`,
  intervjuGjord: 'genomförd',
  provjobbat: 'provjobbat',
  erbjudande: (datum: string) => datum,
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
  aldrigMattTitel: 'Kolla din nivå, 8 minuter.',
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
    meta: 'Jobb som passar ditt CV, och varför de passar.',
    metaNya: (n: number) => (n === 1 ? 'En ny träff sedan sist.' : `${Talord(n)} nya träffar sedan sist.`),
  },
  jobbcoachen: {
    titel: UNDERSIDA.jobbcoachen,
    meta: 'Fråga om lön, uppsägningstid eller hur du svarar en arbetsgivare.',
  },
  bliUpptackt: {
    titel: UNDERSIDA.bliUpptackt,
    metaAv: 'Rekryterare kan hitta dig, anonymt. Du godkänner varje kontakt.',
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
  // "På en kväll" är ett mått på arbetet, inte en tid (copywriterns våg 4 punkt 1).
  drarNer: (n: number) =>
    n === 0
      ? 'Inget drar ner just nu.'
      : n === 1
        ? 'En sak drar ner. Den går att åtgärda på en kväll.'
        : `${Talord(n)} saker drar ner. Alla går att åtgärda på en kväll.`,
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
    // Säg bara det vi vet (copywriterns våg 4 punkt 2): att analysen har ett förslag.
    sammanfattningMeta: 'Det första rekryteraren läser. Vårt förslag säger tydligare vilken roll du har och vad du kan.',
    roll: (titel: string, foretag: string) => (foretag ? `${titel}, ${foretag}` : titel),
    rollMeta: 'Vårt förslag beskriver rollen med resultat och nyckelord, inte bara ansvar.',
    kompetenser: 'Kompetenser mot kravprofilen',
    kompetenserMeta: (namn: string[]) =>
      namn.length ? `Saknas i CV:t: ${namn.slice(0, 3).join(', ')}${namn.length > 3 ? ' med flera' : ''}.` : 'Kompetenser ur kravprofilen som inte står i CV:t.',
  },
  minaCvRubrik: UNDERSIDA.minaCv,
  /** Listan på Mina CV (21.2 fråga 1): samma ord som väggens "4 sparade CV". */
  sparadeRubrik: 'Sparade CV',
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
  // Ett brev täcker krav (copywriterns våg 4 punkt 3). Talen är ett instrument och står som siffror.
  traffar: (n: number, av: number) =>
    n === av ? `Brevet täcker alla ${av} krav vi hittade i annonsen.` : `Brevet täcker ${n} av de ${av} krav vi hittade i annonsen.`,
  /** Kravet i den form det står i annonsen, med versal först: "Azure saknas.", "Backend saknas." */
  saknas: (ord: string) => `${ord.charAt(0).toUpperCase()}${ord.slice(1)} saknas.`,
  traffarAria: (moter: string[], saknas: string[]) =>
    `Krav i annonsen som brevet täcker: ${moter.join(', ') || 'inga'}.${saknas.length ? ` Saknas: ${saknas.join(', ')}.` : ''}`,
  sparaSokt: 'Spara som sökt tjänst',
  sparaSoktMeta: 'Brevet, annonsen och datumet hamnar i Jobbsöket, så du kan följa upp.',
  sparaKnapp: 'Spara',
  sparad: 'Sparad i Sökta tjänster.',
  sparadLank: 'Öppna',
  sparaFel: 'Det gick inte att spara. Försök igen.',
  redanSparad: 'Brevet ligger redan i Sökta tjänster.',
  sparar: 'Sparar',
  laggTill: (krav: string) => `Lägg till ${krav}`,
  laggTillMeta: 'Står i annonsen men inte i brevet. En mening med ett exempel ur ditt CV räcker.',
  gratis: 'Ett personligt brev om dagen ingår gratis. Nästa i morgon.',
} as const
