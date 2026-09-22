/**
 * Datalagret för Tratt, vyerna Veckor och Användning (det som var Funnel,
 * docs/plan-admin.md avsnitt 4.5, omgjort enligt spec-admin-tydlighet
 * punkt 11).
 *
 * API-rutten under src/app/api/admin/funnel importerar härifrån, så
 * frågorna är skrivna en gång.
 *
 * Fyra regler genom filen:
 *
 * 1. Ingen fråga går mot PostHog. Besökare och köpsteg läses ur
 *    admin_funnel_weekly som cronen fyller.
 * 2. Ett tal, en källa: nya konton ur profiles, köp ur
 *    admin_daily_metrics.new_paying (Stripe, kundens första lyckade
 *    debitering), besökare och köpsteg ur PostHog.
 * 3. Undantagna konton räknas aldrig. admin_-vyerna utesluter dem redan;
 *    varje fråga direkt mot en tabell gör det här med uteslut().
 * 4. En källa som inte svarar ger null, aldrig noll.
 *
 * Vyerna laddar var sin funktion, så Veckor väntar aldrig på de elva
 * tabellerna Användning läser.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { dagStr, veckansMandag } from '@/lib/admin/collect';
import { ADMIN_METRICS_TAG } from '@/lib/admin/metrics';
import { byggUndantag, uteslut, type Undantag } from '@/lib/admin/undantag';
import { PAKETEN, svenskMidnattIso, type Paket } from './berakning';

/** 15 minuter, samma som resten av adminen. */
export const FUNNEL_CACHE_SEKUNDER = 15 * 60;

/** Köpstegen som finns per vecka, i trattens ordning. */
export const VECKO_STEG = ['track_selected', 'purchase_step_viewed', 'checkout_started'] as const;
export type VeckoSteg = (typeof VECKO_STEG)[number];

export const STEG_ETIKETT: Record<string, string> = {
  pageview: 'Besökare',
  nya_konton: 'Nya konton',
  signup_completed: 'Registrerad',
  track_selected: 'Valde spår',
  purchase_step_viewed: 'Såg köpsteget',
  checkout_started: 'Gick till kassan',
  subscription_paid: 'Betalt',
  kop: 'Köp',
};

export interface VeckoRad {
  /** Måndagen, YYYY-MM-DD. */
  vecka: string;
  /** Unika besökare ur PostHog. Null när veckan inte är insamlad. */
  besokare: number | null;
  /** Nya konton ur profiles, undantagna bort. */
  nyaKonton: number | null;
  /** Nya betalande ur admin_daily_metrics. Null när ingen dag är insamlad. */
  kop: number | null;
  /** Köpstegen, alla paket. Null när steget saknas i tabellen. */
  steg: Record<VeckoSteg, number | null>;
  /** Köpstegen plus PostHogs subscription_paid per spår. */
  perPaket: Record<Paket, Record<VeckoSteg | 'subscription_paid', number | null>>;
}

export interface VeckoData {
  /** Senaste veckan först. */
  veckor: VeckoRad[];
}

/**
 * Veckorna ur tre källor, sammanfogade per måndag. Ren funktion,
 * exporterad för testet.
 */
