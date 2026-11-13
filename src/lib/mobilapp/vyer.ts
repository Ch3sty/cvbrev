// src/lib/mobilapp/vyer.ts
// =============================================================================
// Appens tre flikar som ren data (docs/plan-app.md steg 2, konceptet
// docs/design/app-koncept-2026-11-13.html). Läser motorns Traningsstatus,
// samma som webbens hemvy, och räknar fram det appens vyer ritar: veckoraden,
// serietexten, katalogens kort och arket för ett test.
//
// Inga nya regler om behörighet: låsen följer statusens behörighet
// (harOvanGrund, harProvlage), och spärren sitter som förut på servern när
// ett pass startas. Länkarna är webbens adresser (lib/traning/rutter.ts och
// testConfig), så passen körs av den delade koden.
// =============================================================================

import type { Traningsstatus } from '@/lib/traning/motor.server';
import type { Symbol } from '@/lib/traning/hemvy';
import type { Serie } from '@/lib/traning/serie';
import { arPausdag } from '@/lib/traning/serie';
import { arSondag, laggTill, veckodag, type Dag } from '@/lib/traning/datum';
import { nivaKort } from '@/lib/traning/pass-copy';
import { provrad } from '@/lib/traning/rubrik';
import {
  DELTYPER,
  DELTYP_NAMN,
  deltesterForPlan,
  deltypSynlig,
  mittTestNamn,
  mittTestUrPlan,
  type Deltyp,
} from '@/lib/traning/mittTest';
import { TRANING_RUTT, nivakollHref, ovningsprovHref, steg2PassHref } from '@/lib/traning/rutter';
import { TEST_CONFIGS, testPaths } from '@/app/dashboard/tester/testConfig';
import { deduktivSynlig } from '@/lib/deduktivV1/status';
import { figurserierSynliga } from '@/lib/figurserierV1/status';
import { iprovProvSynligt } from '@/lib/tester/steg2Status';

/** Testtyperna i appen plus planens egen symbol. */
export type AppTyp = Deltyp | 'plan';

/** Hemvyns symboler till appens figurer. */
export function typForSymbol(s: Symbol | undefined): AppTyp {
  switch (s) {
    case 'matris':
      return 'matris';
    case 'siffror':
      return 'numerisk';
    case 'ord':
      return 'verbal';
    case 'figurer':
      return 'figurserie';
    case 'deduktiv':
    case 'talserie':
    case 'spatial':
    case 'ordforrad':
      return s;
    case 'person':
      return 'personlighet';
    default:
      return 'plan';
  }
}

/* ------------------------------------------------------------ dagarna i rad */

export type RingStatus = 'gjord' | 'idag' | 'kvar' | 'fri' | 'paus' | 'missad';

const VECKODAGAR = ['mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön'] as const;

/**
 * Veckoraden måndag till söndag för veckan med i dag. Söndagen är fri och
 * dagarna runt provet pausar (serie.ts), så ringen säger aldrig "missad" om
 * en dag som inte räknas.
 */
export function veckaFor(s: Pick<Traningsstatus, 'plandagar' | 'idag' | 'serie' | 'plan'>): { etikett: string; status: RingStatus; idag: boolean }[] {
  const idag = s.idag;
  const mandag = laggTill(idag, -((veckodag(idag) + 6) % 7));
  const perDag = new Map(s.plandagar.map((p) => [p.dag, p]));
  const prov = s.plan?.provdatum ?? null;
  return VECKODAGAR.map((etikett, i) => {
    const dag = laggTill(mandag, i);
    const p = perDag.get(dag);
    let status: RingStatus;
    if (p?.status === 'gjord' || (dag === idag && s.serie.gjordIdag)) status = 'gjord';
    else if (arPausdag(dag, prov)) status = 'paus';
    else if (dag === idag) status = 'idag';
    else if (arSondag(dag) || p?.typ === 'vila') status = 'fri';
    else if (p?.status === 'missad') status = 'missad';
    else status = 'kvar';
    return { etikett, status, idag: dag === idag };
  });
}

const TALORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton', 'tjugo'];

function ord(n: number): string {
  return n >= 0 && n < TALORD.length ? TALORD[n] : String(n);
}

function versal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Meningen under veckoraden (konceptet, Idag). Aldrig skuld, aldrig "serien dör". */
export function serieText(serie: Serie): string {
  if (serie.status === 'pausad') return 'Dagarna i rad pausar, inget bryts.';
  const n = serie.dagar;
  if (serie.gjordIdag) return n <= 1 ? 'Första dagen i rad.' : `${versal(ord(n))} dagar i rad.`;
  if (n >= 1) return `${versal(ord(n))} ${n === 1 ? 'dag' : 'dagar'} i rad. Dagens pass gör det ${ord(n + 1)}.`;
  return 'Dagarna i rad börjar i dag.';
}

