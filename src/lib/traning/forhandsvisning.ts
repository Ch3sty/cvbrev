// src/lib/traning/forhandsvisning.ts
// =============================================================================
// Fixturdata för förhandsvisningen av hemvyn (/dashboard/tester/forhandsvisning,
// bara i utveckling) och för testerna. Talen är konceptets exempel och går
// ihop (spec-rummen bilaga 11): mätning tisdag 6 oktober 5,0; pass 7, 8, 9
// oktober 5,2, 5,1, 5,4; 10 oktober (lördag) 5,6; 11 vila; 12 5,7; ommätning
// 13 oktober 5,8; 18 vila; ommätning 20 oktober 6,3; generalrepetition 22
// och 23; prov lördag 24 oktober, nivå 6,4. Sikte 6,5. Inga nivåer över 7,5.
//
// Statusen byggs med motorns egna rena funktioner (planen, serien, formen),
// så förhandsvisningen visar samma regler som produktionen.
// =============================================================================

import { dagarIntervall, dagarMellan, laggTill, type Dag } from './datum';
import { byggPlan } from './plan';
import { raknaSerie } from './serie';
import { beraknaForm } from './form';
import { fragaEfterProvet } from './testplan';
import { formatForPlan } from './tempo';
import type { Nivapunkt } from './milstolpar';
import type { SenastePass, Testplan, Traningsstatus } from './motor.server';
import type { FlerTesterIn, HemIn, JobbsokIn } from './hemvy';

