/**
 * Datalagret for Mejl (planens avsnitt 4.6).
 *
 * Tre fallgropar, alla tre kostar timmar om man gar pa dem:
 *
 * 1. event_type lagrar delivered, opened, clicked och bounced UTAN
 *    email.-prefix. En fraga pa 'email.delivered' ger noll rader och ser ut
 *    som ett trasigt system. Konstanterna kommer ur src/lib/admin/email.ts
 *    och skrivs aldrig som strang har.
 *
 * 2. En join mellan email_log och email_events multiplicerar loggraden med
 *    antalet handelser. Darfor lases tabellerna var for sig och slas ihop i
 *    minnet pa resend_id: skickade raknas ur email_log, handelser ur
 *    email_events, och varje handelsetyp raknas hogst en gang per utskick.
 *    Oppnandegraden ar alltsa per utskick och passerar aldrig 100 %
 *    (spec-admin-tydlighet 2026-09-22). Rakningen bor i berakning.ts.
 *
 * 3. Resends eget API anvands inte. Nyckeln ar sandbegransad och svarar 401
 *    pa /emails. All statistik laser ur Supabase.
 *
 * Utskick till undantagna konton (agarens adminkonto, testkonton och
 * testadresser) raknas inte, varken i talen, i kon eller i studsarna.
 *
 * PostgREST svarar med hogst tusen rader utan att saga till, sa email_log och
 * email_events hamtas sidvis.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_CACHE_SEKUNDER, hamtaUndantagCachad } from '@/lib/admin/metrics';
import { undantagText } from '@/lib/admin/undantag';
import {
  aggregera,
  arUndantagetUtskick,
  iGrupp,
  stegNyckel,
  uteslutUtskick,
  type Grupp,
  type HandelseRad,
  type LoggRad,
  type MejlRad,
  type StudsRad,
  type VeckoRad,
} from './berakning';

export { stegNyckel, kopNyckel } from './berakning';
export type { MejlRad, StudsRad, VeckoRad } from './berakning';

/** Egen cachetagg: mejlsiffrorna hanger inte ihop med admin_daily_metrics. */
export const ADMIN_MEJL_TAG = 'admin-mejl';

/** Timmar efter en oppnad digest som en session raknas som effekt. */
export const DIGEST_FONSTER_TIMMAR = 48;

export interface KoRad {
  steg: string;
  vantande: number;
  misslyckade: number;
  /** Nasta korning, ISO, eller null nar inget vantar. */
  nasta: string | null;
  /** Senaste felet i kon for steget, avkortat. */
  senasteFel: string | null;
}

export interface DigestEffekt {
  skickade: number;
  oppnade: number;
  /** Oppnare med aktivitet inom DIGEST_FONSTER_TIMMAR. */
  medSession: number;
  /** Andel av oppnarna som kom tillbaka, eller null nar ingen oppnat. */
  andel: number | null;
}

export interface MejlData {
  /** Summan for hela fonstret. */
  totalt: { skickade: number; levererade: number; oppnade: number; klick: number; studs: number };
  /** Per mall, fallande pa skickade. */
  perMall: MejlRad[];
  /** Per livscykelsteg, alltsa de mallar som schemalaggs i email_schedule. */
  perSteg: MejlRad[];
  /** Kopmejlen: kvitto, kom igang, paketet fornyas, uppsagningskvitto. */
  perKop: MejlRad[];
  /** Vecka for vecka, stigande, for oppnandegradslinjen. */
  perVecka: VeckoRad[];
  ko: KoRad[];
  /** Summering av kon, for de stora talen. */
  koTotalt: { vantande: number; misslyckade: number; nasta: string | null };
  studsadeAdresser: StudsRad[];
  digest: DigestEffekt;
  /** Fonstrets start, ISO-datum. */
  fran: string;
  /**
   * Senaste utskicket per grupp, aven utanfor fonstret. Underlag for tomma
   * tillstand: "0 sedan 24 jun, senaste skickat 15 sep kl. 07.00".
   */
  senast: Record<Grupp, string | null>;
  /** "1 adminkonto och 2 testkonton undantagna". */
  undantagText: string;
  /** Utskick i fonstret till undantagna konton, som inte raknas. */
  undantagnaUtskick: number;
}