/* ------------------------------------------------------------ katalogen */

export interface TestRad {
  titel: string;
  meta: string;
  href: string;
  /** Höger: bock med nivån, Gratis, Premium (låst) eller bara en pil. */
  chip: { text: string; ton: 'gjord' | 'fri' | 'las' } | null;
}

export interface KatalogKort {
  typ: Deltyp;
  namn: string;
  /** Andra namn på testtypen, under rubriken i arket. */
  alias: string;
  meta: string;
  /** Nivåstaplarna: grund, avancerad, expert. Null för personlighet. */
  nivaer: [boolean, boolean, boolean] | null;
  rader: TestRad[];
}

export interface Katalog {
  mittTest: { titel: string; meta: string; href: string; andra: string } | null;
  ingar: KatalogKort[];
  ovningsprov: { titel: string; meta: string; href: string; las: boolean } | null;
  fler: KatalogKort[];
}

const ALIAS: Partial<Record<Deltyp, string>> = {
  matris: 'Kallas även Matrigma eller IQ-test',
  talserie: 'Kallas även talföljder',
  spatial: 'Kallas även rumsuppfattning',
  ordforrad: 'Synonymer och motsatsord',
  personlighet: 'Inga rätta svar',
};

type NivakollTyp = 'figurserie' | 'deduktiv' | 'verbal' | 'numerisk';
const NIVAKOLL_TYPER: readonly Deltyp[] = ['figurserie', 'deduktiv', 'verbal', 'numerisk'];
const STEG2_TYPER: readonly Deltyp[] = ['talserie', 'spatial', 'ordforrad'];

/** Syns testtypen i appen? Samma flaggor som webbens katalog. */
export function typSynlig(t: Deltyp): boolean {
  if (t === 'figurserie') return figurserierSynliga();
  if (t === 'deduktiv') return deduktivSynlig();
  return deltypSynlig(t);
}

/** Passets adress per testtyp (rutter.ts). */
function passHrefFor(t: Deltyp): string | null {
  switch (t) {
    case 'matris':
      return TRANING_RUTT.pass;
    case 'verbal':
      return TRANING_RUTT.textpass;
    case 'numerisk':
      return TRANING_RUTT.sifferpass;
    case 'figurserie':
      return TRANING_RUTT.figurpass;
    case 'deduktiv':
      return TRANING_RUTT.deduktivpass;
    case 'talserie':
    case 'spatial':
    case 'ordforrad':
      return steg2PassHref(t);
    default:
      return null;
  }
}

/** Övningsprovets startark per testtyp, null där provet saknas. */
export function ovningsprovFor(t: Deltyp): string | null {
  switch (t) {
    case 'matris':
      return ovningsprovHref('logik');
    case 'verbal':
      return ovningsprovHref('verbal');
    case 'numerisk':
      return ovningsprovHref('numerisk');
    case 'figurserie':
      return ovningsprovHref('figurer');
    case 'deduktiv':
      return ovningsprovHref('deduktiv');
    case 'talserie':
    case 'spatial':
    case 'ordforrad':
      return iprovProvSynligt() ? '/dashboard/tester/iprov' : null;
    default:
      return null;
  }
}

/** Nivån ur Nivåkollen för en testtyp, null om den inte är gjord. */
export function nivaFor(s: Pick<Traningsstatus, 'niva' | 'nivakoll'>, t: Deltyp): number | null {
  if (t === 'matris') return s.niva;
  if ((NIVAKOLL_TYPER as readonly string[]).includes(t)) return s.nivakoll?.[t as NivakollTyp]?.niva ?? null;
  return null;
}

const NIVA_TITEL = { grund: 'Grundnivå', avancerad: 'Avancerad nivå', expert: 'Expertnivå' } as const;