export function byggVeckor(
  franVecka: string,
  idag: string,
  funnel: Array<{ vecka: string; kalla: string; steg: string; antal: number }>,
  kontonSkapade: string[],
  dagar: Array<{ dag: string; new_paying: number | null }>,
  kontonOk = true
): VeckoRad[] {
  const veckor: string[] = [];
  for (let v = veckansMandag(idag); v >= franVecka; ) {
    veckor.push(v);
    const d = new Date(`${v}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7);
    v = d.toISOString().slice(0, 10);
  }

  const tomPaket = () =>
    Object.fromEntries(
      PAKETEN.map((p) => [
        p,
        { track_selected: null, purchase_step_viewed: null, checkout_started: null, subscription_paid: null },
      ])
    ) as VeckoRad['perPaket'];

  const per = new Map<string, VeckoRad>(
    veckor.map((v) => [
      v,
      {
        vecka: v,
        besokare: null,
        nyaKonton: kontonOk ? 0 : null,
        kop: null,
        steg: { track_selected: null, purchase_step_viewed: null, checkout_started: null },
        perPaket: tomPaket(),
      },
    ])
  );

  for (const r of funnel) {
    const rad = per.get(r.vecka);
    if (!rad) continue;
    if (r.kalla === 'alla') {
      if (r.steg === 'pageview') rad.besokare = r.antal;
      else if ((VECKO_STEG as readonly string[]).includes(r.steg)) rad.steg[r.steg as VeckoSteg] = r.antal;
    } else if ((PAKETEN as readonly string[]).includes(r.kalla)) {
      const p = rad.perPaket[r.kalla as Paket];
      if (r.steg in p) p[r.steg as keyof typeof p] = r.antal;
    }
  }

  if (kontonOk) {
    for (const t of kontonSkapade) {
      const rad = per.get(veckansMandag(dagStr(new Date(t))));
      if (rad) rad.nyaKonton = (rad.nyaKonton ?? 0) + 1;
    }
  }

  for (const d of dagar) {
    if (d.new_paying === null || d.new_paying === undefined) continue;
    const rad = per.get(veckansMandag(d.dag));
    if (rad) rad.kop = (rad.kop ?? 0) + d.new_paying;
  }

  return veckor.map((v) => per.get(v)!);
}

/** Veckorna, senaste först, som vyn Veckor behöver. */
export const hamtaVeckoData = unstable_cache(
  async (antalVeckor: number, konton: Undantag['konton']): Promise<VeckoData> => {
    const admin = getSupabaseAdmin() as any;
    const u = byggUndantag(konton);
    const veckor = Math.max(1, Math.min(antalVeckor, 26));
    const idag = dagStr();
    const franVecka = (() => {
      const d = new Date(`${veckansMandag(idag)}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() - (veckor - 1) * 7);
      return d.toISOString().slice(0, 10);
    })();

    const [trattSvar, kontoSvar, dagSvar] = await Promise.all([
      admin
        .from('admin_funnel_weekly')
        .select('vecka, kalla, steg, antal')
        .gte('vecka', franVecka)
        .limit(5000),
      uteslut(
        admin
          .from('profiles')
          .select('created_at')
          .gte('created_at', svenskMidnattIso(franVecka))
          .limit(20000),
        'id',
        u
      ),
      admin.from('admin_daily_metrics').select('dag, new_paying').gte('dag', franVecka).limit(400),
    ]);

    if (trattSvar?.error) console.error('[admin/tratt] admin_funnel_weekly:', trattSvar.error.message);
    if (kontoSvar?.error) console.error('[admin/tratt] profiles per vecka:', kontoSvar.error.message);
    if (dagSvar?.error) console.error('[admin/tratt] admin_daily_metrics:', dagSvar.error.message);

    return {
      veckor: byggVeckor(
        franVecka,
        idag,
        (trattSvar?.data ?? []) as Array<{ vecka: string; kalla: string; steg: string; antal: number }>,
        ((kontoSvar?.data ?? []) as Array<{ created_at: string }>).map((p) => p.created_at),
        (dagSvar?.data ?? []) as Array<{ dag: string; new_paying: number | null }>,
        !kontoSvar?.error
      ),
    };
  },
  ['admin-tratt-veckor'],
  { revalidate: FUNNEL_CACHE_SEKUNDER, tags: ['admin-funnel', ADMIN_METRICS_TAG] }
);

// ---------------------------------------------------------------------------
// Användning
// ---------------------------------------------------------------------------

export interface FunktionsRad {
  typ: string;
  antal: number;
  personer: number;
  senast: string | null;
}

/**
 * En funktion mätt på sin egen tabell, inte på user_activities.
 *
 * Talen är händelser, alltså rader, och inte unika personer: "12 brev av 4
 * personer" är det ägaren vill veta, inte "4". Personerna står i egen kolumn.
 */
export interface SannFunktionsRad {
  nyckel: string;
  etikett: string;
  kalla: string;
  antal7: number;
  antal30: number;
  personer7: number;
  personer30: number;
  /** antal7 minus samma sju dagar veckan innan. */
  delta7: number;
  senast: string | null;
}

/** En testtyp med både startade och slutförda. */
export interface TestRad {
  nyckel: string;
  etikett: string;
  kalla: string;
  startade7: number;
  slutforda7: number;
  startade30: number;
  slutforda30: number;
  /** slutförda30 delat med startade30, null när inget startats. */
  slutforandegrad: number | null;
  delta7: number;
  senast: string | null;
}

