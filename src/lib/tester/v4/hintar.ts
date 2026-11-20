// src/lib/tester/v4/hintar.ts
// Hintmotorn för Hem (planen A5, utkast v4 avsnitt 2). Ren. Prioritetsordning:
//
//   0  Ingen data alls och plan från artikel          forsta_steg (stängbar, ensam)
//   1  Planens typ omätt, eller nivåkoll påbörjad      nivakoll_saknas, nivakoll_paborjad
//   2  Mönster med minst sex svar under 60 procent    svagt_monster
//   3  Över 30 procent av svaren över provets tid     tempo
//   4  Sju dagar eller mer sedan nivåkollen           nivakoll_igen
//   5  Högst sju dagar till provet                    provet_nara
//   6  Utan plan: omätta typer, högst två             prova_nytt
//   7  Inget pekar                                    prova_nytt (en ny typ)
//
// Med plan räknas bara planens typer i 1 till 4. Hintar vars knapp kräver
// Premium får knapp.las "Ingår i Premium". Högst fem.

import { dagarMellan, type Dag } from '@/lib/traning/datum';
import { ETIKETT, HINT, LAS_CHIP, kortDag } from './copy';
import { arSvagt, TEMPO_GRANS } from './monster';
import { nivaTestHref, nivakollHrefV4, ovningsprovHrefV4, tranaHref, menyHref } from './rutter';
import type { Handling, Hint, HintTyp, NivaLage, PlanV4, TestTypId } from './typer';
import { NIVAKOLL_INTERVALL_DAGAR } from './bana';
import { ovaPa } from './monsterNamn';

export const MAX_HINTAR = 5;
export const PROVET_NARA_DAGAR = 7;

export interface HintTypIn {
  typ: TestTypId;
  niva: NivaLage;
  senasteNivakoll: Dag | null;
  traningarSedanNivakoll: number;
  svagaste: { namn: string; family: string; ratt: number; antal: number } | null;
  /** Andel svar över provets tid, 0 till 1. */
  tempo: number | null;
  nivakollFinns: boolean;
  /** Någon slutförd session i typen (nivåtest, träning, nivåkoll eller prov). */
  provad: boolean;
  synlig: boolean;
}

export interface HintIn {
  idag: Dag;
  plan: PlanV4 | null;
  /** I TEST_TYP_ORDNING. */
  typer: readonly HintTypIn[];
  premium: boolean;
  nivakollGjord: Partial<Record<TestTypId, boolean>>;
  /** Grundnivåtest kvar i dag utan paket (0 eller 1). Utelämnat: inget kvotlås. */
  grundKvarIdag?: number;
}

const PREMIUM_LAS = { skal: 'premium' as const, chip: LAS_CHIP.premium };

function knappNivakoll(t: HintTypIn, inp: HintIn, etikett: string = ETIKETT.matDinNiva): Handling {
  const href = nivakollHrefV4(t.typ) ?? menyHref(t.typ);
  const las = !inp.premium && inp.nivakollGjord[t.typ] ? PREMIUM_LAS : null;
  return { slag: 'nivakoll', etikett, href, las };
}

function knappTrana(t: HintTypIn, inp: HintIn, familj?: string | null): Handling {
  return { slag: 'trana', etikett: ETIKETT.trana, href: tranaHref(t.typ, familj), las: inp.premium ? null : PREMIUM_LAS };
}

function knappGrund(t: HintTypIn, inp: HintIn): Handling {
  const slut = !inp.premium && inp.grundKvarIdag === 0;
  return { slag: 'niva_test', etikett: 'Testa grundnivån', href: nivaTestHref(t.typ, 'grund'), zon: 'grund', las: slut ? { skal: 'kvot', chip: LAS_CHIP.kvot } : null };
}

function hint(typ: HintTyp, testtyp: TestTypId | null, text: { eyebrow: string; rubrik: string; skal: string; tips: string }, knapp: Handling, stangbar = false): Hint {
  return { id: `${typ}:${testtyp ?? 'alla'}`, typ, testtyp, ...text, knapp, stangbar };
}

