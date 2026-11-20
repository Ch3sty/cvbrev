// src/lib/mobilapp/utveckling.ts
// =============================================================================
// Appens Utveckling-flik ur v4:s modell (UtvecklingV4Data). Ren: räknar fram
// vilken typ kurvan visar, kurvans geometri (v4:s geometri.ts, en typ i
// taget), raderna i Nivå per testtyp, tomlägets knapp, tempot och märkena.
//
// Reglerna är webbens: nivån ur typer[].niva (taket och nivåtestets nivå
// ligger redan i nivaLage), punkterna ur data.punkter (gratis: bara den
// senaste per typ), Nivåkollen gratis en gång per typ och ett grundnivåtest
// om dagen. En knapp leder aldrig gratis till en betalvägg.
// =============================================================================

import { dagAvPlan } from '@/lib/tester/v4/bana';
import { NIVA_TEST_ANTAL, META } from '@/lib/tester/v4/copy';
import { menyHref, nivaTestHref, nivakollHrefV4, omattMeta } from '@/lib/tester/v4/rutter';
import { TEST_TYP_ORDNING, arTestTypId, type Gratislage, type NivaLage, type PlanV4, type TestTypId, type UtvecklingV4Data, type UtvecklingsPunkt } from '@/lib/tester/v4/typer';
import { byggGraf, paNivaaxeln, type GrafModell } from '@/components/tester-v4/utveckling/geometri';
import type { MilstolpeNyckel } from '@/lib/traning/milstolpar';
import type { Dag } from '@/lib/traning/datum';

/* ------------------------------------------------------------ start */

export interface Start {
  slag: 'nivakoll' | 'nivatest' | 'meny';
  href: string;
}

/**
 * Var en typ börjar: Nivåkollen där den finns och är fri (Premium, eller
 * inte gjord i typen), annars grundnivåns nivåtest i typer utan Nivåkoll när
 * dagens gratistest finns kvar. Null när båda vore en betalvägg för gratis.
 */
export function startFor(typ: TestTypId, g: Pick<Gratislage, 'premium' | 'nivakollGjord' | 'grundKvarIdag'>): Start | null {
  const nk = nivakollHrefV4(typ);
  if (nk) return g.premium || !g.nivakollGjord[typ] ? { slag: 'nivakoll', href: nk } : null;
  return g.premium || g.grundKvarIdag > 0 ? { slag: 'nivatest', href: nivaTestHref(typ, 'grund') } : null;
}

/** Planens typer först, sedan v4:s ordning. */
export function typOrdning(plan: Pick<PlanV4, 'typer'> | null): TestTypId[] {
  const p = plan?.typer ?? [];
  return [...p, ...TEST_TYP_ORDNING.filter((t) => !p.includes(t))];
}

/**
 * Tomlägets knapp. Första typen i planen som inte är mätt (som webben), och
 * dess Nivåkoll eller grundnivåtest. Är den vägen stängd för gratis tas nästa
 * typ i ordningen; sist typens meny i Tester, som aldrig är en betalvägg.
 */
export function tomStart(data: Pick<UtvecklingV4Data, 'plan' | 'typer' | 'gratis'>, synlig: (t: TestTypId) => boolean = () => true): Start & { typ: TestTypId } {
  const plan = data.plan;
  const matt = (t: TestTypId) => data.typer.find((x) => x.id === t)?.niva.status === 'matt';
  const forsta: TestTypId = plan?.typer.find((t) => !matt(t)) ?? plan?.typer[0] ?? 'matris';
  const ordning = [forsta, ...typOrdning(plan).filter((t) => t !== forsta)].filter((t) => t === forsta || synlig(t));
  for (const t of ordning) {
    const s = startFor(t, data.gratis);
    if (s) return { ...s, typ: t };
  }
  return { slag: 'meny', href: menyHref(forsta), typ: forsta };
}

/* ------------------------------------------------------------ vald typ */

/** Typen i kurvan: ?typ= när den är giltig, annars första mätta, annars första med punkter. */
export function valdTyp(data: Pick<UtvecklingV4Data, 'typer' | 'punkter' | 'plan'>, typParam: unknown, synlig: (t: TestTypId) => boolean = () => true): TestTypId | null {
  const param = Array.isArray(typParam) ? typParam[0] : typParam;
  if (arTestTypId(param) && synlig(param)) return param;
  const ordning = data.typer.map((t) => t.id).filter(synlig);
  return (
    ordning.find((t) => data.typer.find((x) => x.id === t)?.niva.status === 'matt') ??
    ordning.find((t) => data.punkter.some((p) => p.typ === t)) ??
    null
  );
}

/* ------------------------------------------------------------ kurvan */

/** Kurvans modell för en typ: v4:s geometri, mobilens mått, hela perioden. */
export function kurvaFor(data: Pick<UtvecklingV4Data, 'idag' | 'plan' | 'provdag' | 'punkter' | 'historikLast'>, typ: TestTypId): GrafModell {
  return byggGraf({
    idag: data.idag,
    plan: data.plan,
    provdag: data.provdag,
    punkter: data.punkter.filter((p) => p.typ === typ),
    historikLast: data.historikLast,
    typVal: typ,
    period: 'allt',
    bredd: 'mobil',
  });
}

/** Punkterna på nivåaxeln för en typ, i tidsordning. */
export function axelPunkter(punkter: readonly UtvecklingsPunkt[], typ: TestTypId): UtvecklingsPunkt[] {
  return punkter.filter((p) => p.typ === typ && paNivaaxeln(p)).sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0));
}