/** En mall i topplistan över nedladdningar. */
export interface MallRad {
  templateId: string;
  antal7: number;
  antal30: number;
  personer30: number;
  delta7: number;
  senast: string | null;
}

export interface KohortRad {
  kohort: string;
  storlek: number;
  /** Aktiva per månadsoffset, index 0 är kohortmånaden själv. */
  aktiva: number[];
}

export interface DatakvalitetsNot {
  rubrik: string;
  text: string;
}

export interface AnvandningData {
  sannaFunktioner: SannFunktionsRad[];
  tester: TestRad[];
  mallar: MallRad[];
  /** Rå user_activities, bara som spårningskontroll. */
  funktioner: FunktionsRad[];
  /** Händelser som finns i koden men saknar rader de senaste 30 dagarna. */
  oanvanda: string[];
  kohorter: KohortRad[];
  datakvalitet: DatakvalitetsNot[];
}

/**
 * Funktionshändelser som finns i koden. Används för att skilja "funktionen
 * används inte" från "funktionen finns inte". Listan kommer ur en grep över
 * capture-anropen och activity_type-värdena 2026-09-14.
 */
const KANDA_FUNKTIONER = [
  'page_viewed',
  'registered',
  'login',
  'letter_created',
  'cv_generated',
  'cv_analysis_started',
  'cv_analysis_completed',
  'test_completed',
  'application_logged',
  'jobs_searched',
  'job_match_searched',
  'pricing_viewed',
  'premium_feature_used',
  'quota_wall_hit',
  'signup_method',
  'activation_state',
  'draft_claimed',
  'match_viewed',
  'match_applied',
  'match_search_run',
  'match_preferences_saved',
  'match_letter_started',
  'match_page_viewed',
  'pwa_installed',
  'pwa_launch',
  'pwa_prompt_shown',
  'pwa_prompt_accepted',
  'pwa_prompt_dismissed',
  'sample_started',
  'sample_completed',
  'paywall_shown',
  'paywall_cta_clicked',
];

/** Användningen, 30 dagar, som vyn Användning behöver. */
export const hamtaAnvandningData = unstable_cache(
  async (konton: Undantag['konton']): Promise<AnvandningData> => {
    const admin = getSupabaseAdmin() as any;
    const u = byggUndantag(konton);

    const [funktioner, kohorter, sannaFunktioner, tester, mallar] = await Promise.all([
      hamtaFunktionsanvandning(admin, u),
      hamtaKohorter(admin),
      hamtaSannaFunktioner(admin, u),
      hamtaTester(admin, u),
      hamtaMallar(admin, u),
    ]);

    const anvanda = new Set(funktioner.map((f) => f.typ));
    const oanvanda = KANDA_FUNKTIONER.filter((f) => !anvanda.has(f)).sort();

    return { sannaFunktioner, tester, mallar, funktioner, oanvanda, kohorter, datakvalitet: DATAKVALITET };
  },
  ['admin-tratt-anvandning'],
  { revalidate: FUNNEL_CACHE_SEKUNDER, tags: ['admin-funnel', ADMIN_METRICS_TAG] }
);

/** Båda delarna, för API-rutten. Sidan läser dem var för sig. */
export async function hamtaFunnelData(
  antalVeckor: number,
  konton: Undantag['konton']
): Promise<VeckoData & AnvandningData> {
  const [veckor, anvandning] = await Promise.all([
    hamtaVeckoData(antalVeckor, konton),
    hamtaAnvandningData(konton),
  ]);
  return { ...veckor, ...anvandning };
}

// ---------------------------------------------------------------------------
// Funktionsanvändning ur sanningskällorna
// ---------------------------------------------------------------------------

/**
 * Varje funktion med sin egen tabell, tidskolumn och eventuella filter.
 *
 * Det här är hela poängen med omskrivningen. user_activities skrivs
 * fire-and-forget från klienten: raden går förlorad när sidan navigerar bort
 * innan anropet hunnit fram, och test_completed skrivs bara när resultatsidan
 * faktiskt renderas. Tabellerna nedan skrivs av servern i samma transaktion
 * som funktionen utför sitt jobb, så en rad där betyder att det hände.
 */
