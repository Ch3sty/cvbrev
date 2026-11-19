// src/components/tester-v4/utveckling/geometri.ts
// =============================================================================
// Grafens geometri i Din utveckling (planen 3.4, skissens graf()). Ren: inga
// hooks, ingen DOM. Graf.tsx ritar det som räknas här.
//
//   - tidsaxeln från periodens start (Planen = plan.planStart) till i dag,
//     eller till provdagen när den ligger inom perioden
//   - nivåaxeln 1 till 10 med zonerna Grund, Avancerad, Expert
//   - en linje per testtyp med nivå; nivåkoll som ring, träning som punkt
//   - övningsprov som fyrkant på tidslinjen under grafen (räknas aldrig om
//     till nivå), träning utan nivå som punkt där, och nivåkoller som inte
//     räknas ("övning, räknas inte") som tom ring där, aldrig på linjen
//   - med plan: planens typer i koppar, övriga nedtonade grå
//   - gratis (historikLast): bara senaste punkten per typ
// =============================================================================

import { dagarMellan, laggTill, type Dag } from '@/lib/traning/datum';
import {
  TEST_TYP_ORDNING,
  ZON_GRANSER,
  type PlanV4,
  type TestTypId,
  type UtvecklingsPunkt,
} from '@/lib/tester/v4/typer';

export type Period = '4v' | 'plan' | 'allt';
export type TypVal = 'alla' | TestTypId;

export const PERIODER: readonly Period[] = ['4v', 'plan', 'allt'];

export function arPeriod(v: unknown): v is Period {
  return v === '4v' || v === 'plan' || v === 'allt';
}

/** Två viewBoxar, så att texten aldrig skalas (designsystemet 6, Instrument). */
export interface Matt {
  W: number;
  H: number;
  L: number;
  R: number;
  T: number;
  /** Nivåytans nederkant. */
  yBotten: number;
  /** Tidslinjens mitt. */
  yTid: number;
  /** Datumraden. */
  yDatum: number;
  /** Zonernas namn i grafen (bara dator; på mobil krockar de med linjerna och nivåbandet bär dem). */
  zonNamn: boolean;
}

export const MATT: Readonly<Record<'mobil' | 'dator', Matt>> = {
  mobil: { W: 380, H: 262, L: 28, R: 14, T: 22, yBotten: 196, yTid: 216, yDatum: 254, zonNamn: false },
  dator: { W: 880, H: 300, L: 32, R: 24, T: 24, yBotten: 232, yTid: 252, yDatum: 292, zonNamn: true },
};

export const NIVA_MIN = 1;
export const NIVA_MAX = 10;

/** Träffytan runt varje markör: 44 px på mobil (planen 3.4 punkt 2). */
export const TRAFF_R = 22;

export interface Granser {
  fran: Dag;
  till: Dag;
}

/** Hur långt fram provdagen får ligga för att 4 veckor ska ta med den. */
const PROV_INOM_4V = 14;

/**
 * Periodens gränser. 4 veckor: 27 dagar bakåt från i dag. Planen: från
 * planens startdag (aldrig från första nivåkollen). Allt: från första
 * punkten. Slutet är i dag, eller provdagen när den ligger framför och inom
 * perioden. Minst en vecka bred, så att en ensam punkt inte står på kanten.
 */
export function periodGranser(
  period: Period,
  in_: { idag: Dag; plan: PlanV4 | null; provdag: Dag | null; punkter: readonly UtvecklingsPunkt[] },
): Granser {
  const { idag, plan, provdag, punkter } = in_;
  const provFram = provdag && provdag > idag ? provdag : null;
  let fran: Dag;
  let till: Dag = idag;
  if (period === '4v') {
    fran = laggTill(idag, -27);
    if (provFram && dagarMellan(idag, provFram) <= PROV_INOM_4V) till = provFram;
  } else if (period === 'plan' && plan) {
    fran = plan.planStart < idag ? plan.planStart : laggTill(idag, -6);
    if (provFram) till = provFram;
  } else {
    const forsta = punkter.reduce<Dag | null>((m, p) => (m == null || p.dag < m ? p.dag : m), null);
    fran = forsta && forsta < idag ? forsta : idag;
    if (provFram) till = provFram;
  }
  if (dagarMellan(fran, till) < 6) fran = laggTill(till, -6);
  return { fran, till };
}

/** Punkterna som syns: inom perioden, och för gratis bara den senaste per typ. */
export function synligaPunkter(
  punkter: readonly UtvecklingsPunkt[],
  granser: Granser | null,
  historikLast: boolean,
): UtvecklingsPunkt[] {
  let ut = punkter.filter((p) => !granser || (p.dag >= granser.fran && p.dag <= granser.till));
  if (historikLast) {
    const senaste = new Map<TestTypId, UtvecklingsPunkt>();
    for (const p of ut) {
      const f = senaste.get(p.typ);
      if (!f || p.dag >= f.dag) senaste.set(p.typ, p);
    }
    ut = ut.filter((p) => senaste.get(p.typ) === p);
  }
  return sortera(ut);
}

