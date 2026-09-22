/**
 * Lasningen ur admin_daily_metrics, plus on-demand-pafyllning.
 *
 * Vag 2 och 3 laser harifran, inte direkt ur tabellen och aldrig direkt mot
 * Stripe, GSC eller PostHog. En sida som kor en HogQL-fraga per sidladdning
 * spranger PostHogs kvot, och en sida som pratar med Stripe i kritiska vagen
 * klarar inte LCP under 1,5 sekunder.
 *
 * Cachen ar 15 minuter (unstable_cache). Drift-sidan ar undantaget och satter
 * sin egen kortare cache: dar gar farskhet fore.
 */

import { unstable_cache, revalidateTag } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { collectAdminMetrics, dagStr, type DagligaMetrik } from './collect';
import { hamtaUndantag, byggUndantag, type Undantag } from './undantag';

/** Cachetagg for allt som kommer ur admin_daily_metrics. */
export const ADMIN_METRICS_TAG = 'admin-metrics';

/** 15 minuter, enligt planens avsnitt 4. */
export const ADMIN_CACHE_SEKUNDER = 15 * 60;

/**
 * Dagsrader i fallande ordning, senaste forst. Cachad 15 minuter.
 *
 * Luckor returneras som de star i tabellen: en dag utan GSC-svar har null i
 * gsc-kolumnerna, och sidan ska visa "senast med data" i stallet for att anta
 * att i gar finns.
 */
export const hamtaDagligaMetrik = unstable_cache(
  async (antalDagar: number = 30): Promise<DagligaMetrik[]> => {
    const admin = getSupabaseAdmin() as any;
    const { data, error } = await admin
      .from('admin_daily_metrics')
      .select('*')
      .order('dag', { ascending: false })
      .limit(Math.max(1, Math.min(antalDagar, 365)));

    if (error) {
      console.error('[admin/metrics] kunde inte lasa admin_daily_metrics:', error);
      return [];
    }
    return (data ?? []) as DagligaMetrik[];
  },
  ['admin-daily-metrics'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

/** En enskild dag, eller null om raden inte finns. */
export const hamtaDag = unstable_cache(
  async (dag: string): Promise<DagligaMetrik | null> => {
    const admin = getSupabaseAdmin() as any;
    const { data } = await admin
      .from('admin_daily_metrics')
      .select('*')
      .eq('dag', dag)
      .maybeSingle();
    return (data as DagligaMetrik | null) ?? null;
  },
  ['admin-daily-metrics-dag'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

// Spar for on-demand-pafyllningen. Ligger i modulen, alltsa per serverinstans:
// spaerren behover inte vara exakt, den ska bara hindra att en knapptryckning
// upprepad tio ganger blir tio Stripe-rundor.
const senastPafylld = new Map<string, number>();
const PAFYLL_SPARR_MS = 15 * 60 * 1000;

export interface PafyllResultat {
  dag: string;
  kordes: boolean;
  anledning?: string;
  delsteg?: Record<string, 'ok' | 'fel' | 'hoppat'>;
}

/**
 * Fyller pa en dag on-demand, med 15 minuters sparr per dag.
 *
 * Anvands av knappen "Hamta nu" pa Intakter och av rutten metrics/refresh.
 * Cachetaggen rensas efterat, sa nasta lasning ser den nya raden.
 */
export async function fyllPaDag(
  dag: string = dagStr(),
  tvinga = false
): Promise<PafyllResultat> {
  const nu = Date.now();
  const senast = senastPafylld.get(dag) ?? 0;

  if (!tvinga && nu - senast < PAFYLL_SPARR_MS) {
    const kvar = Math.ceil((PAFYLL_SPARR_MS - (nu - senast)) / 60000);
    return { dag, kordes: false, anledning: `Spärr, försök igen om ${kvar} min` };
  }

  senastPafylld.set(dag, nu);

  const admin = getSupabaseAdmin() as any;
  const res = await collectAdminMetrics(admin, dag);

  // Next 16 vill ha en cache-profil som andra argument. 'max' betyder att
  // taggen invalideras oavsett hur lange raden legat i cachen.
  revalidateTag(ADMIN_METRICS_TAG, 'max');

  return { dag, kordes: true, delsteg: res.delsteg };
}

/**
 * Undantagna konton for sidorna, cachade 15 minuter med adminens tagg.
 *
 * Kontona (inte Undantag-objektet) cachas, eftersom unstable_cache bara kan
 * spara serialiserbara varden. Kastar databasen returneras ett tomt
 * undantag och felet loggas: en sida som inte gar att lasa ar samre an en
 * sida som raknar ett konto for mycket, och insamlingen (som ar det som
 * skriver talen) vagrar i stallet helt att skriva utan undantag.
 */
const hamtaUndantagKonton = unstable_cache(
  async (): Promise<Undantag['konton']> => {
    try {
      const u = await hamtaUndantag(getSupabaseAdmin() as any);
      return u.konton;
    } catch (fel) {
      console.error('[admin/metrics] undantagen gick inte att lasa:', fel);
      return [];
    }
  },
  ['admin-undantag'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

export async function hamtaUndantagCachad(): Promise<Undantag> {
  return byggUndantag(await hamtaUndantagKonton());
}
