/**
 * Datalagret bakom Oversikt (docs/plan-admin.md avsnitt 4.1, omgjord efter
 * spec-admin-tydlighet 2026-09-22).
 *
 * Allt som star pa /admin utom kopen kommer harifran, och harifran kommer
 * ingenting som inte redan ligger i en Supabase-tabell. Stripe, GSC och
 * PostHog ror vi inte: de samlas in av cronen och skrivs till
 * admin_daily_metrics och admin_flode_daily. Kopen (kop.ts) ar ett
 * Stripe-anrop och lases darfor av sidan i en Suspense-grans, aldrig har.
 *
 * Tva avsiktliga val i hela filen:
 *
 * 1. Null ar inte noll. En dag utan GSC-svar har null i sina gsc-kolumner, och
 *    ett delta mot null ar inget delta alls, inte minus hundra procent. Alla
 *    jamforelser returnerar null nar nagon av sidorna saknas.
 * 2. Undantagna konton (agarens och testkontonas) raknas aldrig. Dagsraderna
 *    ar redan rensade av insamlingen; fragorna har rensar med uteslut().
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  hamtaDagligaMetrik,
  hamtaUndantagCachad,
  ADMIN_METRICS_TAG,
  ADMIN_CACHE_SEKUNDER,
} from '@/lib/admin/metrics';
import { dagStr, type DagligaMetrik } from '@/lib/admin/collect';
import { uteslut } from '@/lib/admin/undantag';
import {
  senasteDagMedVarde,
  senasteMedVarde,
  STRIPE_LEDARE,
  GSC_LEDARE,
  SUPABASE_LEDARE,
} from '@/lib/admin/senasteMedData';
import {
  DYGN_MS,
  svenskDag,
  svenskMidnatt,
  provperiodHandelse,
  kontoHandelse,
  sparHandelser,
  uppsagningHandelser,
  felHandelse,
  mrrPaketText,
  gscVecka,
  type Handelse,
  type GscVecka,
  type SparRad,
} from './sedanIgar';

/** Talkolumnerna i admin_daily_metrics som Oversikt jamfor over tid. */
export type MetrikNyckel = Exclude<keyof DagligaMetrik, 'dag'>;

/**
 * Ett tal med sina tva jamforelser.
 *
 * varde ar null nar dagen saknar matningen, till exempel GSC-dagarna som
 * annu inte kommit fran Google. Da ar bada deltana ocksa null.
 */
export interface Tal {
  varde: number | null;
  /** Skillnad mot i gar i absoluta tal, null nar nagon av dagarna saknas. */
  motIgar: number | null;
  /** Skillnad mot samma veckodag forra veckan. */
  motForraVeckan: number | null;
}

/**
 * En sjudagarssumma med sin jamforelse mot de sju dagarna innan.
 */
export interface Veckotal {
  varde: number;
  /** varde minus samma summa for de sju dagarna dessforinnan. */
  delta: number;
}

export interface SeriePunkt {
  dag: string;
  /** MRR i kronor, avrundat. Null nar dagen saknar matning. */
  mrr: number | null;
  /** Nya betalande samma dag. */
  nyaBetalande: number | null;
}

export interface OversiktData {
  /** Dagen talen galler, YYYY-MM-DD i svensk tid. */
  dag: string;
  /** Senaste dag med GSC-siffror, eller null om ingen av de 30 har det. */
  senasteGscDag: string | null;
  /** Senaste dag med Stripe-siffror. MRR-kortet star pa den dagen. */
  senasteStripeDag: string | null;

  /** Pengar. Intakt, engangskop och nya betalande kommer ur kop.ts pa sidan. */
  intakter: {
    mrrOre: Tal;
    /** "3 × Hela paketet, en månad 149 kr" ur active_*-kolumnerna. */
    mrrPaket: string;
    aktivaPren: Tal;
    misslyckade7: number;
    churnade7: number;
  };

  /** Folk. */
  trafik: {
    gscKlick: Tal;
    gscVisningar: Tal;
    gscPosition: Tal;
    /** Sju dagar med GSC-data mot de sju med data innan. */
    gsc: GscVecka;
    nyaKonton: Tal;
    nyaKonton7: number;
    nyaKontonForra7: number;
    nyaKonton30: number;
  };

  /**
   * Appens provperioder som fortfarande lever: trialkalla och premium_until
   * efter nu. Stripes kortkravande provperiod saljs inte langre och raknas
   * inte.
   */
  provperioder: { kvar: number; sista: string | null };

  /** "Sedan i gar" utan kopen, som kommer ur Stripe i en Suspense-grans. */
  sedanIgar: Handelse[];

