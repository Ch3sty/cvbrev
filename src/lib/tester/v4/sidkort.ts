// src/lib/tester/v4/sidkort.ts
// Kortet under väggen på Tester och Din utveckling (skissen 2026-11-19).
// Hem har Nästa steg (hintarna); de andra två sidorna har ett kort i samma
// storlek med sidans eget budskap:
//
//   Tester            Prova något nytt
//     1  Synliga testtyper som inte är mätta, planens delar först, sedan
//        TEST_TYP_ORDNING (hur vanliga de är i rekryteringstest). Nivåkollen
//        där den finns, annars grundnivåtestet. Antalet som väntar.
//     2  Alla mätta: den typ du tränat minst de senaste sju dagarna
//        (lika: längst sedan senaste träningen). Träna.
//     3  Gratis med dagens grundnivåtest gjort och ingen Nivåkoll kvar att
//        göra gratis: nästa test i morgon, Premium.
//
//   Din utveckling    Vad kurvan säger, om huvudtypen (planens del, annars
//                     den mest mätta)
//     1  Ingen mätning: första Nivåkollen.
//     2  Senaste mätningen äldre än 14 dagar: kurvan har stått still.
//     3  Uppåt sedan första mätningen: ungefär hur många steg, nästa steg.
//     4  Nedåt: var du tappar mest (matrisens mönster) eller träning.
//     Därtill: stadigt (inom osäkerheten) och en enda punkt.
//
// Ren, testas (__tests__/sidkort.test.ts). Texterna bor i sidornas copy.ts.

import { TESTER } from '@/components/tester-v4/tester/copy';
import { UTV } from '@/components/tester-v4/utveckling/copy';
import { kopstegHref } from '@/lib/onboarding/steps';
import { SALD_PLAN } from '@/lib/plans/plans';
import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum';
import { kortDatum } from '@/lib/traning/rubrik';
import { ETIKETT, typNamn, typNamnSmall } from './copy';
import { NIVAKOLL_FINNS, menyHref, nivaTestHref, nivakollHrefV4, tranaHref } from './rutter';
import type { NivaLage, TestTypId, TesterV4Data, UtvecklingV4Data, UtvecklingsPunkt } from './typer';

export interface SidKortKnapp {
  etikett: string;
  href: string;
  /** Kräver Premium: låsikon och "Ingår i Premium" i knappen. */
  las: boolean;
}

export interface SidKortInnehall {
  slag: string;
  typ: TestTypId | null;
  /** Kortets överrad, i koppar. */
  etikett: string;
  /** Den lilla grå texten bredvid överraden. */
  meta: string | null;
  rubrik: string;
  skal: string;
  tips: string | null;
  knapp: SidKortKnapp;
}

/* --------------------------------- Tester --------------------------------- */

export type TesterKortSlag = 'nivakoll' | 'paborjad' | 'grund' | 'trana' | 'grund_igen' | 'imorgon';

export interface TesterKort extends SidKortInnehall {
  slag: TesterKortSlag;
  /** Omätta synliga testtyper som väntar. */
  vantar: number;
}

/** Dagarna som räknas som "senaste veckan", i dag inräknat. */
export const VECKA_DAGAR = 7;

type TesterIn = Pick<TesterV4Data, 'idag' | 'plan' | 'typer' | 'gratis' | 'kurva'>;

/** Kan typens Nivåkoll göras nu? Premium alltid, gratis en gång per typ. */
function nivakollOppen(typ: TestTypId, g: TesterIn['gratis']): boolean {
  return NIVAKOLL_FINNS[typ] && (g.premium || !g.nivakollGjord[typ]);
}

function imorgon(data: TesterIn, typ: TestTypId | null, vantar: number): TesterKort {
  const T = TESTER.imorgon;
  return {
    slag: 'imorgon',
    typ,
    vantar,
    etikett: T.etikett,
    meta: T.meta,
    rubrik: T.rubrik,
    skal: T.skal(data.gratis.pris.prisrad),
    tips: T.tips,
    knapp: { etikett: data.gratis.pris.knapp || TESTER.gratis.knapp, href: kopstegHref(SALD_PLAN, 'kvot'), las: false },
  };
}

