/**
 * Datalagret bakom Anvandare (docs/plan-admin.md avsnitt 4.4).
 *
 * Listan ar en enda fraga mot vyn admin_user_rows, serverpaginerad med 50 per
 * sida. Aldrig hela tabellen, aldrig sex fragor per rad, aldrig en
 * Supabase-fraga fran klienten. Planen sager uttryckligen att listan inte
 * cachas: den ar snabb for att fragan ar liten, inte for att svaret ar gammalt.
 *
 * Vyn nas bara med service role. Bade anon och authenticated har revoke pa
 * den sedan vag 1, sa getSupabaseAdmin() ar enda vagen in.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** 50 per sida enligt planen. Aldrig konfigurerbart fran klienten. */
export const SIDSTORLEK = 50;

export type Niva = 'alla' | 'gratis' | 'trial' | 'premium';
export type Aktivitet = 'alla' | '7' | '30';
export type Sortering =
  | 'senast_aktiv'
  | 'skapad'
  | 'brev'
  | 'cv'
  | 'ansokningar'
  | 'email';
export type Riktning = 'asc' | 'desc';

export interface AnvandarFilter {
  niva: Niva;
  aktivitet: Aktivitet;
  harCv: boolean;
  harBrev: boolean;
  /** Anskaffningskalla, tom strang betyder alla. */
  kalla: string;
  /** Fritext mot e-post och namn. */
  sok: string;
  sortering: Sortering;
  riktning: Riktning;
  sida: number;
}

export const STANDARDFILTER: AnvandarFilter = {
  niva: 'alla',
  aktivitet: 'alla',
  harCv: false,
  harBrev: false,
  kalla: '',
  sok: '',
  sortering: 'senast_aktiv',
  riktning: 'desc',
  sida: 1,
};

export interface AnvandarRad {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string | null;
  last_activity_at: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  premium_until: string | null;
  premium_source: string | null;
  acquisition_source: unknown;
  letter_count: number;
  cv_count: number;
  application_count: number;
  analysis_count: number;
}

export interface AnvandarLista {
  rader: AnvandarRad[];
  total: number;
  sida: number;
  antalSidor: number;
}

/**
 * De tre nivaerna, uttryckta i de kolumner som faktiskt finns.
 *
 * Trial ar inte en egen kolumn. En trialare ar antingen en Stripe-trial
 * (subscription_status trialing) eller en reverse trial fran registreringen
 * (premium_source signup_trial eller oauth_signup_trial). Premium ar de som
 * betalar eller fatt tid av admin, alltsa premium utan trialkallorna.
 */
const TRIAL_KALLOR = ['signup_trial', 'oauth_signup_trial'];

/** Sorteringskolumnen i vyn, per val i granssnittet. */
const SORTKOLUMN: Record<Sortering, string> = {
  senast_aktiv: 'last_activity_at',
  skapad: 'created_at',
  brev: 'letter_count',
  cv: 'cv_count',
  ansokningar: 'application_count',
  email: 'email',
};

/** Laser ett filter ur sokparametrarna. Okanda varden faller till standard. */
export function filterFranSok(
  sp: Record<string, string | string[] | undefined>
): AnvandarFilter {
  const en = (n: string): string => {
    const v = sp[n];
    return (Array.isArray(v) ? v[0] : v) ?? '';
  };

  const niva = en('niva');
  const aktivitet = en('aktivitet');
  const sortering = en('sortering');
  const riktning = en('riktning');
  const sida = Number.parseInt(en('sida'), 10);

  return {
    niva: (['gratis', 'trial', 'premium'] as const).includes(niva as never)
      ? (niva as Niva)
      : 'alla',
    aktivitet: (['7', '30'] as const).includes(aktivitet as never)
      ? (aktivitet as Aktivitet)
      : 'alla',
    harCv: en('harCv') === '1',
    harBrev: en('harBrev') === '1',
    kalla: en('kalla').slice(0, 60),
    sok: en('sok').trim().slice(0, 80),
    sortering: (Object.keys(SORTKOLUMN) as Sortering[]).includes(
      sortering as Sortering
    )
      ? (sortering as Sortering)
      : 'senast_aktiv',
    riktning: riktning === 'asc' ? 'asc' : 'desc',
    sida: Number.isFinite(sida) && sida > 0 ? Math.min(sida, 10_000) : 1,
  };
}

/** Bygger sokparametrarna tillbaka, sa lankar behaller filtret. */
export function sokFranFilter(f: AnvandarFilter): string {
  const p = new URLSearchParams();
  if (f.niva !== 'alla') p.set('niva', f.niva);
  if (f.aktivitet !== 'alla') p.set('aktivitet', f.aktivitet);
  if (f.harCv) p.set('harCv', '1');
  if (f.harBrev) p.set('harBrev', '1');
  if (f.kalla) p.set('kalla', f.kalla);
  if (f.sok) p.set('sok', f.sok);
  if (f.sortering !== 'senast_aktiv') p.set('sortering', f.sortering);
  if (f.riktning !== 'desc') p.set('riktning', f.riktning);
  if (f.sida > 1) p.set('sida', String(f.sida));
  const s = p.toString();
  return s ? `?${s}` : '';
}

