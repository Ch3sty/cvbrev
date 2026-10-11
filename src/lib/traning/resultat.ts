// src/lib/traning/resultat.ts
// =============================================================================
// Resultatskärmarna i våg 3b som rena funktioner: vad P4, S1, M1, O1 och K1
// säger, ur motorns avslut, sessionen efter avslutet (genomgången) och
// läget (/api/traning/status). Komponenterna ritar bara det som står här,
// så att texterna och talen går att testa utan webbläsare.
//
// Talen kommer alltid ur motorn. Det enda som räknas här är presentation:
// vilken rubrik (upp, ner, står still), vilka frågor som gick över provets
// tid, vilken dag nästa ommätning är, och planens rader i M1.
// =============================================================================

import { familjInfo, familjNamn } from '@/lib/logicTestV7/familjer';
import { paketMedPris, paketNamn } from '@/lib/plans/plans';
import { TRANING_COPY, versal } from './copy';
import { dagarMellan, veckodagNamn, type Dag } from './datum';
import { MILSTOLPAR, type MilstolpeNyckel, type Nivapunkt } from './milstolpar';
import { datumKort, datumLista, deltaText, fragorText, nivaHeltal, nivaText, PASS_COPY, serieText } from './pass-copy';
import type { PlanDag } from './plan';
import { formatText, type Provformat } from './tempo';
import type { Avslut, Sessionsvy, Traningsstatus } from './klient';

const R = PASS_COPY.resultat;

/** Ett av resultatets tre tal. */
export interface Tal {
  varde: string;
  etikett: string;
  /** Koppar-ljus på väggen (nivåförflyttningen uppåt). */
  koppar?: boolean;
}

export interface Stapel {
  /** Höjd 0 till 1 av staplarnas yta. */
  hojd: number;
  over: boolean;
  fel: boolean;
  tid_s: number;
}

export interface Staplar {
  staplar: Stapel[];
  /** Var provets tid står, 0 till 1 uppifrån räknat som andel av höjden. */
  linje: number;
  budget_s: number;
}

export interface GenomgangsRad {
  /** Index i sessionens frågor. */
  index: number;
  titel: string;
  meta: string;
}

/* ------------------------------------------------------------- hjälpare */

function familjText(id: string | null | undefined): string | null {
  if (!id) return null;
  return familjNamn(id) ?? null;
}

/** Svaret per fråga i sessionens ordning: rätt, tid, och hur det slutade. */
export function svarIOrdning(vy: Sessionsvy): { q_id: string; correct: boolean; tid_s: number; vetInte: boolean; tidenUte: boolean }[] {
  const per = new Map(vy.besvarade.map((b) => [b.q_id, b]));
  return vy.fragor
    .filter((q) => per.has(q.id))
    .map((q) => {
      const b = per.get(q.id)!;
      const at = vy.aterkoppling?.[q.id];
      const g = vy.genomgang?.find((x) => x.id === q.id);
      const correct = at ? at.correct : g ? !b.vetInte && !b.tidenUte && b.valdVisat === g.rattVisat : false;
      return { q_id: q.id, correct, tid_s: b.tid_s, vetInte: b.vetInte, tidenUte: b.tidenUte };
    });
}

/** Staplarna: tid per fråga mot provets tid. Över tiden i koppar, fel tonade. */
export function byggStaplar(vy: Sessionsvy, budget_s: number): Staplar {
  const svar = svarIOrdning(vy);
  const max = Math.max(budget_s / 0.88, ...svar.map((s) => s.tid_s), 1);
  return {
    staplar: svar.map((s) => ({
      hojd: Math.max(0.06, Math.min(1, s.tid_s / max)),
      over: s.tid_s > budget_s,
      fel: !s.correct,
      tid_s: s.tid_s,
    })),
    linje: 1 - budget_s / max,
    budget_s,
  };
}