/** Träningar per typ de senaste sju dagarna, ur kurvan. */
function traningarSenasteVeckan(kurva: readonly UtvecklingsPunkt[], idag: Dag): Map<TestTypId, number> {
  const fran = laggTill(idag, -(VECKA_DAGAR - 1));
  const ut = new Map<TestTypId, number>();
  for (const p of kurva) if (p.slag === 'trana' && p.dag >= fran && p.dag <= idag) ut.set(p.typ, (ut.get(p.typ) ?? 0) + 1);
  return ut;
}

export function testerKort(data: TesterIn): TesterKort {
  const g = data.gratis;
  const P = TESTER.provaNytt;
  const synliga = data.typer.filter((t) => t.synlig);
  // data.typer står redan i ordningen planens delar först, sedan TEST_TYP_ORDNING.
  const omatta = synliga.filter((t) => t.niva.status !== 'matt');
  const vantar = omatta.length;
  const grundKvar = g.premium || g.grundKvarIdag > 0;

  if (omatta.length) {
    // Gratis: en typ där något går att göra nu (Nivåkollen kvar, eller dagens grundnivåtest).
    const val = omatta.find((t) => nivakollOppen(t.id, g) || grundKvar);
    if (!val) return imorgon(data, omatta[0].id, vantar);
    const namn = typNamnSmall(val.id);
    const meta = P.vantar(vantar);
    if (nivakollOppen(val.id, g)) {
      const href = nivakollHrefV4(val.id) ?? menyHref(val.id);
      if (val.niva.status === 'paborjad') {
        return { slag: 'paborjad', typ: val.id, vantar, etikett: P.etikett, meta, rubrik: P.paborjad.rubrik(namn), skal: P.paborjad.skal, tips: P.paborjad.tips, knapp: { etikett: ETIKETT.fortsatt, href, las: false } };
      }
      const skal = data.plan && val.ingarIPlan ? P.nivakoll.skalPlan(typNamn(val.id), data.plan.namn) : P.nivakoll.skal(namn);
      return { slag: 'nivakoll', typ: val.id, vantar, etikett: P.etikett, meta, rubrik: P.nivakoll.rubrik(namn), skal, tips: P.nivakoll.tips, knapp: { etikett: ETIKETT.gorNivakollen, href, las: false } };
    }
    return {
      slag: 'grund',
      typ: val.id,
      vantar,
      etikett: P.etikett,
      meta,
      rubrik: P.grund.rubrik(namn),
      skal: P.grund.skal(namn),
      tips: g.premium ? P.grund.tips : P.grund.tipsGratis,
      knapp: { etikett: P.grund.knapp, href: nivaTestHref(val.id, 'grund'), las: false },
    };
  }

  // Alla mätta: den typ du tränat minst senaste veckan, vid lika den som legat längst.
  const veckan = traningarSenasteVeckan(data.kurva, data.idag);
  const minst = [...synliga].sort((a, b) => {
    const d = (veckan.get(a.id) ?? 0) - (veckan.get(b.id) ?? 0);
    if (d !== 0) return d;
    const sa = a.senasteTraning ?? '';
    const sb = b.senasteTraning ?? '';
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  })[0];
  if (!minst) return imorgon(data, null, 0);
  const D = TESTER.dagsIgen;
  const namn = typNamnSmall(minst.id);
  if (!g.premium) {
    if (!grundKvar) return imorgon(data, minst.id, 0);
    return { slag: 'grund_igen', typ: minst.id, vantar: 0, etikett: D.etikett, meta: D.allaMatta, rubrik: D.rubrikGrund(namn), skal: D.gratisSkal(namn), tips: TESTER.provaNytt.grund.tipsGratis, knapp: { etikett: TESTER.provaNytt.grund.knapp, href: nivaTestHref(minst.id, 'grund'), las: false } };
  }
  const skal = !minst.senasteTraning
    ? D.aldrig(namn)
    : dagarMellan(minst.senasteTraning, data.idag) >= VECKA_DAGAR
      ? D.enVecka(namn)
      : D.minst(namn);
  return { slag: 'trana', typ: minst.id, vantar: 0, etikett: D.etikett, meta: D.allaMatta, rubrik: D.rubrik(namn), skal, tips: D.tips, knapp: { etikett: ETIKETT.trana, href: tranaHref(minst.id), las: false } };
}

