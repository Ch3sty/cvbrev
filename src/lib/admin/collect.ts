/**
 * Insamlingen till admin_daily_metrics (docs/plan-admin.md avsnitt 5.5).
 *
 * Kors fran cronen /api/cron/pricing-sync i midnattsslotten och on-demand
 * nar adminen laser en dag som saknas. Bada Vercel-crons ar upptagna av just
 * den rutten och en tredje gar inte att lagga till pa nuvarande plan, sa den
 * har koden far aldrig bli en egen cron.
 *
 * Tva regler genom hela filen:
 *
 * 1. Varje delsteg fangar sitt eget fel, skriver till admin_error_log och
 *    later de ovriga fortsatta. Cronen gor redan fyra jobb och maxDuration ar
 *    60 sekunder, sa ett hangande Stripe-anrop far inte ta ner resten.
 * 2. En kalla som inte svarar skriver null, aldrig noll. GSC ligger ungefar
 *    tva dagar efter och har luckor; en nolla dar ser ut som ett ras.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

/** Tidsgrans per delsteg. Fyra delsteg ska rymmas i cronens 60 sekunder. */
const DELSTEG_TIMEOUT_MS = 10_000;

/** Supabase-klienten kors alltid som service role har. */
type Admin = SupabaseClient<any, any, any>;

/** En rad i admin_daily_metrics. Alla tal ar nullbara med flit. */
export interface DagligaMetrik {
  dag: string;
  mrr_ore: number | null;
  revenue_ore: number | null;
  new_paying: number | null;
  churned: number | null;
  active_subs: number | null;
  trialing_subs: number | null;
  failed_payments: number | null;
  new_accounts: number | null;
  active_users: number | null;
  gsc_clicks: number | null;
  gsc_impressions: number | null;
  gsc_ctr: number | null;
  gsc_position: number | null;
  emails_sent: number | null;
  emails_opened: number | null;
  ai_cost_sek: number | null;
}

export interface CollectResultat {
  dag: string;
  skrev: boolean;
  delsteg: Record<string, 'ok' | 'fel' | 'hoppat'>;
  fel: string[];
}

// ---------------------------------------------------------------------------
// Normalisering av MRR
// ---------------------------------------------------------------------------

/**
 * Stripe-intervallen normaliserade till en manad.
 *
 * Ett kvartalspris pa 299 kr ar 99,67 kr i manaden, inte 299. Utan den har
 * omraekningen blir MRR fel med en faktor tre for varje kvartalsprenumerant,
 * och sidan sager att vi tjanar mer an vi gor.
 *
 * Provanropet 2026-09-14 visade att priset 299 kr har recurring.interval
 * month i Stripe, inte kvartal. Funktionen litar pa Stripe: star det month sa
 * raknas det som en manad. Avvikelsen mot prisstegen visas pa
 * Installningar-sidan i stallet, och rattningen i Stripe ar agarens.
 */
export function manadsbeloppOre(
  unitAmount: number | null | undefined,
  interval: string | null | undefined,
  intervalCount: number | null | undefined,
  quantity: number | null | undefined = 1
): number {
  if (typeof unitAmount !== 'number' || !Number.isFinite(unitAmount)) return 0;

  const antal = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
  const steg =
    typeof intervalCount === 'number' && intervalCount > 0 ? intervalCount : 1;

  // Manader per intervallsteg.
  let manader: number;
  switch (interval) {
    case 'month':
      manader = 1;
      break;
    case 'year':
      manader = 12;
      break;
    case 'week':
      // 52 veckor pa 12 manader.
      manader = 12 / 52;
      break;
    case 'day':
      manader = 12 / 365;
      break;
    default:
      // Ett engangskop har inget intervall och bidrar inte till MRR. Det syns
      // i revenue_ore i stallet.
      return 0;
  }

  const periodManader = manader * steg;
  if (periodManader <= 0) return 0;

  return Math.round((unitAmount * antal) / periodManader);
}

/**
 * MRR ur en lista prenumerationer. Bara active och trialing raknas: en
 * uppsagd prenumeration som fortfarande loper ut ar inte aterkommande intakt.
 */
