/**
 * Datalagret bakom Anvandare (docs/plan-admin.md avsnitt 4.4, spec-admin-
 * tydlighet 2026-09-22 punkt 9).
 *
 * Listan ar en enda fraga mot vyn admin_user_rows, serverpaginerad med 50 per
 * sida. Aldrig hela tabellen, aldrig sex fragor per rad, aldrig en
 * Supabase-fraga fran klienten. Planen sager uttryckligen att listan inte
 * cachas: den ar snabb for att fragan ar liten, inte for att svaret ar gammalt.
 *
 * Vyn har alla konton kvar, aven de undantagna (agarens adminkonto och
 * testkontona), med kolumnen undantag. De visas bara i gruppen "Admin och
 * test" och raknas aldrig i en total: varje annan grupp borjar med
 * undantag is null.
 *
 * Vyn nas bara med service role. Bade anon och authenticated har revoke pa
 * den sedan vag 1, sa getSupabaseAdmin() ar enda vagen in.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { priceIdToPlanKey } from '@/lib/stripe/planPrices';
import type { PlanKey } from '@/lib/plans/plans';
import { BETALANDE_STATUS, TRIAL_KALLOR } from './format';

/** 50 per sida enligt planen. Aldrig konfigurerbart fran klienten. */
export const SIDSTORLEK = 50;

/**
 * Grupperna i filtret. "Tilldelad" (premium fran admin eller bonus) har ingen
 * egen grupp: den ar sallsynt och syns under Alla.
 */
export const GRUPPER = [
  { nyckel: 'alla', etikett: 'Alla' },
  { nyckel: 'betalande', etikett: 'Betalande' },
  { nyckel: 'provperiod', etikett: 'Provperiod pågår' },
  { nyckel: 'provperiod_slut', etikett: 'Provperiod slut' },
  { nyckel: 'gratis', etikett: 'Gratis' },
  { nyckel: 'undantagna', etikett: 'Admin och test' },
] as const;

export type Grupp = (typeof GRUPPER)[number]['nyckel'];
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
  grupp: Grupp;
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
  grupp: 'alla',
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
  premium_scope: string | null;
  stripe_customer_id: string | null;
  acquisition_source: unknown;
  undantag: 'admin' | 'test' | null;
  letter_count: number;
  cv_count: number;
  application_count: number;
  analysis_count: number;
  /** Paketet ur prenumerationens pris. Bara for levande prenumerationer. */
  planKey: PlanKey | null;
}

export interface AnvandarLista {
  rader: AnvandarRad[];
  total: number;
  sida: number;
  antalSidor: number;
}

/** Sorteringskolumnen i vyn, per val i granssnittet. */
const SORTKOLUMN: Record<Sortering, string> = {
  senast_aktiv: 'last_activity_at',
  skapad: 'created_at',
  brev: 'letter_count',
  cv: 'cv_count',
  ansokningar: 'application_count',
  email: 'email',
};

const GRUPP_NYCKLAR = GRUPPER.map((g) => g.nyckel) as readonly string[];

