// src/components/tester-v4/utveckling/copy.ts
// Texterna i Din utveckling, ordagrant ur skissen (docs/design/smal-plan-2026-11-18/skiss.html,
// webben, fliken Din utveckling). Inga talstreck, svenska facktermer, aldrig ordet pass.

import { kortDatum, datumText } from '@/lib/traning/rubrik';
import type { Dag } from '@/lib/traning/datum';
import type { PunktSlag, UtvecklingsPunkt } from '@/lib/tester/v4/typer';
import type { MonsterLage } from '@/lib/tester/v4/typer';
import type { Period } from './geometri';

export const UTV = {
  brand: 'Rekryteringstester',
  eyebrow: 'Din utveckling',
  rubrikUtanPlan: 'Alla testtyper',
  dagarKvar: (n: number) => `${n} ${n === 1 ? 'dag' : 'dagar'} kvar`,
  dagarKvarRad: ' till provet.',
  provetIdag: 'Provet är i dag.',
  matta: (n: number, av: number) => `${n} av ${av}`,
  mattaRad: ' testtyper mätta.',
  undertext: ' Träning, nivåkoll och prov i samma graf. Nivåerna läggs aldrig ihop.',
  utanDatum: 'Inget provdatum än.',

  graf: {
    eyebrow: 'Nivån över tid',
    meta: 'träning, nivåkoll och prov',
    tom: 'Gör Nivåkollen i en testtyp, så får grafen sin första linje.',
    tomKnapp: 'Mät din nivå',
    tomPeriod: 'Inget i den här perioden. Välj Allt för hela historiken.',
    valjPunkt: 'Tryck på en punkt för detaljer.',
    aria: 'Nivån över tid, en linje per testtyp. Nivåkoll som ring, träning som punkt, övningsprov som fyrkant på tidslinjen. Välj en punkt med piltangenterna och Enter.',
    tidslinje: 'prov och övning',
    provet: 'provet',
    idag: 'i dag',
    historikLast: 'Hela historiken ingår i Premium',
    zon: { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' },
  },

  chips: {
    typEtikett: 'Testtyp i grafen',
    periodEtikett: 'Period',
    alla: 'Alla',
    period: { '4v': '4 veckor', plan: 'Planen', allt: 'Allt' } as Record<Period, string>,
  },

  legend: {
    nivakoll: 'Nivåkoll',
    trana: 'Träning',
    ovningsprov: 'Övningsprov',
    ingarI: (namn: string) => `ingår i ${namn}`,
    ovriga: 'övriga testtyper',
  },

  slag: { nivakoll: 'Nivåkoll', trana: 'Träning', ovningsprov: 'Övningsprov' } as Record<PunktSlag, string>,

  detalj: {
    oppna: 'Öppna',
    oppnaTyp: 'Öppna testtypen',
    raknasInte: 'Övning, räknas inte',
    utanNiva: 'Ingen nivå än',
    nivaEtikett: 'nivå',
    ratt: (r: number, a: number) => `${r} av ${a}`,
    rattOrd: 'rätt',
    uppgifter: (a: number) => `${a} uppgifter`,
    overTid: (n: number) => `${n} över provets tid`,
    inomTid: 'allt inom provets tid',
    stang: 'Stäng detaljen',
  },

  nivaPerTyp: {
    eyebrow: 'Nivå per testtyp',
    meta: 'tryck för att välja i grafen',
  },

  resultat: {
    eyebrow: 'Resultat',
    metaAlla: 'nivåkoller och prov, alla typer',
    metaTyp: 'allt i vald typ',
    tom: 'Inga resultat än.',
    visaAlla: (n: number) => `Visa alla ${n}`,
    visaFarre: 'Visa färre',
    historikLast: 'Äldre resultat ingår i Premium',
  },

  monster: {
    eyebrow: 'Mönstren i figurer och mönster',
    summa: (s: number, m: number, o: number) => `${s} säkra · ${m} mötta · ${o} inte mötta`,
    lage: { omott: 'inte mött', mott: 'mött', saker: 'säker', snabb: 'snabb' } as Record<MonsterLage, string>,
    svar: (r: number, a: number) => `${r} av ${a} rätt`,
    legend: { omott: 'inte mött', mott: 'mött, andel rätt', saker: 'säker', snabb: 'snabb' } as Record<MonsterLage, string>,
    forklaring:
      'Säker: minst sex svar nära din nivå på fjorton dagar, minst fem rätt. Snabb: säker och högst ett över provets tid. Under sex svar står antalet, aldrig ett omdöme. Tryck på ett mönster för att träna på det.',
    tranaAria: (namn: string) => `Träna på mönstret ${namn}`,
    las: 'Träna på mönstren ingår i Premium',
  },
} as const;

export const kort = (d: Dag) => kortDatum(d);
export const lang = (d: Dag) => datumText(d);

/** Punktens slag i ord. Nivån ur ett fast nivåtest (talserier, spatial, ordförråd) heter Nivåtest, inte Nivåkoll. */
export const slagEtikett = (p: Pick<UtvecklingsPunkt, 'slag' | 'kalla'>) => (p.kalla === 'nivatest' ? 'Nivåtest' : UTV.slag[p.slag]);