export function mrrOreFranSubscriptions(
  subs: Array<{
    status: string;
    items?: { data?: Array<{ quantity?: number | null; price?: Stripe.Price | null }> };
  }>
): number {
  let summa = 0;
  for (const sub of subs) {
    if (sub.status !== 'active' && sub.status !== 'trialing') continue;
    for (const item of sub.items?.data ?? []) {
      const pris = item.price;
      if (!pris) continue;
      summa += manadsbeloppOre(
        pris.unit_amount,
        pris.recurring?.interval ?? null,
        pris.recurring?.interval_count ?? null,
        item.quantity ?? 1
      );
    }
  }
  return summa;
}

// ---------------------------------------------------------------------------
// Sma hjalpare
// ---------------------------------------------------------------------------

/** Datum som YYYY-MM-DD i svensk tid, sa dygnsgransen ar den agaren ser. */
export function dagStr(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Dygnets grans i UTC for en svensk dag. */
function dygnsgranser(dag: string): { start: Date; slut: Date } {
  // Svensk tid ar UTC+1 eller UTC+2. Vi tar midnatt lokalt genom att lata
  // Date tolka datumet och sedan justera med den faktiska offseten.
  const mitt = new Date(`${dag}T12:00:00Z`);
  const lokalMitt = new Date(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .format(mitt)
      .replace(',', '')
  );
  const offsetMs = lokalMitt.getTime() - mitt.getTime();
  const start = new Date(new Date(`${dag}T00:00:00Z`).getTime() - offsetMs);
  const slut = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, slut };
}

