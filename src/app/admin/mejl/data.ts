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
 *    antalet handelser. En rak count(*) over joinen ger 442 skickade dar det
 *    finns 251. Darfor lases tabellerna var for sig och slas ihop i minnet
 *    pa resend_id: skickade raknas ur email_log, handelser ur email_events,
 *    och varje handelsetyp raknas hogst en gang per mejl.
 *
 * 3. Resends eget API anvands inte. Nyckeln ar sandbegransad och svarar 401
 *    pa /emails. All statistik laser ur Supabase.
 *
 * Tabellerna ar pa under tusen rader, sa hela fonstret hamtas och aggregeras
 * i minnet. Det ar snabbare an fem rundturer och taler storleken lange an.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ADMIN_CACHE_SEKUNDER } from '@/lib/admin/metrics';
import { EMAIL_EVENT } from '@/lib/admin/email';

/** Egen cachetagg: mejlsiffrorna hanger inte ihop med admin_daily_metrics. */
export const ADMIN_MEJL_TAG = 'admin-mejl';

/** Timmar efter en oppnad digest som en session raknas som effekt. */
export const DIGEST_FONSTER_TIMMAR = 48;

export interface MejlRad {
  /** email_type, till exempel quota_back eller campaign:sokta-tjanster. */
  nyckel: string;
  skickade: number;
  levererade: number;
  oppnade: number;
  klick: number;
  studs: number;
  /** Senaste utskicket, ISO. */
  senast: string | null;
}

export interface KoRad {
  steg: string;
  vantande: number;
  misslyckade: number;
  /** Nasta korning, ISO, eller null nar inget vantar. */
  nasta: string | null;
  /** Senaste felet i kon for steget, avkortat. */
  senasteFel: string | null;
}

export interface StudsRad {
  adress: string;
  antal: number;
  senast: string | null;
  /** Vilka malltyper som studsat till adressen. */
  mallar: string[];
}

export interface VeckoRad {
  /** Mandagen, ISO-datum. */
  vecka: string;
  skickade: number;
  levererade: number;
  oppnade: number;
  klick: number;
  /** Oppnandegrad av levererade, som andel. */
  oppnandegrad: number | null;
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
  /** Vecka for vecka, stigande, for oppnandegradslinjen. */
  perVecka: VeckoRad[];
  ko: KoRad[];
  /** Summering av kon, for de stora talen. */
  koTotalt: { vantande: number; misslyckade: number; nasta: string | null };
  studsadeAdresser: StudsRad[];
  digest: DigestEffekt;
  /** Fonstrets start, ISO-datum. */
  fran: string;
}

interface LoggRad {
  resend_id: string | null;
  email_type: string;
  recipient: string;
  sent_at: string;
  user_id: string | null;
}

interface HandelseRad {
  resend_id: string | null;
  event_type: string;
  created_at: string;
}

interface SchemaRad {
  email_type: string;
  send_after: string | null;
  sent_at: string | null;
  canceled_at: string | null;
  attempts: number | null;
  last_error: string | null;
}

/** Mandagen i veckan som datumet ligger i, ISO-datum. */
function veckansMandag(iso: string): string {
  const d = new Date(iso);
  const veckodag = (d.getUTCDay() + 6) % 7; // mandag = 0
  d.setUTCDate(d.getUTCDate() - veckodag);
  return d.toISOString().slice(0, 10);
}

function nyRad(nyckel: string): MejlRad {
  return {
    nyckel,
    skickade: 0,
    levererade: 0,
    oppnade: 0,
    klick: 0,
    studs: 0,
    senast: null,
  };
}

/**
 * Ett livscykelsteg ar en malltyp som schemalaggs, till exempel rt_day3 eller
 * winback_14. Kampanjer och transaktionsmejl ar inte steg.
 *
 * Veckodigesten har veckonumret i sin typ (weekly_digest_2026w37), sa den
 * normaliseras till en enda nyckel. Annars blir varje vecka ett eget "steg"
 * och listan vaxer for evigt.
 */
const STEG_MONSTER = /^(rt_day\d+|trial_day\d+|winback_\d+|quota_back|weekly_digest)/;