/** "Dag N av M" från planens start, bara med provdatum som inte passerat. */
export function dagAv(plan: Pick<PlanV4, 'planStart' | 'provdatum'> | null, idag: Dag): { dag: number; av: number } | null {
  if (!plan?.provdatum || plan.provdatum < idag) return null;
  return dagAvPlan(plan.planStart, plan.provdatum, idag);
}

/** Kommer nivån ur ett fast nivåtest (talserier, spatial, ordförråd)? Samma val som nivaLage. */
export function nivaUrNivatest(punkter: readonly UtvecklingsPunkt[], typ: TestTypId): boolean {
  const egna = punkter.filter((p) => p.typ === typ && p.niva != null && p.raknas && p.slag !== 'ovningsprov');
  return egna.length > 0 && egna.every((p) => p.kalla === 'nivatest');
}

/* ------------------------------------------------------------ nivå per testtyp */

export interface TypRad {
  id: TestTypId;
  namn: string;
  ingarIPlan: boolean;
  niva: NivaLage;
  /** Talet eller läget i ord, till höger. */
  text: string;
  /** Väljer typen i kurvan, eller startar den när inget finns. */
  href: string | null;
  vald: boolean;
}

/**
 * Raderna: med plan planens typer och övriga som har något att visa; utan
 * plan alla synliga typer. Nivån ur typer[].niva (taket och nivåtestet ingår).
 */
export function typRader(data: Pick<UtvecklingV4Data, 'typer' | 'plan' | 'punkter' | 'gratis'>, vald: TestTypId | null, synlig: (t: TestTypId) => boolean = () => true): TypRad[] {
  const harPunkter = (t: TestTypId) => data.punkter.some((p) => p.typ === t);
  return data.typer
    .filter((t) => synlig(t.id) && (!data.plan || t.ingarIPlan || t.niva.status !== 'omatt' || harPunkter(t.id)))
    .map((t) => {
      let text: string;
      let href: string | null = harPunkter(t.id) ? `?typ=${t.id}` : null;
      if (t.niva.status === 'matt' && t.niva.niva != null) {
        text = nivaText(t.niva.niva) + (nivaUrNivatest(data.punkter, t.id) ? ' ur nivåtestet' : '');
      } else if (t.niva.status === 'paborjad') {
        text = t.niva.svar ? `${t.niva.svar.besvarade} av ${t.niva.svar.antal} svar` : META.nivakollPaborjad;
        href = nivakollHrefV4(t.id) ?? href;
      } else {
        const s = startFor(t.id, data.gratis);
        text = s?.slag === 'nivakoll' ? omattMeta(t.id) : s?.slag === 'nivatest' ? `Nivåtest, ${NIVA_TEST_ANTAL[t.id].grund} uppgifter` : 'inte mätt än';
        href = href ?? s?.href ?? null;
      }
      return { id: t.id, namn: t.namn, ingarIPlan: t.ingarIPlan, niva: t.niva, text, href, vald: t.id === vald };
    });
}

export function nivaText(v: number): string {
  return (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
}

/* ------------------------------------------------------------ tempo */

export interface Tempo {
  punkt: UtvecklingsPunkt;
  over: number;
  antal: number;
}

/** Senaste punkten i typen med tid mot provets tid. */
export function tempoFor(punkter: readonly UtvecklingsPunkt[], typ: TestTypId): Tempo | null {
  let bast: UtvecklingsPunkt | null = null;
  for (const p of punkter) {
    if (p.typ !== typ || p.overTid == null || !p.resultat?.antal) continue;
    if (!bast || p.dag >= bast.dag) bast = p;
  }
  if (!bast || !bast.resultat) return null;
  const antal = bast.resultat.antal;
  return { punkt: bast, antal, over: Math.min(antal, Math.round((bast.overTid as number) * antal)) };
}

/* ------------------------------------------------------------ märkena */

export interface MarkenIn {
  /** Motorns märken (redan filtrerade av giltigaMilstolpar). */
  milstolpar: readonly { nyckel: string }[];
  /** Alla punkter, även när historiken är låst. */
  allaPunkter: readonly UtvecklingsPunkt[];
  plan: Pick<PlanV4, 'provdatum'> | null;
  idag: Dag;
  nivakollGjord: Partial<Record<TestTypId, boolean>>;
}

/**
 * Märkena i v4: motorns rader gäller, och v4:s punkter i alla typer räknas
 * med. Första nivåkollen: en Nivåkoll i någon typ (aldrig ett nivåtest).
 * Nivån upp: första hela nivån över typens första punkt (5,0 vid 6,0, 6,3 vid
 * 7,0). Övningsprovet: något övningsprov. Provdagen: dagen efter provdatumet.
 * Första veckan räknas bara av motorn.
 */
export function markenV4(inp: MarkenIn): Set<MilstolpeNyckel> {
  const ut = new Set<MilstolpeNyckel>();
  for (const m of inp.milstolpar) ut.add(m.nyckel as MilstolpeNyckel);
  const p = inp.allaPunkter;
  if (Object.values(inp.nivakollGjord).some(Boolean) || p.some((x) => x.slag === 'nivakoll' && x.kalla !== 'nivatest')) ut.add('forsta_matningen');
  if (p.some((x) => x.slag === 'ovningsprov')) ut.add('generalrepetitionen');
  for (const t of TEST_TYP_ORDNING) {
    const axel = axelPunkter(p, t);
    if (axel.length < 2) continue;
    const grans = Math.floor((axel[0].niva as number) + 1e-9) + 1;
    if (axel.slice(1).some((x) => (x.niva as number) >= grans - 1e-9)) {
      ut.add('nivan_upp');
      break;
    }
  }
  if (inp.plan?.provdatum && inp.idag > inp.plan.provdatum) ut.add('provdagen');
  else ut.delete('provdagen');
  return ut;
}
