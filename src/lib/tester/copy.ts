/**
 * Texterna på testsidan och resultatsidan i Rekryteringstester (tester-lyftet,
 * skiss Provbladet avsnitt 3). En plats, så att copyn går att granska.
 *
 * Skrivregler: vi-form, svenska facktermer, inga tankstreck, "samma format
 * som" och aldrig "samma test". Ägarens regel: ett tal bär ytan, aldrig tal i
 * löptext med mittpunkter. Tal står som display-tal med en kort etikett.
 */

import type { TestKind, TestLevel } from '@/app/dashboard/tester/testConfig'
import { paketKort } from '@/lib/plans/plans'
import { ordTal, versal } from './resultat'

/** Testets fråga på lyftkortet, samma som testkorten på Alla tester. */
export const TESTETS_FRAGA: Record<Exclude<TestKind, 'personlighet'>, string> = {
  matris: 'Vilken figur kommer härnäst?',
  verbal: 'Stämmer påståendet med texten?',
  numerisk: 'Läs tabellen och räkna under tid.',
}

export const PROVETS_FRAGA = 'Som på riktigt, mot klockan.'

/**
 * Väggens rad på testsidan: formatet per testtyp (art-director 2026-10-11,
 * beslut 4). Bara de leverantörer som hjälptexterna B2, B3 och B5 stöder
 * efter testansvarigs kontroll samma dag: Assessio har inget verbalt test,
 * och Aons scales numerical har ett annat format än vårt numeriska.
 */
export const FORMATRAD: Record<Exclude<TestKind, 'personlighet'>, string> = {
  matris: 'Samma format som Matrigma från Assessio och Alva Logic.',
  verbal: 'Samma svarsformat som SHL Verify verbal och Aons scales verbal.',
  numerisk: 'Samma format som det numeriska testet i SHL Verify.',
}

/** Nivån som eyebrow och som tal i faktaraden. */
export const NIVA_NAMN: Record<TestLevel, string> = {
  grund: 'Grundnivå',
  avancerad: 'Avancerad nivå',
  expert: 'Expertnivå',
  prov: 'Provläge',
}

export const NIVA_TAL: Record<TestLevel, string> = {
  grund: 'Grund',
  avancerad: 'Avancerad',
  expert: 'Expert',
  prov: '3',
}

export const TESTSIDA = {
  start: 'Starta testet',
  gorOm: 'Gör om testet',
  startar: 'Startar testet',
  startProv: 'Starta provet',
  gorOmProv: 'Gör om provet',
  text: 'Du kan pausa. Svaren sparas medan du gör testet, och efter testet går vi igenom varje fråga.',
  textProv: 'Ingen förklaring under tiden. Provet lämnas in när tiden är ute, och genomgången kommer efteråt.',
  fakta: { fragor: 'frågor', minuter: 'minuter', niva: 'nivå', nivaer: 'nivåer', pastaenden: 'påståenden' },
  bast: {
    rub: 'Ditt bästa',
    /** Bara i title och aria-label, aldrig som synlig text. */
    etikett: (ratt: number, totalt: number) => `${ratt} av ${totalt} rätt`,
    lank: 'Se genomgången',
  },
  forsok: {
    rub: 'Dina försök',
    visaAlla: 'Visa försöken',
    dolj: 'Dölj försöken',
    aria: (n: number, senaste: number) =>
      `Andel rätt i dina ${n} senaste försök, äldst till vänster. Senaste ${senaste} procent.`,
    kolumner: { datum: 'Datum', resultat: 'Rätt', tid: 'Tid' },
  },
  hjalpRubrik: (niva: string) => `Vad betyder ${niva.toLowerCase()}?`,
  hjalpRubrikProv: 'Hur går provet till?',
  fel: {
    start: 'Testet kunde inte startas. Försök igen om en stund.',
    natet: 'Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.',
  },
} as const

/** Substantivet för en fråga i testet: påståenden i verbalt, annars frågor. */
export interface Sakord {
  en: string
  flera: string
  /** Bestämd form plural: frågorna, påståendena. */
  bestamd: string
  neutrum: boolean
}

/**
 * Tempots enhet när det räknas per underlag (testansvarig 2026-10-11,
 * punkt 2): texter i verbalt, tabeller i numeriskt.
 */
export function enhetsord(kind: TestKind): Sakord {
  return kind === 'numerisk'
    ? { en: 'tabell', flera: 'tabeller', bestamd: 'tabellerna', neutrum: false }
    : { en: 'text', flera: 'texter', bestamd: 'texterna', neutrum: false }
}

export function sakord(kind: TestKind, slug: string): Sakord {
  if (kind === 'verbal' && slug !== 'verbal-resonemang-expert') {
    return { en: 'påstående', flera: 'påståenden', bestamd: 'påståendena', neutrum: true }
  }
  return { en: 'fråga', flera: 'frågor', bestamd: 'frågorna', neutrum: false }
}