/** Laser ett filter ur sokparametrarna. Okanda varden faller till standard. */
export function filterFranSok(
  sp: Record<string, string | string[] | undefined>
): AnvandarFilter {
  const en = (n: string): string => {
    const v = sp[n];
    return (Array.isArray(v) ? v[0] : v) ?? '';
  };

  const grupp = en('grupp');
  const aktivitet = en('aktivitet');
  const sortering = en('sortering');
  const riktning = en('riktning');
  const sida = Number.parseInt(en('sida'), 10);

  return {
    grupp: GRUPP_NYCKLAR.includes(grupp) ? (grupp as Grupp) : 'alla',
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
  if (f.grupp !== 'alla') p.set('grupp', f.grupp);
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

/** Den del av en PostgREST-fraga som gruppfiltret anvander. */
export interface FiltrerbarFraga<Q> {
  is(kolumn: string, varde: null): Q;
  not(kolumn: string, operator: string, varde: unknown): Q;
  or(filter: string): Q;
}

const lista = (v: readonly string[]) => `(${v.join(',')})`;

/**
 * Gruppregeln i PostgREST. Samma ordning som paketEtikett i format.ts:
 *
 *   betalande        status active/past_due, eller engangskop som galler
 *                    (och inte Stripe-trial)
 *   provperiod       status trialing, eller registreringens provperiod som
 *                    galler utan levande prenumeration
 *   provperiod_slut  registreringens provperiod som gatt ut, utan levande
 *                    prenumeration eller trial
 *   gratis           varken prenumeration, trial eller galande tid
 *   undantagna       bara undantagna konton
 *
 * Alla grupper utom undantagna borjar med undantag is null. Det ar regeln
 * som gor att adminkontot och testkontona aldrig hamnar i en total.
 *
 * Varje villkor ar ett enda or() med nastlade and(), sa att det inte
 * krockar med fritextens or().
 *
 * Samma villkor finns i databasfunktionen admin_user_grupper(), som raknar
 * grupperna i en fraga (oversikt.ts). Andras de har ska de andras dar.
 */
export function tillampaGrupp<Q extends FiltrerbarFraga<Q>>(q: Q, grupp: Grupp, nuIso: string): Q {
  if (grupp === 'undantagna') return q.not('undantag', 'is', null);

  let f = q.is('undantag', null);
  const trial = lista(TRIAL_KALLOR);
  const betalar = lista(BETALANDE_STATUS);
  const ingenPren = `or(subscription_status.is.null,subscription_status.not.in.${lista([...BETALANDE_STATUS, 'trialing'])})`;

  if (grupp === 'betalande') {
    f = f.or(
      `subscription_status.in.${betalar},` +
        `and(premium_source.like.onetime_*,premium_until.gt.${nuIso},` +
        `or(subscription_status.is.null,subscription_status.neq.trialing))`
    );
  } else if (grupp === 'provperiod') {
    f = f.or(
      `subscription_status.eq.trialing,` +
        `and(premium_source.in.${trial},premium_until.gt.${nuIso},` +
        `or(subscription_status.is.null,subscription_status.not.in.${betalar}))`
    );
  } else if (grupp === 'provperiod_slut') {
    f = f.or(
      `and(premium_source.in.${trial},` +
        `or(premium_until.is.null,premium_until.lte.${nuIso}),${ingenPren})`
    );
  } else if (grupp === 'gratis') {
    // Ingen prenumeration, och ingen kalla som ger tid just nu. Admin utan
    // slutdag ar tilldelad, inte gratis. Provperiodskallorna ar aldrig
    // gratis: de ar antingen pagaende eller slut.
    f = f.or(
      `and(${ingenPren},premium_source.is.null),` +
        `and(${ingenPren},premium_source.not.in.${trial},premium_until.lte.${nuIso}),` +
        `and(${ingenPren},premium_source.not.in.${lista([...TRIAL_KALLOR, 'admin'])},premium_until.is.null)`
    );
  }
  return f;
}

/**
 * En sida ur admin_user_rows, filtrerad och sorterad i databasen.
 *
 * Aldrig cachad. En admin som just gett nagon premium ska se det direkt, och
 * fragan ar en indexerad select med limit 50.
 */
export async function hamtaAnvandare(
  filter: AnvandarFilter,
  nu: number = Date.now()
): Promise<AnvandarLista> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;

  let q = admin
    .from('admin_user_rows')
    .select(
      'id, email, full_name, created_at, last_activity_at, subscription_tier, subscription_status, premium_until, premium_source, premium_scope, stripe_customer_id, acquisition_source, undantag, letter_count, cv_count, application_count, analysis_count',
      { count: 'exact' }
    );

  q = tillampaGrupp(q, filter.grupp, new Date(nu).toISOString());

  if (filter.aktivitet !== 'alla') {
    const dagar = filter.aktivitet === '7' ? 7 : 30;
    const gransen = new Date(nu - dagar * 86_400_000).toISOString();
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

  const rader = ((data ?? []) as Array<Omit<AnvandarRad, 'planKey'>>).map((r) => ({
    ...r,
    planKey: null as PlanKey | null,
  }));

  // Paketet for en levande prenumeration ligger i priset, som vyn inte bar.
  // En fraga for sidans prenumeranter, oftast en handfull rader.
  const prenumeranter = rader
    .filter((r) => r.subscription_status && r.subscription_status !== 'canceled')
    .map((r) => r.id);
  if (prenumeranter.length) {
    const { data: priser } = await admin
      .from('profiles')
      .select('id, price_id')
      .in('id', prenumeranter);
    const perId = new Map<string, string | null>(
      ((priser ?? []) as Array<{ id: string; price_id: string | null }>).map((p) => [p.id, p.price_id])
    );
    for (const r of rader) {
      if (perId.has(r.id)) r.planKey = priceIdToPlanKey(perId.get(r.id));
    }
  }

  const total = count ?? 0;

  return {
    rader,
    total,
    sida: filter.sida,
    antalSidor: Math.max(1, Math.ceil(total / SIDSTORLEK)),
  };
}

/** Kallkolumnen visas forst nar minst en tiondel av kontona har en kalla. */
export const KALLA_TROSKEL = 0.1;

export function visaKalla(medKalla: number, total: number): boolean {
  return total > 0 && medKalla / total >= KALLA_TROSKEL;
}

/**
 * De anskaffningskallor som finns bland de icke-undantagna kontona.
 *
 * Attributionen var trasig till 21 sep 22.00 (MATSTART.attribution), sa i
 * dag har nastan inga konton en kalla. Sidan doljer kolumnen och filtret
 * tills minst en tiondel har det.
 */
export async function hamtaKallor(): Promise<{
  kallor: string[];
  medKalla: number;
  utanKalla: number;
  total: number;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;

  const [{ count: total }, { count: medKalla }, { data }] = await Promise.all([
    admin
      .from('admin_user_rows')
      .select('id', { count: 'exact', head: true })
      .is('undantag', null),
    admin
      .from('admin_user_rows')
      .select('id', { count: 'exact', head: true })
      .is('undantag', null)
      .not('acquisition_source', 'is', null),
    admin
      .from('admin_user_rows')
      .select('acquisition_source')
      .is('undantag', null)
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
    medKalla: medKalla ?? 0,
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
