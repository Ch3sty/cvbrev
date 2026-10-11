/**
 * Texterna på testsidan och resultatsidan i Rekryteringstester (tester-lyftet,
 * skiss Provbladet avsnitt 3). En plats, så att copyn går att granska.
 *
 * Skrivregler: vi-form, svenska facktermer, inga tankstreck, "samma format
 * som" och aldrig "samma test". Ägarens regel: ett tal bär ytan, aldrig tal i
 * löptext med mittpunkter. Tal står som display-tal med en kort etikett.
 */

import type { TestKind, TestLevel } from '@/app/dashboard/tester/testConfig'
import { ordTal, versal } from './resultat'

/** Testets fråga på lyftkortet, samma som testkorten på Alla tester. */
export const TESTETS_FRAGA: Record<Exclude<TestKind, 'personlighet'>, string> = {
  matris: 'Vilken figur kommer härnäst?',
  verbal: 'Stämmer påståendet med texten?',
  numerisk: 'Läs tabellen och räkna under tid.',
}

export const PROVETS_FRAGA = 'Som på riktigt, mot klockan.'

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
  prov: 'Alla',
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
    etikett: (ratt: number, totalt: number) => `${ratt} av ${totalt} rätt`,
    lank: 'Se genomgången',
  },
  forsok: {
    rub: 'Dina försök',
    etikett: 'försök',
    visaAlla: 'Visa alla försök',
    dolj: 'Dölj försöken',
    aria: (n: number) => `Andel rätt i dina ${n} senaste försök, äldst till vänster.`,
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

export function sakord(kind: TestKind, slug: string): Sakord {
  if (kind === 'verbal' && slug !== 'verbal-resonemang-expert') {
    return { en: 'påstående', flera: 'påståenden', bestamd: 'påståendena', neutrum: true }
  }
  return { en: 'fråga', flera: 'frågor', bestamd: 'frågorna', neutrum: false }
}

export const RESULTAT = {
  klart: 'Testet klart',
  rubrik: (ratt: number, totalt: number, pct: number) => `${ratt} av ${totalt} rätt, ${pct} %`,
  tre: {
    ratt: 'rätt',
    tid: (min: number) => `av ${min} min`,
    over: (budget: number, en: string) => `över ${budget} s per ${en}`,
    snitt: (en: string) => `snitt per ${en}`,
  },
  bast: {
    nu: 'Ditt bästa resultat på nivån.',
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
    titel: (over: number, av: number, budget: number) =>
      over === 0
        ? 'Allt inom provets tid'
        : av > 20
          ? `${over} av ${av} över ${budget} sekunder`
          : `${versal(ordTal(over))} av ${ordTal(av)} över ${budget} sekunder`,
    snitt: 'Snitt',
    langsam: (nr: number, tid: string, s: { en: string }) =>
      `${versal(s.en)} ${nr} tog ${tid} och blev rätt. På provet hade den tiden saknats till ${s.en === 'påstående' ? 'ett annat påstående' : 'en annan fråga'}.`,
    budget: (b: number) => `provets tid, ${b} s`,
    budgetKort: (b: number) => `${b} s`,
    axelForsta: (s: { en: string }) => `${s.en} 1`,
    axelSista: (n: number, s: { en: string }) => `${s.en} ${n}`,
    legend: { ratt: 'rätt', fel: 'fel', over: 'över provets tid' },
    aria: (over: number, av: number, budget: number) =>
      `Tid per fråga. ${over} av ${av} tog längre än provets ${budget} sekunder.`,
  },
  status: {
    text: 'Resultatet syns i Din utveckling.',
    rytm: 'Samma nivå igen i morgon.',
    lank: 'Alla tester',
  },
  saknas: {
    rubrik: 'Resultatet gick inte att hämta',
    text: 'Sessionen finns inte kvar, eller så hör den till ett annat konto. Kör testet igen så sparas ett nytt resultat.',
    knapp: (titel: string) => `Till ${titel.toLowerCase()}`,
  },
} as const
