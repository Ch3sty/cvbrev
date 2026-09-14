/**
 * Datalagret for /admin/installningar (docs/plan-admin.md avsnitt 4.9).
 *
 * Allt som star har gar att svara pa utan att rora ett externt API. Stripe
 * ligger i en egen rutt som sidan hamtar efterat, eftersom ett Stripe-anrop i
 * serverrenderingen gor LCP under 1,5 sekunder omojligt.
 *
 * Cron-status ar ett specialfall. Det finns ingen cron-loggtabell i
 * databasen, och en tredje post i vercel.json deployar men kors aldrig, sa en
 * egen loggrutt hade inte hjalpt. Statusen harleds i stallet ur de spar
 * cronen faktiskt lamnar: uppdaterad-stamplarna i admin_daily_metrics,
 * radernas taeckning per kalla, och felen i admin_error_log. Det ar inte en
 * korningslogg, och sidan sager det rakt ut i stallet for att latsas.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { PLANS, type Plan, type PlanKey } from '@/lib/plans/plans';

// ---------------------------------------------------------------------------
// Priser och planer
// ---------------------------------------------------------------------------

/**
 * Env-variabeln per produktsteg.
 *
 * Speglar ENV_BY_PLAN i src/lib/stripe/planPrices.ts. Den filen exporterar
 * bara getStripePriceId, som kastar nar variabeln saknas, och en
 * installningssida som kraschar pa ett saknat pris ar precis fel: det ar den
 * sidan som ska visa att priset saknas.
 */
const ENV_PER_PLAN: Record<PlanKey, string> = {
  daypass: 'STRIPE_PRICE_DAYPASS',
  week: 'STRIPE_PRICE_WEEK',
  month: 'NEXT_PUBLIC_STRIPE_PRICE_ID',
  quarter: 'STRIPE_PRICE_QUARTER',
};

/** Vad steget ska vara i Stripe, enligt PLANS. */
export interface PlanForvantan {
  plan: Plan;
  /** Namnet pa env-variabeln, sa att ett saknat pris gar att atgarda direkt. */
  envNamn: string;
  /** Price-id ur miljon, eller null nar variabeln inte ar satt. */
  prisId: string | null;
  /** Beloppet i ore som PLANS sager. */
  forvantatOreEtt: number;
  /** Prenumeration eller engang, enligt PLANS. */
  forvantadTyp: 'one_time' | 'recurring';
  /** Manader per debitering enligt PLANS. Null for engangskop. */
  forvantadePerioderIManader: number | null;
}

/**
 * Antal manader per debitering for de tva prenumerationsstegen.
 *
 * PLANS beskriver steget i text ("for 3 manader"), inte i ett falt. Kvartal ar
 * tre manader, manad ar en. Engangskop har ingen period alls: de ger
 * premium_until plus days.
 */
const MANADER_PER_PLAN: Partial<Record<PlanKey, number>> = {
  month: 1,
  quarter: 3,
};

export function hamtaPlanForvantningar(): PlanForvantan[] {
  return PLANS.map((plan) => {
    const envNamn = ENV_PER_PLAN[plan.key];
    return {
      plan,
      envNamn,
      prisId: process.env[envNamn] ?? null,
      forvantatOreEtt: plan.amount * 100,
      forvantadTyp: plan.kind,
      forvantadePerioderIManader: MANADER_PER_PLAN[plan.key] ?? null,
    };
  });
}

/**
 * Forvantan i den form som gar over servergransen.
 *
 * Plan ar en readonly-struktur med highlights och copytext som
 * klientkomponenten inte behover, och som skulle folja med i RSC-nyttolasten
 * om hela objektet skickades. Raden bar bara det jamforelsen laser.
 */
export interface ForvantanRad {
  nyckel: string;
  namn: string;
  envNamn: string;
  prisId: string | null;
  forvantatOreEtt: number;
  forvantadTyp: 'one_time' | 'recurring';
  forvantadePerioderIManader: number | null;
}

/**
 * Omvandlingen ligger har och inte i komponentfilen.
 *
 * En funktion som exporteras ur en 'use client'-fil gar inte att anropa fran
 * servern. Next kastar "Attempted to call tillRad() from the server but
 * tillRad is on the client", sidan renderar tomt och svarar anda 200, sa felet
 * syns varken i statuskoden eller i webblasaren.
 */
