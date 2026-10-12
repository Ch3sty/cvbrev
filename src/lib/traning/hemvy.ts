// src/lib/traning/hemvy.ts
// =============================================================================
// Hemvyn i Rekryteringstester som ren data (våg 2). Tar motorns
// Traningsstatus plus raderna om fler tester och Jobbsöket och räknar fram
// vilket tillstånd vyn står i och allt som står på väggen och golvet.
// Komponenten (src/components/traning/Hemvy.tsx) ritar bara modellen, så
// servern, förhandsvisningen och testerna går genom samma regler.
//
// Tillstånden och konceptets ramar:
//   tomt          T1   inga mätningar, inget datum
//   ny            1a   datum satt, ingen mätning: planen är bilden
//   mitt_i        1b   mätning gjord, dagens pass kvar (1i utan leverantör, 1f gratis)
//   efter_pass    1g   dagens pass gjort
//   utan_datum    1h   mätning gjord, inget datum
//   infor         1c   en eller två dagar till provet
//   provdag       1d   provdagen: inget räknar, inget blinkar
//   efter         1e   dagen efter provet, frågan "Hur gick det?" (servern avgör)
//   personlighet  1p   bara personlighetstestet valt
//   annat_test    1t   bara siffror eller text valt: det valda testet lyfts (19.3)
//   fel           X1   statusen gick inte att läsa
//
// Regler som gäller alla: inga streck, aldrig "0" eller "0 %", ingen tom
// graf. Exakt en primär handling (det lyfta kortet), väggen bär aldrig
// kopparknappen. Gratisnivån enligt ägarens beslut 17.2: grundpasset bara
// mätningens dag, därefter lås med "Ingår i Premium" och köpknappen med
// prisraden (copy-premium-2026-10-11).
// =============================================================================

import { dagarMellan, laggTill, arSondag, veckodag, type Dag } from './datum';
import { GRATISNIVA } from './gratisniva';
import { talord as talordTio, TRANING_COPY, versal } from './copy';
import { nivaKort } from './pass-copy';
import { HEM, ingarIPaketet, kopKnapp, jobbsokRad, lastAria, prisrad } from './hem-copy';
import { paketKort } from '@/lib/plans/plans';
import type { BetalvaggPlats } from '@/lib/analytics/events';
import { byggPlan, type PlanDag } from './plan';
import { TRANING_RUTT } from './rutter';
import {
  RUM_RUBRIK,
  baraPersonlighet,
  datumText,
  kognitivaTyper,
  kontextText,
  kortDatum,
  manadNamn,
  provrad,
  rubrikEfterProv,
  rubrikForeProv,
  rubrikPersonlighet,
  type RubrikIn,
} from './rubrik';
import type { Traningsstatus } from './motor.server';
import type { Nivapunkt } from './milstolpar';
import { familjNamn } from '@/lib/logicTestV7/familjer';

export type HemTillstand =
  | 'tomt'
  | 'ny'
  | 'mitt_i'
  | 'efter_pass'
  | 'utan_datum'
  | 'infor'
  | 'provdag'
  | 'efter'
  | 'personlighet'
  | 'annat_test'
  | 'fel';

/** Värdet för traning_hem_visad (spec avsnitt 7). */
export type HemMatning = 'ny' | 'tomt' | 'utan_datum' | 'mitt_i' | 'infor' | 'provdag' | 'efter' | 'personlighet' | 'annat_test' | 'fel';

export function matningsvarde(t: HemTillstand): HemMatning {
  return t === 'efter_pass' ? 'mitt_i' : t;
}

export type Betalvagg = 'tests_above_base' | 'test_exam_mode';

export type Handling =
  | { typ: 'lank'; text: string; href: string }
  /**
   * Köpknappen i det lyfta kortet (1f, W3): en betalvägg med egen knapp.
   * plats och dagarKvar går till betalvagg_visad och köpsteget.
   */
  | { typ: 'kop'; text: string; feature: Betalvagg; plats: BetalvaggPlats; prisrad: string; dagarKvar: number | null }
  | { typ: 'forsok'; text: string };

export type Hoger =
  | { typ: 'lank'; text: string; href: string }
  | { typ: 'las'; text: string; feature: Betalvagg; plats: BetalvaggPlats }
  /** Gjort i dag: en bock i koppar och ordet för skärmläsaren. */
  | { typ: 'bock'; text: string }
  | { typ: 'chev' };

export type Symbol = 'matris' | 'siffror' | 'ord' | 'figurer' | 'person' | 'jobb' | 'brev';

export interface RadModell {
  titel: string;
  meta?: string;
  symbol?: Symbol;
  /** Symbolen i ink-3 (ej gjort). */
  svag?: boolean;
  stapel?: { andel: number; ton: 'ton' | 'koppar' };
  hoger?: Hoger;
  /** Hela raden är en länk (chevron-rader). */
  href?: string;
  /** Tillgängligt namn när raden är låst. */
  label?: string;
}

export type Sektion =
  /** Tempokortet: ett tal (copy-plan 3.2). */
  | { typ: 'tempo'; tal: Tal; meta?: string; eyebrow?: string }
  | {
      typ: 'rader';
      nyckel: string;
      rubrik?: string;
      lank?: { text: string; href: string };
      /** Länken bara under lg: kontextlänken i toppraden på dator (tillägget 2026-10-11 punkt 1). */
      lankBaraMobil?: boolean;
      rader: RadModell[];
    }
  | { typ: 'status'; nyckel: string; text: string; ton: 'neutral' | 'koppar'; lank?: { text: string; href: string } };

export interface Tal {
  varde: string;
  etikett: string;
  /** Under lg, när etiketten skiljer sig (dagsradens formord, tillägget punkt 4). */
  etikettMobil?: string;
  koppar?: boolean;
}

export interface LyftModell {
  label: string;
  eyebrow: string;
  eyebrowTon: 'koppar' | 'neutral';
  titel: string;
  text?: string;
  /** Kortets huvudtal (copy-plan 3.3): "7 av 9 rätt". */
  tal?: Tal;
  handling?: Handling;
  sekundar?: { text: string; href: string };
  /** Meta under en linje i kortet (1f, och 1a:s "Mätningen är gratis", 22.2). */
  fot?: string;
  alert?: boolean;
}

export interface KurvaData {
  punkter: Nivapunkt[];
  plan: PlanDag[];
  idag: Dag;
  start: Dag;
  prov: Dag | null;
  sikte: number | null;
  nyPunkt: boolean;
  ariaLabel: string;
  /** Visa prov som passerat (1e). */
  provPasserat?: boolean;
}

export interface PlanbildData {
  plan: PlanDag[];
  idag: Dag;
  prov: Dag;
  /** Mätningen är gjord (1b med en punkt): ingen "Mät min nivå" vid i dag. */
  matt?: boolean;
  ariaLabel: string;
}

export interface SkalaData {
  nu: number;
  fran: number | null;
  sikte: number | null;
  etikettNu: string;
  etikettFran: string | null;
  aria: string;
}