/** Rätt-raden i genomgången och raderna för missarna. */
export function byggGenomgang(vy: Sessionsvy): { rader: GenomgangsRad[]; ratt: number; missar: number[] } {
  const per = new Map(vy.besvarade.map((b) => [b.q_id, b]));
  const rader: GenomgangsRad[] = [];
  const missar: number[] = [];
  let ratt = 0;
  vy.fragor.forEach((q, i) => {
    const b = per.get(q.id);
    if (!b) return;
    const at = vy.aterkoppling?.[q.id];
    const g = vy.genomgang?.[i];
    const correct = at ? at.correct : g ? !b.vetInte && !b.tidenUte && b.valdVisat === g.rattVisat : false;
    if (correct) {
      ratt += 1;
      return;
    }
    missar.push(i);
    const nr = i + 1;
    const titel = b.vetInte ? R.genomgang.vetInte(nr) : b.tidenUte ? R.genomgang.tidenUte(nr) : R.genomgang.fel(nr);
    const forklaring = at?.misstag ?? g?.misstag ?? at?.regel ?? q.rule;
    rader.push({ index: i, titel, meta: `${forklaring} ${R.genomgang.sekunder(b.tid_s)}` });
  });
  return { rader, ratt, missar };
}

/** Nästa planerade dag av en typ efter i dag. */
export function nastaPlandag(plan: readonly PlanDag[], typ: PlanDag['typ'], idag: Dag): PlanDag | null {
  return plan.find((p) => p.typ === typ && p.dag > idag) ?? null;
}

/** "Fem dagar i rad. Söndag är vilodag. Måndag: samma familj, ett steg svårare." */
export function statusRad(avslut: Pick<Avslut, 'imorgon'>, status: Traningsstatus | null): string {
  const imorgon = /[.!?]$/.test(avslut.imorgon.text) ? avslut.imorgon.text : `${avslut.imorgon.text}.`;
  if (!status) return imorgon;
  return `${serieText(status.serie.dagar, status.serie.status)} ${imorgon}`;
}

/* ---------------------------------------------------------- P4, S1 */

export type Riktning = 'upp' | 'ner' | 'still' | 'ingen';

export interface PassResultat {
  typ: Avslut['typ'];
  sparat: string;
  eyebrow: string;
  rubrik: string;
  riktning: Riktning;
  skala: {
    nu: number;
    fran: number | null;
    sikte: number | null;
    etikettNu: string;
    etikettFran: string | null;
    aria: string;
  } | null;
  tal: [Tal, Tal, Tal];
  mening: string | null;
  kort: {
    eyebrow: string;
    titel: string;
    text: string;
    staplar: Staplar;
    axelMitt: string;
  };
  genomgang: { rader: GenomgangsRad[]; ratt: number; missar: number[] };
  status: string;
  primar: { etikett: string; handling: 'genomga' | 'tillbaka' };
  milstolpe: MilstolpeKort | null;
  antal: number;
}

export interface MilstolpeKort {
  nyckel: MilstolpeNyckel;
  namn: string;
  titel: string;
}

export function milstolpeKort(nyckel: MilstolpeNyckel | undefined | null): MilstolpeKort | null {
  if (!nyckel) return null;
  const namn = TRANING_COPY.milstolpar[nyckel];
  const titel: Record<MilstolpeNyckel, string> = {
    forsta_matningen: `${namn}: första punkten på kurvan`,
    forsta_veckan: `${namn}: sju dagar, inget missat`,
    nivan_upp: `${namn}: en hel nivå över mätningen`,
    generalrepetitionen: `${namn}: provets format, på provets tid`,
    provdagen: `${namn}: passerad`,
  };
  return { nyckel, namn, titel: titel[nyckel] };
}

function riktningFor(fore: number | null, efter: number | null): Riktning {
  if (fore == null || efter == null) return 'ingen';
  const d = Math.round((efter - fore) * 10) / 10;
  if (d > 0) return 'upp';
  if (d < 0) return 'ner';
  return 'still';
}