const SANNA_KALLOR: Array<{
  nyckel: string;
  etikett: string;
  tabell: string;
  tidskolumn: string;
  /** Extra likhetsfilter, till exempel status = completed. */
  filter?: Record<string, unknown>;
  /** Kolumn som måste vara satt, till exempel completed_at. */
  finns?: string;
}> = [
  {
    nyckel: 'cv_uppladdade',
    etikett: 'CV uppladdade',
    tabell: 'cv_texts',
    tidskolumn: 'created_at',
  },
  {
    nyckel: 'brev_skapade',
    etikett: 'Brev skapade',
    tabell: 'letters',
    tidskolumn: 'created_at',
  },
  {
    nyckel: 'brev_sparade',
    etikett: 'Brev sparade',
    tabell: 'letters',
    tidskolumn: 'created_at',
    filter: { is_saved: true },
  },
  {
    nyckel: 'cv_analyser',
    etikett: 'CV-analyser slutförda',
    tabell: 'cv_analysis_jobs',
    tidskolumn: 'completed_at',
    filter: { status: 'completed' },
  },
  {
    nyckel: 'mallnedladdningar',
    etikett: 'Mallar nedladdade',
    tabell: 'formatted_cv_downloads',
    tidskolumn: 'downloaded_at',
  },
  {
    nyckel: 'jobbmatchningar',
    etikett: 'Jobbmatchningar körda',
    tabell: 'job_matchings_cache',
    tidskolumn: 'created_at',
  },
  {
    nyckel: 'linkedin',
    etikett: 'LinkedIn-optimeringar',
    tabell: 'linkedin_optimizations',
    tidskolumn: 'created_at',
  },
  {
    nyckel: 'ai_samtal',
    etikett: 'AI-samtal startade',
    tabell: 'ai_conversations',
    tidskolumn: 'created_at',
  },
  {
    nyckel: 'ansokningar',
    etikett: 'Sökta tjänster loggade',
    tabell: 'job_applications',
    tidskolumn: 'created_at',
  },
];

/** Testtypernas etiketter. Okända test_type visas med sitt råa värde. */
const TEST_ETIKETT: Record<string, string> = {
  matrislogik: 'Matrislogik',
  'matrislogik-avancerad': 'Matrislogik, avancerad',
  'matrislogik-expert': 'Matrislogik, expert',
  'matrislogik-prov': 'Matrislogik, prov',
  'numerical-reasoning': 'Numerisk',
  'numerical-reasoning-v2': 'Numerisk, v2',
  'numerical-reasoning-expert': 'Numerisk, expert',
  'numerical-reasoning-prov': 'Numerisk, prov',
  'verbal-resonemang': 'Verbal',
  'verbal-resonemang-expert': 'Verbal, expert',
  'verbal-resonemang-prov': 'Verbal, prov',
  'personlighet-grund': 'Personlighet',
};

export function testEtikett(typ: string): string {
  return TEST_ETIKETT[typ] ?? typ;
}

/** ISO-tidpunkt ett antal dagar bakåt. */
function dagarBakat(dagar: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - dagar);
  return d.toISOString();
}

/** De fyra gränserna som delar 37 dagars rader i fönster. */
export interface Fonster {
  /** Sju dagar bakåt. Allt efter detta är "senaste 7". */
  fran7: string;
  /** Fjorton dagar bakåt. Mellan fran14 och fran7 är "veckan innan". */
  fran14: string;
  /** Trettio dagar bakåt. */
  fran30: string;
}

/**
 * Lägger en tidpunkt i rätt fönster.
 *
 * Exporterad för testet: det är här talen kan ljuga. "Veckan innan" måste
 * vara halvöppet mot fran7, annars räknas dagens rader två gånger och deltat
 * blir alltid noll. Och 30-dagarsfönstret överlappar båda med flit: det är en
 * summa, inte en tredje hink.
 */
export function placera(
  tid: string,
  f: Fonster
): { senaste7: boolean; forra7: boolean; senaste30: boolean } {
  const senaste7 = tid >= f.fran7;
  return {
    senaste7,
    // Halvöppet: en rad kan aldrig ligga i både senaste7 och forra7.
    forra7: !senaste7 && tid >= f.fran14,
    senaste30: tid >= f.fran30,
  };
}