export interface VaggModell {
  rubrik: string;
  rubrikLiten?: boolean;
  rad: string;
  /** "Sätt ett datum så räknar vi bakåt" (1h), glas på väggen. */
  datumBox?: { text: string; lank: { text: string; href: string } };
  /** Tomt tillstånd (T1): planens symbol och meningen. */
  tomtBox?: { titel: string; text: string };
  dagsrad?: { ring: 'kvar' | 'gjord' | 'general'; ringLabel: string; tal: Tal };
  vecka?: { status: ('gjord' | 'nu' | 'vila' | 'tom' | 'kvar' | 'om')[]; label: string };
  kurvaRubrik?: { text: string; form?: string; lank?: { text: string; href: string } };
  kurva?: KurvaData;
  planbild?: PlanbildData;
  kurvaMeta?: string;
  /** Provdagen (1d): datumet stort. */
  provdag?: { eyebrow: string; dag: string; manadRest: string; text: string; skala: SkalaData | null };
  /** Efter provet (1e): de tre svaren som glasknappar. */
  efterKnappar?: boolean;
}

export interface HemModell {
  tillstand: HemTillstand;
  /** Konceptets ram, för förhandsvisningen och skärmdumparna. */
  ram: string;
  kontext: { text: string; href: string } | null;
  vagg: VaggModell;
  lyft: LyftModell;
  sektioner: Sektion[];
  /** "Ta bort svaret" efter provet (frivilligt och raderbart). */
  taBortSvar?: boolean;
  /** Rörelse: bara när en ny punkt kommit sedan sist. */
  nyPunkt: boolean;
}

export interface FlerTesterIn {
  /** Senaste slutförda verbala test (ISO), null om aldrig. */
  verbalSenast: string | null;
  numeriskSenast: string | null;
  /** Personlighetsprofilens datum (ISO), null om ingen. */
  personlighetKlar: string | null;
}

export interface JobbsokIn {
  tjanster: number;
  intervjuer: number;
  brev: number;
}

export interface HemIn {
  status: Traningsstatus | null;
  idag: Dag;
  flerTester: FlerTesterIn;
  jobbsok: JobbsokIn;
}

/* ------------------------------------------------------------ hjälp */

/** "5,4" */
export function decimal(n: number): string {
  return (Math.round(n * 10) / 10).toFixed(1).replace('.', ',');
}

/** Köpknappen i det lyfta kortet, med prisraden och mätningens plats. */
function kop(s: Traningsstatus, feature: Betalvagg, plats: BetalvaggPlats): Handling {
  return { typ: 'kop', text: kopKnapp(), feature, plats, prisrad: prisrad(), dagarKvar: s.dagarKvar ?? null };
}

function heltal(n: number): number {
  return Math.floor(n + 1e-9);
}

function dagIso(iso: string | null): Dag | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(iso));
}

function namnFamilj(id: string | null | undefined): string | null {
  return familjNamn(id) ?? null;
}

const TALORD_UPP = ['elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo'];

/** Tal som ord upp till tjugo ("elva pass"), annars siffror. */
function talord(n: number, ett: 'en' | 'ett' = 'ett'): string {
  return n >= 11 && n <= 20 ? TALORD_UPP[n - 11] : talordTio(n, ett);
}

/** "elva pass", "ett pass" */
function antalOrd(n: number, ett: 'en' | 'ett', singular: string, plural: string): string {
  return `${talord(n, ett)} ${n === 1 ? singular : plural}`;
}

function rubrikIn(s: Traningsstatus): RubrikIn {
  return { leverantorNamn: s.format.namn, testtyper: s.plan?.testtyper ?? [] };
}

/** Veckoraden måndag till söndag för veckan som innehåller i dag. */
export function veckorad(plan: readonly PlanDag[], idag: Dag): ('gjord' | 'nu' | 'vila' | 'tom' | 'kvar' | 'om')[] {
  const vd = veckodag(idag); // 0 = söndag
  const mandag = laggTill(idag, -((vd + 6) % 7));
  const perDag = new Map(plan.map((p) => [p.dag, p]));
  return Array.from({ length: 7 }, (_, i) => {
    const dag = laggTill(mandag, i);
    const p = perDag.get(dag);
    if (!p) return 'tom';
    if (p.typ === 'vila') return 'vila';
    if (p.typ === 'prov') return 'tom';
    if (p.status === 'gjord') return 'gjord';
    if (p.status === 'idag') return 'nu';
    if (p.typ === 'ommatning' && dag > idag) return 'om';
    if (dag === idag) return 'nu';
    return 'kvar';
  });
}

function veckoLabel(status: readonly string[]): string {
  const namn = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'];
  const ord: Record<string, string> = { gjord: 'gjort', nu: 'i dag, kvar', vila: 'vilodag', tom: 'ingen plan', kvar: 'planerat', om: 'ny nivåkoll' };
  return `Veckan: ${status.map((s, i) => `${namn[i]} ${ord[s]}`).join(', ')}.`;
}

/** Kurvans tillgängliga namn: läser ut talen, datumen, målet och provet. */
export function kurvansLabel(k: Omit<KurvaData, 'ariaLabel'>, passKvar: boolean): string {
  const delar: string[] = [];
  const pk = [...k.punkter].sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));
  if (pk.length) {
    delar.push(`Nivå per dag från starten ${datumText(k.start)}: ${pk.map((p) => nivaKort(p.niva)).join(', ')}.`);
  }
  delar.push(`I dag ${datumText(k.idag)}${passKvar ? ', passet kvar' : ''}.`);
  if (k.sikte != null && k.prov) delar.push(`Mål ${nivaKort(k.sikte)}.`);
  const om = k.plan.filter((p) => p.typ === 'ommatning' && p.dag > k.idag).map((p) => datumText(p.dag));
  if (om.length) delar.push(`${om.length === 1 ? 'Ny nivåkoll' : 'Nya nivåkoller'} ${om.join(' och ')}.`);
  const vila = k.plan.filter((p) => p.typ === 'vila').map((p) => datumText(p.dag));
  if (vila.length) delar.push(`${vila.length === 1 ? 'Vilodag' : 'Vilodagar'} ${vila.join(' och ')}.`);
  const last = k.plan.filter((p) => p.status === 'last');
  if (last.length) delar.push(`${last.length} planerade dagar ingår i ${paketKort()}.`);
  if (k.prov) delar.push(`Prov ${datumText(k.prov)}${k.provPasserat ? ', passerat' : ''}.`);
  return delar.join(' ');
}

/* ------------------------------------------------------------ sektioner */

