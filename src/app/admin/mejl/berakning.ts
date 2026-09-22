/**
 * Rena beräkningar för Mejl. Ingen supabase, ingen next/cache, så att
 * testerna kan köra dem rakt av.
 *
 * Spec-admin-tydlighet 2026-09-22, sida 7:
 *
 * 1. Öppnandegraden räknas per utskick och passerar aldrig 100 %. Ett
 *    utskick räknas som öppnat en gång oavsett hur många opened-händelser
 *    det fått, och ett öppnat eller klickat utskick räknas alltid som
 *    levererat. Resend skickar ibland opened utan delivered, och då blev
 *    öppnade fler än levererade.
 *
 * 2. Utskick till undantagna konton (email_log.user_id i undantagen, eller
 *    en mottagare som matchar testmönstren) räknas inte.
 *
 * 3. Köpmejlen (kvitto, kom igång, paketet förnyas, uppsägningskvitto) är en
 *    egen grupp, så att köparens mejl syns bredvid köpet.
 */

import { EMAIL_EVENT } from '@/lib/admin/email';
import { arTestEpost, type Undantag } from '@/lib/admin/undantag';

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

export interface StudsRad {
  adress: string;
  antal: number;
  senast: string | null;
  /** Vilka malltyper som studsat till adressen. */
  mallar: string[];
}

export interface VeckoRad {
  /** Måndagen, ISO-datum. */
  vecka: string;
  skickade: number;
  levererade: number;
  oppnade: number;
  klick: number;
  /** Öppnandegrad av levererade, som andel. Aldrig över 1. */
  oppnandegrad: number | null;
}

export interface Totalt {
  skickade: number;
  levererade: number;
  oppnade: number;
  klick: number;
  studs: number;
}

export interface LoggRad {
  resend_id: string | null;
  email_type: string;
  recipient: string;
  sent_at: string;
  user_id: string | null;
}

export interface HandelseRad {
  resend_id: string | null;
  event_type: string;
}

/**
 * Ett livscykelsteg är en malltyp som schemaläggs, till exempel winback_14.
 * Kampanjer, köpmejl och transaktionsmejl är inte steg.
 *
 * Veckodigesten har veckonumret i sin typ (weekly_digest_2026w37), så den
 * normaliseras till en enda nyckel. Annars blir varje vecka ett eget "steg"
 * och listan växer för evigt.
 */
const STEG_MONSTER = /^(rt_day\d+|trial_day\d+|winback_\d+|quota_back|weekly_digest)/;

export function stegNyckel(emailType: string): string | null {
  if (emailType.startsWith('weekly_digest')) return 'weekly_digest';
  return STEG_MONSTER.test(emailType) ? emailType : null;
}

/**
 * Köpmejlen, normaliserade. Hjälpredans mejl har datumsuffix
 * (komigang_2026-09-25, paket_fornyas_2026-09-28), kvittot heter receipt i
 * src/lib/email/lifecycle/templates/vecka.ts.
 */
const KOP_MONSTER: Array<[RegExp, string]> = [
  [/^(receipt|kvitto)/, 'receipt'],
  [/^komigang/, 'komigang'],
  [/^paket_fornyas/, 'paket_fornyas'],
  [/^canceled_until_sunday/, 'canceled_until_sunday'],
];

export function kopNyckel(emailType: string): string | null {
  for (const [re, nyckel] of KOP_MONSTER) if (re.test(emailType)) return nyckel;
  return null;
}

/** Måndagen i veckan som datumet ligger i, ISO-datum. */
export function veckansMandag(iso: string): string {
  const d = new Date(iso);
  const veckodag = (d.getUTCDay() + 6) % 7; // måndag = 0
  d.setUTCDate(d.getUTCDate() - veckodag);
  return d.toISOString().slice(0, 10);
}

/** Sant när utskicket gick till ett undantaget konto eller en testadress. */
export function arUndantagetUtskick(
  rad: Pick<LoggRad, 'user_id' | 'recipient'>,
  u: Pick<Undantag, 'har'>
): boolean {
  return u.har(rad.user_id) || arTestEpost(rad.recipient);
}

/** Delar utskicken i de som räknas och antalet som räknas bort. */
export function uteslutUtskick<T extends Pick<LoggRad, 'user_id' | 'recipient'>>(
  loggar: T[],
  u: Pick<Undantag, 'har'>
): { kvar: T[]; bort: number } {
  const kvar: T[] = [];
  let bort = 0;
  for (const l of loggar) {
    if (arUndantagetUtskick(l, u)) bort += 1;
    else kvar.push(l);
  }
  return { kvar, bort };
}

/** Händelsetyperna per resend_id, som en mängd. */
export function typerPerUtskick(handelser: HandelseRad[]): Map<string, Set<string>> {
  const karta = new Map<string, Set<string>>();
  for (const h of handelser) {
    if (!h.resend_id) continue;
    let mangd = karta.get(h.resend_id);
    if (!mangd) {
      mangd = new Set<string>();
      karta.set(h.resend_id, mangd);
    }
    mangd.add(h.event_type);
  }
  return karta;
}