export function byggHintar(inp: HintIn): Hint[] {
  const { plan } = inp;
  const synliga = inp.typer.filter((t) => t.synlig);
  const mina = plan ? synliga.filter((t) => plan.typer.includes(t.typ)) : synliga;
  const ut: Hint[] = [];

  // 0. Första steget: ingen data alls, plan från artikel.
  const ingenData = synliga.every((t) => !t.provad && t.niva.status === 'omatt');
  if (plan && plan.franArtikel && ingenData) {
    const t = mina.find((x) => x.nivakollFinns) ?? mina[0] ?? synliga[0];
    if (t) {
      const knapp = t.nivakollFinns ? knappNivakoll(t, inp, ETIKETT.gorNivakollen) : knappGrund(t, inp);
      return [hint('forsta_steg', t.typ, HINT.forstaSteg(plan.namn, t.typ), knapp, true)];
    }
  }
  // 0 utan plan: ny användare utan data får ett tydligt första steg.
  if (!plan && ingenData) {
    const t = synliga.find((x) => x.typ === 'matris' && x.nivakollFinns) ?? synliga.find((x) => x.nivakollFinns);
    if (t) return [hint('forsta_steg', t.typ, HINT.forstaStegUtanPlan(t.typ), knappNivakoll(t, inp, ETIKETT.gorNivakollen), true)];
  }

  // 1. Planens typ omätt; påbörjad nivåkoll i alla typer som räknas.
  if (plan) {
    for (const t of mina) {
      if (t.niva.status !== 'omatt') continue;
      if (t.nivakollFinns) ut.push(hint('nivakoll_saknas', t.typ, HINT.nivakollSaknas(plan.namn, t.typ), knappNivakoll(t, inp)));
      else if (!t.provad) ut.push(hint('nivakoll_saknas', t.typ, HINT.grundnivaSaknas(plan.namn, t.typ), knappGrund(t, inp)));
    }
  }
  for (const t of mina) {
    if (t.niva.status === 'paborjad' && t.niva.svar) {
      ut.push(hint('nivakoll_paborjad', t.typ, HINT.nivakollPaborjad(t.typ, t.niva.svar.besvarade, t.niva.svar.antal), { ...knappNivakoll(t, inp, ETIKETT.fortsatt), las: null }));
    }
  }

  // 2. Svagaste mönstret.
  for (const t of mina) {
    if (t.svagaste && arSvagt(t.svagaste)) {
      ut.push(hint('svagt_monster', t.typ, HINT.svagtMonster(t.typ, t.svagaste.namn, t.svagaste.ratt, t.svagaste.antal, ovaPa(t.typ, t.svagaste.family)), knappTrana(t, inp, t.svagaste.family)));
    }
  }

  // 3. Tempot.
  for (const t of mina) {
    if (t.tempo != null && t.tempo > TEMPO_GRANS && t.niva.status === 'matt') {
      ut.push(hint('tempo', t.typ, HINT.tempo(t.typ, Math.round(t.tempo * 100)), knappTrana(t, inp)));
    }
  }

  // 4. Sju dagar sedan nivåkollen.
  for (const t of mina) {
    if (t.niva.status === 'matt' && t.nivakollFinns && t.senasteNivakoll && dagarMellan(t.senasteNivakoll, inp.idag) >= NIVAKOLL_INTERVALL_DAGAR) {
      ut.push(hint('nivakoll_igen', t.typ, HINT.nivakollIgen(t.typ, kortDag(t.senasteNivakoll), t.traningarSedanNivakoll), knappNivakoll(t, inp)));
    }
  }

  // 5. Provet nära.
  if (plan && plan.provdatum && plan.dagarKvar != null && plan.dagarKvar >= 0 && plan.dagarKvar <= PROVET_NARA_DAGAR && plan.ovningsprov) {
    const ov = plan.ovningsprov;
    const foreslagen = ov.foreslagenDag ?? inp.idag;
    const typ = plan.typer[0] ?? null;
    const knapp: Handling = { slag: 'ovningsprov', etikett: ETIKETT.ovningsprov, href: ov.href, las: inp.premium ? null : PREMIUM_LAS };
    ut.push(hint('provet_nara', typ, HINT.provetNara(ov.namn, dagarMellan(inp.idag, foreslagen), kortDag(foreslagen)), knapp));
  }

  // 6. Utan plan: omätta typer, högst två.
  if (!plan) {
    const omatta = synliga.filter((t) => t.niva.status === 'omatt' && !t.provad).slice(0, 2);
    for (const t of omatta) {
      ut.push(
        t.nivakollFinns
          ? hint('prova_nytt', t.typ, HINT.provaNytt(t.typ), knappNivakoll(t, inp))
          : hint('prova_nytt', t.typ, HINT.provaNyttGrund(t.typ), knappGrund(t, inp))
      );
    }
  }

  // 7. Inget pekar.
  if (ut.length === 0) {
    const ny = synliga.find((t) => t.niva.status === 'omatt' && t.nivakollFinns && !inp.nivakollGjord[t.typ]);
    if (ny) ut.push(hint('prova_nytt', ny.typ, HINT.ingetPekar(ny.typ), knappNivakoll(ny, inp)));
    else {
      const t = mina.find((x) => x.niva.status === 'matt') ?? synliga.find((x) => x.niva.status === 'matt') ?? synliga[0];
      if (t) ut.push(hint('prova_nytt', t.typ, HINT.ingetPekarTrana(t.typ), knappTrana(t, inp)));
    }
  }

  // En hint per id; de första i ordningen vinner.
  const sedda = new Set<string>();
  return ut.filter((h) => (sedda.has(h.id) ? false : (sedda.add(h.id), true))).slice(0, MAX_HINTAR);
}

/** Övningsprovets adress för planens första typ, för PlanV4.ovningsprov. */
export function planensOvningsprovHref(plan: Pick<PlanV4, 'mittTest' | 'typer'>): string | null {
  if (plan.mittTest === 'iprov') return '/dashboard/tester/iprov';
  const forsta = plan.typer[0];
  return forsta ? ovningsprovHrefV4(forsta) : null;
}