export const TILLSTAND = ['T1', '1a', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1p', 'X1', 'L1', 'W1', 'W2', 'W3', 'W4'] as const;
export type Fixtur = (typeof TILLSTAND)[number];

/** Datorramarna visar samma data som mobilens. */
export const DATOR: Record<string, Fixtur> = { W1: '1b', W2: '1a', W3: '1f', W4: '1d' };

const MATNING: Dag = '2026-10-06';
const PROV: Dag = '2026-10-24';

/** Nivån per dag och typ i exemplet. */
const KURVAN: Nivapunkt[] = [
  { dag: '2026-10-06', niva: 5.0, typ: 'matning' },
  { dag: '2026-10-07', niva: 5.2, typ: 'pass' },
  { dag: '2026-10-08', niva: 5.1, typ: 'pass' },
  { dag: '2026-10-09', niva: 5.4, typ: 'pass' },
  { dag: '2026-10-10', niva: 5.6, typ: 'pass' },
  { dag: '2026-10-12', niva: 5.7, typ: 'pass' },
  { dag: '2026-10-13', niva: 5.8, typ: 'ommatning' },
  { dag: '2026-10-14', niva: 5.9, typ: 'pass' },
  { dag: '2026-10-15', niva: 5.9, typ: 'pass' },
  { dag: '2026-10-16', niva: 6.0, typ: 'pass' },
  { dag: '2026-10-17', niva: 6.2, typ: 'pass' },
  { dag: '2026-10-19', niva: 6.1, typ: 'pass' },
  { dag: '2026-10-20', niva: 6.3, typ: 'ommatning' },
  { dag: '2026-10-21', niva: 6.3, typ: 'pass' },
  { dag: '2026-10-22', niva: 6.3, typ: 'general' },
  { dag: '2026-10-23', niva: 6.4, typ: 'general' },
];

const JOBB: JobbsokIn = { tjanster: 3, intervjuer: 1, brev: 2 };
const JOBB_NY: JobbsokIn = { tjanster: 0, intervjuer: 0, brev: 1 };
const FLER: FlerTesterIn = { verbalSenast: '2026-10-08T17:20:00Z', numeriskSenast: null, personlighetKlar: '2026-10-03T18:00:00Z' };
const FLER_NY: FlerTesterIn = { verbalSenast: null, numeriskSenast: null, personlighetKlar: null };

function plan(over: Partial<Testplan> = {}): Testplan {
  return {
    user_id: 'forhandsvisning',
    testtyper: ['matris'],
    leverantor: 'matrigma',
    variant: 'klassisk',
    provdatum: PROV,
    sikte: 6.5,
    utfall: null,
    utfall_svarat_at: null,
    utfall_fraga_igen_at: null,
    ...over,
  };
}

function pass(dag: Dag, over: Partial<SenastePass> = {}): SenastePass {
  return {
    id: `forhandsvisning-${dag}`,
    dag,
    typ: 'pass',
    variant: 'niva',
    tema: 'rotation-med-byte',
    ratt: 7,
    antal: 9,
    over_tid: 2,
    snitt_s: 44,
    budget_s: 68,
    niva_fore: 5.4,
    niva_efter: 5.6,
    ...over,
  };
}

interface Bygg {
  idag: Dag;
  plan: Testplan | null;
  /** Punkter till och med den här dagen (inklusive). */
  punkterTill?: Dag | null;
  /** Dagar med något slutfört; standard: punkternas dagar. */
  aktiva?: Dag[];
  betalande?: boolean;
  senastePass?: SenastePass | null;
  dagensTema?: string | null;
  nyPunkt?: boolean;
  familjer?: 'matning' | 'pass' | 'ingen';
  aktivitet?: Traningsstatus['aktivitet'];
}

function status(b: Bygg): Traningsstatus {
  const betalande = b.betalande ?? true;
  const allaPunkter = b.punkterTill ? KURVAN.filter((p) => p.dag <= b.punkterTill!) : [];
  const aktiva = b.aktiva ?? allaPunkter.map((p) => p.dag);
  const start = allaPunkter[0] ?? null;
  const prov = b.plan?.provdatum ?? null;
  const f = formatForPlan(b.plan?.leverantor, b.plan?.variant);
  const historikLast = !betalande;
  const sessioner = aktiva.map((dag) => ({ dag, typ: (KURVAN.find((p) => p.dag === dag)?.typ ?? 'pass') as 'pass' }));
  const aktivitet =
    b.aktivitet ??
    sessioner.reduce(
      (r, s) => {
        const t = s.typ as string;
        if (t === 'pass') r.pass++;
        else if (t === 'ommatning') r.ommatningar++;
        else if (t === 'general') r.generalrepetitioner++;
        else r.matningar++;
        return r;
      },
      { pass: 0, ommatningar: 0, generalrepetitioner: 0, matningar: 0 }
    );
  const familjer =
    b.familjer === 'ingen'
      ? { svagaste: [], langsamma: [] }
      : b.familjer === 'matning'
        ? {
            svagaste: [
              { family: 'rotation-med-byte', ratt: 1, antal: 3, andel: 1 / 3, ratt_men_langsamma: 0 },
              { family: 'latin-antal', ratt: 2, antal: 4, andel: 0.5, ratt_men_langsamma: 0 },
            ],
            langsamma: [],
          }
        : {
            svagaste: [
              { family: 'rotation-med-byte', ratt: 3, antal: 7, andel: 3 / 7, ratt_men_langsamma: 0 },
              { family: 'latin-antal', ratt: 4, antal: 6, andel: 4 / 6, ratt_men_langsamma: 0 },
            ],
            langsamma: [{ family: 'spegling', ratt: 4, antal: 4, andel: 1, ratt_men_langsamma: 3 }],
          };
  const punkter = historikLast ? allaPunkter.slice(-1) : allaPunkter;
  return {
    idag: b.idag,
    plan: b.plan,
    format: {
      nyckel: f.nyckel,
      namn: f.namn,
      antal: f.antal,
      minuter: f.minuter,
      budget_s: f.budget_s,
      adaptiv: f.adaptiv,
      cirka: f.cirka,
      tidsform: f.tidsform,
      anmarkning: f.anmarkning,
    },
    niva: allaPunkter.length ? allaPunkter[allaPunkter.length - 1].niva : null,
    punkter,
    historikLast,
    nyPunkt: b.nyPunkt ?? false,
    plandagar: start ? byggPlan({ start: start.dag, prov, idag: b.idag, aktivaDagar: aktiva, betalande }) : [],
    serie: raknaSerie({ aktivaDagar: aktiva, idag: b.idag, provdatum: prov }),
    form: allaPunkter.length ? beraknaForm({ punkter: allaPunkter, aktivaDagar: aktiva, idag: b.idag }) : null,
    aktivitet,
    varDuTappar: familjer,
    milstolpar: [],
    ovisade: [],
    dagensPassGjort: aktiva.includes(b.idag),
    dagarKvar: prov ? dagarMellan(b.idag, prov) : null,
    forstaVeckan: null,
    fragaEfterProvet: fragaEfterProvet(b.plan, b.idag),
    start: start ? { dag: start.dag, niva: start.niva } : null,
    dagensTema: b.dagensTema === undefined ? 'rotation-med-byte' : b.dagensTema,
    senastePass: b.senastePass ?? null,
    behorighet: { harOvanGrund: betalande, harProvlage: betalande, harHistorik: betalande },
  };
}

/** Indata till hemvyn för ett tillstånd i konceptet. */
export function fixtur(t: Fixtur): HemIn & { laddar?: boolean } {
  const k = DATOR[t] ?? t;
  switch (k) {
    case 'T1':
      return { idag: '2026-10-10', status: status({ idag: '2026-10-10', plan: null }), flerTester: FLER_NY, jobbsok: JOBB_NY };
    case '1a':
      return {
        idag: '2026-10-10',
        status: status({ idag: '2026-10-10', plan: plan({ sikte: null }), betalande: false }),
        flerTester: FLER_NY,
        jobbsok: JOBB_NY,
      };
    case '1b':
    case 'L1':
      return {
        idag: '2026-10-10',
        status: status({ idag: '2026-10-10', plan: plan(), punkterTill: '2026-10-09', senastePass: pass('2026-10-09', { ratt: 6, niva_fore: 5.1, niva_efter: 5.4 }) }),
        flerTester: FLER,
        jobbsok: JOBB,
        laddar: k === 'L1',
      };
    case '1i':
      return {
        idag: '2026-10-10',
        status: status({
          idag: '2026-10-10',
          plan: plan({ leverantor: null, variant: null }),
          punkterTill: '2026-10-09',
          senastePass: pass('2026-10-09', { ratt: 6, over_tid: 1, niva_fore: 5.1, niva_efter: 5.4, budget_s: 83 }),
        }),
        flerTester: FLER,
        jobbsok: JOBB,
      };
    case '1h':
      return {
        idag: '2026-10-10',
        status: status({
          idag: '2026-10-10',
          plan: plan({ provdatum: null, sikte: null }),
          punkterTill: '2026-10-09',
          senastePass: pass('2026-10-09', { ratt: 6, niva_fore: 5.1, niva_efter: 5.4 }),
        }),
        flerTester: FLER,
        jobbsok: JOBB,
      };
    case '1g':
      return {
        idag: '2026-10-10',
        status: status({ idag: '2026-10-10', plan: plan(), punkterTill: '2026-10-10', senastePass: pass('2026-10-10'), nyPunkt: true }),
        flerTester: FLER,
        jobbsok: JOBB,
      };
    case '1f':
      // Gratis, dag 2 (7 oktober): mätningen gjord i går, grundpasset bara dag 0 (17.2).
      return {
        idag: '2026-10-07',
        status: status({ idag: '2026-10-07', plan: plan(), punkterTill: '2026-10-06', betalande: false, familjer: 'matning' }),
        flerTester: FLER_NY,
        jobbsok: JOBB_NY,
      };
    case '1c':
      return {
        idag: '2026-10-22',
        status: status({
          idag: '2026-10-22',
          plan: plan(),
          punkterTill: '2026-10-21',
          senastePass: pass('2026-10-21', { ratt: 6, niva_fore: 6.3, niva_efter: 6.3 }),
          familjer: 'pass',
          aktivitet: { pass: 11, ommatningar: 2, generalrepetitioner: 0, matningar: 1 },
        }),
        flerTester: FLER,
        jobbsok: JOBB,
      };
    case '1d':
      return {
        idag: PROV,
        status: status({
          idag: PROV,
          plan: plan(),
          punkterTill: '2026-10-23',
          aktivitet: { pass: 11, ommatningar: 2, generalrepetitioner: 2, matningar: 1 },
        }),
        flerTester: FLER,
        jobbsok: JOBB,
      };
    case '1e':
      return {
        idag: '2026-10-25',
        status: status({
          idag: '2026-10-25',
          plan: plan(),
          punkterTill: '2026-10-23',
          aktivitet: { pass: 11, ommatningar: 2, generalrepetitioner: 2, matningar: 1 },
        }),
        flerTester: FLER,
        jobbsok: JOBB,
      };
    case '1p':
      return {
        idag: '2026-10-10',
        status: status({ idag: '2026-10-10', plan: plan({ testtyper: ['personlighet'], leverantor: null, variant: null, sikte: null }), familjer: 'ingen' }),
        flerTester: FLER_NY,
        jobbsok: JOBB_NY,
      };
    case 'X1':
    default:
      return { idag: '2026-10-10', status: null, flerTester: FLER, jobbsok: JOBB };
  }
}

/** Alla dagar i exemplets plan, för testerna. */
export const EXEMPEL = { MATNING, PROV, KURVAN, dagar: dagarIntervall(MATNING, PROV), laggTill };
