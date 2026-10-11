// src/lib/ovningsprov/resultat.ts
// =============================================================================
// Övningsprovets resultat som vymodell (Testerna v2, skiss 3, riktlinjerna
// 1.4 och 5.2), samma form för logik, verbalt och numeriskt:
//   1. ringen och rubriken "23 av 35 rätt", procenten bara i ringen
//   2. två tal: tiden och obesvarade (eller "Tiden räckte")
//   3. logik: kurvan med den nya punkten och ordet om nivån; verbalt och
//      numeriskt: ordet om var poängen tappades (de har ingen nivåskala än)
//   4. genomgången, var du tappade och tempot mot provets tid
// Statusraden sist pekar på i morgon. Aldrig percentil, aldrig "godkänd",
// aldrig rött. Ren.
// =============================================================================

import type { Staplar } from '@/lib/traning/resultat';
import { nivaKort } from '@/lib/traning/pass-copy';
import { RESULTAT, PUNKT_ORD } from './copy';
import type { Provtyp } from './format';
import type { Ovningsvy } from './typer';

export interface OvningsResultatVM {
  typ: Provtyp;
  brand: string;
  datum: string | null;
  ratt: number;
  antal: number;
  tid: { varde: string; etikett: string };
  andra: { varde: string; etikett: string; koppar: boolean };
  mening: string | null;
  genomgang: { titel: string; text: string; antal: number; knapp: string };
  tappade: { titel: string; rader: { namn: string; meta: string; andel: number }[] } | null;
  tempo: { titel: string; text: string; staplar: Staplar; axel: { start: string; mitt: string; slut: string }; aria: string };
  status: string;
}

function andraTalet(typ: Provtyp, obesvarade: number): OvningsResultatVM['andra'] {
  return obesvarade > 0
    ? { varde: String(obesvarade), etikett: RESULTAT.obesvaradeEtikett, koppar: true }
    : { varde: RESULTAT.tidenRackte, etikett: RESULTAT.allaBesvarade(typ), koppar: false };
}

function staplarFor(tider: { tid_s: number; fel: boolean; obesvarad: boolean }[], budget_s: number): Staplar {
  const max = Math.max(budget_s / 0.88, ...tider.map((t) => t.tid_s), 1);
  return {
    staplar: tider.map((t) => ({
      hojd: t.obesvarad && t.tid_s === 0 ? 0.14 : Math.max(0.06, Math.min(1, t.tid_s / max)),
      over: t.tid_s > budget_s,
      fel: t.fel,
      tid_s: t.tid_s,
    })),
    linje: 1 - budget_s / max,
    budget_s,
  };
}

/** I morgon-raden: dagen före provet är provet i morgon, annars dagens pass. */
export function statusRad(dagarKvar: number | null): string {
  return dagarKvar === 1 ? RESULTAT.status.imorgonProv : RESULTAT.status.imorgonPass;
}

/** Verbalt och numeriskt, ur den avslutade sessionen. */
export function ovningsResultat(vy: Ovningsvy, opt: { datum: string | null; dagarKvar: number | null }): OvningsResultatVM | null {
  const r = vy.resultat;
  if (!r) return null;
  const typ = vy.typ;
  const ord = vy.format.delar?.ord ?? 'underlag';
  const delOrd = ord === 'texter' ? 'texter' : 'underlag';
  const delEn = ord === 'texter' ? 'text' : 'underlag';
  const besvarade = r.antal - r.obesvarade;
  const missar = r.antal - r.ratt;
  const over = r.delar.filter((d) => d.tid_s > d.budget_s).length;
  return {
    typ,
    brand: RESULTAT.brand(typ),
    datum: opt.datum,
    ratt: r.ratt,
    antal: r.antal,
    tid: { varde: RESULTAT.tid(r.tid_s), etikett: RESULTAT.tidEtikett(vy.format.minuter) },
    andra: andraTalet(typ, r.obesvarade),
    mening: RESULTAT.mening(r.obesvarade, besvarade > 0 ? (r.ratt / besvarade) : 0, r.tappade[0]?.namn ?? null),
    genomgang: {
      titel: RESULTAT.genomgang.titel(missar),
      text: RESULTAT.genomgang.text(missar - r.obesvarade, r.obesvarade),
      antal: missar,
      knapp: RESULTAT.genomgang.knapp(missar),
    },
    tappade: r.tappade.length
      ? {
          titel: RESULTAT.tappade.titel(r.tappade.length),
          rader: r.tappade.map((t) => ({ namn: t.namn, meta: RESULTAT.tappade.meta(t.ratt, t.antal), andel: t.antal ? t.ratt / t.antal : 0 })),
        }
      : null,
    tempo: {
      titel: RESULTAT.tempo.titel(over, r.delar.length, delOrd),
      text: RESULTAT.tempo.text(vy.format.delar?.budget_s ?? vy.format.budget_s, delEn),
      staplar: staplarFor(
        r.delar.map((d) => ({ tid_s: d.tid_s, fel: d.ratt < d.antal, obesvarad: d.obesvarade === d.antal })),
        vy.format.delar?.budget_s ?? vy.format.budget_s
      ),
      axel: {
        start: RESULTAT.tempo.axelStart(delEn),
        mitt: RESULTAT.tempo.axelMitt,
        slut: RESULTAT.tempo.axelSlut(delEn, r.delar.length),
      },
      aria: RESULTAT.tempo.aria(vy.format.delar?.budget_s ?? vy.format.budget_s),
    },
    status: statusRad(opt.dagarKvar),
  };
}

