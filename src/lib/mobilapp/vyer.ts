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
import { kortDatum, provrad } from '@/lib/traning/rubrik';
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
import { iprovProvSynligt } from '@/lib/tester/steg2Status';
import { GRATISRAD, KALLAS, LAS_CHIP, MAT_DIG, TESTA_DIG, ingarIDelar, inteI } from '@/lib/tester/v4/copy';
import { NIVAKOLL_FINNS, PLAN_HREF, omattMeta, utvecklingHref } from '@/lib/tester/v4/rutter';
import { NIVAKOLL_OMFANG, nivakollAntalTid, type NivakollTypId } from '@/lib/nivakoll/omfang';
import {
  ZON_GRANSER,
  type Handling,
  type NivaLage,
  type TestTypId,
  type TesterV4Data,
  type TesttypKort,
  type UtvecklingsPunkt,
  type Zon,
} from '@/lib/tester/v4/typer';
import { TESTER, nivaText, rattAv } from '@/components/tester-v4/tester/copy';
import { APP_PREMIUM } from './appvag';

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
  if (n >= 1) return `${versal(ord(n))} ${n === 1 ? 'dag' : 'dagar'} i rad. Dagens träning gör det ${ord(n + 1)}.`;
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

/** Raden under namnet ur v4:s KALLAS. Personligheten har ingen nivå. */
function kallasFor(t: Deltyp): string {
  return t === 'personlighet' ? TESTER.personlighet.text : KALLAS[t];
}

type NivakollTyp = 'figurserie' | 'deduktiv' | 'verbal' | 'numerisk' | 'talserie' | 'spatial' | 'ordforrad';
// Etapp 6 (plan-testflode-2026-11-20): talserier, spatial förmåga och ordförråd har Nivåkollen som webben.
const NIVAKOLL_TYPER: readonly Deltyp[] = ['figurserie', 'deduktiv', 'verbal', 'numerisk', 'talserie', 'spatial', 'ordforrad'];
const STEG2_TYPER: readonly Deltyp[] = ['talserie', 'spatial', 'ordforrad'];

/** Syns testtypen i appen? Samma regel som v4 (hamta.server.ts: deltypSynlig). */
export function typSynlig(t: Deltyp): boolean {
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
    // Talserier, spatial förmåga och ordförråd har inget eget övningsprov
    // mot klockan, varken på webben eller i appen. I-provets övningsprov
    // täcker dem men visas bara för den som valt I-provet (byggKatalog),
    // precis som webbens IprovRad.
    default:
      return null;
  }
}