function kortFor(s: Traningsstatus, t: Deltyp): KatalogKort {
  const betalande = s.behorighet?.harOvanGrund ?? false;
  const harProv = s.behorighet?.harProvlage ?? false;
  const niva = nivaFor(s, t);
  const rader: TestRad[] = [];
  const las = { text: 'Premium', ton: 'las' } as const;

  // Nivåkollen först: gratis, och den väljer passens nivå.
  if (t === 'matris' || NIVAKOLL_TYPER.includes(t)) {
    rader.push({
      titel: 'Nivåkollen',
      meta: 'Tolv uppgifter, cirka åtta minuter',
      href: t === 'matris' ? TRANING_RUTT.matning : nivakollHref(t as NivakollTyp),
      chip: niva != null ? { text: `nivå ${nivaKort(niva)}`, ton: 'gjord' } : { text: 'Gratis', ton: 'fri' },
    });
  }
  const pass = passHrefFor(t);
  if (pass) {
    // Grundpasset är gratis på mätningens dag (gratisnivan.ts); annars Premium.
    const gratisIdag = t === 'matris' && s.start?.dag === s.idag;
    rader.push({
      titel: niva != null ? 'Passet på din nivå' : 'Ett pass',
      meta: 'Nio uppgifter, regeln efter varje svar',
      href: pass,
      chip: betalande || gratisIdag ? null : las,
    });
  }
  for (const c of TEST_CONFIGS.filter((c) => c.kind === t && c.level !== 'prov')) {
    const titel = t === 'personlighet' ? (c.level === 'grund' ? 'Grundprofilen' : 'Fördjupad profil') : NIVA_TITEL[c.level as keyof typeof NIVA_TITEL];
    rader.push({
      titel,
      meta: `${c.totalQuestions} ${t === 'personlighet' ? 'påståenden' : 'uppgifter'}, ${c.minutes} min`,
      href: testPaths.hub(c.slug),
      chip: c.requiresFeature && !betalande ? las : null,
    });
  }
  const prov = ovningsprovFor(t);
  if (prov) {
    rader.push({ titel: 'Övningsprov mot klockan', meta: 'Provets antal och tid, ingen förklaring under provet', href: prov, chip: harProv ? null : las });
  }

  let meta: string;
  if (t === 'personlighet') meta = 'Femtio påståenden, en profil';
  else if (niva != null) meta = `Nivåkoll gjord, nivå ${nivaKort(niva)}`;
  else if (STEG2_TYPER.includes(t)) meta = s.steg2Gjord?.[t as 'talserie' | 'spatial'] ? 'Nivåtest gjort' : 'Nivåtest, 15 uppgifter';
  else meta = 'Nivåkoll, 8 min';

  return {
    typ: t,
    namn: DELTYP_NAMN[t],
    alias: ALIAS[t] ?? 'Ingår i rekryteringstester',
    meta,
    nivaer: t === 'personlighet' ? null : [true, betalande, betalande],
    rader,
  };
}

/** Tester-fliken: Mitt test, deltesterna som ingår, övningsprovet och resten. */
export function byggKatalog(s: Traningsstatus): Katalog {
  const plan = s.plan;
  const val = mittTestUrPlan(plan);
  const ingarTyper = (deltesterForPlan(plan) ?? []).filter(typSynlig);
  const ingar = ingarTyper.map((t) => kortFor(s, t));
  const fler = DELTYPER.filter((t) => typSynlig(t) && !ingarTyper.includes(t)).map((t) => kortFor(s, t));

  let mittTest: Katalog['mittTest'] = null;
  if (val) {
    const namn = mittTestNamn(val, plan?.mitt_test_variant ?? null);
    const dagar = s.dagarKvar;
    const delar = [dagar != null && dagar > 0 ? (dagar === 1 ? '1 dag kvar' : `${dagar} dagar kvar`) : 'Inget datum'];
    if (s.format.namn) delar.push(provrad(s.format).antalTid);
    mittTest = { titel: `Mitt test: ${namn}`, meta: delar.join(' · '), href: TRANING_RUTT.installningar, andra: 'Ändra' };
  }

  let ovningsprov: Katalog['ovningsprov'] = null;
  const forsta = val === 'iprov' ? 'talserie' : ingarTyper.find((t) => ovningsprovFor(t));
  const href = forsta ? ovningsprovFor(forsta) : null;
  if (href && val !== 'personlighet') {
    const r = provrad(s.format);
    ovningsprov = {
      titel: 'Övningsprov mot klockan',
      meta: val === 'iprov' ? 'Sex deltester i provets ordning' : s.format.namn ? `${s.format.namn}: ${r.antalTid}` : r.antalTid,
      href,
      las: !(s.behorighet?.harProvlage ?? false),
    };
  }

  return { mittTest, ingar, ovningsprov, fler };
}

/* ------------------------------------------------------------ kurvan */

export interface KurvPunkt {
  /** Dagar från startpunkten. */
  x: number;
  niva: number;
  /** Nivåkoll: ringad punkt. */
  matning: boolean;
}

/** Kurvans punkter i dagar från starten, och hur många dagar axeln spänner. */
export function kurvPunkter(
  punkter: readonly { dag: Dag; niva: number; typ: string }[],
  start: Dag,
  prov: Dag | null,
  idag: Dag,
): { punkter: KurvPunkt[]; dagar: number; provX: number | null } {
  const dagIndex = (d: Dag) => Math.round((Date.parse(`${d}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000);
  const pk = [...punkter]
    .sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0))
    .map((p) => ({ x: dagIndex(p.dag), niva: p.niva, matning: p.typ === 'matning' || p.typ === 'ommatning' }));
  const provX = prov && prov >= idag ? dagIndex(prov) : null;
  const sista = pk.length ? pk[pk.length - 1].x : 0;
  const dagar = Math.max(provX ?? 0, sista, dagIndex(idag), 7);
  return { punkter: pk, dagar, provX };
}