export function tillRad(f: PlanForvantan): ForvantanRad {
  return {
    nyckel: f.plan.key,
    namn: f.plan.name,
    envNamn: f.envNamn,
    prisId: f.prisId,
    forvantatOreEtt: f.forvantatOreEtt,
    forvantadTyp: f.forvantadTyp,
    forvantadePerioderIManader: f.forvantadePerioderIManader,
  };
}

// ---------------------------------------------------------------------------
// Adminanvandare
// ---------------------------------------------------------------------------

export interface AdminAnvandare {
  id: string;
  roll: string;
  epost: string | null;
  namn: string | null;
  skapad: string | null;
  senastInloggad: string | null;
}

/**
 * Adminanvandarna ur admin_users, med e-post fran profiles.
 *
 * Tabellen ar RLS-last och nas bara med service role, vilket ar poangen: det
 * ar den har listan som avgor vem som slipper in i hela adminen.
 */
export async function hamtaAdminAnvandare(): Promise<AdminAnvandare[]> {
  const admin = getSupabaseAdmin() as any;

  const { data, error } = await admin
    .from('admin_users')
    .select('id, role, created_at, last_login')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[admin/installningar] admin_users:', error);
    return [];
  }

  const rader = (data ?? []) as Array<{
    id: string;
    role: string | null;
    created_at: string | null;
    last_login: string | null;
  }>;

  if (!rader.length) return [];

  const { data: profiler } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .in(
      'id',
      rader.map((r) => r.id)
    );

  const per = new Map(
    ((profiler ?? []) as Array<{ id: string; email: string | null; full_name: string | null }>).map(
      (p) => [p.id, p]
    )
  );

  return rader.map((r) => ({
    id: r.id,
    roll: r.role ?? 'okänd',
    epost: per.get(r.id)?.email ?? null,
    namn: per.get(r.id)?.full_name ?? null,
    skapad: r.created_at,
    senastInloggad: r.last_login,
  }));
}

// ---------------------------------------------------------------------------
// Cron-status
// ---------------------------------------------------------------------------

export interface CronDelsteg {
  namn: string;
  /** Kort beskrivning av vad delsteget lamnar for spar. */
  spar: string;
  /** Senaste dag med data, eller null nar ingen rad har det. */
  senasteDag: string | null;
  /** Hur manga av de senaste 14 dagarna som har ett varde. */
  taeckning14: number;
  ton: 'positiv' | 'varning' | 'neutral';
}

export interface CronStatus {
  /** Senaste uppdaterad-stampel i admin_daily_metrics. */
  senasteKorning: string | null;
  /** Timmar sedan dess, avrundat. */
  timmarSedan: number | null;
  /** Antal dagsrader totalt. */
  dagsrader: number;
  delsteg: CronDelsteg[];
  fel: AdminFel[];
  /** Cronens tva slottar enligt vercel.json. */
  slottar: Array<{ schema: string; beskrivning: string }>;
}

export interface AdminFel {
  id: string;
  kalla: string;
  rutt: string | null;
  meddelande: string;
  antal: number;
  tidpunkt: string;
}

/**
 * Cron-status harledd ur de spar cronen lamnar.
 *
 * Insamlingen skriver en rad i admin_daily_metrics per dygn och satter
 * uppdaterad. Varje delsteg (stripe, gsc, posthog, supabase) skriver sina egna
 * kolumner, och en kalla som inte svarar skriver null. Taeckningen per kolumn
 * over fjorton dagar sager darfor vilket delsteg som slutat fungera, utan att
 * det finns nagon korningslogg alls.
 *
 * GSC ligger ungefar tva dagar efter och har luckor. Dess taeckning bedoms
 * darfor mildare: tolv av fjorton ar normalt, inte ett larm.
 */