export const RESULTAT = {
  klart: 'Testet klart',
  rubrik: (ratt: number, totalt: number) => `${ratt} av ${totalt} rätt`,
  /** Ringen bär procenten: bara i aria-label, aldrig som synlig text. */
  ringAria: (ratt: number, totalt: number, pct: number) => `${ratt} av ${totalt} rätt, ${pct} procent`,
  tre: {
    tid: (min: number) => `av ${min} min`,
    over: (budget: number, en: string) => `över ${budget} s per ${en}`,
    snitt: (en: string) => `snitt per ${en}`,
  },
  bast: {
    nu: 'Det här är ditt bästa på nivån.',
    tidigare: (b: number, t: number) => `Ditt bästa på nivån är ${b} av ${t}.`,
  },
  genomgang: {
    rub: 'Genomgång',
    titel: (n: number, s: { en: string; flera: string; neutrum: boolean }) =>
      `${versal(ordTal(n, s.neutrum))} ${n === 1 ? s.en : s.flera} att titta på`,
    regel: {
      matris: 'Regeln står vid varje fråga.',
      verbal: 'Förklaringen står vid varje påstående.',
      numerisk: 'Uträkningen står vid varje fråga.',
      prov: 'Facit står vid varje fråga.',
    },
    sammaFamilj: (n: number, av: number, namn: string, matris: boolean) =>
      `${versal(ordTal(n))} av ${ordTal(av)} är samma ${matris ? 'familj' : 'typ'}: ${namn.toLowerCase()}.`,
    knapp: (n: number, s: Sakord) =>
      n === 1 ? `Gå igenom ${s.neutrum ? 'påståendet' : 'frågan'}` : `Gå igenom de ${ordTal(n)} ${s.bestamd}`,
    visaAlla: (n: number) => `Visa alla ${ordTal(n)}`,
    nr: (n: number, s: { en: string }) => `${versal(s.en)} ${n}`,
    allaRatt: 'Alla rätt',
    allaRattText: 'Inga missar att gå igenom den här gången.',
    visaGenomgang: 'Visa genomgången',
    saknas: 'Genomgången saknas för det här försöket',
    saknasText:
      'Resultatet sparades före genomgången per fråga, eller ur en tidigare version av frågebanken. Poängen står kvar, men vi kan inte visa vilka frågor du fick. Gör om testet så får du full genomgång.',
    rubrikLista: 'Fråga för fråga',
  },
  tappade: {
    rub: 'Var du tappade i det här testet',
    rubKort: 'Var du tappade här',
    titel: (namn: string, r: number, t: number) => `${namn}, ${r} av ${t}`,
    allaSatt: (matris: boolean) => (matris ? 'Alla familjer satt' : 'Inga tapp i någon typ'),
    fot: (term: string, flera: string) => `${versal(term)} med minst två ${flera} i testet. Hela bilden finns i Din utveckling.`,
    term: { matris: 'familjer', verbal: 'svarstyper', numerisk: 'uppgiftstyper' },
  },
  tempo: {
    rub: 'Tempo mot provets tid',
    /** flera: enhetens plural när tempot räknas per underlag ("texter"). */
    titel: (over: number, av: number, budget: number, flera?: string) =>
      over === 0
        ? 'Allt inom provets tid'
        : av > 20
          ? `${over} av ${av}${flera ? ` ${flera}` : ''} över ${budget} sekunder`
          : `${versal(ordTal(over))} av ${ordTal(av)}${flera ? ` ${flera}` : ''} över ${budget} sekunder`,
    snitt: 'Snitt',
    langsam: (nr: number, tid: string, s: { en: string }) =>
      `${versal(s.en)} ${nr} tog ${tid} och blev rätt. På provet hade den tiden saknats till ${s.en === 'påstående' ? 'ett annat påstående' : 'en annan fråga'}.`,
    /** Ett underlag där alla påståenden blev rätt. */
    langsamUnderlag: (nr: number, tid: string, antal: number, s: { en: string }) =>
      `${versal(s.en)} ${nr} tog ${tid} och ${antal > 1 ? `alla ${ordTal(antal)} blev rätt` : 'blev rätt'}. På provet hade den tiden saknats till en annan ${s.en}.`,
    /** Stapelns title för ett underlag. */
    stapel: (nr: number, tid: string, ratt: number, antal: number, s: { en: string }) =>
      `${versal(s.en)} ${nr}: ${tid}, ${ratt} av ${antal} rätt`,
    budget: (b: number) => `provets tid, ${b} s`,
    budgetKort: (b: number) => `${b} s`,
    axelForsta: (s: { en: string }) => `${s.en} 1`,
    axelSista: (n: number, s: { en: string }) => `${s.en} ${n}`,
    legend: { ratt: 'rätt', fel: 'fel', over: 'över provets tid' },
    aria: (over: number, av: number, budget: number, en = 'fråga') =>
      `Tid per ${en}. ${over} av ${av} tog längre än provets ${budget} sekunder.`,
  },
  /**
   * Statusraden längst ner (testansvarig punkt 3 och 4, art-director beslut
   * 1): rytmraden först, sedan CV-steget när CV saknas. Ingen knapp, ingen
   * koppar: länken är radens enda handling.
   */
  status: {
    text: 'Resultatet syns i Din utveckling.',
    rytm: {
      under: 'Samma nivå igen i morgon.',
      gratisGrund: 'Grundnivån är öppen en gång om dagen. Samma nivå igen i morgon.',
      nastaOppen: 'Nästa nivå väntar i Alla tester.',
      nastaLast: () => `Nästa nivå ingår i ${paketKort()}.`,
      provOppet: 'Provläget väntar i Alla tester.',
      provLast: () => `Provläget ingår i ${paketKort()}.`,
    },
    cv: 'Nästa steg i jobbsöket är CV:t.',
    lank: 'Alla tester',
    lankCv: 'Ladda upp ditt CV',
  },
  saknas: {
    rubrik: 'Resultatet gick inte att hämta',
    text: 'Sessionen finns inte kvar, eller så hör den till ett annat konto. Kör testet igen så sparas ett nytt resultat.',
    knapp: (titel: string) => `Till ${titel.toLowerCase()}`,
  },
} as const
