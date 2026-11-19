// src/lib/tester/v4/modell.ts
// Bygger TesterV4Data och UtvecklingV4Data ur ett normaliserat underlag.
// Samma funktioner används av hamta.server.ts (databasen) och fixturer.ts
// (skissens tal), så att vyerna ser exakt samma form i förhandsvisningen
// som i produktion. Ren.

import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum';
import { DELTYP_NAMN } from '@/lib/traning/mittTest';
import { byggBana } from './bana';
import { ETIKETT, FORTSATT, KALLAS, MAT_DIG, TRANA, ZON_RUBRIK, ingarI, nivaRadText } from './copy';
import { lasNivaTest, lasNivakoll, lasOvningsprov, lasTrana } from './gratis';
import { byggHintar, type HintTypIn } from './hintar';
import { nivaLage } from './niva-lage';
import { NIVAKOLL_FINNS, PERSONLIGHET_HREF, menyHref, nivaTestHref, nivakollHrefV4, ovningsprovHrefV4, tranaHref } from './rutter';
import {
  TEST_TYP_ORDNING,
  type BanaDag,
  type DagsmalLage,
  type Fortsatt,
  type Gratislage,
  type Handling,
  type Paketinfo,
  type PlanV4,
  type TestTypId,
  type TesterV4Data,
  type TesttypKort,
  type TypMeny,
  type UtvecklingV4Data,
  type UtvecklingsPunkt,
  type Zon,
} from './typer';

export interface TypUnderlag {
  /** Typens punkter i tidsordning (alla, även när historiken är låst). */
  punkter: UtvecklingsPunkt[];
  paborjad: { besvarade: number; antal: number } | null;
  svagaste: { namn: string; family: string; ratt: number; antal: number } | null;
  /** Mönstren för "Öva på mönstret", svagast först. */
  monster: { namn: string; family: string; ratt: number; antal: number }[];
  /** Andel svar över provets tid, 0 till 1. */
  tempo: number | null;
  synlig: boolean;
  /** Någon slutförd session i typen, även nivåtest. */
  provad: boolean;
  /** Nivåkollen finns för typen (A7 för talserie, spatial, ordförråd). */
  nivakollFinns?: boolean;
}

export interface ModellIn {
  idag: Dag;
  plan: PlanV4 | null;
  typer: Record<TestTypId, TypUnderlag>;
  gratis: Gratislage;
  dagsmal: DagsmalLage;
  /** Dagar med minst en slutförd session, för banan. */
  aktivaDagar: readonly Dag[];
  personlighet: { gjord: boolean };
  paket: Paketinfo;
  matrisMonster: UtvecklingV4Data['matrisMonster'];
}

const ZONER: readonly Zon[] = ['grund', 'avancerad', 'expert'];

function ordning(plan: PlanV4 | null): TestTypId[] {
  if (!plan) return [...TEST_TYP_ORDNING];
  return [...plan.typer.filter((t) => TEST_TYP_ORDNING.includes(t)), ...TEST_TYP_ORDNING.filter((t) => !plan.typer.includes(t))];
}

/** Senaste punkten av slaget. Nivåtestets skattning (kalla 'nivatest') är ingen Nivåkoll. */
function senasteAv(punkter: readonly UtvecklingsPunkt[], slag: UtvecklingsPunkt['slag'], raknas = true): UtvecklingsPunkt | null {
  for (let i = punkter.length - 1; i >= 0; i--) {
    const p = punkter[i];
    if (p.slag === slag && (!raknas || p.raknas) && p.kalla !== 'nivatest') return p;
  }
  return null;
}

function nivakollFinns(typ: TestTypId, u: TypUnderlag): boolean {
  return u.nivakollFinns ?? NIVAKOLL_FINNS[typ];
}

function handlingNivakoll(typ: TestTypId, u: TypUnderlag, g: Gratislage): Handling {
  return { slag: 'nivakoll', etikett: ETIKETT.matDinNiva, href: nivakollHrefV4(typ) ?? menyHref(typ), ...lasNivakoll(g, typ) };
}

function handlingTrana(typ: TestTypId, g: Gratislage, familj?: string | null): Handling {
  return { slag: 'trana', etikett: ETIKETT.trana, href: tranaHref(typ, familj), las: lasTrana(g) };
}

function handlingNivaTest(typ: TestTypId, zon: Zon, g: Gratislage): Handling {
  return { slag: 'niva_test', etikett: ZON_RUBRIK[zon], href: nivaTestHref(typ, zon), zon, ...lasNivaTest(g, zon) };
}