/** Kor ett delsteg med tidsgrans. Kastar vid timeout. */
async function medTimeout<T>(namn: string, p: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<never>((_, avvisa) => {
        timer = setTimeout(
          () => avvisa(new Error(`${namn} tog over ${DELSTEG_TIMEOUT_MS} ms`)),
          DELSTEG_TIMEOUT_MS
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Skriver en rad i admin_error_log. Far aldrig kasta vidare. */
export async function loggaAdminFel(
  admin: Admin,
  kalla: string,
  meddelande: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await admin.from('admin_error_log').insert({
      kalla,
      rutt: null,
      meddelande: meddelande.slice(0, 1000),
      metadata: metadata ?? null,
    });
  } catch (err) {
    console.error('[admin/collect] kunde inte skriva admin_error_log:', err);
  }
}

// ---------------------------------------------------------------------------
// Delsteg: Stripe
// ---------------------------------------------------------------------------

export interface StripeDelresultat {
  mrr_ore: number;
  revenue_ore: number;
  new_paying: number;
  churned: number;
  active_subs: number;
  trialing_subs: number;
  failed_payments: number;
}

/**
 * Stripe, paginerat fran forsta raden kod. I dag ryms 29 prenumerationer och
 * 48 debiteringar i en sida, vilket doljer buggen tills volymen vaxer.
 */
export async function samlaStripe(dag: string): Promise<StripeDelresultat | null> {
  const nyckel = process.env.STRIPE_SECRET_KEY;
  if (!nyckel) return null;

  const stripe = new Stripe(nyckel, { apiVersion: '2025-02-24.acacia' });
  const { start, slut } = dygnsgranser(dag);
  const fran = Math.floor(start.getTime() / 1000);
  const till = Math.floor(slut.getTime() / 1000);

  // Prenumerationer: alla statusar, sa bade MRR och churn gar att rakna.
  // for await pa en Stripe-lista sidbryter av sig sjalv med starting_after
  // tills has_more ar false. I dag ryms alla 29 i en sida.
  const subs: Stripe.Subscription[] = [];
  for await (const sub of stripe.subscriptions.list({
    status: 'all',
    limit: 100,
    expand: ['data.items.data.price'],
  })) {
    subs.push(sub);
  }

  const mrr_ore = mrrOreFranSubscriptions(
    subs as unknown as Array<{
      status: string;
      items?: { data?: Array<{ quantity?: number | null; price?: Stripe.Price | null }> };
    }>
  );

  const active_subs = subs.filter((s) => s.status === 'active').length;
  const trialing_subs = subs.filter((s) => s.status === 'trialing').length;

  const inomDygnet = (ts: number | null | undefined) =>
    typeof ts === 'number' && ts >= fran && ts < till;

  const new_paying = subs.filter((s) => inomDygnet(s.created)).length;
  const churned = subs.filter((s) => inomDygnet(s.canceled_at)).length;

  // Debiteringar for dygnet, ocksa paginerat.
  let revenue_ore = 0;
  let failed_payments = 0;
  for await (const charge of stripe.charges.list({
    created: { gte: fran, lt: till },
    limit: 100,
  })) {
    const c = charge as Stripe.Charge;
    if (c.paid && c.status === 'succeeded') {
      revenue_ore += c.amount - (c.amount_refunded ?? 0);
    }
    if (c.status === 'failed' || c.failure_code) {
      failed_payments += 1;
    }
  }

  return {
    mrr_ore,
    revenue_ore,
    new_paying,
    churned,
    active_subs,
    trialing_subs,
    failed_payments,
  };
}

// ---------------------------------------------------------------------------
// Delsteg: GSC
// ---------------------------------------------------------------------------

export interface GscDagsrad {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscDelresultat {
  dagsrad: GscDagsrad | null;
  toppsidor: Array<{ nyckel: string } & GscDagsrad>;
  toppord: Array<{ nyckel: string } & GscDagsrad>;
}

/**
 * GSC: en fraga for dagens totaler, en for sidor och en for sokord. Datan
 * ligger ungefar tva dagar efter, sa en dag utan rader ar normalt och ska ge
 * null, inte nollor.
 */
export async function samlaGsc(dag: string): Promise<GscDelresultat | null> {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!raw || !siteUrl) return null;

  const { google } = await import('googleapis');
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(raw),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  async function fraga(dimensions: string[], rowLimit: number) {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl as string,
      requestBody: { startDate: dag, endDate: dag, dimensions, rowLimit },
    });
    return res.data.rows ?? [];
  }

  const [datum, sidor, ord] = await Promise.all([
    fraga(['date'], 1),
    fraga(['page'], 50),
    fraga(['query'], 50),
  ]);

  const forsta = datum[0];
  const dagsrad: GscDagsrad | null = forsta
    ? {
        clicks: forsta.clicks ?? 0,
        impressions: forsta.impressions ?? 0,
        ctr: forsta.ctr ?? 0,
        position: forsta.position ?? 0,
      }
    : null;

  const karta = (rader: typeof sidor) =>
    rader.map((r) => ({
      nyckel: String(r.keys?.[0] ?? ''),
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    }));

  return { dagsrad, toppsidor: karta(sidor), toppord: karta(ord) };
}

// ---------------------------------------------------------------------------
// Delsteg: PostHog
// ---------------------------------------------------------------------------

/** Mandagen i den vecka datumet ligger i, som YYYY-MM-DD. */
export function veckansMandag(dag: string): string {
  const d = new Date(`${dag}T12:00:00Z`);
  const veckodag = (d.getUTCDay() + 6) % 7; // mandag = 0
  d.setUTCDate(d.getUTCDate() - veckodag);
  return d.toISOString().slice(0, 10);
}

/** Trattens steg i ordning. Vag 2 laser dem ur admin_funnel_weekly. */
export const FUNNEL_STEG = [
  'pageview',
  'signup_gate_shown',
  'signup_started',
  'signup_completed',
  'paywall_shown',
  'paywall_cta_clicked',
  'subscription_paid',
] as const;

const POSTHOG_EVENT: Record<string, string> = {
  pageview: '$pageview',
  signup_gate_shown: 'signup_gate_shown',
  signup_started: 'signup_started',
  signup_completed: 'signup_completed',
  paywall_shown: 'paywall_shown',
  paywall_cta_clicked: 'paywall_cta_clicked',
  subscription_paid: 'subscription_paid',
};

/** En HogQL-fraga. Samma form som scripts/posthog-query.ts. */
export async function hogql(
  query: string
): Promise<{ columns: string[]; results: unknown[][] } | null> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.POSTHOG_HOST ?? 'https://eu.posthog.com';
  if (!key || !projectId) return null;

  const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `PostHog ${res.status}: ${data?.detail ?? JSON.stringify(data).slice(0, 200)}`
    );
  }
  return { columns: data.columns ?? [], results: data.results ?? [] };
}

/**
 * Tratten for veckan som dagen ligger i. En enda HogQL-fraga for alla steg:
 * PostHogs personal API har kvot per minut och per timme, och en fraga per
 * steg hade varit sju ganger sa manga anrop utan att ge mer.
 */