/**
 * Räknar en sanningskälla över tre fönster.
 *
 * Hämtar 30 dagars rader en gång och delar upp dem i minnet i stället för tre
 * frågor per tabell. Volymen är några tiotal rader per tabell i dag och
 * gränsen på 20 000 skyddar mot att en tabell plötsligt växer.
 */
async function raknaKalla(
  admin: any,
  spec: (typeof SANNA_KALLOR)[number],
  u: Undantag
): Promise<SannFunktionsRad | null> {
  const fran37 = dagarBakat(37);
  const fran30 = dagarBakat(30);
  const fran14 = dagarBakat(14);
  const fran7 = dagarBakat(7);

  try {
    let q = admin
      .from(spec.tabell)
      .select(`user_id, ${spec.tidskolumn}`)
      .gte(spec.tidskolumn, fran37)
      .limit(20000);

    for (const [k, v] of Object.entries(spec.filter ?? {})) q = q.eq(k, v);
    if (spec.finns) q = q.not(spec.finns, 'is', null);
    q = uteslut(q, 'user_id', u);

    const { data, error } = await q;
    if (error) {
      console.error(`[admin/tratt] ${spec.tabell}:`, error.message);
      return null;
    }

    const rader = (data ?? []) as Array<Record<string, any>>;

    let antal7 = 0;
    let antal30 = 0;
    let antalForra7 = 0;
    const personer7 = new Set<string>();
    const personer30 = new Set<string>();
    let senast: string | null = null;

    const fonster: Fonster = { fran7, fran14, fran30 };

    for (const r of rader) {
      const tid = r[spec.tidskolumn];
      if (typeof tid !== 'string') continue;
      if (!senast || tid > senast) senast = tid;

      const v = placera(tid, fonster);
      if (v.senaste7) {
        antal7 += 1;
        if (r.user_id) personer7.add(String(r.user_id));
      } else if (v.forra7) {
        antalForra7 += 1;
      }

      if (v.senaste30) {
        antal30 += 1;
        if (r.user_id) personer30.add(String(r.user_id));
      }
    }

    return {
      nyckel: spec.nyckel,
      etikett: spec.etikett,
      kalla: spec.tabell,
      antal7,
      antal30,
      personer7: personer7.size,
      personer30: personer30.size,
      delta7: antal7 - antalForra7,
      senast,
    };
  } catch (err) {
    console.error(`[admin/tratt] ${spec.tabell}:`, err);
    return null;
  }
}

/** Alla sanningskällor parallellt. En källa som fallerar utelämnas. */
async function hamtaSannaFunktioner(admin: any, u: Undantag): Promise<SannFunktionsRad[]> {
  const svar = await Promise.all(
    SANNA_KALLOR.map((spec) => raknaKalla(admin, spec, u))
  );
  return svar
    .filter((r): r is SannFunktionsRad => r !== null)
    .sort((a, b) => b.antal30 - a.antal30 || b.antal7 - a.antal7);
}

/**
 * Testen per test_type, startade och slutförda.
 *
 * Tre tabeller: logic_test_v4_sessions och personality_test_sessions har båda
 * test_type, started_at och completed_at. anon_test_sessions är de publika
 * proven och saknar test_type helt; där är created_at start och ett satt
 * score slutförande. De tre läggs i samma tabell eftersom ägarens fråga är
 * "gör folk testen", inte "vilken tabell ligger de i".
 */
