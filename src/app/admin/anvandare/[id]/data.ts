/**
 * Datalagret bakom en enskild anvandare (docs/plan-admin.md avsnitt 4.4).
 *
 * Tidslinjen ar sidans varde. Sex Supabase-kallor plus PostHog slas ihop till
 * en fallande lista: user_activities, letters, cv_analysis_jobs,
 * job_applications, premium_grants och email_log (skickade mejl), och darutover
 * personens egna handelser i PostHog nar de gar att hitta.
 *
 * Tva regler genom hela filen:
 *
 * 1. Aldrig dokumentinnehall. letters.content och cv_texts-texten hamtas inte,
 *    varken har eller i listan. Tidslinjen visar att ett brev skrevs, till
 *    vilket foretag och nar. Sjalva brevet ar anvandarens, inte ett matvarde.
 * 2. PostHog far aldrig blockera sidan. Fragan har egen tidsgrans och fangar
 *    sitt eget fel: en HogQL-fraga som hanger ska inte kosta LCP, och adminen
 *    ar fullt lasbar utan den.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { hogql } from '@/lib/admin/collect';
import { getQuotaSummary, type QuotaSummary } from '@/lib/quota/getQuotaSummary';
import { priceIdToPlanKey } from '@/lib/stripe/planPrices';
import type { PlanKey } from '@/lib/plans/plans';
import { kallaText } from '../format';

/** Hur manga rader tidslinjen visar. Tillrackligt for att se ett monster. */
export const TIDSLINJE_TAK = 120;

/** Hur manga rader vi hamtar per kalla innan sammanslagningen. */
const PER_KALLA = 60;

export type HandelseKalla =
  | 'aktivitet'
  | 'brev'
  | 'analys'
  | 'ansokan'
  | 'premium'
  | 'mejl'
  | 'posthog';

export interface Handelse {
  /** Stabil nyckel for React, unik over alla kallor. */
  id: string;
  kalla: HandelseKalla;
  tid: string;
  /** Vad som hande, pa svenska. */
  rubrik: string;
  /** Sammanhanget: foretag, mejlets amne, sidans adress. En rad, aldrig text ur ett dokument. */
  detalj?: string | null;
}

export interface Profilkort {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  last_active: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_id: string | null;
  current_period_end: string | null;
  premium_until: string | null;
  premium_source: string | null;
  premium_scope: string | null;
  stripe_customer_id: string | null;
  /** Paketet ur prenumerationens pris, for levande prenumerationer. */
  planKey: PlanKey | null;
  /** Senaste angerrattssamtycket i kassan. Skrivs fran 22 sep. */
  angerratt_samtycke_at: string | null;
  /** 'admin' eller 'test' for undantagna konton, annars null. */
  undantag: 'admin' | 'test' | null;
  acquisition_source: unknown;
  first_cv_uploaded_at: string | null;
  first_letter_created_at: string | null;
  first_cv_analyzed_at: string | null;
  letter_count: number;
  cv_count: number;
  application_count: number;
  analysis_count: number;
  last_activity_at: string | null;
}

/** Det sidan behover for att rita sitt forsta innehall. Bara Supabase. */
export interface AnvandarProfil {
  profil: Profilkort;
  kvot: QuotaSummary | null;
}

/** Tidslinjen, som hamtas separat eftersom den ror PostHog. */
export interface Tidslinje {
  handelser: Handelse[];
  /** Antal rader per kalla, innan taket. Sager om tidslinjen ar beskuren. */
  antalPerKalla: Record<HandelseKalla, number>;
  /** Satt nar PostHog inte svarade. Sidan sager det i klartext. */
  posthogFel: string | null;
}