function flerTester(inp: FlerTesterIn, testtyper: readonly string[], medFigurer: boolean): Sektion {
  const verbal = dagIso(inp.verbalSenast);
  const numerisk = dagIso(inp.numeriskSenast);
  const pers = dagIso(inp.personlighetKlar);
  const rader: (RadModell & { _typ: string })[] = [
    {
      _typ: 'verbal',
      titel: HEM.flerTester.ord,
      meta: verbal ? HEM.flerTester.gjort(kortDatum(verbal)) : HEM.flerTester.ordEj,
      symbol: 'ord',
      svag: !verbal,
      hoger: { typ: 'chev' },
      href: TRANING_RUTT.text,
    },
    {
      _typ: 'numerisk',
      titel: HEM.flerTester.siffror,
      meta: numerisk ? HEM.flerTester.gjort(kortDatum(numerisk)) : HEM.flerTester.siffrorEj,
      symbol: 'siffror',
      svag: !numerisk,
      hoger: { typ: 'chev' },
      href: TRANING_RUTT.siffror,
    },
    {
      _typ: 'personlighet',
      titel: HEM.flerTester.personlighet,
      meta: pers ? HEM.flerTester.personlighetKlar(kortDatum(pers)) : HEM.flerTester.personlighetEj,
      symbol: 'person',
      svag: !pers,
      hoger: { typ: 'chev' },
      href: TRANING_RUTT.personlighet,
    },
  ];
  if (medFigurer) {
    rader.unshift({
      _typ: 'matris',
      titel: HEM.flerTester.figurer,
      meta: HEM.flerTester.figurerEj,
      symbol: 'matris',
      svag: true,
      hoger: { typ: 'chev' },
      href: TRANING_RUTT.matning,
    });
  }
  // Valda typer först, de gjorda före de ogjorda.
  const vald = (t: string) => (testtyper.includes(t) ? 0 : 1);
  rader.sort((a, b) => vald(a._typ) - vald(b._typ));
  return {
    typ: 'rader',
    nyckel: 'fler',
    rubrik: HEM.flerTester.rubrik,
    lank: { text: HEM.flerTester.alla, href: TRANING_RUTT.alla },
    rader: rader.map(({ _typ: _, ...r }) => r),
  };
}

/**
 * Textpasset och sifferpasset under dagens pass (beställning omgång 2, B2):
 * en rad per vald testtyp, bock när passet är gjort i dag, låst med
 * "Ingår i Premium" för gratis. Null när planen inte har verbalt eller
 * numeriskt.
 */
/** Ska figurpassraden stå? (beställning omgång 3, A3) */
export function visaFigurpass(s: Pick<Traningsstatus, 'figurserieGjord' | 'plan'>, testtyper: readonly string[]): boolean {
  const lev = s.plan?.leverantor ?? null;
  return testtyper.includes('figurserie') || !!s.figurserieGjord || lev === 'aon' || lev === 'shl';
}

export function vnPassSektion(s: Traningsstatus, testtyper: readonly string[]): Sektion | null {
  const betalande = s.behorighet?.harOvanGrund ?? false;
  const V = HEM.vnPass;
  const rader: RadModell[] = [];
  for (const kind of ['verbal', 'numerisk'] as const) {
    if (!testtyper.includes(kind)) continue;
    const gjord = s.vnPassIdag?.[kind] ?? false;
    const titel = kind === 'verbal' ? V.textpass : V.sifferpass;
    const meta = gjord ? V.gjortMeta : kind === 'verbal' ? V.textMeta : V.sifferMeta;
    rader.push({
      titel,
      meta,
      symbol: kind === 'verbal' ? 'ord' : 'siffror',
      svag: !gjord,
      hoger: gjord
        ? { typ: 'bock', text: V.gjort }
        : betalande
          ? { typ: 'lank', text: V.starta, href: kind === 'verbal' ? TRANING_RUTT.textpass : TRANING_RUTT.sifferpass }
          : { typ: 'las', text: V.last, feature: 'tests_above_base', plats: 'dag2' },
      label: betalande ? undefined : `${titel}. ${meta} ${V.last}. ${lastAria()}`,
    });
  }
  // Figurpasset (beställning omgång 3, A3): när planen har figurserier, när
  // hon gjort ett klassiskt figurserietest, eller när planens leverantör har
  // figurserier i sitt test (Aon scales ix, SHL Verify G+). Nivån som ord,
  // aldrig tal: på avancerad står "Expertnivån: gör nivåtestet" i metan.
  if (visaFigurpass(s, testtyper)) {
    const gjord = s.vnPassIdag?.figurserie ?? false;
    const meta = gjord ? V.gjortMeta : s.figurNiva === 'avancerad' ? V.expertRad : V.figurMeta;
    rader.push({
      titel: V.figurpass,
      meta,
      symbol: 'figurer',
      svag: !gjord,
      hoger: gjord
        ? { typ: 'bock', text: V.gjort }
        : betalande
          ? { typ: 'lank', text: V.starta, href: TRANING_RUTT.figurpass }
          : { typ: 'las', text: V.last, feature: 'tests_above_base', plats: 'dag2' },
      label: betalande ? undefined : `${V.figurpass}. ${meta} ${V.last}. ${lastAria()}`,
    });
  }
  return rader.length ? { typ: 'rader', nyckel: 'vnpass', rubrik: V.rubrik, rader } : null;
}

/**
 * Jobbsöket som en rad (beslut-hemvy 2026-10-11 punkt 2): rummets namn och
 * högst ett tal i metan, hela raden länk. Breven räknas aldrig på testväggen.
 */
function jobbsokStatus(j: JobbsokIn): Sektion {
  return {
    typ: 'rader',
    nyckel: 'jobbsok',
    rader: [
      {
        titel: HEM.jobbsok.titel,
        meta: jobbsokRad(j),
        symbol: 'jobb',
        hoger: { typ: 'chev' },
        href: TRANING_RUTT.jobbsok,
      },
    ],
  };
}

function varDuTappar(s: Traningsstatus, betalande: boolean, iMatningen: boolean): Sektion | null {
  const svaga = s.varDuTappar.svagaste;
  const langsam = s.varDuTappar.langsamma[0];
  if (svaga.length === 0 && !langsam) return null;
  const riktatHoger = (family: string): Hoger =>
    betalande || GRATISNIVA.riktadePassGratis
      ? { typ: 'lank', text: HEM.tappar.riktat, href: TRANING_RUTT.riktat(family) }
      : { typ: 'las', text: HEM.tappar.riktat, feature: 'tests_above_base', plats: 'riktat' };
  // Ingen stapel på noll (avvikelse 3): metan säger det i ord.
  const rader: RadModell[] = svaga.map((f, i) => {
    const meta = iMatningen ? HEM.tappar.rattAvMatning(f.ratt, f.antal) : HEM.tappar.rattAv(f.ratt, f.antal);
    return {
      titel: namnFamilj(f.family) ?? f.family,
      meta,
      stapel: f.ratt > 0 ? { andel: f.andel, ton: i === 0 ? 'koppar' : 'ton' } : undefined,
      hoger: riktatHoger(f.family),
      label: betalande ? undefined : `${namnFamilj(f.family) ?? f.family}. ${meta} ${HEM.tappar.riktat}. ${lastAria()}`,
    };
  });
  if (langsam && betalande) {
    const namn = namnFamilj(langsam.family) ?? langsam.family;
    rader.push({
      titel: HEM.tappar.langsam(namn),
      meta: HEM.tappar.langsamMeta(langsam.ratt_men_langsamma, langsam.antal),
      hoger: { typ: 'lank', text: HEM.tappar.tempopass, href: TRANING_RUTT.riktat(langsam.family) },
    });
  }
  return {
    typ: 'rader',
    nyckel: 'tappar',
    rubrik: HEM.tappar.rubrik,
    lank: betalande ? { text: HEM.tappar.allaFamiljer, href: TRANING_RUTT.kurvan } : undefined,
    rader,
  };
}