async function hamtaTester(admin: any, u: Undantag): Promise<TestRad[]> {
  const fran37 = dagarBakat(37);
  const fran30 = dagarBakat(30);
  const fran14 = dagarBakat(14);
  const fran7 = dagarBakat(7);

  const fonster: Fonster = { fran7, fran14, fran30 };

  interface Ack {
    startade7: number;
    slutforda7: number;
    slutfordaForra7: number;
    startade30: number;
    slutforda30: number;
    senast: string | null;
    kalla: string;
  }

  const per = new Map<string, Ack>();

  const lagg = (
    nyckel: string,
    kalla: string,
    start: string | null,
    slut: string | null
  ) => {
    if (!per.has(nyckel)) {
      per.set(nyckel, {
        startade7: 0,
        slutforda7: 0,
        slutfordaForra7: 0,
        startade30: 0,
        slutforda30: 0,
        senast: null,
        kalla,
      });
    }
    const a = per.get(nyckel)!;

    if (start) {
      const v = placera(start, fonster);
      if (v.senaste7) a.startade7 += 1;
      if (v.senaste30) a.startade30 += 1;
      if (!a.senast || start > a.senast) a.senast = start;
    }
    if (slut) {
      const v = placera(slut, fonster);
      if (v.senaste7) a.slutforda7 += 1;
      else if (v.forra7) a.slutfordaForra7 += 1;
      if (v.senaste30) a.slutforda30 += 1;
      if (!a.senast || slut > a.senast) a.senast = slut;
    }
  };

  try {
    const [logik, personlighet, anon] = await Promise.all([
      uteslut(
        admin
          .from('logic_test_v4_sessions')
          .select('test_type, started_at, completed_at')
          .gte('started_at', fran37)
          .limit(20000),
        'user_id',
        u
      ),
      uteslut(
        admin
          .from('personality_test_sessions')
          .select('test_type, started_at, completed_at')
          .gte('started_at', fran37)
          .limit(20000),
        'user_id',
        u
      ),
      // De publika proven har inget konto och kan inte undantas per konto.
      admin
        .from('anon_test_sessions')
        .select('created_at, score')
        .gte('created_at', fran37)
        .limit(20000),
    ]);

    for (const [svar, kalla] of [
      [logik, 'logic_test_v4_sessions'],
      [personlighet, 'personality_test_sessions'],
    ] as const) {
      for (const r of (svar?.data ?? []) as Array<{
        test_type: string | null;
        started_at: string | null;
        completed_at: string | null;
      }>) {
        lagg(r.test_type ?? 'okänd typ', kalla, r.started_at, r.completed_at);
      }
    }

    // De publika proven har ingen test_type och inget completed_at. Ett satt
    // score betyder att provet rättades, alltså att det slutfördes.
    for (const r of (anon?.data ?? []) as Array<{
      created_at: string | null;
      score: number | null;
    }>) {
      lagg(
        'publika prov',
        'anon_test_sessions',
        r.created_at,
        r.score !== null && r.score !== undefined ? r.created_at : null
      );
    }
  } catch (err) {
    console.error('[admin/tratt] tester:', err);
    return [];
  }

  return Array.from(per.entries())
    .map(([nyckel, a]) => ({
      nyckel,
      etikett: nyckel === 'publika prov' ? 'Publika prov' : testEtikett(nyckel),
      kalla: a.kalla,
      startade7: a.startade7,
      slutforda7: a.slutforda7,
      startade30: a.startade30,
      slutforda30: a.slutforda30,
      slutforandegrad: a.startade30 > 0 ? a.slutforda30 / a.startade30 : null,
      delta7: a.slutforda7 - a.slutfordaForra7,
      senast: a.senast,
    }))
    .sort((a, b) => b.startade30 - a.startade30 || b.slutforda30 - a.slutforda30);
}

/** Hur många mallar topplistan visar. */
const MALL_TOPP = 5;

