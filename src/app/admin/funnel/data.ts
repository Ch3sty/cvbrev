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
  signup_gate_shown: 'Registreringsspärr visad',
  signup_started: 'Registrering påbörjad',
  signup_completed: 'Registrerad',
  forsta_dokument: 'Första CV eller brev',
  forsta_analys: 'Första CV-analys',
  paywall_shown: 'Betalvägg visad',
  paywall_cta_clicked: 'Klick på betalvägg',
  subscription_paid: 'Betalt',
};

/** Ordningen i tratten. Supabase-stegen ligger mellan PostHog-stegen. */
export const TRATT_ORDNING = [
  'pageview',
  'signup_gate_shown',
  'signup_started',
  'signup_completed',
  'forsta_dokument',
  'forsta_analys',
  'paywall_shown',
  'paywall_cta_clicked',
  'subscription_paid',
] as const;

export type TrattSteg = (typeof TRATT_ORDNING)[number];

/** Stegen som kommer ur PostHog, alltså de som cronen skriver. */
const POSTHOG_STEG = new Set<string>(FUNNEL_STEG);

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
  kalla: string;
  rader: TrattRad[];
}

export interface FunktionsRad {
  typ: string;
  antal: number;
  personer: number;
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

    const [trattSvar, dokSvar, analysSvar, aktivitetSvar, kohortSvar] =
      await Promise.all([
        admin
          .from('admin_funnel_weekly')
          .select('vecka, kalla, steg, antal')
          .gte('vecka', franVecka)
          .order('vecka', { ascending: false }),
        hamtaForstaDokumentPerVecka(admin, franVecka),
        hamtaForstaAnalysPerVecka(admin, franVecka),
        hamtaFunktionsanvandning(admin),
        hamtaKohorter(admin),
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
      // Supabase-stegen finns bara för 'alla': acquisition_source är null på
      // samtliga konton, så en uppdelning per källa hade varit påhittad.
      const dok = kalla === 'alla' ? (dokSvar.get(vecka) ?? null) : null;
      const analys = kalla === 'alla' ? (analysSvar.get(vecka) ?? null) : null;

      veckoTrattar.push({
        vecka,
        kalla,
        rader: byggRader(steg, dok, analys),
      });
    }

    veckoTrattar.sort((a, b) => b.vecka.localeCompare(a.vecka));

    const funktioner = aktivitetSvar;
    const anvanda = new Set(funktioner.map((f) => f.typ));
    const oanvanda = KANDA_FUNKTIONER.filter((f) => !anvanda.has(f)).sort();

    return {
      veckor: veckoTrattar,
      kallor: Array.from(kallor).sort(),
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
export function byggRader(
  steg: Map<string, number>,
  dok: number | null,
  analys: number | null
): TrattRad[] {
  const antalFor = (s: TrattSteg): number | null => {
    if (s === 'forsta_dokument') return dok;
    if (s === 'forsta_analys') return analys;
    const v = steg.get(s);
    return typeof v === 'number' ? v : null;
  };

  const rader: TrattRad[] = TRATT_ORDNING.map((s) => ({
    steg: s,
    etikett: STEG_ETIKETT[s],
    antal: antalFor(s),
    andel: null,
    bortfall: null,
    kalla: POSTHOG_STEG.has(s) ? ('posthog' as const) : ('supabase' as const),
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

/** Funktionsanvändning senaste 30 dagarna, ur user_activities. */
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