function provdagenSektion(s: Traningsstatus, harProvlage: boolean): Sektion {
  const r = provrad(s.format);
  const prov = s.plan?.provdatum ?? null;
  // Raden heter Övningsprovet och bär bara format och datum (copy-plan 3.5):
  // antal och tid står i 1c-kortet, anmärkningen (SHL, Aon) i 1c-kortets text.
  // Utan leverantör: "Vårt eget format, 18 uppgifter på 25 minuter. Vet du vem
  // som gör testet, så byter vi format." Högst två meningar (avvikelse 4).
  let meta = r.utanLeverantor ? `${r.titel}, ${r.format.charAt(0).toLowerCase()}${r.format.slice(1)}` : `${r.titel}.`;
  if (r.utanLeverantor) {
    // metan är komplett
  } else if (prov) {
    // Samma mening för gratis och betalande: om raden är öppen eller låst
    // säger högersidan, aldrig metan (22.4 fråga 2).
    // Kort form: metan är en rad-meta (copy-premium 9.2, regeln vid kortDatum).
    meta += ` ${HEM.provdagen.iPlanen(kortDatum(laggTill(prov, -2)))}`;
  } else {
    meta += ` ${HEM.utanDatum.provradMeta}`;
  }
  let hoger: Hoger;
  if (r.utanLeverantor) hoger = { typ: 'lank', text: HEM.provdagen.angeLeverantor, href: TRANING_RUTT.installningarSteg(2) };
  else if (!prov) hoger = { typ: 'lank', text: HEM.utanDatum.sattDatum, href: TRANING_RUTT.installningarSteg(3) };
  else if (harProvlage || GRATISNIVA.provlageGratis) hoger = { typ: 'lank', text: HEM.provdagen.gorEnNu, href: TRANING_RUTT.general };
  else hoger = { typ: 'las', text: ingarIPaketet(), feature: 'test_exam_mode', plats: 'generalrepetition' };
  return {
    typ: 'rader',
    nyckel: 'provdagen',
    rubrik: HEM.provdagen.rubrik,
    // På mobil lämnar kontexten ("Alva Logic, 25 okt") toppraden och blir den här länken.
    lank: prov ? { text: HEM.provdagen.andraDatum, href: TRANING_RUTT.installningarSteg(3) } : undefined,
    lankBaraMobil: prov ? true : undefined,
    rader: [
      {
        titel: HEM.provdagen.radTitel,
        meta,
        hoger,
        label: hoger.typ === 'las' ? `${HEM.provdagen.radTitel}. ${meta} ${lastAria()}` : undefined,
      },
    ],
  };
}

function tempoSektion(s: Traningsstatus): Sektion | null {
  const p = s.senastePass;
  if (!p || p.typ === 'general' || p.ratt == null) return null;
  // Samma tal som P4 (19.2 fråga 7): alla besvarade frågor över provets tid.
  // Äldre sessioner utan over_budget faller tillbaka på motorns över tiden.
  const over = p.over_budget ?? p.over_tid;
  if (over == null) return null;
  const eget = !s.format.namn;
  const igar = p.dag === laggTill(s.idag, -1);
  const idag = p.dag === s.idag;
  // Ett tal (copy-plan 3.2): snittet och passen står i Din utveckling.
  return {
    typ: 'tempo',
    eyebrow: 'Tempo',
    tal: { varde: `${over} av ${p.antal}`, etikett: idag ? HEM.tempo.overIdag : igar ? HEM.tempo.over : `över provets tid ${kortDatum(p.dag)}` },
    meta: eget ? HEM.tempo.metaEget : undefined,
  };
}

/* ------------------------------------------------------------ väggen */

/**
 * Dagsradens enda tal (beslut-hemvy 2026-10-11 punkt 2): nivån, med en
 * etikett som säger varifrån. Serien står i raden under rubriken, dagarna
 * till provet i rubriken och målet i kurvan, så inget tal står två gånger.
 */
function dagsradTal(s: Traningsstatus, niva: number): Tal {
  const start = s.start;
  const forandring = start ? Math.round((niva - start.niva) * 10) / 10 : 0;
  // "mätt i dag" och "mätt i går" bara utan förändring, annars varifrån (copy-plan 3.1).
  let etikett: string;
  if (start && forandring !== 0) etikett = HEM.dagsrad.nivaFran(nivaKort(start.niva));
  else if (!start || start.dag === s.idag) etikett = HEM.dagsrad.nivaMattIdag;
  else if (start.dag === laggTill(s.idag, -1)) etikett = HEM.dagsrad.nivaMattIgar;
  else etikett = HEM.dagsrad.nivaFran(nivaKort(start.niva));
  // Från tre punkter bär etiketten formen på mobil; formraden under kurvans rubrik står bara på dator.
  const etikettMobil = s.form && s.punkter.length >= 3 ? HEM.kurva.form[s.form.form] ?? undefined : undefined;
  return etikettMobil ? { varde: nivaKort(niva), etikett, etikettMobil } : { varde: nivaKort(niva), etikett };
}

/** Raden under rubriken. Nivån står i dagsraden, så raden säger den inte (punkt 2). */
function radText(s: Traningsstatus, dagLage: 'pass' | 'vila' | 'ommatning'): string {
  const delar: string[] = [];
  if (s.serie.dagar >= 2) delar.push(HEM.rad.serie(versal(talord(s.serie.dagar))));
  else if (s.serie.status === 'bruten' && s.aktivitet.pass > 0) delar.push(HEM.rad.serieBorjarOm);
  if (dagLage === 'vila') delar.push(HEM.rad.vila);
  else if (dagLage === 'ommatning') delar.push(HEM.rad.ommatning);
  else delar.push(s.dagensPassGjort ? HEM.rad.passGjort : HEM.rad.passKvar);
  return delar.join(' ');
}

/**
 * Kurvan tänds vid två punkter (beslut-hemvy 2026-10-11, avvikelse 2): med en
 * enda punkt är den ett rutnät med en prick. Under två punkter väljer
 * byggHemvy planbilden när datum finns, annars ingenting.
 */
function kurvaFor(s: Traningsstatus, provPasserat = false): KurvaData | undefined {
  if (!s.start || s.punkter.length < 2) return undefined;
  const plan = s.plandagar;
  const passKvar = !s.dagensPassGjort;
  const base: Omit<KurvaData, 'ariaLabel'> = {
    punkter: s.punkter,
    plan,
    idag: s.idag,
    start: s.start.dag,
    prov: s.plan?.provdatum ?? null,
    sikte: s.plan?.sikte ?? null,
    nyPunkt: s.nyPunkt,
    provPasserat,
  };
  return { ...base, ariaLabel: kurvansLabel(base, passKvar) };
}

function kontext(s: Traningsstatus): { text: string; href: string } | null {
  const t = kontextText({ ...rubrikIn(s), provdatum: s.plan?.provdatum ?? null });
  return t ? { text: t, href: TRANING_RUTT.installningarSteg(3) } : null;
}

/* ------------------------------------------------------------ modellen */