const typIndex = (t: TestTypId) => TEST_TYP_ORDNING.indexOf(t);
const SLAG_ORDNING = { nivakoll: 0, trana: 1, ovningsprov: 2 } as const;

/** Tidsordning, sedan testtypens ordning, sedan slag. Samma ordning som tangentbordet går. */
export function sortera(punkter: readonly UtvecklingsPunkt[]): UtvecklingsPunkt[] {
  return [...punkter].sort(
    (a, b) =>
      (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0) ||
      typIndex(a.typ) - typIndex(b.typ) ||
      SLAG_ORDNING[a.slag] - SLAG_ORDNING[b.slag] ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );
}

/** Står punkten på nivåaxeln? Annars ritas den på tidslinjen. */
export function paNivaaxeln(p: UtvecklingsPunkt): boolean {
  return p.slag !== 'ovningsprov' && p.niva != null && p.raknas;
}

export type Ton = 'koppar' | 'neutral' | 'serie';

export interface Markor {
  punkt: UtvecklingsPunkt;
  x: number;
  y: number;
  form: 'ring' | 'punkt' | 'fyrkant' | 'tomring';
  paLinjen: boolean;
  ton: Ton;
  /** Nedtonad: annan typ än den valda, inte valbar. */
  dold: boolean;
}

export interface Linje {
  typ: TestTypId;
  d: string;
  ton: Ton;
  /** Planens typ eller den valda: tjockare och ritad sist. */
  fram: boolean;
  dold: boolean;
  /** Ändpunktens etikett (planens typer, eller den valda typen). */
  etikett: { x: number; y: number; text: string } | null;
}

export interface GrafModell {
  matt: Matt;
  granser: Granser;
  linjer: Linje[];
  /** Ritordning: nedtonade först, sedan övriga, sist planens. */
  markorer: Markor[];
  /** De valbara, i tangentbordets ordning. */
  valbara: Markor[];
  yTicks: { v: number; y: number }[];
  zoner: { namn: 'grund' | 'avancerad' | 'expert'; yTopp: number; yBotten: number }[];
  idagX: number;
  provX: number | null;
  datum: { x: number; text: Dag; anchor: 'start' | 'middle' | 'end'; slag: 'start' | 'idag' | 'prov' }[];
  /** Typerna som har en linje eller markör, för legenden. */
  typerMedData: TestTypId[];
}

export function skalor(matt: Matt, granser: Granser) {
  const span = Math.max(1, dagarMellan(granser.fran, granser.till));
  const X = (dag: Dag) => matt.L + (dagarMellan(granser.fran, dag) / span) * (matt.W - matt.L - matt.R);
  const Y = (v: number) => {
    const k = Math.min(NIVA_MAX, Math.max(NIVA_MIN, v));
    return matt.T + (1 - (k - NIVA_MIN) / (NIVA_MAX - NIVA_MIN)) * (matt.yBotten - matt.T);
  };
  return { X, Y };
}

const avrunda = (v: number) => Math.round(v * 10) / 10;

