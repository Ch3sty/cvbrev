// src/lib/tester/v4/fixturer.ts
// Fixturerna för förhandsvisningarna och vitest: exakt skissens tal
// (smal-plan-2026-11-18/skiss.html, TYPER, PLAN, FAMILJER), byggda genom
// samma modell som produktionen (modell.ts). Läge a: utan plan. b: Alva
// Logic. c: I-provet. Skissens dag 0 är 11 oktober, i dag är 18 november.
// Ren, går att importera från klienten.

import { laggTill, type Dag } from '@/lib/traning/datum';
import { prisFor } from './gratis';
import { byggTesterV4, byggUtvecklingV4, type ModellIn, type TypUnderlag } from './modell';
import { genomgangHref, IPROV_HREF } from './rutter';
import { TEST_TYP_ORDNING, type Gratislage, type MonsterLage, type PlanV4, type TestTypId, type TesterV4Data, type UtvecklingV4Data, type UtvecklingsPunkt } from './typer';

export type FixturLage = 'a' | 'b' | 'c';
export type FixturNiva = 'premium' | 'gratis';
export interface FixturOpt {
  /** Planen skapad ur en artikel, utan datum och utan data (Alva Logic). */
  artikel?: boolean;
  /** Gratis: dagens grundnivåtest är gjort. */
  kvotAnvand?: boolean;
}

const START: Dag = '2026-10-11';
export const FIXTUR_IDAG: Dag = laggTill(START, 38);
const dag = (d: number): Dag => laggTill(START, d);

type SkissPunkt = [number, number | string, 'nk' | 'tr' | 'ov'];
interface SkissTyp {
  id: TestTypId;
  punkter: SkissPunkt[];
  svar?: number;
  svag?: [string, string, number, number];
  tempo?: number;
}

const TYPER: SkissTyp[] = [
  {
    id: 'matris',
    svag: ['Figuren speglas', 'spegling', 2, 6],
    tempo: 14,
    punkter: [[0, 5.0, 'nk'], [2, 5.2, 'tr'], [4, 5.3, 'tr'], [7, 5.4, 'nk'], [9, 5.5, 'tr'], [11, 5.6, 'tr'], [14, 5.8, 'nk'], [17, 5.9, 'tr'], [20, 6.0, 'tr'], [24, 6.0, 'tr'], [28, 6.1, 'tr'], [31, 6.1, 'nk'], [32, '13 av 20 · 4 över tid', 'ov'], [34, 6.2, 'tr'], [36, 6.3, 'tr'], [37, 6.3, 'tr']],
  },
  { id: 'figurserie', punkter: [] },
  { id: 'deduktiv', punkter: [[22, 5.0, 'nk'], [26, 5.1, 'tr'], [30, 5.2, 'tr'], [34, 5.3, 'nk']] },
  { id: 'verbal', punkter: [[26, 5.0, 'nk'], [33, 5.0, 'tr']] },
  { id: 'numerisk', punkter: [] },
  { id: 'talserie', svag: ['Växande steg', 'vaxande-steg', 3, 6], tempo: 22, punkter: [[29, 3.8, 'nk'], [31, 3.9, 'tr'], [33, 4.1, 'tr'], [35, 'I-provet, talserier: 11 av 16', 'ov'], [36, 4.2, 'nk']] },
  { id: 'spatial', punkter: [] },
  { id: 'ordforrad', svar: 8, punkter: [] },
];

const FAMILJER: [string, string, MonsterLage, number?, number?][] = [
  ['Figuren vrider sig', 'vridning', 'snabb'],
  ['Hela mönstret vrider sig', 'monsterrotation', 'saker'],
  ['Figuren flyttar sig runt kanten', 'vandring', 'saker'],
  ['Vrider sig och byter utseende', 'rotation-med-byte', 'mott', 3, 4],
  ['Två saker rör sig samtidigt', 'tva-rorelser', 'mott', 1, 3],
  ['Varje antal en gång per rad', 'latin-antal', 'saker'],
  ['Varje form en gång per rad', 'latin-form', 'saker'],
  ['Form och antal, en gång var per rad', 'latin-flera', 'omott'],
  ['Två rutor läggs ihop', 'overlagring', 'saker'],
  ['Figuren speglas', 'spegling', 'mott', 2, 6],
  ['Antalet ökar eller minskar', 'antal-andras', 'omott'],
];

function punkt(typ: TestTypId, p: SkissPunkt, i: number): UtvecklingsPunkt {
  const [d, v, s] = p;
  const id = `fixtur-${typ}-${i}`;
  if (s === 'ov') {
    const text = String(v);
    const m = text.match(/(\d+) av (\d+)/);
    const over = text.match(/(\d+) över tid/);
    const resultat = m ? { ratt: Number(m[1]), antal: Number(m[2]) } : null;
    const provNamn = text.includes(':') ? text.split(':')[0] : typ === 'matris' ? 'Övningsprov Alva' : 'Övningsprov';
    return { id, typ, dag: dag(d), slag: 'ovningsprov', niva: null, raknas: true, resultat, overTid: over && resultat ? Number(over[1]) / resultat.antal : null, provNamn, href: genomgangHref(id) };
  }
  return {
    id,
    typ,
    dag: dag(d),
    slag: s === 'nk' ? 'nivakoll' : 'trana',
    niva: Number(v),
    raknas: true,
    resultat: s === 'nk' ? { ratt: 8, antal: 12 } : { ratt: 7, antal: 10 },
    overTid: s === 'nk' ? 2 / 12 : null,
    href: genomgangHref(id),
  };
}