/** Mallnedladdningar per template_id, topp fem. */
async function hamtaMallar(admin: any, u: Undantag): Promise<MallRad[]> {
  const fran37 = dagarBakat(37);
  const fran30 = dagarBakat(30);
  const fran14 = dagarBakat(14);
  const fran7 = dagarBakat(7);

  try {
    const { data, error } = await uteslut(
      admin
        .from('formatted_cv_downloads')
        .select('template_id, user_id, downloaded_at')
        .gte('downloaded_at', fran37)
        .limit(20000),
      'user_id',
      u
    );

    if (error) {
      console.error('[admin/tratt] formatted_cv_downloads:', error.message);
      return [];
    }

    const per = new Map<
      string,
      {
        antal7: number;
        antal30: number;
        antalForra7: number;
        personer: Set<string>;
        senast: string | null;
      }
    >();

    for (const r of (data ?? []) as Array<{
      template_id: string | null;
      user_id: string | null;
      downloaded_at: string | null;
    }>) {
      const tid = r.downloaded_at;
      if (!tid) continue;
      const id = r.template_id ?? 'okänd mall';

      if (!per.has(id)) {
        per.set(id, {
          antal7: 0,
          antal30: 0,
          antalForra7: 0,
          personer: new Set(),
          senast: null,
        });
      }
      const p = per.get(id)!;
      if (!p.senast || tid > p.senast) p.senast = tid;

      const v = placera(tid, { fran7, fran14, fran30 });
      if (v.senaste7) p.antal7 += 1;
      else if (v.forra7) p.antalForra7 += 1;

      if (v.senaste30) {
        p.antal30 += 1;
        if (r.user_id) p.personer.add(String(r.user_id));
      }
    }

    return Array.from(per.entries())
      .map(([templateId, p]) => ({
        templateId,
        antal7: p.antal7,
        antal30: p.antal30,
        personer30: p.personer.size,
        delta7: p.antal7 - p.antalForra7,
        senast: p.senast,
      }))
      .sort((a, b) => b.antal30 - a.antal30 || b.antal7 - a.antal7)
      .slice(0, MALL_TOPP);
  } catch (err) {
    console.error('[admin/tratt] mallar:', err);
    return [];
  }
}

/**
 * Funktionsanvändning senaste 30 dagarna, ur user_activities.
 *
 * Står kvar som spårningskontroll och inte som mätning: tabellen skrivs
 * fire-and-forget från klienten och tappar rader vid navigering. Sidan visar
 * den bara för att kunna säga vilka händelser i koden som aldrig fyrar.
 */
async function hamtaFunktionsanvandning(admin: any, u: Undantag): Promise<FunktionsRad[]> {
  try {
    const fran = new Date();
    fran.setUTCDate(fran.getUTCDate() - 30);

    // user_id kan vara null (utloggade händelser), så null släpps igenom.
    const { data } = await uteslut(
      admin
        .from('user_activities')
        .select('activity_type, user_id, created_at')
        .gte('created_at', fran.toISOString())
        .limit(50000),
      'user_id',
      u,
      true
    );

    const rader = (data ?? []) as Array<{
      activity_type: string;
      user_id: string | null;
      created_at: string;
    }>;

    const per = new Map<
      string,
      { antal: number; personer: Set<string>; senast: string | null }
    >();

    for (const r of rader) {
      if (!per.has(r.activity_type)) {
        per.set(r.activity_type, {
          antal: 0,
          personer: new Set(),
          senast: null,
        });
      }
      const p = per.get(r.activity_type)!;
      p.antal += 1;
      if (r.user_id) p.personer.add(r.user_id);
      if (!p.senast || r.created_at > p.senast) p.senast = r.created_at;
    }

    return Array.from(per.entries())
      .map(([typ, v]) => ({
        typ,
        antal: v.antal,
        personer: v.personer.size,
        senast: v.senast,
      }))
      .sort((a, b) => b.antal - a.antal);
  } catch (err) {
    console.error('[admin/tratt] funktionsanvändning:', err);
    return [];
  }
}

/** Hur många månadsoffset kohorttabellen visar. Index 0 är kohortmånaden. */
const KOHORT_OFFSET = 5;

/** Hur många kohortmånader som visas, senaste först. */
const KOHORT_MANADER = 6;

/**
 * Retentionskohorter ur vyn admin_retention_cohorts.
 *
 * Vyn hade `where is_admin()` i sin definition, och service role har ingen
 * JWT, så villkoret var alltid falskt och vyn gav noll rader utan att något
 * såg trasigt ut. Den här funktionen räknade därför kohorterna själv, med en
 * gräns på 50 000 aktivitetsrader som tyst hade börjat ljuga så snart tabellen
 * växte förbi den. Våg 4 tog bort villkoret ur vyn, som ändå bara har grants
 * till service_role, så räkningen ligger i databasen igen.
 */