/**
 * Escapar varden som gar in i en or()-strang i PostgREST.
 *
 * or() tar inte parametrar utan en strang, sa komma och parentes maste bort
 * innan de tolkas som syntax. Vi tillater inte heller procent och understreck
 * att komma fran anvandaren: ilike-monstret satter vi sjalva.
 */
function tryggSok(s: string): string {
  return s.replace(/[,()*%_\\"']/g, ' ').trim();
}

/**
 * En sida ur admin_user_rows, filtrerad och sorterad i databasen.
 *
 * Aldrig cachad. En admin som just gett nagon premium ska se det direkt, och
 * fragan ar en indexerad select med limit 50.
 */
export async function hamtaAnvandare(
  filter: AnvandarFilter
): Promise<AnvandarLista> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;

  let q = admin
    .from('admin_user_rows')
    .select(
      'id, email, full_name, created_at, last_activity_at, subscription_tier, subscription_status, premium_until, premium_source, acquisition_source, letter_count, cv_count, application_count, analysis_count',
      { count: 'exact' }
    );

  if (filter.niva === 'gratis') {
    q = q.neq('subscription_tier', 'premium');
  } else if (filter.niva === 'trial') {
    q = q.or(
      `subscription_status.eq.trialing,premium_source.in.(${TRIAL_KALLOR.join(',')})`
    );
  } else if (filter.niva === 'premium') {
    q = q
      .eq('subscription_tier', 'premium')
      .not('premium_source', 'in', `(${TRIAL_KALLOR.join(',')})`);
  }

  if (filter.aktivitet !== 'alla') {
    const dagar = filter.aktivitet === '7' ? 7 : 30;
    const gransen = new Date(Date.now() - dagar * 86_400_000).toISOString();
    q = q.gte('last_activity_at', gransen);
  }

  if (filter.harCv) q = q.gt('cv_count', 0);
  if (filter.harBrev) q = q.gt('letter_count', 0);

  if (filter.kalla) {
    if (filter.kalla === 'saknas') {
      q = q.is('acquisition_source', null);
    } else {
      q = q.contains('acquisition_source', { source: filter.kalla });
    }
  }

  const sok = tryggSok(filter.sok);
  if (sok) {
    q = q.or(`email.ilike.%${sok}%,full_name.ilike.%${sok}%`);
  }

  const fran = (filter.sida - 1) * SIDSTORLEK;

  const { data, count, error } = await q
    .order(SORTKOLUMN[filter.sortering], {
      ascending: filter.riktning === 'asc',
      nullsFirst: false,
    })
    .order('id', { ascending: true })
    .range(fran, fran + SIDSTORLEK - 1);

  if (error) {
    console.error('[admin/anvandare] kunde inte lasa admin_user_rows:', error);
    throw new Error('Kunde inte lasa anvandarlistan');
  }

  const total = count ?? 0;

  return {
    rader: (data ?? []) as AnvandarRad[],
    total,
    sida: filter.sida,
    antalSidor: Math.max(1, Math.ceil(total / SIDSTORLEK)),
  };
}

/**
 * De anskaffningskallor som faktiskt finns i datan, for filtermenyn.
 *
 * I dag ar acquisition_source null pa samtliga konton, vilket ar ett kant
 * matfel (planen avsnitt 1, slutsats 5). Menyn visar da bara "Saknas", och
 * sidan skriver datakvalitetsnoten.
 */
export async function hamtaKallor(): Promise<{
  kallor: string[];
  utanKalla: number;
  total: number;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;

  const [{ count: total }, { count: medKalla }, { data }] = await Promise.all([
    admin.from('admin_user_rows').select('id', { count: 'exact', head: true }),
    admin
      .from('admin_user_rows')
      .select('id', { count: 'exact', head: true })
      .not('acquisition_source', 'is', null),
    admin
      .from('admin_user_rows')
      .select('acquisition_source')
      .not('acquisition_source', 'is', null)
      .limit(500),
  ]);

  const kallor = new Set<string>();
  for (const rad of (data ?? []) as Array<{ acquisition_source: unknown }>) {
    const kalla = lasKalla(rad.acquisition_source);
    if (kalla) kallor.add(kalla);
  }

  return {
    kallor: [...kallor].sort(),
    utanKalla: (total ?? 0) - (medKalla ?? 0),
    total: total ?? 0,
  };
}

/**
 * Plockar ut kallan ur acquisition_source, som ar jsonb och darmed kan vara
 * antingen ett objekt med source, eller en ren strang.
 */
export function lasKalla(varde: unknown): string | null {
  if (!varde) return null;
  if (typeof varde === 'string') return varde;
  if (typeof varde === 'object') {
    const o = varde as Record<string, unknown>;
    for (const nyckel of ['source', 'utm_source', 'kalla', 'referrer']) {
      const v = o[nyckel];
      if (typeof v === 'string' && v) return v;
    }
  }
  return null;
}