/** Primärknappen på kortet: Träna; Mät din nivå om omätt; Grundnivå för gratis. */
function primar(typ: TestTypId, u: TypUnderlag, g: Gratislage, lage: TesttypKort['niva']): Handling {
  if (lage.status !== 'matt' && nivakollFinns(typ, u) && !(g.nivakollGjord[typ] && !g.premium)) {
    return { ...handlingNivakoll(typ, u, g), etikett: lage.status === 'paborjad' ? ETIKETT.fortsatt : ETIKETT.matDinNiva };
  }
  if (!g.premium) return handlingNivaTest(typ, 'grund', g);
  if (lage.status !== 'matt' && !nivakollFinns(typ, u)) return handlingNivaTest(typ, 'grund', g);
  return handlingTrana(typ, g);
}

function byggMeny(typ: TestTypId, u: TypUnderlag, plan: PlanV4 | null, g: Gratislage): TypMeny {
  const iPlan = !!plan && plan.typer.includes(typ);
  const rad = iPlan && plan ? `${ingarI(plan.namn)}.${plan.format ? ` ${plan.format}` : ''}` : KALLAS[typ];
  const nk = senasteAv(u.punkter, 'nivakoll');
  // Riktiga Nivåkoller och, för typerna utan, nivåtestens mätningar (märkta kalla 'nivatest').
  const nivakoller = u.punkter.filter((p) => p.slag === 'nivakoll').slice(-3);
  const prov = u.punkter.filter((p) => p.slag === 'ovningsprov').slice(-2);

  const ovningsprov: TypMeny['ovningsprov'] = [];
  if (iPlan && plan?.ovningsprov) {
    ovningsprov.push({ slag: 'ovningsprov', etikett: ETIKETT.ovningsprov, href: plan.ovningsprov.href, las: lasOvningsprov(g), rubrik: plan.ovningsprov.namn, text: MAT_DIG.ovningsprovText(plan.ovningsprov.meta) });
  } else {
    const href = ovningsprovHrefV4(typ);
    if (href) {
      ovningsprov.push({
        slag: 'ovningsprov',
        etikett: ETIKETT.ovningsprov,
        href,
        las: lasOvningsprov(g),
        rubrik: typ === 'matris' ? MAT_DIG.ovningsprovMatris : MAT_DIG.ovningsprovTyp,
        text: typ === 'matris' ? MAT_DIG.ovningsprovMatrisText : MAT_DIG.ovningsprovTypText,
      });
    }
  }

  const nivakoll: TypMeny['nivakoll'] = {
    ...handlingNivakoll(typ, u, g),
    senaste: nk && nk.niva != null ? { dag: nk.dag, niva: nk.niva } : null,
  };
  if (!nivakollFinns(typ, u)) nivakoll.las = { skal: 'premium', chip: 'Kommer snart' };

  const lage = nivaLage(u.punkter, u.paborjad);
  return {
    typ,
    rad,
    trana: {
      ...handlingTrana(typ, g),
      // Omätt typ: Nivåkollen först, för gratis (en gång) och Premium.
      ...(lage.status !== 'matt' && nivakollFinns(typ, u) && (g.premium || !g.nivakollGjord[typ])
        ? { slag: 'nivakoll' as const, etikett: TRANA.forstNivakoll, href: nivakoll.href, las: nivakoll.las, ...(nivakoll.meta ? { meta: nivakoll.meta } : {}) }
        : {}),
      rubrik: TRANA.rubrik,
      text: TRANA.text(u.svagaste?.namn ?? null),
    },
    nivaer: ZONER.map((zon) => ({ ...handlingNivaTest(typ, zon, g), zon, rubrik: ZON_RUBRIK[zon], text: nivaRadText(typ, zon) })),
    nivakoll,
    ovningsprov,
    senaste: { nivakoller, prov },
    monster: u.monster.length
      ? u.monster.map((m) => ({ namn: m.namn, ratt: m.ratt, antal: m.antal, href: tranaHref(typ, m.family) }))
      : null,
  };
}

function antalSedan(punkter: readonly UtvecklingsPunkt[], dag: Dag | null): number {
  return punkter.filter((p) => p.slag === 'trana' && (!dag || p.dag >= dag)).length;
}

function synligaPunkter(punkter: readonly UtvecklingsPunkt[], last: boolean): UtvecklingsPunkt[] {
  return last ? punkter.slice(-1) : [...punkter];
}

