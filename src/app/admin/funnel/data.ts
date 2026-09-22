/**
 * Datalagret för Funnel (docs/plan-admin.md avsnitt 4.5).
 *
 * Ligger i sidans egen mapp och inte i src/lib/admin/, eftersom våg 1 äger
 * den mappen och våg 2 inte får röra den. API-rutten under
 * src/app/api/admin/funnel importerar härifrån, så frågorna är skrivna en
 * gång.
 *
 * Tre regler genom filen:
 *
 * 1. Ingen fråga går mot PostHog. Tratten läses ur admin_funnel_weekly som
 *    cronen fyller. En HogQL-fråga per sidladdning spränger kvoten och gör
 *    LCP under 1,5 sekunder omöjlig.
 * 2. Allt läses med service role. admin_funnel_weekly har RLS på och noll
 *    policies, och admin_retention_cohorts är revoke:ad för authenticated.
 * 3. En källa som inte svarar ger null, aldrig noll. En nolla i tratten ser
 *    ut som ett ras när det egentligen är en lucka.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { FUNNEL_STEG } from '@/lib/admin/collect';

/** 15 minuter, samma som resten av adminen. */
export const FUNNEL_CACHE_SEKUNDER = 15 * 60;

/**
 * Stegens namn i gränssnittet, plus vad som faktiskt mäter dem.
 *
 * Planen beskriver tratten som registrering, CV, analys eller brev,
 * betalvägg, betalt. De två mittenstegen kommer ur Supabase och inte ur
 * PostHog, så de hämtas separat och vävs in i samma ordning.
 */
export const STEG_ETIKETT: Record<string, string> = {
  pageview: 'Besök',
  signup_completed: 'Registrerad',
  track_selected: 'Valde spår',
  purchase_step_viewed: 'Såg köpsteget',
  checkout_started: 'Gick till kassan',
  subscription_paid: 'Betalt',
  forsta_dokument: 'Första CV eller brev',
  forsta_analys: 'Första CV-analys',
};

/**
 * Ordningen i tratten (D3, docs/plan-paket-och-onboarding.md avsnitt 6):
 * besök, registrerad, valde spår, såg köpsteget, gick till kassan, betalt.
 * Alla sex kommer ur PostHog via cronen; de fyra sista finns även per paket.
 */
export const TRATT_ORDNING = FUNNEL_STEG;

export type TrattSteg = (typeof TRATT_ORDNING)[number];

/** Paketen tratten kan visas för. 'alla' är totalen. */
export const PAKET_ETIKETT: Record<string, string> = {
  alla: 'alla paket',
  cv: 'CV-veckan',
  tester: 'Testveckan',
  allt: 'Allt',
};

export interface TrattRad {
  steg: TrattSteg;
  etikett: string;
  antal: number | null;
  /** Andel av föregående steg, 0 till 1. Null på första steget. */
  andel: number | null;
  /** Antal som inte tog nästa steg. Null på sista steget. */
  bortfall: number | null;
  /** Var talet kommer ifrån, för noten under tabellen. */
  kalla: 'posthog' | 'supabase';
}

export interface VeckoTratt {
  vecka: string;
  /** Paketet: 'alla', 'cv', 'tester' eller 'allt'. Kolumnen heter kalla i tabellen. */
  kalla: string;
  rader: TrattRad[];
  /** Konton registrerade den veckan som har minst ett CV eller brev. Bara för 'alla'. */
  forstaDokument: number | null;
  /** Samma sak för CV-analyser. */
  forstaAnalys: number | null;
}

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
  /** Nyckel i koden, unik per rad. */
  nyckel: string;
  /** Vad ägaren läser. */
  etikett: string;
  /** Vilken tabell talet kommer ur, för noten under tabellen. */
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
  /** Slutförda senaste sju dagarna mot samma sju dagar veckan innan. */
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

export interface FunnelData {
  veckor: VeckoTratt[];
  kallor: string[];
  /** Funktionsanvändning ur sanningskällorna, en rad per funktion. */
  sannaFunktioner: SannFunktionsRad[];
  /** Testen, uppdelade per test_type. */
  tester: TestRad[];
  /** Mallnedladdningar, topp fem template_id. */
  mallar: MallRad[];
  /** Rå user_activities, bara som spårningskontroll. Tom lista döljer sektionen. */
  funktioner: FunktionsRad[];
  /** Händelser som finns i koden men saknar rader de senaste 30 dagarna. */
  oanvanda: string[];
  kohorter: KohortRad[];
  /** Sista veckan i serien, för rubriken. */
  senasteVecka: string | null;
  datakvalitet: DatakvalitetsNot[];
}