/** Logikens övningsprov, ur testmotorns avslut (typ general). */
export function logikResultat(inp: {
  ratt: number;
  antal: number;
  obesvarade: number;
  tid_s: number;
  minuter: number;
  budget_s: number;
  niva_fore: number | null;
  niva_efter: number | null;
  /** Tid och utfall per uppgift i provets ordning, obesvarade inräknade. */
  uppgifter: { tid_s: number; correct: boolean; besvarad: boolean }[];
  /** Familjerna i provet, svagast först. */
  familjer: { namn: string; ratt: number; antal: number }[];
  imorgon: string;
  datum: string | null;
}): OvningsResultatVM {
  const missar = inp.antal - inp.ratt;
  const over = inp.uppgifter.filter((u) => u.besvarad && u.tid_s > inp.budget_s).length;
  let mening: string | null = null;
  if (inp.niva_efter != null) {
    const efter = nivaKort(inp.niva_efter);
    if (inp.niva_fore == null || Math.abs(inp.niva_efter - inp.niva_fore) < 0.05) {
      mening = `Nivån står på ${efter}. Provet väger som en nivåkoll.`;
    } else if (inp.niva_efter > inp.niva_fore) {
      mening = `Nivån står på ${efter}, upp från ${nivaKort(inp.niva_fore)}. Provet väger som en nivåkoll.`;
    } else {
      mening = `Nivån står på ${efter}, ner från ${nivaKort(inp.niva_fore)}. ${
        inp.obesvarade > 0
          ? 'De obesvarade räknas som fel och provet väger som en nivåkoll. Tiden var det som fattades.'
          : 'Provet väger som en nivåkoll, och missarna låg på de svåraste uppgifterna sist i provet.'
      }`;
    }
  }
  const tappade = inp.familjer.filter((f) => f.ratt < f.antal).slice(0, 2);
  return {
    typ: 'logik',
    brand: RESULTAT.brand('logik'),
    datum: inp.datum,
    ratt: inp.ratt,
    antal: inp.antal,
    tid: { varde: RESULTAT.tid(inp.tid_s), etikett: RESULTAT.tidEtikett(inp.minuter) },
    andra: andraTalet('logik', inp.obesvarade),
    mening,
    genomgang: {
      titel: RESULTAT.genomgang.titel(missar),
      text: RESULTAT.genomgang.text(missar - inp.obesvarade, inp.obesvarade),
      antal: missar,
      knapp: RESULTAT.genomgang.knapp(missar),
    },
    tappade: tappade.length
      ? {
          titel: RESULTAT.tappade.titel(tappade.length),
          rader: tappade.map((t) => ({ namn: t.namn, meta: RESULTAT.tappade.meta(t.ratt, t.antal), andel: t.antal ? t.ratt / t.antal : 0 })),
        }
      : null,
    tempo: {
      titel: RESULTAT.tempo.titel(over, inp.uppgifter.length, PUNKT_ORD.logik.flera),
      text: RESULTAT.tempo.text(inp.budget_s, PUNKT_ORD.logik.en),
      staplar: staplarFor(
        inp.uppgifter.map((u) => ({ tid_s: u.tid_s, fel: !u.correct, obesvarad: !u.besvarad })),
        inp.budget_s
      ),
      axel: {
        start: RESULTAT.tempo.axelStart(PUNKT_ORD.logik.en),
        mitt: RESULTAT.tempo.axelMitt,
        slut: RESULTAT.tempo.axelSlut(PUNKT_ORD.logik.en, inp.uppgifter.length),
      },
      aria: RESULTAT.tempo.aria(inp.budget_s),
    },
    status: inp.imorgon,
  };
}