export function byggHemvy(inp: HemIn): HemModell {
  const s = inp.status;
  if (!s) return felModell(inp);

  const behorig = s.behorighet ?? { harOvanGrund: false, harProvlage: false, harHistorik: false };
  const betalande = behorig.harOvanGrund;
  const testtyper = s.plan?.testtyper ?? [];
  const niva = s.niva;
  const prov = s.plan?.provdatum ?? null;
  const dagarKvar = s.dagarKvar;
  const ri = rubrikIn(s);
  const fler = flerTester(inp.flerTester, testtyper, false);
  const jobb = jobbsokStatus(inp.jobbsok);
  // Text- och sifferpassen behöver ingen matrisnivå: raderna står i alla lägen med dagens pass.
  const vn = vnPassSektion(s, testtyper);
  const vnLista: Sektion[] = vn ? [vn] : [];

  /* ---------- 1p: bara personlighet */
  if (baraPersonlighet(testtyper) && niva == null) {
    const klar = dagIso(inp.flerTester.personlighetKlar);
    return {
      tillstand: 'personlighet',
      ram: '1p',
      kontext: kontext(s),
      nyPunkt: false,
      vagg: { rubrik: rubrikPersonlighet(prov), rubrikLiten: true, rad: HEM.personlighet.rad },
      lyft: klar
        ? {
            label: HEM.personlighet.eyebrow,
            eyebrow: HEM.personlighet.eyebrow,
            eyebrowTon: 'neutral',
            titel: HEM.personlighet.klarTitel,
            text: HEM.personlighet.klarText(datumText(klar)),
            handling: { typ: 'lank', text: HEM.personlighet.klarKnapp, href: TRANING_RUTT.personlighet },
          }
        : {
            label: HEM.personlighet.eyebrow,
            eyebrow: HEM.personlighet.eyebrow,
            eyebrowTon: 'neutral',
            titel: HEM.personlighet.titel,
            text: HEM.personlighet.text,
            handling: { typ: 'lank', text: HEM.personlighet.knapp, href: TRANING_RUTT.personlighet },
          },
      sektioner: [
        {
          typ: 'rader',
          nyckel: 'personlighet',
          rader: [
            { titel: HEM.personlighet.tolkasTitel, meta: HEM.personlighet.tolkasMeta, symbol: 'person', svag: true, hoger: { typ: 'chev' }, href: TRANING_RUTT.personlighet },
            {
              titel: HEM.personlighet.flerTitel,
              meta: HEM.personlighet.flerMeta,
              symbol: 'matris',
              svag: true,
              hoger: { typ: 'lank', text: HEM.personlighet.laggTill, href: TRANING_RUTT.installningarSteg(1) },
            },
          ],
        },
        jobb,
      ],
    };
  }

  /* ---------- 1e: efter provet, frågan */
  if (s.fragaEfterProvet && prov) {
    const kurva = kurvaFor(s, true);
    return {
      tillstand: 'efter',
      ram: '1e',
      kontext: null,
      nyPunkt: false,
      vagg: {
        rubrik: rubrikEfterProv(ri),
        rad: HEM.efter.rad,
        efterKnappar: true,
        kurvaRubrik: kurva ? { text: HEM.kurva.rubrikEfter, lank: { text: HEM.kurva.hela, href: TRANING_RUTT.kurvan } } : undefined,
        kurva: kurva ? { ...kurva, nyPunkt: false } : undefined,
      },
      lyft: {
        label: HEM.efter.lyftEyebrow,
        eyebrow: HEM.efter.lyftEyebrow,
        eyebrowTon: 'neutral',
        titel: HEM.efter.lyftTitel,
        text: HEM.efter.lyftText,
      },
      sektioner: [
        {
          typ: 'rader',
          nyckel: 'resten',
          rubrik: HEM.efter.restenRubrik,
          rader: [
            { titel: HEM.efter.intervjuTitel, meta: HEM.efter.intervjuMeta, symbol: 'jobb', svag: true, hoger: { typ: 'chev' }, href: TRANING_RUTT.intervju },
            { titel: HEM.efter.brevTitel, meta: HEM.efter.brevMeta(inp.jobbsok.brev), symbol: 'brev', svag: true, hoger: { typ: 'chev' }, href: TRANING_RUTT.brev },
          ],
        },
        {
          typ: 'status',
          nyckel: 'efter',
          text: HEM.efter.status(niva != null ? nivaKort(niva) : null),
          ton: 'neutral',
          lank: { text: HEM.utanDatum.sattDatum, href: TRANING_RUTT.installningarSteg(3) },
        },
      ],
    };
  }

  /* ---------- 1t: bara siffror eller bara text valt (19.3 fråga 2) */
  const kognitiva = kognitivaTyper(testtyper);
  if (niva == null && kognitiva.length > 0 && !kognitiva.includes('matris')) {
    // Siffror först när båda är valda (numeriska testets slutförandefel är rättat, 85a0b00d).
    const siffror = kognitiva.includes('numerisk');
    const A = HEM.annatTest;
    return {
      tillstand: 'annat_test',
      ram: '1t',
      kontext: kontext(s),
      nyPunkt: false,
      vagg: {
        rubrik: prov && dagarKvar != null && dagarKvar >= 0 ? rubrikForeProv(ri, dagarKvar) : HEM.rubrikUtanDatum,
        rad: A.rad,
      },
      lyft: {
        label: A.eyebrow,
        eyebrow: A.eyebrow,
        eyebrowTon: 'koppar',
        titel: siffror ? A.titelSiffror : A.titelText,
        text: A.text,
        handling: { typ: 'lank', text: siffror ? A.knappSiffror : A.knappText, href: siffror ? TRANING_RUTT.siffror : TRANING_RUTT.text },
      },
      sektioner: [...vnLista, flerTester(inp.flerTester, testtyper, true), jobb],
    };
  }

  // Efter provet med svar: datumet är passerat och hör till det gamla provet.
  const provPasserat = !!prov && dagarKvar != null && dagarKvar < 0;
  const svar = provPasserat ? (s.plan?.utfall ?? null) : null;
  const aktuelltProv = provPasserat ? null : prov;

  /* ---------- T1 och 1a: ingen mätning */
  if (niva == null || !s.start) {
    const mat = matningLyft(betalande, s.smakprov ?? null);
    if (aktuelltProv && dagarKvar != null && dagarKvar > 0) {
      const plan = byggPlan({ start: s.idag, prov: aktuelltProv, idag: s.idag, betalande });
      return {
        tillstand: 'ny',
        ram: '1a',
        kontext: kontext(s),
        nyPunkt: false,
        vagg: {
          rubrik: rubrikForeProv(ri, dagarKvar),
          rad: HEM.ny.rad,
          kurvaRubrik: { text: HEM.ny.planRubrik, lank: { text: 'Ändra datum', href: TRANING_RUTT.installningarSteg(3) } },
          planbild: {
            plan,
            idag: s.idag,
            prov: aktuelltProv,
            ariaLabel: planbildLabel(plan, s.idag, aktuelltProv),
          },
          kurvaMeta: plan.some((d) => d.status === 'last') ? HEM.ny.planMetaGratis() : HEM.ny.planMeta,
        },
        lyft: mat,
        sektioner: [...vnLista, fler, jobb],
      };
    }
    if (aktuelltProv && dagarKvar === 0) {
      return provdagModell(s, inp, ri, null);
    }
    return {
      tillstand: 'tomt',
      ram: 'T1',
      kontext: kontext(s),
      nyPunkt: false,
      vagg: {
        rubrik: HEM.rubrikUtanDatum,
        rad: HEM.tomt.rad,
        tomtBox: { titel: HEM.tomt.boxTitel, text: HEM.tomt.boxText },
      },
      lyft: mat,
      sektioner: [
        ...(svar ? [efterSvarStatus(svar)] : []),
        { typ: 'status', nyckel: 'datum', text: HEM.tomt.status, ton: 'neutral', lank: { text: HEM.utanDatum.sattDatum, href: TRANING_RUTT.installningarSteg(3) } },
        ...vnLista,
        fler,
        jobb,
      ],
      taBortSvar: !!svar,
    };
  }

  /* ---------- 1d: provdagen */
  if (aktuelltProv && dagarKvar === 0) return provdagModell(s, inp, ri, niva);

  const idagPlan = s.plandagar.find((p) => p.dag === s.idag) ?? null;
  const dagTyp = idagPlan?.typ ?? (arSondag(s.idag) ? 'vila' : 'pass');
  const gratisForsta = !betalande && s.start.dag === s.idag;
  const passLast = !betalande && !GRATISNIVA.grundpassVarjeDag && s.start.dag < s.idag;
  const tema = namnFamilj(s.dagensTema) ?? HEM.pass.temaSaknas;
  const svagaste = namnFamilj(s.varDuTappar.svagaste[0]?.family) ?? null;

  /* ---------- 1c: inför provdagen */
  if (aktuelltProv && dagarKvar != null && dagarKvar <= 2) {
    const harProv = behorig.harProvlage || GRATISNIVA.provlageGratis;
    const r = provrad(s.format);
    const generalGjord = s.senastePass?.typ === 'general' && s.senastePass.dag === s.idag;
    const kurva = kurvaFor(s);
    const inforPlanbild = kurva ? undefined : planbildFor(s, aktuelltProv);
    const akt = s.aktivitet;
    const passText = antalOrd(akt.pass, 'ett', 'pass', 'pass');
    const sektioner: Sektion[] = [];
    const svag = s.varDuTappar.svagaste[0];
    if (svag) {
      sektioner.push({
        typ: 'rader',
        nyckel: 'repetera',
        rubrik: HEM.tappar.repetera,
        rader: [
          {
            titel: HEM.tappar.kortPass(namnFamilj(svag.family) ?? svag.family),
            meta: HEM.tappar.kortPassMeta,
            stapel: svag.ratt > 0 ? { andel: svag.andel, ton: 'ton' } : undefined,
            hoger:
              betalande || GRATISNIVA.riktadePassGratis
                ? { typ: 'lank', text: HEM.tappar.starta, href: TRANING_RUTT.riktat(svag.family) }
                : { typ: 'las', text: HEM.tappar.riktat, feature: 'tests_above_base', plats: 'riktat' },
          },
        ],
      });
    }
    sektioner.push(...vnLista, { typ: 'status', nyckel: 'infor', text: HEM.infor.status, ton: 'koppar' }, fler, jobb);
    return {
      tillstand: 'infor',
      ram: '1c',
      kontext: kontext(s),
      nyPunkt: s.nyPunkt,
      vagg: {
        rubrik: rubrikForeProv(ri, dagarKvar),
        rad: versal(HEM.rad.infor(passText)),
        dagsrad: {
          ring: generalGjord ? 'gjord' : 'general',
          ringLabel: generalGjord ? HEM.dagsrad.ringGeneralGjord : HEM.dagsrad.ringGeneral,
          tal: dagsradTal(s, niva),
        },
        kurvaRubrik: kurva || inforPlanbild ? kurvaRubrik(s, !kurva) : undefined,
        kurva,
        planbild: kurva ? undefined : inforPlanbild,
      },
      lyft: generalGjord && s.senastePass
        ? klartLyft(s, betalande, true)
        : {
            label: HEM.infor.eyebrow,
            eyebrow: HEM.infor.eyebrow,
            eyebrowTon: 'koppar',
            titel: `${r.titel}: ${r.antalTid}`,
            // Anmärkningen (SHL, Aon) först, flyttad från provraden (copy-plan 3.5).
            text: [r.anmarkning, harProv ? (dagarKvar === 2 ? HEM.infor.text2 : HEM.infor.text1) : HEM.infor.lastText()].filter(Boolean).join(' '),
            handling: harProv
              ? { typ: 'lank', text: HEM.infor.knapp, href: TRANING_RUTT.general }
              : kop(s, 'test_exam_mode', 'generalrepetition'),
          },
      sektioner,
    };
  }

  /* ---------- 1b, 1g, 1f, 1h, 1i */
  const utanDatum = !aktuelltProv;
  const kurva = kurvaFor(s);
  const planbild = kurva ? undefined : planbildFor(s, aktuelltProv);
  const efterPass = s.dagensPassGjort && !!s.senastePass && s.senastePass.dag === s.idag;
  const dagLage: 'pass' | 'vila' | 'ommatning' = dagTyp === 'vila' ? 'vila' : dagTyp === 'ommatning' ? 'ommatning' : 'pass';

  let lyft: LyftModell;
  if (efterPass) {
    lyft = klartLyft(s, betalande, false);
  } else if (dagLage === 'ommatning' && !s.dagensPassGjort) {
    const tillats = betalande || GRATISNIVA.ommatningGratis;
    lyft = {
      label: HEM.ommatning.eyebrow,
      eyebrow: HEM.ommatning.eyebrow,
      eyebrowTon: 'koppar',
      titel: HEM.ommatning.titel,
      text: tillats ? HEM.ommatning.text : `${HEM.ommatning.text} ${HEM.ommatning.lastText()}`,
      handling: tillats
        ? { typ: 'lank', text: HEM.ommatning.knapp, href: TRANING_RUTT.matning }
        : kop(s, 'tests_above_base', 'ommatning'),
      fot: tillats ? undefined : HEM.pass.lastFot,
    };
  } else if (dagLage === 'vila' && !s.dagensPassGjort) {
    lyft = {
      label: HEM.vila.eyebrow,
      eyebrow: HEM.vila.eyebrow,
      eyebrowTon: 'neutral',
      titel: HEM.vila.titel,
      text: HEM.vila.text,
      handling: passLast
        ? kop(s, 'tests_above_base', 'dag2')
        : { typ: 'lank', text: HEM.vila.knapp, href: TRANING_RUTT.pass },
    };
  } else if (passLast) {
    // 17.2: grundpasset bara dag 0. Passet visas med tema och nivå, knappen köper.
    lyft = {
      label: 'Dagens pass',
      eyebrow: HEM.pass.eyebrow,
      eyebrowTon: 'koppar',
      titel: tema,
      text: HEM.pass.lastText(svagaste),
      handling: kop(s, 'tests_above_base', 'dag2'),
      fot: HEM.pass.lastFot,
    };
  } else if (gratisForsta) {
    lyft = {
      label: 'Dagens pass',
      eyebrow: HEM.pass.eyebrowGrund,
      eyebrowTon: 'koppar',
      titel: tema,
      text: HEM.pass.textGrund,
      handling: { typ: 'lank', text: HEM.pass.knappGrund, href: TRANING_RUTT.pass },
    };
  } else {
    lyft = {
      label: 'Dagens pass',
      eyebrow: HEM.pass.eyebrow,
      eyebrowTon: 'koppar',
      titel: tema,
      text: HEM.pass.text,
      handling: { typ: 'lank', text: HEM.pass.knapp, href: TRANING_RUTT.pass },
    };
  }

  const sektioner: Sektion[] = [];
  if (svar) sektioner.push(efterSvarStatus(svar));
  if (efterPass && s.senastePass) {
    const imorgon = imorgonText(s);
    if (imorgon) sektioner.push({ typ: 'status', nyckel: 'imorgon', text: imorgon, ton: 'koppar' });
  }
  sektioner.push(...vnLista);
  const tempo = !efterPass && betalande ? tempoSektion(s) : null;
  if (tempo) sektioner.push(tempo);
  const tappar = varDuTappar(s, betalande, s.aktivitet.pass === 0);
  if (tappar) sektioner.push(tappar);
  if (!efterPass) sektioner.push(provdagenSektion(s, behorig.harProvlage));
  if (!efterPass) sektioner.push(fler);
  sektioner.push(jobb);

  let ram = utanDatum ? '1h' : !s.format.namn ? '1i' : '1b';
  if (efterPass) ram = '1g';
  else if (!betalande && !utanDatum) ram = '1f';

  const vagg: VaggModell = {
    rubrik: utanDatum ? HEM.rubrikUtanDatumPass : rubrikForeProv(ri, dagarKvar!),
    rad: radText(s, dagLage),
    dagsrad: {
      ring: s.dagensPassGjort ? 'gjord' : 'kvar',
      ringLabel: s.dagensPassGjort ? HEM.dagsrad.ringGjord : HEM.dagsrad.ringKvar,
      tal: dagsradTal(s, niva),
    },
    vecka: utanDatum ? undefined : (() => {
      const st = veckorad(s.plandagar, s.idag);
      return { status: st, label: veckoLabel(st) };
    })(),
    kurvaRubrik: kurva || planbild ? kurvaRubrik(s, !kurva) : undefined,
    kurva,
    planbild,
    kurvaMeta: s.historikLast || s.plandagar.some((p) => p.status === 'last') ? HEM.kurva.gratisMeta() : undefined,
    datumBox: utanDatum ? { text: HEM.utanDatum.box, lank: { text: HEM.utanDatum.sattDatum, href: TRANING_RUTT.installningarSteg(3) } } : undefined,
  };

  return {
    tillstand: efterPass ? 'efter_pass' : utanDatum ? 'utan_datum' : 'mitt_i',
    ram,
    kontext: kontext(s),
    nyPunkt: s.nyPunkt,
    vagg,
    lyft: svar === 'vidare' && !efterPass ? intervjuLyft() : lyft,
    sektioner,
    taBortSvar: !!svar,
  };
}