export function byggTesterV4(inp: ModellIn): TesterV4Data {
  const { plan, gratis: g } = inp;
  const typer: TesttypKort[] = [];
  const menyer = {} as Record<TestTypId, TypMeny>;
  const hintIn: HintTypIn[] = [];

  for (const typ of ordning(plan)) {
    const u = inp.typer[typ];
    const lage = nivaLage(u.punkter, u.paborjad);
    const nk = senasteAv(u.punkter, 'nivakoll');
    typer.push({
      id: typ,
      namn: DELTYP_NAMN[typ],
      kallas: KALLAS[typ],
      ingarIPlan: !!plan && plan.typer.includes(typ),
      niva: lage,
      senasteNivakoll: nk?.dag ?? null,
      senasteTraning: senasteAv(u.punkter, 'trana', false)?.dag ?? null,
      antalTraningar: u.punkter.filter((p) => p.slag === 'trana').length,
      primar: primar(typ, u, g, lage),
      synlig: u.synlig,
    });
    menyer[typ] = byggMeny(typ, u, plan, g);
  }
  for (const typ of TEST_TYP_ORDNING) {
    const u = inp.typer[typ];
    const nk = senasteAv(u.punkter, 'nivakoll');
    hintIn.push({
      typ,
      niva: nivaLage(u.punkter, u.paborjad),
      senasteNivakoll: nk?.dag ?? null,
      traningarSedanNivakoll: antalSedan(u.punkter, nk?.dag ?? null),
      svagaste: u.svagaste,
      tempo: u.tempo,
      nivakollFinns: nivakollFinns(typ, u),
      provad: u.provad,
      synlig: u.synlig,
    });
  }

  const allaPunkter = TEST_TYP_ORDNING.flatMap((t) => inp.typer[t].punkter).sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));
  const senaste = [...allaPunkter].reverse().find((p) => p.slag === 'trana') ?? allaPunkter[allaPunkter.length - 1] ?? null;
  const fortsatt: Fortsatt | null = senaste
    ? { punkt: senaste, rubrik: senaste.slag === 'trana' ? FORTSATT.trana(senaste.typ) : senaste.slag === 'nivakoll' ? FORTSATT.nivakoll(senaste.typ) : FORTSATT.ovningsprov(senaste.provNamn ?? 'Övningsprov') }
    : null;

  return {
    idag: inp.idag,
    plan,
    bana: banaFor(inp),
    typer,
    menyer,
    hintar: byggHintar({ idag: inp.idag, plan, typer: hintIn, premium: g.premium, nivakollGjord: g.nivakollGjord, grundKvarIdag: g.grundKvarIdag }),
    gratis: g,
    dagsmal: inp.dagsmal,
    fortsatt,
    personlighet: { gjord: inp.personlighet.gjord, href: PERSONLIGHET_HREF },
    paket: inp.paket,
    kurva: kurvaFor(inp),
    aktivaDagar: [...new Set(inp.aktivaDagar)].filter((d) => d >= laggTill(inp.idag, -13) && d <= inp.idag).sort(),
  };
}

/**
 * Väggens bana, samma på Hem, Tester och Din utveckling: planens start till
 * provdagen, ur samma underlag (ingen egen läsning). Tom utan plan.
 */
function banaFor(inp: ModellIn): BanaDag[] {
  const { plan } = inp;
  if (!plan) return [];
  const senasteNivakollPlan =
    plan.typer
      .map((t) => senasteAv(inp.typer[t]?.punkter ?? [], 'nivakoll')?.dag ?? null)
      .filter((d): d is Dag => !!d)
      .sort()
      .pop() ?? null;
  return byggBana({ planStart: plan.planStart, provdatum: plan.provdatum, idag: inp.idag, gjordaDagar: inp.aktivaDagar, senasteNivakoll: senasteNivakollPlan });
}

/** Dagar i Hems minigraf, i dag inräknat. */
export const KURVA_DAGAR = 28;

/** Hems minigraf: de synliga typernas punkter de senaste 28 dagarna. */
function kurvaFor(inp: ModellIn): UtvecklingsPunkt[] {
  const last = !inp.gratis.premium && !inp.gratis.harHistorik;
  const fran = laggTill(inp.idag, -(KURVA_DAGAR - 1));
  return TEST_TYP_ORDNING.filter((t) => inp.typer[t].synlig)
    .flatMap((t) => synligaPunkter(inp.typer[t].punkter, last))
    .filter((p) => p.dag >= fran && p.dag <= inp.idag)
    .sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));
}

export function byggUtvecklingV4(inp: ModellIn): UtvecklingV4Data {
  const { plan, gratis: g } = inp;
  const last = !g.premium && !g.harHistorik;
  const typer = ordning(plan).map((typ) => ({
    id: typ,
    namn: DELTYP_NAMN[typ],
    ingarIPlan: !!plan && plan.typer.includes(typ),
    niva: nivaLage(inp.typer[typ].punkter, inp.typer[typ].paborjad),
  }));
  const punkter = TEST_TYP_ORDNING.flatMap((t) => synligaPunkter(inp.typer[t].punkter, last)).sort((a, b) =>
    a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0
  );
  return {
    idag: inp.idag,
    plan,
    bana: banaFor(inp),
    typer,
    punkter,
    historikLast: last,
    provdag: plan?.provdatum ?? null,
    matrisMonster: inp.matrisMonster,
    gratis: g,
    paket: inp.paket,
  };
}

/** Dagar kvar till provet, eller null. */
export function dagarKvar(provdatum: Dag | null, idag: Dag): number | null {
  return provdatum ? dagarMellan(idag, provdatum) : null;
}