export function stegNyckel(emailType: string): string | null {
  if (emailType.startsWith('weekly_digest')) return 'weekly_digest';
  return STEG_MONSTER.test(emailType) ? emailType : null;
}

async function las(dagar: number): Promise<MejlData> {
  const admin = getSupabaseAdmin() as any;

  const franDatum = new Date();
  franDatum.setUTCDate(franDatum.getUTCDate() - dagar);
  const franIso = franDatum.toISOString();
  const fran = franIso.slice(0, 10);

  const [loggRes, handelseRes, schemaRes] = await Promise.all([
    admin
      .from('email_log')
      .select('resend_id, email_type, recipient, sent_at, user_id')
      .gte('sent_at', franIso)
      .order('sent_at', { ascending: false }),
    // Handelser hamtas utan tidsfilter pa created_at: en oppning kan komma
    // dagar efter utskicket, och ett filter pa handelsedatum skulle tappa
    // oppningar for mejl som ligger i fonstret. Joinen sker pa resend_id, sa
    // handelser utanfor fonstret faller bort anda.
    admin.from('email_events').select('resend_id, event_type, created_at'),
    admin
      .from('email_schedule')
      .select('email_type, send_after, sent_at, canceled_at, attempts, last_error'),
  ]);

  if (loggRes.error) console.error('[admin/mejl] email_log:', loggRes.error);
  if (handelseRes.error) console.error('[admin/mejl] email_events:', handelseRes.error);
  if (schemaRes.error) console.error('[admin/mejl] email_schedule:', schemaRes.error);

  const loggar = (loggRes.data ?? []) as LoggRad[];
  const handelser = (handelseRes.data ?? []) as HandelseRad[];
  const schema = (schemaRes.data ?? []) as SchemaRad[];

  // Steg 1: handelser per resend_id, som en mangd typer. Ett mejl som oppnas
  // fem ganger raknas som en oppning, inte fem: oppnandegraden ska svara pa
  // hur manga som oppnade, inte hur ofta.
  const typerPerMejl = new Map<string, Set<string>>();
  for (const h of handelser) {
    if (!h.resend_id) continue;
    let mangd = typerPerMejl.get(h.resend_id);
    if (!mangd) {
      mangd = new Set<string>();
      typerPerMejl.set(h.resend_id, mangd);
    }
    mangd.add(h.event_type);
  }

  // Steg 2: rakna per mall, per steg och per vecka i en enda genomgang.
  const perMall = new Map<string, MejlRad>();
  const perSteg = new Map<string, MejlRad>();
  const perVecka = new Map<string, VeckoRad>();
  const totalt = { skickade: 0, levererade: 0, oppnade: 0, klick: 0, studs: 0 };

  // Studsande adresser samlas separat: de identifieras pa mottagare, inte
  // pa mall, eftersom det ar adressen som ar problemet.
  const studsPerAdress = new Map<string, StudsRad>();

  // Digestens effekt kraver de oppnade digestmejlens mottagare.
  const digestOppnare = new Map<string, string>(); // user_id -> sent_at
  const digest: DigestEffekt = { skickade: 0, oppnade: 0, medSession: 0, andel: null };

  for (const logg of loggar) {
    const typer = logg.resend_id ? typerPerMejl.get(logg.resend_id) : undefined;

    const levererad = typer?.has(EMAIL_EVENT.DELIVERED) ?? false;
    const oppnad = typer?.has(EMAIL_EVENT.OPENED) ?? false;
    const klickad = typer?.has(EMAIL_EVENT.CLICKED) ?? false;
    const studsad = typer?.has(EMAIL_EVENT.BOUNCED) ?? false;

    totalt.skickade += 1;
    if (levererad) totalt.levererade += 1;
    if (oppnad) totalt.oppnade += 1;
    if (klickad) totalt.klick += 1;
    if (studsad) totalt.studs += 1;

    const fyll = (karta: Map<string, MejlRad>, nyckel: string) => {
      let rad = karta.get(nyckel);
      if (!rad) {
        rad = nyRad(nyckel);
        karta.set(nyckel, rad);
      }
      rad.skickade += 1;
      if (levererad) rad.levererade += 1;
      if (oppnad) rad.oppnade += 1;
      if (klickad) rad.klick += 1;
      if (studsad) rad.studs += 1;
      if (!rad.senast || logg.sent_at > rad.senast) rad.senast = logg.sent_at;
    };

    fyll(perMall, logg.email_type);

    const steg = stegNyckel(logg.email_type);
    if (steg) fyll(perSteg, steg);

    const vecka = veckansMandag(logg.sent_at);
    let v = perVecka.get(vecka);
    if (!v) {
      v = { vecka, skickade: 0, levererade: 0, oppnade: 0, klick: 0, oppnandegrad: null };
      perVecka.set(vecka, v);
    }
    v.skickade += 1;
    if (levererad) v.levererade += 1;
    if (oppnad) v.oppnade += 1;
    if (klickad) v.klick += 1;

    if (studsad) {
      let s = studsPerAdress.get(logg.recipient);
      if (!s) {
        s = { adress: logg.recipient, antal: 0, senast: null, mallar: [] };
        studsPerAdress.set(logg.recipient, s);
      }
      s.antal += 1;
      if (!s.senast || logg.sent_at > s.senast) s.senast = logg.sent_at;
      if (!s.mallar.includes(logg.email_type)) s.mallar.push(logg.email_type);
    }

    if (logg.email_type.startsWith('weekly_digest')) {
      digest.skickade += 1;
      if (oppnad) {
        digest.oppnade += 1;
        if (logg.user_id) {
          const befintlig = digestOppnare.get(logg.user_id);
          if (!befintlig || logg.sent_at > befintlig) {
            digestOppnare.set(logg.user_id, logg.sent_at);
          }
        }
      }
    }
  }

  for (const v of perVecka.values()) {
    v.oppnandegrad = v.levererade > 0 ? v.oppnade / v.levererade : null;
  }

  // Steg 3: digestens effekt. En session inom 48 timmar efter utskicket
  // raknas som att mejlet fick nagon tillbaka. Fragan gors bara nar det
  // finns oppnare, sa den kostar ingenting i normalfallet.
  if (digestOppnare.size > 0) {
    const anvandare = Array.from(digestOppnare.keys());
    const tidigast = Array.from(digestOppnare.values()).sort()[0];

    const { data: aktiviteter } = await admin
      .from('user_activities')
      .select('user_id, created_at')
      .in('user_id', anvandare)
      .gte('created_at', tidigast);

    const fonsterMs = DIGEST_FONSTER_TIMMAR * 60 * 60 * 1000;
    const medSession = new Set<string>();

    for (const a of (aktiviteter ?? []) as Array<{ user_id: string; created_at: string }>) {
      const skickat = digestOppnare.get(a.user_id);
      if (!skickat) continue;
      const diff = new Date(a.created_at).getTime() - new Date(skickat).getTime();
      if (diff >= 0 && diff <= fonsterMs) medSession.add(a.user_id);
    }

    digest.medSession = medSession.size;
    digest.andel = digest.oppnade > 0 ? medSession.size / digest.oppnade : null;
  }

  // Steg 4: kon. Vantande ar rader som varken skickats eller avbrutits.
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
    totalt,
    perMall: Array.from(perMall.values()).sort((a, b) => b.skickade - a.skickade),
    perSteg: Array.from(perSteg.values()).sort((a, b) => b.skickade - a.skickade),
    perVecka: Array.from(perVecka.values()).sort((a, b) => a.vecka.localeCompare(b.vecka)),
    ko: Array.from(koKarta.values()).sort(
      (a, b) => b.vantande - a.vantande || b.misslyckade - a.misslyckade
    ),
    koTotalt,
    studsadeAdresser: Array.from(studsPerAdress.values())
      .sort((a, b) => b.antal - a.antal)
      .slice(0, 50),
    digest,
    fran,
  };
}

/** Cachad lasning, 15 minuter enligt planens avsnitt 4.6. */
export const hamtaMejl = unstable_cache(
  (dagar: number = 90) => las(dagar),
  ['admin-mejl'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_MEJL_TAG] }
);