/**
 * Kurvans rubrik. Formen visas först från tre punkter (punkt 2): en eller två
 * punkter har ingen form. Med planbilden i stället för kurvan heter raden
 * Planen.
 */
function kurvaRubrik(s: Traningsstatus, planbild = false): VaggModell['kurvaRubrik'] {
  return {
    text: planbild ? HEM.ny.planRubrik : HEM.kurva.rubrik,
    form: !planbild && s.form && s.punkter.length >= 3 ? HEM.kurva.form[s.form.form] ?? s.form.form : undefined,
    lank: { text: HEM.kurva.hela, href: TRANING_RUTT.kurvan },
  };
}

/** Planbilden under två punkter, när datum finns (avvikelse 2). Bara dagarna från i dag. */
function planbildFor(s: Traningsstatus, prov: Dag | null): PlanbildData | undefined {
  if (!prov || prov <= s.idag) return undefined;
  const plan = s.plandagar.filter((d) => d.dag >= s.idag);
  return { plan, idag: s.idag, prov, matt: true, ariaLabel: planbildLabel(plan, s.idag, prov, true) };
}

function matningLyft(betalande: boolean, smakprov: Traningsstatus['smakprov']): LyftModell {
  // Smakprovet räknas in (19.3 fråga 3, 19.5 fråga 2): en text, minuterna på de nya.
  const n = smakprov && smakprov.antal > 0 && smakprov.antal < 12 ? smakprov.antal : 0;
  const m = n ? HEM.matning.smakprovMinuter(n) : null;
  return {
    label: HEM.matning.eyebrow,
    eyebrow: HEM.matning.eyebrow,
    eyebrowTon: 'koppar',
    titel: m ? HEM.matning.smakprovTitel(m) : HEM.matning.titel,
    text: n ? HEM.matning.smakprovText(n) : HEM.matning.text,
    handling: { typ: 'lank', text: m ? HEM.matning.smakprovKnapp(m) : HEM.matning.knapp, href: TRANING_RUTT.matning },
    // "Gratis." stod som lös rad på golvet; den är kortets fot (art-director 22.2).
    fot: !betalande && GRATISNIVA.matningGratis ? HEM.matning.gratis : undefined,
  };
}