  /** Vad gor de? */
  anvandning: {
    aktiva: Tal;
    aktiva7: number;
    handelser7: number;
    profiler: number;
    cvUppladdade7: Veckotal;
    brevSkapade7: Veckotal;
    testerSlutforda7: Veckotal;
    mallarNedladdade7: Veckotal;
  };

  /** Fungerar mejlen? */
  mejl: {
    skickade7: number;
    oppnade7: number;
    /** Oppnandegrad i procent, aldrig over 100. Null nar inget skickats. */
    oppnandegrad: number | null;
    skickadeForra7: number;
  };

  /** Fungerar systemet? */
  drift: {
    fel24: number;
    fel7: number;
    senasteFel: { kalla: string; meddelande: string; nar: string } | null;
    aiKostnad7: number | null;
    /** Timmar sedan admin_daily_metrics senast skrevs. Null om tabellen ar tom. */
    timmarSedanInsamling: number | null;
  };

  /** 30 dagar, aldst forst, for diagrammet. */
  serie: SeriePunkt[];
}

// ---------------------------------------------------------------------------
// Sma raknare
// ---------------------------------------------------------------------------

export function nummer(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}

/** Skillnad mellan tva matningar. Saknas nagon av dem finns inget delta. */
export function delta(nu: number | null, da: number | null): number | null {
  if (nu === null || da === null) return null;
  return nu - da;
}

/**
 * Bygger ett Tal ur tre dagsrader, uppslagna pa datum och inte pa index.
 */
export function tal(
  rader: Map<string, DagligaMetrik>,
  dag: string,
  igar: string,
  forraVeckan: string,
  nyckel: MetrikNyckel
): Tal {
  const varde = nummer(rader.get(dag)?.[nyckel]);
  return {
    varde,
    motIgar: delta(varde, nummer(rader.get(igar)?.[nyckel])),
    motForraVeckan: delta(varde, nummer(rader.get(forraVeckan)?.[nyckel])),
  };
}

/** Summerar en kolumn over ett antal dagar bakat, luckor hoppas over. */
export function summa(
  rader: DagligaMetrik[],
  nyckel: MetrikNyckel,
  antalDagar: number,
  hoppaOver = 0
): number {
  let s = 0;
  for (const rad of rader.slice(hoppaOver, hoppaOver + antalDagar)) {
    s += nummer(rad[nyckel]) ?? 0;
  }
  return s;
}

/**
 * Sjudagarssumman och dess delta mot veckan innan, ur en kolumn. Luckor
 * raknas som noll i summan.
 */
export function veckotal(rader: DagligaMetrik[], nyckel: MetrikNyckel): Veckotal {
  const nu = summa(rader, nyckel, 7);
  return { varde: nu, delta: nu - summa(rader, nyckel, 7, 7) };
}