export interface DatakvalitetsNot {
  rubrik: string;
  text: string;
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

/** Måndagen i veckan som datumet ligger i, som ISO-datum. */
function mandag(d: Date): string {
  const kopia = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12)
  );
  const veckodag = (kopia.getUTCDay() + 6) % 7;
  kopia.setUTCDate(kopia.getUTCDate() - veckodag);
  return kopia.toISOString().slice(0, 10);
}

/**
 * Hämtar Funnel-sidans hela underlag.
 *
 * antalVeckor styr hur långt bakåt tratten och funktionsanvändningen går.
 * Funktionsanvändningen är alltid 30 dagar enligt planen, oavsett fönster:
 * det är den listan som svarar på "vilka funktioner används inte".
 */
export const hamtaFunnelData = unstable_cache(
  async (antalVeckor: number = 8): Promise<FunnelData> => {
    const admin = getSupabaseAdmin() as any;
    const veckor = Math.max(1, Math.min(antalVeckor, 26));

    const tidigast = new Date();
    tidigast.setUTCDate(tidigast.getUTCDate() - veckor * 7);
    const franVecka = mandag(tidigast);

    const [
      trattSvar,
      dokSvar,
      analysSvar,
      aktivitetSvar,
      kohortSvar,
      sannaSvar,
      testSvar,
      mallSvar,
    ] = await Promise.all([
      admin
        .from('admin_funnel_weekly')
        .select('vecka, kalla, steg, antal')
        .gte('vecka', franVecka)
        .order('vecka', { ascending: false }),
      hamtaForstaDokumentPerVecka(admin, franVecka),
      hamtaForstaAnalysPerVecka(admin, franVecka),
      hamtaFunktionsanvandning(admin),
      hamtaKohorter(admin),
      hamtaSannaFunktioner(admin),
      hamtaTester(admin),
      hamtaMallar(admin),
    ]);

    const rader = (trattSvar?.data ?? []) as Array<{
      vecka: string;
      kalla: string;
      steg: string;
      antal: number;
    }>;

    // Gruppera per vecka och källa.
    const perNyckel = new Map<string, Map<string, number>>();
    const kallor = new Set<string>();
    for (const r of rader) {
      kallor.add(r.kalla);
      const nyckel = `${r.vecka}|${r.kalla}`;
      if (!perNyckel.has(nyckel)) perNyckel.set(nyckel, new Map());
      perNyckel.get(nyckel)!.set(r.steg, r.antal);
    }

    const veckoTrattar: VeckoTratt[] = [];
    for (const [nyckel, steg] of perNyckel) {
      const [vecka, kalla] = nyckel.split('|');
      // Gamla rader med steg som inte längre finns i tratten (t.ex.
      // paywall_shown) ignoreras av byggRader. En vecka som bara har gamla
      // steg hoppas över helt, annars står den som en rad av streck.
      if (![...steg.keys()].some((s) => (TRATT_ORDNING as readonly string[]).includes(s))) continue;
      // Supabase-talen finns bara för 'alla': ett konto vet inte vilket
      // paket det kommer att välja när det laddar upp sitt första CV.
      veckoTrattar.push({
        vecka,
        kalla,
        rader: byggRader(steg),
        forstaDokument: kalla === 'alla' ? (dokSvar.get(vecka) ?? null) : null,
        forstaAnalys: kalla === 'alla' ? (analysSvar.get(vecka) ?? null) : null,
      });
    }

    // Senaste veckan först, och inom veckan alla paket före de tre enskilda.
    const paketOrdning = (k: string) => ['alla', 'cv', 'tester', 'allt'].indexOf(k);
    veckoTrattar.sort(
      (a, b) => b.vecka.localeCompare(a.vecka) || paketOrdning(a.kalla) - paketOrdning(b.kalla)
    );

    const funktioner = aktivitetSvar;
    const anvanda = new Set(funktioner.map((f) => f.typ));
    const oanvanda = KANDA_FUNKTIONER.filter((f) => !anvanda.has(f)).sort();

    return {
      veckor: veckoTrattar,
      kallor: Array.from(kallor).sort(),
      sannaFunktioner: sannaSvar,
      tester: testSvar,
      mallar: mallSvar,
      funktioner,
      oanvanda,
      kohorter: kohortSvar,
      senasteVecka: veckoTrattar[0]?.vecka ?? null,
      datakvalitet: DATAKVALITET,
    };
  },
  ['admin-funnel'],
  { revalidate: FUNNEL_CACHE_SEKUNDER, tags: ['admin-funnel'] }
);