function intervjuLyft(): LyftModell {
  const i = HEM.efterSvar.intervju;
  return {
    label: i.eyebrow,
    eyebrow: i.eyebrow,
    eyebrowTon: 'neutral',
    titel: i.titel,
    text: i.text,
    handling: { typ: 'lank', text: i.knapp, href: TRANING_RUTT.intervju },
  };
}

function efterSvarStatus(svar: string): Sektion {
  const text = svar === 'vidare' ? HEM.efterSvar.vidare : svar === 'vet_inte' ? HEM.efterSvar.vetInte : HEM.efterSvar.inteVidare;
  return {
    typ: 'status',
    nyckel: 'svar',
    text,
    ton: 'neutral',
    lank: svar === 'inte_vidare' ? { text: HEM.utanDatum.sattDatum, href: TRANING_RUTT.installningarSteg(3) } : undefined,
  };
}

function klartLyft(s: Traningsstatus, betalande: boolean, general: boolean): LyftModell {
  const p = s.senastePass!;
  const ratt = p.ratt ?? 0;
  let titel: string;
  if (p.typ === 'riktat') titel = HEM.klart.utanNiva;
  else if (p.niva_efter == null) titel = HEM.klart.utanNivaPass;
  else if (p.niva_fore == null || p.niva_efter > p.niva_fore + 1e-9) titel = HEM.klart.upp(nivaKort(p.niva_efter));
  else if (Math.abs(p.niva_efter - p.niva_fore) < 1e-9) titel = HEM.klart.samma(nivaKort(p.niva_efter));
  else if (Math.round((p.niva_fore - p.niva_efter) * 10) === 1) titel = HEM.klart.ner(nivaKort(p.niva_efter));
  else titel = HEM.klart.nerMer(nivaKort(p.niva_efter));

  return {
    label: general ? HEM.klart.eyebrowGeneral : HEM.klart.eyebrow,
    eyebrow: general ? HEM.klart.eyebrowGeneral : HEM.klart.eyebrow,
    eyebrowTon: 'koppar',
    titel,
    text: p.typ === 'riktat' ? HEM.klart.riktat : undefined,
    // Ett tal (copy-plan 3.3): nivån står i titeln, tempot i genomgången.
    tal: { varde: `${ratt} av ${p.antal}`, etikett: HEM.klart.talRatt },
    handling: { typ: 'lank', text: HEM.klart.knapp, href: TRANING_RUTT.genomgang(p.id) },
    sekundar: betalande && !general ? { text: HEM.klart.ettTill, href: TRANING_RUTT.pass } : undefined,
  };
}

