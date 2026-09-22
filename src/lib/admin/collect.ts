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
  /** Rader i cv_texts inom dygnet. Sanningskälla, inte user_activities. */
  cv_uploaded: number | null;
  /** Rader i letters inom dygnet. */
  letters_created: number | null;
  /** Slutförda test inom dygnet, alla tre testtabellerna summerade. */
  tests_completed: number | null;
  /** Rader i formatted_cv_downloads inom dygnet. */
  templates_downloaded: number | null;
  /* Aktiva per paket (docs/plan-paket-och-onboarding.md avsnitt 5). Fem av
     sex raknas pa Stripe-prenumerationernas price-id; Allt-dagen ar ett
     engangskop och raknas pa giltiga premium_grants i stallet. */
  active_cv_week: number | null;
  active_test_week: number | null;
  active_all_day: number | null;
  active_all_week: number | null;
  active_all_month: number | null;
  active_all_quarter: number | null;
}

export interface CollectResultat {
  dag: string;
  skrev: boolean;
  delsteg: Record<string, 'ok' | 'fel' | 'hoppat'>;
  fel: string[];
  /** Millisekunder per delsteg plus totalt. Cronen far inte passera 60 s. */
  tider?: Record<string, number>;
  /** Dagar och veckor som aterfyllningen tog igen. */
  aterfyllt?: { gscDagar: string[]; funnelVeckor: string[]; flodeDagar?: string[] };
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
// Aktiva och MRR per paket
// ---------------------------------------------------------------------------

/**
 * De sex paketen (docs/plan-paket-och-onboarding.md, agarens beslut 1 och 4).
 * Namnen star i bestamd form, enligt beslut 6.
 */
export type PaketNyckel =
  | 'cv_week'
  | 'test_week'
  | 'all_day'
  | 'all_week'
  | 'all_month'
  | 'all_quarter';

/** Paketen i den ordning de ska staa i adminen, med lasbart namn. */
export const PAKET_ORDNING: ReadonlyArray<{ nyckel: PaketNyckel; namn: string }> = [
  { nyckel: 'cv_week', namn: 'CV-veckan' },
  { nyckel: 'test_week', namn: 'Testveckan' },
  { nyckel: 'all_day', namn: 'Allt-dagen' },
  { nyckel: 'all_week', namn: 'Allt-veckan' },
  { nyckel: 'all_month', namn: 'Allt-manaden' },
  { nyckel: 'all_quarter', namn: 'Allt-kvartalet' },
];

/** Kolumnen i admin_daily_metrics som bar antalet aktiva per paket. */
export const PAKET_KOLUMN: Record<PaketNyckel, keyof DagligaMetrik> = {
  cv_week: 'active_cv_week',
  test_week: 'active_test_week',
  all_day: 'active_all_day',
  all_week: 'active_all_week',
  all_month: 'active_all_month',
  all_quarter: 'active_all_quarter',
};

/**
 * Paketnyckel till env-namnet dar dess Stripe-price-id bor.
 *
 * Allt-dagen star med, men den ar ett engangskop och dyker aldrig upp bland
 * prenumerationerna. Den raknas pa premium_grants i stallet, se
 * raknaAllaDagen. Manaden ligger kvar pa NEXT_PUBLIC_STRIPE_PRICE_ID, som ar
 * det pris checkouten redan anvander.
 */
const PAKET_ENV: Record<PaketNyckel, string> = {
  cv_week: 'STRIPE_PRICE_CV_WEEK',
  test_week: 'STRIPE_PRICE_TEST_WEEK',
  all_week: 'STRIPE_PRICE_ALL_WEEK',
  all_day: 'STRIPE_PRICE_DAYPASS',
  all_month: 'NEXT_PUBLIC_STRIPE_PRICE_ID',
  all_quarter: 'STRIPE_PRICE_QUARTER',
};

/**
 * Price-id till paket, last ur env vid anropet.
 *
 * Vi laser env varje gang i stallet for att bygga kartan en gang vid import:
 * modulen laddas i en cron-runtime dar env satts fore anropet men inte
 * nodvandigtvis fore importen, och en tom karta hade gett sex nollor utan att
 * nagot sag fel ut.
 */
export function paketFranPrisId(prisId: string | null | undefined): PaketNyckel | null {
  if (!prisId) return null;
  for (const { nyckel } of PAKET_ORDNING) {
    const varde = process.env[PAKET_ENV[nyckel]];
    if (varde && varde === prisId) return nyckel;
  }
  return null;
}

export interface PaketSiffror {
  aktiva: number;
  /** MRR i ore, veckopriser normaliserade till manad med faktorn 52/12. */
  mrrOre: number;
}

/** Ett tomt resultat per paket, sa att alla sex alltid har en rad. */
export function tomPaketkarta(): Record<PaketNyckel, PaketSiffror> {
  return {
    cv_week: { aktiva: 0, mrrOre: 0 },
    test_week: { aktiva: 0, mrrOre: 0 },
    all_day: { aktiva: 0, mrrOre: 0 },
    all_week: { aktiva: 0, mrrOre: 0 },
    all_month: { aktiva: 0, mrrOre: 0 },
    all_quarter: { aktiva: 0, mrrOre: 0 },
  };
}

/**
 * Aktiva och normaliserad MRR per paket ur prenumerationslistan.
 *
 * Bara active och trialing raknas, precis som i mrrOreFranSubscriptions: en
 * uppsagd prenumeration som fortfarande loper ut ar inte aterkommande intakt.
 * Normaliseringen gar via manadsbeloppOre, sa ett veckopris pa 99 kr blir
 * 99 * 52/12 i manaden, inte 99. Utan den raknar sidan tre veckopaket som
 * mindre an ett manadspaket fast de ar mer.
 *
 * En prenumeration vars price-id inte matchar nagot av env-namnen hoppas
 * over: den hor till ett gammalt pris och far inte hamna pa fel paketrad.
 */
export function paketFranSubscriptions(
  subs: Array<{
    status: string;
    items?: { data?: Array<{ quantity?: number | null; price?: Stripe.Price | null }> };
  }>
): Record<PaketNyckel, PaketSiffror> {
  const karta = tomPaketkarta();

  for (const sub of subs) {
    if (sub.status !== 'active' && sub.status !== 'trialing') continue;

    // En prenumeration raknas som en aktiv pa det paket dess forsta
    // matchande rad pekar pa, aven om den skulle ha flera rader.
    let raknad: PaketNyckel | null = null;

    for (const item of sub.items?.data ?? []) {
      const pris = item.price;
      if (!pris) continue;
      const paket = paketFranPrisId(pris.id);
      if (!paket) continue;

      karta[paket].mrrOre += manadsbeloppOre(
        pris.unit_amount,
        pris.recurring?.interval ?? null,
        pris.recurring?.interval_count ?? null,
        item.quantity ?? 1
      );
      if (!raknad) raknad = paket;
    }

    if (raknad) karta[raknad].aktiva += 1;
  }

  return karta;
}

/**
 * Allt-dagen: giltiga engangsgrants med scope allt.
 *
 * Kallan ar premium_grants och inte Stripe, eftersom ett engangskop inte ar
 * en prenumeration och darfor inte finns bland subscriptions. source som
 * borjar pa onetime skiljer kopen fran admins "ge premium", som gar pa samma
 * tabell men inte ar en intakt.
 */
export async function raknaAllaDagen(admin: Admin): Promise<number> {
  const { data } = await admin
    .from('premium_grants')
    .select('user_id, source, scope, premium_until_after')
    .eq('scope', 'allt')
    .gt('premium_until_after', new Date().toISOString())
    .limit(5000);

  const koparen = new Set<string>();
  for (const rad of (data ?? []) as Array<{ user_id?: string | null; source?: string | null }>) {
    if (!rad?.user_id) continue;
    if (!(rad.source ?? '').startsWith('onetime')) continue;
    koparen.add(rad.user_id);
  }
  return koparen.size;
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
    // Rutten läses ur metadata när anroparen skickar den, så Drift-sidan
    // kan gruppera fel per rutt.
    const rutt =
      typeof metadata?.rutt === 'string' ? (metadata.rutt as string).slice(0, 200) : null;
    await admin.from('admin_error_log').insert({
      kalla,
      rutt,
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
  /** Aktiva och normaliserad MRR per paket. Allt-dagen fylls av collect. */
  paket: Record<PaketNyckel, PaketSiffror>;
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

  const paket = paketFranSubscriptions(
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
    paket,
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

/**
 * Trattens steg i ordning (D3, docs/plan-paket-och-onboarding.md avsnitt 6).
 * Vag 2 laser dem ur admin_funnel_weekly. De fyra sista bar ett paket:
 * track_selected via track, de ovriga via plan.
 */
export const FUNNEL_STEG = [
  'pageview',
  'signup_completed',
  'track_selected',
  'purchase_step_viewed',
  'checkout_started',
  'subscription_paid',
] as const;

const POSTHOG_EVENT: Record<string, string> = {
  pageview: '$pageview',
  signup_completed: 'signup_completed',
  track_selected: 'track_selected',
  purchase_step_viewed: 'purchase_step_viewed',
  checkout_started: 'checkout_started',
  subscription_paid: 'subscription_paid',
};

/** Paketen tratten delas upp pa. 'alla' ar totalen. */
export const FUNNEL_PAKET = ['alla', 'cv', 'tester', 'allt'] as const;
export type FunnelPaket = (typeof FUNNEL_PAKET)[number];

/**
 * HogQL-uttrycket som gor plan eller track till ett paket. Planerna heter
 * cv_week, test_week och all_*; sparet heter cv, tester och allt. Allt annat
 * blir tom strang och raknas bara i totalen.
 */
const HOGQL_PAKET = `multiIf(
  toString(properties.plan) like 'cv_%', 'cv',
  toString(properties.plan) like 'test_%', 'tester',
  toString(properties.plan) like 'all_%', 'allt',
  toString(properties.track) in ('cv', 'tester', 'allt'), toString(properties.track),
  '')`;

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
  const fonster = `timestamp >= toDateTime('${vecka} 00:00:00')
       and timestamp < toDateTime('${vecka} 00:00:00') + interval 7 day
       and event in (${namn})`;

  // Totalen och uppdelningen per paket i samma anrop: union all ar en
  // fraga mot kvoten, inte tva. Kolumnen kalla i admin_funnel_weekly bar
  // paketet ('alla', 'cv', 'tester', 'allt').
  const svar = await hogql(
    `select event, '' as paket, count(distinct person_id) as antal
     from events
     where ${fonster}
     group by event
     union all
     select event, ${HOGQL_PAKET} as paket, count(distinct person_id) as antal
     from events
     where ${fonster}
     group by event, paket`
  );
  if (!svar) return null;

  return byggFunnelRader(vecka, svar.results);
}

/**
 * Trattrader ur HogQL-svaret. Exporterad for testet.
 *
 * Totalen ('alla') far alla steg. Ett paket far bara de steg som faktiskt
 * bar ett paket: pageview och signup_completed vet inte vilket paket
 * besokaren kommer att valja, och en nolla dar hade last som ett ras i
 * paketets tratt.
 */
export function byggFunnelRader(
  vecka: string,
  rader: unknown[][]
): Array<{ vecka: string; kalla: string; steg: string; antal: number }> {
  const perNyckel = new Map<string, number>();
  for (const rad of rader) {
    const event = String(rad[0]);
    const paket = String(rad[1] ?? '') || 'alla';
    perNyckel.set(`${paket}|${event}`, Number(rad[2]) || 0);
  }

  const ut: Array<{ vecka: string; kalla: string; steg: string; antal: number }> = [];
  for (const paket of FUNNEL_PAKET) {
    for (const steg of FUNNEL_STEG) {
      if (paket !== 'alla' && (steg === 'pageview' || steg === 'signup_completed')) continue;
      ut.push({
        vecka,
        kalla: paket,
        steg,
        antal: perNyckel.get(`${paket}|${POSTHOG_EVENT[steg]}`) ?? 0,
      });
    }
  }
  return ut;
}

// ---------------------------------------------------------------------------
// Delsteg: PostHog, flodet per dag (admin_flode_daily)
// ---------------------------------------------------------------------------

/**
 * Handelserna /admin/flode laser, med sin dimension. Dimensionen ar det
 * sidan delar upp pa: planen for kopstegen, sparet for track_selected,
 * funktionen for sparrarna, "paket|steg" for kvitteringarna och paketet for
 * resten. Totalen skrivs alltid med tom dimension.
 */
export const FLODE_HANDELSER = [
  '$pageview',
  'signup_completed',
  'track_selected',
  'purchase_step_viewed',
  'consent_checked',
  'checkout_started',
  'subscription_paid',
  'welcome_viewed',
  'komigang_opened',
  'onboarding_step_completed',
  'onboarding_completed',
  'feature_blocked',
  'gray_option_tapped',
  'renewal_succeeded',
] as const;

/** Markorraden som sager att dagen ar insamlad, aven om inget hande. */
export const FLODE_SAMLAD = '_samlad';

const HOGQL_FLODE_DIM = `multiIf(
  event in ('purchase_step_viewed', 'consent_checked', 'checkout_started', 'subscription_paid', 'renewal_succeeded'), toString(properties.plan),
  event = 'track_selected', toString(properties.track),
  event in ('feature_blocked', 'gray_option_tapped'), toString(properties.feature),
  event = 'onboarding_step_completed', concat(toString(properties.paket), '|', toString(properties.step)),
  event in ('onboarding_completed', 'welcome_viewed', 'komigang_opened'), toString(properties.paket),
  '')`;

export interface FlodeRad {
  dag: string;
  handelse: string;
  dimension: string;
  antal: number;
  personer: number;
}

/**
 * Flodet for ett dygn: antal och unika personer per handelse, bade som
 * total (tom dimension) och per dimension. Ett HogQL-anrop per dag.
 */
export async function samlaFlode(dag: string): Promise<FlodeRad[] | null> {
  const namn = FLODE_HANDELSER.map((e) => `'${e}'`).join(', ');
  const fonster = `timestamp >= toDateTime('${dag} 00:00:00')
       and timestamp < toDateTime('${dag} 00:00:00') + interval 1 day
       and event in (${namn})`;

  const svar = await hogql(
    `select event, '' as dim, count() as antal, count(distinct person_id) as personer
     from events
     where ${fonster}
     group by event
     union all
     select event, ${HOGQL_FLODE_DIM} as dim, count() as antal, count(distinct person_id) as personer
     from events
     where ${fonster}
     group by event, dim`
  );
  if (!svar) return null;

  return byggFlodeRader(dag, svar.results);
}

/**
 * Rader ur HogQL-svaret plus markorraden. Exporterad for testet. En rad
 * med tom dimension fran den andra delen av unionen ar samma sak som
 * totalen och slas ihop med den, sa att primarnyckeln haller.
 */
export function byggFlodeRader(dag: string, rader: unknown[][]): FlodeRad[] {
  const per = new Map<string, FlodeRad>();
  for (const rad of rader) {
    const handelse = String(rad[0]).slice(0, 100);
    const dimension = String(rad[1] ?? '').slice(0, 200);
    const antal = Number(rad[2]) || 0;
    const personer = Number(rad[3]) || 0;
    const nyckel = `${handelse}|${dimension}`;
    const finns = per.get(nyckel);
    if (finns) {
      // Samma handelse utan dimension tva ganger: behall det storsta, det
      // ar totalen.
      finns.antal = Math.max(finns.antal, antal);
      finns.personer = Math.max(finns.personer, personer);
    } else {
      per.set(nyckel, { dag, handelse, dimension, antal, personer });
    }
  }
  per.set(`${FLODE_SAMLAD}|`, { dag, handelse: FLODE_SAMLAD, dimension: '', antal: 0, personer: 0 });
  return [...per.values()];
}

/** Skriver dagens floderader. Dagen toms forst sa en omkorning inte lamnar spokrader. */
async function skrivFlode(admin: Admin, dag: string, rader: FlodeRad[]): Promise<void> {
  await admin.from('admin_flode_daily').delete().eq('dag', dag);
  if (rader.length) {
    const { error } = await admin
      .from('admin_flode_daily')
      .upsert(rader, { onConflict: 'dag,handelse,dimension' });
    if (error) throw new Error(error.message);
  }
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
  cv_uploaded: number;
  letters_created: number;
  tests_completed: number;
  templates_downloaded: number;
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

  const anvandning = await samlaAnvandning(admin, dag);

  return {
    new_accounts,
    active_users,
    emails_sent,
    emails_opened,
    ai_cost_sek,
    ...anvandning,
  };
}

/** De fyra anvandningstalen for ett dygn. */
export interface AnvandningDelresultat {
  cv_uploaded: number;
  letters_created: number;
  tests_completed: number;
  templates_downloaded: number;
}

/**
 * De fyra anvandningstalen, raknade pa sina egna tabeller.
 *
 * Aldrig pa user_activities: den tabellen skrivs fire-and-forget fran
 * klienten och tappar rader nar sidan navigerar bort innan anropet hunnit
 * fram, och test_completed skrevs bara nar resultatsidan faktiskt
 * renderades. Darfor syntes varken tester eller mallnedladdningar i adminen.
 *
 * Egen funktion for att backfyllningen ska kunna skriva bara de har fyra
 * kolumnerna utan att rora Stripe-, GSC- och mejlkolumnerna i samma rad.
 * Alla fragor ar head-raekningar, alltsa inga radhamtningar.
 */
export async function samlaAnvandning(
  admin: Admin,
  dag: string
): Promise<AnvandningDelresultat> {
  const { start, slut } = dygnsgranser(dag);
  const franIso = start.toISOString();
  const tillIso = slut.toISOString();

  const raknare = async (tabell: string, kolumn: string): Promise<number> => {
    const { count } = await admin
      .from(tabell)
      .select('*', { count: 'exact', head: true })
      .gte(kolumn, franIso)
      .lt(kolumn, tillIso);
    return count ?? 0;
  };

  // Slutforda test ar summan av tre tabeller. De tva inloggade raknas pa
  // completed_at; de publika proven har inget completed_at, sa ett satt score
  // ar slutforandet dar.
  const [
    cv_uploaded,
    letters_created,
    templates_downloaded,
    logikSlut,
    personlighetSlut,
    anonSvar,
  ] = await Promise.all([
    raknare('cv_texts', 'created_at'),
    raknare('letters', 'created_at'),
    raknare('formatted_cv_downloads', 'downloaded_at'),
    raknare('logic_test_v4_sessions', 'completed_at'),
    raknare('personality_test_sessions', 'completed_at'),
    admin
      .from('anon_test_sessions')
      .select('*', { count: 'exact', head: true })
      .not('score', 'is', null)
      .gte('created_at', franIso)
      .lt('created_at', tillIso),
  ]);

  return {
    cv_uploaded,
    letters_created,
    templates_downloaded,
    tests_completed: logikSlut + personlighetSlut + (anonSvar.count ?? 0),
  };
}

// ---------------------------------------------------------------------------
// Sammanhallande
// ---------------------------------------------------------------------------

/** Toppsidorna och toppsokorden till admin_gsc_daily. Idempotent per dag. */
async function skrivGscDimensioner(
  admin: Admin,
  dag: string,
  g: GscDelresultat
): Promise<void> {
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
}

// ---------------------------------------------------------------------------
// Aterfyllning av luckor
// ---------------------------------------------------------------------------

/** Hogst sa manga GSC-dagar fylls igen per korning. */
export const ATERFYLL_GSC_MAX = 5;

/** Hogst sa manga trattveckor fylls igen per korning. */
export const ATERFYLL_FUNNEL_MAX = 2;

/** Hogst sa manga flodesdagar fylls igen per korning. */
export const ATERFYLL_FLODE_MAX = 5;

/**
 * GSC-datan ligger efter. En dag yngre an sa ar inte en lucka, den har bara
 * inte kommit fran Google an, och att fraga efter den bara branner tid.
 */
export const GSC_FORDROJNING_DAGAR = 3;

/** Fonstret bakat som aterfyllningen letar luckor i. */
export const ATERFYLL_FONSTER_DAGAR = 30;

/** Fonstret bakat for trattveckorna. */
export const ATERFYLL_FONSTER_VECKOR = 8;

/** Ett datum flyttat ett antal dygn bakat, som YYYY-MM-DD. */
export function dagBakat(dag: string, antal: number): string {
  const d = new Date(`${dag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - antal);
  return d.toISOString().slice(0, 10);
}

/**
 * Dagarna som saknar GSC och ar gamla nog att faktiskt finnas hos Google.
 *
 * Bakgrunden: admin_gsc_daily stod still pa 2026-09-12 och gsc_clicks var
 * null 13 till 20 september, darfor att Vercel saknade GSC-nycklarna.
 * Nattkorningen samlar bara gardagen, sa nycklarna kunde laggas tillbaka utan
 * att en enda av de atta dagarna nagonsin fylldes.
 *
 * Aldst forst: luckan langst bak ar den som annars aldrig hinner tas igen.
 */
export function gscLuckor(
  rader: Array<{ dag: string; gsc_clicks: number | null }>,
  idag: string,
  max = ATERFYLL_GSC_MAX
): string[] {
  const senast = dagBakat(idag, GSC_FORDROJNING_DAGAR);
  const aldst = dagBakat(idag, ATERFYLL_FONSTER_DAGAR);
  const harKlick = new Set(
    rader.filter((r) => r.gsc_clicks !== null).map((r) => r.dag)
  );

  const luckor: string[] = [];
  for (let dag = aldst; dag <= senast; dag = dagBakat(dag, -1)) {
    if (!harKlick.has(dag)) luckor.push(dag);
  }
  return luckor.slice(0, max);
}

/**
 * Veckorna i tratten som saknas helt. Innevarande vecka raknas inte som en
 * lucka: den fylls anda av dagens insamling.
 */
export function funnelLuckor(
  veckor: Array<{ vecka: string }>,
  idag: string,
  max = ATERFYLL_FUNNEL_MAX
): string[] {
  const finns = new Set(veckor.map((v) => v.vecka));
  const denna = veckansMandag(idag);

  const luckor: string[] = [];
  for (let i = ATERFYLL_FONSTER_VECKOR; i >= 1; i--) {
    const vecka = veckansMandag(dagBakat(denna, i * 7));
    if (vecka === denna) continue;
    if (!finns.has(vecka)) luckor.push(vecka);
  }
  return luckor.slice(0, max);
}

/**
 * Dagarna i admin_flode_daily som saknas helt. Markorraden _samlad gor att
 * en dag utan handelser inte ser ut som en lucka och fylls igen varje natt.
 * Dagens dag raknas inte: den fylls av nasta insamling.
 */
export function flodeLuckor(
  dagar: Array<{ dag: string }>,
  idag: string,
  max = ATERFYLL_FLODE_MAX
): string[] {
  const finns = new Set(dagar.map((d) => d.dag));
  const aldst = dagBakat(idag, ATERFYLL_FONSTER_DAGAR);
  const senast = dagBakat(idag, 1);

  const luckor: string[] = [];
  for (let dag = aldst; dag <= senast; dag = dagBakat(dag, -1)) {
    if (!finns.has(dag)) luckor.push(dag);
  }
  return luckor.slice(0, max);
}

/**
 * Tar igen GSC-luckor och trattveckor som aldrig samlats in.
 *
 * Kors efter dagens insamling, med kvarvarande tid som budget: cronen gor
 * redan fyra andra jobb och far inte passera 60 sekunder, sa aterfyllningen
 * ar det som ska falla bort nar tiden tar slut, inte dagens siffror. Den
 * avbryter darfor mellan dagarna sa fort budgeten ar slut, och varje dag har
 * kvar samma tidsgrans som ett vanligt delsteg.
 *
 * Saknas nyckeln hoppar den over steget helt i stallet for att logga ett fel
 * per dag: det var precis avsaknaden av nycklar som skapade luckorna.
 */
export async function aterfyllLuckor(
  admin: Admin,
  idag: string,
  budgetMs: number
): Promise<{ gscDagar: string[]; funnelVeckor: string[]; flodeDagar: string[]; fel: string[] }> {
  const slut = Date.now() + budgetMs;
  const gscDagar: string[] = [];
  const funnelVeckor: string[] = [];
  const flodeDagar: string[] = [];
  const fel: string[] = [];

  const harGscNyckel = Boolean(
    process.env.GSC_SERVICE_ACCOUNT_JSON && process.env.GSC_SITE_URL
  );
  const harPosthogNyckel = Boolean(
    process.env.POSTHOG_PERSONAL_API_KEY && process.env.POSTHOG_PROJECT_ID
  );

  // GSC-luckor
  if (harGscNyckel && Date.now() < slut) {
    try {
      const { data } = await admin
        .from('admin_daily_metrics')
        .select('dag, gsc_clicks')
        .gte('dag', dagBakat(idag, ATERFYLL_FONSTER_DAGAR))
        .lte('dag', idag);

      const luckor = gscLuckor(
        (data ?? []) as Array<{ dag: string; gsc_clicks: number | null }>,
        idag
      );

      for (const dag of luckor) {
        if (Date.now() >= slut) break;
        try {
          const g = await medTimeout(`GSC ${dag}`, samlaGsc(dag));
          if (!g) break; // Nyckeln forsvann mitt i. Ingen mening att fortsatta.
          if (g.dagsrad) {
            await admin.from('admin_daily_metrics').upsert(
              {
                dag,
                gsc_clicks: g.dagsrad.clicks,
                gsc_impressions: g.dagsrad.impressions,
                gsc_ctr: g.dagsrad.ctr,
                gsc_position: g.dagsrad.position,
                uppdaterad: new Date().toISOString(),
              },
              { onConflict: 'dag' }
            );
          }
          await skrivGscDimensioner(admin, dag, g);
          gscDagar.push(dag);
        } catch (err) {
          const m = err instanceof Error ? err.message : String(err);
          fel.push(`aterfyll/gsc ${dag}: ${m}`);
          await loggaAdminFel(admin, 'cron', `aterfyll/gsc ${dag}: ${m}`);
        }
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      fel.push(`aterfyll/gsc: ${m}`);
      await loggaAdminFel(admin, 'cron', `aterfyll/gsc uppslag: ${m}`);
    }
  }

  // Trattveckor
  if (harPosthogNyckel && Date.now() < slut) {
    try {
      const { data } = await admin
        .from('admin_funnel_weekly')
        .select('vecka')
        .gte('vecka', dagBakat(veckansMandag(idag), ATERFYLL_FONSTER_VECKOR * 7));

      const luckor = funnelLuckor((data ?? []) as Array<{ vecka: string }>, idag);

      for (const vecka of luckor) {
        if (Date.now() >= slut) break;
        try {
          const f = await medTimeout(`PostHog ${vecka}`, samlaFunnel(vecka));
          if (!f) break;
          if (f.length) {
            await admin
              .from('admin_funnel_weekly')
              .upsert(f, { onConflict: 'vecka,kalla,steg' });
          }
          funnelVeckor.push(vecka);
        } catch (err) {
          const m = err instanceof Error ? err.message : String(err);
          fel.push(`aterfyll/funnel ${vecka}: ${m}`);
          await loggaAdminFel(admin, 'cron', `aterfyll/funnel ${vecka}: ${m}`);
        }
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      fel.push(`aterfyll/funnel: ${m}`);
      await loggaAdminFel(admin, 'cron', `aterfyll/funnel uppslag: ${m}`);
    }
  }

  // Flodesdagar
  if (harPosthogNyckel && Date.now() < slut) {
    try {
      const { data } = await admin
        .from('admin_flode_daily')
        .select('dag')
        .eq('handelse', FLODE_SAMLAD)
        .gte('dag', dagBakat(idag, ATERFYLL_FONSTER_DAGAR));

      const luckor = flodeLuckor((data ?? []) as Array<{ dag: string }>, idag);

      for (const dag of luckor) {
        if (Date.now() >= slut) break;
        try {
          const f = await medTimeout(`PostHog flode ${dag}`, samlaFlode(dag));
          if (!f) break;
          await skrivFlode(admin, dag, f);
          flodeDagar.push(dag);
        } catch (err) {
          const m = err instanceof Error ? err.message : String(err);
          fel.push(`aterfyll/flode ${dag}: ${m}`);
          await loggaAdminFel(admin, 'cron', `aterfyll/flode ${dag}: ${m}`);
        }
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      fel.push(`aterfyll/flode: ${m}`);
      await loggaAdminFel(admin, 'cron', `aterfyll/flode uppslag: ${m}`);
    }
  }

  return { gscDagar, funnelVeckor, flodeDagar, fel };
}

/**
 * Kolumnerna som faktiskt fick ett varde, utan dag.
 *
 * Skalet till att den finns: en upsert som uttryckligen skickar null skriver
 * null, alltsa raderar den forra korningens riktiga siffror sa fort ett
 * delsteg misslyckas. Och ger alla delsteg null blir resultatet en rad som
 * ser nyast ut men inte bar nagot, vilket ar precis det som gjorde att
 * Intakter och Oversikt visade streck pa MRR.
 */
export function radUtanNull(rad: Partial<DagligaMetrik>): Record<string, number> {
  const ut: Record<string, number> = {};
  for (const [nyckel, varde] of Object.entries(rad)) {
    if (nyckel === 'dag') continue;
    if (varde === null || varde === undefined) continue;
    ut[nyckel] = varde as number;
  }
  return ut;
}

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
  val: {
    hoppaGsc?: boolean;
    hoppaPosthog?: boolean;
    /** Sant i cronen: luckor tas igen efter dagens insamling. */
    aterfyll?: boolean;
    /** Tak for hela anropet i millisekunder. Cronen har 60 s totalt. */
    budgetMs?: number;
  } = {}
): Promise<CollectResultat> {
  const delsteg: CollectResultat['delsteg'] = {};
  const fel: string[] = [];

  // Tiden mats per delsteg och loggas: cronen gor fyra andra jobb i samma 60
  // sekunder, och utan matning vet ingen vilket steg som ater budgeten.
  const start = Date.now();
  const tider: Record<string, number> = {};
  const ta = <T,>(namn: string, p: Promise<T>): Promise<T> => {
    const t0 = Date.now();
    return p.finally(() => {
      tider[namn] = Date.now() - t0;
    });
  };
  const budgetMs = val.budgetMs ?? 45_000;

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
    cv_uploaded: null,
    letters_created: null,
    tests_completed: null,
    templates_downloaded: null,
    active_cv_week: null,
    active_test_week: null,
    active_all_day: null,
    active_all_week: null,
    active_all_month: null,
    active_all_quarter: null,
  };

  // Stripe
  try {
    const s = await ta('stripe', medTimeout('Stripe', samlaStripe(dag)));
    if (s) {
      // paket ar ingen kolumn utan en karta, sa den plockas ut separat och
      // skrivs till sina sex kolumner. Object.assign hade annars lagt ett
      // objekt pa raden och upserten hade fallit pa en okand kolumn.
      const { paket, ...kolumner } = s;
      Object.assign(rad, kolumner);
      for (const { nyckel } of PAKET_ORDNING) {
        if (nyckel === 'all_day') continue;
        (rad[PAKET_KOLUMN[nyckel]] as number | null) = paket[nyckel].aktiva;
      }
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
      const g = await ta('gsc', medTimeout('GSC', samlaGsc(dag)));
      if (g) {
        if (g.dagsrad) {
          rad.gsc_clicks = g.dagsrad.clicks;
          rad.gsc_impressions = g.dagsrad.impressions;
          rad.gsc_ctr = g.dagsrad.ctr;
          rad.gsc_position = g.dagsrad.position;
        }
        // En dag utan rader lamnas som null: GSC ligger ungefar tva dagar
        // efter, och en nolla dar hade last som ett ras.

        await skrivGscDimensioner(admin, dag, g);
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
      const f = await ta('posthog', medTimeout('PostHog', samlaFunnel(dag)));
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

  // PostHog, flodet per dag. Eget delsteg med egen tidsgrans: ett fel har
  // ska inte ta trattveckan med sig, och tvartom.
  if (val.hoppaPosthog) {
    delsteg.flode = 'hoppat';
  } else {
    try {
      const f = await ta('flode', medTimeout('PostHog flode', samlaFlode(dag)));
      if (f) {
        await skrivFlode(admin, dag, f);
        delsteg.flode = 'ok';
      } else {
        delsteg.flode = 'hoppat';
      }
    } catch (err) {
      delsteg.flode = 'fel';
      const m = err instanceof Error ? err.message : String(err);
      fel.push(`flode: ${m}`);
      await loggaAdminFel(admin, 'cron', `collect/flode ${dag}: ${m}`);
    }
  }

  // Supabase
  try {
    const s = await ta('supabase', medTimeout('Supabase', samlaSupabase(admin, dag)));
    rad.new_accounts = s.new_accounts;
    rad.active_users = s.active_users;
    rad.emails_sent = s.emails_sent;
    rad.emails_opened = s.emails_opened;
    rad.ai_cost_sek = s.ai_cost_sek;
    rad.cv_uploaded = s.cv_uploaded;
    rad.letters_created = s.letters_created;
    rad.tests_completed = s.tests_completed;
    rad.templates_downloaded = s.templates_downloaded;
    // Allt-dagen ar ett engangskop och finns inte bland Stripes
    // prenumerationer. Den raknas pa giltiga premium_grants i stallet.
    rad.active_all_day = await raknaAllaDagen(admin);
    delsteg.supabase = 'ok';
  } catch (err) {
    delsteg.supabase = 'fel';
    const m = err instanceof Error ? err.message : String(err);
    fel.push(`supabase: ${m}`);
    await loggaAdminFel(admin, 'cron', `collect/supabase ${dag}: ${m}`);
  }

  // Bara kolumnerna som faktiskt fick ett varde skrivs.
  const attSkriva = radUtanNull(rad);

  let skrev = false;
  if (Object.keys(attSkriva).length === 0) {
    // Inget delsteg gav nagot. Da ror vi inte tabellen alls: en tom rad ar
    // samre an ingen rad, for den blir sidornas "senaste dag med data".
    fel.push('skrivning: inget delsteg gav varden, raden skrevs inte');
    await loggaAdminFel(
      admin,
      'cron',
      `collect/skrivning ${dag}: alla delsteg misslyckades eller hoppades, ingen rad skrevs`,
      { delsteg }
    );
  } else {
    try {
      const { error } = await admin
        .from('admin_daily_metrics')
        .upsert(
          { dag, ...attSkriva, uppdaterad: new Date().toISOString() },
          { onConflict: 'dag' }
        );
      if (error) throw new Error(error.message);
      skrev = true;
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      fel.push(`skrivning: ${m}`);
      await loggaAdminFel(admin, 'cron', `collect/skrivning ${dag}: ${m}`);
    }
  }

  // Aterfyllningen sist och med kvarvarande budget: dagens siffror gar fore,
  // och det som inte hinns med tas igen i nasta korning.
  let aterfyllt: CollectResultat['aterfyllt'];
  if (val.aterfyll) {
    const kvar = budgetMs - (Date.now() - start);
    if (kvar > 2_000) {
      const t0 = Date.now();
      const res = await aterfyllLuckor(admin, dag, kvar);
      tider.aterfyll = Date.now() - t0;
      aterfyllt = {
        gscDagar: res.gscDagar,
        funnelVeckor: res.funnelVeckor,
        flodeDagar: res.flodeDagar,
      };
      fel.push(...res.fel);
      delsteg.aterfyll =
        res.fel.length > 0
          ? 'fel'
          : res.gscDagar.length || res.funnelVeckor.length || res.flodeDagar.length
            ? 'ok'
            : 'hoppat';
    } else {
      delsteg.aterfyll = 'hoppat';
    }
  }

  tider.totalt = Date.now() - start;
  console.log(
    `[admin/collect] ${dag} klar pa ${tider.totalt} ms`,
    JSON.stringify(tider)
  );

  return { dag, skrev, delsteg, fel, tider, aterfyllt };
}