/**
 * Bygger trattraderna med andel och bortfall mot föregående steg.
 *
 * Exporterad för testet: det är här tratten kan ljuga. Ett steg utan mätning
 * ska inte nollställa resten av tratten, och ett bortfall ska räknas mot
 * nästa steg som faktiskt har ett tal.
 */
export function byggRader(steg: Map<string, number>): TrattRad[] {
  const antalFor = (s: TrattSteg): number | null => {
    const v = steg.get(s);
    return typeof v === 'number' ? v : null;
  };

  const rader: TrattRad[] = TRATT_ORDNING.map((s) => ({
    steg: s,
    etikett: STEG_ETIKETT[s],
    antal: antalFor(s),
    andel: null,
    bortfall: null,
    kalla: 'posthog' as const,
  }));

  // Andel räknas mot närmast föregående steg som faktiskt har ett tal, så att
  // ett null-steg inte nollställer resten av tratten.
  let foregaende: number | null = null;
  for (const rad of rader) {
    if (rad.antal !== null && foregaende !== null && foregaende > 0) {
      rad.andel = rad.antal / foregaende;
    }
    if (rad.antal !== null) foregaende = rad.antal;
  }

  for (let i = 0; i < rader.length - 1; i++) {
    const nu = rader[i];
    const nasta = rader.slice(i + 1).find((r) => r.antal !== null);
    if (nu.antal !== null && nasta && nasta.antal !== null) {
      nu.bortfall = Math.max(0, nu.antal - nasta.antal);
    }
  }

  return rader;
}

/**
 * Antal konton per registreringsvecka som har minst ett CV eller brev.
 *
 * Mäts på letters och cv_texts direkt och inte på first_cv_uploaded_at, som
 * är satt på 2 av 311 konton. Se datakvalitetsnoten.
 */
async function hamtaForstaDokumentPerVecka(
  admin: any,
  franVecka: string
): Promise<Map<string, number>> {
  const karta = new Map<string, number>();
  try {
    const { data } = await admin
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', franVecka);

    const profiler = (data ?? []) as Array<{ id: string; created_at: string }>;
    if (!profiler.length) return karta;

    const ids = profiler.map((p) => p.id);
    const [brev, cv] = await Promise.all([
      admin.from('letters').select('user_id').in('user_id', ids),
      admin.from('cv_texts').select('user_id').in('user_id', ids),
    ]);

    const harDokument = new Set<string>();
    for (const r of (brev?.data ?? []) as Array<{ user_id: string }>) {
      harDokument.add(r.user_id);
    }
    for (const r of (cv?.data ?? []) as Array<{ user_id: string }>) {
      harDokument.add(r.user_id);
    }

    for (const p of profiler) {
      if (!harDokument.has(p.id)) continue;
      const v = mandag(new Date(p.created_at));
      karta.set(v, (karta.get(v) ?? 0) + 1);
    }
  } catch (err) {
    console.error('[admin/funnel] första dokument:', err);
  }
  return karta;
}

/** Samma sak för CV-analyser, mätt på cv_analysis_jobs. */
async function hamtaForstaAnalysPerVecka(
  admin: any,
  franVecka: string
): Promise<Map<string, number>> {
  const karta = new Map<string, number>();
  try {
    const { data } = await admin
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', franVecka);

    const profiler = (data ?? []) as Array<{ id: string; created_at: string }>;
    if (!profiler.length) return karta;

    const ids = profiler.map((p) => p.id);
    const { data: jobb } = await admin
      .from('cv_analysis_jobs')
      .select('user_id')
      .in('user_id', ids);

    const harAnalys = new Set<string>();
    for (const r of (jobb ?? []) as Array<{ user_id: string | null }>) {
      if (r.user_id) harAnalys.add(r.user_id);
    }

    for (const p of profiler) {
      if (!harAnalys.has(p.id)) continue;
      const v = mandag(new Date(p.created_at));
      karta.set(v, (karta.get(v) ?? 0) + 1);
    }
  } catch (err) {
    console.error('[admin/funnel] första analys:', err);
  }
  return karta;
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
  spec: (typeof SANNA_KALLOR)[number]
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

    const { data, error } = await q;
    if (error) {
      console.error(`[admin/funnel] ${spec.tabell}:`, error.message);
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
    console.error(`[admin/funnel] ${spec.tabell}:`, err);
    return null;
  }
}