interface SchemaRad {
  user_id: string | null;
  email_type: string;
  send_after: string | null;
  sent_at: string | null;
  canceled_at: string | null;
  attempts: number | null;
  last_error: string | null;
}

const SIDSTORLEK = 1000;

/** Hamtar alla rader sidvis. Taket ar en sakerhetsspärr mot en oandlig loop. */
async function allaRader<T>(
  bygg: (fran: number, till: number) => PromiseLike<{ data: unknown; error: unknown }>,
  etikett: string
): Promise<T[]> {
  const alla: T[] = [];
  for (let sida = 0; sida < 50; sida++) {
    const { data, error } = await bygg(sida * SIDSTORLEK, sida * SIDSTORLEK + SIDSTORLEK - 1);
    if (error) {
      console.error(`[admin/mejl] ${etikett} sida ${sida}:`, error);
      break;
    }
    const rader = (data ?? []) as T[];
    alla.push(...rader);
    if (rader.length < SIDSTORLEK) break;
  }
  return alla;
}

async function las(dagar: number): Promise<MejlData> {
  const admin = getSupabaseAdmin() as any;
  const u = await hamtaUndantagCachad();

  const franDatum = new Date();
  franDatum.setUTCDate(franDatum.getUTCDate() - dagar);
  const franIso = franDatum.toISOString();
  const fran = franIso.slice(0, 10);

  const [loggarAlla, handelser, schemaRes] = await Promise.all([
    allaRader<LoggRad>(
      (a, b) =>
        admin
          .from('email_log')
          .select('resend_id, email_type, recipient, sent_at, user_id')
          .gte('sent_at', franIso)
          .order('sent_at', { ascending: false })
          .range(a, b),
      'email_log'
    ),
    // Handelser hamtas utan tidsfilter pa created_at: en oppning kan komma
    // dagar efter utskicket, och ett filter pa handelsedatum skulle tappa
    // oppningar for mejl som ligger i fonstret. Joinen sker pa resend_id, sa
    // handelser utanfor fonstret faller bort anda.
    allaRader<HandelseRad>(
      (a, b) =>
        admin
          .from('email_events')
          .select('resend_id, event_type')
          .order('created_at', { ascending: true })
          .range(a, b),
      'email_events'
    ),
    admin
      .from('email_schedule')
      .select('user_id, email_type, send_after, sent_at, canceled_at, attempts, last_error'),
  ]);

  if (schemaRes.error) console.error('[admin/mejl] email_schedule:', schemaRes.error);

  const { kvar: loggar, bort: undantagnaUtskick } = uteslutUtskick(loggarAlla, u);
  const schema = ((schemaRes.data ?? []) as SchemaRad[]).filter((r) => !u.har(r.user_id));

  const agg = aggregera(loggar, handelser);

  // Digestens effekt. En session inom 48 timmar efter utskicket raknas som
  // att mejlet fick nagon tillbaka. Fragan gors bara nar det finns oppnare.
  const digest: DigestEffekt = { ...agg.digest, medSession: 0, andel: null };
  if (agg.digestOppnare.size > 0) {
    const anvandare = Array.from(agg.digestOppnare.keys());
    const tidigast = Array.from(agg.digestOppnare.values()).sort()[0];

    const { data: aktiviteter } = await admin
      .from('user_activities')
      .select('user_id, created_at')
      .in('user_id', anvandare)
      .gte('created_at', tidigast);

    const fonsterMs = DIGEST_FONSTER_TIMMAR * 60 * 60 * 1000;
    const medSession = new Set<string>();

    for (const a of (aktiviteter ?? []) as Array<{ user_id: string; created_at: string }>) {
      const skickat = agg.digestOppnare.get(a.user_id);
      if (!skickat) continue;
      const diff = new Date(a.created_at).getTime() - new Date(skickat).getTime();
      if (diff >= 0 && diff <= fonsterMs) medSession.add(a.user_id);
    }

    digest.medSession = medSession.size;
    digest.andel = digest.oppnade > 0 ? medSession.size / digest.oppnade : null;
  }

  // Senaste utskick per grupp. Ur fonstret nar gruppen har utskick dar,
  // annars en fraga bakat i tiden, sa att en tom grupp kan saga sedan nar
  // och nar det senaste gick.
  const senast: Record<Grupp, string | null> = {
    alla: loggar[0]?.sent_at ?? null,
    livscykel: agg.perSteg.reduce<string | null>((m, r) => (r.senast && (!m || r.senast > m) ? r.senast : m), null),
    kop: agg.perKop.reduce<string | null>((m, r) => (r.senast && (!m || r.senast > m) ? r.senast : m), null),
  };
  const saknas = (Object.keys(senast) as Grupp[]).filter((g) => !senast[g]);
  if (saknas.length) {
    const { data: aldre } = await admin
      .from('email_log')
      .select('email_type, recipient, sent_at, user_id')
      .lt('sent_at', franIso)
      .order('sent_at', { ascending: false })
      .limit(1000);
    for (const r of (aldre ?? []) as LoggRad[]) {
      if (arUndantagetUtskick(r, u)) continue;
      for (const g of saknas) {
        if (!senast[g] && iGrupp(g, r.email_type)) senast[g] = r.sent_at;
      }
      if (saknas.every((g) => senast[g])) break;
    }
  }

  // Kon. Vantande ar rader som varken skickats eller avbrutits.
  const koKarta = new Map<string, KoRad>();
  const koTotalt: MejlData['koTotalt'] = { vantande: 0, misslyckade: 0, nasta: null };

  for (const rad of schema) {
    const nyckel = stegNyckel(rad.email_type) ?? rad.email_type;
    let ko = koKarta.get(nyckel);
    if (!ko) {
      ko = { steg: nyckel, vantande: 0, misslyckade: 0, nasta: null, senasteFel: null };
      koKarta.set(nyckel, ko);
    }

    const vantar = !rad.sent_at && !rad.canceled_at;
    if (vantar) {
      ko.vantande += 1;
      koTotalt.vantande += 1;
      if (rad.send_after && (!ko.nasta || rad.send_after < ko.nasta)) {
        ko.nasta = rad.send_after;
      }
      if (rad.send_after && (!koTotalt.nasta || rad.send_after < koTotalt.nasta)) {
        koTotalt.nasta = rad.send_after;
      }
    }

    // Ett misslyckat forsok ar en rad med forsok bakom sig som anda inte
    // gatt ivag. En rad som skickades pa andra forsoket ar inte ett problem.
    if ((rad.attempts ?? 0) > 0 && !rad.sent_at) {
      ko.misslyckade += 1;
      koTotalt.misslyckade += 1;
      if (rad.last_error && !ko.senasteFel) {
        ko.senasteFel = rad.last_error.slice(0, 200);
      }
    }
  }

  return {
    totalt: agg.totalt,
    perMall: agg.perMall,
    perSteg: agg.perSteg,
    perKop: agg.perKop,
    perVecka: agg.perVecka,
    ko: Array.from(koKarta.values()).sort(
      (a, b) => b.vantande - a.vantande || b.misslyckade - a.misslyckade
    ),
    koTotalt,
    studsadeAdresser: agg.studsadeAdresser,
    digest,
    fran,
    senast,
    undantagText: undantagText(u),
    undantagnaUtskick,
  };
}

/** Cachad lasning, 15 minuter enligt planens avsnitt 4.6. */
export const hamtaMejl = unstable_cache(
  (dagar: number = 90) => las(dagar),
  // v2: formen fick perKop, senast och undantag 2026-09-22. En gammal
  // cachepost med den gamla formen far inte lasas av den nya sidan.
  ['admin-mejl-v2'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_MEJL_TAG] }
);