/* ----------------------------- Din utveckling ----------------------------- */

export type KurvKortSlag = 'forsta' | 'still' | 'upp' | 'ned' | 'stadig' | 'en_punkt';

export interface KurvPanel {
  typ: TestTypId | null;
  rubrik: string;
  niva: NivaLage | null;
  text: string;
  /** Planens del: bandet i koppar. */
  plan: boolean;
}

export interface KurvKort extends SidKortInnehall {
  slag: KurvKortSlag;
  panel: KurvPanel;
}

/** Äldre än så här räknas kurvan som stillastående. */
export const STILL_DAGAR = 14;

type UtvIn = Pick<UtvecklingV4Data, 'idag' | 'plan' | 'typer' | 'punkter' | 'gratis' | 'historikLast' | 'matrisMonster'>;

/** Punkterna med nivå som räknas (Nivåkoll, nivåtest, träning), i tidsordning. */
function matningar(punkter: readonly UtvecklingsPunkt[], typ: TestTypId): UtvecklingsPunkt[] {
  return punkter.filter((p) => p.typ === typ && p.niva != null && p.raknas && p.slag !== 'ovningsprov');
}

/** Huvudtypen: planens första del, annars den med flest mätningar (vid lika den senast mätta). */
export function huvudTyp(data: UtvIn): TestTypId | null {
  const forsta = data.plan?.typer[0];
  if (forsta) return forsta;
  let bast: TestTypId | null = null;
  let flest = 0;
  let senast = '';
  for (const t of data.typer) {
    const m = matningar(data.punkter, t.id);
    const dag = m.at(-1)?.dag ?? '';
    if (m.length > flest || (m.length === flest && m.length > 0 && dag > senast)) {
      bast = t.id;
      flest = m.length;
      senast = dag;
    }
  }
  return bast;
}

function knappMat(typ: TestTypId, data: UtvIn): SidKortKnapp {
  const K = UTV.kurvan.knapp;
  if (!NIVAKOLL_FINNS[typ]) return { etikett: K.grund, href: nivaTestHref(typ, 'grund'), las: false };
  const las = !data.gratis.premium && !!data.gratis.nivakollGjord[typ];
  return { etikett: K.matDinNiva, href: las ? menyHref(typ) : nivakollHrefV4(typ) ?? menyHref(typ), las };
}

/** Nästa steg efter en rörelse: Träna med Premium, annars dagens grundnivåtest eller Premium. */
function knappTrana(typ: TestTypId, data: UtvIn, href?: string, etikett?: string): SidKortKnapp {
  const K = UTV.kurvan.knapp;
  if (data.gratis.premium) return { etikett: etikett ?? K.trana, href: href ?? tranaHref(typ), las: false };
  if (data.gratis.grundKvarIdag > 0) return { etikett: K.grund, href: nivaTestHref(typ, 'grund'), las: false };
  return { etikett: etikett ?? K.trana, href: kopstegHref(SALD_PLAN, 'kurvan'), las: true };
}

function panelFor(data: UtvIn, typ: TestTypId | null): KurvPanel {
  const P = UTV.kurvan.panel;
  const rad = typ ? data.typer.find((t) => t.id === typ) ?? null : null;
  const niva = rad?.niva ?? null;
  const iPlan = !!data.plan && !!typ && data.plan.typer.includes(typ);
  const matt = niva?.status === 'matt' && niva.niva != null;
  let text: string;
  if (!iPlan) text = matt ? P.utanPlan : P.omattUtanPlan;
  else if (!matt) text = P.omatt;
  else text = (niva!.niva as number) < 4 ? P.under : (niva!.niva as number) < 7 ? P.inne : P.over;
  return { typ, rubrik: iPlan ? P.rubrikPlan : P.rubrikUtanPlan, niva, text, plan: iPlan || !data.plan };
}