/** Alla sanningskällor parallellt. En källa som fallerar utelämnas. */
async function hamtaSannaFunktioner(admin: any): Promise<SannFunktionsRad[]> {
  const svar = await Promise.all(
    SANNA_KALLOR.map((spec) => raknaKalla(admin, spec))
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
async function hamtaTester(admin: any): Promise<TestRad[]> {
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
      admin
        .from('logic_test_v4_sessions')
        .select('test_type, started_at, completed_at')
        .gte('started_at', fran37)
        .limit(20000),
      admin
        .from('personality_test_sessions')
        .select('test_type, started_at, completed_at')
        .gte('started_at', fran37)
        .limit(20000),
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
    console.error('[admin/funnel] tester:', err);
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
async function hamtaMallar(admin: any): Promise<MallRad[]> {
  const fran37 = dagarBakat(37);
  const fran30 = dagarBakat(30);
  const fran14 = dagarBakat(14);
  const fran7 = dagarBakat(7);

  try {
    const { data, error } = await admin
      .from('formatted_cv_downloads')
      .select('template_id, user_id, downloaded_at')
      .gte('downloaded_at', fran37)
      .limit(20000);

    if (error) {
      console.error('[admin/funnel] formatted_cv_downloads:', error.message);
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
    console.error('[admin/funnel] mallar:', err);
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
async function hamtaFunktionsanvandning(admin: any): Promise<FunktionsRad[]> {
  try {
    const fran = new Date();
    fran.setUTCDate(fran.getUTCDate() - 30);

    const { data } = await admin
      .from('user_activities')
      .select('activity_type, user_id, created_at')
      .gte('created_at', fran.toISOString())
      .limit(50000);

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
    console.error('[admin/funnel] funktionsanvändning:', err);
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
      console.error('[admin/funnel] admin_retention_cohorts:', error);
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
    console.error('[admin/funnel] kohorter:', err);
    return [];
  }
}

/**
 * Datakvalitetsnoterna planen kräver. De står på sidan tills fixarna är live
 * plus två veckor, och de ska inte tas bort för att talen ser rimliga ut.
 */
export const DATAKVALITET: DatakvalitetsNot[] = [
  {
    rubrik: 'Funktionsanvändningen kommer ur tabellerna, inte ur user_activities',
    text: 'user_activities skrivs fire-and-forget från klienten, så en rad går förlorad när sidan navigerar bort innan anropet hunnit fram, och test_completed skrevs bara när resultatsidan faktiskt renderades. Därför syntes varken tester eller mallnedladdningar här. Talen räknas nu på logic_test_v4_sessions, personality_test_sessions, anon_test_sessions, formatted_cv_downloads, letters, cv_texts, cv_analysis_jobs, job_matchings_cache, linkedin_optimizations, ai_conversations och job_applications, alltså tabeller som servern skriver i samma steg som funktionen utför sitt jobb. Listan längre ner ur user_activities står kvar som spårningskontroll, inte som mätning.',
  },
  {
    rubrik: 'Aktiveringsmilstolpar',
    text: 'first_cv_uploaded_at är satt på 2 av 311 konton och first_letter_created_at på 2, trots 242 brev och 171 CV-texter i databasen. Stegen "Första CV eller brev" och "Första CV-analys" räknas därför på letters, cv_texts och cv_analysis_jobs direkt, inte på aktiveringskolumnerna.',
  },
  {
    rubrik: 'Anskaffningskälla',
    text: 'profiles.acquisition_source är null på samtliga 311 konton, så uppdelningen per källa visar bara raden "alla". Tratten per källa går inte att lita på förrän attributionen skriver något.',
  },
  {
    rubrik: 'Händelser före 2026-09-14',
    text: 'Kön i analytics-klienten fanns inte tidigare, så händelser som avfyrades strax före en sidnavigering gick förlorade. Alla PostHog-steg är underräknade före 2026-09-14. Jämför inte veckor över den gränsen.',
  },
  {
    rubrik: 'Betalvägg, matchning och PWA saknar historik',
    text: 'paywall_shown, paywall_cta_clicked, alla match_* och pwa_prompt_shown gick live 2026-09-14 och har därför nästan inga rader bakåt. Mätningen är verifierad i produktion: ett QA-konto på /dashboard/jobbmatchning gav match_page_viewed med rätt distinct_id inom en minut. Talen är låga för att funktionerna är nya, inte för att spårningen är trasig.',
  },
];