export async function samlaFunnel(
  dag: string
): Promise<Array<{ vecka: string; kalla: string; steg: string; antal: number }> | null> {
  const vecka = veckansMandag(dag);
  const namn = Object.values(POSTHOG_EVENT)
    .map((e) => `'${e}'`)
    .join(', ');

  const svar = await hogql(
    `select event, count(distinct person_id) as antal
     from events
     where timestamp >= toDateTime('${vecka} 00:00:00')
       and timestamp < toDateTime('${vecka} 00:00:00') + interval 7 day
       and event in (${namn})
     group by event`
  );
  if (!svar) return null;

  const perEvent = new Map<string, number>();
  for (const rad of svar.results) {
    perEvent.set(String(rad[0]), Number(rad[1]) || 0);
  }

  return FUNNEL_STEG.map((steg) => ({
    vecka,
    kalla: 'alla',
    steg,
    antal: perEvent.get(POSTHOG_EVENT[steg]) ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// Delsteg: Supabase
// ---------------------------------------------------------------------------

export interface SupabaseDelresultat {
  new_accounts: number;
  active_users: number;
  emails_sent: number;
  emails_opened: number;
  ai_cost_sek: number | null;
}

/**
 * Supabase-aggregaten for dygnet.
 *
 * event_type i email_events ar delivered, opened, clicked och bounced, utan
 * email.-prefix. En fraga som filtrerar pa email.delivered returnerar noll
 * och ser ut som ett trasigt system. Konstanterna bor i
 * src/lib/admin/email.ts och importeras darifran.
 */
export async function samlaSupabase(
  admin: Admin,
  dag: string
): Promise<SupabaseDelresultat> {
  const { start, slut } = dygnsgranser(dag);
  const franIso = start.toISOString();
  const tillIso = slut.toISOString();

  const raknare = async (
    tabell: string,
    kolumn: string
  ): Promise<number> => {
    const { count } = await admin
      .from(tabell)
      .select('*', { count: 'exact', head: true })
      .gte(kolumn, franIso)
      .lt(kolumn, tillIso);
    return count ?? 0;
  };

  const new_accounts = await raknare('profiles', 'created_at');

  // Unika anvandare med minst en aktivitet under dygnet.
  const { data: aktiva } = await admin
    .from('user_activities')
    .select('user_id')
    .gte('created_at', franIso)
    .lt('created_at', tillIso)
    .limit(50000);
  const active_users = new Set(
    (aktiva ?? []).map((r: { user_id: string | null }) => r.user_id).filter(Boolean)
  ).size;

  const emails_sent = await raknare('email_log', 'sent_at');

  const { count: oppnade } = await admin
    .from('email_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'opened')
    .gte('created_at', franIso)
    .lt('created_at', tillIso);
  const emails_opened = oppnade ?? 0;

  // AI-kostnaden ligger i ai_usage_costs. Saknas tabellen pa en miljo ska det
  // bli null, inte ett kastat fel som tar ner hela insamlingen.
  let ai_cost_sek: number | null = null;
  try {
    const { data: kostnader } = await admin
      .from('ai_usage_costs')
      .select('cost_sek')
      .gte('created_at', franIso)
      .lt('created_at', tillIso)
      .limit(20000);
    if (kostnader) {
      ai_cost_sek = kostnader.reduce(
        (s: number, r: { cost_sek: number | null }) => s + (Number(r.cost_sek) || 0),
        0
      );
    }
  } catch {
    ai_cost_sek = null;
  }

  return { new_accounts, active_users, emails_sent, emails_opened, ai_cost_sek };
}

// ---------------------------------------------------------------------------
// Sammanhallande
// ---------------------------------------------------------------------------

/**
 * Samlar in en dag och skriver den till admin_daily_metrics plus
 * admin_gsc_daily och admin_funnel_weekly.
 *
 * Idempotent per dag: upsert pa primarnyckeln, sa en omkorning skriver over
 * samma rad i stallet for att lagga till en ny. Det ar hela poangen med
 * on-demand-pafyllningen: adminen kan be om dagens rad igen utan att datan
 * dubbleras.
 */
export async function collectAdminMetrics(
  admin: Admin,
  dag: string = dagStr(),
  val: { hoppaGsc?: boolean; hoppaPosthog?: boolean } = {}
): Promise<CollectResultat> {
  const delsteg: CollectResultat['delsteg'] = {};
  const fel: string[] = [];

  const rad: DagligaMetrik = {
    dag,
    mrr_ore: null,
    revenue_ore: null,
    new_paying: null,
    churned: null,
    active_subs: null,
    trialing_subs: null,
    failed_payments: null,
    new_accounts: null,
    active_users: null,
    gsc_clicks: null,
    gsc_impressions: null,
    gsc_ctr: null,
    gsc_position: null,
    emails_sent: null,
    emails_opened: null,
    ai_cost_sek: null,
  };

  // Stripe
  try {
    const s = await medTimeout('Stripe', samlaStripe(dag));
    if (s) {
      Object.assign(rad, s);
      delsteg.stripe = 'ok';
    } else {
      delsteg.stripe = 'hoppat';
    }
  } catch (err) {
    delsteg.stripe = 'fel';
    const m = err instanceof Error ? err.message : String(err);
    fel.push(`stripe: ${m}`);
    await loggaAdminFel(admin, 'cron', `collect/stripe ${dag}: ${m}`);
  }

  // GSC
  if (val.hoppaGsc) {
    delsteg.gsc = 'hoppat';
  } else {
    try {
      const g = await medTimeout('GSC', samlaGsc(dag));
      if (g) {
        if (g.dagsrad) {
          rad.gsc_clicks = g.dagsrad.clicks;
          rad.gsc_impressions = g.dagsrad.impressions;
          rad.gsc_ctr = g.dagsrad.ctr;
          rad.gsc_position = g.dagsrad.position;
        }
        // En dag utan rader lamnas som null: GSC ligger ungefar tva dagar
        // efter, och en nolla dar hade last som ett ras.

        const gscRader = [
          ...g.toppsidor.map((r) => ({ ...r, dimension: 'page' })),
          ...g.toppord.map((r) => ({ ...r, dimension: 'query' })),
        ].map((r) => ({
          dag,
          dimension: r.dimension,
          nyckel: r.nyckel,
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
        }));

        if (gscRader.length) {
          await admin
            .from('admin_gsc_daily')
            .upsert(gscRader, { onConflict: 'dag,dimension,nyckel' });
        }
        delsteg.gsc = 'ok';
      } else {
        delsteg.gsc = 'hoppat';
      }
    } catch (err) {
      delsteg.gsc = 'fel';
      const m = err instanceof Error ? err.message : String(err);
      fel.push(`gsc: ${m}`);
      await loggaAdminFel(admin, 'cron', `collect/gsc ${dag}: ${m}`);
    }
  }

  // PostHog
  if (val.hoppaPosthog) {
    delsteg.posthog = 'hoppat';
  } else {
    try {
      const f = await medTimeout('PostHog', samlaFunnel(dag));
      if (f && f.length) {
        await admin
          .from('admin_funnel_weekly')
          .upsert(f, { onConflict: 'vecka,kalla,steg' });
        delsteg.posthog = 'ok';
      } else {
        delsteg.posthog = 'hoppat';
      }
    } catch (err) {
      delsteg.posthog = 'fel';
      const m = err instanceof Error ? err.message : String(err);
      fel.push(`posthog: ${m}`);
      await loggaAdminFel(admin, 'cron', `collect/posthog ${dag}: ${m}`);
    }
  }

  // Supabase
  try {
    const s = await medTimeout('Supabase', samlaSupabase(admin, dag));
    rad.new_accounts = s.new_accounts;
    rad.active_users = s.active_users;
    rad.emails_sent = s.emails_sent;
    rad.emails_opened = s.emails_opened;
    rad.ai_cost_sek = s.ai_cost_sek;
    delsteg.supabase = 'ok';
  } catch (err) {
    delsteg.supabase = 'fel';
    const m = err instanceof Error ? err.message : String(err);
    fel.push(`supabase: ${m}`);
    await loggaAdminFel(admin, 'cron', `collect/supabase ${dag}: ${m}`);
  }

  let skrev = false;
  try {
    const { error } = await admin
      .from('admin_daily_metrics')
      .upsert({ ...rad, uppdaterad: new Date().toISOString() }, { onConflict: 'dag' });
    if (error) throw new Error(error.message);
    skrev = true;
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    fel.push(`skrivning: ${m}`);
    await loggaAdminFel(admin, 'cron', `collect/skrivning ${dag}: ${m}`);
  }

  return { dag, skrev, delsteg, fel };
}