export function nivaText(v: number): string {
  return (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
}

export interface ByggIn {
  idag: Dag;
  plan: PlanV4 | null;
  provdag: Dag | null;
  punkter: readonly UtvecklingsPunkt[];
  historikLast: boolean;
  typVal: TypVal;
  period: Period;
  bredd: 'mobil' | 'dator';
}

export function byggGraf(in_: ByggIn): GrafModell {
  const matt = MATT[in_.bredd];
  const period: Period = in_.period === 'plan' && !in_.plan ? 'allt' : in_.period;
  const granser = periodGranser(period, in_);
  const { X, Y } = skalor(matt, granser);
  const synliga = synligaPunkter(in_.punkter, granser, in_.historikLast);
  const planTyper = new Set(in_.plan?.typer ?? []);
  const harPlan = !!in_.plan;

  const tonFor = (t: TestTypId): Ton => (harPlan ? (planTyper.has(t) ? 'koppar' : 'neutral') : 'serie');
  const dold = (t: TestTypId) => in_.typVal !== 'alla' && in_.typVal !== t;
  const fram = (t: TestTypId) => in_.typVal === t || (in_.typVal === 'alla' && planTyper.has(t));

  const perTyp = new Map<TestTypId, UtvecklingsPunkt[]>();
  for (const p of synliga) {
    const l = perTyp.get(p.typ) ?? [];
    l.push(p);
    perTyp.set(p.typ, l);
  }
  const typerMedData = TEST_TYP_ORDNING.filter((t) => perTyp.has(t));

  const linjer: Linje[] = [];
  for (const t of typerMedData) {
    const pa = (perTyp.get(t) ?? []).filter(paNivaaxeln);
    if (!pa.length) continue;
    const d = pa.map((p, i) => `${i ? 'L' : 'M'}${avrunda(X(p.dag))} ${avrunda(Y(p.niva as number))}`).join('');
    const sista = pa[pa.length - 1];
    const visaEtikett = !dold(t) && (in_.typVal === t || (in_.typVal === 'alla' && planTyper.has(t)));
    linjer.push({
      typ: t,
      d: pa.length > 1 ? d : '',
      ton: tonFor(t),
      fram: fram(t),
      dold: dold(t),
      etikett: visaEtikett
        ? { x: avrunda(X(sista.dag)), y: avrunda(Y(sista.niva as number)), text: nivaText(sista.niva as number) }
        : null,
    });
  }

  // Punkter på tidslinjen samma dag och typ läggs bredvid varandra, inte på varandra.
  const tidSteg = new Map<string, number>();
  const markorer: Markor[] = synliga.map((p) => {
    const pa = paNivaaxeln(p);
    let x = X(p.dag);
    if (!pa) {
      const nyckel = `${p.dag}`;
      const n = tidSteg.get(nyckel) ?? 0;
      tidSteg.set(nyckel, n + 1);
      x += n * 9;
    }
    // Ringen betyder Nivåkoll (förklaringen under grafen). Nivån ur ett fast
    // nivåtest (talserier, spatial, ordförråd: kalla 'nivatest') ritas som punkt.
    const form: Markor['form'] =
      p.slag === 'ovningsprov'
        ? 'fyrkant'
        : p.slag === 'nivakoll' && p.kalla !== 'nivatest'
          ? (p.raknas ? 'ring' : 'tomring')
          : 'punkt';
    return {
      punkt: p,
      x: avrunda(x),
      y: avrunda(pa ? Y(p.niva as number) : matt.yTid),
      form,
      paLinjen: pa,
      ton: tonFor(p.typ),
      dold: dold(p.typ),
    };
  });
  const rang = (m: Markor) => (m.dold ? 0 : fram(m.punkt.typ) ? 2 : 1);
  const ritordning = [...markorer].sort((a, b) => rang(a) - rang(b));
  const valbara = markorer.filter((m) => !m.dold);

  const yTicks = [1, 4, 7, 10].map((v) => ({ v, y: avrunda(Y(v)) }));
  const zoner = (['grund', 'avancerad', 'expert'] as const).map((namn) => ({
    namn,
    yTopp: avrunda(Y(ZON_GRANSER[namn][1])),
    yBotten: avrunda(Y(ZON_GRANSER[namn][0])),
  }));

  const idagX = avrunda(X(in_.idag));
  const provX = in_.provdag && in_.provdag >= granser.fran && in_.provdag <= granser.till ? avrunda(X(in_.provdag)) : null;
  const datum: GrafModell['datum'] = [{ x: avrunda(X(granser.fran)), text: granser.fran, anchor: 'start', slag: 'start' }];
  const plotW = matt.W - matt.L - matt.R;
  if (in_.idag !== granser.fran) {
    // "i dag" står till höger om startdatumet; nära provdagen hänger det åt vänster.
    const nara = provX != null && provX - idagX < 64;
    datum.push({ x: idagX, text: in_.idag, anchor: nara ? 'end' : idagX > matt.L + plotW - 24 ? 'end' : 'middle', slag: 'idag' });
  }
  if (provX != null && in_.provdag !== in_.idag) datum.push({ x: provX, text: in_.provdag as Dag, anchor: 'end', slag: 'prov' });
  // Startdatumet viker när "i dag" står för nära.
  const idagD = datum.find((d) => d.slag === 'idag');
  if (idagD && idagD.anchor === 'middle' && idagD.x - datum[0].x < 70) datum.shift();

  return {
    matt,
    granser,
    linjer: [...linjer].sort((a, b) => Number(!a.dold) - Number(!b.dold) || Number(a.fram) - Number(b.fram)),
    markorer: ritordning,
    valbara,
    yTicks,
    zoner,
    idagX,
    provX,
    datum,
    typerMedData,
  };
}

/** Nästa valbara punkt med piltangenterna. */
export function nastaIndex(nu: number, antal: number, tangent: string): number | null {
  if (!antal) return null;
  switch (tangent) {
    case 'ArrowRight':
    case 'ArrowDown':
      return Math.min(antal - 1, nu + 1);
    case 'ArrowLeft':
    case 'ArrowUp':
      return Math.max(0, nu - 1);
    case 'Home':
      return 0;
    case 'End':
      return antal - 1;
    default:
      return null;
  }
}