async function hamtaKohorter(admin: any): Promise<KohortRad[]> {
  try {
    const { data, error } = await admin
      .from('admin_retention_cohorts')
      .select('kohortmanad, kohortstorlek, manad_offset, aktiva')
      .lte('manad_offset', KOHORT_OFFSET)
      .order('kohortmanad', { ascending: false });

    if (error) {
      console.error('[admin/tratt] admin_retention_cohorts:', error);
      return [];
    }

    // Vyn ger en rad per (kohort, offset). Tabellen vill ha en rad per kohort
    // med en serie, och serien måste ha hål ifyllda: en månad utan aktivitet
    // saknas helt i vyn och ska stå som noll, inte som en lucka.
    const storlek = new Map<string, number>();
    const perKohort = new Map<string, Map<number, number>>();

    for (const r of (data ?? []) as Array<{
      kohortmanad: string;
      kohortstorlek: number;
      manad_offset: number;
      aktiva: number;
    }>) {
      const kohort = String(r.kohortmanad).slice(0, 7);
      storlek.set(kohort, Number(r.kohortstorlek) || 0);
      if (!perKohort.has(kohort)) perKohort.set(kohort, new Map());
      perKohort.get(kohort)!.set(Number(r.manad_offset), Number(r.aktiva) || 0);
    }

    return Array.from(storlek.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, KOHORT_MANADER)
      .map(([kohort, n]) => {
        const offsets = perKohort.get(kohort);
        const serie: number[] = [];
        for (let i = 0; i <= KOHORT_OFFSET; i++) serie.push(offsets?.get(i) ?? 0);
        return { kohort, storlek: n, aktiva: serie };
      });
  } catch (err) {
    console.error('[admin/tratt] kohorter:', err);
    return [];
  }
}

/**
 * Datakvalitet: förklaringarna om gamla mätfel samlas här och bara här
 * (överlämningens regel 6), inte på Översikt. De ska inte tas bort för att
 * talen ser rimliga ut, bara när den mätta perioden före felet har åldrats
 * ur alla fönster.
 */
export const DATAKVALITET: DatakvalitetsNot[] = [
  {
    rubrik: 'Undantagna konton rensade ur historiken 22 sep',
    text: 'Ditt adminkonto och testkontona (e-post som slutar på .test, innehåller jobbcoach-qa eller börjar med qa-) räknas aldrig. Från 22 sep filtreras de bort i insamlingen och i adminvyerna, och historiken samlades om utan dem. Tal i gamla rapporter och skärmdumpar före 22 sep kan därför vara något högre än samma dag här. De publika proven (anon_test_sessions) saknar konto och kan inte undantas per konto.',
  },
  {
    rubrik: 'Aktiveringsmilstolparna går inte att lita på före 15 sep',
    text: 'first_cv_uploaded_at och first_letter_created_at var satta på 2 av 311 konton, trots 242 brev och 171 CV-texter i databasen. Rättningen gick live 15 sep. Allt på den här sidan som gäller CV, brev och analyser räknas därför på letters, cv_texts och cv_analysis_jobs direkt, inte på aktiveringskolumnerna.',
  },
  {
    rubrik: 'user_activities tappar rader',
    text: 'Tabellen skrivs fire-and-forget från klienten, så en rad går förlorad när sidan navigerar bort innan anropet hunnit fram, och test_completed skrevs bara när resultatsidan faktiskt renderades. Funktionsanvändningen och testerna räknas därför på tabellerna servern skriver i samma steg som funktionen gör sitt jobb. Listan ur user_activities står kvar som spårningskontroll, inte som mätning.',
  },
  {
    rubrik: 'Attributionen var trasig till 21 sep kl. 22.00',
    text: 'profiles.acquisition_source var tom på alla konton fram till rättningen 21 sep kl. 22.00. Uppdelning per källa för konton skapade före det går inte att lita på, och en jämförelse över gränsen visar mest rättningen.',
  },
  {
    rubrik: 'PostHog-händelser underräknade före 14 sep',
    text: 'Kön i analytics-klienten fanns inte tidigare, så händelser som avfyrades strax före en sidnavigering gick förlorade. Besökare och andra PostHog-steg är underräknade före 14 sep. Jämför inte veckor över den gränsen.',
  },
  {
    rubrik: 'Köpvägens händelser har olika mätstarter',
    text: 'signup_completed mäts från 11 sep kl. 22.08, track_selected från att paketen släpptes 22 sep kl. 10.51, och purchase_step_viewed, checkout_started och gråa val från 22 sep kl. 19.02. Veckor och dagar före en mätstart visas som "mäts från", inte som 0. Nya konton räknas alltid ur profiles och köp alltid ur Stripe, så de har ingen mätstart.',
  },
];