/** Flyttar ett YYYY-MM-DD ett antal dagar bakat. */
export function dagBakat(dag: string, antal: number): string {
  const d = new Date(`${dag}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - antal);
  return d.toISOString().slice(0, 10);
}

/**
 * Oppnandegraden i procent med en decimal. Insamlingen raknar per utskick,
 * sa den ska aldrig passera 100; taket ar ett skydd mot gamla dagsrader.
 */
export function oppnandegrad(skickade: number, oppnade: number): number | null {
  if (skickade <= 0) return null;
  return Math.min(100, Math.round((oppnade / skickade) * 1000) / 10);
}

// ---------------------------------------------------------------------------
// De aggregat som inte ligger i admin_daily_metrics
// ---------------------------------------------------------------------------

const TRIALKALLOR = ['signup_trial', 'oauth_signup_trial'];

interface Sidoaggregat {
  fel24: number;
  fel7: number;
  senasteFel: { kalla: string; meddelande: string; nar: string } | null;
  handelser7: number;
  aktiva7: number;
  profiler: number;
  provKvar: number;
  provSista: string | null;
  /** Supabase-delen av "Sedan i gar". */
  sedanIgar: Handelse[];
}

/**
 * Sma fragor mot Supabase, cachade 15 minuter. Alla utesluter undantagna
 * konton dar raden har ett konto.
 */
const hamtaSidoaggregat = unstable_cache(
  async (): Promise<Sidoaggregat> => {
    const admin = getSupabaseAdmin() as any;
    const nu = new Date();
    const dygn = new Date(nu.getTime() - DYGN_MS).toISOString();
    const vecka = new Date(nu.getTime() - 7 * DYGN_MS).toISOString();
    const idag = svenskDag(nu);
    const igar = dagBakat(idag, 1);
    const midnatt = svenskMidnatt(nu).toISOString();

    const tomt: Sidoaggregat = {
      fel24: 0,
      fel7: 0,
      senasteFel: null,
      handelser7: 0,
      aktiva7: 0,
      profiler: 0,
      provKvar: 0,
      provSista: null,
      sedanIgar: [],
    };

    try {
      const u = await hamtaUndantagCachad();

      const [
        fel24Res,
        fel7Res,
        senasteRes,
        aktivitetRes,
        radRes,
        provKvarRes,
        provUtRes,
        nyaRes,
        sparRes,
      ] = await Promise.all([
        admin
          .from('admin_error_log')
          .select('kalla, created_at')
          .gte('created_at', dygn)
          .limit(500),
        admin
          .from('admin_error_log')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', vecka),
        admin
          .from('admin_error_log')
          .select('kalla, meddelande, created_at')
          .order('created_at', { ascending: false })
          .limit(1),
        uteslut(
          admin.from('user_activities').select('user_id').gte('created_at', vecka),
          'user_id',
          u,
          true
        ).limit(20000),
        uteslut(
          admin.from('profiles').select('id', { count: 'exact', head: true }),
          'id',
          u
        ),
        // Provperioder kvar: trialkalla och premium_until efter nu.
        uteslut(
          admin
            .from('profiles')
            .select('premium_until')
            .in('premium_source', TRIALKALLOR)
            .gt('premium_until', nu.toISOString()),
          'id',
          u
        ).limit(5000),
        // Provperioder som gick ut senaste dygnet.
        uteslut(
          admin
            .from('profiles')
            .select('premium_until')
            .in('premium_source', TRIALKALLOR)
            .gte('premium_until', dygn)
            .lte('premium_until', nu.toISOString()),
          'id',
          u
        ).limit(5000),
        // Nya konton sedan midnatt svensk tid.
        uteslut(
          admin.from('profiles').select('created_at').gte('created_at', midnatt),
          'id',
          u
        ).limit(5000),
        // Personer som valde spar, i dag och i gar. PostHog-insamlingen
        // utesluter redan undantagna.
        admin
          .from('admin_flode_daily')
          .select('dag, dimension, personer, uppdaterad')
          .eq('handelse', 'track_selected')
          .in('dag', [idag, igar]),
      ]);

      const unika = new Set<string>();
      for (const rad of (aktivitetRes.data ?? []) as Array<{ user_id: string | null }>) {
        if (rad.user_id) unika.add(rad.user_id);
      }

      const senaste = ((senasteRes.data ?? []) as Array<{
        kalla: string;
        meddelande: string;
        created_at: string;
      }>)[0];

      const provKvar = ((provKvarRes.data ?? []) as Array<{ premium_until: string }>).map(
        (r) => r.premium_until
      );
      const fel24 = (fel24Res.data ?? []) as Array<{ kalla: string; created_at: string }>;

      const sedanIgar: Handelse[] = [
        provperiodHandelse(
          ((provUtRes.data ?? []) as Array<{ premium_until: string }>).map((r) => r.premium_until)
        ),
        kontoHandelse(
          ((nyaRes.data ?? []) as Array<{ created_at: string }>).map((r) => r.created_at),
          idag
        ),
        ...sparHandelser((sparRes.data ?? []) as SparRad[]),
        felHandelse(fel24),
      ].filter((h): h is Handelse => h !== null);

      return {
        fel24: fel24.length,
        fel7: fel7Res.count ?? 0,
        senasteFel: senaste
          ? { kalla: senaste.kalla, meddelande: senaste.meddelande, nar: senaste.created_at }
          : null,
        handelser7: (aktivitetRes.data ?? []).length,
        aktiva7: unika.size,
        profiler: radRes.count ?? 0,
        provKvar: provKvar.length,
        provSista: provKvar.length ? provKvar.reduce((a, b) => (a > b ? a : b)) : null,
        sedanIgar,
      };
    } catch (fel) {
      console.error('[admin/oversikt] sidoaggregaten gick inte att lasa:', fel);
      return tomt;
    }
  },
  ['admin-oversikt-sidoaggregat-v2'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

// ---------------------------------------------------------------------------
// Sammanstallningen
// ---------------------------------------------------------------------------

/**
 * Allt Oversikt behover utom kopen, i ett anrop. Tva cachade lasningar som
 * gar parallellt, bada med adminens tagg, sa "Hamta nu" rensar bada.
 */
export async function hamtaOversikt(): Promise<OversiktData> {
  const [rader, sido] = await Promise.all([hamtaDagligaMetrik(30), hamtaSidoaggregat()]);

  const index = new Map<string, DagligaMetrik>();
  for (const rad of rader) index.set(String(rad.dag), rad);

  // Dagen vi visar ar senaste raden med data, inte senaste raden i tabellen:
  // "Hamta nu" kan skriva en rad for i dag dar delstegen inte hunnit klart.
  const ramDag =
    senasteDagMedVarde(rader, SUPABASE_LEDARE) ??
    senasteDagMedVarde(rader, STRIPE_LEDARE) ??
    (rader.length ? String(rader[0].dag) : dagStr());
  const dag = String(ramDag);
  const igar = dagBakat(dag, 1);
  const forraVeckan = dagBakat(dag, 7);

  const t = (nyckel: MetrikNyckel) => tal(index, dag, igar, forraVeckan, nyckel);

  /** Ett Tal for en kolumn vars kalla kan ligga efter. */
  const tMed = (ledare: string, nyckel: MetrikNyckel): Tal => {
    const ankare = senasteDagMedVarde(rader, ledare);
    if (!ankare) return { varde: null, motIgar: null, motForraVeckan: null };
    return tal(index, ankare, dagBakat(ankare, 1), dagBakat(ankare, 7), nyckel);
  };

  const tStripe = (nyckel: MetrikNyckel) => tMed(STRIPE_LEDARE, nyckel);
  const tGsc = (nyckel: MetrikNyckel) => tMed(GSC_LEDARE, nyckel);

  const senasteGscDag = senasteDagMedVarde(rader, GSC_LEDARE);
  const senasteStripeDag = senasteDagMedVarde(rader, STRIPE_LEDARE);

  const skickade7 = summa(rader, 'emails_sent', 7);
  const oppnade7 = summa(rader, 'emails_opened', 7);

  const aiKostnad7 = rader.slice(0, 7).some((r) => nummer(r.ai_cost_sek) !== null)
    ? Math.round(summa(rader, 'ai_cost_sek', 7) * 100) / 100
    : null;

  const senastUppdaterad = (rader[0] as { uppdaterad?: string } | undefined)?.uppdaterad;

  const idag = svenskDag(new Date());

  return {
    dag,
    senasteGscDag: senasteGscDag ? String(senasteGscDag) : null,
    senasteStripeDag: senasteStripeDag ? String(senasteStripeDag) : null,

    intakter: {
      mrrOre: tStripe('mrr_ore'),
      mrrPaket: mrrPaketText(senasteMedVarde(rader, STRIPE_LEDARE)),
      aktivaPren: tStripe('active_subs'),
      misslyckade7: summa(rader, 'failed_payments', 7),
      churnade7: summa(rader, 'churned', 7),
    },

    trafik: {
      gscKlick: tGsc('gsc_clicks'),
      gscVisningar: tGsc('gsc_impressions'),
      gscPosition: tGsc('gsc_position'),
      gsc: gscVecka(rader),
      nyaKonton: t('new_accounts'),
      nyaKonton7: summa(rader, 'new_accounts', 7),
      nyaKontonForra7: summa(rader, 'new_accounts', 7, 7),
      nyaKonton30: summa(rader, 'new_accounts', 30),
    },

    provperioder: { kvar: sido.provKvar, sista: sido.provSista },

    sedanIgar: [
      ...sido.sedanIgar,
      ...uppsagningHandelser(
        rader as Array<DagligaMetrik & { uppdaterad?: string | null }>,
        idag
      ),
    ],

    anvandning: {
      aktiva: t('active_users'),
      aktiva7: sido.aktiva7,
      handelser7: sido.handelser7,
      profiler: sido.profiler,
      cvUppladdade7: veckotal(rader, 'cv_uploaded'),
      brevSkapade7: veckotal(rader, 'letters_created'),
      testerSlutforda7: veckotal(rader, 'tests_completed'),
      mallarNedladdade7: veckotal(rader, 'templates_downloaded'),
    },

    mejl: {
      skickade7,
      oppnade7,
      oppnandegrad: oppnandegrad(skickade7, oppnade7),
      skickadeForra7: summa(rader, 'emails_sent', 7, 7),
    },

    drift: {
      fel24: sido.fel24,
      fel7: sido.fel7,
      senasteFel: sido.senasteFel,
      aiKostnad7,
      timmarSedanInsamling: senastUppdaterad
        ? Math.max(0, Math.round((Date.now() - new Date(senastUppdaterad).getTime()) / 3600000))
        : null,
    },

    // Diagrammet vill ha aldst forst; tabellasningen ger senaste forst.
    serie: rader
      .slice()
      .reverse()
      .map((rad) => {
        const ore = nummer(rad.mrr_ore);
        return {
          dag: String(rad.dag),
          mrr: ore === null ? null : Math.round(ore / 100),
          nyaBetalande: nummer(rad.new_paying),
        };
      }),
  };
}