const PLANER: Record<'b' | 'c', Omit<PlanV4, 'franArtikel'>> = {
  b: {
    mittTest: 'alva',
    namn: 'Alva Logic',
    typer: ['matris'],
    provdatum: '2026-11-25',
    dagarKvar: 7,
    planStart: '2026-11-15',
    dagsmal: 2,
    format: 'Provet har 20 uppgifter med två minuter var.',
    ovningsprov: { namn: 'Övningsprov Alva', meta: '20 uppgifter, två minuter var', href: '/dashboard/tester/ovningsprov/logik', foreslagenDag: '2026-11-23' },
  },
  c: {
    mittTest: 'iprov',
    namn: 'I-provet',
    typer: ['ordforrad', 'spatial', 'talserie'],
    provdatum: '2026-11-30',
    dagarKvar: 12,
    planStart: '2026-11-15',
    dagsmal: 2,
    format: 'Provet har tre delar i fast ordning med egen tid per del.',
    ovningsprov: { namn: 'Övningsprov I-provet', meta: 'I provets ordning, med provets tid', href: IPROV_HREF, foreslagenDag: '2026-11-28' },
  },
};

function fixturPlan(lage: FixturLage, artikel: boolean): PlanV4 | null {
  if (lage === 'a' && !artikel) return null;
  const bas = PLANER[lage === 'c' ? 'c' : 'b'];
  if (!artikel) return { ...bas, franArtikel: false };
  return { ...bas, provdatum: null, dagarKvar: null, planStart: FIXTUR_IDAG, dagsmal: null, ovningsprov: bas.ovningsprov && { ...bas.ovningsprov, foreslagenDag: null }, franArtikel: true };
}

function modellIn(lage: FixturLage, niva: FixturNiva, opt: FixturOpt = {}): ModellIn {
  const artikel = !!opt.artikel;
  const premium = niva === 'premium';
  const plan = fixturPlan(lage, artikel);
  const typer = {} as Record<TestTypId, TypUnderlag>;
  for (const t of TYPER) {
    const punkter = artikel ? [] : t.punkter.map((p, i) => punkt(t.id, p, i));
    const svag = !artikel && t.svag ? { namn: t.svag[0], family: t.svag[1], ratt: t.svag[2], antal: t.svag[3] } : null;
    typer[t.id] = {
      punkter,
      paborjad: !artikel && t.svar ? { besvarade: t.svar, antal: 12 } : null,
      svagaste: svag,
      monster: svag ? [svag] : [],
      tempo: !artikel && t.tempo != null ? t.tempo / 100 : null,
      synlig: true,
      provad: punkter.length > 0 || (!artikel && !!t.svar),
      nivakollFinns: true,
    };
  }
  const nivakollGjord: Partial<Record<TestTypId, boolean>> = {};
  for (const id of TEST_TYP_ORDNING) if (typer[id].punkter.some((p) => p.slag === 'nivakoll')) nivakollGjord[id] = true;

  const gratis: Gratislage = {
    premium,
    harHistorik: premium,
    grundKvarIdag: premium ? 1 : opt.kvotAnvand ? 0 : 1,
    pafyllning: '2026-11-18T23:00:00.000Z',
    nivakollGjord,
    pris: prisFor(null),
  };
  const aktivaDagar = artikel ? [] : [...new Set(TYPER.flatMap((t) => t.punkter.map((p) => dag(p[0]))))];
  return {
    idag: FIXTUR_IDAG,
    plan,
    typer,
    gratis,
    dagsmal: artikel ? { mal: null, gjortIdag: 0, dagarIRad: 0 } : { mal: plan ? 2 : null, gjortIdag: premium && plan ? 1 : 0, dagarIRad: premium ? 4 : 1 },
    aktivaDagar: aktivaDagar.length ? [...aktivaDagar, laggTill(FIXTUR_IDAG, -2), laggTill(FIXTUR_IDAG, -1)] : [],
    personlighet: { gjord: false },
    paket: premium ? { scope: 'allt', track: null, planKey: 'all_month' } : { scope: null, track: null, planKey: null },
    matrisMonster: artikel
      ? null
      : FAMILJER.map(([namn, family, l, ratt, antal]) => ({
          namn,
          family,
          lage: l,
          ...(ratt != null ? { ratt } : {}),
          ...(antal != null ? { antal } : {}),
          href: `/dashboard/tester/pass?typ=riktat&family=${family}`,
        })),
  };
}

/** Tester och Hem med skissens tal. */
export function fixturTester(lage: FixturLage, niva: FixturNiva, opt?: FixturOpt): TesterV4Data {
  return byggTesterV4(modellIn(lage, niva, opt));
}

/** Din utveckling med skissens tal. */
export function fixturUtveckling(lage: FixturLage, niva: FixturNiva, opt?: FixturOpt): UtvecklingV4Data {
  return byggUtvecklingV4(modellIn(lage, niva, opt));
}

/** Underlaget, för tester av modellen. */
export function fixturUnderlag(lage: FixturLage, niva: FixturNiva, opt?: FixturOpt): ModellIn {
  return modellIn(lage, niva, opt);
}
