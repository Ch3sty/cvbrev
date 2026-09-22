/**
 * Rena beräkningar för Flöde (D3). Inga serverberoenden, så filen går att
 * testa utan att mocka Supabase, Stripe eller Next-cachen. data.ts hämtar
 * och anropar funktionerna här.
 */

import { FUNNEL_STEG, manadsbeloppOre, type DagligaMetrik, type PaketNyckel } from '@/lib/admin/collect';
import { FEATURES, suggestPlan, type Feature } from '@/lib/access/features';
import { PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans';
import { KOM_IGANG_LISTA, brickaText, type BrickaKey } from '@/lib/onboarding/komigang';
import type { AdminSerieRoll } from '@/components/admin/AdminChart';

/** De tre paketen som säljs. */
export type Paket = 'cv' | 'tester' | 'allt';
export const PAKETEN: readonly Paket[] = ['cv', 'tester', 'allt'];

export const PAKET_NAMN: Record<Paket, string> = {
  cv: 'CV-veckan',
  tester: 'Testveckan',
  allt: 'Allt',
};

/**
 * Färgen följer paketet på alla fem diagram, aldrig rangordningen. Tre
 * inktoner ur designsystemet: Allt är mörkast eftersom det är det paket
 * vi rekommenderar, CV-veckan mellantonen, Testveckan den ljusa. Den ljusa
 * ligger under 3:1 mot panelen, så varje diagram bär etiketter och
 * förklaring, aldrig färg ensam.
 */
export const PAKET_ROLL: Record<Paket, AdminSerieRoll> = {
  cv: 'mellan',
  tester: 'sekundar',
  allt: 'primar',
};

/** Fönstren sidan kan visa. */
export const FONSTER = [7, 30, 90] as const;
export type Fonster = (typeof FONSTER)[number];

/** Dagen händelserna gick live. Allt före är bara besök och registreringar. */
export const HANDELSER_LIVE = '2026-09-22';

/** Plan- eller spårvärdet i dimensionen till ett paket. */
export function paketFranDimension(dim: string): Paket | null {
  if (dim === 'cv' || dim.startsWith('cv_')) return 'cv';
  if (dim === 'tester' || dim.startsWith('test_')) return 'tester';
  if (dim === 'allt' || dim.startsWith('all_')) return 'allt';
  return null;
}

// ---------------------------------------------------------------------------
// Tratten
// ---------------------------------------------------------------------------

export const STEG_NAMN: Record<(typeof FUNNEL_STEG)[number], string> = {
  pageview: 'Besök',
  signup_completed: 'Registrerad',
  track_selected: 'Valde spår',
  purchase_step_viewed: 'Såg köpsteget',
  checkout_started: 'Gick till kassan',
  subscription_paid: 'Betalt',
};

export interface TrattSteg {
  steg: (typeof FUNNEL_STEG)[number];
  namn: string;
  /** Unika personer per dag, summerade över fönstret. Null när steget inte gäller paketet. */
  antal: number | null;
  /** Andel av närmast föregående steg med tal, 0 till 1. */
  andel: number | null;
  /** Bredden i procent av trattens första steg. */
  bredd: number;
}

export interface Tratt {
  paket: Paket | 'alla';
  namn: string;
  steg: TrattSteg[];
  /** Betalt delat med första steget i just den här tratten. */
  helaVagen: number | null;
}

export interface FlodeRad {
  dag: string;
  handelse: string;
  dimension: string;
  antal: number;
  personer: number;
}

/** Bygger en tratt ur summor per steg. Exporterad för testet. */
export function byggTratt(paket: Paket | 'alla', summor: Map<string, number>): Tratt {
  const steg: TrattSteg[] = FUNNEL_STEG.map((s) => {
    const galler = paket === 'alla' || (s !== 'pageview' && s !== 'signup_completed');
    return {
      steg: s,
      namn: STEG_NAMN[s],
      antal: galler ? (summor.get(s) ?? 0) : null,
      andel: null,
      bredd: 0,
    };
  });

  let foregaende: number | null = null;
  let forsta: number | null = null;
  for (const rad of steg) {
    if (rad.antal === null) continue;
    if (forsta === null) forsta = rad.antal;
    if (foregaende !== null && foregaende > 0) rad.andel = rad.antal / foregaende;
    rad.bredd = forsta && forsta > 0 ? Math.max(1.5, Math.min(100, (rad.antal / forsta) * 100)) : 0;
    foregaende = rad.antal;
  }

  const betalt = steg.find((s) => s.steg === 'subscription_paid')?.antal ?? null;
  return {
    paket,
    namn: paket === 'alla' ? 'Alla paket' : PAKET_NAMN[paket],
    steg,
    helaVagen: forsta && forsta > 0 && betalt !== null ? betalt / forsta : null,
  };
}

// ---------------------------------------------------------------------------
// Var det tar stopp
// ---------------------------------------------------------------------------

export const FEATURE_NAMN: Record<Feature, string> = {
  cv_templates_all: 'Alla CV-mallar',
  cv_export: 'Ladda ned CV',
  cv_analysis_full: 'Hela CV-analysen',
  letter_download: 'Ladda ned brev',
  tests_above_base: 'Tester över grundnivå',
  test_exam_mode: 'Provläge',
  test_history: 'Testhistorik',
  chat_unlimited: 'Jobbcoachen utan tak',
  job_matches_all: 'Alla jobbmatchningar',
  bli_upptackt: 'Bli upptäckt',
  linkedin: 'LinkedIn-profilen',
};

export interface BlockeringRad {
  feature: string;
  namn: string;
  /** Paketet betalväggen föreslår för funktionen, alltså det som säljs. */
  paket: Paket;
  roll: AdminSerieRoll;
  /** Unika personer per dag, summerade. */
  personer: number;
  antal: number;
}

function featureNamn(feature: string): string {
  return (FEATURE_NAMN as Record<string, string>)[feature] ?? feature;
}

function paketForFeature(feature: string): Paket {
  if (!(feature in FEATURES)) return 'allt';
  const plan = suggestPlan(feature as Feature);
  return plan === 'cv_week' ? 'cv' : plan === 'test_week' ? 'tester' : 'allt';
}

/** Blockeringar per funktion ur floderaderna. Exporterad för testet. */
export function byggBlockeringar(rader: FlodeRad[], handelse: string): BlockeringRad[] {
  const per = new Map<string, { personer: number; antal: number }>();
  for (const r of rader) {
    if (r.handelse !== handelse || !r.dimension) continue;
    const a = per.get(r.dimension) ?? { personer: 0, antal: 0 };
    a.personer += r.personer;
    a.antal += r.antal;
    per.set(r.dimension, a);
  }
  return [...per.entries()]
    .map(([feature, a]) => {
      const paket = paketForFeature(feature);
      return { feature, namn: featureNamn(feature), paket, roll: PAKET_ROLL[paket], ...a };
    })
    .sort((a, b) => b.personer - a.personer || a.namn.localeCompare(b.namn, 'sv'));
}

// ---------------------------------------------------------------------------
// Kom igång
// ---------------------------------------------------------------------------

export interface BrickaAndel {
  key: BrickaKey;
  namn: string;
  /** Andel av köparna som provat brickan inom 24 timmar, 0 till 100. */
  inom24: number | null;
  /** Inom sju dygn. */
  inom7d: number | null;
}

export interface KomIgangPaket {
  paket: Paket;
  namn: string;
  /** Köpare med minst 24 timmar sedan köpet. */
  kopare24: number;
  /** Köpare med minst sju dygn sedan köpet. */
  kopare7d: number;
  /** Köpare totalt i fönstret, även de som köpte nyss. */
  kopare: number;
  brickor: BrickaAndel[];
  /** Andel av kopare24 som provat allt inom 24 timmar. */
  alltInom24: number | null;
  /** Andel av kopare7d som provat allt inom sju dygn. */
  alltInom7d: number | null;
}

export interface KopareRad {
  premium_scope: string | null;
  paket_started_at: string | null;
  onboarding_steps: Record<string, unknown> | null;
}

const TIM = 3_600_000;

/** Tid som millisekunder, eller null när värdet inte är en tidpunkt. */
function tidMs(v: unknown): number | null {
  if (typeof v !== 'string') return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Kom igång per paket ur köparna. Exporterad för testet. */
export function byggKomIgang(kopare: KopareRad[], nu: Date = new Date()): KomIgangPaket[] {
  const nuMs = nu.getTime();

  return PAKETEN.map((paket) => {
    const lista = KOM_IGANG_LISTA[paket];
    const mina = kopare.filter((k) => k.premium_scope === paket && tidMs(k.paket_started_at) !== null);
    const med24 = mina.filter((k) => nuMs - (tidMs(k.paket_started_at) as number) >= 24 * TIM);
    const med7d = mina.filter((k) => nuMs - (tidMs(k.paket_started_at) as number) >= 7 * 24 * TIM);

    const provadInom = (k: KopareRad, key: BrickaKey, gransMs: number): boolean => {
      const start = tidMs(k.paket_started_at) as number;
      const t = tidMs(k.onboarding_steps?.[key]);
      return t !== null && t - start <= gransMs;
    };

    const andel = (grupp: KopareRad[], test: (k: KopareRad) => boolean): number | null =>
      grupp.length ? Math.round((grupp.filter(test).length / grupp.length) * 100) : null;

    const brickor: BrickaAndel[] = lista.map((key) => ({
      key,
      namn: brickaText(key, paket).titel,
      inom24: andel(med24, (k) => provadInom(k, key, 24 * TIM)),
      inom7d: andel(med7d, (k) => provadInom(k, key, 7 * 24 * TIM)),
    }));

    return {
      paket,
      namn: PAKET_NAMN[paket],
      kopare: mina.length,
      kopare24: med24.length,
      kopare7d: med7d.length,
      brickor,
      alltInom24: andel(med24, (k) => lista.every((key) => provadInom(k, key, 24 * TIM))),
      alltInom7d: andel(med7d, (k) => lista.every((key) => provadInom(k, key, 7 * 24 * TIM))),
    };
  });
}

// ---------------------------------------------------------------------------
// Intäkt per paket
// ---------------------------------------------------------------------------

export interface IntaktPunkt {
  dag: string;
  /** Normaliserad MRR i kronor per paket. Null när dagen saknar Stripe-siffror. */
  cv: number | null;
  tester: number | null;
  allt: number | null;
}

/** Månadsvärdet i kronor av ett paket, med samma normalisering som MRR. */
export function manadskronor(plan: PlanKey): number {
  const p = PLAN_BY_KEY[plan];
  const intervall =
    p.length === 'vecka' ? 'week' : p.length === 'månad' ? 'month' : p.length === 'kvartal' ? 'month' : null;
  const steg = p.length === 'kvartal' ? 3 : 1;
  return manadsbeloppOre(p.amount * 100, intervall, steg) / 100;
}

/** Intäktsserien ur dagsraderna. Exporterad för testet. Allt-dagen är engångs och står utanför. */
export function byggIntakt(dagar: DagligaMetrik[]): IntaktPunkt[] {
  const kr = (aktiva: number | null, plan: PlanKey) =>
    aktiva === null ? null : Math.round(aktiva * manadskronor(plan));

  return [...dagar]
    .sort((a, b) => a.dag.localeCompare(b.dag))
    .map((d) => {
      const alltDelar = [
        kr(d.active_all_week, 'all_week'),
        kr(d.active_all_month, 'all_month'),
        kr(d.active_all_quarter, 'all_quarter'),
      ];
      const allt = alltDelar.every((v) => v === null)
        ? null
        : alltDelar.reduce<number>((s, v) => s + (v ?? 0), 0);
      return {
        dag: d.dag,
        cv: kr(d.active_cv_week, 'cv_week'),
        tester: kr(d.active_test_week, 'test_week'),
        allt,
      };
    });
}

export interface FornyelseVecka {
  /** "Vecka 1" till "Vecka 4". */
  vecka: string;
  /** Andel av kohorten som fortfarande betalade, 0 till 100, per paket. Null när kohorten är tom. */
  cv: number | null;
  tester: number | null;
  allt: number | null;
}

export interface FornyelseData {
  veckor: FornyelseVecka[];
  /** Antal prenumerationer i kohorten per paket, alltså de som är minst en vecka gamla. */
  kohort: Record<Paket, number>;
  /** Vecka 1 till 2 per paket, 0 till 100. */
  veckaTva: Record<Paket, number | null>;
  tillganglig: boolean;
  fel?: string;
}

export const VECKOPAKET: Record<Paket, PaketNyckel> = { cv: 'cv_week', tester: 'test_week', allt: 'all_week' };

export interface SubRad {
  paket: Paket;
  created: number;
  betaldaFakturor: number;
}

/**
 * Kohortkurvan ur prenumerationer och betalda fakturor. Exporterad för
 * testet. Vecka n räknas bara på prenumerationer som är minst n minus ett
 * dygnsveckor gamla: en som köptes i går kan inte ha förnyats och får
 * inte dra ner kurvan.
 */
export function byggFornyelser(subs: SubRad[], nuSek: number): Pick<FornyelseData, 'veckor' | 'kohort' | 'veckaTva'> {
  const VECKA = 7 * 86_400;
  const kohort: Record<Paket, number> = { cv: 0, tester: 0, allt: 0 };
  const veckaTva: Record<Paket, number | null> = { cv: null, tester: null, allt: null };

  // Ett dygns frist efter periodgränsen: förnyelsefakturan dras vid
  // gränsen men kan ta timmar att gå igenom, och en prenumeration som
  // passerade gränsen i morse ska inte räknas som tappad än.
  const FRIST = 86_400;

  const andel = (paket: Paket, vecka: number): number | null => {
    const gamlaNog = subs.filter(
      (s) => s.paket === paket && nuSek - s.created >= (vecka - 1) * VECKA + (vecka > 1 ? FRIST : 0)
    );
    if (!gamlaNog.length) return null;
    const kvar = gamlaNog.filter((s) => s.betaldaFakturor >= vecka).length;
    return Math.round((kvar / gamlaNog.length) * 100);
  };

  for (const p of PAKETEN) {
    kohort[p] = subs.filter((s) => s.paket === p && nuSek - s.created >= VECKA + FRIST).length;
    veckaTva[p] = andel(p, 2);
  }

  const veckor: FornyelseVecka[] = [1, 2, 3, 4].map((v) => ({
    vecka: `Vecka ${v}`,
    cv: andel('cv', v),
    tester: andel('tester', v),
    allt: andel('allt', v),
  }));

  return { veckor, kohort, veckaTva };
}