/** Resultatet efter ett pass, ett riktat pass eller en generalrepetition (P4, S1). */
export function passResultat(avslut: Avslut, vy: Sessionsvy, status: Traningsstatus | null): PassResultat {
  const riktat = avslut.typ === 'riktat';
  const riktning = riktat ? 'ingen' : riktningFor(avslut.niva_fore, avslut.niva_efter);
  const { ratt, antal } = avslut;
  const efter = avslut.niva_efter;
  const fore = avslut.niva_fore;

  let rubrik: string;
  if (riktning === 'upp') rubrik = R.rubrikUpp(ratt, antal, efter!);
  else if (riktning === 'ner') rubrik = R.rubrikNer(ratt, antal, efter!, efter! - fore!);
  else if (riktning === 'still') rubrik = R.rubrikStill(ratt, antal, efter!);
  else rubrik = R.rubrikUtanNiva(ratt, antal);

  const sikte = avslut.sikte ?? status?.plan?.sikte ?? null;
  const skala =
    !riktat && efter != null
      ? {
          nu: efter,
          fran: fore,
          sikte,
          etikettNu: `Nu ${nivaText(efter)}`,
          etikettFran: fore != null ? `från ${nivaText(fore)}` : null,
          aria: `Nivåskala 1 till 10.${fore != null ? ` Före passet ${nivaText(fore)},` : ''} nu ${nivaText(efter)}.${sikte != null ? ` Sikte ${nivaText(sikte)}.` : ''}`,
        }
      : null;

  const andra: Tal =
    !riktat && efter != null && fore != null
      ? riktning === 'ner'
        ? { varde: nivaText(efter), etikett: R.tal.nivaFran(fore) }
        : { varde: deltaText(efter - fore), etikett: R.tal.nivaFran(fore), koppar: riktning === 'upp' }
      : avslut.snitt_s != null
        ? { varde: R.tal.sekunder(avslut.snitt_s), etikett: R.tal.snitt(avslut.budget_s) }
        : { varde: R.tal.sekunder(Math.round(avslut.tid_s / Math.max(1, antal))), etikett: R.tal.snitt(avslut.budget_s) };

  const tal: [Tal, Tal, Tal] = [
    { varde: R.tal.av(ratt, antal), etikett: R.tal.ratt },
    andra,
    { varde: R.tal.av(avslut.over_tid, antal), etikett: R.tal.overTid },
  ];

  // Meningen under talen (s3).
  const idag = status?.idag ?? avslut.imorgon.dag;
  const ommatning = status ? nastaPlandag(status.plandagar, 'ommatning', idag) : null;
  const ommatningDag = ommatning ? veckodagNamn(ommatning.dag) : null;
  let mening: string | null;
  if (riktat) mening = R.riktatRad;
  else if (riktning === 'ner') mening = R.sjonk;
  else {
    const tema = vy.tema ?? null;
    const temaStat = avslut.familjer.passet.find((f) => f.family === tema) ?? [...avslut.familjer.passet].sort((a, b) => b.antal - a.antal)[0];
    const namn = familjText(temaStat?.family);
    const forsta = temaStat && namn && temaStat.antal >= 2 ? `${R.familjIdag(temaStat.ratt, temaStat.antal, namn)} ` : '';
    const andraMening = vy.variant === 'grund' ? R.grundpass : R.passFlyttar(ommatningDag);
    mening = avslut.typ === 'general' ? forsta.trim() || null : `${forsta}${andraMening}`;
  }

  const staplar = byggStaplar(vy, avslut.budget_s);
  const genomgang = byggGenomgang(vy);
  const overNr = staplar.staplar.map((s, i) => (s.over ? i + 1 : 0)).filter((n) => n > 0);

  // Kortet: tempot (P4), eller vad som hände när nivån sjönk (S1).
  let kort: PassResultat['kort'];
  if (riktning === 'ner' && genomgang.missar.length > 0) {
    const perFamilj = new Map<string, number>();
    for (const i of genomgang.missar) {
      const f = vy.genomgang?.[i]?.family ?? null;
      if (f) perFamilj.set(f, (perFamilj.get(f) ?? 0) + 1);
    }
    const [storst, iFamilj] = [...perFamilj.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
    const info = familjInfo(storst);
    kort = {
      eyebrow: R.vadHande.eyebrow,
      titel: R.vadHande.titel(genomgang.missar.length, iFamilj),
      text: info ? `${info.namn}: ${info.kort.charAt(0).toLowerCase()}${info.kort.slice(1)} Den går att öva bort med riktade pass.` : R.tempo.naraNivan,
      staplar,
      axelMitt: 'ljusa staplar: fel svar',
    };
  } else {
    const titel = overNr.length ? R.tempo.over(fragorText(overNr)) : R.tempo.inga;
    const delar = [avslut.snitt_s != null ? R.tempo.snitt(avslut.snitt_s, avslut.budget_s) : null, overNr.length ? R.tempo.gaIgenom : null];
    if (overNr.length !== avslut.over_tid) delar.push(R.tempo.naraNivan);
    kort = {
      eyebrow: R.tempo.eyebrow,
      titel,
      text: delar.filter(Boolean).join(' '),
      staplar,
      axelMitt: R.tempo.axelMitt,
    };
  }

  const eyebrow = riktat ? R.riktatKlart : avslut.typ === 'general' ? R.generalKlar : R.passKlart;
  const sparat = avslut.typ === 'riktat' ? R.sparat.riktat : avslut.typ === 'general' ? R.sparat.general : R.sparat.pass;

  return {
    typ: avslut.typ,
    sparat,
    eyebrow,
    rubrik,
    riktning,
    skala,
    tal,
    mening,
    kort,
    genomgang,
    status: statusRad(avslut, status),
    primar: genomgang.missar.length
      ? { etikett: PASS_COPY.knapp.genomga(genomgang.missar.length), handling: 'genomga' }
      : { etikett: PASS_COPY.knapp.tillbaka, handling: 'tillbaka' },
    milstolpe: milstolpeKort(avslut.milstolpe),
    antal,
  };
}

/* --------------------------------------------------------------- M1 */

export interface PlanRad {
  punkt: 'gjord' | 'kvar' | 'om' | 'prov' | 'general';
  titel: string;
  meta: string;
  chip: { text: string; ton?: boolean; las?: boolean } | null;
  last: boolean;
}

export interface MatningResultat {
  niva: number;
  heltal: number;
  mening: string;
  skala: { nu: number; sikte: number | null; aria: string };
  tal: [Tal, Tal, Tal];
  siktetMening: string | null;
  familjer: { titel: string; meta: string; andel: number | null; ton: 'koppar' | 'ton' | null }[];
  planRubrik: string;
  plan: PlanRad[];
  betalvagg: { eyebrow: string; rubrik: string; text: string; knapp: string; lank: string } | null;
  dagarKvar: number | null;
}

/** Planens rader i M1, ur motorns plandagar. Gratis: allt efter dag 0 låst (17.2). */
export function planRader(
  status: Traningsstatus,
  opt: { betalande: boolean; heltal: number; svagaste: string | null; format: Pick<Provformat, 'namn' | 'antal' | 'minuter' | 'budget_s' | 'cirka' | 'tidsform'> }
): PlanRad[] {
  const M = PASS_COPY.matning.plan;
  const idag = status.idag;
  const las = { text: paketNamn('all_month'), las: true };
  const rader: PlanRad[] = [{ punkt: 'gjord', titel: M.idag, meta: M.idagMeta, chip: { text: M.klart, ton: true }, last: false }];
  if (!opt.betalande) {
    rader.push({ punkt: 'kvar', titel: M.grundIdag, meta: M.grundIdagMeta, chip: { text: M.gratis, ton: true }, last: false });
  }
  const efter = status.plandagar.filter((p) => p.dag > idag);
  const forstaPass = efter.find((p) => p.typ === 'pass');
  if (forstaPass) {
    rader.push({
      punkt: 'kvar',
      titel: M.passNiva(datumKort(forstaPass.dag)),
      meta: M.passNivaMeta(opt.svagaste, opt.heltal),
      chip: opt.betalande ? null : las,
      last: !opt.betalande,
    });
  }
  const om = efter.filter((p) => p.typ === 'ommatning').map((p) => p.dag);
  if (om.length) {
    rader.push({ punkt: 'om', titel: M.ommatning(datumLista(om)), meta: M.ommatningMeta, chip: opt.betalande ? null : las, last: !opt.betalande });
  }
  const gen = efter.filter((p) => p.typ === 'general').map((p) => p.dag);
  if (gen.length) {
    const f = opt.format;
    const formatRad = f.namn ? `Samma format som ${f.namn}, ${formatText(f as Provformat)}.` : `Vårt provläge, ${formatText(f as Provformat)}.`;
    rader.push({ punkt: 'general', titel: M.general(datumLista(gen)), meta: M.generalMeta(formatRad), chip: opt.betalande ? null : las, last: !opt.betalande });
  }
  const prov = efter.find((p) => p.typ === 'prov');
  if (prov) rader.push({ punkt: 'prov', titel: M.prov(datumKort(prov.dag)), meta: M.provMeta, chip: null, last: false });
  return rader;
}

export function matningResultat(avslut: Avslut, status: Traningsstatus | null, betalande: boolean): MatningResultat {
  const niva = avslut.niva_efter ?? 0;
  const heltal = nivaHeltal(niva);
  const svagaste = avslut.familjer.svagaste;
  const mening = [PASS_COPY.matning.mening(heltal), svagaste.length ? PASS_COPY.matning.familjerFel(svagaste.length) : null]
    .filter(Boolean)
    .join(' ');
  const sikte = avslut.sikte ?? status?.plan?.sikte ?? null;
  const dagarKvar = status?.dagarKvar ?? null;

  const familjer: MatningResultat['familjer'] = svagaste.map((f, i) => ({
    titel: familjText(f.family) ?? f.family,
    meta: PASS_COPY.matning.familjMeta(f.ratt, f.antal),
    andel: f.andel,
    ton: i === 0 ? 'koppar' : 'ton',
  }));
  const l = avslut.familjer.langsamma[0];
  if (l) {
    familjer.push({
      titel: PASS_COPY.matning.langsam(familjText(l.family) ?? l.family),
      meta: PASS_COPY.matning.langsamMeta(l.ratt_men_langsamma, l.antal),
      andel: null,
      ton: null,
    });
  }

  const format = status?.format ?? { namn: null, antal: 18, minuter: 25, budget_s: avslut.budget_s, cirka: false, tidsform: 'total' as const };
  const plan = status
    ? planRader(status, { betalande, heltal, svagaste: familjText(svagaste[0]?.family) ?? null, format })
    : [{ punkt: 'gjord' as const, titel: PASS_COPY.matning.plan.idag, meta: PASS_COPY.matning.plan.idagMeta, chip: { text: PASS_COPY.matning.plan.klart, ton: true }, last: false }];

  return {
    niva,
    heltal,
    mening,
    skala: { nu: niva, sikte, aria: PASS_COPY.matning.skalaAria(niva, sikte) },
    tal: [
      { varde: PASS_COPY.matning.ratt(avslut.ratt, avslut.antal), etikett: R.tal.ratt },
      { varde: R.tal.av(avslut.over_tid, avslut.antal), etikett: R.tal.overTid },
      avslut.snitt_s != null
        ? { varde: R.tal.sekunder(avslut.snitt_s), etikett: R.tal.snitt(avslut.budget_s) }
        : { varde: R.tal.sekunder(Math.round(avslut.tid_s / Math.max(1, avslut.antal))), etikett: R.tal.snitt(avslut.budget_s) },
    ],
    siktetMening: sikte != null ? PASS_COPY.matning.siktetMening(dagarKvar) : null,
    familjer,
    planRubrik: PASS_COPY.matning.plan.rubrik(status?.plan?.provdatum ?? null, dagarKvar),
    plan,
    betalvagg: betalande
      ? null
      : {
          eyebrow: paketNamn('all_month'),
          rubrik: PASS_COPY.matning.betalvagg.rubrik(dagarKvar),
          text: PASS_COPY.matning.betalvagg.text,
          knapp: `Köp ${paketMedPris('all_month')}`,
          lank: PASS_COPY.matning.betalvagg.grundpassLank,
        },
    dagarKvar,
  };
}

/* --------------------------------------------------------------- O1 */

export interface OmmatningResultat {
  niva: number;
  rubrik: string;
  skala: { nu: number; fran: number | null; sikte: number | null; franEtikett: string | null; aria: string };
  tal: [Tal, Tal, Tal];
  forsta: Nivapunkt | null;
  status: string;
  milstolpe: MilstolpeKort | null;
}

export function forstaMatningPunkt(punkter: readonly Nivapunkt[]): Nivapunkt | null {
  return [...punkter].filter((p) => p.typ === 'matning').sort((a, b) => (a.dag < b.dag ? -1 : 1))[0] ?? null;
}

export function ommatningResultat(avslut: Avslut, status: Traningsstatus | null): OmmatningResultat {
  const niva = avslut.niva_efter ?? avslut.niva_fore ?? 0;
  const forsta = status ? forstaMatningPunkt(status.punkter) : null;
  const sikte = avslut.sikte ?? status?.plan?.sikte ?? null;
  const idag = status?.idag ?? avslut.imorgon.dag;
  const deltaFran = forsta?.niva ?? avslut.niva_fore;
  const dagar = forsta ? dagarMellan(forsta.dag, idag) : null;

  const nasta = status ? nastaPlandag(status.plandagar, 'ommatning', idag) : null;
  const imorgon = /[.!?]$/.test(avslut.imorgon.text) ? avslut.imorgon.text : `${avslut.imorgon.text}.`;
  const statusText = nasta ? `${PASS_COPY.ommatning.nastaOmmatning(nasta.dag)} ${imorgon}` : statusRad(avslut, status);

  return {
    niva,
    rubrik: PASS_COPY.ommatning.rubrik(niva, avslut.niva_fore),
    skala: {
      nu: niva,
      fran: forsta?.niva ?? null,
      sikte,
      franEtikett: forsta ? PASS_COPY.ommatning.franEtikett(forsta.dag, forsta.niva) : null,
      aria: PASS_COPY.ommatning.skalaAria(forsta, niva, sikte),
    },
    tal: [
      { varde: R.tal.av(avslut.ratt, avslut.antal), etikett: R.tal.ratt },
      deltaFran != null
        ? {
            varde: deltaText(niva - deltaFran),
            etikett: dagar === 7 ? PASS_COPY.ommatning.deltaVecka : PASS_COPY.ommatning.delta,
            koppar: niva - deltaFran > 0.05,
          }
        : { varde: nivaText(niva), etikett: 'nivå' },
      { varde: R.tal.av(avslut.over_tid, avslut.antal), etikett: R.tal.overTid },
    ],
    forsta,
    status: statusText,
    milstolpe: milstolpeKort(avslut.milstolpe),
  };
}

/* --------------------------------------------------------------- K1 */

export interface Kvitto {
  nyckel: MilstolpeNyckel;
  namn: string;
  eyebrow: string;
  mening: string;
}

/** Nivån en viss dag: senaste punkten den dagen eller före. */
function nivaVid(punkter: readonly Nivapunkt[], dag: Dag): number | null {
  const fore = [...punkter].filter((p) => p.dag <= dag).sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));
  return fore.length ? fore[fore.length - 1].niva : null;
}