export async function hamtaCronStatus(): Promise<CronStatus> {
  const admin = getSupabaseAdmin() as any;

  const { data, error } = await admin
    .from('admin_daily_metrics')
    .select('dag, uppdaterad, mrr_ore, gsc_clicks, new_accounts, ai_cost_sek')
    .order('dag', { ascending: false })
    .limit(90);

  const rader = error
    ? []
    : ((data ?? []) as Array<{
        dag: string;
        uppdaterad: string | null;
        mrr_ore: number | null;
        gsc_clicks: number | null;
        new_accounts: number | null;
        ai_cost_sek: number | null;
      }>);

  if (error) console.error('[admin/installningar] admin_daily_metrics:', error);

  const senaste14 = rader.slice(0, 14);

  const taeckning = (valj: (r: (typeof rader)[number]) => unknown): number =>
    senaste14.filter((r) => valj(r) !== null && valj(r) !== undefined).length;

  const senasteMed = (valj: (r: (typeof rader)[number]) => unknown): string | null =>
    rader.find((r) => valj(r) !== null && valj(r) !== undefined)?.dag ?? null;

  const stampel = rader
    .map((r) => r.uppdaterad)
    .filter((v): v is string => Boolean(v))
    .sort()
    .at(-1) ?? null;

  const timmar = stampel
    ? Math.round((Date.now() - new Date(stampel).getTime()) / 3_600_000)
    : null;

  const ton = (n: number, kravs: number): CronDelsteg['ton'] =>
    n >= kravs ? 'positiv' : n === 0 ? 'neutral' : 'varning';

  const delsteg: CronDelsteg[] = [
    {
      namn: 'Stripe',
      spar: 'mrr_ore i admin_daily_metrics',
      senasteDag: senasteMed((r) => r.mrr_ore),
      taeckning14: taeckning((r) => r.mrr_ore),
      ton: ton(taeckning((r) => r.mrr_ore), 13),
    },
    {
      namn: 'Google Search Console',
      spar: 'gsc_clicks i admin_daily_metrics',
      senasteDag: senasteMed((r) => r.gsc_clicks),
      taeckning14: taeckning((r) => r.gsc_clicks),
      // GSC ligger tva dagar efter och har luckor. Tolv av fjorton ar normalt.
      ton: ton(taeckning((r) => r.gsc_clicks), 11),
    },
    {
      namn: 'Supabase-aggregaten',
      spar: 'new_accounts i admin_daily_metrics',
      senasteDag: senasteMed((r) => r.new_accounts),
      taeckning14: taeckning((r) => r.new_accounts),
      ton: ton(taeckning((r) => r.new_accounts), 13),
    },
    {
      namn: 'AI-kostnad',
      spar: 'ai_cost_sek i admin_daily_metrics',
      senasteDag: senasteMed((r) => r.ai_cost_sek),
      taeckning14: taeckning((r) => r.ai_cost_sek),
      ton: ton(taeckning((r) => r.ai_cost_sek), 13),
    },
  ];

  const { data: felData } = await admin
    .from('admin_error_log')
    .select('id, kalla, rutt, meddelande, antal, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  const fel: AdminFel[] = ((felData ?? []) as Array<Record<string, any>>).map((f) => ({
    id: f.id,
    kalla: f.kalla,
    rutt: f.rutt ?? null,
    meddelande: f.meddelande,
    antal: Number(f.antal ?? 1),
    tidpunkt: f.created_at,
  }));

  return {
    senasteKorning: stampel,
    timmarSedan: timmar,
    dagsrader: rader.length,
    delsteg,
    fel,
    slottar: [
      { schema: '0 0 * * *', beskrivning: 'Midnatt: premium, prissynk, adminmetrik' },
      { schema: '0 6 * * *', beskrivning: 'Morgon: kvot, trial, bevakning, livscykel' },
    ],
  };
}

// ---------------------------------------------------------------------------
// Kupongen retention_49_2m
// ---------------------------------------------------------------------------

/**
 * Kupongen som erbjuds i uppsagningsfloedet, enligt
 * src/app/api/subscription/retention-offer/route.ts.
 *
 * Id:t star pa tva stallen i kodbasen och maste vara samma pa bada. Sidan
 * markerar raden i Stripes kuponglista sa att ett namnbyte i Stripe syns som
 * en saknad kupong i stallet for att tyst sluta fungera.
 */
export const RETENTIONKUPONG = 'retention_49_2m';