/** I-provets övningsprov, bara när Mitt test är I-provet och provet är synligt. */
const IPROV_PROV = '/dashboard/tester/iprov';

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
      meta: nivakollAntalTid(NIVAKOLL_OMFANG[t as NivakollTypId]),
      href: t === 'matris' ? TRANING_RUTT.matning : nivakollHref(t as NivakollTyp),
      chip: niva != null ? { text: `nivå ${nivaKort(niva)}`, ton: 'gjord' } : { text: 'Gratis', ton: 'fri' },
    });
  }
  const pass = passHrefFor(t);
  if (pass) {
    // Grundpasset är gratis på mätningens dag (gratisnivan.ts); annars Premium.
    const gratisIdag = t === 'matris' && s.start?.dag === s.idag;
    rader.push({
      titel: niva != null ? 'Träna på din nivå' : 'Träna',
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
  else if (STEG2_TYPER.includes(t) && s.steg2Gjord?.[t as 'talserie' | 'spatial']) meta = 'Nivåtest gjort';
  // Samma rad som webbens kort: typens Nivåkoll-tid, eller nivåtestet där Nivåkollen saknas.
  else meta = omattMeta(t as TestTypId);

  return {
    typ: t,
    namn: DELTYP_NAMN[t],
    alias: kallasFor(t),
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
  const forsta = ingarTyper.find((t) => ovningsprovFor(t));
  const href = val === 'iprov' ? (iprovProvSynligt() ? IPROV_PROV : null) : forsta ? ovningsprovFor(forsta) : null;
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

/* ------------------------------------------------------------ katalogen, v4 */
//
// Tester-fliken läser samma data som webbens Tester v4 (hamtaTesterV4) och
// visar samma innehåll och regler i appens form: korten med nivåstaplar och
// typens ark med Träna, Testa dig på en nivå och Mät dig. Låsen, kvoten och
// "Gratis en gång" kommer ur v4:s Handling; appen har inga egna gratisregler.
// Ett låst val leder till appens köpvy (Google Play), som webbens betalvägg.

export type ArkChip = { text: string; ton: 'gjord' | 'fri' | 'las' };

export interface ArkRad {
  titel: string;
  meta: string;
  /** Null: raden står som text (Nivåkollen som inte finns än i typen). */
  href: string | null;
  chip: ArkChip | null;
}

export interface SenasteRad {
  id: string;
  dag: string;
  slag: string;
  varde: string;
  href: string | null;
}

export interface KatalogArk {
  /** Med plan: provets format, annars "kallas även". */
  rad: string;
  niva: NivaLage;
  trana: { eyebrow: string; rubrik: string; text: string; knapp: { text: string; href: string; las: boolean } };
  /** Öva på mönstret, tom lista utan mönsterdata. */
  monster: ArkRad[];
  testa: { eyebrow: string; rubrik: string; text: string; rader: ArkRad[] };
  matDig: { eyebrow: string; rader: ArkRad[] };
  senaste: { eyebrow: string; rader: SenasteRad[]; historik: { text: string; href: string } };
}

export interface KatalogKortV4 extends KatalogKort {
  typ: TestTypId;
  ingarIPlan: boolean;
  /** Nivån med decimalkomma bredvid staplarna, null om typen inte är mätt. */
  nivaTal: string | null;
  ark: KatalogArk;
}

export interface KatalogV4 {
  mittTest: { titel: string; meta: string; href: string; andra: string } | null;
  /** "Ingår i Alva Logic · 1 del" */
  ingarRubrik: string | null;
  ingar: KatalogKortV4[];
  ovningsprov: { titel: string; meta: string; href: string; las: boolean } | null;
  /** "Används i andra rekryteringstest, inte i Alva Logic" eller "Alla testtyper". */
  flerRubrik: string;
  fler: KatalogKortV4[];
  personlighet: { titel: string; meta: string; href: string; gjord: boolean };
  /** Gratisraden längst ner, null med Premium. */
  gratis: { rubrik: string; text: string; knapp: string; href: string } | null;
}

export const MONSTER_RUBRIK = 'Öva på mönstret';

const forstaLiten = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Chipet för en handling: lås, metan ("1 kvar i dag", "Gratis en gång") eller inget. */
function chipFor(h: Pick<Handling, 'las' | 'meta'>): ArkChip | null {
  if (h.las) return { text: h.las.chip, ton: 'las' };
  if (h.meta) return { text: h.meta, ton: 'fri' };
  return null;
}

/** Ett låst val leder till appens köpvy, ett öppet till handlingens adress. */
function hrefFor(h: Pick<Handling, 'las' | 'href'>): string {
  return h.las ? APP_PREMIUM : h.href;
}

/** Kortets rad under namnet (webbens kortStatus). Nivån står i staplarna, aldrig i löptext. */
export function kortMeta(k: Pick<TesttypKort, 'id' | 'niva' | 'senasteNivakoll' | 'antalTraningar'>): string {
  if (k.niva.status === 'paborjad' && k.niva.svar) return TESTER.kort.paborjad(k.niva.svar.besvarade, k.niva.svar.antal);
  if (k.niva.status !== 'matt') return omattMeta(k.id);
  return k.senasteNivakoll ? TESTER.kort.matt(kortDatum(k.senasteNivakoll), k.antalTraningar) : TESTER.kort.mattUtanDatum(k.antalTraningar);
}

/** Staplarna grund, avancerad, expert: fyllda upp till zonen där nivån ligger. */
export function zonStaplar(niva: NivaLage): [boolean, boolean, boolean] {
  const v = niva.niva;
  if (v == null) return [false, false, false];
  const nadd = (z: Zon) => v >= ZON_GRANSER[z][0];
  return [nadd('grund'), nadd('avancerad'), nadd('expert')];
}

function senasteVarde(p: UtvecklingsPunkt): string {
  if (p.slag === 'ovningsprov') return p.resultat ? rattAv(p.resultat) : '';
  return p.niva != null ? nivaText(p.niva) : p.resultat ? rattAv(p.resultat) : '';
}

function arkFor(data: TesterV4Data, k: TesttypKort): KatalogArk {
  const meny = data.menyer[k.id];
  const premium = data.gratis.premium;
  const t = meny.trana;
  const tranaText = t.las ? `${t.etikett}, ${forstaLiten(t.las.chip)}` : t.meta ? `${t.etikett} · ${t.meta}` : t.etikett;

  const nk = meny.nivakoll;
  const nivakollRad: ArkRad = {
    titel: MAT_DIG.nivakollRubrik,
    meta: MAT_DIG.nivakollText(k.id),
    href: NIVAKOLL_FINNS[k.id] ? hrefFor(nk) : null,
    chip: nk.las || !nk.senaste ? chipFor(nk) : { text: `${kortDatum(nk.senaste.dag)} · ${nivaText(nk.senaste.niva)}`, ton: 'gjord' },
  };
  const senasteProv = meny.senaste.prov.at(-1) ?? null;
  const provRader: ArkRad[] = meny.ovningsprov.map((o, i) => ({
    titel: o.rubrik,
    meta: o.text,
    href: hrefFor(o),
    chip: o.las ? chipFor(o) : i === 0 && senasteProv ? { text: kortDatum(senasteProv.dag), ton: 'gjord' } : null,
  }));

  const senaste = [...meny.senaste.nivakoller.slice(-3), ...meny.senaste.prov.slice(-2)].map((p) => ({
    id: p.id,
    dag: kortDatum(p.dag),
    slag: p.slag === 'ovningsprov' ? TESTER.meny.ovningsprov : p.kalla === 'nivatest' ? TESTER.meny.nivatest : TESTER.meny.nivakoll,
    varde: senasteVarde(p),
    href: p.href,
  }));

  return {
    rad: meny.rad,
    niva: k.niva,
    trana: { eyebrow: TESTER.meny.trana, rubrik: t.rubrik, text: t.text, knapp: { text: tranaText, href: hrefFor(t), las: !!t.las } },
    monster: (meny.monster ?? []).map((m) => ({
      titel: m.namn,
      meta: `${m.ratt} av ${m.antal} rätt`,
      // Mönstret tränas i Träna, som ingår i Premium.
      href: premium ? m.href : APP_PREMIUM,
      chip: premium ? null : { text: LAS_CHIP.premiumKort, ton: 'las' },
    })),
    testa: {
      eyebrow: TESTA_DIG.eyebrow,
      rubrik: TESTA_DIG.rubrik,
      text: NIVAKOLL_FINNS[k.id] ? TESTA_DIG.text : TESTER.meny.testaTextNivatest,
      rader: meny.nivaer.map((n) => ({ titel: n.rubrik, meta: n.text, href: hrefFor(n), chip: chipFor(n) })),
    },
    matDig: { eyebrow: MAT_DIG.eyebrow, rader: [nivakollRad, ...provRader] },
    senaste: { eyebrow: TESTER.meny.senaste, rader: senaste, historik: { text: TESTER.meny.historik, href: utvecklingHref(k.id) } },
  };
}

function kortV4(data: TesterV4Data, k: TesttypKort): KatalogKortV4 {
  return {
    typ: k.id,
    namn: k.namn,
    alias: k.kallas,
    meta: kortMeta(k),
    nivaer: zonStaplar(k.niva),
    nivaTal: k.niva.niva != null && k.niva.status !== 'omatt' ? nivaText(k.niva.niva) : null,
    rader: [],
    ingarIPlan: k.ingarIPlan,
    ark: arkFor(data, k),
  };
}

/** Tester-fliken ur v4:s data: Mitt test, provets delar, övningsprovet, resten och personligheten. */
export function byggKatalogV4(data: TesterV4Data): KatalogV4 {
  const plan = data.plan;
  const synliga = data.typer.filter((k) => k.synlig && typSynlig(k.id));
  const iPlan = plan ? synliga.filter((k) => k.ingarIPlan) : [];
  const ovriga = plan ? synliga.filter((k) => !k.ingarIPlan) : synliga;

  let mittTest: KatalogV4['mittTest'] = null;
  if (plan) {
    const d = plan.dagarKvar;
    const meta = d != null && d > 0 ? (d === 1 ? '1 dag kvar' : `${d} dagar kvar`) : d === 0 ? 'Provet är i dag' : 'Inget datum';
    mittTest = { titel: `Mitt test: ${plan.namn}`, meta, href: PLAN_HREF, andra: TESTER.vagg.andra };
  }

  let ovningsprov: KatalogV4['ovningsprov'] = null;
  const forstaTyp = plan?.typer.find((t) => data.menyer[t]) ?? null;
  if (plan?.ovningsprov && iPlan.length) {
    const h = forstaTyp ? data.menyer[forstaTyp].ovningsprov[0] : undefined;
    const las = h ? !!h.las : !data.gratis.premium;
    ovningsprov = { titel: plan.ovningsprov.namn, meta: plan.ovningsprov.meta, href: las ? APP_PREMIUM : plan.ovningsprov.href, las };
  }

  const g = data.gratis;
  const kvar = g.grundKvarIdag > 0;
  const gratis: KatalogV4['gratis'] = g.premium
    ? null
    : {
        rubrik: kvar ? GRATISRAD.rubrikKvar : GRATISRAD.rubrikSlut,
        text: kvar
          ? 'Valfri testtyp. Där Nivåkollen finns gör du den en gång gratis. Genomgången av svaren är alltid öppen.'
          : 'Proven ligger på avancerad nivå. Träna, avancerad och expert, Nivåkollen när du vill och övningsprov ingår i Premium.',
        knapp: GRATISRAD.knapp,
        href: APP_PREMIUM,
      };

  return {
    mittTest,
    ingarRubrik: plan && iPlan.length ? ingarIDelar(plan.namn, plan.typer.length || iPlan.length) : null,
    ingar: iPlan.map((k) => kortV4(data, k)),
    ovningsprov,
    flerRubrik: plan && iPlan.length ? inteI(plan.namn) : TESTER.allaTyper,
    fler: ovriga.map((k) => kortV4(data, k)),
    personlighet: {
      titel: TESTER.personlighet.namn,
      meta: data.personlighet.gjord ? TESTER.personlighet.knappGjord : TESTER.personlighet.text,
      href: data.personlighet.href,
      gjord: data.personlighet.gjord,
    },
    gratis,
  };
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