export function kurvKort(data: UtvIn): KurvKort {
  const K = UTV.kurvan;
  const typ = huvudTyp(data);
  const allaMatningar = data.typer.some((t) => matningar(data.punkter, t.id).length > 0);
  const startTyp: TestTypId = typ ?? 'matris';
  const panel = panelFor(data, typ ?? (allaMatningar ? null : startTyp));
  const bas = { etikett: K.etikett, panel };

  const egna = typ ? matningar(data.punkter, typ) : [];
  // 1. Ingen mätning alls, eller ingen i huvudtypen.
  if (!allaMatningar || egna.length === 0) {
    const t = startTyp;
    const grund = !NIVAKOLL_FINNS[t];
    return {
      ...bas,
      slag: 'forsta',
      typ: t,
      meta: K.forsta.meta,
      rubrik: allaMatningar ? K.forsta.rubrikTyp(typNamnSmall(t)) : K.forsta.rubrik,
      skal: grund ? K.forsta.skalGrund(typNamn(t)) : K.forsta.skal,
      tips: grund ? null : K.forsta.tips,
      knapp: knappMat(t, data),
    };
  }

  const t = typ as TestTypId;
  const namn = typNamnSmall(t);
  const senaste = egna[egna.length - 1];
  const sedan = dagarMellan(senaste.dag, data.idag);

  // 2. Stått still i mer än två veckor.
  if (sedan > STILL_DAGAR) {
    return { ...bas, slag: 'still', typ: t, meta: K.still.meta(sedan), rubrik: K.still.rubrik, skal: K.still.skal(namn), tips: K.still.tips, knapp: knappMat(t, data) };
  }

  // En enda punkt: ingen riktning än (även gratis, där bara senaste punkten syns).
  if (egna.length < 2) {
    return { ...bas, slag: 'en_punkt', typ: t, meta: K.enPunkt.meta, rubrik: K.enPunkt.rubrik(namn), skal: data.historikLast ? K.enPunkt.skalLast : K.enPunkt.skal, tips: K.enPunkt.tips, knapp: knappTrana(t, data) };
  }

  const forsta = egna[0];
  const rad = data.typer.find((x) => x.id === t);
  const nu = rad?.niva.niva ?? (senaste.niva as number);
  const osakerhet = rad?.niva.osakerhet ?? 0.6;
  const skillnad = nu - (forsta.niva as number);

  // 3. Uppåt.
  if (skillnad > osakerhet + 1e-9) {
    const steg = Math.max(1, Math.round(skillnad));
    const iPlan = !!data.plan?.typer.includes(t);
    const svans = nu < 4 ? K.upp.underProvet : nu < 7 ? K.upp.iProvet : K.upp.overProvet;
    const prov = iPlan && nu >= 4 && data.gratis.premium && data.plan?.ovningsprov ? data.plan.ovningsprov : null;
    return {
      ...bas,
      slag: 'upp',
      typ: t,
      meta: K.upp.meta,
      rubrik: K.upp.rubrik(namn, K.steg(steg)),
      skal: `${K.upp.skal(kortDatum(forsta.dag))}${svans}`,
      tips: K.upp.tips,
      knapp: prov ? { etikett: K.knapp.ovningsprov, href: prov.href, las: false } : knappTrana(t, data),
    };
  }

  // 4. Nedåt: mönstret där du tappar mest, annars träning.
  if (skillnad < -(osakerhet + 1e-9)) {
    const svagast =
      t === 'matris'
        ? (data.matrisMonster ?? [])
            .filter((m) => m.lage === 'mott' && m.ratt != null && m.antal != null && m.antal > 0)
            .sort((a, b) => (a.ratt as number) / (a.antal as number) - (b.ratt as number) / (b.antal as number))[0] ?? null
        : null;
    if (svagast) {
      return {
        ...bas,
        slag: 'ned',
        typ: t,
        meta: K.ned.meta,
        rubrik: K.ned.rubrikMonster(svagast.namn.toLowerCase()),
        skal: K.ned.skalMonster(svagast.ratt as number, svagast.antal as number),
        tips: K.ned.tips,
        knapp: knappTrana(t, data, svagast.href, K.knapp.tranaMonster),
      };
    }
    return { ...bas, slag: 'ned', typ: t, meta: K.ned.meta, rubrik: K.ned.rubrik(namn), skal: K.ned.skal, tips: K.ned.tips, knapp: knappTrana(t, data) };
  }

  return { ...bas, slag: 'stadig', typ: t, meta: K.stadig.meta, rubrik: K.stadig.rubrik(namn), skal: K.stadig.skal, tips: K.stadig.tips, knapp: knappTrana(t, data) };
}
