/**
 * Undantagna konton: agarens adminkonto och testkonton raknas aldrig.
 *
 * Agarens beslut 2026-09-22: "mitt adminkonto ska undantas ur all data,
 * allt fran inlogg till korningar av funktioner och nedladdningar."
 *
 * En sanning. Regeln bor i databasfunktionen admin_undantagna_konton()
 * (supabase/migrations/20260922220000_admin_undantagna_konton.sql), som alla
 * adminvyer laser. Den har filen laser samma funktion for allt som inte gar
 * genom en vy: insamlingen i collect.ts, kopliggaren, Drift, Mejl och
 * PostHog-fragorna. Monstren nedan ar en spegel av funktionens, och testet i
 * __tests__/undantag.test.ts haller dem lika med migrationsfilen.
 *
 *   admin  varje rad i admin_users
 *   test   e-post som slutar pa .test, innehaller jobbcoach-qa eller borjar
 *          med qa-
 *
 * gomer@gomer.se ar en riktig kund (agarens beslut 2026-09-22) och fangas
 * inte av nagot monster.
 *
 * Filen far inte importera next/cache: skripten (admin-backfill.ts) kor
 * collect.ts utanfor Next. Den cachade varianten for sidorna ligger i
 * metrics.ts.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

type Admin = SupabaseClient<any, any, any>;

/** SQL-monstren (ILIKE) i databasfunktionen, i samma ordning. */
export const UNDANTAG_EPOST_MONSTER = ['%.test', '%jobbcoach-qa%', 'qa-%'] as const;

/** Samma monster som ett reguljart uttryck, for klienten och testerna. */
const TEST_EPOST = /(\.test$|jobbcoach-qa|^qa-)/i;

/**
 * Samma monster for HogQL. PostHogs parser godtar inte \. i en strang, sa
 * punkten skrivs som teckenklass.
 */
const TEST_EPOST_HOGQL = '([.]test$|jobbcoach-qa|^qa-)';

/** Sant nar e-postadressen ar ett testkonto enligt monstren. */
export function arTestEpost(email: string | null | undefined): boolean {
  if (!email) return false;
  return TEST_EPOST.test(email.trim());
}

export type UndantagSkal = 'admin' | 'test';

export interface UndantagetKonto {
  userId: string;
  email: string | null;
  skal: UndantagSkal;
  stripeKund: string | null;
}

export interface Undantag {
  konton: UndantagetKonto[];
  /** Alla undantagna anvandar-id. */
  ids: string[];
  /** Stripe-kunderna som hor till undantagna konton. */
  stripeKunder: Set<string>;
  /** Snabbuppslag. */
  har: (userId: string | null | undefined) => boolean;
}

/** Ett tomt undantag, till testerna och som reserv nar databasen inte svarar. */
export function tomtUndantag(): Undantag {
  return byggUndantag([]);
}

export function byggUndantag(konton: UndantagetKonto[]): Undantag {
  const ids = konton.map((k) => k.userId);
  const set = new Set(ids);
  const stripeKunder = new Set(
    konton.map((k) => k.stripeKund).filter((s): s is string => Boolean(s))
  );
  return {
    konton,
    ids,
    stripeKunder,
    har: (userId) => Boolean(userId && set.has(userId)),
  };
}

/**
 * Laser undantagen ur databasfunktionen, plus Stripe-kund per konto.
 *
 * Kastar vid fel. En insamling som inte vet vilka som ska bort ska hellre
 * misslyckas an skriva tal med agarens egna klick i.
 */
export async function hamtaUndantag(admin: Admin): Promise<Undantag> {
  const { data, error } = await admin.rpc('admin_undantagna_konton');
  if (error) throw new Error(`admin_undantagna_konton: ${error.message}`);

  const rader = (data ?? []) as Array<{ user_id: string; email: string | null; skal: string }>;
  const ids = rader.map((r) => r.user_id);

  const kunder = new Map<string, string>();
  if (ids.length) {
    const { data: profiler } = await admin
      .from('profiles')
      .select('id, stripe_customer_id')
      .in('id', ids);
    for (const p of (profiler ?? []) as Array<{ id: string; stripe_customer_id: string | null }>) {
      if (p.stripe_customer_id) kunder.set(p.id, p.stripe_customer_id);
    }
  }

  return byggUndantag(
    rader.map((r) => ({
      userId: r.user_id,
      email: r.email,
      skal: r.skal === 'admin' ? 'admin' : 'test',
      stripeKund: kunder.get(r.user_id) ?? null,
    }))
  );
}

/**
 * PostgREST-listan for not.in, till exempel "(a,b,c)". Id:n ar uuid och
 * behover inga citattecken.
 */
export function pgLista(ids: readonly string[]): string {
  return `(${ids.join(',')})`;
}

/**
 * Lagger uteslutningen pa en PostgREST-fraga.
 *
 * nullbar: kolumnen kan vara null (ett utskick utan konto, en AI-korning
 * fran en publik yta). Da maste null uttryckligen slappas igenom, for
 * "not in" ger okant pa null och raden forsvinner annars tyst.
 */
export function uteslut<Q extends { not: any; or: any }>(
  fraga: Q,
  kolumn: string,
  u: Undantag,
  nullbar = false
): Q {
  if (!u.ids.length) return fraga;
  if (nullbar) return fraga.or(`${kolumn}.is.null,${kolumn}.not.in.${pgLista(u.ids)}`);
  return fraga.not(kolumn, 'in', pgLista(u.ids));
}

/**
 * HogQL-villkoret som tar bort undantagna personer ur en events-fraga.
 * Borjar med "and", sa det kan klistras efter ett befintligt where.
 *
 * Tre lager, eftersom PostHog har tre satt att kanna igen en person:
 *   1. distinct_id: konto-id:t som klienten identifierar med. Fangar all
 *      historik, aven den som skickades innan is_internal fanns.
 *   2. person.properties.is_internal: satts vid identify fran 2026-09-22.
 *   3. person.properties.email: testkonton som skapats och raderats utan
 *      att nagonsin hamna i listan.
 */
export function hogqlUteslutning(u: Undantag): string {
  const delar: string[] = [];
  if (u.ids.length) {
    const lista = u.ids.map((id) => `'${id.replace(/[^0-9a-f-]/gi, '')}'`).join(', ');
    delar.push(
      `person_id not in (select person_id from person_distinct_ids where distinct_id in (${lista}))`
    );
  }
  delar.push(`coalesce(toString(person.properties.is_internal), '') != 'true'`);
  delar.push(
    `match(lower(coalesce(toString(person.properties.email), '')), '${TEST_EPOST_HOGQL}') = 0`
  );
  return delar.map((d) => ` and ${d}`).join('');
}

/** Text till sidorna: "1 adminkonto och 2 testkonton undantagna". */
export function undantagText(u: Pick<Undantag, 'konton'>): string {
  const admin = u.konton.filter((k) => k.skal === 'admin').length;
  const test = u.konton.filter((k) => k.skal === 'test').length;
  const delar: string[] = [];
  if (admin) delar.push(`${admin} ${admin === 1 ? 'adminkonto' : 'adminkonton'}`);
  if (test) delar.push(`${test} ${test === 1 ? 'testkonto' : 'testkonton'}`);
  if (!delar.length) return 'Inga konton undantagna';
  // Böjs efter antal: "1 adminkonto undantaget", annars "undantagna".
  return `${delar.join(' och ')} ${admin + test === 1 ? 'undantaget' : 'undantagna'}`;
}