/** Kvittot K1 för ett märke, ur läget. */
export function kvitto(nyckel: MilstolpeNyckel, status: Traningsstatus, opt: { betalande: boolean }): Kvitto {
  const K = PASS_COPY.kvitto;
  const m = status.milstolpar.find((x) => x.nyckel === nyckel);
  const naddDag = m ? m.nadd_at.slice(0, 10) : status.idag;
  const forsta = forstaMatningPunkt(status.punkter);
  const nu = status.niva;
  const namn = TRANING_COPY.milstolpar[nyckel];
  const delar: string[] = [];

  if (nyckel === 'forsta_matningen') {
    delar.push(K.forsta_matningen(forsta?.niva ?? nu ?? 0));
  } else if (nyckel === 'forsta_veckan') {
    const v = status.forstaVeckan;
    if (v) {
      delar.push(
        `${opt.betalande || v.ommatningar > 0 ? TRANING_COPY.forstaVeckan.betalande(v.pass, v.ommatningar) : TRANING_COPY.forstaVeckan.gratis(v.pass)}.`
      );
    }
    const till = nivaVid(status.punkter, naddDag) ?? nu;
    if (forsta && till != null && Math.abs(till - forsta.niva) >= 0.05) delar.push(K.nivaGick(forsta.niva, till));
  } else if (nyckel === 'nivan_upp') {
    const mal = forsta ? Math.floor(forsta.niva + 1e-9) + 1 : null;
    const nadd = forsta && mal != null ? status.punkter.find((p) => p.dag >= forsta.dag && p.niva >= mal - 1e-9) : null;
    delar.push(K.nivan_upp(forsta?.niva ?? 0, nadd?.niva ?? nu ?? 0));
  } else if (nyckel === 'generalrepetitionen') {
    delar.push(K.generalrepetitionen);
  } else {
    delar.push(K.provdagen);
  }

  // Nästa märke, i ordning, om det finns ett.
  const har = new Set(status.milstolpar.map((x) => x.nyckel));
  const nasta = MILSTOLPAR.find((k) => k !== nyckel && !har.has(k) && k !== 'provdagen');
  if (nasta) {
    const vid = nasta === 'nivan_upp' && forsta ? Math.floor(forsta.niva + 1e-9) + 1 : null;
    delar.push(K.nastaMarke(TRANING_COPY.milstolpar[nasta], vid));
  }

  return { nyckel, namn, eyebrow: K.eyebrow(naddDag), mening: delar.join(' ') };
}

/** "Tisdag" ur en dag, för raderna som byter "I morgon" mot veckodagen. */
export function veckodagVersal(dag: Dag): string {
  return versal(veckodagNamn(dag));
}