/** Ett datum ur vilken som helst av kallornas kolumner. */
function tid(v: unknown): string | null {
  if (typeof v !== 'string' || !v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Aktivitetstypen pa svenska. Okanda typer visas som de star, sa att en ny
 * handelse i koden syns i adminen utan att nagon behover uppdatera listan har.
 */
const AKTIVITET_TEXT: Record<string, string> = {
  registered: 'Registrerade sig',
  login: 'Loggade in',
  logout: 'Loggade ut',
  page_viewed: 'Besökte en sida',
  letter_created: 'Skapade ett brev',
  letter_saved: 'Sparade ett brev',
  letter_generation_started: 'Startade brevgenerering',
  cv_uploaded: 'Laddade upp ett CV',
  cv_generated: 'Genererade ett CV',
  cv_deleted: 'Tog bort ett CV',
  cv_analysis_started: 'Startade CV-analys',
  cv_analysis_completed: 'CV-analys klar',
  competence_analysis_started: 'Startade kompetensanalys',
  competence_analysis_completed: 'Kompetensanalys klar',
  test_completed: 'Slutförde ett test',
  jobs_searched: 'Sökte jobb',
  job_match_searched: 'Sökte jobbmatchningar',
  application_logged: 'Loggade en ansökan',
  application_event_added: 'Uppdaterade en ansökan',
  pricing_viewed: 'Tittade på priser',
  premium_feature_used: 'Använde en premiumfunktion',
  quota_wall_hit: 'Slog i kvotgränsen',
  profile_updated: 'Uppdaterade profilen',
  activation_state: 'Aktiveringsstatus uppdaterad',
  signup_method: 'Valde registreringsmetod',
  milestone_reward_claimed: 'Hämtade en milstolpe',
  learning_plan_created: 'Skapade en utvecklingsplan',
  learning_plan_deleted: 'Tog bort en utvecklingsplan',
  allowance_update: 'Kvoten uppdaterades',
  skill_reset: 'Nollställde en färdighet',
};

/**
 * Plockar en kort detaljrad ur metadata.
 *
 * Bara falt vi vet ar korta etiketter. Metadata ar jsonb och kan innehalla
 * vad som helst, inklusive text ur ett brev, sa vi tar aldrig hela objektet
 * och aldrig ett falt vi inte kanner igen.
 */
function aktivitetsDetalj(
  metadata: unknown,
  beskrivning: string | null
): string | null {
  if (metadata && typeof metadata === 'object') {
    const m = metadata as Record<string, unknown>;
    for (const nyckel of ['path', 'page', 'company', 'foretag', 'test_type', 'feature', 'surface']) {
      const v = m[nyckel];
      if (typeof v === 'string' && v) return v.slice(0, 120);
    }
  }
  return beskrivning ? beskrivning.slice(0, 120) : null;
}

/** Status pa en CV-analys, pa svenska. */
const ANALYS_STATUS: Record<string, string> = {
  pending: 'köad',
  processing: 'pågår',
  completed: 'klar',
  failed: 'misslyckades',
};

/**
 * Personens handelser i PostHog.
 *
 * distinct_id ar Supabase-anvandarens id: PostHogProvider kor identify(user.id)
 * vid inloggning. Fragan ar cachad 15 minuter per anvandare, sa att en
 * omladdning av sidan inte kostar ett nytt anrop, och kvoten haller aven om
 * adminen bladdrar genom manga konton.
 */
const hamtaPosthog = unstable_cache(
  async (
    userId: string
  ): Promise<{ handelser: Handelse[]; fel: string | null }> => {
    if (!process.env.POSTHOG_PERSONAL_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
      return { handelser: [], fel: null };
    }

    try {
      // Bara id:t gar in i fragan, och det ar en uuid ur var egen vy, sa
      // strangen kan inte bara HogQL-syntax. Vi rensar anda allt utom
      // hexadecimala tecken och bindestreck.
      const trygg = userId.replace(/[^0-9a-fA-F-]/g, '');
      if (!trygg) return { handelser: [], fel: null };

      // $autocapture och $pageleave utesluts. De ar tva till tre rader per
      // klick och traffar taket innan nagot meningsbarande hinner med, vilket
      // gor tidslinjen till en logg i stallet for ett svar pa "vad gor de?".
      // Sidvisningar behalls: de sager vilken yta personen var pa.
      const svar = await hogql(
        `select event, timestamp, properties.$current_url
         from events
         where distinct_id = '${trygg}'
           and timestamp > now() - interval 90 day
           and event not in ('$autocapture', '$pageleave', '$rageclick', '$web_vitals')
         order by timestamp desc
         limit ${PER_KALLA}`
      );

      if (!svar) return { handelser: [], fel: null };

      const handelser: Handelse[] = [];
      for (const [i, rad] of svar.results.entries()) {
        const t = tid(rad?.[1]);
        if (!t) continue;
        const namn = typeof rad?.[0] === 'string' ? rad[0] : 'händelse';
        const url = typeof rad?.[2] === 'string' ? rad[2] : null;
        handelser.push({
          id: `ph-${i}-${t}`,
          kalla: 'posthog',
          tid: t,
          rubrik: namn === '$pageview' ? 'Sidvisning' : namn,
          detalj: url ? url.replace(/^https?:\/\/[^/]+/, '') || '/' : null,
        });
      }
      return { handelser, fel: null };
    } catch (fel) {
      const m = fel instanceof Error ? fel.message : String(fel);
      console.error('[admin/anvandare] posthog svarade inte:', m);
      return { handelser: [], fel: m.slice(0, 160) };
    }
  },
  ['admin-anvandare-posthog'],
  { revalidate: 15 * 60 }
);

/**
 * Profilen och kvoten: allt sidan behover for att rita sitt forsta innehall.
 *
 * Bara Supabase, inga externa anrop. Det ar det som gor LCP under 1,5
 * sekunder mojligt: tidslinjen ar bade tyngre och ror PostHog, sa den hamtas
 * separat och strommas in i en egen Suspense-grans.
 */
export async function hamtaProfil(
  userId: string
): Promise<AnvandarProfil | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;

  // Kvoten gar parallellt med de tva uppslagen. Den ar fyra egna fragor, och
  // att vanta in profilen forst innan den startar lade en hel rundtur pa
  // forsta byten utan att nagot av svaren berodde pa det andra.
  const [vyRes, profilRes, kvotRes] = await Promise.all([
    admin.from('admin_user_rows').select('*').eq('id', userId).maybeSingle(),
    admin
      .from('profiles')
      .select(
        'id, subscription_id, subscription_status, current_period_end, stripe_customer_id, price_id, angerratt_samtycke_at'
      )
      .eq('id', userId)
      .maybeSingle(),
    getQuotaSummary(admin, userId).catch((fel) => {
      console.error('[admin/anvandare] kunde inte lasa kvoten:', fel);
      return null;
    }),
  ]);

  const vy = vyRes?.data as Record<string, unknown> | null;
  if (!vy) return null;

  const stripe = (profilRes?.data ?? {}) as Record<string, unknown>;

  const profil: Profilkort = {
    id: String(vy.id),
    email: (vy.email as string | null) ?? null,
    full_name: (vy.full_name as string | null) ?? null,
    created_at: (vy.created_at as string | null) ?? null,
    last_active: (vy.last_active as string | null) ?? null,
    subscription_tier: (vy.subscription_tier as string | null) ?? null,
    subscription_status: (vy.subscription_status as string | null) ?? null,
    subscription_id: (stripe.subscription_id as string | null) ?? null,
    current_period_end: (stripe.current_period_end as string | null) ?? null,
    premium_until: (vy.premium_until as string | null) ?? null,
    premium_source: (vy.premium_source as string | null) ?? null,
    premium_scope: (vy.premium_scope as string | null) ?? null,
    stripe_customer_id: (vy.stripe_customer_id as string | null) ?? null,
    planKey: priceIdToPlanKey((stripe.price_id as string | null) ?? null),
    angerratt_samtycke_at: (stripe.angerratt_samtycke_at as string | null) ?? null,
    undantag:
      vy.undantag === 'admin' ? 'admin' : vy.undantag === 'test' ? 'test' : null,
    acquisition_source: vy.acquisition_source ?? null,
    first_cv_uploaded_at: (vy.first_cv_uploaded_at as string | null) ?? null,
    first_letter_created_at:
      (vy.first_letter_created_at as string | null) ?? null,
    first_cv_analyzed_at: (vy.first_cv_analyzed_at as string | null) ?? null,
    letter_count: Number(vy.letter_count ?? 0),
    cv_count: Number(vy.cv_count ?? 0),
    application_count: Number(vy.application_count ?? 0),
    analysis_count: Number(vy.analysis_count ?? 0),
    last_activity_at: (vy.last_activity_at as string | null) ?? null,
  };

  // Kvoten laser med service role mot samma funktion som prenumerations-
  // sidan, sa adminen och anvandaren alltid ser samma siffra.
  return { profil, kvot: (kvotRes as QuotaSummary | null) ?? null };
}

/**
 * Den sammanslagna tidslinjen.
 *
 * Sex Supabase-fragor parallellt, plus PostHog. PostHog kapas efter atta
 * sekunder: sidan ska vara lasbar aven nar PostHog ar nere, och en tidslinje
 * utan sidvisningar ar fortfarande sex kallor djup.
 *
 * Anropas inuti en Suspense-grans, sa dess vantan syns som ett skelett i
 * tidslinjens ruta i stallet for att halla hela sidan.
 */
export async function hamtaTidslinje(userId: string): Promise<Tidslinje> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;

  const posthogLofte = Promise.race([
    hamtaPosthog(userId),
    new Promise<{ handelser: Handelse[]; fel: string | null }>((klar) =>
      setTimeout(() => klar({ handelser: [], fel: 'tidsgräns' }), 8000)
    ),
  ]);

  const [aktivitetRes, brevRes, analysRes, ansokanRes, premiumRes, mejlRes] =
    await Promise.all([
      admin
        .from('user_activities')
        .select('id, activity_type, description, metadata, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(PER_KALLA),
      // Aldrig content. Bara att brevet finns, till vem och nar.
      admin
        .from('letters')
        .select('id, title, company, job_title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(PER_KALLA),
      admin
        .from('cv_analysis_jobs')
        .select('id, status, display_name, created_at, completed_at, error')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(PER_KALLA),
      admin
        .from('job_applications')
        .select('id, job_title, company, current_status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(PER_KALLA),
      admin
        .from('premium_grants')
        .select('id, days, source, granted_at, premium_until_after')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false })
        .limit(PER_KALLA),
      admin
        .from('email_log')
        .select('id, email_type, subject, sent_at, feature')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(PER_KALLA),
    ]);

  const handelser: Handelse[] = [];

  for (const r of (aktivitetRes?.data ?? []) as Array<Record<string, unknown>>) {
    const t = tid(r.created_at);
    if (!t) continue;
    const typ = String(r.activity_type ?? 'händelse');
    handelser.push({
      id: `akt-${String(r.id)}`,
      kalla: 'aktivitet',
      tid: t,
      rubrik: AKTIVITET_TEXT[typ] ?? typ,
      detalj: aktivitetsDetalj(
        r.metadata,
        (r.description as string | null) ?? null
      ),
    });
  }

  for (const r of (brevRes?.data ?? []) as Array<Record<string, unknown>>) {
    const t = tid(r.created_at);
    if (!t) continue;
    const foretag = (r.company as string | null) ?? null;
    const tjanst = (r.job_title as string | null) ?? (r.title as string | null);
    handelser.push({
      id: `brev-${String(r.id)}`,
      kalla: 'brev',
      tid: t,
      rubrik: 'Personligt brev skapat',
      detalj: [tjanst, foretag].filter(Boolean).join(', ') || null,
    });
  }

  for (const r of (analysRes?.data ?? []) as Array<Record<string, unknown>>) {
    const t = tid(r.created_at);
    if (!t) continue;
    const status = String(r.status ?? '');
    handelser.push({
      id: `analys-${String(r.id)}`,
      kalla: 'analys',
      tid: t,
      rubrik: 'CV-analys',
      detalj:
        [
          (r.display_name as string | null) ?? null,
          ANALYS_STATUS[status] ?? status,
        ]
          .filter(Boolean)
          .join(', ') || null,
    });
  }

  for (const r of (ansokanRes?.data ?? []) as Array<Record<string, unknown>>) {
    const t = tid(r.created_at);
    if (!t) continue;
    handelser.push({
      id: `ansokan-${String(r.id)}`,
      kalla: 'ansokan',
      tid: t,
      rubrik: 'Ansökan loggad',
      detalj:
        [
          (r.job_title as string | null) ?? null,
          (r.company as string | null) ?? null,
          (r.current_status as string | null) ?? null,
        ]
          .filter(Boolean)
          .join(', ') || null,
    });
  }

  for (const r of (premiumRes?.data ?? []) as Array<Record<string, unknown>>) {
    const t = tid(r.granted_at);
    if (!t) continue;
    const dagar = Number(r.days ?? 0);
    const kallan = (r.source as string | null) ?? null;
    const kopt = kallan?.startsWith('onetime_');
    handelser.push({
      id: `premium-${String(r.id)}`,
      kalla: 'premium',
      tid: t,
      rubrik: kopt
        ? `Köpte ${kallaText(kallan).replace(/^Engångsköp, /, '')}`
        : `Paket ${dagar > 0 ? `${dagar} ${dagar === 1 ? 'dag' : 'dagar'}` : 'tilldelat'}`,
      detalj: kallan ? kallaText(kallan) : null,
    });
  }

  for (const r of (mejlRes?.data ?? []) as Array<Record<string, unknown>>) {
    const t = tid(r.sent_at);
    if (!t) continue;
    handelser.push({
      id: `mejl-${String(r.id)}`,
      kalla: 'mejl',
      tid: t,
      rubrik: 'Mejl skickat',
      detalj:
        [
          (r.email_type as string | null) ?? null,
          (r.subject as string | null) ?? null,
        ]
          .filter(Boolean)
          .join(': ') || null,
    });
  }

  const posthog = await posthogLofte;
  handelser.push(...posthog.handelser);

  const antalPerKalla: Record<HandelseKalla, number> = {
    aktivitet: 0,
    brev: 0,
    analys: 0,
    ansokan: 0,
    premium: 0,
    mejl: 0,
    posthog: 0,
  };
  for (const h of handelser) antalPerKalla[h.kalla] += 1;

  handelser.sort((a, b) => (a.tid < b.tid ? 1 : a.tid > b.tid ? -1 : 0));

  return {
    handelser: handelser.slice(0, TIDSLINJE_TAK),
    antalPerKalla,
    posthogFel: posthog.fel,
  };
}