/** Utfallet för ett utskick. Varje typ räknas högst en gång. */
export function utfall(typer: Set<string> | undefined): {
  levererad: boolean;
  oppnad: boolean;
  klickad: boolean;
  studsad: boolean;
} {
  const oppnad = typer?.has(EMAIL_EVENT.OPENED) ?? false;
  const klickad = typer?.has(EMAIL_EVENT.CLICKED) ?? false;
  const studsad = typer?.has(EMAIL_EVENT.BOUNCED) ?? false;
  // Ett öppnat eller klickat mejl kom fram, även när Resend aldrig skickade
  // delivered. Utan den regeln blir öppnade fler än levererade.
  const levererad = (typer?.has(EMAIL_EVENT.DELIVERED) ?? false) || oppnad || klickad;
  return { levererad, oppnad, klickad, studsad };
}

export function nyRad(nyckel: string): MejlRad {
  return { nyckel, skickade: 0, levererade: 0, oppnade: 0, klick: 0, studs: 0, senast: null };
}

export interface Aggregat {
  totalt: Totalt;
  perMall: MejlRad[];
  perSteg: MejlRad[];
  perKop: MejlRad[];
  perVecka: VeckoRad[];
  studsadeAdresser: StudsRad[];
  digest: { skickade: number; oppnade: number };
  /** user_id till senaste öppnade digestens sent_at, för effektfrågan. */
  digestOppnare: Map<string, string>;
}

/**
 * Räknar utskicken per mall, steg, köpmejl och vecka i en genomgång.
 * Loggarna ska redan vara rensade från undantagna (uteslutUtskick).
 */
export function aggregera(loggar: LoggRad[], handelser: HandelseRad[]): Aggregat {
  const typer = typerPerUtskick(handelser);

  const perMall = new Map<string, MejlRad>();
  const perSteg = new Map<string, MejlRad>();
  const perKop = new Map<string, MejlRad>();
  const perVecka = new Map<string, VeckoRad>();
  const totalt: Totalt = { skickade: 0, levererade: 0, oppnade: 0, klick: 0, studs: 0 };
  const studsPerAdress = new Map<string, StudsRad>();
  const digestOppnare = new Map<string, string>();
  const digest = { skickade: 0, oppnade: 0 };

  for (const logg of loggar) {
    const u = utfall(logg.resend_id ? typer.get(logg.resend_id) : undefined);

    totalt.skickade += 1;
    if (u.levererad) totalt.levererade += 1;
    if (u.oppnad) totalt.oppnade += 1;
    if (u.klickad) totalt.klick += 1;
    if (u.studsad) totalt.studs += 1;

    const fyll = (karta: Map<string, MejlRad>, nyckel: string) => {
      let rad = karta.get(nyckel);
      if (!rad) {
        rad = nyRad(nyckel);
        karta.set(nyckel, rad);
      }
      rad.skickade += 1;
      if (u.levererad) rad.levererade += 1;
      if (u.oppnad) rad.oppnade += 1;
      if (u.klickad) rad.klick += 1;
      if (u.studsad) rad.studs += 1;
      if (!rad.senast || logg.sent_at > rad.senast) rad.senast = logg.sent_at;
    };

    fyll(perMall, logg.email_type);
    const steg = stegNyckel(logg.email_type);
    if (steg) fyll(perSteg, steg);
    const kop = kopNyckel(logg.email_type);
    if (kop) fyll(perKop, kop);

    const vecka = veckansMandag(logg.sent_at);
    let v = perVecka.get(vecka);
    if (!v) {
      v = { vecka, skickade: 0, levererade: 0, oppnade: 0, klick: 0, oppnandegrad: null };
      perVecka.set(vecka, v);
    }
    v.skickade += 1;
    if (u.levererad) v.levererade += 1;
    if (u.oppnad) v.oppnade += 1;
    if (u.klickad) v.klick += 1;

    if (u.studsad) {
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
      if (u.oppnad) {
        digest.oppnade += 1;
        if (logg.user_id) {
          const befintlig = digestOppnare.get(logg.user_id);
          if (!befintlig || logg.sent_at > befintlig) digestOppnare.set(logg.user_id, logg.sent_at);
        }
      }
    }
  }

  for (const v of perVecka.values()) {
    v.oppnandegrad = v.levererade > 0 ? v.oppnade / v.levererade : null;
  }

  const fallande = (a: MejlRad, b: MejlRad) => b.skickade - a.skickade;
  return {
    totalt,
    perMall: Array.from(perMall.values()).sort(fallande),
    perSteg: Array.from(perSteg.values()).sort(fallande),
    perKop: Array.from(perKop.values()).sort(fallande),
    perVecka: Array.from(perVecka.values()).sort((a, b) => a.vecka.localeCompare(b.vecka)),
    studsadeAdresser: Array.from(studsPerAdress.values())
      .sort((a, b) => b.antal - a.antal)
      .slice(0, 50),
    digest,
    digestOppnare,
  };
}

/** Grupperna som kan vara tomma i fönstret och då säger sedan när. */
export type Grupp = 'alla' | 'livscykel' | 'kop';

export function iGrupp(grupp: Grupp, emailType: string): boolean {
  if (grupp === 'alla') return true;
  if (grupp === 'livscykel') return stegNyckel(emailType) !== null;
  return kopNyckel(emailType) !== null;
}