/** "I morgon"-raden efter dagens pass (imorgon.ts, med vilodag och ommätning som veckodag). */
function imorgonText(s: Traningsstatus): string | null {
  if (!s.start) return HEM.imorgon.utanPlan;
  const imorgon = laggTill(s.idag, 1);
  const p = s.plandagar.find((d) => d.dag === imorgon);
  const typ = p?.typ ?? (arSondag(imorgon) ? 'vila' : 'pass');
  const veckodagar = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
  const vd = (d: Dag) => versal(veckodagar[veckodag(d)]);
  const passText = s.senastePass && s.senastePass.ratt != null && s.senastePass.antal > 0 && s.senastePass.ratt / s.senastePass.antal >= 2 / 3
    ? TRANING_COPY.imorgon.familjUpp
    : TRANING_COPY.imorgon.nyFamilj;
  if (typ === 'vila') {
    let dag = laggTill(imorgon, 1);
    let t = s.plandagar.find((d) => d.dag === dag)?.typ ?? 'pass';
    if (t === 'vila') {
      dag = laggTill(dag, 1);
      t = s.plandagar.find((d) => d.dag === dag)?.typ ?? 'pass';
    }
    const akt = t === 'ommatning' ? 'ny nivåkoll, 8 minuter' : t === 'general' ? 'övningsprov' : t === 'prov' ? 'provet' : passText;
    return `${vd(imorgon)} är vilodag. ${vd(dag)}: ${akt}.`;
  }
  if (typ === 'ommatning') return `${vd(imorgon)}: ny nivåkoll, 8 minuter.`;
  if (typ === 'general') return 'I morgon: övningsprov.';
  if (typ === 'prov') return 'I morgon: provet. Bara tre uppvärmningsfrågor.';
  return `I morgon: ${passText}.`;
}

function provdagModell(s: Traningsstatus, inp: HemIn, ri: RubrikIn, niva: number | null): HemModell {
  const prov = s.plan!.provdatum!;
  const akt = s.aktivitet;
  const gjort =
    // Nivåmätningarna stryks ur meningen (copy-plan 3.9).
    akt.pass + akt.generalrepetitioner > 0
      ? `Du har gjort ${[
          akt.pass ? antalOrd(akt.pass, 'ett', 'pass', 'pass') : null,
          akt.generalrepetitioner ? antalOrd(akt.generalrepetitioner, 'ett', 'övningsprov', 'övningsprov') : null,
        ]
          .filter(Boolean)
          .join(', ')
          .replace(/, ([^,]+)$/, ' och $1')}.`
      : '';
  const sikte = s.plan?.sikte ?? null;
  const skala: SkalaData | null =
    niva != null
      ? {
          nu: niva,
          fran: s.start?.niva ?? null,
          sikte,
          etikettNu: HEM.provdag.skala.du(nivaKort(niva)),
          etikettFran: s.start ? HEM.provdag.skala.fran(String(heltal(s.start.niva))) : null,
          aria: `Nivåskala 1 till 10. Du: ${nivaKort(niva)}.${s.start ? ` Starten ${datumText(s.start.dag)}: ${nivaKort(s.start.niva)}.` : ''}${sikte != null ? ` Mål: ${nivaKort(sikte)}.` : ''}`,
        }
      : null;
  const perUppgift = s.format.tidsform === 'per_uppgift';
  const dagStr = kortDatum(prov);
  const manad = manadNamn(prov);
  const kort = dagStr.split(' ')[1] ?? '';
  return {
    tillstand: 'provdag',
    ram: '1d',
    kontext: null,
    nyPunkt: false,
    vagg: {
      rubrik: `I dag: ${ri.leverantorNamn ?? 'provet'}`,
      rad: '',
      provdag: {
        eyebrow: HEM.provdag.eyebrow(rubrikForeProv(ri, 0).replace(/^I dag: /, '')),
        dag: dagStr,
        manadRest: manad.startsWith(kort) ? manad.slice(kort.length) : '',
        text: gjort ? HEM.provdag.text(gjort) : HEM.provdag.textUtanPass,
        skala,
      },
    },
    lyft: {
      label: HEM.provdag.uppvarmning.eyebrow,
      eyebrow: HEM.provdag.uppvarmning.eyebrow,
      eyebrowTon: 'koppar',
      titel: HEM.provdag.uppvarmning.titel,
      text: HEM.provdag.uppvarmning.text,
      handling: { typ: 'lank', text: HEM.provdag.uppvarmning.knapp, href: TRANING_RUTT.uppvarmning },
    },
    sektioner: [
      {
        typ: 'rader',
        nyckel: 'rad',
        rubrik: undefined,
        rader: [
          { titel: HEM.provdag.rad.tystRum, meta: HEM.provdag.rad.tystRumMeta },
          { titel: HEM.provdag.rad.lattForst, meta: perUppgift ? HEM.provdag.rad.lattForstPerUppgift : HEM.provdag.rad.lattForstMeta },
          { titel: HEM.provdag.rad.efterat, meta: HEM.provdag.rad.efteratMeta },
        ],
      },
      { typ: 'status', nyckel: 'provdag', text: HEM.provdag.status, ton: 'neutral' },
    ],
  };
}

function planbildLabel(plan: readonly PlanDag[], idag: Dag, prov: Dag, matt = false): string {
  const om = plan.filter((p) => p.typ === 'ommatning').map((p) => datumText(p.dag));
  const gen = plan.filter((p) => p.typ === 'general').map((p) => datumText(p.dag));
  return [
    `Planen från ${datumText(idag)} till provet ${datumText(prov)}: ${matt ? 'Nivåkollen gjord' : 'Nivåkollen i dag'}, pass varje dag med vilodag söndag`,
    om.length ? `, ny nivåkoll ${om.join(' och ')}` : '',
    gen.length ? `, övningsprov ${gen.join(' och ')}` : '',
    `, prov ${datumText(prov)}.`,
  ].join('');
}

function felModell(inp: HemIn): HemModell {
  return {
    tillstand: 'fel',
    ram: 'X1',
    kontext: null,
    nyPunkt: false,
    vagg: { rubrik: HEM.rubrikUtanDatum, rad: '' },
    lyft: {
      label: HEM.fel.eyebrow,
      eyebrow: HEM.fel.eyebrow,
      eyebrowTon: 'neutral',
      titel: HEM.fel.titel,
      text: HEM.fel.text,
      handling: { typ: 'forsok', text: HEM.fel.knapp },
      sekundar: { text: HEM.fel.kurvan, href: TRANING_RUTT.kurvan },
      alert: true,
    },
    sektioner: [jobbsokStatus(inp.jobbsok)],
  };
}

/** Gör talen i en dagsrad till text för tester och skärmläsare. */
export function dagsradText(m: HemModell): string | null {
  const d = m.vagg.dagsrad;
  return d ? `${d.tal.varde} ${d.tal.etikett}` : null;
}

export { kognitivaTyper, dagarMellan, ingarIPaketet };
